import { RENDER_CONSTANTS } from "../utils/constants.js";
import { animationConfig } from "./theme.js";

const BREAKPOINT_MOBILE = 480;
const BREAKPOINT_SIDEBAR = 1024;

const getDeviceType = () => {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const isTouchDevice =
		"ontouchstart" in window || navigator.maxTouchPoints > 0;

	if (
		isTouchDevice &&
		(width < BREAKPOINT_MOBILE ||
			height < RENDER_CONSTANTS.MOBILE_HEIGHT_BREAKPOINT)
	) {
		return "mobile";
	}

	if (width < BREAKPOINT_MOBILE) {
		return "mobile";
	} else if (width < BREAKPOINT_SIDEBAR) {
		return "tablet";
	} else {
		return "desktop";
	}
};

const isMobileDevice = () => getDeviceType() === "mobile";
const isTabletDevice = () => getDeviceType() === "tablet";
const isDesktopDevice = () => getDeviceType() === "desktop";
const shouldCollapseSidebar = () => window.innerWidth < BREAKPOINT_SIDEBAR;

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
			folderElements.forEach((folder, index) => {
				gsap.to(folder, {
					opacity: 1,
					delay: index * RENDER_CONSTANTS.SIDEBAR_ANIMATION_STAGGER,
					duration: animationConfig.duration.medium,
					ease: animationConfig.ease.outQuad,
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

const handleDeviceView = () => {
	const sidebar = document.querySelector(".sidebar");
	const toggleButton = document.getElementById("toggle-sidebar");
	const deviceType = getDeviceType();
	const shouldCollapse = shouldCollapseSidebar();

	document.body.classList.toggle("mobile-device", deviceType === "mobile");
	document.body.classList.toggle("tablet-device", deviceType === "tablet");
	document.body.classList.toggle("desktop-device", deviceType === "desktop");

	if (sidebar) {
		sidebar.classList.add("js-initialized");
	}
	if (toggleButton) {
		toggleButton.classList.add("js-initialized");
	}

	if (sidebar) {
		updateSidebarState(sidebar, shouldCollapse, true);
	}
};

export {
	BREAKPOINT_MOBILE,
	BREAKPOINT_SIDEBAR,
	checkBreadcrumbsScroll,
	getDeviceType,
	handleDeviceView,
	isDesktopDevice,
	isMobileDevice,
	isTabletDevice,
	shouldCollapseSidebar,
	updateSidebarState,
	updateSidebarVisibility,
};
