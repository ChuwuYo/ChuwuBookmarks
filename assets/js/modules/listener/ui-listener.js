/**
 * UI交互事件监听模块
 */

import { toggleTheme } from '../render/theme.js';
import { isMobileDevice, updateSidebarState } from '../render/device.js';
import { renderHome } from '../render/home.js';

/**
 * 设置侧边栏切换事件
 */
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

/**
 * 设置主题切换事件
 */
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

/**
 * 设置主页按钮事件
 */
const setupHomeButton = () => {
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
        let isProcessing = false;

        const handleHomeNavigation = () => {
            // 防止重复点击导致的卡顿
            if (isProcessing) return;

            isProcessing = true;

            // 清空搜索框内容和URL参数
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
            }

            // 清除URL中的搜索参数
            const url = new URL(window.location);
            url.searchParams.delete('q');
            url.searchParams.delete('page');
            window.history.replaceState({}, document.title, url.toString());

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

/**
 * 初始化UI交互相关事件监听
 */
const initUIListeners = () => {
    setupSidebarToggle();
    setupThemeToggle();
    setupHomeButton();
};

export { initUIListeners };
