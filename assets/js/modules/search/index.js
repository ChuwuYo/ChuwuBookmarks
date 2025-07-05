/**
 * 搜索功能模块
 */

import { renderHome } from '../render/home.js';
import { renderSearchResults } from '../render/search.js';
import { debounce } from '../utils/index.js';

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

    if (dataWorker) {
        dataWorker.postMessage({
            action: 'clearCache'
        });
    }
};

// 检查浏览器是否支持Web Worker
const initSearchWorker = (renderMainContent) => {
    if (window.Worker) {
        // 初始化搜索Worker
        searchWorker = new Worker('assets/js/search-worker.js');

        // 监听来自搜索Worker的消息
        searchWorker.addEventListener('message', (e) => {
            const { action, results, message, fromCache } = e.data;

            switch (action) {
                case 'searchResults':
                    renderSearchResults(results, renderMainContent);
                    if (fromCache) {
                        console.log('使用缓存的搜索结果');
                    }
                    break;
                case 'cacheCleared':
                    console.log('搜索缓存已清除');
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
                    if (fromCache) {
                        console.log(`使用缓存的${action}结果`);
                    }
                    break;
                case 'cacheCleared':
                    console.log('数据处理缓存已清除');
                    break;
                case 'error':
                    console.error('数据处理Worker错误:', message);
                    break;
            }
        });
    }
};

const createSearchHandler = () => {
    return debounce((event) => {
        const keyword = event.target.value.trim();
        if (!keyword) {
            // 搜索框为空时返回主页，不重新渲染侧边栏
            renderHome();
            return;
        }

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

        const data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');

        if (searchWorker) {
            searchWorker.postMessage({
                action: 'search',
                data: {
                    keyword: keyword,
                    bookmarks: data,
                    useCache: true
                }
            });
        } else {
            // 如果不支持Web Worker，显示错误信息
            const content = document.getElementById('content');
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = '浏览器不支持Web Worker，无法进行搜索';
            content.innerHTML = '';
            content.appendChild(errorMessage);
        }
    }, 250);
};

export { clearWorkerCaches, initSearchWorker, createSearchHandler };