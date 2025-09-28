/**
 * 统一居中系统 - 管理所有需要响应式居中的UI元素
 * 
 * 该模块提供统一的居中管理API，支持移动端和桌面端的不同居中策略
 * 自动响应设备类型变化、侧栏状态变化和窗口大小变化
 */

// 导入依赖模块
import { getDeviceType } from '../render/device.js';
import {
    LAYOUT_CONSTANTS,
    DEBOUNCE_THROTTLE_CONSTANTS,
    Z_INDEX_CONSTANTS
} from './constants.js';


/**
 * 元素配置常量 - 定义所有需要居中的元素配置
 */
const ELEMENT_CONFIGS = {
    'home-message': {
        selector: '.home-message',
        positioning: {
            mobile: { strategy: 'fixed-center', top: LAYOUT_CONSTANTS.HOME_MESSAGE_TOP },
            desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
        },
        zIndex: Z_INDEX_CONSTANTS.AUTO,
        useCenteringOffset: false
    },
    'search-container': {
        selector: '.search-container',
        positioning: {
            mobile: { strategy: 'fixed-top', top: LAYOUT_CONSTANTS.SEARCH_CONTAINER_TOP_MOBILE },
            desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
        },
        zIndex: Z_INDEX_CONSTANTS.SEARCH_CONTAINER,
        useCenteringOffset: true
    },
    'pagination': {
        selector: '.pagination-container',
        positioning: {
            mobile: { strategy: 'fixed-center', bottom: '20px' },
            desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
        },
        zIndex: Z_INDEX_CONSTANTS.AUTO,
        useCenteringOffset: true
    },
    'no-results': {
        selector: '.no-results',
        positioning: {
            mobile: { strategy: 'fixed-center', top: LAYOUT_CONSTANTS.HOME_MESSAGE_TOP },
            desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
        },
        zIndex: Z_INDEX_CONSTANTS.MESSAGE_OVERLAY,
        useCenteringOffset: false
    },
    'error-message': {
        selector: '.error-message',
        positioning: {
            mobile: { strategy: 'fixed-center', top: LAYOUT_CONSTANTS.ERROR_MESSAGE_TOP },
            desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
        },
        zIndex: Z_INDEX_CONSTANTS.MESSAGE_OVERLAY,
        useCenteringOffset: false
    }
};

/**
 * 默认配置常量
 */
const DEFAULT_CONFIG = {
    positioning: {
        mobile: { strategy: 'fixed-center' },
        desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
    },
    zIndex: Z_INDEX_CONSTANTS.AUTO,
    useCenteringOffset: false
};

/**
 * ElementRegistry - 元素注册表类
 * 负责管理所有注册元素的配置和状态
 */
class ElementRegistry {
    constructor() {
        // 存储注册的元素配置
        this.registeredElements = new Map();

        // 初始化预定义配置
        this.initializeDefaultConfigs();
    }

    /**
     * 初始化预定义的元素配置
     */
    initializeDefaultConfigs() {
        Object.entries(ELEMENT_CONFIGS).forEach(([key, config]) => {
            this.registeredElements.set(key, this.validateAndNormalizeConfig(config));
        });
    }

