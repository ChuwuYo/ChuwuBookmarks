/**
 * 设备适配事件监听模块
 */

import { handleDeviceView } from "../render/device.js";
import { getCenteringManager } from "../utils/centering.js";
import { DEBOUNCE_THROTTLE_CONSTANTS } from "../utils/constants.js";
import { debounce } from "../utils/index.js";

/**
 * 初始化设备相关事件监听
 */
const initDeviceListeners = () => {
	// 优化的resize处理 - 使用批量更新机制
	const handleResize = debounce(() => {
		// 批量处理DOM更新，减少重排重绘
		requestAnimationFrame(() => {
			handleDeviceView();
			// 统一居中系统会自动处理resize事件，无需手动调用
		});
	}, DEBOUNCE_THROTTLE_CONSTANTS.WINDOW_RESIZE_DEBOUNCE_MS); // 窗口大小改变事件防抖延迟，减少频繁更新

	// 添加 resize 监听
	window.addEventListener("resize", handleResize);

	// 初始化时执行一次
	handleResize();

	// 注册搜索容器到统一居中系统
	const centeringManager = getCenteringManager();
	if (!centeringManager.isInitialized) {
		centeringManager.initialize();
	}
};

export { initDeviceListeners };
