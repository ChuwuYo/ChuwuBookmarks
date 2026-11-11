const SELECTORS = {
	HOME_MESSAGE: ".home-message",
	NO_RESULTS: ".no-results",
	ERROR_MESSAGE: ".error-message",
	LOADING: ".loading",
};

const clearElements = (selectors) => {
	const list = Array.isArray(selectors) ? selectors : [selectors];
	list.forEach((selector) => {
		document.querySelectorAll(selector).forEach((el) => {
			el.remove();
		});
	});
};

const clearAllMessages = () => {
	clearElements([
		SELECTORS.HOME_MESSAGE,
		SELECTORS.NO_RESULTS,
		SELECTORS.ERROR_MESSAGE,
		SELECTORS.LOADING,
	]);
};

/** 用统一的加载提示替换 container 的内容 */
const renderLoading = (container, text) => {
	if (!container) return;

	const loading = document.createElement("div");
	loading.className = "loading";
	loading.setAttribute("role", "status");

	const spinner = document.createElement("div");
	spinner.className = "loading-spinner";
	spinner.setAttribute("aria-hidden", "true");

	const label = document.createElement("p");
	label.className = "loading-text";
	label.textContent = text;

	loading.append(spinner, label);
	container.replaceChildren(loading);
};

const showErrorMessage = (error) => {
	clearElements([
		SELECTORS.HOME_MESSAGE,
		SELECTORS.NO_RESULTS,
		SELECTORS.LOADING,
	]);

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
};

const showNoResultsMessage = (contentEl) => {
	if (!contentEl) return;

	clearElements([SELECTORS.HOME_MESSAGE, SELECTORS.NO_RESULTS]);

	const noResults = document.createElement("div");
	noResults.className =
		"centered-message no-results centered-element vertical-center";
	noResults.textContent = "未找到匹配的书签";

	contentEl.replaceChildren(noResults);
};

export {
	clearAllMessages,
	renderLoading,
	showErrorMessage,
	showNoResultsMessage,
};
