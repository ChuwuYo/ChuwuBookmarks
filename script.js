/**
 * 主题相关功能模块
 * 包含主题初始化和切换的相关函数
 */

/**
 * 初始化主题设置
 * 从localStorage读取主题设置，如果没有则默认使用light主题
 */
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = theme === 'light' ? '🌞' : '🌙';
}

/**
 * 切换主题
 * 在light和dark主题之间切换，并更新localStorage中的设置
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = newTheme === 'light' ? '🌞' : '🌙';
}

/**
 * 设备和视图适配模块
 * 包含移动设备检测和视图调整的相关函数
 */

/**
 * 检测当前设备是否为移动设备
 * @returns {boolean} 如果是移动设备或窗口宽度小于768px则返回true
 */
function isMobileDevice() {
    return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;
}

/**
 * 处理移动设备视图
 * 根据设备类型调整侧边栏和切换按钮的状态
 */
function handleMobileView() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');
    const isMobile = isMobileDevice();
    const isCollapsed = isMobile;
    sidebar.classList.toggle('collapsed', isCollapsed);
    toggleButton.textContent = isCollapsed ? '🫸' : '🫷';
    adjustHomeMessagePosition(isCollapsed);
}

/**
 * 调整首页消息位置
 * @param {boolean} isCollapsed - 侧边栏是否折叠
 */
function adjustHomeMessagePosition(isCollapsed) {
    const homeMessage = document.querySelector('.home-message');
    if (homeMessage) {
        homeMessage.style.left = isCollapsed ? '50%' : 'calc(50% + 110px)';
    }
}

/**
 * 渲染相关功能模块
 * 包含页面各个部分的渲染函数
 */

/**
 * 渲染首页
 * 显示欢迎信息并调整其位置
 */
function renderHome() {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    breadcrumbs.innerHTML = '';
    content.innerHTML = '<div class="home-message">初五的书签🤗</div>';
    
    const sidebar = document.querySelector('.sidebar');
    adjustHomeMessagePosition(sidebar.classList.contains('collapsed'));
}

/**
 * 创建文件夹元素
 * @param {Object} item - 文件夹数据对象
 * @param {Function} onClick - 点击事件处理函数
 * @returns {HTMLElement} 返回创建的文件夹DOM元素
 */
function createFolderElement(item, onClick) {
    const folderElement = document.createElement('div');
    folderElement.className = 'folder';
    folderElement.innerHTML = `
        <span class="folder-icon">📁</span>
        <span class="folder-name">${item.title}</span>
    `;
    folderElement.addEventListener('click', onClick);
    return folderElement;
}

/**
 * 创建书签元素
 * @param {Object} item - 书签数据对象
 * @returns {HTMLElement} 返回创建的书签DOM元素
 */
function createBookmarkElement(item) {
    const linkElement = document.createElement('div');
    linkElement.className = 'bookmark';
    linkElement.innerHTML = `
        <span class="bookmark-icon">🔗</span>
        <a href="${item.url}" target="_blank">${item.title}</a>
    `;
    return linkElement;
}

/**
 * 渲染侧边栏
 * @param {Array} data - 书签数据数组
 */
async function renderSidebar(data) {
    const sidebar = document.getElementById('sidebar-folders');
    sidebar.innerHTML = '';

    const rootFolder = data.find(item => item.title === '书签栏');
    if (rootFolder) {
        rootFolder.children.forEach(item => {
            if (item.type === 'folder') {
                item.parent = rootFolder;
                if (item.children) {
                    setParentReferences(item.children, item);
                }
                
                const handleClick = (event) => {
                    const isMobile = isMobileDevice();
                    if (isMobile) {
                        const sidebar = document.querySelector('.sidebar');
                        sidebar.classList.add('collapsed');
                        document.getElementById('toggle-sidebar').textContent = '🫸';
                        adjustHomeMessagePosition(true);
                        renderMainContent(item);
                    } else {
                        renderMainContent(item);
                    }
                    event.stopPropagation();
                };
                
                sidebar.appendChild(createFolderElement(item, handleClick));
            }
        });
    }
}

/**
 * 设置父级引用
 * @param {Array} items - 需要设置父级引用的项目数组
 * @param {Object} parent - 父级对象
 */
function setParentReferences(items, parent) {
    items.forEach(item => {
        if (item.type === 'folder') {
            item.parent = parent;
            if (item.children) {
                setParentReferences(item.children, item);
            }
        }
    });
}

/**
 * 渲染主要内容区域
 * @param {Object} folder - 当前文件夹对象
 */