    /**
     * 注册新元素
     * @param {string} key - 元素唯一标识
     * @param {string} selector - CSS选择器
     * @param {Object} config - 元素配置
     * @returns {boolean} 注册是否成功
     */
    registerElement(key, selector, config = {}) {
        if (!key || !selector) return false;

        try {
            const normalizedConfig = this.validateAndNormalizeConfig({
                selector,
                ...config
            });
            this.registeredElements.set(key, normalizedConfig);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 使用回退配置注册元素
     * @param {string} key - 元素唯一标识
     * @param {string} selector - CSS选择器
     * @returns {boolean} 注册是否成功
     */
    registerElementWithFallback(key, selector) {
        try {
            const fallbackConfig = {
                selector,
                positioning: {
                    mobile: { strategy: 'fixed-center' },
                    desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
                },
                zIndex: Z_INDEX_CONSTANTS.AUTO,
                useCenteringOffset: false
            };

            this.registeredElements.set(key, fallbackConfig);
            return true;

        } catch (fallbackError) {
            return false;
        }
    }

    /**
     * 注销元素
     * @param {string} key - 元素唯一标识
     * @returns {boolean} 注销是否成功
     */
    unregisterElement(key) {
        if (this.registeredElements.has(key)) {
            this.registeredElements.delete(key);
            return true;
        }
        return false;
    }

    /**
     * 获取元素配置
     * @param {string} key - 元素唯一标识
     * @returns {Object|null} 元素配置或null
     */
    getElementConfig(key) {
        return this.registeredElements.get(key) || null;
    }

    /**
     * 获取所有注册的元素
     * @returns {Map} 所有注册元素的Map
     */
    getAllElements() {
        return new Map(this.registeredElements);
    }

    /**
     * 检查元素是否已注册
     * @param {string} key - 元素唯一标识
     * @returns {boolean} 是否已注册
     */
    hasElement(key) {
        return this.registeredElements.has(key);
    }

    /**
     * 获取注册元素数量
     * @returns {number} 注册元素数量
     */
    getElementCount() {
        return this.registeredElements.size;
    }

    /**
     * 验证和规范化配置
     * @param {Object} config - 原始配置
     * @returns {Object} 规范化后的配置
     */
    validateAndNormalizeConfig(config) {
        // 深拷贝默认配置
        const normalizedConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));

        // 合并用户配置
        if (config.selector) {
            normalizedConfig.selector = config.selector;
        }

        if (config.positioning) {
            if (config.positioning.mobile) {
                normalizedConfig.positioning.mobile = {
                    ...normalizedConfig.positioning.mobile,
                    ...config.positioning.mobile
                };
            }
            if (config.positioning.desktop) {
                normalizedConfig.positioning.desktop = {
                    ...normalizedConfig.positioning.desktop,
                    ...config.positioning.desktop
                };
            }
        }

        if (config.zIndex !== undefined) {
            normalizedConfig.zIndex = config.zIndex;
        }

        if (config.useCenteringOffset !== undefined) {
            normalizedConfig.useCenteringOffset = config.useCenteringOffset;
        }

        // 验证必需字段
        if (!normalizedConfig.selector) {
            throw new Error('配置缺少必需的selector字段');
        }

        // 验证定位策略
        const validStrategies = ['fixed-center', 'fixed-top', 'css-controlled'];
        const mobileStrategy = normalizedConfig.positioning.mobile.strategy;
        const desktopStrategy = normalizedConfig.positioning.desktop.strategy;

        if (!validStrategies.includes(mobileStrategy)) {
            throw new Error(`无效的移动端定位策略: ${mobileStrategy}`);
        }

        if (!validStrategies.includes(desktopStrategy)) {
            throw new Error(`无效的桌面端定位策略: ${desktopStrategy}`);
        }

        return normalizedConfig;
    }

    /**
     * 清空所有注册的元素
     */
    clear() {
        this.registeredElements.clear();
    }
}

// ElementRegistry类定义完成
/**

 * PositionCalculator - 位置计算器类
 * 负责根据设备类型和侧栏状态计算元素位置
 */
class PositionCalculator {
    constructor() {
        // 缓存计算结果以提高性能 - 使用LRU缓存
        this.calculationCache = new Map();
        this.maxCacheSize = 50;
        this.lastContext = null;
    }

