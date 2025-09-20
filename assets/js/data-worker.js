// 常量定义消息动作
const ACTIONS = {
    LOAD_DATA: 'loadData',
};
// fnv1aHash - FNV-1a 32-bit hash
function fnv1aHash(str) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return ('00000000' + (h >>> 0).toString(16)).slice(-8);
}

/**
 * 将书签树扁平化并构建预处理索引以加速搜索
 * 输出为数组，每项包含预计算的小写 title/url 以及必要的元信息
 */
function buildPreprocessedIndex(tree) {
    let idCounter = 1;
    const flat = [];

    function walk(node, parentId = null, path = []) {
        const nodeId = idCounter++;
        const isFolder = Array.isArray(node.children);

        const title = (node.title || '').trim();
        const url = node.url || '';

        flat.push({
            id: nodeId,
            parentId,
            type: isFolder ? 'folder' : 'bookmark',
            title,
            url,
            childrenCount: isFolder ? node.children.length : 0,
            path: path.join(' / '), // 可用于展示或进一步过滤
            __lcTitle: title.toLowerCase(),
            __lcUrl: url.toLowerCase(),
            // 预构建用于全文匹配的合并字段（可在 search-worker 中直接使用）
            __searchable: (title + ' ' + url).toLowerCase()
        });

        if (isFolder) {
            for (let i = 0; i < node.children.length; i++) {
                walk(node.children[i], nodeId, path.concat(title ? [title] : []));
            }
        }
    }

    for (let i = 0; i < tree.length; i++) {
        walk(tree[i], null, []);
    }

    return flat;
}

// 主消息处理函数
self.onmessage = async (event) => {
    if (event.data.action === ACTIONS.LOAD_DATA) {
        const bookmarksUrl = new URL('../../bookmarks.json', self.location.href).href;
        try {
            const response = await fetch(bookmarksUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const bookmarks = await response.json();

            // 构建预处理索引（扁平数组，包含预计算小写字段）
            let index = [];
            try {
                index = buildPreprocessedIndex(bookmarks);
            } catch (idxErr) {
                // 索引构建失败不应阻塞主数据返回，记录错误并继续返回原始数据
                console.error('Failed to build bookmarks index in data-worker:', idxErr);
            }

            // 生成书签数据哈希，用于在主线程及搜索Worker中更可靠地判断数据是否变化
            const dataString = JSON.stringify(bookmarks);
            const hash = fnv1aHash(dataString);

            // 返回原始树结构（保持向后兼容），同时附带预处理索引与数据哈希
            self.postMessage({ status: 'success', data: bookmarks, index: index, hash: hash });
        } catch (error) {
            self.postMessage({
                status: 'error',
                error: `Failed to load or parse bookmarks from ${bookmarksUrl}: ${error.message}`
            });
        }
    }
};
