import { isSidebarOverlay, onChange } from "../utils/viewport.js";

let entrance = 0;

const playFolderEntrance = (sidebar) => {
	const id = ++entrance;
	sidebar.dataset.entering = "";
	const running = sidebar
		.getAnimations({ subtree: true })
		.filter((animation) => animation.animationName === "enter")
		.map((animation) => animation.finished);
	Promise.allSettled(running).then(() => {
		if (id === entrance) delete sidebar.dataset.entering;
	});
};

const updateSidebarState = (sidebar, isCollapsed, skipAnimation = false) => {
	sidebar.querySelector("bm-sidebar").collapsed = isCollapsed;

	if (isCollapsed || skipAnimation) {
		entrance++;
		delete sidebar.dataset.entering;
	} else {
		playFolderEntrance(sidebar);
	}
};

const closeSidebarOverlay = () => {
	if (isSidebarOverlay()) {
		updateSidebarState(document.querySelector(".sidebar"), true);
	}
};

const initSidebarState = () => {
	const sidebar = document.querySelector(".sidebar");
	updateSidebarState(sidebar, isSidebarOverlay(), true);
	onChange("sidebarOverlay", (overlay) =>
		updateSidebarState(sidebar, overlay, true),
	);
};

export { closeSidebarOverlay, initSidebarState, updateSidebarState };
