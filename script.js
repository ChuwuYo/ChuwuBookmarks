/**
 * 在页面加载完成后，执行以下操作：
 * 1. 从 'bookmarks.json' 文件中获取书签数据。
 * 2. 渲染侧边栏，显示书签文件夹。
 * 3. 渲染主页内容。
 * 4. 为导航标题添加点击事件，点击后重新渲染主页。
 * 5. 为侧边栏切换按钮添加点击事件，点击后切换侧边栏的显示状态。
 * 6. 为搜索框和搜索按钮添加事件监听器，实现搜索功能。
 */
// 创建媒体查询匹配器
const mobileMediaQuery = window.matchMedia('(max-width: 768px)');

// 处理侧边栏在移动设备上的状态
function handleMobileView(e) {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');
    
    if (e.matches) {
        // 小屏幕模式
        sidebar.classList.add('collapsed');
        toggleButton.textContent = '🫸';
    }
}

// 初始检查和添加监听器
mobileMediaQuery.addListener(handleMobileView);

// 调整home-message的位置
function adjustHomeMessagePosition(isCollapsed) {
    const homeMessage = document.querySelector('.home-message');
    if (homeMessage) {
        if (mobileMediaQuery.matches) {
            // 在移动设备视图下，始终居中
            homeMessage.style.left = '50%';
        } else {
            // 在桌面视图下，根据侧边栏状态调整
            homeMessage.style.left = isCollapsed ? '50%' : 'calc(50% + 110px)';
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 初始检查移动设备视图
    handleMobileView(mobileMediaQuery);
    
    fetch('bookmarks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch bookmarks');
            }
            return response.json();
        })
        .then(data => {
            renderSidebar(data);
            renderHomePage();

            const navTitle = document.querySelector('h1');
            navTitle.addEventListener('click', () => {
                renderHomePage();
            });

            // 侧边栏切换按钮事件
            const toggleSidebarButton = document.getElementById('toggle-sidebar');
            const sidebar = document.querySelector('.sidebar');
            toggleSidebarButton.addEventListener('click', (e) => {
                e.preventDefault(); // 阻止默认行为
                e.stopPropagation(); // 阻止事件冒泡
                const isCollapsed = sidebar.classList.contains('collapsed');
                sidebar.classList.toggle('collapsed');
                // 更新切换按钮的文本
                toggleSidebarButton.textContent = isCollapsed ? '🫷' : '🫸';
                
                // 调整主页信息的位置
                adjustHomeMessagePosition(!isCollapsed);
            });

            // 搜索功能
            const searchInput = document.getElementById('search-input');
            const searchButton = document.getElementById('search-button');

            searchButton.addEventListener('click', () => {
                const keyword = searchInput.value.trim();
                if (keyword) {
                    const results = searchBookmarks(keyword, data);
                    renderSearchResults(results);
                }
            });

            // 支持按下回车键触发搜索
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const keyword = searchInput.value.trim();
                    if (keyword) {
                        const results = searchBookmarks(keyword, data);
                        renderSearchResults(results);
                    }
                }
            });
        })
        .catch(error => console.error(error));
});

/**
 * 根据传入的数据渲染侧边栏。
 * 侧边栏显示根文件夹下的所有子文件夹。
 * 每个子文件夹以带有图标的名称形式展示，并添加点击事件，点击后渲染对应的文件夹内容。
 * 
 * @param {Object} data - 包含书签数据的对象
 */
function renderSidebar(data) {
    const sidebar = document.getElementById('sidebar-folders');
    sidebar.innerHTML = '';

    const rootFolder = data.find(item => item.title === '书签栏');
    if (rootFolder) {
        // 为根文件夹的直接子文件夹设置父引用
        rootFolder.children.forEach(item => {
            if (item.type === 'folder') {
                item.parent = rootFolder;
                // 递归设置所有子文件夹的父引用
                if (item.children) {
                    setParentReferences(item.children, item);
                }
                
                const folderElement = document.createElement('div');
                folderElement.className = 'folder';

                const icon = document.createElement('span');
                icon.className = 'folder-icon';
                icon.textContent = '📁';

                const folderName = document.createElement('span');
                folderName.className = 'folder-name';
                folderName.textContent = item.title;

                folderElement.appendChild(icon);
                folderElement.appendChild(folderName);

                folderElement.addEventListener('click', () => {
                    renderMainContent(item);
                });

                sidebar.appendChild(folderElement);
            }
        });
    }
}

// 递归设置所有子文件夹的父引用
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
 * 渲染主页内容。
 * 主页显示一个欢迎消息，并居中显示。
 */
