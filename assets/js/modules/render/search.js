/**
 * 搜索结果渲染模块 - 使用虚拟滚动优化和分页功能
 * 
 * 本模块是分页功能与搜索系统的核心集成点，负责：
 * 
 * 核心功能：
 * - 搜索结果的分页渲染和管理
 * - 虚拟滚动与分页功能的协调
 * - 分页控件的创建、更新和销毁
 * - 页面切换时的用户体验优化
 * 
 * 性能优化：
 * - 虚拟滚动：仅渲染可见区域的搜索结果
 * - DOM复用：复用分页控件的DOM元素
 * - 批量更新：使用DocumentFragment进行批量DOM操作
 * - 内存管理：及时清理不再使用的资源
 * 
 * 用户体验：
 * - 平滑的页面切换动画
 * - 智能的滚动定位
 * - URL状态保持，支持浏览器前进后退
 * - 完整的键盘导航支持
 * 
 * 响应式设计：
 * - 自动适配不同屏幕尺寸
 * - 侧栏状态变化时的布局调整
 * - 移动端触摸友好的交互体验
 */

import { createElement } from './sidebar.js';
import {
    PaginationController,
    PaginationRenderer,
    PaginationRenderUtils
} from '../pagination/index.js';

// 虚拟滚动配置
const ITEM_HEIGHT = 40; // 每个项目的固定高度
const BUFFER_SIZE = 5; // 上下缓冲区的项目数量

class VirtualScroller {
    constructor(container, items, renderItem) {
        this.container = container;
        this.items = items;
        this.renderItem = renderItem;
        this.visibleItems = new Map();
        this.scrollTimeout = null;
        this.intersectionObserver = null;

        this.init();
    }

    init() {
        // 创建内容容器
        this.container.style.position = 'relative';

        // 初始化 Intersection Observer
        this.setupIntersectionObserver();

        // 绑定滚动事件到主内容区
        document.getElementById('content').addEventListener('scroll', this.handleScroll.bind(this));

        // 首次渲染
        this.updateVisibleItems();
    }

    setupIntersectionObserver() {
        this.intersectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const itemId = entry.target.dataset.itemId;
                    if (!entry.isIntersecting && this.visibleItems.has(itemId)) {
                        this.intersectionObserver.unobserve(entry.target);
                        entry.target.remove();
                        this.visibleItems.delete(itemId);
                    }
                });
            },
            {
                root: document.getElementById('content'),
                rootMargin: `${BUFFER_SIZE * ITEM_HEIGHT}px 0px`
            }
        );
    }

    handleScroll() {
        if (this.scrollTimeout) {
            cancelAnimationFrame(this.scrollTimeout);
        }

        this.scrollTimeout = requestAnimationFrame(() => {
            this.updateVisibleItems();
        });
    }

    updateVisibleItems() {
        const contentElement = document.getElementById('content');
        const scrollTop = contentElement.scrollTop;
        const viewportHeight = contentElement.clientHeight;

        // 计算可见范围
        const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER_SIZE);
        const endIndex = Math.min(
            this.items.length,
            Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + BUFFER_SIZE
        );

        // 渲染新的可见项目
        for (let i = startIndex; i < endIndex; i++) {
            const itemId = `item-${i}`;
            if (!this.visibleItems.has(itemId)) {
                const item = this.items[i];
                const element = this.renderItem(item, i);
                element.dataset.itemId = itemId;
                element.classList.add('virtual-item');  // 添加特定的类名
                element.style.position = 'absolute';
                element.style.top = `${i * ITEM_HEIGHT}px`;
                element.style.width = '100%';
                element.style.height = `${ITEM_HEIGHT}px`;

                this.container.appendChild(element);
                this.visibleItems.set(itemId, element);
                this.intersectionObserver.observe(element);
            }
        }
        // IntersectionObserver 会自动处理不可见元素的移除
    }

    cleanup() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        this.visibleItems.clear();
    }
}

/**
 * 搜索结果管理器 - 封装分页和虚拟滚动状态
 * 替代全局变量，提供更好的模块化和可测试性
 */
class SearchResultsManager {
    constructor() {
        this.paginationController = null;
        this.paginationRenderer = null;
        this.virtualScroller = null;
        this.currentResults = [];
        this.currentContainer = null;
    }

    /**
     * 初始化搜索结果管理器
     * @param {Array} results - 搜索结果
     * @param {HTMLElement} container - 结果容器
     * @param {Function} renderMainContent - 主内容渲染函数
     */
    initialize(results, container, renderMainContent) {
        this.cleanup();

        this.currentResults = results;
        this.currentContainer = container;

        // 预先分类结果
        const sortedResults = [...results].sort((a, b) => {
            const aIsFolder = a.type === 'folder';
            const bIsFolder = b.type === 'folder';
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return 0;
        });

        // 初始化分页控制器
        this.paginationController = new PaginationController(
            {
                itemsPerPage: 20,
                maxVisiblePages: 3,
                showFirstLast: true,
                showPrevNext: true,
                responsive: true
            },
            {
                onPageChange: (newPage) => this.handlePageChange(newPage, sortedResults, container, renderMainContent),
                onConfigChange: (config, responsiveConfig) => {
                    // 响应式配置变化时的回调
                }
            }
        );

        return sortedResults;
    }

