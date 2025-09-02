import { initTheme } from './assets/js/modules/render/theme.js';
import { handleDeviceView } from './assets/js/modules/render/device.js';
import { renderHome } from './assets/js/modules/render/home.js';
import { renderMainContent as _renderMainContent } from './assets/js/modules/render/content.js';
import { initSearchWorker, createSearchHandler, restoreSearchStateFromURL } from './assets/js/modules/search/index.js';
import { showLoadingIndicator, loadBookmarksData } from './assets/js/modules/loader/index.js';
import { initEventListeners } from './assets/js/modules/listener/index.js';
import { customScrollIndicator } from './assets/js/modules/utils/scroll-indicator.js';

// 创建包装函数解决循环依赖
const renderMainContent = (folder, fromSidebar = false) => {
    return _renderMainContent(folder, fromSidebar, renderHome);
};

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化主题和设备视图
    initTheme();
    handleDeviceView();
    
    // 初始化自定义滚动条指示器（仅非手机端）
    if (window.innerWidth >= 480) {
        customScrollIndicator.init();
    }



    // 初始化搜索Web Worker（包含分页功能集成）
    let searchWorkerReady = false;
    try {
        initSearchWorker(renderMainContent);
        searchWorkerReady = true;
    } catch (error) {
        console.error('搜索和分页功能初始化失败:', error);
    }

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

    // 从URL恢复搜索状态（在搜索Worker准备就绪后）
    if (searchWorkerReady) {
        restoreSearchStateFromURL();
    }
})