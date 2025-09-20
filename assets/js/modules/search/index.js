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
 
// 初始化Web Worker
let searchWorker;
let dataWorker;
 
// 清除所有Worker缓存
const clearWorkerCaches = () => {
    if (searchWorker) {
        searchWorker.postMessage({
            action: 'clearCache'
        });
    }
};
 
// 检查浏览器是否支持Web Worker
const initSearchWorker = (renderMainContent) => {
    // 初始化响应式系统
    initializeResponsiveSystem();
    
    // 确保统一居中系统已初始化并注册搜索容器
    const centeringManager = getCenteringManager();
    if (!centeringManager.isInitialized) {
        centeringManager.initialize();
    }
    
    if (window.Worker) {
        // 初始化搜索Worker
        searchWorker = new Worker('assets/js/search-worker.js');
 
        // 监听来自搜索Worker的消息
        searchWorker.addEventListener('message', (e) => {
            const { action, results, message, fromCache } = e.data;
 
            switch (action) {
                case 'searchResults':
                    renderSearchResults(results, renderMainContent);
                    break;
                case 'cacheCleared':
                    break;
                case 'error':
                    console.error('搜索Worker错误:', message);
                    break;
            }
        });
 
        // 初始化数据处理Worker
        dataWorker = new Worker('assets/js/data-worker.js');
 
        // 监听来自数据Worker的消息
        dataWorker.addEventListener('message', (e) => {
            const { action, result, message, fromCache } = e.data;
 
            switch (action) {
                case 'processResult':
                case 'sortResult':
                case 'filterResult':
                    break;
                case 'error':
                    console.error('数据处理Worker错误:', message);
                    break;
            }
        });
    }
};
 
const getCachedSearchPayload = () => {
    const data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');
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
    if (searchWorker) {
        searchWorker.postMessage({
            action: 'search',
            data: {
                keyword,
                bookmarks: payload.bookmarks,
                index: payload.index,
                indexHash: payload.indexHash,
                useCache
            }
        });
        return true;
    }
    return false;
};

const createSearchHandler = () => {
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
            const content = document.getElementById('content');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'centered-message error-message centered-element vertical-center';
            errorMessage.textContent = '浏览器不支持Web Worker，无法进行搜索';
            content.innerHTML = '';
            document.body.appendChild(errorMessage);
            
            // 注册到统一居中系统
            const centeringManager = getCenteringManager();
            centeringManager.updateSingleElement('error-message');
        }
    }, 250);
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