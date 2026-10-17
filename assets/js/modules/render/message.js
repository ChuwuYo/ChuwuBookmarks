const SELECTORS = {
	HOME_MESSAGE: ".home-message",
	NO_RESULTS: ".no-results",
	ERROR_MESSAGE: ".error-message",
};

const clearElements = (selectors) => {
	const list = Array.isArray(selectors) ? selectors : [selectors];
	list.forEach((selector) => {
		document.querySelectorAll(selector).forEach((el) => {
			if (el.observer && typeof el.observer.disconnect === "function") {
				el.observer.disconnect();
			}
			el.remove();
		});
	});
};

const clearAllMessages = () => {
	clearElements([
		SELECTORS.HOME_MESSAGE,
		SELECTORS.NO_RESULTS,
		SELECTORS.ERROR_MESSAGE,
	]);
};

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
};

const showNoResultsMessage = (contentEl) => {
	if (!contentEl) return;

	clearElements([SELECTORS.HOME_MESSAGE, SELECTORS.NO_RESULTS]);

	const noResults = document.createElement("div");
	noResults.className =
		"centered-message no-results centered-element vertical-center";
	noResults.textContent = "未找到匹配的书签";

	contentEl.innerHTML = "";
	contentEl.appendChild(noResults);
};

export {
	clearAllMessages,
	showErrorMessage,
	showLoadingMessage,
	showNoResultsMessage,
};
