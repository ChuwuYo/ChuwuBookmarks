/**
 * 自定义滚动条指示器模块
 * 为非手机端提供滚动位置指示
 */

class CustomScrollIndicator {
    constructor() {
        this.indicator = null;
        this.thumb = null;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.resizeTimeout = null;
        this.scrollFrame = null;
        this.isInitialized = false;
        this.isMobile = this.checkIsMobile();
        this.transformProperty = this.detectTransformProperty();

        // 绑定方法上下文
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.updateThumbPosition = this.updateThumbPosition.bind(this);
    }

    /**
     * 检查是否为移动设备
     */
    checkIsMobile() {
        return window.innerWidth < 480;
    }

    /**
     * 检查是否支持CSS Transform
     */
    detectTransformProperty() {
        const testElement = document.createElement('div');
        const transforms = ['transform', 'webkitTransform', 'MozTransform', 'msTransform'];

        for (let i = 0; i < transforms.length; i++) {
            if (testElement.style[transforms[i]] !== undefined) {
                return transforms[i];
            }
        }
        return '';
    }

    /**
     * 初始化滚动条指示器
     */
    init() {
        if (this.isInitialized || this.isMobile) return;
        
        this.createIndicator();
        this.attachEventListeners();
        this.updateThumbPosition();
        this.isInitialized = true;
    }

    /**
     * 创建滚动条指示器DOM元素
     */
    createIndicator() {
        // 创建指示器容器
        this.indicator = document.createElement('div');
        this.indicator.className = 'custom-scroll-indicator';
        this.indicator.setAttribute('aria-hidden', 'true');
        
        // 创建滚动缩略图
        this.thumb = document.createElement('div');
        this.thumb.className = 'custom-scroll-thumb';
        
        this.indicator.appendChild(this.thumb);
        document.body.appendChild(this.indicator);
    }

    /**
     * 绑定事件监听器
     */
    attachEventListeners() {
        // 滚动事件
        window.addEventListener('scroll', this.handleScroll, { passive: true });
        
        // 窗口大小变化事件
        window.addEventListener('resize', this.handleResize);
        
        // 鼠标悬停事件
        if (this.indicator) {
            this.indicator.addEventListener('mouseenter', () => {
                this.indicator.style.opacity = '1';
            });
            
            this.indicator.addEventListener('mouseleave', () => {
                if (!this.isScrolling) {
                    this.indicator.style.opacity = '0';
                }
            });
        }
    }

    /**
     * 处理滚动事件
     */
    handleScroll() {
        if (!this.indicator || this.isMobile) return;
        
        // 显示滚动状态
        if (!this.isScrolling) {
            this.isScrolling = true;
            document.body.classList.add('scrolling');
        }
        
        if (!this.scrollFrame) {
            this.scrollFrame = requestAnimationFrame(() => {
                this.scrollFrame = null;
                this.updateThumbPosition();
            });
        }
        
        // 清除之前的超时
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        // 设置隐藏超时
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            document.body.classList.remove('scrolling');
        }, 1000); // 1秒后隐藏
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
        }

        this.resizeTimeout = requestAnimationFrame(() => {
            const wasMobile = this.isMobile;
            this.isMobile = this.checkIsMobile();

            if (!wasMobile && this.isMobile) {
                this.destroy();
            } else if (wasMobile && !this.isMobile && !this.isInitialized) {
                this.init();
            } else if (!this.isMobile) {
                this.updateThumbPosition();
            }
        });
    }

    /**
     * 更新滚动缩略图位置和大小
     */
    updateThumbPosition() {
        if (!this.thumb || this.isMobile) return;
        
        try {
            const scrollTop = window.pageYOffset
                || document.documentElement.scrollTop
                || document.body.scrollTop
                || 0;
            
            const documentHeight = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            );
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            
            // 计算滚动百分比
            const scrollableHeight = documentHeight - windowHeight;
            const scrollPercentage = scrollableHeight > 0
                ? Math.min(scrollTop / scrollableHeight, 1)
                : 0;
            
            // 计算缩略图高度
            const thumbHeight = Math.max(20, (windowHeight / documentHeight) * windowHeight);
            const thumbMaxTop = windowHeight - thumbHeight;
            const thumbTop = scrollPercentage * thumbMaxTop;
            
            // 应用样式
            this.thumb.style.height = thumbHeight + 'px';
            
            if (this.transformProperty) {
                this.thumb.style[this.transformProperty] = 'translateY(' + thumbTop + 'px)';
            } else {
                this.thumb.style.top = thumbTop + 'px';
            }
            
            // 底部高亮
            this.thumb.style.background = scrollPercentage >= 0.99
                ? 'var(--scroll-indicator-thumb-hover)'
                : 'var(--scroll-indicator-thumb)';
        } catch (error) {
            console.warn('滚动条指示器更新失败:', error);
        }
    }

    /**
     * 销毁滚动条指示器
     */
    destroy() {
        if (!this.isInitialized) return;

        // 清理定时器和帧
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
            this.resizeTimeout = null;
        }

        if (this.scrollFrame) {
            cancelAnimationFrame(this.scrollFrame);
            this.scrollFrame = null;
        }

        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }

        // 移除事件监听器
        window.removeEventListener('scroll', this.handleScroll, { passive: true });
        window.removeEventListener('resize', this.handleResize);

        // 移除DOM元素
        if (this.indicator && this.indicator.parentNode) {
            this.indicator.parentNode.removeChild(this.indicator);
        }

        // 清除body类名
        document.body.classList.remove('scrolling');

        // 重置状态
        this.indicator = null;
        this.thumb = null;
        this.isScrolling = false;
        this.isInitialized = false;
    }

    /**
     * 强制显示指示器（用于调试）
     */
    show() {
        if (this.indicator) {
            this.indicator.style.opacity = '1';
        }
    }

    /**
     * 强制隐藏指示器
     */
    hide() {
        if (this.indicator) {
            this.indicator.style.opacity = '0';
        }
    }
}

// 创建全局实例
const customScrollIndicator = new CustomScrollIndicator();

/**
 * 初始化滚动指示器（需要手动调用）
 */
function initScrollIndicator() {
    if (window.innerWidth >= 480) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                customScrollIndicator.init();
            });
        } else {
            customScrollIndicator.init();
        }
    }
}

// 导出模块
export { CustomScrollIndicator, customScrollIndicator, initScrollIndicator };