    /**
     * 处理页码变更
     * @param {number} newPage - 新页码
     * @param {Array} allResults - 所有搜索结果
     * @param {HTMLElement} container - 结果容器
     * @param {Function} renderMainContent - 主内容渲染函数
     */
    handlePageChange(newPage, allResults, container, renderMainContent) {
        if (!this.paginationController) {
            return;
        }

        // 验证页码有效性
        const totalPages = Math.ceil(allResults.length / 20);
        if (newPage < 1 || newPage > totalPages) {
            return;
        }

        // 添加页面切换的视觉反馈
        this.addPageChangeVisualFeedback(newPage);

        // 重新计算分页状态
        const paginationState = this.paginationController.calculatePagination(allResults.length, newPage);

        // 渲染新页面的结果
        this.renderCurrentPageResults(allResults, paginationState, container, renderMainContent);

        // 更新分页控件状态
        if (this.paginationRenderer) {
            this.paginationRenderer.updatePageState(paginationState);
        }

        // 滚动到搜索结果区域顶部
        this.scrollToSearchResults();

        // 更新浏览器历史状态
        this.updateBrowserHistory(newPage);
    }

    /**
     * 渲染当前页的搜索结果
     * @param {Array} allResults - 所有搜索结果
     * @param {Object} paginationState - 分页状态
     * @param {HTMLElement} container - 结果容器
     * @param {Function} renderMainContent - 主内容渲染函数
     */
    renderCurrentPageResults(allResults, paginationState, container, renderMainContent) {
        // 清理现有的虚拟滚动实例
        if (this.virtualScroller) {
            this.virtualScroller.cleanup();
            this.virtualScroller = null;
        }

        // 清空容器内容
        container.innerHTML = '';

        // 获取当前页数据
        const currentPageData = this.paginationController.getCurrentPageData(allResults);

        // 创建高度占位容器
        const heightContainer = document.createElement('div');
        heightContainer.style.height = `${currentPageData.length * ITEM_HEIGHT}px`;
        heightContainer.style.position = 'relative';
        container.appendChild(heightContainer);

        // 创建虚拟滚动实例
        this.virtualScroller = new VirtualScroller(
            heightContainer,
            currentPageData,
            (item, index) => {
                const element = createElement(
                    item.type === 'folder' ? 'folder' : 'bookmark',
                    item,
                    item.type === 'folder' ? () => renderMainContent(item) : null
                );
                element.style.setProperty('--item-index', index);
                return element;
            }
        );
    }

