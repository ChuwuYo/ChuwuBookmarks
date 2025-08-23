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
    PaginationRenderUtils,
    initializeResponsiveSystem
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

// 全局分页控制器和渲染器实例
let globalPaginationController = null;
let globalPaginationRenderer = null;
let currentVirtualScroller = null;

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
    cleanupPagination();

    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    if (!results || !results.length) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = '未找到匹配的书签。';
        content.appendChild(noResults);
        return;
    }

    // 预先分类结果
    const sortedResults = [...results].sort((a, b) => {
        const aIsFolder = a.type === 'folder';
        const bIsFolder = b.type === 'folder';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return 0;
    });

    // 创建结果容器
    const container = document.createElement('div');
    container.className = 'results-container';
    content.appendChild(container);

    // 确保响应式系统已初始化
    initializeResponsiveSystem();

    // 初始化分页控制器
    globalPaginationController = new PaginationController(
        { 
            itemsPerPage: 20, 
            maxVisiblePages: 5,
            showFirstLast: true,
            showPrevNext: true,
            responsive: true
        },
        { 
            onPageChange: (newPage) => handlePageChange(newPage, sortedResults, container, renderMainContent),
            onConfigChange: (config, responsiveConfig) => {
                // 响应式配置变化时的回调
            }
        }
    );

    // 检查是否有目标页码（从URL恢复状态时使用）
    const targetPage = window.targetPaginationPage || 1;
    window.targetPaginationPage = null; // 清除目标页码

    // 计算分页状态
    const paginationState = globalPaginationController.calculatePagination(sortedResults.length, targetPage);
    
    // 渲染当前页结果
    renderCurrentPageResults(sortedResults, paginationState, container, renderMainContent);

    // 创建分页控件容器并渲染分页控件
    if (paginationState.totalPages > 1) {
        const paginationContainer = PaginationRenderUtils.createContainer(content, 'pagination-wrapper');
        
        globalPaginationRenderer = new PaginationRenderer(paginationContainer, globalPaginationController);
        globalPaginationRenderer.render(paginationState);
        
        // 初始化响应式支持
        const paginationElement = paginationContainer.querySelector('.pagination-container');
        if (paginationElement) {
            PaginationRenderUtils.initializeResponsiveSupport(paginationElement, globalPaginationController);
        }
    }

    // 返回清理函数
    return () => cleanupPagination();
};

/**
 * 处理页码变更 - 增强版本，包含完整的交互逻辑
 * @param {number} newPage - 新页码
 * @param {Array} allResults - 所有搜索结果
 * @param {HTMLElement} container - 结果容器
 * @param {Function} renderMainContent - 主内容渲染函数
 */
const handlePageChange = (newPage, allResults, container, renderMainContent) => {
    if (!globalPaginationController) {
        return;
    }

    // 验证页码有效性
    const totalPages = Math.ceil(allResults.length / 20);
    if (newPage < 1 || newPage > totalPages) {
        return;
    }

    // 添加页面切换的视觉反馈
    addPageChangeVisualFeedback(newPage);

    // 重新计算分页状态
    const paginationState = globalPaginationController.calculatePagination(allResults.length, newPage);
    
    // 渲染新页面的结果
    renderCurrentPageResults(allResults, paginationState, container, renderMainContent);
    
    // 更新分页控件状态
    if (globalPaginationRenderer) {
        globalPaginationRenderer.updatePageState(paginationState);
    }
    
    // 滚动到搜索结果区域顶部，确保用户体验流畅
    scrollToSearchResults();

    // 更新浏览器历史状态
    updateBrowserHistory(newPage);
};

/**
 * 渲染当前页的搜索结果
 * @param {Array} allResults - 所有搜索结果
 * @param {Object} paginationState - 分页状态
 * @param {HTMLElement} container - 结果容器
 * @param {Function} renderMainContent - 主内容渲染函数
 */
