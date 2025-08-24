/**
 * 设备检测和适配模块
 */

import { animationConfig } from './theme.js';

// 断点系统 - 移动端样式断点和侧栏收起断点分离
const BREAKPOINT_MOBILE = 480;  // 移动端样式断点
const BREAKPOINT_SIDEBAR = 1024; // 侧栏收起断点

const getDeviceType = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // 手机设备（包括横屏）优先使用移动端样式
    if (isTouchDevice && (width < BREAKPOINT_MOBILE || height < 600)) {
        return 'mobile';
    }

    return width < BREAKPOINT_MOBILE ? 'mobile' : 'desktop';
};

const isMobileDevice = () => getDeviceType() === 'mobile';
const isDesktopDevice = () => getDeviceType() === 'desktop';
const shouldCollapseSidebar = () => window.innerWidth < BREAKPOINT_SIDEBAR;

// 更新侧边栏状态的函数
const updateSidebarVisibility = (sidebar, isCollapsed, skipAnimation = false) => {
    sidebar.classList.toggle('collapsed', isCollapsed);
    const toggleButton = document.getElementById('toggle-sidebar');
    const showPanel = toggleButton.querySelector('.show-panel');
    const hidePanel = toggleButton.querySelector('.hide-panel');
    showPanel.style.display = isCollapsed ? 'block' : 'none';
    hidePanel.style.display = isCollapsed ? 'none' : 'block';

    // 处理主页按钮的立即隐藏，但保持切换按钮可见
    const homeButton = sidebar.querySelector('.home-button');
    if (isCollapsed) {
        if (homeButton) gsap.set(homeButton, { opacity: 0, visibility: 'hidden' });
    } else {
        if (homeButton) gsap.set(homeButton, { opacity: 1, visibility: 'visible' });
    }

    const folderElements = sidebar.querySelectorAll('.folder');
    if (folderElements && folderElements.length > 0) {
        if (isCollapsed) {
            gsap.set(folderElements, { opacity: 0, visibility: 'hidden' });
        } else if (!skipAnimation) {
            gsap.set(folderElements, { opacity: 0, visibility: 'visible' });
            folderElements.forEach((folder, index) => {
                gsap.to(folder, {
                    opacity: 1,
                    delay: index * 0.05, // 减少延迟时间
                    duration: animationConfig.duration.medium,
                    ease: animationConfig.ease.outQuad
                });
            });
        } else {
            gsap.set(folderElements, { opacity: 1, visibility: 'visible' });
        }
    }
};

// 检查面包屑导航是否可滚动
const checkBreadcrumbsScroll = () => {
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!breadcrumbs) return;
    
    const isScrollable = breadcrumbs.scrollWidth > breadcrumbs.clientWidth;
    breadcrumbs.classList.toggle('scrollable', isScrollable);
};

// 调整主页消息位置 - 简化逻辑，避免与CSS过渡冲突
const adjustHomeMessagePosition = (isCollapsed) => {
    const homeMessage = document.querySelector('.home-message');
    if (!homeMessage) return;

    const deviceType = getDeviceType();
    if (deviceType === 'mobile') {
        // 移动端：设置固定位置
        homeMessage.style.left = '50%';
        homeMessage.style.transform = 'translate(-50%, -50%)';
        homeMessage.style.top = '45%';
    } else {
        // PC端：完全由CSS控制，清除所有内联样式
        homeMessage.style.removeProperty('left');
        homeMessage.style.removeProperty('transform');
        homeMessage.style.removeProperty('top');
    }
};

// 调整搜索容器位置和偏移量
const adjustSearchContainerPosition = () => {
    const searchContainer = document.querySelector('.search-container');
    const searchInput = document.getElementById('search-input');
    if (!searchContainer || !searchInput) return;

    // 移除requestAnimationFrame延迟，直接执行
    const deviceType = getDeviceType();
    if (deviceType === 'mobile') {
        searchContainer.style.removeProperty('--search-container-centering-offset');
        // 更新分页控件位置
        updatePaginationPositionIfExists();
        return;
    }

    const searchInputOffsetLeft = searchInput.offsetLeft;
    const searchInputWidth = searchInput.offsetWidth;
    const searchContainerWidth = searchContainer.offsetWidth;

    const shiftInPx = (searchContainerWidth / 2) - (searchInputOffsetLeft + searchInputWidth / 2);

    if (shiftInPx !== 0) {
        searchContainer.style.setProperty('--search-container-centering-offset', `${shiftInPx}px`);
    }
    
    // 更新分页控件位置
    updatePaginationPositionIfExists();
};

// 辅助函数：如果分页控件存在则更新其位置
const updatePaginationPositionIfExists = () => {
    // 派发布局变化事件，让监听器处理更新
    const layoutChangeEvent = new CustomEvent('layoutChange', {
        detail: {
            type: 'deviceLayoutUpdate',
            timestamp: Date.now(),
            deviceType: getDeviceType(),
            sidebarCollapsed: shouldCollapseSidebar()
        }
    });

    document.dispatchEvent(layoutChangeEvent);
};

// 封装侧边栏状态管理
const updateSidebarState = (sidebar, isCollapsed, skipAnimation = false) => {
    updateSidebarVisibility(sidebar, isCollapsed, skipAnimation);
    adjustHomeMessagePosition(isCollapsed);
    checkBreadcrumbsScroll();
};

const handleDeviceView = () => {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');
    const deviceType = getDeviceType();
    const shouldCollapse = shouldCollapseSidebar();
    
    document.body.classList.toggle('mobile-device', deviceType === 'mobile');
    document.body.classList.toggle('desktop-device', deviceType === 'desktop');
    
    // 标记JavaScript已初始化，禁用CSS默认状态
    sidebar.classList.add('js-initialized');
    toggleButton.classList.add('js-initialized');
    
    // 设置初始状态
    updateSidebarState(sidebar, shouldCollapse, true);
};

export {
    BREAKPOINT_MOBILE,
    BREAKPOINT_SIDEBAR,
    getDeviceType,
    isMobileDevice,
    isDesktopDevice,
    shouldCollapseSidebar,
    updateSidebarVisibility,
    checkBreadcrumbsScroll,
    adjustHomeMessagePosition,
    adjustSearchContainerPosition,
    updateSidebarState,
    handleDeviceView
};