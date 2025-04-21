/**
 * 数据处理Web Worker
 * 用于在后台线程处理大批量数据操作，避免阻塞主UI线程
 */

// 缓存系统 - 用于存储已处理过的数据结果
const cache = {
    process: new Map(),  // 处理结果缓存
    sort: new Map(),     // 排序结果缓存
    filter: new Map()    // 过滤结果缓存
};

// 缓存键生成函数
const generateCacheKey = (action, params) => {
    return JSON.stringify({ action, params });
};

// 监听来自主线程的消息
self.addEventListener('message', function(e) {
    const { action, data, useCache = true } = e.data;
    
    // 根据不同的操作类型执行相应的处理
    switch(action) {
        case 'processBookmarks':
            // 生成缓存键
            if (useCache) {
                const cacheKey = generateCacheKey('process', data.options);
                // 检查缓存中是否有结果
                if (cache.process.has(cacheKey)) {
                    // 直接返回缓存结果
                    self.postMessage({
                        action: 'processResult',
                        result: cache.process.get(cacheKey),
                        fromCache: true
                    });
                    return;
                }
            }
            
            // 处理数据
            const result = processBookmarks(data.bookmarks, data.options);
            
            // 缓存结果
            if (useCache) {
                const cacheKey = generateCacheKey('process', data.options);
                cache.process.set(cacheKey, result);
            }
            
            // 将处理结果发送回主线程
            self.postMessage({
                action: 'processResult',
                result: result,
                fromCache: false
            });
            break;
            
        case 'sortBookmarks':
            // 生成缓存键
            if (useCache) {
                const cacheKey = generateCacheKey('sort', { sortBy: data.sortBy, sortOrder: data.sortOrder });
                // 检查缓存中是否有结果
                if (cache.sort.has(cacheKey)) {
                    // 直接返回缓存结果
                    self.postMessage({
                        action: 'sortResult',
                        result: cache.sort.get(cacheKey),
                        fromCache: true
                    });
                    return;
                }
            }
            
            // 排序数据
            const sorted = sortBookmarks(data.bookmarks, data.sortBy, data.sortOrder);
            
            // 缓存结果
            if (useCache) {
                const cacheKey = generateCacheKey('sort', { sortBy: data.sortBy, sortOrder: data.sortOrder });
                cache.sort.set(cacheKey, sorted);
            }
            
            self.postMessage({
                action: 'sortResult',
                result: sorted,
                fromCache: false
            });
            break;
            
        case 'filterBookmarks':
            // 生成缓存键
            if (useCache) {
                const cacheKey = generateCacheKey('filter', data.filters);
                // 检查缓存中是否有结果
                if (cache.filter.has(cacheKey)) {
                    // 直接返回缓存结果
                    self.postMessage({
                        action: 'filterResult',
                        result: cache.filter.get(cacheKey),
                        fromCache: true
                    });
                    return;
                }
            }
            
            // 过滤数据
            const filtered = filterBookmarks(data.bookmarks, data.filters);
            
            // 缓存结果
            if (useCache) {
                const cacheKey = generateCacheKey('filter', data.filters);
                cache.filter.set(cacheKey, filtered);
            }
            
            self.postMessage({
                action: 'filterResult',
                result: filtered,
                fromCache: false
            });
            break;
            
        case 'clearCache':
            // 清除缓存
            cache.process.clear();
            cache.sort.clear();
            cache.filter.clear();
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
 * 处理书签数据
 * @param {Array} bookmarks - 书签数据
 * @param {Object} options - 处理选项
 * @returns {Object} - 处理结果
 */
function processBookmarks(bookmarks, options = {}) {
    // 默认处理选项
    const defaultOptions = {
        countFolders: true,
        countBookmarks: true,
        calculateDepth: false,
        findDuplicates: false
    };
    
    const opts = { ...defaultOptions, ...options };
    const result = {
        totalFolders: 0,
        totalBookmarks: 0,
        maxDepth: 0,
        duplicates: []
    };
    
    // 用于检测重复项的Map
    const urlMap = new Map();
    
    // 递归处理函数
    function process(items, depth = 0) {
        if (opts.calculateDepth && depth > result.maxDepth) {
            result.maxDepth = depth;
        }
        
        items.forEach(item => {
            if (item.type === 'folder') {
                if (opts.countFolders) result.totalFolders++;
                if (item.children) process(item.children, depth + 1);
            } else {
                if (opts.countBookmarks) result.totalBookmarks++;
                
                // 检查重复URL
                if (opts.findDuplicates && item.url) {
                    if (urlMap.has(item.url)) {
                        result.duplicates.push({
                            url: item.url,
                            titles: [urlMap.get(item.url).title, item.title]
                        });
                    } else {
                        urlMap.set(item.url, { title: item.title });
                    }
                }
            }
        });
    }
    
    process(bookmarks);
    return result;
}

/**
 * 排序书签
 * @param {Array} bookmarks - 书签数据
 * @param {string} sortBy - 排序字段
 * @param {string} sortOrder - 排序顺序
 * @returns {Array} - 排序后的书签
 */
function sortBookmarks(bookmarks, sortBy = 'title', sortOrder = 'asc') {
    // 深拷贝书签数据，避免修改原始数据
    const clonedBookmarks = JSON.parse(JSON.stringify(bookmarks));
    
    // 递归排序函数
    function sort(items) {
        // 先对当前层级进行排序
        items.sort((a, b) => {
            // 文件夹始终排在前面
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            
            // 根据指定字段排序
            let valueA = a[sortBy] || '';
            let valueB = b[sortBy] || '';
            
            // 字符串比较
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();
            
            // 根据排序顺序返回比较结果
            if (sortOrder === 'asc') {
                return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
            } else {
                return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
            }
        });
        
        // 递归排序子文件夹
        items.forEach(item => {
            if (item.type === 'folder' && item.children) {
                sort(item.children);
            }
        });
        
        return items;
    }
    
    return sort(clonedBookmarks);
}

/**
 * 过滤书签
 * @param {Array} bookmarks - 书签数据
 * @param {Object} filters - 过滤条件
 * @returns {Array} - 过滤后的书签
 */
function filterBookmarks(bookmarks, filters = {}) {
    // 深拷贝书签数据，避免修改原始数据
    const clonedBookmarks = JSON.parse(JSON.stringify(bookmarks));
    
    // 递归过滤函数
    function filter(items) {
        return items.filter(item => {
            // 应用标题过滤
            if (filters.title && item.title) {
                const titleMatch = item.title.toLowerCase().includes(filters.title.toLowerCase());
                if (!titleMatch && item.type !== 'folder') return false;
            }
            
            // 应用URL过滤
            if (filters.url && item.url) {
                const urlMatch = item.url.toLowerCase().includes(filters.url.toLowerCase());
                if (!urlMatch) return false;
            }
            
            // 递归过滤子文件夹
            if (item.type === 'folder' && item.children) {
                item.children = filter(item.children);
                
                // 如果文件夹为空且不匹配标题过滤条件，则移除
                if (item.children.length === 0 && filters.title && !item.title.toLowerCase().includes(filters.title.toLowerCase())) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    return filter(clonedBookmarks);
}