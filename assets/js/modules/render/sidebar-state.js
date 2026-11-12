import { durationS, GSAP_EASE } from "../utils/motion.js";
import { isSidebarOverlay, onChange } from "../utils/viewport.js";

const updateSidebarVisibility = (
	sidebar,
	isCollapsed,
	skipAnimation = false,
) => {
	sidebar.classList.toggle("collapsed", isCollapsed);

	const folderElements = sidebar.querySelectorAll(".folder");
	if (folderElements && folderElements.length > 0) {
		if (isCollapsed) {
			gsap.set(folderElements, { opacity: 0, visibility: "hidden" });
		} else if (!skipAnimation) {
			gsap.set(folderElements, { opacity: 0, visibility: "visible" });
			const stagger = durationS("--stagger-step");
			const duration = durationS("--duration-4");
			folderElements.forEach((folder, index) => {
				gsap.to(folder, {
					opacity: 1,
					delay: index * stagger,
					duration,
					ease: GSAP_EASE.out,
				});
			});
		} else {
			gsap.set(folderElements, { opacity: 1, visibility: "visible" });
		}
	}
};

const checkBreadcrumbsScroll = () => {
	const breadcrumbs = document.getElementById("breadcrumbs");
	if (!breadcrumbs) return;

	const isScrollable = breadcrumbs.scrollWidth > breadcrumbs.clientWidth;
	breadcrumbs.classList.toggle("scrollable", isScrollable);
};

const updateSidebarState = (sidebar, isCollapsed, skipAnimation = false) => {
	updateSidebarVisibility(sidebar, isCollapsed, skipAnimation);
	checkBreadcrumbsScroll();
};

/**
 * 按侧边栏断点设定初始收起状态；之后只在跨过断点时自动收起或展开，
 * 同一布局内的手动切换不受窗口尺寸变化影响。
 */
const initSidebarState = () => {
	const sidebar = document.querySelector(".sidebar");
	if (!sidebar) return;

	sidebar.classList.add("js-initialized");
	updateSidebarState(sidebar, isSidebarOverlay(), true);
	onChange("sidebarOverlay", (overlay) =>
		updateSidebarState(sidebar, overlay, true),
	);

	const breadcrumbs = document.getElementById("breadcrumbs");
	if (breadcrumbs && typeof ResizeObserver !== "undefined") {
		new ResizeObserver(checkBreadcrumbsScroll).observe(breadcrumbs);
	}
};

export { initSidebarState, updateSidebarState };
