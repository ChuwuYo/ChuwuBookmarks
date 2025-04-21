/**
 * 书签搜索Web Worker
 * 用于在后台线程处理搜索操作，避免阻塞主UI线程
 */

// 搜索结果缓存系统
const searchCache = new Map();

// 缓存键生成函数
const generateCacheKey = (keyword, options = {}) => {
    return JSON.stringify({ keyword, options });
};

// 监听来自主线程的消息
self.addEventListener('message', function(e) {
    const { action, data } = e.data;
    const useCache = data.useCache !== false; // 默认启用缓存
    
    // 根据不同的操作类型执行相应的处理
    switch(action) {
        case 'search':
            // 检查缓存
            if (useCache) {
                const cacheKey = generateCacheKey(data.keyword, data.options);
                if (searchCache.has(cacheKey)) {
                    // 返回缓存结果
                    self.postMessage({
                        action: 'searchResults',
                        results: searchCache.get(cacheKey),
                        fromCache: true
                    });
                    return;
                }
            }
            
            // 执行搜索
            const results = searchBookmarks(data.keyword, data.bookmarks, data.options);
            
            // 缓存结果
            if (useCache) {
                const cacheKey = generateCacheKey(data.keyword, data.options);
                searchCache.set(cacheKey, results);
            }
            
            // 将搜索结果发送回主线程
            self.postMessage({
                action: 'searchResults',
                results: results,
                fromCache: false
            });
            break;
            
        case 'clearCache':
            searchCache.clear();
            self.postMessage({
                action: 'cacheCleared'
            });
            break;
            
        default:
            self.postMessage({
                action: 'error',
                message: '未知操作类型'
            });
    }
});

/**
 * 搜索书签函数
 * @param {string} keyword - 搜索关键词
 * @param {Array} data - 书签数据
 * @param {Object} options - 搜索选项
 * @returns {Array} - 搜索结果
 */
function searchBookmarks(keyword, data, options = {}) {
    const results = [];
    keyword = keyword.toLowerCase();
    
    // 设置默认选项
    const opts = {
        limit: options.limit || 0, // 结果数量限制，0表示不限制
        prioritizeFolders: options.prioritizeFolders !== false, // 是否优先显示文件夹
        incrementalLoad: options.incrementalLoad || false // 是否启用增量加载
    };
    
    // 优化的递归搜索函数
    function searchItems(items) {
        // 使用for循环替代forEach以提高性能
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // 如果达到限制数量，停止搜索
            if (opts.limit > 0 && results.length >= opts.limit) {
                break;
            }
            
            // 匹配标题或URL
            if (item.title && item.title.toLowerCase().includes(keyword) || 
                (item.url && item.url.toLowerCase().includes(keyword))) {
                results.push(item);
            }
            
            // 递归搜索子项 - 只在有子项时处理
            if (item.children && item.children.length > 0) {
                searchItems(item.children);
            }
        }
    }
    
    searchItems(data);
    
    // 如果需要优先显示文件夹，对结果进行排序
    if (opts.prioritizeFolders && results.length > 0) {
        results.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            return 0;
        });
    }
    
    return results;
}