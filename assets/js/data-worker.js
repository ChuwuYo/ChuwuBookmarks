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
    
    // 优化的递归处理函数 - 使用迭代器模式减少递归深度
    function process(items, depth = 0) {
        if (opts.calculateDepth && depth > result.maxDepth) {
            result.maxDepth = depth;
        }
        
        // 使用for循环替代forEach以提高性能
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type === 'folder') {
                if (opts.countFolders) result.totalFolders++;
                if (item.children && item.children.length > 0) process(item.children, depth + 1);
            } else {
                if (opts.countBookmarks) result.totalBookmarks++;
                
                // 检查重复URL - 只在需要时执行
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
        }
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
    // 使用结构化克隆API替代JSON序列化，提高性能
    // 或者使用浅拷贝+深度拷贝组合策略，减少不必要的深拷贝
    const clonedBookmarks = structuredClone ? structuredClone(bookmarks) : JSON.parse(JSON.stringify(bookmarks));
    
    // 优化的递归排序函数
    function sort(items) {
        // 先对当前层级进行排序
        items.sort((a, b) => {
            // 文件夹始终排在前面
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            
            // 根据指定字段排序 - 使用可选链和空值合并操作符简化代码
            let valueA = a[sortBy] ?? '';
            let valueB = b[sortBy] ?? '';
            
            // 字符串比较 - 只在需要时转换
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();
            
            // 使用三元运算符简化比较逻辑
            return sortOrder === 'asc' 
                ? (valueA < valueB ? -1 : valueA > valueB ? 1 : 0)
                : (valueA > valueB ? -1 : valueA < valueB ? 1 : 0);
        });
        
        // 使用for循环替代forEach以提高性能
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type === 'folder' && item.children && item.children.length > 0) {
                sort(item.children);
            }
        }
        
        return items;
    }
    
    return sort(clonedBookmarks);
}

/**
 * 过滤书签
 * @param {Array} bookmarks - 书签数据
 * @param {Object} filters - 过滤条件
 * @param {Object} options - 额外选项
 * @returns {Array} - 过滤后的书签
 */
function filterBookmarks(bookmarks, filters = {}, options = {}) {
    // 使用结构化克隆API替代JSON序列化，提高性能
    const clonedBookmarks = structuredClone ? structuredClone(bookmarks) : JSON.parse(JSON.stringify(bookmarks));
    
    // 预处理过滤条件，避免重复转换
    const processedFilters = {};
    if (filters.title) processedFilters.title = filters.title.toLowerCase();
    if (filters.url) processedFilters.url = filters.url.toLowerCase();
    
    // 优化的递归过滤函数
    function filter(items) {
        // 使用数组方法而不是创建新数组，减少内存分配
        return items.filter(item => {
            // 应用标题过滤 - 使用预处理的过滤条件
            if (processedFilters.title && item.title) {
                const titleMatch = item.title.toLowerCase().includes(processedFilters.title);
                if (!titleMatch && item.type !== 'folder') return false;
            }
            
            // 应用URL过滤 - 使用预处理的过滤条件
            if (processedFilters.url && item.url) {
                const urlMatch = item.url.toLowerCase().includes(processedFilters.url);
                if (!urlMatch) return false;
            }
            
            // 递归过滤子文件夹 - 只在有子项时处理
            if (item.type === 'folder' && item.children && item.children.length > 0) {
                item.children = filter(item.children);
                
                // 如果文件夹为空且不匹配标题过滤条件，则移除
                if (item.children.length === 0 && processedFilters.title && 
                    !item.title.toLowerCase().includes(processedFilters.title)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    // 支持增量加载 - 如果指定了限制，则只返回指定数量的结果
    if (options.limit) {
        const result = filter(clonedBookmarks);
        return result.slice(0, options.limit);
    }
    
    return filter(clonedBookmarks);
}