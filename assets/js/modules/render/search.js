/**
 * 搜索结果渲染模块 - 使用虚拟滚动优化
 */

import { createElement } from './sidebar.js';

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

const renderSearchResults = (results, renderMainContent) => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');

    if (!content || !breadcrumbs) return;

    // 清除主页消息和现有内容
    const existingHomeMessage = document.querySelector('.home-message');
    if (existingHomeMessage) {
        existingHomeMessage.remove();
    }

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

    // 预先分类结果
    const sortedResults = [...results].sort((a, b) => {
        const aIsFolder = a.type === 'folder';
        const bIsFolder = b.type === 'folder';
        if (aIsFolder && !bIsFolder) return -1;
        if (!aIsFolder && bIsFolder) return 1;
        return 0;
    });

    // 创建高度占位
    const heightContainer = document.createElement('div');
    heightContainer.style.height = `${sortedResults.length * ITEM_HEIGHT}px`;
    heightContainer.style.position = 'relative';
    container.appendChild(heightContainer);

    // 创建虚拟滚动实例
    const virtualScroller = new VirtualScroller(
        heightContainer,
        sortedResults,
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

    // 清理函数
    return () => virtualScroller.cleanup();
};

export { renderSearchResults };