    /**
     * 计算元素位置样式
     * @param {Object} config - 元素配置
     * @param {Object} context - 上下文信息
     * @returns {Object} 计算出的样式对象
     */
    calculatePosition(config, context) {
        if (!config || !context) return {};

        const { deviceType } = context;
        const cacheKey = this.generateCacheKey(config, context);

        // 检查缓存
        if (this.calculationCache.has(cacheKey)) {
            return this.calculationCache.get(cacheKey);
        }

        const positioning = config.positioning?.[deviceType];
        if (!positioning) return {};

        let styles = {};

        // 执行位置计算
        switch (positioning.strategy) {
            case 'fixed-center':
                styles = this.calculateFixedCenter(positioning, context);
                break;
            case 'fixed-top':
                styles = this.calculateFixedTop(positioning, context);
                break;
            case 'css-controlled':
                styles = this.calculateCssControlled(positioning, config, context);
                break;
        }

        // 设置z-index
        if (config.zIndex && config.zIndex !== 'auto') {
            styles.zIndex = config.zIndex;
        }

        // 缓存结果
        this.setCacheWithLRU(cacheKey, styles);
        return styles;
    }

    /**
     * 计算移动端固定居中位置
     * @param {Object} positioning - 定位配置
     * @param {Object} context - 上下文信息
     * @returns {Object} 样式对象
     */
    calculateFixedCenter(positioning, context) {
        const styles = {
            position: 'fixed',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };

        // 处理top或bottom属性
        if (positioning.top) {
            styles.top = positioning.top;
            styles.bottom = '';
        } else if (positioning.bottom) {
            styles.bottom = positioning.bottom;
            styles.top = '';
            styles.transform = 'translateX(-50%)';
        } else {
            styles.top = '50%';
            styles.bottom = '';
        }

        return styles;
    }

    /**
     * 计算移动端固定顶部居中位置
     * @param {Object} positioning - 定位配置
     * @param {Object} context - 上下文信息
     * @returns {Object} 样式对象
     */
    calculateFixedTop(positioning, context) {
        const styles = {
            position: 'fixed',
            left: '50%',
            transform: 'translateX(-50%)'
        };

        // 设置top值
        if (positioning.top) {
            styles.top = positioning.top;
        } else {
            styles.top = '20px';
        }

        return styles;
    }

    /**
     * 计算桌面端CSS控制位置
     * @param {Object} positioning - 定位配置
     * @param {Object} config - 完整元素配置
     * @param {Object} context - 上下文信息
     * @returns {Object} 样式对象
     */
    calculateCssControlled(positioning, config, context) {
        const { sidebarCollapsed, centeringOffset } = context;

        const styles = {
            // 移除内联样式，让CSS接管
            position: '',
            left: '',
            top: '',
            transform: ''
        };

        // 计算偏移量
        let calculatedOffset = '0px';

        if (config.useCenteringOffset && centeringOffset) {
            // 使用动态偏移
            calculatedOffset = centeringOffset;
        } else if (positioning.baseOffset) {
            // 使用基础偏移
            if (sidebarCollapsed) {
                calculatedOffset = '0px';
            } else {
                calculatedOffset = positioning.baseOffset;
            }
        }

        // 设置CSS变量
        styles['--centering-offset'] = calculatedOffset;

        return styles;
    }

    /**
     * 更新上下文并清理相关缓存
     * @param {Object} newContext - 新的上下文信息
     */
    updateContext(newContext) {
        // 如果上下文发生变化，清理缓存
        if (!this.isContextEqual(this.lastContext, newContext)) {
            this.clearCache();
            this.lastContext = { ...newContext };
        }
    }

    /**
     * 检查两个上下文是否相等
     * @param {Object} context1 - 上下文1
     * @param {Object} context2 - 上下文2
     * @returns {boolean} 是否相等
     */
    isContextEqual(context1, context2) {
        if (!context1 || !context2) return false;

        return context1.deviceType === context2.deviceType &&
            context1.sidebarCollapsed === context2.sidebarCollapsed &&
            context1.centeringOffset === context2.centeringOffset;
    }

    /**
     * 生成缓存键
     * @param {Object} config - 元素配置
     * @param {Object} context - 上下文信息
     * @returns {string} 缓存键
     */
    generateCacheKey(config, context) {
        const configHash = JSON.stringify({
            positioning: config.positioning,
            useCenteringOffset: config.useCenteringOffset,
            zIndex: config.zIndex
        });

        const contextHash = JSON.stringify(context);

        return `${configHash}|${contextHash}`;
    }

