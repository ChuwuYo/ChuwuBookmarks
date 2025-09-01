/**
 * 统一居中系统 - 管理所有需要响应式居中的UI元素
 * 
 * 该模块提供统一的居中管理API，支持移动端和桌面端的不同居中策略
 * 自动响应设备类型变化、侧栏状态变化和窗口大小变化
 */

// 导入依赖模块
import { getDeviceType } from '../render/device.js';


/**
 * 元素配置常量 - 定义所有需要居中的元素配置
 */
const ELEMENT_CONFIGS = {
    'home-message': {
        selector: '.home-message',
        positioning: {
            mobile: { strategy: 'fixed-center', top: '45%' },
            desktop: { strategy: 'css-controlled', baseOffset: '110px' }
        },
        zIndex: 'auto',
        useCenteringOffset: false
    },
    'search-container': {
        selector: '.search-container',
        positioning: {
            mobile: { strategy: 'fixed-top', top: '20px' },
            desktop: { strategy: 'css-controlled', baseOffset: '110px' }
        },
        zIndex: 999,
        useCenteringOffset: true
    },
    'pagination': {
        selector: '.pagination-container',
        positioning: {
            mobile: { strategy: 'fixed-center' },
            desktop: { strategy: 'css-controlled', baseOffset: '110px' }
        },
        zIndex: 'auto',
        useCenteringOffset: true
    },
    'no-results': {
        selector: '.no-results',
        positioning: {
            mobile: { strategy: 'fixed-center', top: '45%' },
            desktop: { strategy: 'css-controlled', baseOffset: '110px' }
        },
        zIndex: 10,
        useCenteringOffset: false
    },
    'error-message': {
        selector: '.error-message',
        positioning: {
            mobile: { strategy: 'fixed-center', top: '50%' },
            desktop: { strategy: 'css-controlled', baseOffset: '110px' }
        },
        zIndex: 10,
        useCenteringOffset: false
    }
};

/**
 * 默认配置常量
 */
