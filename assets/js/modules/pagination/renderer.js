/**
 * 分页控件渲染模块 - 负责分页控件的DOM渲染和交互
 * 
 * 键盘导航支持：
 * - Tab/Shift+Tab: 在分页按钮间导航
 * - Enter/Space: 激活当前聚焦的按钮
 * - Arrow Left/Right: 在分页按钮间循环导航
 * - Home: 跳转到第一个可用按钮
 * - End: 跳转到最后一个可用按钮
 * - 禁用的按钮会被跳过，不会获得焦点
 * 
 * 无障碍特性：
 * - 正确的ARIA标签和语义化HTML
 * - 与项目其他元素一致的焦点样式
 * - 高对比度模式支持
 * - 屏幕阅读器友好的状态提示
 * 
 * 响应式特性：
 * - 根据屏幕尺寸自动调整按钮大小和间距
 * - 移动端触摸友好的交互体验
 * - 侧栏状态变化时自动调整居中偏移
 * - 支持滑动手势切换页面（移动端）
 */

import {
    getSidebarMonitor,
    getResponsiveManager,
    PaginationCenteringCalculator,
    TouchOptimizer
} from './responsive.js';
import {
    globalPerformanceMonitor,
    MemoryOptimizer,
    DOMOptimizer
} from './performance.js';

/**
 * 分页渲染器类
 */
export class PaginationRenderer {
    /**
     * 构造函数
     * @param {HTMLElement} container - 分页控件容器
     * @param {import('./controller.js').PaginationController} controller - 分页控制器
     */
    constructor(container, controller) {
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error('容器必须是有效的HTML元素');
        }

        if (!controller) {
            throw new Error('分页控制器不能为空');
        }

        this.container = container;
        this.controller = controller;
        this.paginationElement = null;
        this.eventListeners = new Map();

        // 防抖处理快速点击
        this.debounceTimeout = null;
        this.debounceDelay = 150;

        // 侧栏监听器（用于居中偏移计算）
        this.sidebarMonitor = getSidebarMonitor();
        this.currentSidebarState = null;

        // 性能优化：DOM元素复用池
        this.elementPool = {
            buttons: [],
            ellipsis: []
        };

        // 性能优化：批量DOM操作标志
        this.batchUpdateScheduled = false;
        this.pendingUpdates = [];

        // 懒加载标志
        this.isLazyLoaded = false;
        this.shouldLazyLoad = true;

        // 内存管理：WeakMap存储临时数据
        this.buttonStates = new WeakMap();
        this.elementMetadata = new WeakMap();