    /**
     * 获取基础居中样式（回退方案）
     * @returns {Object} 基础样式对象
     */
    getBasicCenteringStyles() {
        return {
            left: '50%',
            transform: 'translateX(-50%)'
        };
    }

    /**
     * LRU缓存设置
     * @param {string} key - 缓存键
     * @param {Object} value - 缓存值
     */
    setCacheWithLRU(key, value) {
        // 如果已存在，先删除再重新添加（移到最新）
        if (this.calculationCache.has(key)) {
            this.calculationCache.delete(key);
        }
        // 检查缓存大小限制
        else if (this.calculationCache.size >= this.maxCacheSize) {
            // 删除最旧的项（Map的第一个项）
            const firstKey = this.calculationCache.keys().next().value;
            this.calculationCache.delete(firstKey);
        }
        this.calculationCache.set(key, value);
    }

    /**
     * 清理计算缓存
     */
    clearCache() {
        this.calculationCache.clear();
    }
}

// PositionCalculator类定义完成
/**
 * StyleApplicator - 样式应用器类
 * 负责将计算出的样式应用到DOM元素，优化DOM操作性能
 */
class StyleApplicator {
    constructor() {
        // 批量更新队列 - 使用Map去重
        this.updateQueue = new Map();
        this.isUpdateScheduled = false;
    }

    /**
     * 应用样式到元素
     * @param {HTMLElement} element - 目标元素
     * @param {Object} styles - 样式对象
     * @param {boolean} immediate - 是否立即应用
     */
    applyStyles(element, styles, immediate = false) {
        if (!element || !styles) return;

        if (immediate) {
            this.doApplyStyles(element, styles);
        } else {
            this.updateQueue.set(element, () => this.doApplyStyles(element, styles));
            this.scheduleBatchUpdate();
        }
    }

    /**
     * 实际执行样式应用
     * @param {HTMLElement} element - 目标元素
     * @param {Object} styles - 样式对象
     */
    doApplyStyles(element, styles) {
        if (!element || !styles || !document.contains(element)) return;

        if (this.isMobileInlineStyles(styles)) {
            this.applyMobileInlineStyles(element, styles);
        } else {
            this.applyDesktopCssVariables(element, styles);
        }
    }

    /**
     * 判断是否为移动端内联样式
     * @param {Object} styles - 样式对象
     * @returns {boolean} 是否为移动端内联样式
     */
    isMobileInlineStyles(styles) {
        return styles.position === 'fixed' ||
            (styles.left && styles.transform && !styles['--centering-offset']);
    }

    /**
     * 应用移动端内联样式
     * @param {HTMLElement} element - 目标元素
     * @param {Object} styles - 样式对象
     */
    applyMobileInlineStyles(element, styles) {
        // 清除可能存在的CSS变量
        element.style.removeProperty('--centering-offset');

        // 应用内联样式
        Object.entries(styles).forEach(([property, value]) => {
            if (property.startsWith('--')) return; // 跳过CSS变量

            if (value === '') {
                element.style.removeProperty(property);
            } else {
                element.style[property] = value;
            }
        });
    }

    /**
     * 应用桌面端CSS变量
     * @param {HTMLElement} element - 目标元素
     * @param {Object} styles - 样式对象
     */
    applyDesktopCssVariables(element, styles) {
        // 清除移动端内联样式
        const mobileProperties = ['position', 'left', 'top', 'transform'];
        mobileProperties.forEach(prop => {
            if (styles[prop] === '') {
                element.style.removeProperty(prop);
            }
        });

        // 应用CSS变量和其他样式
        Object.entries(styles).forEach(([property, value]) => {
            if (value === '') {
                element.style.removeProperty(property);
            } else {
                element.style.setProperty(property, value);
            }
        });
    }

