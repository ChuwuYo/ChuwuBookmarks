fetch('bookmarks.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        return response.json();
    })
    .then(data => {
        console.log('加载的书签数据:', data); // 打印加载的数据
        const container = document.getElementById('bookmarks');
        renderBookmarks(data, container);
    })
    .catch(error => {
        console.error('加载书签失败:', error);
    });

function renderBookmarks(data, container) {
    console.log('当前数据:', data); // 打印当前处理的数据
    if (Array.isArray(data)) {
        // 如果 data 是数组，遍历每个根文件夹
        data.forEach(item => {
            renderBookmarks(item, container);
        });
    } else if (data.type === 'folder') {
        // 渲染文件夹
        const folder = document.createElement('div');
        folder.className = 'folder';

        // 文件夹名称
        const folderName = document.createElement('div');
        folderName.className = 'folder-name';
        folderName.textContent = data.title;

        // 文件夹子内容容器
        const folderChildren = document.createElement('div');
        folderChildren.className = 'folder-children';

        // 点击文件夹名称时切换展开/折叠状态
        folderName.addEventListener('click', () => {
            if (folder.classList.contains('open')) {
                // 如果文件夹已经是展开状态，则移除子内容并折叠
                folderChildren.innerHTML = ''; // 清空子内容
                folder.classList.remove('loaded'); // 标记为未加载
                folder.classList.remove('open'); // 折叠文件夹
            } else {
                // 如果文件夹是折叠状态，则加载子内容并展开
                if (!folder.classList.contains('loaded')) {
                    // 如果子内容未加载，则加载直接子文件夹和书签
                    if (data.children) {
                        data.children.forEach(child => {
                            renderBookmarks(child, folderChildren);
                        });
                    }
                    folder.classList.add('loaded'); // 标记为已加载
                }
                folder.classList.add('open'); // 展开文件夹
            }
        });

        // 将文件夹名称和子内容添加到文件夹容器
        folder.appendChild(folderName);
        folder.appendChild(folderChildren);

        // 将文件夹添加到页面容器
        container.appendChild(folder);
    } else if (data.type === 'link') {
        // 渲染书签
        const bookmark = document.createElement('div');
        bookmark.className = 'bookmark';
        bookmark.innerHTML = `<a href="${data.url}" target="_blank">${data.title}</a>`;
        container.appendChild(bookmark);
    }
}