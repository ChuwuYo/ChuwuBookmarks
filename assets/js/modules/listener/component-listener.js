import { renderMainContent } from "../render/content.js";
import { renderHome } from "../render/home.js";
import { showSearchPage } from "../render/search.js";
import {
	closeSidebarOverlay,
	updateSidebarState,
} from "../render/sidebar-state.js";

const initComponentListeners = (debounceSearch) => {
	document.addEventListener("bm-open-folder", (event) => {
		closeSidebarOverlay();
		renderMainContent(event.detail.item);
	});

	document.addEventListener("bm-navigate", (event) => {
		const { index } = event.detail;
		closeSidebarOverlay();
		if (index < 0) renderHome();
		else renderMainContent(event.target.path[index]);
	});

	document.addEventListener("bm-page-change", (event) =>
		showSearchPage(event.detail.page),
	);

	document.addEventListener("bm-search", (event) =>
		debounceSearch(event.detail.query),
	);

	document.addEventListener("bm-sidebar-toggle", (event) => {
		updateSidebarState(
			event.target.closest(".sidebar"),
			event.detail.collapsed,
		);
	});
};

export { initComponentListeners };