    /**
     * 应用回退样式
     * @param {HTMLElement} element - 目标元素
     */
    applyFallbackStyles(element) {
        if (!element) return;

        // 简单的回退策略
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
    }

    /**
     * 调度批量更新
     */
    scheduleBatchUpdate() {
        if (this.isUpdateScheduled) return;

        this.isUpdateScheduled = true;
        
        this.batchUpdateTimer = requestAnimationFrame(() => {
            this.executeBatchUpdate();
        });
    }

    /**
     * 执行批量更新 - 优化版本，减少重排重绘
     */
    executeBatchUpdate() {
        if (this.updateQueue.size === 0) {
            this.isUpdateScheduled = false;
            return;
        }

        // 批量执行DOM操作
        const operations = [...this.updateQueue.values()];
        this.updateQueue.clear();

        // 执行所有操作
        operations.forEach(operation => {
            try {
                operation();
            } catch (error) {
                // 静默处理错误
            }
        });

        this.isUpdateScheduled = false;

        // 如果还有新的操作排队，继续处理
        if (this.updateQueue.size > 0) {
            this.scheduleBatchUpdate();
        }
    }

    /**
     * 立即执行所有排队的更新
     */
    flushUpdates() {
        if (this.updateQueue.size > 0) {
            this.executeBatchUpdate();
        }
    }

    /**
     * 清理元素的所有居中相关样式
     * @param {HTMLElement} element - 目标元素
     */
    clearStyles(element) {
        if (!element) return;

        try {
            const propertiesToClear = [
                'position', 'left', 'top', 'transform', 'z-index',
                '--centering-offset', '--desktop-base-offset'
            ];

            propertiesToClear.forEach(property => {
                element.style.removeProperty(property);
            });

        } catch (error) {
            // 样式清理失败，继续执行
        }
    }

    /**
     * 重置元素样式到默认状态
     * @param {HTMLElement} element - 目标元素
     */
    resetStyles(element) {
        if (!element) return;

        this.clearStyles(element);
        // 可以在这里添加默认样式应用逻辑
    }

    /**
     * 检查元素是否存在于DOM中
     * @param {HTMLElement} element - 要检查的元素
     * @returns {boolean} 元素是否存在于DOM中
     */
    isElementInDOM(element) {
        return element && document.contains(element);
    }

    /**
     * 安全地查找元素
     * @param {string} selector - CSS选择器
     * @returns {HTMLElement|null} 找到的元素或null
     */
    safeQuerySelector(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            return null;
        }
    }
}

// StyleApplicator类定义完成
/**
 * EventCoordinator - 事件协调器类
 * 负责监听和协调各种影响居中的事件
 */
class EventCoordinator {
    constructor(updateCallback) {
        this.updateCallback = updateCallback;

        // 事件监听器引用
        this.listeners = {
            resize: null,
            sidebarObserver: null,
            layoutChange: null,
            centeringOffsetChange: null
        };

        // 防抖和节流配置
        this.debounceDelay = DEBOUNCE_THROTTLE_CONSTANTS.WINDOW_RESIZE_DEBOUNCE_MS;
        this.throttleDelay = DEBOUNCE_THROTTLE_CONSTANTS.SIDEBAR_CHANGE_DEBOUNCE_MS;

        // 防抖和节流定时器
        this.timers = {
            resize: null,
            sidebarChange: null
        };

        // 初始化状态
        this.isDestroyed = false;
    }

    /**
     * 初始化所有事件监听器
     */
    initialize() {
        if (this.isDestroyed) {
            return;
        }

        try {
            this.setupResizeListener();
            this.setupSidebarObserver();
            this.setupLayoutChangeListener();
            this.setupCenteringOffsetListener();

        } catch (error) {
            // 初始化失败，继续执行
        }
    }

