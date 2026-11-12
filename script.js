import "./assets/components/index.js";
import { initEventListeners } from "./assets/js/modules/listener/index.js";
import { loadBookmarksData } from "./assets/js/modules/loader/index.js";
import { renderHome } from "./assets/js/modules/render/home.js";
import { revealApp } from "./assets/js/modules/render/reveal.js";
import { initSidebarState } from "./assets/js/modules/render/sidebar-state.js";
import { initTheme } from "./assets/js/modules/render/theme.js";
import {
	createSearchHandler,
	initSearchWorker,
	restoreSearchStateFromURL,
} from "./assets/js/modules/search/index.js";
import { trackScrollActivity } from "./assets/js/modules/utils/scroll-activity.js";
import { readSearchState } from "./assets/js/modules/utils/url-state.js";

if (!readSearchState().query) renderHome();
loadBookmarksData().catch((error) => {
	console.error("加载书签数据失败:", error);
	revealApp();
});
const REVEAL_FALLBACK_DELAY = 400;
setTimeout(revealApp, REVEAL_FALLBACK_DELAY);
document.addEventListener("DOMContentLoaded", async () => {
	initTheme();
	initSidebarState();
	trackScrollActivity(document.documentElement);

	initSearchWorker();
	initEventListeners(createSearchHandler());
	restoreSearchStateFromURL();
});