        // 初始化侧栏状态监听（用于居中偏移）
        this.initializeSidebarListener();
    }



    /**
     * 初始化侧栏状态监听器
     */
    initializeSidebarListener() {
        // 保存监听器函数引用以便清理
        this.sidebarStateListener = (state) => {
            this.handleSidebarStateChange(state);
        };
        
        // 监听侧栏状态变化（用于居中偏移计算）
        if (this.sidebarMonitor) {
            this.sidebarMonitor.addListener(this.sidebarStateListener);
            // 获取初始状态
            this.currentSidebarState = this.sidebarMonitor.getCurrentState();
        }
    }



    /**
     * 处理侧栏状态变化
     * @param {Object} state - 新的侧栏状态
     */
    handleSidebarStateChange(state) {
        this.currentSidebarState = state;

        if (this.paginationElement) {
            // 更新居中偏移
            this.updateCenteringOffset();
        }
    }

    /**
     * 渲染分页控件
     * @param {import('./controller.js').PaginationState} state - 分页状态
     */
    render(state) {
        const startTime = performance.now();

        try {
            // 如果总页数小于等于1，隐藏分页控件
            if (state.totalPages <= 1) {
                this.hide();
                return;
            }

            // 强制立即创建DOM元素，不使用懒加载
            if (!this.paginationElement) {
                this.createPaginationElement();
            }

            // 在更新内容之前先应用响应式样式，确保正确的初始显示
            this.applyResponsiveStyles();
            
            // 直接执行更新，不使用批量调度器
            this.updatePaginationContentOptimized(state);
            this.bindEventsOptimized();
            this.show();

            // 记录渲染时间
            const endTime = performance.now();
            globalPerformanceMonitor.recordRenderTime(startTime, endTime);

            // 记录内存使用情况
            const memoryUsage = MemoryOptimizer.checkMemoryUsage(this);
            globalPerformanceMonitor.recordMemoryUsage(memoryUsage);

        } catch (error) {
            console.error('分页控件渲染失败:', error);
            this.renderFallback();
        }
    }

    /**
     * 创建分页控件DOM结构
     */
    createPaginationElement() {
        this.paginationElement = document.createElement('nav');
        this.paginationElement.className = 'pagination-container';
        this.paginationElement.setAttribute('role', 'navigation');
        this.paginationElement.setAttribute('aria-label', '搜索结果分页导航');

        // 确保分页控件可以通过键盘导航访问
        this.paginationElement.setAttribute('tabindex', '-1');

        // 直接根据屏幕宽度应用响应式类，就像侧栏自动隐藏一样
        const screenWidth = window.innerWidth;
        if (screenWidth <= 479) {
            this.paginationElement.classList.add('mobile-pagination');
        } else if (screenWidth <= 1023) {
            this.paginationElement.classList.add('tablet-pagination');
        } else {
            this.paginationElement.classList.add('desktop-pagination');
        }

        this.container.appendChild(this.paginationElement);
    }

    /**
     * 懒加载创建分页控件DOM结构
     */
    lazyCreatePaginationElement() {
        // 使用 requestIdleCallback 在浏览器空闲时创建DOM
        if (window.requestIdleCallback) {
            window.requestIdleCallback(() => {
                this.createPaginationElement();
            }, { timeout: 100 });
        } else {
            // 降级处理：使用 setTimeout
            setTimeout(() => {
                this.createPaginationElement();
            }, 0);
        }
    }

    /**
     * 批量更新调度器 - 优化DOM操作性能
     * @param {Function} updateFn - 更新函数
     */
    scheduleUpdate(updateFn) {
        if (this.batchUpdateScheduled) {
            this.pendingUpdates.push(updateFn);
            return;
        }

        this.batchUpdateScheduled = true;

        // 使用 requestAnimationFrame 确保在下一帧执行更新
        requestAnimationFrame(() => {
            // 执行当前更新
            updateFn();

            // 执行所有待处理的更新
            while (this.pendingUpdates.length > 0) {
                const pendingUpdate = this.pendingUpdates.shift();
                pendingUpdate();
            }

            this.batchUpdateScheduled = false;
        });
    }

    /**
     * 优化版本的分页控件内容更新 - 使用DOM元素复用
     * @param {import('./controller.js').PaginationState} state - 分页状态
     */
    updatePaginationContentOptimized(state) {
        if (!this.paginationElement) return;

        const updateStartTime = performance.now();

        // 使用 DocumentFragment 进行批量DOM操作
        const fragment = document.createDocumentFragment();

        // 收集需要的元素类型和数量
        const requiredElements = this.calculateRequiredElements(state);
        globalPerformanceMonitor.incrementDOMOperations();

        // 渲染上一页按钮
        if (this.controller.config.showPrevNext) {
            fragment.appendChild(this.getOrCreatePreviousButton(state));
            globalPerformanceMonitor.incrementDOMOperations();
        }

        // 渲染首页按钮（如果需要）
        if (this.controller.config.showFirstLast && this.shouldShowFirstButton(state)) {
            fragment.appendChild(this.getOrCreatePageButton(1, state.currentPage === 1));
            globalPerformanceMonitor.incrementDOMOperations();

            // 如果首页和可见页码之间有间隔，添加省略号
            if (state.visiblePages[0] > 2) {
                fragment.appendChild(this.getOrCreateEllipsis());
                globalPerformanceMonitor.incrementDOMOperations();
            }
        }

        // 渲染可见页码
        state.visiblePages.forEach(pageNum => {
            // 避免重复渲染首页和末页
            if (this.controller.config.showFirstLast) {
                if (pageNum === 1 && this.shouldShowFirstButton(state)) return;
                if (pageNum === state.totalPages && this.shouldShowLastButton(state)) return;
            }

            fragment.appendChild(this.getOrCreatePageButton(pageNum, pageNum === state.currentPage));
            globalPerformanceMonitor.incrementDOMOperations();
        });

        // 渲染末页按钮（如果需要）
        if (this.controller.config.showFirstLast && this.shouldShowLastButton(state)) {
            // 如果末页和可见页码之间有间隔，添加省略号
            const lastVisiblePage = state.visiblePages[state.visiblePages.length - 1];
            if (lastVisiblePage < state.totalPages - 1) {
                fragment.appendChild(this.getOrCreateEllipsis());
                globalPerformanceMonitor.incrementDOMOperations();
            }

            fragment.appendChild(this.getOrCreatePageButton(state.totalPages, state.currentPage === state.totalPages));
            globalPerformanceMonitor.incrementDOMOperations();
        }

        // 渲染下一页按钮
        if (this.controller.config.showPrevNext) {
            fragment.appendChild(this.getOrCreateNextButton(state));
            globalPerformanceMonitor.incrementDOMOperations();
        }

        // 回收未使用的元素到池中
        this.recycleUnusedElements();

        // 使用优化的DOM更新方法
        DOMOptimizer.optimizedUpdate(this.paginationElement, (container) => {
            container.innerHTML = '';
            container.appendChild(fragment);
        });

        // 确保正确的键盘导航顺序
        this.ensureProperTabOrder();

        // 记录更新时间
        const updateEndTime = performance.now();
        globalPerformanceMonitor.recordUpdateTime(updateStartTime, updateEndTime);
    }

    /**
     * 计算需要的元素类型和数量
     * @param {import('./controller.js').PaginationState} state - 分页状态
     * @returns {Object} 需要的元素统计
     */
    calculateRequiredElements(state) {
        let buttonsNeeded = 0;
        let ellipsisNeeded = 0;

        // 上一页/下一页按钮
        if (this.controller.config.showPrevNext) {
            buttonsNeeded += 2;
        }

        // 首页/末页按钮
        if (this.controller.config.showFirstLast) {
            if (this.shouldShowFirstButton(state)) {
                buttonsNeeded += 1;
                if (state.visiblePages[0] > 2) ellipsisNeeded += 1;
            }
            if (this.shouldShowLastButton(state)) {
                buttonsNeeded += 1;
                const lastVisiblePage = state.visiblePages[state.visiblePages.length - 1];
                if (lastVisiblePage < state.totalPages - 1) ellipsisNeeded += 1;
            }
        }

        // 可见页码按钮
        buttonsNeeded += state.visiblePages.length;

        return { buttonsNeeded, ellipsisNeeded };
    }

    /**
     * 创建上一页按钮
     * @param {import('./controller.js').PaginationState} state - 分页状态
     * @returns {HTMLElement}
     */
    createPreviousButton(state) {
        const button = document.createElement('button');
        button.className = 'pagination-button pagination-prev';
        button.type = 'button';
        button.setAttribute('aria-label', '上一页');
        button.disabled = !state.hasPrevious;

        // 设置正确的tabindex以支持键盘导航
        if (button.disabled) {
            button.setAttribute('aria-disabled', 'true');
            button.setAttribute('tabindex', '-1');
        } else {
            button.setAttribute('tabindex', '0');
        }

        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '‹';
        button.appendChild(icon);

        return button;
    }

    /**
     * 创建下一页按钮
     * @param {import('./controller.js').PaginationState} state - 分页状态
     * @returns {HTMLElement}
     */
    createNextButton(state) {
        const button = document.createElement('button');
        button.className = 'pagination-button pagination-next';
        button.type = 'button';
        button.setAttribute('aria-label', '下一页');
        button.disabled = !state.hasNext;

        // 设置正确的tabindex以支持键盘导航
        if (button.disabled) {
            button.setAttribute('aria-disabled', 'true');
            button.setAttribute('tabindex', '-1');
        } else {
            button.setAttribute('tabindex', '0');
        }

        const icon = document.createElement('span');
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = '›';
        button.appendChild(icon);

        return button;
    }

    /**
     * 创建页码按钮
     * @param {number} pageNum - 页码
     * @param {boolean} isActive - 是否为当前页
     * @returns {HTMLElement}
     */
    createPageButton(pageNum, isActive) {
        const button = document.createElement('button');
        button.className = `pagination-button pagination-page${isActive ? ' active' : ''}`;
        button.type = 'button';
        button.textContent = pageNum.toString();
        button.dataset.page = pageNum.toString();

        // 设置正确的tabindex以支持键盘导航
        button.setAttribute('tabindex', '0');

        if (isActive) {
            button.setAttribute('aria-label', `第${pageNum}页，当前页`);
            button.setAttribute('aria-current', 'page');
        } else {
            button.setAttribute('aria-label', `第${pageNum}页`);
        }

        return button;
    }

    /**
     * 创建省略号元素
     * @returns {HTMLElement}
     */
    createEllipsis() {
        const ellipsis = document.createElement('span');
        ellipsis.className = 'pagination-ellipsis';
        ellipsis.setAttribute('aria-hidden', 'true');
        ellipsis.textContent = '…';
        return ellipsis;
    }

    /**
     * 从池中获取或创建上一页按钮 - 优化版本
     * @param {import('./controller.js').PaginationState} state - 分页状态
     * @returns {HTMLElement}
     */
    getOrCreatePreviousButton(state) {
        let button = this.getFromPool('prevButton');

        if (!button) {
            button = this.createPreviousButton(state);
            this.elementMetadata.set(button, { type: 'prevButton', reusable: true });
        } else {
            // 更新现有按钮的状态
            this.updatePreviousButtonState(button, state);
        }

        return button;
    }

    /**
     * 从池中获取或创建下一页按钮 - 优化版本
     * @param {import('./controller.js').PaginationState} state - 分页状态
     * @returns {HTMLElement}
     */
    getOrCreateNextButton(state) {
        let button = this.getFromPool('nextButton');

        if (!button) {
            button = this.createNextButton(state);
            this.elementMetadata.set(button, { type: 'nextButton', reusable: true });
        } else {
            // 更新现有按钮的状态
            this.updateNextButtonState(button, state);
        }

        return button;
    }

    /**
     * 从池中获取或创建页码按钮 - 优化版本
     * @param {number} pageNum - 页码
     * @param {boolean} isActive - 是否为当前页
     * @returns {HTMLElement}
     */
    getOrCreatePageButton(pageNum, isActive) {
        let button = this.getFromPool('pageButton');

        if (!button) {
            button = this.createPageButton(pageNum, isActive);
            this.elementMetadata.set(button, { type: 'pageButton', reusable: true });
        } else {
            // 更新现有按钮的状态
            this.updatePageButtonState(button, pageNum, isActive);
        }

        return button;
    }

    /**
     * 从池中获取或创建省略号元素 - 优化版本
     * @returns {HTMLElement}
     */
    getOrCreateEllipsis() {
        let ellipsis = this.getFromPool('ellipsis');

        if (!ellipsis) {
            ellipsis = this.createEllipsis();
            this.elementMetadata.set(ellipsis, { type: 'ellipsis', reusable: true });
        }

        return ellipsis;
    }

    /**
     * 从元素池中获取指定类型的元素
     * @param {string} type - 元素类型
     * @returns {HTMLElement|null}
     */
    getFromPool(type) {
        const pool = this.elementPool[type] || [];
        return pool.pop() || null;
    }

    /**
     * 将元素放回池中以供复用
     * @param {HTMLElement} element - 要回收的元素
     */
    returnToPool(element) {
        const metadata = this.elementMetadata.get(element);
        if (!metadata || !metadata.reusable) return;

        const { type } = metadata;
        if (!this.elementPool[type]) {
            this.elementPool[type] = [];
        }

        // 清理元素状态，准备复用
        this.cleanElementForReuse(element, type);

        // 限制池的大小，避免内存泄漏
        if (this.elementPool[type].length < 20) {
            this.elementPool[type].push(element);
        }
    }

    /**
     * 清理元素状态以供复用
     * @param {HTMLElement} element - 要清理的元素
     * @param {string} type - 元素类型
     */
    cleanElementForReuse(element, type) {
        // 移除特定状态类
        element.classList.remove('active', 'clicked', 'processing');

        // 重置属性
        element.removeAttribute('aria-current');
        element.removeAttribute('aria-disabled');

        // 根据类型进行特定清理
        switch (type) {
            case 'pageButton':
                element.dataset.page = '';
                element.textContent = '';
                break;
            case 'prevButton':
            case 'nextButton':
                element.disabled = false;
                break;
        }
    }

    /**
     * 更新上一页按钮状态
     * @param {HTMLElement} button - 按钮元素
     * @param {import('./controller.js').PaginationState} state - 分页状态
     */
    updatePreviousButtonState(button, state) {
        button.disabled = !state.hasPrevious;

        if (button.disabled) {
            button.setAttribute('aria-disabled', 'true');
            button.setAttribute('tabindex', '-1');
        } else {
            button.removeAttribute('aria-disabled');
            button.setAttribute('tabindex', '0');
        }
    }

    /**
     * 更新下一页按钮状态
     * @param {HTMLElement} button - 按钮元素
     * @param {import('./controller.js').PaginationState} state - 分页状态
     */
    updateNextButtonState(button, state) {
        button.disabled = !state.hasNext;

        if (button.disabled) {
            button.setAttribute('aria-disabled', 'true');
            button.setAttribute('tabindex', '-1');
        } else {
            button.removeAttribute('aria-disabled');
            button.setAttribute('tabindex', '0');
        }
    }

    /**
     * 更新页码按钮状态
     * @param {HTMLElement} button - 按钮元素
     * @param {number} pageNum - 页码
     * @param {boolean} isActive - 是否为当前页
     */
    updatePageButtonState(button, pageNum, isActive) {
        button.textContent = pageNum.toString();
        button.dataset.page = pageNum.toString();
        button.classList.toggle('active', isActive);

        if (isActive) {
            button.setAttribute('aria-label', `第${pageNum}页，当前页`);
            button.setAttribute('aria-current', 'page');
        } else {
            button.setAttribute('aria-label', `第${pageNum}页`);
            button.removeAttribute('aria-current');
        }
    }

    /**
     * 回收未使用的元素到池中
     */
    recycleUnusedElements() {
        if (!this.paginationElement) return;

        // 收集当前DOM中的所有可复用元素
        const currentElements = this.paginationElement.querySelectorAll('[data-reusable]');

        currentElements.forEach(element => {
            // 如果元素不在新的fragment中，回收它
            if (!element.parentNode || element.parentNode === this.paginationElement) {
                this.returnToPool(element);
            }
        });
    }

    /**
     * 判断是否应该显示首页按钮
     * @param {import('./controller.js').PaginationState} state - 分页状态
     * @returns {boolean}
     */
    shouldShowFirstButton(state) {
        return state.totalPages > this.controller.config.maxVisiblePages &&
            !state.visiblePages.includes(1);
    }

    /**
     * 判断是否应该显示末页按钮
     * @param {import('./controller.js').PaginationState} state - 分页状态
     * @returns {boolean}
     */
    shouldShowLastButton(state) {
        return state.totalPages > this.controller.config.maxVisiblePages &&
            !state.visiblePages.includes(state.totalPages);
    }

    /**
     * 优化版本的事件绑定 - 避免重复绑定
     */
    bindEventsOptimized() {
        if (!this.paginationElement) {
            console.error('无法绑定事件：分页元素不存在');
            return;
        }

        // 检查是否已经绑定了事件
        if (this.eventListeners.size > 0) {
            return;
        }

        // 使用事件委托处理点击事件
        const clickHandler = this.handleClick.bind(this);
        this.paginationElement.addEventListener('click', clickHandler, { passive: false });
        this.eventListeners.set('click', clickHandler);
        globalPerformanceMonitor.incrementEventBindings();

        // 键盘导航支持
        const keydownHandler = this.handleKeydown.bind(this);
        this.paginationElement.addEventListener('keydown', keydownHandler, { passive: false });
        this.eventListeners.set('keydown', keydownHandler);
        globalPerformanceMonitor.incrementEventBindings();
    }

    /**
     * 处理点击事件 - 增强版本，包含更好的防抖和反馈
     * @param {Event} event - 点击事件
     */
    handleClick(event) {
        event.preventDefault();

        const button = event.target.closest('.pagination-button');

        if (!button || button.disabled) {
            return;
        }

        // 添加点击反馈
        this.addClickFeedback(button);

        // 防抖处理 - 对于快速页码切换进行优化
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // 为不同类型的按钮使用不同的防抖延迟
        const isPageButton = button.classList.contains('pagination-page');
        const debounceDelay = isPageButton ? this.debounceDelay : 100; // 页码按钮使用更长的防抖

        this.debounceTimeout = setTimeout(() => {
            this.processButtonClick(button);
        }, debounceDelay);
    }

    /**
     * 处理键盘事件 - 增强版本，支持完整的键盘导航
     * @param {KeyboardEvent} event - 键盘事件
     */
    handleKeydown(event) {
        const button = event.target;

        // 处理分页容器级别的键盘事件
        if (event.target === this.paginationElement) {
            switch (event.key) {
                case 'Tab':
                    // 让Tab键正常工作，聚焦到第一个可用按钮
                    if (!event.shiftKey) {
                        event.preventDefault();
                        this.focusFirstButton();
                    }
                    break;
            }
            return;
        }

        // 处理分页按钮的键盘事件
        if (!button.classList.contains('pagination-button')) return;

        switch (event.key) {
            case 'Enter':
            case ' ':
                event.preventDefault();
                if (!button.disabled) {
                    this.processButtonClick(button);
                }
                break;

            case 'ArrowLeft':
                event.preventDefault();
                this.focusPreviousButton(button);
                break;

            case 'ArrowRight':
                event.preventDefault();
                this.focusNextButton(button);
                break;

            case 'Home':
                event.preventDefault();
                this.focusFirstButton();
                break;

            case 'End':
                event.preventDefault();
                this.focusLastButton();
                break;

            case 'Tab':
                // Tab键在分页按钮间正常导航，不需要特殊处理
                // 但确保禁用的按钮被跳过
                if (button.disabled) {
                    event.preventDefault();
                    if (event.shiftKey) {
                        this.focusPreviousButton(button);
                    } else {
                        this.focusNextButton(button);
                    }
                }
                break;
        }
    }

    /**
     * 处理按钮点击逻辑 - 增强版本，包含更好的状态管理
     * @param {HTMLElement} button - 被点击的按钮
     */
    processButtonClick(button) {
        // 添加处理中状态，防止重复点击
        if (button.classList.contains('processing')) {
            return;
        }

        button.classList.add('processing');

        try {
            if (button.classList.contains('pagination-prev')) {
                this.controller.goToPreviousPage();
            } else if (button.classList.contains('pagination-next')) {
                this.controller.goToNextPage();
            } else if (button.classList.contains('pagination-page')) {
                const pageNum = parseInt(button.dataset.page, 10);
                if (!isNaN(pageNum)) {
                    this.controller.handlePageChange(pageNum);
                } else {
                    console.error('无效的页码:', button.dataset.page);
                }
            }
        } catch (error) {
            console.error('处理按钮点击失败:', error);
        } finally {
            // 短暂延迟后移除处理状态
            setTimeout(() => {
                button.classList.remove('processing');
            }, 200);
        }
    }

    /**
     * 添加点击反馈效果
     * @param {HTMLElement} button - 被点击的按钮
     */
    addClickFeedback(button) {
        // 添加点击动画类
        button.classList.add('clicked');

        // 短暂延迟后移除动画类
        setTimeout(() => {
            button.classList.remove('clicked');
        }, 150);

        // 触觉反馈（如果支持）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    /**
     * 焦点移动到上一个按钮 - 增强版本，支持循环导航
     * @param {HTMLElement} currentButton - 当前按钮
     */
    focusPreviousButton(currentButton) {
        const buttons = Array.from(this.paginationElement.querySelectorAll('.pagination-button:not([disabled])'));
        const currentIndex = buttons.indexOf(currentButton);

        if (currentIndex > 0) {
            buttons[currentIndex - 1].focus();
        } else {
            // 如果已经是第一个按钮，循环到最后一个按钮
            const lastButton = buttons[buttons.length - 1];
            if (lastButton) {
                lastButton.focus();
            }
        }
    }

    /**
     * 焦点移动到下一个按钮 - 增强版本，支持循环导航
     * @param {HTMLElement} currentButton - 当前按钮
     */
    focusNextButton(currentButton) {
        const buttons = Array.from(this.paginationElement.querySelectorAll('.pagination-button:not([disabled])'));
        const currentIndex = buttons.indexOf(currentButton);

        if (currentIndex < buttons.length - 1) {
            buttons[currentIndex + 1].focus();
        } else {
            // 如果已经是最后一个按钮，循环到第一个按钮
            const firstButton = buttons[0];
            if (firstButton) {
                firstButton.focus();
            }
        }
    }

    /**
     * 焦点移动到第一个可用按钮
     */
    focusFirstButton() {
        const firstButton = this.paginationElement.querySelector('.pagination-button:not([disabled])');
        if (firstButton) {
            firstButton.focus();
        }
    }

    /**
     * 焦点移动到最后一个可用按钮
     */
    focusLastButton() {
        const buttons = this.paginationElement.querySelectorAll('.pagination-button:not([disabled])');
        const lastButton = buttons[buttons.length - 1];
        if (lastButton) {
            lastButton.focus();
        }
    }

    /**
     * 确保正确的Tab键导航顺序
     */
    ensureProperTabOrder() {
        if (!this.paginationElement) return;

        const buttons = this.paginationElement.querySelectorAll('.pagination-button');
        buttons.forEach((button, index) => {
            if (button.disabled) {
                button.setAttribute('tabindex', '-1');
            } else {
                button.setAttribute('tabindex', '0');
            }
        });
    }

    /**
     * 更新页面状态
     * @param {import('./controller.js').PaginationState} state - 新的分页状态
     */
    updatePageState(state) {
        this.render(state);
    }

    /**
     * 显示分页控件
     */
    show() {
        if (this.paginationElement) {
            this.paginationElement.style.display = '';
            this.paginationElement.style.opacity = '1';
            this.paginationElement.style.visibility = 'visible';
            this.paginationElement.classList.remove('hidden');
        }
    }

    /**
     * 隐藏分页控件
     */
    hide() {
        if (this.paginationElement) {
            this.paginationElement.style.display = 'none';
            this.paginationElement.classList.add('hidden');
            this.paginationElement.classList.remove('fade-in');
        }
    }

    /**
     * 应用响应式样式
     */
    applyResponsiveStyles() {
        if (!this.paginationElement) {
            console.error('无法应用响应式样式：分页元素不存在');
            return;
        }

        // 直接根据屏幕宽度检测，就像侧栏自动隐藏一样
        const screenWidth = window.innerWidth;
        let type = 'desktop';
        
        if (screenWidth <= 479) {
            type = 'mobile';
        } else if (screenWidth <= 1023) {
            type = 'tablet';
        }

        // 移除所有响应式类
        this.paginationElement.classList.remove('mobile-pagination', 'tablet-pagination', 'desktop-pagination');

        // 添加当前类型的响应式类
        this.paginationElement.classList.add(`${type}-pagination`);

        // 移动端检测是否需要滚动
        if (type === 'mobile') {
            this.checkMobileScrollable();
        }

        // 更新居中偏移
        this.updateCenteringOffset();
    }

    /**
     * 检测移动端是否需要滚动
     */
    checkMobileScrollable() {
        if (!this.paginationElement) return;

        try {
            // 检查内容是否超出容器宽度
            const containerWidth = this.paginationElement.offsetWidth;
            const scrollWidth = this.paginationElement.scrollWidth;

            if (scrollWidth > containerWidth) {
                this.paginationElement.classList.add('scrollable');
            } else {
                this.paginationElement.classList.remove('scrollable');
            }
        } catch (error) {
            console.error('移动端滚动检测失败:', error);
        }
    }

    /**
     * 更新居中偏移
     */
    updateCenteringOffset() {
        if (!this.paginationElement) return;

        try {
            // 使用CSS类替代内联样式，实现关注点分离
            const container = this.paginationElement.closest('.pagination-wrapper');
            if (container) {
                // 确保容器有居中样式类
                container.classList.add('pagination-wrapper-centered');
            }
        } catch (error) {
            console.error('居中设置失败:', error);
        }
    }

    /**
     * 渲染降级版本（出错时使用）
     */
    renderFallback() {
        if (!this.container) return;

        const fallbackElement = document.createElement('div');
        fallbackElement.className = 'pagination-fallback';
        fallbackElement.textContent = '分页控件加载失败';
        fallbackElement.style.textAlign = 'center';
        fallbackElement.style.padding = '1rem';
        fallbackElement.style.color = 'var(--text-color)';

        this.container.innerHTML = '';
        this.container.appendChild(fallbackElement);
    }

    /**
     * 清理资源
     */
    cleanup() {
        // 清理事件监听器
        this.eventListeners.forEach((handler, eventType) => {
            if (this.paginationElement) {
                this.paginationElement.removeEventListener(eventType, handler);
            }
        });
        this.eventListeners.clear();

        // 清理防抖定时器
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = null;
        }

        // 清理元素池
        Object.keys(this.elementPool).forEach(type => {
            this.elementPool[type].forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            this.elementPool[type] = [];
        });

        // 清理WeakMap
        this.buttonStates = new WeakMap();
        this.elementMetadata = new WeakMap();

        // 清理待处理的更新
        this.pendingUpdates = [];
        this.batchUpdateScheduled = false;
    }

    /**
     * 销毁分页渲染器
     */
    destroy() {
        this.cleanup();

        // 移除侧栏监听器
        if (this.sidebarMonitor && this.sidebarStateListener) {
            this.sidebarMonitor.removeListener(this.sidebarStateListener);
        }

        // 移除DOM元素
        if (this.paginationElement && this.paginationElement.parentNode) {
            this.paginationElement.parentNode.removeChild(this.paginationElement);
        }

        // 清理所有引用
        this.container = null;
        this.controller = null;
        this.paginationElement = null;
        this.responsiveManager = null;
        this.sidebarMonitor = null;
        this.sidebarStateListener = null;
        this.currentResponsiveConfig = null;
        this.currentSidebarState = null;
    }

    /**
     * 获取性能统计信息
     * @returns {Object} 性能统计
     */
    getPerformanceStats() {
        const memoryUsage = MemoryOptimizer.checkMemoryUsage(this);
        const memoryIssues = MemoryOptimizer.detectMemoryLeaks(this);

        return {
            memoryUsage,
            memoryIssues,
            elementPoolSizes: Object.keys(this.elementPool).reduce((acc, type) => {
                acc[type] = this.elementPool[type].length;
                return acc;
            }, {}),
            eventListenersCount: this.eventListeners.size,
            pendingUpdatesCount: this.pendingUpdates.length
        };
    }

    /**
     * 生成性能报告
     * @returns {string} 性能报告
     */
    generatePerformanceReport() {
        const stats = this.getPerformanceStats();
        return `
分页渲染器性能报告:
==================
${globalPerformanceMonitor.generateReport()}

内存使用情况:
- 元素池大小: ${stats.memoryUsage.elementPoolSize}
- 事件监听器数量: ${stats.memoryUsage.eventListenersCount}
- 待处理更新: ${stats.memoryUsage.pendingUpdates}

${stats.memoryIssues.length > 0 ? '内存问题:\n' + stats.memoryIssues.map(issue => `- ${issue}`).join('\n') : '内存使用正常'}
        `.trim();
    }
}