    /**
     * 设置窗口resize事件监听器（防抖处理）
     */
    setupResizeListener() {
        this.listeners.resize = this.debounce((event) => {
            if (this.isDestroyed) return;

            // 触发更新回调
            if (this.updateCallback) {
                this.updateCallback('resize', {
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            }
        }, this.debounceDelay);

        window.addEventListener('resize', this.listeners.resize);
    }

    /**
     * 设置侧栏状态变化监听器（MutationObserver）
     */
    setupSidebarObserver() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) {
            return;
        }

        this.listeners.sidebarObserver = new MutationObserver(
            this.throttle((mutations) => {
                if (this.isDestroyed) return;

                let sidebarStateChanged = false;

                mutations.forEach(mutation => {
                    if (mutation.type === 'attributes' &&
                        (mutation.attributeName === 'class' ||
                            mutation.attributeName === 'data-collapsed')) {
                        sidebarStateChanged = true;
                    }
                });

                if (sidebarStateChanged) {
                    const isCollapsed = sidebar.classList.contains('collapsed') ||
                        sidebar.getAttribute('data-collapsed') === 'true';

                    if (this.updateCallback) {
                        this.updateCallback('sidebarChange', {
                            collapsed: isCollapsed,
                            element: sidebar
                        });
                    }
                }
            }, this.throttleDelay)
        );

        // 开始观察侧栏的属性变化
        this.listeners.sidebarObserver.observe(sidebar, {
            attributes: true,
            attributeFilter: ['class', 'data-collapsed']
        });
    }

    /**
     * 设置自定义布局变化事件监听器
     */
    setupLayoutChangeListener() {
        this.listeners.layoutChange = (event) => {
            if (this.isDestroyed) return;

            if (this.updateCallback) {
                this.updateCallback('layoutChange', event.detail || {});
            }
        };

        document.addEventListener('layoutChange', this.listeners.layoutChange);
    }

    /**
     * 设置居中偏移变化事件监听器
     */
    setupCenteringOffsetListener() {
        this.listeners.centeringOffsetChange = (event) => {
            if (this.isDestroyed) return;

            if (this.updateCallback) {
                this.updateCallback('centeringOffsetChange', event.detail || {});
            }
        };

        document.addEventListener('centeringOffsetChange', this.listeners.centeringOffsetChange);
    }

    /**
     * 防抖函数
     * @param {Function} func - 要防抖的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} 防抖后的函数
     */
    debounce(func, delay) {
        return (...args) => {
            clearTimeout(this.timers.resize);
            this.timers.resize = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * 节流函数
     * @param {Function} func - 要节流的函数
     * @param {number} delay - 延迟时间（毫秒）
     * @returns {Function} 节流后的函数
     */
    throttle(func, delay) {
        let lastCall = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastCall >= delay) {
                lastCall = now;
                func.apply(this, args);
            }
        };
    }

    /**
     * 手动触发更新事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    triggerUpdate(eventType, data = {}) {
        if (this.isDestroyed) return;

        if (this.updateCallback) {
            this.updateCallback(eventType, data);
        }
    }

    /**
     * 销毁事件协调器，清理所有监听器
     */
    destroy() {
        if (this.isDestroyed) return;

        try {
            // 清理resize监听器
            if (this.listeners.resize) {
                window.removeEventListener('resize', this.listeners.resize);
                this.listeners.resize = null;
            }

            // 清理侧栏观察器
            if (this.listeners.sidebarObserver) {
                this.listeners.sidebarObserver.disconnect();
                this.listeners.sidebarObserver = null;
            }

            // 清理自定义事件监听器
            if (this.listeners.layoutChange) {
                document.removeEventListener('layoutChange', this.listeners.layoutChange);
                this.listeners.layoutChange = null;
            }

            if (this.listeners.centeringOffsetChange) {
                document.removeEventListener('centeringOffsetChange', this.listeners.centeringOffsetChange);
                this.listeners.centeringOffsetChange = null;
            }

            // 清理所有定时器
            Object.values(this.timers).forEach(timer => {
                if (timer) clearTimeout(timer);
            });
            this.timers = {};

            // 清理回调引用，防止内存泄漏
            this.updateCallback = null;

            // 标记为已销毁
            this.isDestroyed = true;

        } catch (error) {
            // 销毁过程中发生错误
        }
    }
}

