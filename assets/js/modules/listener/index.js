/**
 * 事件监听聚合模块
 * 负责统一注册各类事件监听器
 */

import { initDeviceListeners } from "./device-listener.js";
import { initSearchListeners } from "./search-listener.js";
import { initTitleListeners } from "./title-listener.js";
import { initUIListeners } from "./ui-listener.js";

/**
 * 初始化所有事件监听器
 * @param {Function} debounceSearch - 防抖后的搜索函数
 */
const initEventListeners = (debounceSearch) => {
	initDeviceListeners();
	initTitleListeners();
	initSearchListeners(debounceSearch);
	initUIListeners();
};

export { initEventListeners };
