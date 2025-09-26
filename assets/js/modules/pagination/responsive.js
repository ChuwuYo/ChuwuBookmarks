/**
 * 分页响应式配置系统 - 根据屏幕尺寸调整分页参数
 */

import { BREAKPOINT_MOBILE, BREAKPOINT_SIDEBAR, getDeviceType, shouldCollapseSidebar } from '../render/device.js';
import { getCenteringManager } from '../utils/centering.js';

/**
 * 响应式断点配置
 */
export const RESPONSIVE_BREAKPOINTS = {
    mobile: {
        maxWidth: 479,
        itemsPerPage: 20,
        maxVisiblePages: 3,
        showLabels: false,
        buttonSize: 32,
        spacing: 4,
        fontSize: 12
    },
    tablet: {
        maxWidth: 1023,
        minWidth: 480,
        itemsPerPage: 20,
        maxVisiblePages: 3, /* 改为3个按钮 */
        showLabels: true,
        buttonSize: 40,
        spacing: 8,
        fontSize: 14
    },
    desktop: {
        minWidth: 1024,
        itemsPerPage: 20,
        maxVisiblePages: 3, /* 改为3个按钮 */
        showLabels: true,
        buttonSize: 40,
        spacing: 8,
        fontSize: 14
    }
};

/**
 * 响应式配置管理器
 */
export class ResponsiveConfigManager {
    constructor() {
        this.currentConfig = null;
        this.listeners = new Set();
        this.resizeTimeout = null;
        this.orientationTimeout = null;
        this.lastScreenWidth = window.innerWidth;
        
        // 初始化配置
        this.updateConfig();
        
        // 绑定窗口大小变化事件
        this.bindResizeEvent();
    }

    /**
     * 获取当前响应式配置
     * @returns {Object}
     */
    getCurrentConfig() {
        return { ...this.currentConfig };
    }

    /**
     * 根据屏幕尺寸获取配置
     * @param {number} [screenWidth] - 屏幕宽度，默认使用当前窗口宽度
     * @returns {Object}
     */
    getConfigForScreenSize(screenWidth = window.innerWidth) {
        if (screenWidth <= RESPONSIVE_BREAKPOINTS.mobile.maxWidth) {
            return { ...RESPONSIVE_BREAKPOINTS.mobile, type: 'mobile' };
        } else if (screenWidth <= RESPONSIVE_BREAKPOINTS.tablet.maxWidth) {
            return { ...RESPONSIVE_BREAKPOINTS.tablet, type: 'tablet' };
        } else {
            return { ...RESPONSIVE_BREAKPOINTS.desktop, type: 'desktop' };
        }
    }

    /**
     * 更新当前配置
     * @param {Object} [newConfig] - 新的配置对象，如果不提供则自动计算
     */
    updateConfig(newConfig = null) {
        const configToUse = newConfig || this.getConfigForScreenSize();
        const hasChanged = !this.currentConfig ||
                          this.currentConfig.type !== configToUse.type ||
                          this.currentConfig.maxVisiblePages !== configToUse.maxVisiblePages;

        this.currentConfig = configToUse;

        if (hasChanged) {
            this.notifyListeners(configToUse);
        }
    }