// EventCoordinator类定义完成
/**
 * UniversalCenteringManager - 统一居中管理器
 * 整合所有子组件，提供统一的居中管理API
 */
class UniversalCenteringManager {
    constructor() {
        // 初始化子组件
        this.elementRegistry = new ElementRegistry();
        this.positionCalculator = new PositionCalculator();
        this.styleApplicator = new StyleApplicator();

        // 事件协调器将在initialize中创建
        this.eventCoordinator = null;

        // 当前上下文状态
        this.currentContext = {
            deviceType: getDeviceType(),
            sidebarCollapsed: this.getSidebarState(),
            centeringOffset: '0px',
            screenWidth: window.innerWidth
        };

        // 管理器状态
        this.isInitialized = false;
        this.isDestroyed = false;
    }

    /**
     * 初始化管理器
     */
    initialize() {
        if (this.isInitialized || this.isDestroyed) {
            return;
        }

        try {
            // 创建事件协调器并传入更新回调
            this.eventCoordinator = new EventCoordinator((eventType, data) => {
                this.handleContextChange(eventType, data);
            });

            // 初始化事件监听
            this.eventCoordinator.initialize();

            // 执行初始更新
            this.forceUpdateAll();

            this.isInitialized = true;
        } catch (error) {
            // 初始化失败
        }
    }

    /**
     * 注册需要居中的元素
     * @param {string} key - 元素唯一标识
     * @param {string} selector - CSS选择器
     * @param {Object} config - 元素配置
     * @returns {boolean} 注册是否成功
     */
    registerElement(key, selector, config = {}) {
        if (this.isDestroyed) {
            return false;
        }

        const success = this.elementRegistry.registerElement(key, selector, config);

        if (success && this.isInitialized) {
            // 立即更新新注册的元素
            this.updateSingleElement(key);
        }

        return success;
    }

    /**
     * 注销元素
     * @param {string} key - 元素唯一标识
     * @returns {boolean} 注销是否成功
     */
    unregisterElement(key) {
        if (this.isDestroyed) {
            return false;
        }

        // 清理元素样式
        const config = this.elementRegistry.getElementConfig(key);
        if (config) {
            const element = this.styleApplicator.safeQuerySelector(config.selector);
            if (element) {
                this.styleApplicator.clearStyles(element);
            }
        }

        return this.elementRegistry.unregisterElement(key);
    }

    /**
     * 更新上下文状态
     * @param {string} deviceType - 设备类型 ('mobile' | 'desktop')
     * @param {boolean} sidebarCollapsed - 侧栏是否收起
     * @param {string} centeringOffset - 居中偏移量
     */
    updateContext(deviceType, sidebarCollapsed, centeringOffset) {
        if (this.isDestroyed) return;

        const newContext = {
            deviceType: deviceType || getDeviceType(),
            sidebarCollapsed: sidebarCollapsed !== undefined ? sidebarCollapsed : this.getSidebarState(),
            centeringOffset: centeringOffset || '0px',
            screenWidth: window.innerWidth
        };

        // 检查上下文是否真的发生了变化
        if (this.isContextChanged(newContext, this.currentContext)) {
            this.currentContext = newContext;
            this.positionCalculator.updateContext(newContext);

            // 更新所有元素
            this.forceUpdateAll();
        }
    }

    /**
     * 强制更新所有注册的元素
     */
    forceUpdateAll() {
        if (this.isDestroyed) return;

        try {
            const allElements = this.elementRegistry.getAllElements();

            allElements.forEach((config, key) => {
                const element = this.styleApplicator.safeQuerySelector(config.selector);
                if (element && this.styleApplicator.isElementInDOM(element)) {
                    const styles = this.positionCalculator.calculatePosition(config, this.currentContext);
                    this.styleApplicator.applyStyles(element, styles, false);
                }
            });

            // 确保立即应用所有更新
            this.styleApplicator.flushUpdates();

        } catch (error) {
            // 更新失败
        }
    }

