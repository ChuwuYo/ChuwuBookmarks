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
            renderHomePage(); // Display the homepage on load

            const navTitle = document.querySelector('h1');
            navTitle.addEventListener('click', () => {
                renderHomePage();
            });
        })
        .catch(error => console.error(error));
});

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

function renderMainContent(folder) {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');
    content.innerHTML = '';
    breadcrumbs.innerHTML = '';

    // Reset styles to avoid interference with other views
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