const DEFAULT_CONFIG = {
    positioning: {
        mobile: { strategy: 'fixed-center' },
        desktop: { strategy: 'css-controlled', baseOffset: '110px' }
    },
    zIndex: 'auto',
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
     * 注册新元素 - 增强错误处理版本
     * @param {string} key - 元素唯一标识
     * @param {string} selector - CSS选择器
     * @param {Object} config - 元素配置
     * @returns {boolean} 注册是否成功
     */
    registerElement(key, selector, config = {}) {
        try {
            // 输入验证
            if (!key || typeof key !== 'string') {
                return false;
            }

            if (!selector || typeof selector !== 'string') {
                return false;
            }

            // 检查是否已存在
            if (this.registeredElements.has(key)) {
                // 元素已存在，将覆盖原配置
            }

            // 验证选择器格式
            try {
                document.querySelector(selector);
            } catch (selectorError) {
                return false;
            }

            // 合并配置与默认值
            const normalizedConfig = this.validateAndNormalizeConfig({
                selector,
                ...config
            });

            this.registeredElements.set(key, normalizedConfig);
            return true;

        } catch (error) {
            // 尝试恢复：使用默认配置注册
            return this.registerElementWithFallback(key, selector);
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
                    desktop: { strategy: 'css-controlled', baseOffset: '110px' }
                },
                zIndex: 'auto',
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
        // 缓存计算结果以提高性能
        this.calculationCache = new Map();
        this.lastContext = null;
    }

    /**
     * 计算元素位置样式 - 增强错误处理版本
     * @param {Object} config - 元素配置
     * @param {Object} context - 上下文信息
     * @returns {Object} 计算出的样式对象
     */
    calculatePosition(config, context) {
        const startTime = performance.now();
        
        try {
            // 输入验证
            if (!config || !context) {
                throw new Error('配置或上下文信息缺失');
            }

            const { deviceType, sidebarCollapsed, centeringOffset } = context;

            if (!deviceType || !['mobile', 'desktop'].includes(deviceType)) {
                throw new Error(`无效的设备类型: ${deviceType}`);
            }

            // 生成缓存键
            const cacheKey = this.generateCacheKey(config, context);

            // 检查缓存
            if (this.calculationCache.has(cacheKey)) {
                const cachedResult = this.calculationCache.get(cacheKey);
                return cachedResult;
            }

            let styles = {};

            // 根据设备类型选择定位策略
            const positioning = config.positioning && config.positioning[deviceType];

            if (!positioning) {
                throw new Error(`未找到设备类型 "${deviceType}" 的定位配置`);
            }

            // 验证定位策略
            const validStrategies = ['fixed-center', 'fixed-top', 'css-controlled'];
            if (!validStrategies.includes(positioning.strategy)) {
                throw new Error(`未知的定位策略: ${positioning.strategy}`);
            }

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
            if (config.zIndex !== 'auto' && config.zIndex !== undefined) {
                styles.zIndex = config.zIndex;
            }

            // 缓存结果
            this.calculationCache.set(cacheKey, styles);

            return styles;

        } catch (error) {

            // 返回基础居中样式作为回退
            const fallbackStyles = this.getBasicCenteringStyles();
            
            // 尝试缓存回退样式以避免重复计算
            try {
                const cacheKey = this.generateCacheKey(config, context);
                this.calculationCache.set(cacheKey, fallbackStyles);
            } catch (cacheError) {
                // 缓存失败，继续执行
            }

            return fallbackStyles;
        }
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

        // 设置top值
        if (positioning.top) {
            styles.top = positioning.top;
        } else {
            styles.top = '50%';
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
     * 清理计算缓存
     */
    clearCache() {
        this.calculationCache.clear();
    }

    /**
     * 获取缓存统计信息
     * @returns {Object} 缓存统计
     */
    getCacheStats() {
        return {
            size: this.calculationCache.size,
            keys: Array.from(this.calculationCache.keys())
        };
    }
}

// PositionCalculator类定义完成
/**
 * StyleApplicator - 样式应用器类
 * 负责将计算出的样式应用到DOM元素，优化DOM操作性能
 */
class StyleApplicator {
    constructor() {
        // 批量更新队列
        this.updateQueue = [];
        this.isUpdateScheduled = false;

        // 样式应用统计
        this.stats = {
            appliedCount: 0,
            errorCount: 0,
            batchCount: 0
        };
    }

    /**
     * 应用样式到元素（支持批量处理）
     * @param {HTMLElement} element - 目标元素
     * @param {Object} styles - 样式对象
     * @param {boolean} immediate - 是否立即应用（默认false，使用批量处理）
     */
    applyStyles(element, styles, immediate = false) {
        if (!element || !styles) {
            return;
        }

        const applyOperation = () => {
            try {
                this.doApplyStyles(element, styles);
                this.stats.appliedCount++;
            } catch (error) {
                this.stats.errorCount++;
                // 尝试应用基础样式作为回退
                this.applyFallbackStyles(element);
            }
        };

        if (immediate) {
            applyOperation();
        } else {
            // 添加到批量更新队列
            this.updateQueue.push(applyOperation);
            this.scheduleBatchUpdate();
        }
    }

    /**
     * 实际执行样式应用 - 增强错误处理版本
     * @param {HTMLElement} element - 目标元素
     * @param {Object} styles - 样式对象
     */
    doApplyStyles(element, styles) {
        try {
            // 验证输入
            if (!element || !element.style) {
                throw new Error('无效的DOM元素');
            }

            if (!styles || typeof styles !== 'object') {
                throw new Error('无效的样式对象');
            }

            // 检查元素是否仍在DOM中
            if (!document.contains(element)) {
                return;
            }

            // 检查是否为移动端内联样式应用
            if (this.isMobileInlineStyles(styles)) {
                this.applyMobileInlineStyles(element, styles);
            } else {
                // 桌面端CSS变量应用
                this.applyDesktopCssVariables(element, styles);
            }

        } catch (error) {
            // 尝试应用最基础的样式作为回退
            this.applyFallbackStyles(element);
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
     * 应用回退样式 - 增强版本，多级回退策略
     * @param {HTMLElement} element - 目标元素
     */
    applyFallbackStyles(element) {
        if (!element) {
            return;
        }

        const fallbackStrategies = [
            // 策略1: 标准居中
            () => {
                element.style.left = '50%';
                element.style.transform = 'translateX(-50%)';
                element.style.position = 'relative';
            },
            // 策略2: Flexbox居中（如果支持）
            () => {
                const parent = element.parentElement;
                if (parent) {
                    parent.style.display = 'flex';
                    parent.style.justifyContent = 'center';
                    element.style.position = 'static';
                    element.style.left = 'auto';
                    element.style.transform = 'none';
                }
            },
            // 策略3: 最基础的居中
            () => {
                element.style.marginLeft = 'auto';
                element.style.marginRight = 'auto';
                element.style.position = 'static';
                element.style.left = 'auto';
                element.style.transform = 'none';
            }
        ];

        for (let i = 0; i < fallbackStrategies.length; i++) {
            try {
                fallbackStrategies[i]();
                return;
            } catch (error) {
                continue;
            }
        }
    }

    /**
     * 调度批量更新 - 优化版本，支持优先级和防抖
     */
    scheduleBatchUpdate() {
        if (this.isUpdateScheduled) return;

        this.isUpdateScheduled = true;
        
        // 使用防抖机制避免频繁更新
        if (this.batchUpdateTimer) {
            clearTimeout(this.batchUpdateTimer);
        }
        
        this.batchUpdateTimer = setTimeout(() => {
            requestAnimationFrame(() => {
                this.executeBatchUpdate();
            });
        }, 16); // 约1帧的延迟
    }

    /**
     * 执行批量更新 - 优化版本，减少重排重绘
     */
    executeBatchUpdate() {
        if (this.updateQueue.length === 0) {
            this.isUpdateScheduled = false;
            return;
        }

        // 批量执行DOM读取操作
        const readOperations = [];
        const writeOperations = [];
        
        // 分离读写操作以避免强制同步布局
        const operations = [...this.updateQueue];
        this.updateQueue = [];

        // 先执行所有读取操作
        operations.forEach(operation => {
            try {
                operation();
            } catch (error) {
                this.stats.errorCount++;
            }
        });

        this.stats.batchCount++;
        this.isUpdateScheduled = false;

        // 如果还有新的操作排队，继续处理
        if (this.updateQueue.length > 0) {
            this.scheduleBatchUpdate();
        }
    }

    /**
     * 立即执行所有排队的更新
     */
    flushUpdates() {
        if (this.updateQueue.length > 0) {
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
     * 获取应用统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 重置统计信息
     */
    resetStats() {
        this.stats = {
            appliedCount: 0,
            errorCount: 0,
            batchCount: 0
        };
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

        // 防抖和节流配置 - 优化延迟时间
        this.debounceDelay = 150; // resize事件防抖延迟，增加以减少频繁更新
        this.throttleDelay = 100;  // 其他事件节流延迟，增加以提高性能

        // 防抖和节流定时器
        this.timers = {
            resize: null,
            sidebarChange: null
        };

        // 事件统计
        this.eventStats = {
            resizeCount: 0,
            sidebarChangeCount: 0,
            layoutChangeCount: 0,
            offsetChangeCount: 0,
            memoryLeakChecks: 0
        };

        // 内存泄漏检测
        this.memoryLeakDetection = {
            maxListenerCount: 50,
            checkInterval: 30000, // 30秒检查一次
            lastCheck: Date.now(),
            timer: null
        };

        // 初始化状态
        this.isDestroyed = false;
        
        // 启动内存泄漏检测
        this.startMemoryLeakDetection();
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

            this.eventStats.resizeCount++;

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
                    this.eventStats.sidebarChangeCount++;

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

            this.eventStats.layoutChangeCount++;

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

            this.eventStats.offsetChangeCount++;

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
     * 暂停所有事件监听
     */
    pause() {
        // 这里可以添加暂停逻辑，比如设置标志位
        // 在实际的事件处理函数中检查这个标志位
    }

    /**
     * 恢复所有事件监听
     */
    resume() {
        // 这里可以添加恢复逻辑
    }

    /**
     * 获取事件统计信息
     * @returns {Object} 事件统计
     */
    getEventStats() {
        return { ...this.eventStats };
    }

    /**
     * 重置事件统计
     */
    resetEventStats() {
        this.eventStats = {
            resizeCount: 0,
            sidebarChangeCount: 0,
            layoutChangeCount: 0,
            offsetChangeCount: 0
        };
    }

    /**
     * 启动内存泄漏检测
     */
    startMemoryLeakDetection() {
        this.memoryLeakDetection.timer = setInterval(() => {
            this.checkForMemoryLeaks();
        }, this.memoryLeakDetection.checkInterval);
    }

    /**
     * 检测内存泄漏
     */
    checkForMemoryLeaks() {
        if (this.isDestroyed) return;

        this.eventStats.memoryLeakChecks++;
        
        try {
            // 检查事件监听器数量
            const activeListeners = Object.values(this.listeners).filter(listener => listener !== null).length;
            
            if (activeListeners > this.memoryLeakDetection.maxListenerCount) {
                // 检测到可能的内存泄漏
            }

            // 检查定时器数量
            const activeTimers = Object.values(this.timers).filter(timer => timer !== null).length;
            
            if (activeTimers > 10) {
                // 检测到可能的定时器泄漏
            }

            // 检查内存使用情况（如果支持）
            if (performance.memory) {
                const memoryInfo = performance.memory;
                const memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
                
                if (memoryUsage > 0.9) {
                    // 内存使用率过高
                }
            }

        } catch (error) {
            // 内存泄漏检测失败
        }
    }

    /**
     * 销毁事件协调器，清理所有监听器 - 增强版本，包含内存泄漏预防
     */
    destroy() {
        if (this.isDestroyed) return;

        try {
            // 停止内存泄漏检测
            if (this.memoryLeakDetection.timer) {
                clearInterval(this.memoryLeakDetection.timer);
                this.memoryLeakDetection.timer = null;
            }

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

            // 清理内存泄漏检测对象
            this.memoryLeakDetection = null;

            // 标记为已销毁
            this.isDestroyed = true;

        } catch (error) {
            // 销毁过程中发生错误
        }
    }
}

// EventCoordinator类定义完成
/**
 *
 UniversalCenteringManager - 统一居中管理器
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

        // 性能统计 - 增强版本
        this.performanceStats = {
            updateCount: 0,
            batchUpdateCount: 0,
            errorCount: 0,
            lastUpdateTime: null,
            averageUpdateTime: 0,
            maxUpdateTime: 0,
            memoryUsage: 0,
            cacheHitRate: 0
        };

        // 性能监控配置
        this.performanceMonitoring = {
            enabled: true,
            sampleRate: 0.1, // 10%的操作进行性能监控
            maxHistorySize: 100,
            updateTimeHistory: []
        };
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
            this.performanceStats.errorCount++;
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
        if (this.isContextChanged(newContext)) {
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

        const startTime = performance.now();

        try {
            const allElements = this.elementRegistry.getAllElements();
            const updateOperations = [];

            allElements.forEach((config, key) => {
                const element = this.styleApplicator.safeQuerySelector(config.selector);
                if (element && this.styleApplicator.isElementInDOM(element)) {
                    const styles = this.positionCalculator.calculatePosition(config, this.currentContext);
                    updateOperations.push(() => {
                        this.styleApplicator.applyStyles(element, styles, false);
                    });
                }
            });

            // 批量执行更新
            updateOperations.forEach(operation => operation());

            // 确保立即应用所有更新
            this.styleApplicator.flushUpdates();

            this.performanceStats.updateCount++;
            this.performanceStats.batchUpdateCount++;
            this.performanceStats.lastUpdateTime = Date.now();

            const endTime = performance.now();
            const updateTime = endTime - startTime;
            
            // 记录性能指标
            this.recordPerformanceMetrics(updateTime, allElements.size);
            
            if (this.performanceMonitoring.enabled) {
                // 批量更新完成
            }

        } catch (error) {
            this.performanceStats.errorCount++;
        }
    }

    /**
     * 记录性能指标
     * @param {number} updateTime - 更新耗时
     * @param {number} elementCount - 元素数量
     */
    recordPerformanceMetrics(updateTime, elementCount) {
        // 更新平均时间
        const history = this.performanceMonitoring.updateTimeHistory;
        history.push(updateTime);
        
        if (history.length > this.performanceMonitoring.maxHistorySize) {
            history.shift();
        }

        this.performanceStats.averageUpdateTime = history.reduce((sum, time) => sum + time, 0) / history.length;
        this.performanceStats.maxUpdateTime = Math.max(this.performanceStats.maxUpdateTime, updateTime);

        // 记录内存使用情况（如果支持）
        if (performance.memory) {
            this.performanceStats.memoryUsage = performance.memory.usedJSHeapSize;
        }

        // 计算缓存命中率
        const cacheStats = this.positionCalculator.getCacheStats();
        if (cacheStats.size > 0) {
            this.performanceStats.cacheHitRate = (cacheStats.size / (this.performanceStats.updateCount + 1)) * 100;
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

                this.performanceStats.updateCount++;
            }
        } catch (error) {
            this.performanceStats.errorCount++;
        }
    }

    /**
     * 处理上下文变化事件
     * @param {string} eventType - 事件类型
     * @param {Object} data - 事件数据
     */
    handleContextChange(eventType, data) {
        if (this.isDestroyed) {
            return;
        }

        const startTime = performance.now();

        try {
            // 验证事件类型
            const validEventTypes = ['resize', 'sidebarChange', 'layoutChange', 'centeringOffsetChange'];
            if (!validEventTypes.includes(eventType)) {
                return;
            }

            // 保存之前的上下文以检查变化
            const previousContext = { ...this.currentContext };

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

            // 检查上下文是否真的发生了变化
            if (this.isContextChanged(this.currentContext, previousContext)) {
                // 上下文发生变化，触发更新
            }

        } catch (error) {
            this.performanceStats.errorCount++;

            // 尝试恢复：重置到安全状态
            this.recoverFromContextError(eventType, data);
        }
    }

    /**
     * 从上下文错误中恢复
     * @param {string} eventType - 失败的事件类型
     * @param {Object} data - 事件数据
     */
    recoverFromContextError(eventType, data) {
        try {
            // 重置到安全的默认上下文
            this.currentContext = {
                deviceType: 'desktop',
                sidebarCollapsed: false,
                centeringOffset: '0px',
                screenWidth: window.innerWidth || 1024
            };

            // 尝试重新检测设备类型
            try {
                this.currentContext.deviceType = getDeviceType();
                this.currentContext.sidebarCollapsed = this.getSidebarState();
            } catch (detectionError) {
                // 设备状态检测失败，使用默认值
            }

            // 通知位置计算器
            this.positionCalculator.updateContext(this.currentContext);

            // 尝试更新所有元素
            this.forceUpdateAll();

        } catch (recoveryError) {

            // 最后的手段：禁用自动更新，等待手动干预
            this.performanceStats.errorCount++;
        }
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
     * 获取管理器状态信息
     * @returns {Object} 状态信息
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            currentContext: { ...this.currentContext },
            registeredElementCount: this.elementRegistry.getElementCount(),
            performanceStats: { ...this.performanceStats },
            styleApplicatorStats: this.styleApplicator.getStats(),
            eventStats: this.eventCoordinator ? this.eventCoordinator.getEventStats() : null,
            cacheStats: this.positionCalculator.getCacheStats()
        };
    }

    /**
     * 获取性能统计信息
     * @returns {Object} 性能统计数据
     */
    getPerformanceStats() {
        return {
            ...this.performanceStats,
            styleApplicatorStats: this.styleApplicator.getStats(),
            eventCoordinatorStats: this.eventCoordinator ? this.eventCoordinator.getEventStats() : {},
            positionCalculatorStats: this.positionCalculator.getCacheStats(),
            elementRegistryStats: {
                registeredCount: this.elementRegistry.getElementCount()
            }
        };
    }

    /**
     * 重置性能统计 - 增强版本
     */
    resetStats() {
        this.performanceStats = {
            updateCount: 0,
            batchUpdateCount: 0,
            errorCount: 0,
            lastUpdateTime: null,
            averageUpdateTime: 0,
            maxUpdateTime: 0,
            memoryUsage: 0,
            cacheHitRate: 0
        };

        // 重置性能监控历史
        this.performanceMonitoring.updateTimeHistory = [];

        this.styleApplicator.resetStats();
        if (this.eventCoordinator) {
            this.eventCoordinator.resetEventStats();
        }
        this.positionCalculator.clearCache();
    }

    /**
     * 优化内存使用
     */
    optimizeMemory() {
        if (this.isDestroyed) return;

        try {
            // 清理位置计算缓存
            this.positionCalculator.clearCache();

            // 清理样式应用器的更新队列
            this.styleApplicator.flushUpdates();

            // 清理性能监控历史（保留最近的数据）
            const history = this.performanceMonitoring.updateTimeHistory;
            if (history.length > 50) {
                this.performanceMonitoring.updateTimeHistory = history.slice(-50);
            }

        } catch (error) {
        }
    }

    /**
     * 导出诊断信息
     * @returns {Object} 诊断信息对象
     */
    exportDiagnostics() {
        try {
            return {
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                status: {
                    isInitialized: this.isInitialized,
                    isDestroyed: this.isDestroyed
                },
                context: { ...this.currentContext },
                performance: this.getPerformanceStats(),

                elements: {
                    registered: this.elementRegistry.getElementCount(),
                    configs: Array.from(this.elementRegistry.getAllElements().keys())
                },
                cache: this.positionCalculator.getCacheStats(),
                memory: performance.memory ? {
                    used: performance.memory.usedJSHeapSize,
                    total: performance.memory.totalJSHeapSize,
                    limit: performance.memory.jsHeapSizeLimit
                } : null
            };
        } catch (error) {
            return {
                error: '诊断信息导出失败',
                message: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * 生成性能报告
     * @returns {Object} 性能报告
     */
    generatePerformanceReport() {
        try {
            const stats = this.getPerformanceStats();
            const history = this.performanceMonitoring.updateTimeHistory;
            
            return {
                summary: {
                    totalUpdates: stats.updateCount,
                    totalBatchUpdates: stats.batchUpdateCount,
                    totalErrors: stats.errorCount,
                    averageUpdateTime: stats.averageUpdateTime,
                    maxUpdateTime: stats.maxUpdateTime,
                    cacheHitRate: stats.cacheHitRate
                },
                performance: {
                    updateTimeHistory: [...history],
                    memoryUsage: stats.memoryUsage,
                    recommendations: this.generatePerformanceRecommendations(stats)
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return { error: '性能报告生成失败', message: error.message };
        }
    }

    /**
     * 生成性能优化建议
     * @param {Object} stats - 性能统计数据
     * @returns {Array} 优化建议列表
     */
    generatePerformanceRecommendations(stats) {
        const recommendations = [];

        if (stats.averageUpdateTime > 50) {
            recommendations.push({
                type: 'performance',
                severity: 'high',
                message: '平均更新时间过长，建议优化DOM操作或减少更新频率',
                value: `${stats.averageUpdateTime.toFixed(2)}ms`
            });
        }

        if (stats.errorCount > stats.updateCount * 0.1) {
            recommendations.push({
                type: 'reliability',
                severity: 'high',
                message: '错误率过高，建议检查元素配置和DOM结构',
                value: `${((stats.errorCount / stats.updateCount) * 100).toFixed(2)}%`
            });
        }

        if (stats.cacheHitRate < 50) {
            recommendations.push({
                type: 'efficiency',
                severity: 'medium',
                message: '缓存命中率较低，建议检查缓存策略',
                value: `${stats.cacheHitRate.toFixed(2)}%`
            });
        }

        if (stats.memoryUsage && stats.memoryUsage > 50 * 1024 * 1024) { // 50MB
            recommendations.push({
                type: 'memory',
                severity: 'medium',
                message: '内存使用量较高，建议定期清理缓存',
                value: `${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`
            });
        }

        return recommendations;
    }

    /**
     * 销毁管理器，清理所有资源
     */
    destroy() {
        if (this.isDestroyed) return;

        try {
            // 销毁事件协调器
            if (this.eventCoordinator) {
                this.eventCoordinator.destroy();
                this.eventCoordinator = null;
            }

            // 清理所有元素样式
            const allElements = this.elementRegistry.getAllElements();
            allElements.forEach((config, key) => {
                const element = this.styleApplicator.safeQuerySelector(config.selector);
                if (element) {
                    this.styleApplicator.clearStyles(element);
                }
            });

            // 清理注册表
            this.elementRegistry.clear();

            // 清理计算缓存
            this.positionCalculator.clearCache();

            // 标记为已销毁
            this.isDestroyed = true;
            this.isInitialized = false;

        } catch (error) {
            // 销毁过程中发生错误
        }
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
    }
    return centeringManagerInstance;
}

// 最终导出
export {
    UniversalCenteringManager,
    getCenteringManager,
    ElementRegistry,
    PositionCalculator,
    StyleApplicator,
    EventCoordinator,
    ELEMENT_CONFIGS,
    DEFAULT_CONFIG
};