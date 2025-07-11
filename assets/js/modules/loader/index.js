/**
 * 数据加载模块
 */

import { renderSidebar } from '../render/sidebar.js';
import { renderHome } from '../render/home.js';
import { clearWorkerCaches } from '../search/index.js';

// 显示加载指示器
const showLoadingIndicator = () => {
    const content = document.getElementById('content');
    if (!content) return;

    // 使用DOM API创建加载指示器，避免innerHTML解析
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.style.textAlign = 'center';
    loadingIndicator.style.marginTop = '50px';
    loadingIndicator.style.color = 'var(--text-color)';

    const heading = document.createElement('h2');
    heading.textContent = '正在加载书签数据...';

    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';

    loadingIndicator.appendChild(heading);
    loadingIndicator.appendChild(spinner);

    content.innerHTML = '';
    content.appendChild(loadingIndicator);
};

// 显示错误信息
const showErrorMessage = (error) => {
    const content = document.getElementById('content');
    if (!content) return;

    // 使用DOM API创建错误消息，避免innerHTML解析
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';

    const heading = document.createElement('h2');
    heading.textContent = '加载书签数据失败';

    const message1 = document.createElement('p');
    message1.textContent = '请确保 bookmarks.json 文件存在且格式正确';

    const message2 = document.createElement('p');
    message2.textContent = `错误详情: ${error.message}`;

    errorMessage.appendChild(heading);
    errorMessage.appendChild(message1);
    errorMessage.appendChild(message2);

    content.innerHTML = '';
    content.appendChild(errorMessage);
};

// 加载书签数据 - 使用Web Worker优化

const loadBookmarksData = async (renderMainContent) => {
    // 尝试从localStorage获取缓存数据进行即时渲染
    try {
        const cachedDataString = localStorage.getItem('bookmarksData');
        if (cachedDataString) {
            const cachedData = JSON.parse(cachedDataString);
            renderSidebar(cachedData, renderMainContent);
            renderHome();
            console.log("Rendered initial view from cache.");
        }
    } catch (e) {
        console.error("Failed to parse cached data:", e);
        localStorage.removeItem('bookmarksData'); // 清除损坏的缓存
    }

    // 初始化Worker
    const dataWorker = new Worker('./assets/js/data-worker.js');
    dataWorker.postMessage({ action: 'loadData' });

    dataWorker.onmessage = (event) => {
        const { status, data, error } = event.data;

        if (status === 'success') {
            const newDataString = JSON.stringify(data);
            const cachedDataString = localStorage.getItem('bookmarksData');

            // 仅当新数据与缓存数据不同时才更新视图和缓存。
            if (newDataString !== cachedDataString) {
                console.log("New data received. Updating view and cache.");
                localStorage.setItem('bookmarksData', newDataString);
                clearWorkerCaches(); // 假设这会清除其他相关缓存
                renderSidebar(data, renderMainContent);
                renderHome();
            } else {
                console.log("Data is already up-to-date.");
            }
        } else if (status === 'error') {
            console.error('Worker failed to load data:', error);
            // 只有在没有缓存数据可显示时才显示错误信息
            if (!localStorage.getItem('bookmarksData')) {
                showErrorMessage(new Error(error));
            }
        }

        dataWorker.terminate(); // 清理Worker
    };

    dataWorker.onerror = (error) => {
        console.error('Data Worker encountered an error:', error);
        if (!localStorage.getItem('bookmarksData')) {
            showErrorMessage(error);
        }
        dataWorker.terminate();
    };
};

export { showLoadingIndicator, showErrorMessage, loadBookmarksData };