/**
 * 书签搜索Web Worker
 * 用于在后台线程处理搜索操作，避免阻塞主UI线程
 */

// LRU缓存类
class LRUCache {
    constructor(maxSize) {
        this.maxSize = maxSize;
        this.cache = new Map();
    }

    get(key) {
        const value = this.cache.get(key);
        if (value !== undefined) {
            // 将最近访问的项移到末尾（最近使用）
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }

    set(key, value) {
        // 如果键已存在，先删除它
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            // 如果缓存已满，删除最久未使用的项（第一个项）
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        // 将新项添加到末尾（最近使用）
        this.cache.set(key, value);
    }

    clear() {
        this.cache.clear();
    }

    has(key) {
        // 独立检查键是否存在，不改变LRU顺序
        return this.cache.has(key);
    }
}

// 搜索结果缓存系统 - 使用LRU缓存，最大容量100项
const searchCache = new LRUCache(100);

// 缓存键生成函数 - 确保选项顺序一致性且尊重 matchCase
function stableStringify(obj) {
    if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
    if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']';
    const keys = Object.keys(obj).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}';
}

const generateCacheKey = (keyword, options = {}, indexKey = '') => {
    const matchCase = !!options.matchCase;
    const keyWordPart = matchCase ? String(keyword) : String(keyword).toLowerCase();
    // include indexKey (可以是 index.length 或 data hash) 以便在数据变更时使缓存失效
    return stableStringify({ keyword: keyWordPart, options, indexKey });
};

// 监听来自主线程的消息
self.addEventListener('message', function(e) {
    const { action, data } = e.data ?? {};
    
    // 默认启用缓存，除非显式禁用
    const useCache = data?.useCache ?? true;

    // 根据不同的操作类型执行相应的处理
    switch(action) {
        case 'search':
            // 确保 data 存在
            if (!data) {
                self.postMessage({
                    action: 'error',
                    message: '搜索数据不完整'
                });
                return;
            }
            
            const keyword = data.keyword || ''; // 确保keyword存在
            const bookmarks = Array.isArray(data.bookmarks) ? data.bookmarks : [];
            const index = Array.isArray(data.index) ? data.index : null; // 优先使用扁平索引
            const options = data.options || {}; // 确保options存在

            // 如果关键词为空，直接返回空结果，不使用缓存
            if (!keyword) {
                self.postMessage({
                    action: 'searchResults',
                    results: [],
                    fromCache: false
                });
                return;
            }

            // 优先使用传入的 indexHash 作为缓存区分键；若不存在则回退到 index 长度（兼容旧逻辑）
            const indexKey = data.indexHash || (index ? index.length : bookmarks.length);
 
            // 检查缓存（缓存内已存入深拷贝，直接使用；postMessage 会进行结构化克隆，主线程收到的是独立副本）
            if (useCache) {
                const cacheKey = generateCacheKey(keyword, options, indexKey);
                if (searchCache.has(cacheKey)) {
                    const cachedResult = searchCache.get(cacheKey);
                    self.postMessage({
                        action: 'searchResults',
                        results: cachedResult,
                        fromCache: true
                    });
                    return;
                }
            }

            // 执行搜索：优先使用扁平索引（index），否则回退到树形结构（bookmarks）
            const source = index || bookmarks;
            const results = searchBookmarks(keyword, source, options);

            // 缓存结果 (仅在启用缓存时)，存入深拷贝以避免引用外部可变对象
            if (useCache) {
                const cacheKey = generateCacheKey(keyword, options, indexKey);
                searchCache.set(cacheKey, JSON.parse(JSON.stringify(results)));
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
                message: `未知操作类型: ${action}`
            });
    }
});

/**
 * 搜索书签函数
 * @param {string} keyword - 搜索关键词
 * @param {Array} data - 书签数据
 * @param {Object} options - 搜索选项
 * @param {number} [options.limit=0] - 结果数量限制，0表示不限制
 * @param {boolean} [options.prioritizeFolders=true] - 是否优先显示文件夹
 * @param {boolean} [options.matchCase=false] - 是否区分大小写
 * @param {string} [options.searchFields='title,url'] - 搜索范围 ('title', 'url', 'tags', 'all')
 * @returns {Array} - 搜索结果
 */
function searchBookmarks(keyword, data, options = {}) {
    const results = [];
    // 如果未提供关键词，直接返回空数组，避免不必要的遍历
    if (!keyword) {
        return results;
    }
 
    // 设置默认选项，并进行解构赋值以提高可读性
    const {
        limit = 0,
        prioritizeFolders = true,
        matchCase = false, // 默认不区分大小写
        searchFields = 'title,url' // 默认搜索标题和URL
    } = options;
    
    // 统一在函数入口处理大小写，避免在循环中重复转换
    const lowerKeyword = matchCase ? keyword : keyword.toLowerCase();
 
    const searchInTitle = searchFields.includes('title') || searchFields.includes('all');
    const searchInUrl = searchFields.includes('url') || searchFields.includes('all');
 
    // 检测是否为扁平索引（预处理索引）
    const isFlatIndex = Array.isArray(data) && data.length > 0 && (data[0].__lcTitle !== undefined);
    
    // 提取公共的匹配逻辑到独立函数中
    const itemMatches = (item) => {
        let isMatch = false;
        const lcTitle = isFlatIndex ? (item.__lcTitle || item.title.toLowerCase()) : item.title?.toLowerCase();
        const lcUrl = isFlatIndex ? (item.__lcUrl || item.url.toLowerCase()) : item.url?.toLowerCase();

        if (searchInTitle && item.title) {
            const title = matchCase ? item.title : lcTitle;
            if (title.includes(lowerKeyword)) {
                isMatch = true;
            }
        }

        if (!isMatch && searchInUrl && item.url) {
            const url = matchCase ? item.url : lcUrl;
            if (url.includes(lowerKeyword)) {
                isMatch = true;
            }
        }
        return isMatch;
    };
 
    if (isFlatIndex) {
        // 扁平索引搜索：直接迭代数组，利用预计算的小写字段提升性能
        for (let i = 0; i < data.length; i++) {
            if (limit > 0 && results.length >= limit) break;
            const item = data[i];
            if (itemMatches(item)) {
                results.push(item);
            }
        }
    } else {
        // 回退到原始的树形结构搜索（深度优先）
        const stack = [...data]; // 初始化栈，包含顶层书签项
        while (stack.length > 0) {
            if (limit > 0 && results.length >= limit) break;
            const item = stack.pop();
            
            if (itemMatches(item)) {
                results.push(item);
            }
 
            if (item.children?.length > 0) {
                for (let i = item.children.length - 1; i >= 0; i--) {
                    stack.push(item.children[i]);
                }
            }
        }
    }
 
    // 如果需要优先显示文件夹，对结果进行排序
    if (prioritizeFolders && results.length > 0) {
        results.sort((a, b) => {
            const aIsFolder = a.children !== undefined || a.type === 'folder';
            const bIsFolder = b.children !== undefined || b.type === 'folder';
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            return 0;
        });
    }
 
    return results;
}