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

// 加载书签数据
const loadBookmarksData = async (renderMainContent) => {
    try {
        // 首先尝试从localStorage获取缓存数据进行快速渲染
        const cachedData = localStorage.getItem('bookmarksData');
        let data;

        if (cachedData) {
            try {
                // 使用缓存数据进行初始渲染
                data = JSON.parse(cachedData);
                // 先渲染侧边栏和主页，提高用户体验
                renderSidebar(data, renderMainContent);
                renderHome();
            } catch (parseError) {
                console.error('缓存数据解析错误:', parseError);
                // 缓存数据无效，继续加载新数据
            }
        }

        // 无论是否有缓存，都异步加载最新数据
        let fetchSuccess = false;
        let newData;

        try {
            // 尝试主路径
            const response = await fetch('bookmarks.json');
            if (response.ok) {
                newData = await response.json();
                fetchSuccess = true;
            } else {
                console.error(`加载书签文件失败: ${response.status} ${response.statusText}`);
            }
        } catch (fetchError) {
            console.error('主路径加载失败:', fetchError);
        }

        // 如果主路径失败，尝试备用路径
        if (!fetchSuccess) {
            try {
                const backupResponse = await fetch('./bookmarks.json');
                if (backupResponse.ok) {
                    newData = await backupResponse.json();
                    fetchSuccess = true;
                } else {
                    console.error(`备用路径加载失败: ${backupResponse.status} ${backupResponse.statusText}`);
                }
            } catch (backupError) {
                console.error('备用路径加载失败:', backupError);
            }
        }

        // 处理加载结果
        if (fetchSuccess) {
            // 成功获取新数据
            const newDataString = JSON.stringify(newData);

            // 只在数据有变化或之前没有缓存时更新存储和视图
            if (!cachedData || newDataString !== cachedData) {
                localStorage.setItem('bookmarksData', newDataString);
                clearWorkerCaches();
                renderSidebar(newData, renderMainContent);
                renderHome();
            }
        } else if (!data) {
            // 加载失败且没有缓存数据
            throw new Error('无法加载书签文件，请确保 bookmarks.json 存在于正确位置');
        }
        // 如果加载失败但有缓存数据，继续使用缓存数据，无需额外操作

    } catch (error) {
        console.error('书签加载错误:', error);
        showErrorMessage(error);
    }
};

export { showLoadingIndicator, showErrorMessage, loadBookmarksData };