    /**
     * 添加配置变更监听器
     * @param {Function} listener - 监听器函数
     */
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.add(listener);
        }
    }

    /**
     * 移除配置变更监听器
     * @param {Function} listener - 监听器函数
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }

    /**
     * 通知所有监听器
     * @param {Object} config - 新配置
     */
    notifyListeners(config) {
        this.listeners.forEach(listener => {
            try {
                listener(config);
            } catch (error) {
                console.error('响应式配置监听器执行失败:', error);
            }
        });
    }

    /**
     * 绑定窗口大小变化事件
     */
    bindResizeEvent() {
        this.handleResize = () => {
            // 使用requestAnimationFrame优化性能
            if (this.resizeTimeout) {
                cancelAnimationFrame(this.resizeTimeout);
            }

            this.resizeTimeout = requestAnimationFrame(() => {
                const currentWidth = window.innerWidth;
                const currentConfig = this.getConfigForScreenSize(currentWidth);

                // 只有在跨越断点时才更新配置，避免重复计算
                if (this.shouldUpdateConfig(currentWidth, currentConfig)) {
                    this.lastScreenWidth = currentWidth;
                    this.updateConfig(currentConfig);
                }
            });
        };

        this.handleOrientationChange = () => {
            // 设备方向变化时使用requestAnimationFrame优化性能，并防止多次排队
            if (this.orientationTimeout) {
                cancelAnimationFrame(this.orientationTimeout);
            }
            this.orientationTimeout = requestAnimationFrame(() => {
                this.updateConfig();
            });
        };

        window.addEventListener('resize', this.handleResize, { passive: true });

        // 监听设备方向变化
        if (window.screen && window.screen.orientation) {
            window.screen.orientation.addEventListener('change', this.handleOrientationChange);
        }
    }

    /**
     * 判断是否需要更新配置
     * @param {number} currentWidth - 当前屏幕宽度
     * @param {Object} [currentConfig] - 当前配置对象，如果不提供则自动计算
     * @returns {boolean}
     */
    shouldUpdateConfig(currentWidth, currentConfig = null) {
        const lastConfig = this.getConfigForScreenSize(this.lastScreenWidth);
        const configToCompare = currentConfig || this.getConfigForScreenSize(currentWidth);

        return lastConfig.type !== configToCompare.type;
    }

    /**
     * 销毁响应式配置管理器
     */
    destroy() {
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
        }

        if (this.orientationTimeout) {
            cancelAnimationFrame(this.orientationTimeout);
        }

        // 移除事件监听器
        if (this.handleResize) {
            window.removeEventListener('resize', this.handleResize);
        }

        if (this.handleOrientationChange && window.screen && window.screen.orientation) {
            window.screen.orientation.removeEventListener('change', this.handleOrientationChange);
        }

        this.listeners.clear();
        this.handleResize = null;
        this.handleOrientationChange = null;
        this.orientationTimeout = null;
    }
}

/**
 * 侧栏状态监听器 - 用于动态调整分页控件居中偏移
 */
export class SidebarStateMonitor {
    constructor() {
        this.listeners = new Set();
        this.resizeTimeout = null;
        this.currentState = {
            isCollapsed: shouldCollapseSidebar(),
            screenWidth: window.innerWidth
        };

        // 初始化监听
        this.initializeMonitoring();
    }

    /**
     * 初始化监听
     */
    initializeMonitoring() {
        // 保存监听器函数引用
        this.boundHandleResize = this.handleResize.bind(this);
        
        // 监听窗口大小变化
        window.addEventListener('resize', this.boundHandleResize, { passive: true });
        
        // 监听侧栏切换事件
        this.observeSidebarChanges();
    }

    /**
     * 处理窗口大小变化
     */
    handleResize() {
        // 使用requestAnimationFrame防抖优化
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
        }

        this.resizeTimeout = requestAnimationFrame(() => {
            const newScreenWidth = window.innerWidth;
            const newIsCollapsed = shouldCollapseSidebar();

            if (newScreenWidth !== this.currentState.screenWidth ||
                newIsCollapsed !== this.currentState.isCollapsed) {

                this.currentState = {
                    isCollapsed: newIsCollapsed,
                    screenWidth: newScreenWidth
                };

                this.notifyListeners(this.currentState);
            }
        });
    }

    /**
     * 观察侧栏状态变化
     */
    observeSidebarChanges() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;

        // 使用 MutationObserver 监听侧栏类名变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isCollapsed = sidebar.classList.contains('collapsed');
                    
                    if (isCollapsed !== this.currentState.isCollapsed) {
                        this.currentState.isCollapsed = isCollapsed;
                        this.notifyListeners(this.currentState);
                    }
                }
            });
        });

        observer.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class']
        });

        // 保存观察器引用以便清理
        this.sidebarObserver = observer;
    }

    /**
     * 添加状态变更监听器
     * @param {Function} listener - 监听器函数
     */
    addListener(listener) {
        if (typeof listener === 'function') {
            this.listeners.add(listener);
        }
    }

    /**
     * 移除状态变更监听器
     * @param {Function} listener - 监听器函数
     */
    removeListener(listener) {
        this.listeners.delete(listener);
    }

    /**
     * 通知所有监听器
     * @param {Object} state - 新状态
     */
    notifyListeners(state) {
        this.listeners.forEach(listener => {
            try {
                listener(state);
            } catch (error) {
                console.error('侧栏状态监听器执行失败:', error);
            }
        });
    }

    /**
     * 获取当前状态
     * @returns {Object}
     */
    getCurrentState() {
        return { ...this.currentState };
    }

    /**
     * 销毁监听器
     */
    destroy() {
        this.listeners.clear();

        // 清理防抖定时器
        if (this.resizeTimeout) {
            cancelAnimationFrame(this.resizeTimeout);
        }

        // 移除窗口事件监听器
        if (this.boundHandleResize) {
            window.removeEventListener('resize', this.boundHandleResize);
            this.boundHandleResize = null;
        }

        if (this.sidebarObserver) {
            this.sidebarObserver.disconnect();
        }
    }
}