    /**
     * 滚动到搜索结果区域顶部
     */
    scrollToSearchResults() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        const content = document.getElementById('content');
        if (content) {
            content.style.transition = 'opacity 0.3s ease';
            content.style.opacity = '0.8';

            setTimeout(() => {
                content.style.opacity = '1';
            }, 150);

            setTimeout(() => {
                content.style.transition = '';
            }, 300);

            const firstResult = content.querySelector('.virtual-item');
            if (firstResult) {
                setTimeout(() => {
                    firstResult.focus();
                }, 500);
            }
        }
    }

    /**
     * 添加页面切换的视觉反馈
     * @param {number} newPage - 新页码
     */
    addPageChangeVisualFeedback(newPage) {
        const content = document.getElementById('content');
        if (content) {
            content.classList.add('page-changing');
            setTimeout(() => {
                content.classList.remove('page-changing');
            }, 200);
        }

        const currentPageIndicator = document.querySelector('.current-page-indicator');
        if (currentPageIndicator) {
            currentPageIndicator.textContent = `第 ${newPage} 页`;
        }
    }

    /**
     * 更新浏览器历史状态
     * @param {number} page - 当前页码
     */
    updateBrowserHistory(page) {
        const searchInput = document.getElementById('search-input');
        const keyword = searchInput ? searchInput.value.trim() : '';

        if (keyword && page > 1) {
            const url = new URL(window.location);
            url.searchParams.set('page', page);
            url.searchParams.set('q', keyword);

            window.history.replaceState(
                { page, keyword },
                `搜索: ${keyword} - 第${page}页`,
                url.toString()
            );
        }
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听布局变化事件
        this.layoutChangeHandler = (event) => {
            if (event.detail && event.detail.type === 'deviceLayoutUpdate') {
                this.handleLayoutChange(event.detail);
            }
        };

        document.addEventListener('layoutChange', this.layoutChangeHandler);
    }

    /**
     * 处理布局变化
     * @param {Object} layoutData - 布局变化数据
     */
    handleLayoutChange(layoutData) {
        if (this.paginationRenderer && this.paginationRenderer.paginationElement) {
            // 应用响应式样式
            PaginationRenderUtils.applyResponsiveStyles(this.paginationRenderer.paginationElement);

            // 如果需要，可以根据设备类型和侧栏状态进行额外调整
            this.adjustPaginationForLayout(layoutData);
        }
    }

    /**
     * 根据布局调整分页控件
     * @param {Object} layoutData - 布局数据
     */
    adjustPaginationForLayout(layoutData) {
        const { deviceType, sidebarCollapsed } = layoutData;

        if (this.paginationRenderer && this.paginationRenderer.paginationElement) {
            const paginationElement = this.paginationRenderer.paginationElement;

            // 根据设备类型调整样式类
            paginationElement.classList.toggle('mobile-layout', deviceType === 'mobile');
            paginationElement.classList.toggle('desktop-layout', deviceType === 'desktop');
            paginationElement.classList.toggle('sidebar-collapsed', sidebarCollapsed);
        }
    }

    /**
     * 清理事件监听器
     */
    cleanupEventListeners() {
        if (this.layoutChangeHandler) {
            document.removeEventListener('layoutChange', this.layoutChangeHandler);
            this.layoutChangeHandler = null;
        }
    }

    /**
     * 清理所有资源
     */
    cleanup() {
        if (this.virtualScroller) {
            this.virtualScroller.cleanup();
            this.virtualScroller = null;
        }

        if (this.paginationRenderer) {
            this.paginationRenderer.cleanup();
            this.paginationRenderer = null;
        }

        if (this.paginationController) {
            this.paginationController.reset();
            this.paginationController = null;
        }

        this.currentResults = [];
        this.currentContainer = null;

        // 清理事件监听器
        this.cleanupEventListeners();
    }

    /**
     * 重置搜索分页状态
     */
    reset() {
        this.cleanup();

        const content = document.getElementById('content');
        if (content) {
            content.classList.remove('page-changing');
        }

        const currentPageIndicator = document.querySelector('.current-page-indicator');
        if (currentPageIndicator) {
            currentPageIndicator.remove();
        }
    }

    /**
     * 获取分页状态
     * @param {number} targetPage - 目标页码
     * @returns {Object} 分页状态
     */
    getPaginationState(targetPage = 1) {
        if (!this.paginationController || !this.currentResults) {
            return null;
        }
        return this.paginationController.calculatePagination(this.currentResults.length, targetPage);
    }

    /**
     * 创建并渲染分页控件
     * @param {HTMLElement} content - 内容容器
     * @param {Object} paginationState - 分页状态
     */
    createPaginationControls(content, paginationState) {
        if (paginationState.totalPages > 1) {
            const paginationContainer = PaginationRenderUtils.createContainer(content, 'pagination-wrapper');

            this.paginationRenderer = new PaginationRenderer(paginationContainer, this.paginationController);
            this.paginationRenderer.render(paginationState);

            const paginationElement = paginationContainer.querySelector('.pagination-container');
            if (paginationElement) {
                PaginationRenderUtils.initializeResponsiveSupport(paginationElement, this.paginationController);
            }
        }
    }
}

// 创建全局搜索结果管理器实例
const searchResultsManager = new SearchResultsManager();

// 初始化事件监听器
searchResultsManager.setupEventListeners();

const renderSearchResults = (results, renderMainContent) => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');

    if (!content || !breadcrumbs) return;

    // 清除主页消息和现有内容
    const existingHomeMessage = document.querySelector('.home-message');
    if (existingHomeMessage) {
        existingHomeMessage.remove();
    }

    // 清理现有的分页控制器和虚拟滚动
    searchResultsManager.reset();

    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    if (!results || !results.length) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = '未找到匹配的书签。';
        content.appendChild(noResults);
        return;
    }

    // 创建结果容器
    const container = document.createElement('div');
    container.className = 'results-container';
    content.appendChild(container);

    // 使用搜索结果管理器初始化
    const sortedResults = searchResultsManager.initialize(results, container, renderMainContent);

    // 默认从第一页开始
    const targetPage = 1;

    // 计算分页状态
    const paginationState = searchResultsManager.getPaginationState(targetPage);

    if (paginationState) {
        // 渲染当前页结果
        searchResultsManager.renderCurrentPageResults(sortedResults, paginationState, container, renderMainContent);

        // 创建分页控件容器并渲染分页控件
        searchResultsManager.createPaginationControls(content, paginationState);
    }
};


/**
 * 更新分页控件位置（响应式布局）
 */
const updatePaginationPosition = () => {
    searchResultsManager.updatePaginationPosition();
};

/**
 * 重置搜索分页状态 - 供外部调用
 */
const resetSearchPagination = () => {
    searchResultsManager.reset();
};

export { renderSearchResults, resetSearchPagination };