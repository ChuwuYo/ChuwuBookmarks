/**
 * 数据加载模块
 */
import { renderSidebar } from '../render/sidebar.js';
import { renderHome } from '../render/home.js';
import { clearWorkerCaches } from '../search/index.js';
import { getDeviceType } from '../render/device.js';
import { getCenteringManager } from '../utils/centering.js';
import { showLoadingMessage, showErrorMessage, clearAllMessages } from '../render/message.js';

// 显示加载指示器
const showLoadingIndicator = () => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!content || !breadcrumbs) return;
    showLoadingMessage(content, breadcrumbs);
};

// 显示错误信息

// 加载书签数据 - 使用Web Worker优化

const loadBookmarksData = async (renderMainContent) => {
    // 尝试从localStorage获取缓存数据进行即时渲染
    try {
        const cachedDataString = localStorage.getItem('bookmarksData');
        if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString);
            renderSidebar(cachedData, renderMainContent);
            renderHome();

        }
    } catch (e) {
        console.error("Failed to parse cached data:", e);
        localStorage.removeItem('bookmarksData'); // 清除损坏的缓存
    }

    // 初始化Worker
    const dataWorker = new Worker('./assets/js/data-worker.js');
    dataWorker.postMessage({ action: 'loadData' });

    dataWorker.onmessage = (event) => {
        const { status, data, index, error } = event.data;
 
        if (status === 'success') {
            const newDataString = JSON.stringify(data);
            const cachedDataString = localStorage.getItem('bookmarksData');
            const newIndexString = index ? JSON.stringify(index) : null;
            const cachedIndexString = localStorage.getItem('bookmarksIndex');
            const newHash = event.data.hash || null;
            const cachedHash = localStorage.getItem('bookmarksHash');
 
            // 仅当新数据、索引或数据哈希与缓存不同时才更新视图和缓存
            if (newHash !== cachedHash || newIndexString !== cachedIndexString) {
 
                localStorage.setItem('bookmarksData', newDataString);
                if (newIndexString) {
                    try {
                        localStorage.setItem('bookmarksIndex', newIndexString);
                    } catch (e) {
                        // 如果 localStorage 写入失败，不阻塞渲染
                        console.warn('Failed to cache bookmarksIndex:', e);
                    }
                }
                if (newHash) {
                    try {
                        localStorage.setItem('bookmarksHash', newHash);
                    } catch (e) {
                        console.warn('Failed to cache bookmarksHash:', e);
                    }
                }
                clearWorkerCaches(); // 假设这会清除其他相关缓存
                renderSidebar(data, renderMainContent);
                renderHome();
            }
        } else if (status === 'error') {
            console.error('Worker failed to load data:', error);
            // 只有在没有缓存数据可显示时才显示错误信息
            if (!localStorage.getItem('bookmarksData')) {
                // 使用 setTimeout 确保在下一个事件循环中显示错误消息，并保持与居中系统的集成
                setTimeout(() => {
                    showErrorMessage(new Error(error));
                    const centeringManager = getCenteringManager();
                    centeringManager.updateSingleElement('error-message');
                }, 10);
            } else {
                // 如果有缓存数据，仍然渲染主页
                renderHome();
            }
        }

        dataWorker.terminate(); // 清理Worker
    };

    dataWorker.onerror = (error) => {
        console.error('Data Worker encountered an error:', error);
        if (!localStorage.getItem('bookmarksData')) {
            // 使用 setTimeout 确保在下一个事件循环中显示错误消息，并保持与居中系统的集成
            setTimeout(() => {
                showErrorMessage(new Error(error.message || 'Web Worker加载失败'));
                const centeringManager = getCenteringManager();
                centeringManager.updateSingleElement('error-message');
            }, 10);
        } else {
            // 如果有缓存数据，仍然渲染主页
            renderHome();
        }
        dataWorker.terminate();
    };
};

export { showLoadingIndicator, showErrorMessage, loadBookmarksData };