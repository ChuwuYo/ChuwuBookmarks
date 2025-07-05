/**
 * 搜索结果渲染模块
 */

import { createElement } from './sidebar.js';

const renderSearchResults = (results, renderMainContent) => {
    const content = document.getElementById('content');
    const breadcrumbs = document.getElementById('breadcrumbs');

    if (!content || !breadcrumbs) return;

    // 清除主页消息（无论它在哪里）
    const existingHomeMessage = document.querySelector('.home-message');
    if (existingHomeMessage) {
        existingHomeMessage.remove();
    }

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

export { renderSearchResults };