import "./assets/components/index.js";
import { initEventListeners } from "./assets/js/modules/listener/index.js";
import {
	loadBookmarksData,
	showLoadingIndicator,
} from "./assets/js/modules/loader/index.js";
import { renderMainContent as _renderMainContent } from "./assets/js/modules/render/content.js";
import { renderHome } from "./assets/js/modules/render/home.js";
import { revealApp } from "./assets/js/modules/render/reveal.js";
import { initSidebarState } from "./assets/js/modules/render/sidebar-state.js";
import { initTheme } from "./assets/js/modules/render/theme.js";
import {
	createSearchHandler,
	initSearchWorker,
	restoreSearchStateFromURL,
} from "./assets/js/modules/search/index.js";
import { customScrollIndicator } from "./assets/js/modules/utils/scroll-indicator.js";
import { isNarrow } from "./assets/js/modules/utils/viewport.js";

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
	initSidebarState();

	if (!isNarrow()) {
		customScrollIndicator.init();
	}

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
