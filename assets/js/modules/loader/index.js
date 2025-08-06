/**
 * 数据加载模块
 */

import { renderSidebar } from '../render/sidebar.js';
import { renderHome } from '../render/home.js';
import { clearWorkerCaches } from '../search/index.js';
import { getDeviceType, adjustHomeMessagePosition } from '../render/device.js';

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
    
    const deviceType = getDeviceType();
    if (deviceType === 'mobile') {
        // 移动端：附加到body并居中
        document.body.appendChild(loadingMessage);
        loadingMessage.classList.add('mobile-home-message');
        loadingMessage.style.cssText = `
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 400px;
            text-align: center;
        `;
    } else {
        // 桌面端：添加到内容区域
        content.appendChild(loadingMessage);
        // 调整位置与主页消息保持一致
        const isCollapsed = document.querySelector('.sidebar')?.classList.contains('collapsed');
        adjustHomeMessagePosition(isCollapsed);
    }
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

    // 创建错误消息元素，使用与主页消息相同的类名和结构
    const errorMessage = document.createElement('div');
    errorMessage.className = 'home-message'; // 使用与主页相同的类名
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
    
    const deviceType = getDeviceType();
    if (deviceType === 'mobile') {
        // 移动端：附加到body并居中
        document.body.appendChild(errorMessage);
        errorMessage.classList.add('mobile-home-message');
        errorMessage.style.cssText = `
            position: fixed;
            top: 45%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 90%;
            max-width: 400px;
            text-align: center;
        `;
    } else {
        // 桌面端：添加到内容区域
        content.appendChild(errorMessage);
        // 确保在DOM更新后调整位置
        setTimeout(() => {
            const isCollapsed = document.querySelector('.sidebar')?.classList.contains('collapsed');
            adjustHomeMessagePosition(isCollapsed);
        }, 0);
    }
    
    // 为错误消息添加淡入动画效果
    setTimeout(() => {
        if (errorMessage) {
            errorMessage.style.opacity = '1';
        }
    }, 10);
    
    // 监听侧边栏状态变化，确保错误消息能跟随侧边栏一起移动
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && deviceType !== 'mobile') {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    // 使用防抖动确保不会过于频繁地调整位置
                    clearTimeout(errorMessage.adjustPositionTimer);
                    errorMessage.adjustPositionTimer = setTimeout(() => {
                        const isCollapsed = sidebar.classList.contains('collapsed');
                        adjustHomeMessagePosition(isCollapsed);
                    }, 50);
                }
            });
        });
        observer.observe(sidebar, { attributes: true });
        
        // 保存观察器引用，以便在元素移除时断开连接
        errorMessage.observer = observer;
    }
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