/**
 * 分页渲染工具函数
 */
export const PaginationRenderUtils = {
    /**
     * 创建分页控件容器
     * @param {HTMLElement} parent - 父容器
     * @param {string} className - 容器类名
     * @returns {HTMLElement} 创建的容器
     */
    createContainer(parent, className = 'pagination-wrapper') {
        const container = document.createElement('div');
        // 使用CSS类替代内联样式，实现关注点分离
        container.className = `${className} pagination-wrapper-centered`;

        parent.appendChild(container);
        return container;
    },

    /**
     * 初始化响应式支持
     * @param {HTMLElement} paginationElement - 分页控件元素
     * @param {import('./controller.js').PaginationController} controller - 分页控制器
     */
    initializeResponsiveSupport(paginationElement, controller) {
        if (!paginationElement || !controller) return;

        // 获取响应式管理器
        const responsiveManager = getResponsiveManager();
        if (responsiveManager) {
            const currentConfig = responsiveManager.getCurrentConfig();
            TouchOptimizer.optimizeForTouch(paginationElement, currentConfig);
        }
    },

    /**
     * 应用响应式样式
     * @param {HTMLElement} paginationElement - 分页控件元素
     */
    applyResponsiveStyles(paginationElement) {
        if (!paginationElement) return;

        const responsiveManager = getResponsiveManager();
        if (responsiveManager) {
            const config = responsiveManager.getCurrentConfig();
            const { type } = config;

            // 移除所有响应式类
            paginationElement.classList.remove('mobile-pagination', 'tablet-pagination', 'desktop-pagination');

            // 添加当前类型的响应式类
            paginationElement.classList.add(`${type}-pagination`);
        }
    }
};
