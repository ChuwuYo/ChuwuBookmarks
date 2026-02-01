/**
 * 通用元素工厂
 * 提供文件夹/书签元素创建能力，供侧边栏、主内容区、搜索结果等模块复用
 * 设计目标：
 * - 保持与现有 UI 完全一致
 * - 抽离 createElement 以消除对 sidebar.js 的语义耦合
 * - 低侵入：仅调整 import 源，调用签名不变
 */

const deriveLabelFromUrl = (u) => {
    if (!u) return '';
    if (u.startsWith('data:')) {
        const match = /^data:([^;,]+)/i.exec(u);
        return match?.[1] ? `(${match[1]})` : '(data)';
    }
    try {
        const parsed = new URL(u);
        return parsed.hostname || u;
    } catch (e) {
        return u;
    }
};

/**
 * 创建统一样式的文件夹/书签元素
 * @param {'folder'|'bookmark'} type 元素类型
 * @param {Object} item 书签或文件夹数据
 * @param {Function|null} onClick 点击回调（用于文件夹导航等）
 * @returns {HTMLDivElement}
 */
const createElement = (type, item, onClick) => {
    const element = document.createElement('div');
    element.className = type;

    if (type === 'folder') {
        // 使用显式节点创建，保持与原样式一致
        const folderIcon = document.createElement('span');
        folderIcon.className = 'folder-icon';
        folderIcon.textContent = '📁';

        const folderName = document.createElement('span');
        folderName.className = 'folder-name';
        folderName.textContent = (typeof item.title === 'string' && item.title.trim()) ? item.title.trim() : '未命名文件夹';

        element.append(folderIcon, folderName);
    } else {
        const titleRaw = typeof item.title === 'string' ? item.title : '';
        const title = titleRaw.trim();
        const urlRaw = typeof item.url === 'string' ? item.url : '';
        const url = urlRaw.trim();

        const displayTitle = title || deriveLabelFromUrl(url) || '未命名书签';

        const bookmarkIcon = document.createElement('span');
        bookmarkIcon.className = 'bookmark-icon';
        
        // 创建 emoji 容器，确保正确对齐
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'bookmark-icon-emoji';
        emojiSpan.textContent = '🔗';
        bookmarkIcon.appendChild(emojiSpan);

        // 图标懒加载
        if (item.icon) {
            const img = document.createElement('img');
            img.className = 'bookmark-icon-img';
            
            // 处理图标数据：支持字符串和数组
            const iconUrls = Array.isArray(item.icon) ? item.icon : [item.icon];
            
            // 过滤掉空值
            const validIconUrls = iconUrls.filter(url => url && typeof url === 'string');
            
            if (validIconUrls.length > 0) {
                // 设置第一个图标源
                // HTML 属性 data-src 自动映射到 dataset.src
                img.setAttribute('data-src', validIconUrls[0]);
                
                // 如果有多个图标源，存储完整列表
                // HTML 属性 data-icon-urls 自动映射到 dataset.iconUrls
                // 注意：data-current-index 由 loadIcon 函数在加载时设置
                if (validIconUrls.length > 1) {
                    img.setAttribute('data-icon-urls', JSON.stringify(validIconUrls));
                }
                
                img.alt = displayTitle;
                img.loading = 'lazy';
                bookmarkIcon.appendChild(img);
            }
        }

        const link = document.createElement('a');
        link.href = url || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = displayTitle;

        element.append(bookmarkIcon, link);
    }

    if (onClick) {
        element.addEventListener('click', onClick, { passive: true });
    }

    return element;
};

export { createElement };
