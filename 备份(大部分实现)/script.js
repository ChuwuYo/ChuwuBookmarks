/**
 * 在页面加载完成后，执行以下操作：
 * 1. 从 'bookmarks.json' 文件中获取书签数据。
 * 2. 渲染侧边栏，显示书签文件夹。
 * 3. 渲染主页内容。
 * 4. 为导航标题添加点击事件，点击后重新渲染主页。
 * 5. 为侧边栏切换按钮添加点击事件，点击后切换侧边栏的显示状态。
 */
document.addEventListener("DOMContentLoaded", () => {
    fetch('bookmarks.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch bookmarks');
            }
            return response.json();
        })
        .then(data => {
            renderSidebar(data);
            renderHomePage(); // 页面加载时显示主页

            const navTitle = document.querySelector('h1');
            navTitle.addEventListener('click', () => {
                renderHomePage();
            });

            // 为侧边栏切换按钮添加点击事件
            const toggleSidebarButton = document.getElementById('toggle-sidebar');
            const sidebar = document.querySelector('.sidebar');
            toggleSidebarButton.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const homeMessage = document.querySelector('.home-message');
                if (sidebar.classList.contains('collapsed')) {
                    homeMessage.style.left = '50%';
                } else {
                    homeMessage.style.left = 'calc(50% + (220px - 20px) / 2)';
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
        rootFolder.children.forEach(item => {
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

                sidebar.appendChild(folderElement);
            }
        });
    }
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
    content.style.height = '100%';

    const homeMessage = document.createElement('div');
    homeMessage.className = 'home-message';
    homeMessage.textContent = '初五的书签导航🤗';
    content.appendChild(homeMessage);
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

    breadcrumbPath.forEach((crumb, index) => {
        const crumbElement = document.createElement('span');
        crumbElement.textContent = crumb.title;
        crumbElement.addEventListener('click', () => {
            renderMainContent(crumb);
        });

        breadcrumbs.appendChild(crumbElement);
        if (index < breadcrumbPath.length - 1) {
            breadcrumbs.appendChild(document.createTextNode(' > '));
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