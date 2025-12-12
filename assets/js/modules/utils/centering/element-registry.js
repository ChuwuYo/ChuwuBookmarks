/**
 * ElementRegistry - 元素注册表类
 * 负责管理所有注册元素的配置和状态
 */

import {
    ELEMENT_CONFIGS,
    DEFAULT_CONFIG,
    VALID_STRATEGIES
} from './config.js';

export class ElementRegistry {
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
        // 验证必需参数
        if (!key || !selector) {
            return false;
        }

        try {
            const fallbackConfig = {
                selector,
                positioning: {
                    mobile: { strategy: 'fixed-center' },
                    desktop: { strategy: 'css-controlled', baseOffset: DEFAULT_CONFIG.positioning.desktop.baseOffset }
                },
                zIndex: DEFAULT_CONFIG.zIndex,
                useCenteringOffset: false
            };

            // 验证和规范化配置
            const normalizedConfig = this.validateAndNormalizeConfig(fallbackConfig);
            this.registeredElements.set(key, normalizedConfig);
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
        const mobileStrategy = normalizedConfig.positioning.mobile.strategy;
        const desktopStrategy = normalizedConfig.positioning.desktop.strategy;

        if (!VALID_STRATEGIES.includes(mobileStrategy)) {
            throw new Error(`无效的移动端定位策略: ${mobileStrategy}`);
        }

        if (!VALID_STRATEGIES.includes(desktopStrategy)) {
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
