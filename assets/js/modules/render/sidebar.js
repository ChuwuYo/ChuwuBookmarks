/**
 * 侧边栏渲染模块
 */

import { createElement } from './elements.js';

// 设置父引用
const setParentReferences = (items, parent) => {
    items.forEach(item => {
        if (item.type === 'folder') {
            item.parent = parent;
            if (item.children) setParentReferences(item.children, item);
        }
    });
};

// 渲染侧边栏
const renderSidebar = (data, renderMainContent) => {
    const sidebar = document.getElementById('sidebar-folders');
    if (!sidebar) return;

    sidebar.innerHTML = '';
    const fragment = document.createDocumentFragment();

    // 支持的根文件夹名称
    const possibleRootNames = ['书签栏', 'Bookmarks Bar', '收藏夹栏', 'Bookmarks Toolbar', '其他收藏夹', '移动收藏夹'];
    const matchedRootFolders = data.filter(item =>
        item.type === 'folder' && possibleRootNames.includes(item.title)
    );

    if (matchedRootFolders.length === 1) {
        // 只有一个根文件夹：显示该根文件夹下的所有一级子文件夹
        const rootFolder = matchedRootFolders[0];
        const folders = rootFolder.children.filter(item => item.type === 'folder');

        folders.forEach(item => {
            item.parent = rootFolder;
            if (item.children) setParentReferences(item.children, item);
        });

        const folderElements = folders.map(item => {
            const folderElement = createElement('folder', item, (e) => {
                e.stopPropagation();
                renderMainContent(item, true);
            });

            folderElement.setAttribute('tabindex', '0');
            folderElement.setAttribute('role', 'button');
            folderElement.setAttribute('aria-label', `文件夹: ${item.title}`);
            folderElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    renderMainContent(item, true);
                }
            });

            return folderElement;
        });

        folderElements.forEach(element => fragment.appendChild(element));

    } else if (matchedRootFolders.length > 1) {
        // 多个根文件夹：直接显示这些根文件夹本身
        matchedRootFolders.forEach(rootItem => {
            // 设置父引用
            if (rootItem.children) setParentReferences(rootItem.children, rootItem);

            const folderElement = createElement('folder', rootItem, (e) => {
                e.stopPropagation();
                renderMainContent(rootItem, true);
            });

            folderElement.setAttribute('tabindex', '0');
            folderElement.setAttribute('role', 'button');
            folderElement.setAttribute('aria-label', `文件夹: ${rootItem.title}`);
            folderElement.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    renderMainContent(rootItem, true);
                }
            });

            fragment.appendChild(folderElement);
        });
    }

    sidebar.appendChild(fragment);
};

export { renderSidebar, setParentReferences, createElement };