/**
 * 自定义滚动条指示器模块
 * 为非手机端提供滚动位置指示，符合项目设计风格
 */

class CustomScrollIndicator {
    constructor() {
        this.indicator = null;
        this.thumb = null;
        this.isScrolling = false;
        this.scrollTimeout = null;
        this.resizeTimeout = null;
        this.isInitialized = false;
        this.isMobile = this.checkIsMobile();

        // 兼容性检查
        this.supportsPassiveEvents = this.checkPassiveEventSupport();
        this.supportsTransform = this.checkTransformSupport();

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
     * 检查是否支持被动事件监听
     */
    checkPassiveEventSupport() {
        let passiveSupported = false;
        try {
            const options = {
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            window.addEventListener('test', null, options);
            window.removeEventListener('test', null, options);
        } catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    /**
     * 检查是否支持CSS Transform
     */
    checkTransformSupport() {
        const testElement = document.createElement('div');
        const transforms = ['transform', 'webkitTransform', 'MozTransform', 'msTransform'];
        
        for (let i = 0; i < transforms.length; i++) {
            if (testElement.style[transforms[i]] !== undefined) {
                return transforms[i];
            }
        }
        return false;
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
        // 滚动事件 - 使用兼容性更好的选项
        const scrollOptions = this.supportsPassiveEvents ? { passive: true } : false;
        window.addEventListener('scroll', this.handleScroll, scrollOptions);
        
        // 窗口大小变化事件
        window.addEventListener('resize', this.handleResize);
        
        // 鼠标事件（增强交互性）
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
        
        // 更新缩略图位置
        this.updateThumbPosition();
        
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
        // 使用requestAnimationFrame优化性能
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
        }

        this.resizeTimeout = requestAnimationFrame(() => {
            const wasMobile = this.isMobile;
            this.isMobile = this.checkIsMobile();

            // 如果从桌面端切换到移动端，销毁指示器
            if (!wasMobile && this.isMobile) {
                this.destroy();
            }
            // 如果从移动端切换到桌面端，重新初始化
            else if (wasMobile && !this.isMobile && !this.isInitialized) {
                this.init();
            }
            // 如果仍在桌面端，更新位置
            else if (!this.isMobile) {
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
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
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
            const scrollPercentage = scrollableHeight > 0 ? Math.min(scrollTop / scrollableHeight, 1) : 0;
            
            // 计算缩略图高度（相对于可视窗口的比例）
            const thumbHeight = Math.max(20, (windowHeight / documentHeight) * windowHeight);
            const thumbMaxTop = windowHeight - thumbHeight;
            const thumbTop = scrollPercentage * thumbMaxTop;
            
            // 应用样式 - 使用兼容性更好的方法
            this.thumb.style.height = thumbHeight + 'px';
            
            // 使用transform或降级到top属性
            if (this.supportsTransform) {
                this.thumb.style[this.supportsTransform] = 'translateY(' + thumbTop + 'px)';
            } else {
                this.thumb.style.top = thumbTop + 'px';
            }
            
            // 如果到达底部，添加特殊样式
            if (scrollPercentage >= 0.99) {
                this.thumb.style.background = 'var(--scroll-indicator-thumb-hover)';
            } else {
                this.thumb.style.background = 'var(--scroll-indicator-thumb)';
            }
        } catch (error) {
            console.warn('滚动条指示器更新失败:', error);
        }
    }

    /**
     * 销毁滚动条指示器
     */
    destroy() {
        if (!this.isInitialized) return;

        // 清理resize定时器
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
        }

        // 移除事件监听器
        window.removeEventListener('scroll', this.handleScroll);
        window.removeEventListener('resize', this.handleResize);

        // 清除超时
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }

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
        this.scrollTimeout = null;
        this.resizeTimeout = null;
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