/**
 * 事件监听模块
 */

import { toggleTheme } from '../render/theme.js';
import { isMobileDevice, handleDeviceView, updateSidebarState, adjustSearchContainerPosition } from '../render/device.js';
import { renderHome } from '../render/home.js';
import { debounce } from '../utils/index.js';

// 设置侧边栏切换事件
const setupSidebarToggle = () => {
    const toggleSidebar = document.getElementById('toggle-sidebar');

    if (toggleSidebar) {
        // 合并点击和键盘事件处理
        const toggleSidebarHandler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                e.stopPropagation();
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
                }
            }
        };

        toggleSidebar.addEventListener('click', toggleSidebarHandler);
        toggleSidebar.addEventListener('keydown', toggleSidebarHandler);
    }
};

// 设置主题切换事件
const setupThemeToggle = () => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // 合并点击和键盘事件处理
        const themeToggleHandler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                toggleTheme();
            }
        };

        themeToggle.addEventListener('click', themeToggleHandler);
        themeToggle.addEventListener('keydown', themeToggleHandler);
    }
};

// 设置搜索相关事件
const setupSearchEvents = (debounceSearch) => {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // 搜索框事件处理
        searchInput.addEventListener('input', debounceSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                debounceSearch(e);
            }
        });

        // 添加Ctrl+K快捷键聚焦搜索框功能
        document.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                document.getElementById('search-input').focus();
            }
        });

        // 优化的resize处理 - 不重新渲染，只调整布局
        const handleResize = debounce(() => {
            handleDeviceView();
            adjustSearchContainerPosition();
        }, 100);

        // 添加 resize 监听
        window.addEventListener('resize', handleResize);

        // 初始化时执行一次
        handleResize();

        // 监听主题切换，因为可能影响布局
        document.addEventListener('themechange', adjustSearchContainerPosition);

        // 监听侧边栏状态变化
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        adjustSearchContainerPosition();
                    }
                });
            });
            observer.observe(sidebar, { attributes: true });
        }
    }
};

// 设置主页按钮事件
const setupHomeButton = () => {
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
        let isProcessing = false;
        
        const handleHomeNavigation = () => {
            // 防止重复点击导致的卡顿
            if (isProcessing) return;
            
            isProcessing = true;
            
            // 手机端点击主页按钮时自动收起侧栏
            if (isMobileDevice()) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    updateSidebarState(sidebar, true);
                }
            }
            
            // 使用 requestAnimationFrame 延迟执行渲染，避免阻塞
            requestAnimationFrame(() => {
                renderHome();
                // 确保在下一帧重置状态
                requestAnimationFrame(() => {
                    isProcessing = false;
                });
            });
        };

        homeButton.addEventListener('click', handleHomeNavigation);
        homeButton.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHomeNavigation();
            }
        });
    }
};

// 设置标题变更功能
const setupTitleChange = () => {
    const originalTitle = document.title;
    const newTitle = "你要离开我了吗ヽ(*。>Д<)o゜";

    // 鼠标离开页面时触发的事件
    document.addEventListener('mouseout', function (e) {
        // 仅当鼠标离开窗口时进行处理
        if (e.relatedTarget === null) {
            document.title = newTitle;
        }
    });

    // 鼠标回到页面时触发的事件
    document.addEventListener('mouseover', function () {
        document.title = originalTitle;
    });
};

// 初始化所有事件监听器
const initEventListeners = (debounceSearch) => {
    setupSidebarToggle();
    setupThemeToggle();
    setupSearchEvents(debounceSearch);
    setupHomeButton();
    setupTitleChange();
};

export { initEventListeners };