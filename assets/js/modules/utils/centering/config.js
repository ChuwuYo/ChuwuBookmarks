/**
 * 配置模块 - 定义所有元素配置和默认值
 * 
 * 该模块集中管理系统的配置常量，便于维护和修改
 */

import {
    LAYOUT_CONSTANTS,
    Z_INDEX_CONSTANTS
} from '../constants.js';

/**
 * 元素配置常量 - 定义所有需要居中的元素配置
 */
export const ELEMENT_CONFIGS = {
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
export const DEFAULT_CONFIG = {
    positioning: {
        mobile: { strategy: 'fixed-center' },
        desktop: { strategy: 'css-controlled', baseOffset: LAYOUT_CONSTANTS.SIDEBAR_BASE_OFFSET }
    },
    zIndex: Z_INDEX_CONSTANTS.AUTO,
    useCenteringOffset: false
};

/**
 * 有效的定位策略列表
 */
export const VALID_STRATEGIES = ['fixed-center', 'fixed-top', 'css-controlled'];