function renderMainContent(folder) {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    const breadcrumbPath = [];
    let currentFolder = folder;
    while (currentFolder) {
        breadcrumbPath.unshift(currentFolder);
        currentFolder = currentFolder.parent;
    }

    const filteredPath = breadcrumbPath.filter(crumb => crumb.title !== '书签栏');
    
    filteredPath.forEach((crumb, index) => {
        const crumbElement = document.createElement('span');
        crumbElement.textContent = crumb.title;
        crumbElement.className = 'breadcrumb-item';
        
        if (crumb.parent && index !== filteredPath.length - 1) {
            crumbElement.addEventListener('click', (event) => {
                const isMobile = isMobileDevice();
                if (isMobile) {
                    const sidebar = document.querySelector('.sidebar');
                    sidebar.classList.add('collapsed');
                    document.getElementById('toggle-sidebar').textContent = '🫸';
                    adjustHomeMessagePosition(true);
                    
                    renderMainContent(crumb);
                } else {
                    renderMainContent(crumb);
                }
                event.stopPropagation();
            });
        }

        breadcrumbs.appendChild(crumbElement);
        if (index < filteredPath.length - 1) {
            const separator = document.createElement('span');
            separator.textContent = ' > ';
            separator.className = 'breadcrumb-separator';
            breadcrumbs.appendChild(separator);
        }
    });

    if (folder.children) {
        folder.children.forEach(item => {
            if (item.type === 'folder') {
                content.appendChild(createFolderElement(item, () => renderMainContent(item)));
            } else if (item.type === 'link') {
                content.appendChild(createBookmarkElement(item));
            }
        });
    }
}

/**
 * 搜索相关功能模块
 * 包含搜索防抖、搜索执行和结果渲染的相关函数
 */

let debounceTimeout;
/**
 * 搜索防抖处理
 * @param {Event} event - 输入事件对象
 */
function debounceSearch(event) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        const keyword = event.target.value.trim();
        if (keyword) {
            const bookmarksData = JSON.parse(localStorage.getItem('bookmarksData') || '[]');
            const results = searchBookmarks(keyword, bookmarksData);
            renderSearchResults(results);
        } else {
            renderHome();
        }
    }, 500);
}

/**
 * 搜索书签
 * @param {string} keyword - 搜索关键词
 * @param {Array} data - 书签数据数组
 * @returns {Array} 返回匹配的搜索结果数组
 */
function searchBookmarks(keyword, data) {
    const results = [];
    keyword = keyword.toLowerCase();

    function searchItems(items) {
        items.forEach(item => {
            if (item.title.toLowerCase().includes(keyword) || 
                (item.url && item.url.toLowerCase().includes(keyword))) {
                results.push(item);
            }
            if (item.children) {
                searchItems(item.children);
            }
        });
    }

    searchItems(data);
    return results;
}

/**
 * 渲染搜索结果
 * @param {Array} results - 搜索结果数组
 */
function renderSearchResults(results) {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    if (results.length === 0) {
        content.innerHTML = '<div class="no-results">未找到匹配的书签。</div>';
        return;
    }

    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';

    // 分类渲染搜索结果
    const folders = results.filter(item => item.type === 'folder');
    folders.forEach(item => {
        resultsContainer.appendChild(createFolderElement(item, () => renderMainContent(item)));
    });

    const links = results.filter(item => item.type === 'link');
    links.forEach(item => {
        resultsContainer.appendChild(createBookmarkElement(item));
    });

    content.appendChild(resultsContainer);
}

/**
 * 初始化模块
 * 在DOM加载完成后执行初始化操作
 */
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    handleMobileView();

    try {
        const response = await fetch('bookmarks.json');
        if (!response.ok) {
            throw new Error('Failed to fetch bookmarks');
        }
        const data = await response.json();
        localStorage.setItem('bookmarksData', JSON.stringify(data));
        renderSidebar(data);
        renderHome();

        // 事件监听设置
        const toggleButton = document.getElementById('toggle-sidebar');
        const sidebar = document.querySelector('.sidebar');
        
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCollapsed = !sidebar.classList.contains('collapsed');
            sidebar.classList.toggle('collapsed', isCollapsed);
            toggleButton.textContent = isCollapsed ? '🫸' : '🫷';
            adjustHomeMessagePosition(isCollapsed);
        });

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', toggleTheme);
    } catch (error) {
        console.error(error);
    }
});

/**
 * 窗口尺寸变化监听
 * 当窗口大小改变时重新调整视图
 */
window.addEventListener('resize', () => {
    handleMobileView();
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
});
