/**
 * 设备检测和适配模块
 */

import { animationConfig } from "./theme.js";

import { RENDER_CONSTANTS } from "../utils/constants.js";

// 断点系统 - 移动端样式断点和侧栏收起断点分离
const BREAKPOINT_MOBILE = 480; // 移动端样式断点
const BREAKPOINT_SIDEBAR = 1024; // 侧栏收起断点

const getDeviceType = () => {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const isTouchDevice =
		"ontouchstart" in window || navigator.maxTouchPoints > 0;

	// 手机设备（包括横屏）优先使用移动端样式
	if (isTouchDevice && (width < BREAKPOINT_MOBILE || height < RENDER_CONSTANTS.MOBILE_HEIGHT_BREAKPOINT)) {
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

// 更新侧边栏状态的函数
const updateSidebarVisibility = (
	sidebar,
	isCollapsed,
	skipAnimation = false,
) => {
	sidebar.classList.toggle("collapsed", isCollapsed);

	// 处理文件夹的动画，但主页按钮的可见性完全由CSS控制

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

// 检查面包屑导航是否可滚动
const checkBreadcrumbsScroll = () => {
	const breadcrumbs = document.getElementById("breadcrumbs");
	if (!breadcrumbs) return;

	const isScrollable = breadcrumbs.scrollWidth > breadcrumbs.clientWidth;
	breadcrumbs.classList.toggle("scrollable", isScrollable);
};

// 封装侧边栏状态管理
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

	// 标记JavaScript已初始化，禁用CSS默认状态
	if (sidebar) {
		sidebar.classList.add("js-initialized");
	}
	if (toggleButton) {
		toggleButton.classList.add("js-initialized");
	}

	// 设置初始状态
	if (sidebar) {
		updateSidebarState(sidebar, shouldCollapse, true);
	}
};

export {
	BREAKPOINT_MOBILE,
	BREAKPOINT_SIDEBAR,
	getDeviceType,
	isMobileDevice,
	isTabletDevice,
	isDesktopDevice,
	shouldCollapseSidebar,
	updateSidebarVisibility,
	checkBreadcrumbsScroll,
	updateSidebarState,
	handleDeviceView,
};
