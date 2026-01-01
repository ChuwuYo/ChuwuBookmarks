/**
 * 侧边栏滚动提示器模块
 * 智能检测侧边栏是否需要滚动，并显示闪烁的倒三角提示
 * 提示器固定在屏幕侧边栏区域，不随内容滚动
 */

class SidebarScrollHint {
    constructor() {
        this.sidebar = null;
        this.hintElement = null;
        this.isInitialized = false;
        this.resizeObserver = null;
        this.scrollTimeout = null;

        // 绑定方法上下文
        this.checkScrollable = this.checkScrollable.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
    }

    /**
     * 初始化滚动提示器
     */
    init() {
        if (this.isInitialized) return;

        this.sidebar = document.querySelector('.sidebar');
        if (!this.sidebar) {
            console.warn('侧边栏元素未找到');
            return;
        }

        // 将提示器添加到body，而不是sidebar，这样就不随内容滚动
        this.createHintElement();
        this.attachEventListeners();
        this.isInitialized = true;

        // 延迟检查，确保DOM完全渲染
        setTimeout(() => {
            this.checkScrollable();
        }, 100);
    }

    /**
     * 创建提示器元素
     */
    createHintElement() {
        this.hintElement = document.createElement('div');
        this.hintElement.className = 'sidebar-scroll-hint';
        this.hintElement.setAttribute('aria-hidden', 'true');
        // 添加到body而不是sidebar，避免随内容滚动
        document.body.appendChild(this.hintElement);
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // 监听滚动事件
        this.sidebar.addEventListener('scroll', this.handleScroll, { passive: true });

        // 监听窗口大小变化，更新提示器位置
        window.addEventListener('resize', () => {
            if (this.hintElement.classList.contains('visible')) {
                this.showHint();
            }
        });

        // 使用 ResizeObserver 监听侧边栏内容变化
        this.resizeObserver = new ResizeObserver(() => {
            this.checkScrollable();
        });

        this.resizeObserver.observe(this.sidebar);

        // 监听侧边栏折叠/展开状态变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    this.checkScrollable();
                }
            });
        });

        observer.observe(this.sidebar, { attributes: true });
    }

    /**
     * 检查侧边栏是否可滚动
     */
    checkScrollable() {
        if (!this.sidebar || !this.hintElement) return;

        const isCollapsed = this.sidebar.classList.contains('collapsed');

        // 侧边栏折叠时不显示提示
        if (isCollapsed) {
            this.hideHint();
            return;
        }

        const scrollHeight = this.sidebar.scrollHeight;
        const clientHeight = this.sidebar.clientHeight;
        const scrollTop = this.sidebar.scrollTop;

        // 如果内容超出容器高度且未滚动到底部，显示提示
        const needsScroll = scrollHeight > clientHeight;
        const isAtBottom = scrollTop >= scrollHeight - clientHeight - 10; // 10px 容差

        if (needsScroll && !isAtBottom) {
            this.showHint();
        } else {
            this.hideHint();
        }
    }

    /**
     * 处理滚动事件
     */
    handleScroll() {
        // 防抖处理
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

        this.scrollTimeout = setTimeout(() => {
            this.checkScrollable();
        }, 50);
    }

    /**
     * 显示提示器
     */
    showHint() {
        if (this.hintElement) {
            // 使用fixed定位，不随滚动内容移动
            const sidebarWidth = this.sidebar.offsetWidth;
            const sidebarHeight = this.sidebar.offsetHeight;

            this.hintElement.style.position = 'fixed';
            this.hintElement.style.left = (sidebarWidth - 40) + 'px'; // 右边距 40px
            this.hintElement.style.bottom = '15px';
            this.hintElement.classList.add('visible');
        }
    }

    /**
     * 隐藏提示器
     */
    hideHint() {
        if (this.hintElement) {
            this.hintElement.classList.remove('visible');
        }
    }

    /**
     * 销毁提示器
     */
    destroy() {
        if (!this.isInitialized) return;

        // 清理定时器
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        // 移除事件监听器
        if (this.sidebar) {
            this.sidebar.removeEventListener('scroll', this.handleScroll, { passive: true });
        }

        // 清理 ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        // 移除DOM元素
        if (this.hintElement && this.hintElement.parentNode) {
            this.hintElement.parentNode.removeChild(this.hintElement);
        }

        // 重置状态
        this.sidebar = null;
        this.hintElement = null;
        this.isInitialized = false;
    }

    /**
     * 手动刷新检查（用于内容动态更新后）
     */
    refresh() {
        this.checkScrollable();
    }
}

// 创建全局实例
const sidebarScrollHint = new SidebarScrollHint();

/**
 * 初始化侧边栏滚动提示器
 */
function initSidebarScrollHint() {
    sidebarScrollHint.init();
}

// 导出模块
export { SidebarScrollHint, sidebarScrollHint, initSidebarScrollHint };
