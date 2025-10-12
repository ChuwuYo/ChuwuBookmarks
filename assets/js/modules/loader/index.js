/**
 * 数据加载模块
 */
import { renderSidebar } from '../render/sidebar.js';
import { renderHome } from '../render/home.js';
import { clearWorkerCaches } from '../search/index.js';
import { getDeviceType } from '../render/device.js';
import { getCenteringManager } from '../utils/centering.js';

// 显示加载指示器
const showLoadingIndicator = () => {
    // 移除旧的主页消息（如果存在）
    const oldHomeMessage = document.querySelector('.home-message');
    if (oldHomeMessage) {
        // 清理观察器（如果存在）
        if (oldHomeMessage.observer) {
            oldHomeMessage.observer.disconnect();
        }
        oldHomeMessage.remove();
    }
    
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!content || !breadcrumbs) return;

    // 清空内容和面包屑
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    // 创建加载消息元素，使用与主页消息相同的类名和结构
    const loadingMessage = document.createElement('div');
    loadingMessage.className = 'home-message'; // 使用与主页相同的类名
    
    const loadingText = document.createElement('div');
    loadingText.className = 'chinese-text';
    loadingText.textContent = '正在加载书签······';
    loadingText.style.fontSize = '2rem';
    
    loadingMessage.appendChild(loadingText);
    
    // 使用CSS类而非JavaScript计算位置
    loadingMessage.classList.add('loading-indicator');
    content.appendChild(loadingMessage);
};

// 显示错误信息
const showErrorMessage = (error) => {
    // 移除旧的主页消息（如果存在）
    const oldHomeMessage = document.querySelector('.home-message');
    if (oldHomeMessage) {
        oldHomeMessage.remove();
    }
    
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    if (!content || !breadcrumbs) return;

    // 清空内容和面包屑
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    // 创建错误消息元素
    const errorMessage = document.createElement('div');
    errorMessage.className = 'centered-message error-message centered-element vertical-center';
    errorMessage.setAttribute('role', 'alert');
    errorMessage.setAttribute('aria-live', 'assertive');
    
    const errorHeading = document.createElement('div');
    errorHeading.className = 'chinese-text';
    errorHeading.textContent = '加载书签数据失败';
    errorHeading.style.fontSize = '2rem';
    errorHeading.style.marginBottom = '20px';
    
    const message1 = document.createElement('div');
    message1.className = 'english-text';
    message1.textContent = '请确保 bookmarks.json 文件存在且格式正确';
    message1.style.fontSize = '1.2rem';
    message1.style.marginBottom = '10px';
    
    const message2 = document.createElement('div');
    message2.className = 'english-text';
    message2.textContent = `错误详情: ${error.message || error || '未知错误'}`;
    message2.style.fontSize = '1rem';
    
    errorMessage.appendChild(errorHeading);
    errorMessage.appendChild(message1);
    errorMessage.appendChild(message2);
    
    // 添加到body以使用统一居中系统
    document.body.appendChild(errorMessage);
    
    // 注册到统一居中系统
    const centeringManager = getCenteringManager();
    centeringManager.updateSingleElement('error-message');
    
    // 为错误消息添加淡入动画效果
    setTimeout(() => {
        if (errorMessage) {
            errorMessage.style.opacity = '1';
        }
    }, 10);
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
                // 使用setTimeout确保在下一个事件循环中显示错误消息
                setTimeout(() => showErrorMessage(new Error(error)), 10);
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
            // 使用setTimeout确保在下一个事件循环中显示错误消息
            setTimeout(() => showErrorMessage(new Error(error.message || 'Web Worker加载失败')), 10);
        } else {
            // 如果有缓存数据，仍然渲染主页
            renderHome();
        }
        dataWorker.terminate();
    };
};

export { showLoadingIndicator, showErrorMessage, loadBookmarksData };