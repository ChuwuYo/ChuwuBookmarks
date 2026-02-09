/**
 * 消息与覆盖层统一管理模块
 * 负责以下类型的消息元素创建与清理：
 * - Home: .home-message
 * - Loading: 加载提示
 * - Error: .error-message
 * - NoResults: .no-results
 *
 * 目标：
 * - 提供集中 API，避免 loader/home/search 等模块直接散射操作全局 DOM
 * - 保持现有视觉与行为一致，低侵入接入
 */

const SELECTORS = {
	HOME_MESSAGE: ".home-message",
	NO_RESULTS: ".no-results",
	ERROR_MESSAGE: ".error-message",
};

import { getCenteringManager } from "../utils/centering.js";

/**
 * 清理指定选择器对应的所有元素
 * @param {string|string[]} selectors
 */
const clearElements = (selectors) => {
	const list = Array.isArray(selectors) ? selectors : [selectors];
	list.forEach((selector) => {
		document.querySelectorAll(selector).forEach((el) => {
			// 若有挂载的 observer，尝试安全断开
			if (el.observer && typeof el.observer.disconnect === "function") {
				el.observer.disconnect();
			}
			el.remove();
		});
	});
};

/**
 * 清理所有与消息相关的元素
 * 用于在切换视图前确保状态干净
 */
const clearAllMessages = () => {
	clearElements([
		SELECTORS.HOME_MESSAGE,
		SELECTORS.NO_RESULTS,
		SELECTORS.ERROR_MESSAGE,
	]);
};

/**
 * 创建或替换加载提示（用于加载书签等场景）
 * 替换 content 内容，不侵入其他布局
 */
const showLoadingMessage = (contentEl, breadcrumbsEl) => {
	if (!contentEl || !breadcrumbsEl) return;

	clearAllMessages();
	contentEl.innerHTML = "";
	breadcrumbsEl.innerHTML = "";

	const loadingMessage = document.createElement("div");
	loadingMessage.className = "home-message loading-message";

	const loadingText = document.createElement("div");
	loadingText.className = "chinese-text message-title";
	loadingText.textContent = "正在加载书签······";

	loadingMessage.appendChild(loadingText);
	contentEl.appendChild(loadingMessage);
};

/**
 * 显示错误消息（全局覆盖，用于数据加载失败）
 * 内部整合定位逻辑，调用方无需关心居中实现
 */
const showErrorMessage = (error) => {
	clearElements([SELECTORS.HOME_MESSAGE, SELECTORS.NO_RESULTS]);

	const message = document.createElement("div");
	message.className =
		"centered-message error-message centered-element vertical-center";
	message.setAttribute("role", "alert");
	message.setAttribute("aria-live", "assertive");

	const heading = document.createElement("div");
	heading.className = "chinese-text message-title";
	heading.textContent = "加载书签数据失败";

	const line1 = document.createElement("div");
	line1.className = "english-text message-subtitle";
	line1.textContent = "请确保 bookmarks.json 文件存在且格式正确";

	const line2 = document.createElement("div");
	line2.className = "english-text message-detail";
	line2.textContent = `错误详情: ${error?.message || error || "未知错误"}`;

	message.append(heading, line1, line2);
	document.body.appendChild(message);

	// 统一在此处触发居中逻辑，避免调用方重复实现
	const centeringManager = getCenteringManager();
	centeringManager.updateSingleElement("error-message");
};

/**
 * 显示“未找到结果”消息（用于搜索无结果）
 * 内部整合定位逻辑，调用方无需关心居中实现
 */
const showNoResultsMessage = (contentEl) => {
	if (!contentEl) return;

	clearElements([SELECTORS.HOME_MESSAGE, SELECTORS.NO_RESULTS]);

	const noResults = document.createElement("div");
	noResults.className =
		"centered-message no-results centered-element vertical-center";
	noResults.textContent = "未找到匹配的书签";

	contentEl.innerHTML = "";
	contentEl.appendChild(noResults);

	// 统一在此处触发居中逻辑
	const centeringManager = getCenteringManager();
	centeringManager.updateSingleElement("no-results");
};

export {
	clearAllMessages,
	showLoadingMessage,
	showErrorMessage,
	showNoResultsMessage,
};