    /**
     * 更新单个元素
     * @param {string} key - 元素标识
     */
    updateSingleElement(key) {
        if (this.isDestroyed) return;

        const config = this.elementRegistry.getElementConfig(key);
        if (!config) {
            return;
        }

        try {
            const element = this.styleApplicator.safeQuerySelector(config.selector);
            if (element && this.styleApplicator.isElementInDOM(element)) {
                const styles = this.positionCalculator.calculatePosition(config, this.currentContext);
                this.styleApplicator.applyStyles(element, styles, true);
            }
        } catch (error) {
            // 更新失败
        }
    }

    /**
     * 处理上下文变化事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    handleContextChange(eventType, data) {
        if (this.isDestroyed) return;

        switch (eventType) {
            case 'resize':
                this.updateContext(getDeviceType(), undefined, undefined);
                break;
            case 'sidebarChange':
                if (data && typeof data.collapsed === 'boolean') {
                    this.updateContext(undefined, data.collapsed, undefined);
                }
                break;
            case 'layoutChange':
                this.forceUpdateAll();
                break;
            case 'centeringOffsetChange':
                if (data && data.offset) {
                    this.updateContext(undefined, undefined, data.offset);
                }
                break;
        }
    }

    /**
     * 从上下文错误中恢复
     * @param {string} eventType - 失败的事件类型
     * @param {Object} data - 事件数据
     */
    recoverFromContextError(eventType, data) {
        // 重置到默认上下文
        this.currentContext = {
            deviceType: 'desktop',
            sidebarCollapsed: false,
            centeringOffset: '0px',
            screenWidth: window.innerWidth || 1024
        };

        this.positionCalculator.updateContext(this.currentContext);
        this.forceUpdateAll();
    }

    /**
     * 检查上下文是否发生变化
     * @param {Object} currentContext - 当前上下文
     * @param {Object} previousContext - 之前的上下文
     * @returns {boolean} 是否发生变化
     */
    isContextChanged(currentContext, previousContext) {
        if (!currentContext || !previousContext) return true;

        return currentContext.deviceType !== previousContext.deviceType ||
            currentContext.sidebarCollapsed !== previousContext.sidebarCollapsed ||
            currentContext.centeringOffset !== previousContext.centeringOffset ||
            Math.abs(currentContext.screenWidth - previousContext.screenWidth) > 10; // 10px容差
    }

    /**
     * 获取当前侧栏状态
     * @returns {boolean} 侧栏是否收起
     */
    getSidebarState() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return true; // 默认认为收起

        return sidebar.classList.contains('collapsed') ||
            sidebar.getAttribute('data-collapsed') === 'true';
    }

    /**
     * 销毁管理器，清理所有资源
     */
    destroy() {
        if (this.isDestroyed) return;

        // 销毁事件协调器
        if (this.eventCoordinator) {
            this.eventCoordinator.destroy();
            this.eventCoordinator = null;
        }

        // 清理所有元素样式
        const allElements = this.elementRegistry.getAllElements();
        allElements.forEach((config, key) => {
            const element = document.querySelector(config.selector);
            if (element) {
                this.styleApplicator.clearStyles(element);
            }
        });

        // 清理注册表和缓存
        this.elementRegistry.clear();
        this.positionCalculator.clearCache();

        // 标记为已销毁
        this.isDestroyed = true;
        this.isInitialized = false;
    }
}

// 创建单例实例
let centeringManagerInstance = null;

/**
 * 获取统一居中管理器单例
 * @returns {UniversalCenteringManager} 管理器实例
 */
function getCenteringManager() {
    if (!centeringManagerInstance || centeringManagerInstance.isDestroyed) {
        centeringManagerInstance = new UniversalCenteringManager();
        // 自动初始化新实例
        centeringManagerInstance.initialize();
    }
    return centeringManagerInstance;
}

// 最终导出
export {
    getCenteringManager
};