function renderHomePage() {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    content.style.display = 'flex';
    content.style.justifyContent = 'center';
    content.style.alignItems = 'center';
    content.style.height = '100%'; // 设置高度为100%，使内容垂直居中

    const homeMessage = document.createElement('div');
    homeMessage.className = 'home-message';
    homeMessage.textContent = '初五的书签🤗';
    content.appendChild(homeMessage);
        
    // 初始化home-message位置
    const sidebar = document.querySelector('.sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    adjustHomeMessagePosition(isCollapsed);
}

/**
 * 根据传入的文件夹对象渲染主内容区域。
 * 主内容区域显示当前文件夹的面包屑导航和子文件夹/链接。
 * 面包屑导航显示当前文件夹的路径，并添加点击事件，点击后渲染对应的文件夹内容。
 * 子文件夹和链接以带有图标的名称形式展示，子文件夹点击后渲染对应的文件夹内容，链接点击后在新标签页中打开。
 * 
 * @param {Object} folder - 包含文件夹数据的对象
 */
function renderMainContent(folder) {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    // 重置样式，避免影响其他视图
    content.style.display = 'block';
    content.style.justifyContent = '';
    content.style.alignItems = '';
    content.style.height = '';

    const breadcrumbPath = [];
    let currentFolder = folder;
    while (currentFolder) {
        breadcrumbPath.unshift(currentFolder);
        currentFolder = currentFolder.parent;
    }

    // 过滤掉"书签栏"，只显示从一级文件夹开始的路径
    const filteredPath = breadcrumbPath.filter(crumb => crumb.title !== '书签栏');
    
    filteredPath.forEach((crumb, index) => {
        const crumbElement = document.createElement('span');
        crumbElement.textContent = crumb.title;
        crumbElement.className = 'breadcrumb-item';
        
        // 为面包屑项添加点击事件，但不包括"书签栏"和当前项
        if (crumb.parent && index !== filteredPath.length - 1) {
            crumbElement.addEventListener('click', () => {
                renderMainContent(crumb);
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
                const folderElement = document.createElement('div');
                folderElement.className = 'folder';

                const icon = document.createElement('span');
                icon.className = 'folder-icon';
                icon.textContent = '📁';

                const folderName = document.createElement('span');
                folderName.className = 'folder-name';
                folderName.textContent = item.title;

                folderElement.appendChild(icon);
                folderElement.appendChild(folderName);
                folderElement.addEventListener('click', () => {
                    renderMainContent(item);
                });

                content.appendChild(folderElement);
            } else if (item.type === 'link') {
                const linkElement = document.createElement('div');
                linkElement.className = 'bookmark';

                const icon = document.createElement('span');
                icon.className = 'bookmark-icon';
                icon.textContent = '🔗';

                const link = document.createElement('a');
                link.href = item.url;
                link.textContent = item.title;
                link.target = '_blank';

                linkElement.appendChild(icon);
                linkElement.appendChild(link);
                content.appendChild(linkElement);
            }
        });
    }
}

/**
 * 根据关键词搜索书签内容
 * @param {string} keyword - 搜索关键词
 * @param {Array} data - 书签数据
 * @returns {Array} - 匹配的书签结果
 */
function searchBookmarks(keyword, data) {
    const results = [];
    keyword = keyword.toLowerCase();

    // 递归搜索书签数据
    function searchItems(items) {
        items.forEach(item => {
            if (item.title.toLowerCase().includes(keyword) || (item.url && item.url.toLowerCase().includes(keyword))) {
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
 * @param {Array} results - 显示匹配的书签结果
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

    // 创建一个容器来包裹所有搜索结果
    const resultsContainer = document.createElement('div');
    resultsContainer.className = 'results-container';

    results.forEach(item => {
        if (item.type === 'folder') {
            const folderElement = document.createElement('div');
            folderElement.className = 'folder';

            const icon = document.createElement('span');
            icon.className = 'folder-icon';
            icon.textContent = '📁';

            const folderName = document.createElement('span');
            folderName.className = 'folder-name';
            folderName.textContent = item.title;

            folderElement.appendChild(icon);
            folderElement.appendChild(folderName);
            folderElement.addEventListener('click', () => {
                renderMainContent(item); // 点击文件夹时渲染其内容
            });

            resultsContainer.appendChild(folderElement);
        } else if (item.type === 'link') {
            const linkElement = document.createElement('div');
            linkElement.className = 'bookmark';

            const icon = document.createElement('span');
            icon.className = 'bookmark-icon';
            icon.textContent = '🔗';

            const link = document.createElement('a');
            link.href = item.url;
            link.textContent = item.title;
            link.target = '_blank';

            linkElement.appendChild(icon);
            linkElement.appendChild(link);
            resultsContainer.appendChild(linkElement);
        }
    });

    // 将搜索结果容器添加到主内容区域
    content.appendChild(resultsContainer);
}
