// 常量定义消息动作
const ACTIONS = {
    LOAD_DATA: 'loadData',
    LOAD_STRUCTURE: 'loadStructure',
    LOAD_FULL_DATA: 'loadFullData',
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
            __lcUrl: url.toLowerCase()
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

/**
 * 从目录结构数据转换为与完整书签格式兼容的格式
 * structure.json 中只有文件夹信息，需要转换为网站期望的格式
 */
function convertStructureToBookmarks(structure) {
    if (!structure || !structure.folders) {
        return null;
    }
    
    function convertFolder(folder) {
        const result = {
            type: 'folder',
            title: folder.title,
            id: folder.id,
            // 标记为懒加载文件夹，children 需要后续从完整数据加载
            _lazyLoad: true,
            _hasChildren: folder.hasChildren,
            _linkCount: folder.linkCount || 0,
            children: []
        };
        
        // 如果有子文件夹，递归转换
        if (folder.children && folder.children.length > 0) {
            result.children = folder.children.map(convertFolder);
        }
        
        return result;
    }
    
    return structure.folders.map(convertFolder);
}

/**
 * 将完整数据合并到结构数据中
 * 遍历结构中的懒加载文件夹，从完整数据中填充其 children
 */
function mergeFullDataIntoStructure(structureData, fullData) {
    // 构建一个ID到完整数据节点的映射
    const fullDataMap = new Map();
    
    function buildMap(nodes) {
        nodes.forEach(node => {
            if (node.id) {
                fullDataMap.set(node.id, node);
            }
            if (node.children) {
                buildMap(node.children);
            }
        });
    }
    buildMap(fullData);
    
    // 遍历结构数据，填充懒加载文件夹的 children
    function fillChildren(nodes) {
        nodes.forEach(node => {
            if (node._lazyLoad && node.id) {
                const fullNode = fullDataMap.get(node.id);
                if (fullNode && fullNode.children) {
                    node.children = fullNode.children;
                    node._lazyLoad = false;
                }
            }
            if (node.children) {
                fillChildren(node.children);
            }
        });
    }
    fillChildren(structureData);
    
    return structureData;
}

// 主消息处理函数
self.onmessage = async (event) => {
    const { action } = event.data;
    
    // 处理加载目录结构请求（新的懒加载模式）
    if (action === ACTIONS.LOAD_STRUCTURE) {
        const structureUrl = new URL('../../structure.json', self.location.href).href;
        try {
            const response = await fetch(structureUrl);
            if (!response.ok) {
                // structure.json 不存在，通知主线程回退到完整加载
                self.postMessage({
                    status: 'structure_not_found',
                    message: 'structure.json not found, fallback to full load'
                });
                return;
            }
            const structure = await response.json();
            const bookmarksData = convertStructureToBookmarks(structure);
            
            if (!bookmarksData) {
                self.postMessage({
                    status: 'structure_not_found',
                    message: 'Invalid structure.json format'
                });
                return;
            }
            
            // 生成结构数据的哈希
            const hash = fnv1aHash(JSON.stringify(structure));
            
            self.postMessage({
                status: 'structure_loaded',
                data: bookmarksData,
                structureVersion: structure.version || 1,
                generated: structure.generated,
                hash: hash
            });
        } catch (error) {
            // 加载失败，通知主线程回退到完整加载
            self.postMessage({
                status: 'structure_not_found',
                message: `Failed to load structure.json: ${error.message}`
            });
        }
    }
    
    // 处理加载完整数据请求（后台异步加载或回退模式）
    if (action === ACTIONS.LOAD_FULL_DATA || action === ACTIONS.LOAD_DATA) {
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
            self.postMessage({
                status: 'success',
                data: bookmarks,
                index: index,
                hash: hash,
                isFullData: true
            });
        } catch (error) {
            self.postMessage({
                status: 'error',
                error: `Failed to load or parse bookmarks from ${bookmarksUrl}: ${error.message}`
            });
        }
    }
};