/**
 * 触摸友好性优化器
 */
export class TouchOptimizer {
    /**
     * 优化分页控件的触摸友好性
     * @param {HTMLElement} paginationElement - 分页控件元素
     * @param {Object} responsiveConfig - 响应式配置
     */
    static optimizeForTouch(paginationElement, responsiveConfig) {
        if (!paginationElement) return;

        const buttons = paginationElement.querySelectorAll('.pagination-button');
        const { type, buttonSize, spacing } = responsiveConfig;

        buttons.forEach(button => {
            // 设置触摸友好的最小尺寸
            if (type === 'mobile') {
                button.style.minWidth = `${buttonSize}px`;
                button.style.height = `${buttonSize}px`;
                
                // 确保触摸目标足够大
                if (buttonSize < 44) {
                    button.style.padding = `${(44 - buttonSize) / 2}px`;
                }
            }

            // 优化触摸反馈
            button.style.touchAction = 'manipulation';
            button.style.webkitTapHighlightColor = 'transparent';
        });

        // 调整间距
        if (type === 'mobile') {
            paginationElement.style.gap = `${spacing}px`;
        }
    }

    /**
     * 添加触摸手势支持
     * @param {HTMLElement} paginationElement - 分页控件元素
     * @param {Function} onSwipe - 滑动回调
     */
    static addSwipeSupport(paginationElement, onSwipe) {
        if (!paginationElement || typeof onSwipe !== 'function') return;

        let startX = 0;
        let startY = 0;
        let startTime = 0;

        const handleTouchStart = (e) => {
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        };

        const handleTouchEnd = (e) => {
            if (e.touches.length > 0) return;

            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();

            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;

            // 检查是否为有效的滑动手势
            if (Math.abs(deltaX) > Math.abs(deltaY) && 
                Math.abs(deltaX) > 50 && 
                deltaTime < 300) {
                
                const direction = deltaX > 0 ? 'right' : 'left';
                onSwipe(direction);
            }
        };

        paginationElement.addEventListener('touchstart', handleTouchStart, { passive: true });
        paginationElement.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
}

/**
 * 全局响应式管理器实例
 */
let globalResponsiveManager = null;
let globalSidebarMonitor = null;

/**
 * 初始化响应式系统
 * @returns {Object} 管理器实例
 */
export function initializeResponsiveSystem() {
    if (!globalResponsiveManager) {
        globalResponsiveManager = new ResponsiveConfigManager();
    }
    
    if (!globalSidebarMonitor) {
        globalSidebarMonitor = new SidebarStateMonitor();
    }

    return {
        responsiveManager: globalResponsiveManager,
        sidebarMonitor: globalSidebarMonitor
    };
}

/**
 * 获取全局响应式管理器
 * @returns {ResponsiveConfigManager|null}
 */
export function getResponsiveManager() {
    return globalResponsiveManager;
}

/**
 * 获取全局侧栏监听器
 * @returns {SidebarStateMonitor|null}
 */
export function getSidebarMonitor() {
    return globalSidebarMonitor;
}

/**
 * 清理响应式系统
 */
export function cleanupResponsiveSystem() {
    if (globalResponsiveManager) {
        globalResponsiveManager.destroy();
        globalResponsiveManager = null;
    }
    
    if (globalSidebarMonitor) {
        globalSidebarMonitor.destroy();
        globalSidebarMonitor = null;
    }
}