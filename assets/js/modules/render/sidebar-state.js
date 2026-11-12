import { isSidebarOverlay, onChange } from "../utils/viewport.js";

let entrance = 0;

/** 展开时文件夹按 --item-index 依次淡入，动画结束后移除 data-entering */
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

/**
 * 按侧边栏断点设定初始收起状态；之后只在跨过断点时自动收起或展开，
 * 同一布局内的手动切换不受窗口尺寸变化影响。
 */
const initSidebarState = () => {
	const sidebar = document.querySelector(".sidebar");
	updateSidebarState(sidebar, isSidebarOverlay(), true);
	onChange("sidebarOverlay", (overlay) =>
		updateSidebarState(sidebar, overlay, true),
	);
};

export { closeSidebarOverlay, initSidebarState, updateSidebarState };
