import { initTheme, toggleTheme } from './assets/js/modules/render/theme.js';
import { getDeviceType, isMobileDevice, handleDeviceView, updateSidebarState, adjustSearchContainerPosition, adjustHomeMessagePosition } from './assets/js/modules/render/device.js';
import { renderHome } from './assets/js/modules/render/home.js';
import { renderSidebar, createElement } from './assets/js/modules/render/sidebar.js';
import { renderMainContent as _renderMainContent } from './assets/js/modules/render/content.js';

// 创建包装函数解决循环依赖
const renderMainContent = (folder, fromSidebar = false) => {
    return _renderMainContent(folder, fromSidebar, renderHome);
};

/** 搜索相关 */
const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

const searchBookmarks = (keyword, data) => {
    const results = [];
    keyword = keyword.toLowerCase();
    const searchItems = (items) => {
        items.forEach(item => {
            if (item.title.toLowerCase().includes(keyword) ||
                (item.url && item.url.toLowerCase().includes(keyword))) {
                results.push(item);
            }
            if (item.children) searchItems(item.children);
        });
    };
    searchItems(data);
    return results;
};

const renderSearchResults = (results) => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');

    if (!content || !breadcrumbs) return;

    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    if (!results || !results.length) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = '未找到匹配的书签。';
        content.appendChild(noResults);
        return;
    }

    // 使用requestAnimationFrame优化渲染
    requestAnimationFrame(() => {
        // 预先分类结果，减少循环中的过滤操作
        const folderResults = results.filter(item => item.type === 'folder');
        const linkResults = results.filter(item => item.type === 'link' || item.type === 'bookmark');

        // 使用DocumentFragment减少DOM操作
        const fragment = document.createDocumentFragment();
        const container = document.createElement('div');
        container.className = 'results-container';

        // 批量创建文件夹元素
        const folderElements = folderResults.map((item, index) => {
            const element = createElement(
                'folder',
                item,
                () => renderMainContent(item)
            );
            element.style.setProperty('--item-index', index);
            return element;
        });

        // 批量创建书签元素
        const bookmarkElements = linkResults.map((item, index) => {
            const element = createElement(
                'bookmark',
                item,
                null
            );
            element.style.setProperty('--item-index', folderElements.length + index);
            return element;
        });

        // 一次性将所有元素添加到container
        folderElements.forEach(element => container.appendChild(element));
        bookmarkElements.forEach(element => container.appendChild(element));

        fragment.appendChild(container);
        // 一次性将所有元素添加到DOM
        content.appendChild(fragment);
    });
};

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
const initSearchWorker = () => {
    if (window.Worker) {
        // 初始化搜索Worker
        searchWorker = new Worker('assets/js/search-worker.js');

        // 监听来自搜索Worker的消息
        searchWorker.addEventListener('message', (e) => {
            const { action, results, message, fromCache } = e.data;

            switch (action) {
                case 'searchResults':
                    renderSearchResults(results);
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

const debounceSearch = debounce((event) => {
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
        renderSearchResults(searchBookmarks(keyword, data));
    }
}, 250);

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    // 初始化主题和设备视图
    initTheme();
    handleDeviceView();

    // 立即调整搜索容器位置
    setTimeout(adjustSearchContainerPosition, 0);

    // 初始化FastClick
    if (typeof FastClick !== 'undefined') {
        FastClick.attach(document.body);
    }

    // 初始化搜索Web Worker
    initSearchWorker();

    // 添加加载状态指示器
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

    // 显示加载指示器
    showLoadingIndicator();

    try {
        // 使用requestAnimationFrame优化初始化流程
        requestAnimationFrame(async () => {
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
                // 显示错误信息给用户
                const content = document.getElementById('content');
                if (content) {
                    // 使用DOM API创建错误消息，避免innerHTML解析
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.style.textAlign = 'center';
                    errorMessage.style.marginTop = '50px';
                    errorMessage.style.color = 'var(--text-color)';

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
                }
            }
        });
    } catch (error) {
        console.error('初始化错误:', error);
    }

    // 使用事件委托减少事件监听器数量
    const sidebar = document.querySelector('.sidebar');
    const toggleSidebar = document.getElementById('toggle-sidebar');

    if (toggleSidebar) {
        // 合并点击和键盘事件处理
        const toggleSidebarHandler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                e.stopPropagation();
                if (sidebar) {
                    updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
                }
            }
        };

        toggleSidebar.addEventListener('click', toggleSidebarHandler);
        toggleSidebar.addEventListener('keydown', toggleSidebarHandler);
    }

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        // 合并点击和键盘事件处理
        const themeToggleHandler = (e) => {
            if (e.type === 'click' || (e.type === 'keydown' && (e.key === 'Enter' || e.key === ' '))) {
                e.preventDefault();
                toggleTheme();
            }
        };

        themeToggle.addEventListener('click', themeToggleHandler);
        themeToggle.addEventListener('keydown', themeToggleHandler);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // 搜索框事件处理
        searchInput.addEventListener('input', debounceSearch);
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                debounceSearch(e);
            }
        });

        // 监听搜索框清空事件
        searchInput.addEventListener('input', (e) => {
            if (!e.target.value.trim()) {
                renderHome();
            }
        });

        // 添加Ctrl+K快捷键聚焦搜索框功能
        document.addEventListener('keydown', function (e) {
            if (e.ctrlKey && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                document.getElementById('search-input').focus();
            }
        });

        // 优化的resize处理 - 不重新渲染，只调整布局
        const handleResize = debounce(() => {
            handleDeviceView();
            adjustSearchContainerPosition();
        }, 100);

        // 添加 resize 监听
        window.addEventListener('resize', handleResize);

        // 初始化时执行一次
        handleResize();

        // 监听主题切换，因为可能影响布局
        document.addEventListener('themechange', adjustSearchContainerPosition);

        // 监听侧边栏状态变化
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.attributeName === 'class') {
                        adjustSearchContainerPosition();
                    }
                });
            });
            observer.observe(sidebar, { attributes: true });
        }
    }

    // 主页按钮事件处理
    const homeButton = document.querySelector('.home-button');
    if (homeButton) {
        const handleHomeNavigation = () => {
            // 手机端点击主页按钮时自动收起侧栏
            if (isMobileDevice()) {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    updateSidebarState(sidebar, true);
                }
            }
            renderHome();
        };

        homeButton.addEventListener('click', handleHomeNavigation);
        homeButton.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHomeNavigation();
            }
        });
    }

    // 简化 FastClick 初始化，避免嵌套的事件监听器

    // 标题变更功能
    const originalTitle = document.title;
    const newTitle = "你要离开我了吗ヽ(*。>Д<)o゜";

    // 鼠标离开页面时触发的事件
    document.addEventListener('mouseout', function (e) {
        // 仅当鼠标离开窗口时进行处理
        if (e.relatedTarget === null) {
            document.title = newTitle;
        }
    });

    // 鼠标回到页面时触发的事件
    document.addEventListener('mouseover', function () {
        document.title = originalTitle;
    });
})
