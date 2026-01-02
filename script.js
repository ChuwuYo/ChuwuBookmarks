import { initTheme } from './assets/js/modules/render/theme.js';
import { handleDeviceView, BREAKPOINT_MOBILE } from './assets/js/modules/render/device.js';
import { renderHome } from './assets/js/modules/render/home.js';
import { renderMainContent as _renderMainContent } from './assets/js/modules/render/content.js';
import { initSearchWorker, createSearchHandler, restoreSearchStateFromURL } from './assets/js/modules/search/index.js';
import { showLoadingIndicator, loadBookmarksData } from './assets/js/modules/loader/index.js';
import { initEventListeners } from './assets/js/modules/listener/index.js';
import { customScrollIndicator } from './assets/js/modules/utils/scroll-indicator.js';
import { initSidebarScrollHint } from './assets/js/modules/utils/sidebar-scroll-hint.js';

// 创建包装函数解决循环依赖
const renderMainContent = (folder, fromSidebar = false) => {
    return _renderMainContent(folder, fromSidebar, renderHome);
};

// 立即开始加载书签数据并显示加载指示器，确保一旦读取到书签数据就能立即渲染主页
showLoadingIndicator();
loadBookmarksData(renderMainContent).catch((error) => {
    console.error('加载书签数据失败:', error);
});
/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化主题和设备视图
    initTheme();
    handleDeviceView();

    // 初始化自定义滚动条指示器（仅桌面端）
    if (window.innerWidth >= BREAKPOINT_MOBILE) {
        customScrollIndicator.init();
    }

    // 初始化侧边栏滚动提示器（所有设备）
    initSidebarScrollHint();



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
    
    // 加载已在脚本入口立即开始，避免等待 DOMContentLoaded 完成
    // loadBookmarksData 在脚本最开始处已被调用并处理错误

    // 初始化所有事件监听器
    initEventListeners(debounceSearch);

    // 从URL恢复搜索状态（在搜索Worker准备就绪后）
    if (searchWorkerReady) {
        restoreSearchStateFromURL();
    }
})