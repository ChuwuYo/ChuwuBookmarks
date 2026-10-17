import "./assets/components/index.js";
import { initEventListeners } from "./assets/js/modules/listener/index.js";
import {
	loadBookmarksData,
	showLoadingIndicator,
} from "./assets/js/modules/loader/index.js";
import { renderMainContent as _renderMainContent } from "./assets/js/modules/render/content.js";
import {
	BREAKPOINT_MOBILE,
	handleDeviceView,
} from "./assets/js/modules/render/device.js";
import { renderHome } from "./assets/js/modules/render/home.js";
import { revealApp } from "./assets/js/modules/render/reveal.js";
import { initTheme } from "./assets/js/modules/render/theme.js";
import {
	createSearchHandler,
	initSearchWorker,
	restoreSearchStateFromURL,
} from "./assets/js/modules/search/index.js";
import { customScrollIndicator } from "./assets/js/modules/utils/scroll-indicator.js";
import { initSidebarScrollHint } from "./assets/js/modules/utils/sidebar-scroll-hint.js";

// 创建包装函数解决循环依赖
const renderMainContent = (folder, fromSidebar = false) => {
	return _renderMainContent(folder, fromSidebar, renderHome);
};

showLoadingIndicator();
loadBookmarksData(renderMainContent).catch((error) => {
	console.error("加载书签数据失败:", error);
	revealApp();
});
const REVEAL_FALLBACK_DELAY = 400;
setTimeout(revealApp, REVEAL_FALLBACK_DELAY);
document.addEventListener("DOMContentLoaded", async () => {
	initTheme();
	handleDeviceView();

	if (window.innerWidth >= BREAKPOINT_MOBILE) {
		customScrollIndicator.init();
	}

	initSidebarScrollHint();

	let searchWorkerReady = false;
	try {
		initSearchWorker(renderMainContent);
		searchWorkerReady = true;
	} catch (error) {
		console.error("搜索和分页功能初始化失败:", error);
	}

	const debounceSearch = createSearchHandler();

	initEventListeners(debounceSearch);

	if (searchWorkerReady) {
		restoreSearchStateFromURL();
	}
});
