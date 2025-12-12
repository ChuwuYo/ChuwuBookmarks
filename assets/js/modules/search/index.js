/**
 * 搜索功能模块
 *
 * 本模块负责处理搜索功能的核心逻辑，包括：
 * - Web Worker搜索处理
 * - 分页状态管理
 * - URL状态保持
 * - 响应式系统初始化
 *
 * 分页集成说明：
 * - 新搜索时自动重置分页状态到第一页
 * - 支持从URL恢复搜索和分页状态
 * - 与分页控件的响应式系统完全集成
 *
 * 性能优化：
 * - 使用Web Worker进行搜索，避免阻塞主线程
 * - 搜索结果缓存，提升重复搜索的响应速度
 * - 防抖处理，避免频繁搜索请求
 */
 
import { renderHome } from '../render/home.js';
import { renderSearchResults, resetSearchPagination } from '../render/search.js';
import { debounce } from '../utils/index.js';
import { initializeResponsiveSystem } from '../pagination/responsive.js';
import { getCenteringManager } from '../utils/centering.js';
import { getDeviceType } from '../render/device.js';
import { 
    getSearchWorkerWrapper, 
    getDataWorkerWrapper,
    isWorkerSupported 
} from '../worker/index.js';
 
// 清除所有Worker缓存
const clearWorkerCaches = () => {
    const searchWorkerWrapper = getSearchWorkerWrapper();
    searchWorkerWrapper.postMessage({ action: 'clearCache' });
};
 
// 检查浏览器是否支持Web Worker并初始化
const initSearchWorker = (renderMainContent) => {
    // 初始化响应式系统
    initializeResponsiveSystem();
    
    // 确保统一居中系统已初始化并注册搜索容器
    const centeringManager = getCenteringManager();
    if (!centeringManager.isInitialized) {
        centeringManager.initialize();
    }
    
    if (!isWorkerSupported()) {
        console.warn('浏览器不支持 Web Worker，搜索功能将不可用');
        return;
    }

    // 从统一的 Worker 管理模块获取搜索 Worker 包装器
    const searchWorkerWrapper = getSearchWorkerWrapper();
    
    // 注册搜索结果监听器
    searchWorkerWrapper.addMessageListener((e) => {
        const { action, results, message } = e.data;

        switch (action) {
            case 'searchResults':
                renderSearchResults(results, renderMainContent);
                break;
            case 'cacheCleared':
                // 缓存已清除，无需额外操作
                break;
            case 'error':
                console.error('搜索Worker错误:', message);
                break;
        }
    });

    // 从统一的 Worker 管理模块获取数据处理 Worker 包装器
    const dataWorkerWrapper = getDataWorkerWrapper();
    
    // 注册数据处理监听器
    dataWorkerWrapper.addMessageListener((e) => {
        const { action, message } = e.data;

        switch (action) {
            case 'processResult':
            case 'sortResult':
            case 'filterResult':
                // 预留扩展点
                break;
            case 'error':
                console.error('数据处理Worker错误:', message);
                break;
        }
    });
};
 
const getCachedSearchPayload = () => {
    let data = [];
    try {
        data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');
    } catch (e) {
        console.error("Failed to parse cached bookmarksData:", e);
        data = [];
    }
    let index = null;
    try {
        index = JSON.parse(localStorage.getItem('bookmarksIndex') || 'null');
    } catch (e) {
        index = null;
    }
    const indexHash = localStorage.getItem('bookmarksHash') || null;
    return { bookmarks: data, index, indexHash };
};

const postSearchToWorker = (keyword, useCache = true) => {
    const payload = getCachedSearchPayload();
    const searchWorkerWrapper = getSearchWorkerWrapper();
    
    return searchWorkerWrapper.postMessage({
        action: 'search',
        data: {
            keyword,
            bookmarks: payload.bookmarks,
            index: payload.index,
            indexHash: payload.indexHash,
            useCache
        }
    });
};

const createSearchHandler = () => {
    // 仅在 handler 创建时根据缓存的数据量与设备类型计算防抖时长，避免每次输入重算导致抖动
    const payload = getCachedSearchPayload();
    const bookmarksCount = (payload.index || payload.bookmarks || []).length || 0;

    const computeDebounceMsSafe = (count) => {
        const DEFAULT = 250;
        const MIN = 120;
        const MAX = 500;
        try {
            // 使用统一的设备检测函数
            const isMobile = getDeviceType() === 'mobile';
            let ms;
            if (!count || count < 2000) ms = isMobile ? 180 : 140;
            else if (count < 5000) ms = isMobile ? 260 : 200;
            else if (count < 20000) ms = isMobile ? 380 : 300;
            else ms = 500;
            ms = Math.max(MIN, Math.min(MAX, ms));
            return ms;
        } catch (e) {
            return DEFAULT;
        }
    };

    const debounceMs = computeDebounceMsSafe(bookmarksCount);

    return debounce((event) => {
        const keyword = event.target.value.trim();
        if (!keyword) {
            // 搜索框为空时返回主页，不重新渲染侧边栏
            renderHome();
            // 重置分页状态
            resetPaginationState();
            return;
        }
 
        // 新搜索时重置分页状态到第一页
        resetPaginationState();
 
        // 显示加载指示器
        const content = document.getElementById('content');
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.style.textAlign = 'center';
        loadingIndicator.style.marginTop = '50px';
        loadingIndicator.style.color = 'var(--text-color)';
 
        const heading = document.createElement('h2');
        heading.textContent = '正在搜索...';
 
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
 
        loadingIndicator.appendChild(heading);
        loadingIndicator.appendChild(spinner);
 
        content.innerHTML = '';
        content.appendChild(loadingIndicator);
 
        // 从缓存读取数据并发送给搜索Worker（如果存在）
        if (postSearchToWorker(keyword)) {
            // 已发送到worker
        } else {
            // 如果不支持Web Worker，显示错误信息
            const errorMessage = document.createElement('div');
            errorMessage.className = 'centered-message error-message centered-element vertical-center';
            errorMessage.textContent = '浏览器不支持Web Worker，无法进行搜索';
            content.innerHTML = '';

            const deviceType = getDeviceType();
            if (deviceType === 'mobile') {
                document.body.appendChild(errorMessage);
            } else {
                content.appendChild(errorMessage);
            }
            
            // 注册到统一居中系统
            const centeringManager = getCenteringManager();
            centeringManager.updateSingleElement('error-message');
        }
    }, debounceMs);
};

/**
 * 重置分页状态 - 新搜索时调用
 */
const resetPaginationState = () => {
    try {
        resetSearchPagination();
        
        // 清除URL中的分页参数
        const url = new URL(window.location);
        url.searchParams.delete('page');
        window.history.replaceState({}, document.title, url.toString());
    } catch (error) {
        console.error('重置分页状态失败:', error);
    }
};
 
/**
 * 从URL参数恢复搜索状态
 */
const restoreSearchStateFromURL = () => {
    const url = new URL(window.location);
    const keyword = url.searchParams.get('q');
 
    if (keyword) {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = keyword;
            // 触发搜索，分页状态由URL参数处理
            triggerSearch(keyword);
        }
    }
};
 
/**
 * 触发搜索
 * @param {string} keyword - 搜索关键词
 */
const triggerSearch = (keyword) => {
    postSearchToWorker(keyword);
};
 
export { clearWorkerCaches, initSearchWorker, createSearchHandler, resetPaginationState, restoreSearchStateFromURL, triggerSearch };