// 主题相关函数
function initTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = theme === 'light' ? '🌞' : '🌙';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.textContent = newTheme === 'light' ? '🌞' : '🌙';
}

// 响应式处理
function handleMobileView() {
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('toggle-sidebar');
    // 移动端检测：结合触控支持和屏幕宽度
    const isMobile = window.matchMedia('(pointer: coarse)').matches || 
                    window.innerWidth <= 768;
    // 初始化侧边栏状态
    sidebar.classList.toggle('collapsed', isMobile);
    toggleButton.textContent = isMobile ? '🫸' : '🫷';
    // 同步主页消息位置
    adjustHomeMessagePosition(isMobile);
}


// 调整主页信息位置
function adjustHomeMessagePosition(isCollapsed) {
    const homeMessage = document.querySelector('.home-message');
    if (homeMessage) {
        homeMessage.style.left = isCollapsed ? '50%' : 'calc(50% + 110px)';
    }
}

// 渲染主页
function renderHome() {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    breadcrumbs.innerHTML = '';
    content.innerHTML = '<div class="home-message">初五的书签🤗</div>';
    
    const sidebar = document.querySelector('.sidebar');
    const isCollapsed = sidebar.classList.contains('collapsed');
    adjustHomeMessagePosition(isCollapsed);
}

// 渲染侧边栏
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
                
                const folderElement = document.createElement('div');
                folderElement.className = 'folder';
                folderElement.innerHTML = `
                    <span class="folder-icon">📁</span>
                    <span class="folder-name">${item.title}</span>
                `;
                
                folderElement.addEventListener('click', () => {
                    renderMainContent(item);
                });

                sidebar.appendChild(folderElement);
            }
        });
    }
}

// 递归设置父引用
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

// 渲染主内容
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
                folderElement.innerHTML = `
                    <span class="folder-icon">📁</span>
                    <span class="folder-name">${item.title}</span>
                `;
                folderElement.addEventListener('click', () => {
                    renderMainContent(item);
                });
                content.appendChild(folderElement);
            } else if (item.type === 'link') {
                const linkElement = document.createElement('div');
                linkElement.className = 'bookmark';
                linkElement.innerHTML = `
                    <span class="bookmark-icon">🔗</span>
                    <a href="${item.url}" target="_blank">${item.title}</a>
                `;
                content.appendChild(linkElement);
            }
        });
    }
}

// 搜索相关函数
let debounceTimeout;
function debounceSearch(event) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        const keyword = event.target.value.trim();
        if (keyword) {
            let bookmarksData = JSON.parse(localStorage.getItem('bookmarksData') || '[]');
            const results = searchBookmarks(keyword, bookmarksData);
            renderSearchResults(results);
        } else {
            renderHome();
        }
    }, 500);
}

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

    // 首先渲染文件夹
    const folders = results.filter(item => item.type === 'folder');
    folders.forEach(item => {
        const folderElement = document.createElement('div');
        folderElement.className = 'folder';
        folderElement.innerHTML = `
            <span class="folder-icon">📁</span>
            <span class="folder-name">${item.title}</span>
        `;
        folderElement.addEventListener('click', () => {
            renderMainContent(item);
        });
        resultsContainer.appendChild(folderElement);
    });

    // 然后渲染链接
    const links = results.filter(item => item.type === 'link');
    links.forEach(item => {
        const linkElement = document.createElement('div');
        linkElement.className = 'bookmark';
        linkElement.innerHTML = `
            <span class="bookmark-icon">🔗</span>
            <a href="${item.url}" target="_blank">${item.title}</a>
        `;
        resultsContainer.appendChild(linkElement);
    });

    content.appendChild(resultsContainer);
}

// 初始化
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

        // 更新侧边栏切换按钮事件监听
        const toggleButton = document.getElementById('toggle-sidebar');
        const sidebar = document.querySelector('.sidebar');
        
        toggleButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const isCollapsed = sidebar.classList.toggle('collapsed');
            toggleButton.textContent = isCollapsed ? '🫸' : '🫷';
            adjustHomeMessagePosition(isCollapsed);
            // 强制重绘解决过渡动画问题
            void sidebar.offsetWidth; 
        });

        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', toggleTheme);
    } catch (error) {
        console.error(error);
    }
});

// 监听窗口尺寸变化
window.addEventListener('resize', () => {
    handleMobileView();
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
});
