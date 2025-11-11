/**
 * 通用元素工厂
 * 提供文件夹/书签元素创建能力，供侧边栏、主内容区、搜索结果等模块复用
 * 设计目标：
 * - 保持与现有 UI 完全一致
 * - 抽离 createElement 以消除对 sidebar.js 的语义耦合
 * - 低侵入：仅调整 import 源，调用签名不变
 */

/**
 * 创建统一样式的文件夹/书签元素
 * @param {'folder'|'bookmark'} type 元素类型
 * @param {Object} item 书签或文件夹数据
 * @param {Function|null} onClick 点击回调（用于文件夹导航等）
 * @param {Object} [options] 可选项
 * @param {Function} [options.observeIcon] 图标懒加载观察器回调
 * @returns {HTMLDivElement}
 */
const createElement = (type, item, onClick, options = {}) => {
    const element = document.createElement('div');
    element.className = type;

    if (type === 'folder') {
        // 使用模板字符串一次性创建所有 DOM，保持与原 sidebar.js 一致
        element.innerHTML = `
            <span class="folder-icon">📁</span>
            <span class="folder-name">${item.title}</span>
        `;
    } else {
        const bookmarkIcon = document.createElement('span');
        bookmarkIcon.className = 'bookmark-icon';
        bookmarkIcon.textContent = '🔗';

        // 图标懒加载，支持由调用方注入观察逻辑（侧边栏使用 IntersectionObserver）
        if (item.icon) {
            const img = document.createElement('img');
            img.setAttribute('data-src', item.icon);
            img.alt = '🔗';
            img.style.display = 'none';
            img.loading = 'lazy';

            bookmarkIcon.appendChild(img);

            if (typeof options.observeIcon === 'function') {
                options.observeIcon(img);
            }
        }

        const link = document.createElement('a');
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = item.title;

        element.append(bookmarkIcon, link);
    }

    if (onClick) {
        element.addEventListener('click', onClick, { passive: true });
    }

    return element;
};

export { createElement };