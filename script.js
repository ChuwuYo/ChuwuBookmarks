import { initTheme } from './assets/js/modules/render/theme.js';
import { handleDeviceView, adjustSearchContainerPosition } from './assets/js/modules/render/device.js';
import { renderHome } from './assets/js/modules/render/home.js';
import { renderMainContent as _renderMainContent } from './assets/js/modules/render/content.js';
import { initSearchWorker, createSearchHandler } from './assets/js/modules/search/index.js';
import { showLoadingIndicator, loadBookmarksData } from './assets/js/modules/loader/index.js';
import { initEventListeners } from './assets/js/modules/listener/index.js';

// 创建包装函数解决循环依赖
const renderMainContent = (folder, fromSidebar = false) => {
    return _renderMainContent(folder, fromSidebar, renderHome);
};

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化主题和设备视图
    initTheme();
    handleDeviceView();

    // 立即调整搜索容器位置
    setTimeout(adjustSearchContainerPosition, 0);



    // 初始化搜索Web Worker
    initSearchWorker(renderMainContent);
    
    // 创建搜索处理函数
    const debounceSearch = createSearchHandler();

    // 显示加载指示器
    showLoadingIndicator();

    try {
        // 使用requestAnimationFrame优化初始化流程
        requestAnimationFrame(async () => {
            await loadBookmarksData(renderMainContent);
        });
    } catch (error) {
        console.error('初始化错误:', error);
        setTimeout(() => showErrorMessage(error), 10);
    }

    // 初始化所有事件监听器
    initEventListeners(debounceSearch);
})