const renderCurrentPageResults = (allResults, paginationState, container, renderMainContent) => {
    // 清理现有的虚拟滚动实例
    if (currentVirtualScroller) {
        currentVirtualScroller.cleanup();
        currentVirtualScroller = null;
    }

    // 清空容器内容
    container.innerHTML = '';

    // 获取当前页数据
    const currentPageData = globalPaginationController.getCurrentPageData(allResults);

    // 创建高度占位容器，只为当前页数据计算高度
    const heightContainer = document.createElement('div');
    heightContainer.style.height = `${currentPageData.length * ITEM_HEIGHT}px`;
    heightContainer.style.position = 'relative';
    container.appendChild(heightContainer);

    // 创建虚拟滚动实例，使用当前页数据
    currentVirtualScroller = new VirtualScroller(
        heightContainer,
        currentPageData,
        (item, index) => {
            const element = createElement(
                item.type === 'folder' ? 'folder' : 'bookmark',
                item,
                item.type === 'folder' ? () => renderMainContent(item) : null
            );
            // 使用相对于当前页的索引
            element.style.setProperty('--item-index', index);
            return element;
        }
    );
};

/**
 * 滚动到页面顶部 - 增强版本，支持流畅动画
 */
const scrollToSearchResults = () => {
    // 直接滚动到页面顶部
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    // 添加视觉反馈效果到搜索结果区域
    const content = document.getElementById('content');
    if (content) {
        content.style.transition = 'opacity 0.3s ease';
        content.style.opacity = '0.8';
        
        setTimeout(() => {
            content.style.opacity = '1';
        }, 150);
        
        // 清理过渡效果
        setTimeout(() => {
            content.style.transition = '';
        }, 300);
        
        // 确保焦点管理 - 将焦点移到内容区域，便于键盘导航
        const firstResult = content.querySelector('.virtual-item');
        if (firstResult) {
            // 短暂延迟确保滚动完成后再设置焦点
            setTimeout(() => {
                firstResult.focus();
            }, 500);
        }
    }
};

/**
 * 添加页面切换的视觉反馈
 * @param {number} newPage - 新页码
 */
const addPageChangeVisualFeedback = (newPage) => {
    // 添加页面切换的加载状态
    const content = document.getElementById('content');
    if (content) {
        content.classList.add('page-changing');
        
        // 短暂延迟后移除加载状态
        setTimeout(() => {
            content.classList.remove('page-changing');
        }, 200);
    }

    // 更新页面标题显示当前页码
    const currentPageIndicator = document.querySelector('.current-page-indicator');
    if (currentPageIndicator) {
        currentPageIndicator.textContent = `第 ${newPage} 页`;
    }
};

/**
 * 更新浏览器历史状态
 * @param {number} page - 当前页码
 */
const updateBrowserHistory = (page) => {
    // 获取当前搜索关键词
    const searchInput = document.getElementById('search-input');
    const keyword = searchInput ? searchInput.value.trim() : '';
    
    if (keyword && page > 1) {
        // 更新URL参数，但不触发页面刷新
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        url.searchParams.set('q', keyword);
        
        // 使用replaceState避免在浏览器历史中创建过多条目
        window.history.replaceState(
            { page, keyword }, 
            `搜索: ${keyword} - 第${page}页`, 
            url.toString()
        );
    }
};

/**
 * 更新分页控件位置（响应式布局）
 */
const updatePaginationPosition = () => {
    if (globalPaginationRenderer && globalPaginationRenderer.paginationElement) {
        // 新的响应式系统会自动处理位置更新
        // 这里保留兼容性调用
        PaginationRenderUtils.applyResponsiveStyles(globalPaginationRenderer.paginationElement);
    }
};

/**
 * 清理分页相关资源
 */
const cleanupPagination = () => {
    // 清理虚拟滚动实例
    if (currentVirtualScroller) {
        currentVirtualScroller.cleanup();
        currentVirtualScroller = null;
    }
    
    // 清理分页渲染器
    if (globalPaginationRenderer) {
        globalPaginationRenderer.cleanup();
        globalPaginationRenderer = null;
    }
    
    // 重置分页控制器
    if (globalPaginationController) {
        globalPaginationController.reset();
        globalPaginationController = null;
    }
};

/**
 * 重置搜索分页状态 - 供外部调用
 */
const resetSearchPagination = () => {
    cleanupPagination();
    
    // 清除页面切换的视觉状态
    const content = document.getElementById('content');
    if (content) {
        content.classList.remove('page-changing');
    }
    
    // 清除当前页指示器
    const currentPageIndicator = document.querySelector('.current-page-indicator');
    if (currentPageIndicator) {
        currentPageIndicator.remove();
    }
};

// 将重置函数暴露到全局，供搜索模块调用
window.resetSearchPagination = resetSearchPagination;

export { renderSearchResults, updatePaginationPosition, resetSearchPagination };