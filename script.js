/**
 * 主题、设备适配、渲染和搜索功能模块
 */

/** 主题相关 */
const initTheme = () => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
};

const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
};

/** 设备和视图适配 */
const isMobileDevice = () => 
    window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 768;

const updateSidebarState = (sidebar, isCollapsed) => {
    sidebar.classList.toggle('collapsed', isCollapsed);
    document.getElementById('toggle-sidebar').textContent = isCollapsed ? '🫸' : '🫷';
    adjustHomeMessagePosition(isCollapsed);
};

const handleMobileView = () => {
    const sidebar = document.querySelector('.sidebar');
    updateSidebarState(sidebar, isMobileDevice());
};

const adjustHomeMessagePosition = (isCollapsed) => {
    const homeMessage = document.querySelector('.home-message');
    if (homeMessage) {
        homeMessage.style.left = isCollapsed ? '50%' : 'calc(50% + 110px)';
    }
};

/** 渲染相关 */
const renderHome = () => {
    const content = document.getElementById('content');
    content.innerHTML = '<div class="home-message">初五的书签🤗</div>';
    document.getElementById('breadcrumbs').innerHTML = '';
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
};

const createElement = (type, item, onClick) => {
    const element = document.createElement('div');
    element.className = type;
    element.innerHTML = type === 'folder' 
        ? `<span class="folder-icon">📁</span><span class="folder-name">${item.title}</span>`
        : `<span class="bookmark-icon">🔗</span><a href="${item.url}" target="_blank">${item.title}</a>`;
    if (onClick) element.addEventListener('click', onClick);
    return element;
};

const renderSidebar = (data) => {
    const sidebar = document.getElementById('sidebar-folders');
    sidebar.innerHTML = '';
    const rootFolder = data.find(item => item.title === '书签栏');
    if (!rootFolder) return;

    rootFolder.children
        .filter(item => item.type === 'folder')
        .forEach(item => {
            item.parent = rootFolder;
            if (item.children) setParentReferences(item.children, item);
            sidebar.appendChild(createElement('folder', item, (e) => {
                e.stopPropagation();
                renderMainContent(item, true);
            }));
        });
};

const setParentReferences = (items, parent) => {
    items.forEach(item => {
        if (item.type === 'folder') {
            item.parent = parent;
            if (item.children) setParentReferences(item.children, item);
        }
    });
};

const renderMainContent = (folder, fromSidebar = false) => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = breadcrumbs.innerHTML = '';

    if (fromSidebar && isMobileDevice()) {
        updateSidebarState(document.querySelector('.sidebar'), true);
    }

    const breadcrumbPath = [];
    let current = folder;
    while (current) {
        breadcrumbPath.unshift(current);
        current = current.parent;
    }

    breadcrumbPath
        .filter(crumb => crumb.title !== '书签栏')
        .forEach((crumb, index, arr) => {
            const crumbElement = document.createElement('span');
            crumbElement.textContent = crumb.title;
            crumbElement.className = 'breadcrumb-item';
            if (crumb.parent && index < arr.length - 1) {
                crumbElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    renderMainContent(crumb, true);
                });
            }
            breadcrumbs.appendChild(crumbElement);
            if (index < arr.length - 1) {
                breadcrumbs.appendChild(Object.assign(document.createElement('span'), {
                    textContent: ' > ',
                    className: 'breadcrumb-separator'
                }));
            }
        });

    folder.children?.forEach(item => {
        content.appendChild(createElement(
            item.type === 'folder' ? 'folder' : 'bookmark',
            item,
            item.type === 'folder' ? () => renderMainContent(item) : null
        ));
    });
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
    content.innerHTML = '';
    document.getElementById('breadcrumbs').innerHTML = '';

    if (!results.length) {
        content.innerHTML = '<div class="no-results">未找到匹配的书签。</div>';
        return;
    }

    const container = document.createElement('div');
    container.className = 'results-container';
    ['folder', 'link'].forEach(type => {
        results.filter(item => item.type === type)
            .forEach(item => container.appendChild(createElement(
                type === 'folder' ? 'folder' : 'bookmark',
                item,
                type === 'folder' ? () => renderMainContent(item) : null
            )));
    });
    content.appendChild(container);
};

const debounceSearch = debounce((event) => {
    const keyword = event.target.value.trim();
    if (!keyword) return renderHome();
    const data = JSON.parse(localStorage.getItem('bookmarksData') || '[]');
    renderSearchResults(searchBookmarks(keyword, data));
}, 500);

/** 初始化和事件监听 */
document.addEventListener('DOMContentLoaded', async () => {
    initTheme();
    handleMobileView();

    try {
        const response = await fetch('bookmarks.json');
        if (!response.ok) throw new Error('Failed to fetch bookmarks');
        const data = await response.json();
        localStorage.setItem('bookmarksData', JSON.stringify(data));
        renderSidebar(data);
        renderHome();
    } catch (error) {
        console.error(error);
    }

    const sidebar = document.querySelector('.sidebar');
    document.getElementById('toggle-sidebar').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        updateSidebarState(sidebar, !sidebar.classList.contains('collapsed'));
    });

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    document.getElementById('search-input').addEventListener('keyup', debounceSearch);
});

window.addEventListener('resize', () => {
    handleMobileView();
    adjustHomeMessagePosition(document.querySelector('.sidebar').classList.contains('collapsed'));
});