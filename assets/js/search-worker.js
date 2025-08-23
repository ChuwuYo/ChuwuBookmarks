/**
 * 书签搜索Web Worker
 * 用于在后台线程处理搜索操作，避免阻塞主UI线程
 */

// 搜索结果缓存系统
const searchCache = new Map();

// 缓存键生成函数 - 确保选项顺序一致性
const generateCacheKey = (keyword, options = {}) => {
    // 对options的键进行排序，确保不同顺序的相同选项生成相同的key
    const sortedOptions = {};
    Object.keys(options).sort().forEach(key => {
        sortedOptions[key] = options[key];
    });
    return JSON.stringify({ keyword: keyword.toLowerCase(), options: sortedOptions });
};

// 监听来自主线程的消息
self.addEventListener('message', function(e) {
    const { action, data } = e.data;
    
    // 默认启用缓存，除非显式禁用
    // 修复：确保 data 存在且有 useCache 属性，否则默认为 true
    const useCache = data && data.useCache !== undefined ? data.useCache : true;

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
            const bookmarks = data.bookmarks || []; // 确保bookmarks存在
            const options = data.options || {}; // 确保options存在

            // 检查缓存
            if (useCache) {
                const cacheKey = generateCacheKey(keyword, options);
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
            const results = searchBookmarks(keyword, bookmarks, options);

            // 缓存结果 (仅在启用缓存时)
            if (useCache) {
                const cacheKey = generateCacheKey(keyword, options);
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
 * @param {string} [options.searchFields='title,url'] - 搜索范围 ('title', 'url', 'tags', 'all') (新增)
 * @returns {Array} - 搜索结果
 */
function searchBookmarks(keyword, data, options = {}) {
    const results = [];
    // 如果未提供关键词，直接返回空数组，避免不必要的遍历
    if (!keyword) {
        return results;
    }

    // 统一在函数入口处理大小写，避免在循环中重复转换
    const lowerKeyword = options.matchCase ? keyword : keyword.toLowerCase();

    // 设置默认选项，并进行解构赋值以提高可读性
    const {
        limit = 0,
        prioritizeFolders = true,
        matchCase = false, // 默认不区分大小写
        searchFields = 'title,url' // 默认搜索标题和URL
    } = options;

    const searchInTitle = searchFields.includes('title') || searchFields.includes('all');
    const searchInUrl = searchFields.includes('url') || searchFields.includes('all');
    // const searchInTags = searchFields.includes('tags') || searchFields.includes('all'); // 预留：未来可支持标签搜索

    // 递归搜索函数
    const stack = [...data]; // 初始化栈，包含顶层书签项

    while (stack.length > 0) {
        // 如果达到限制数量，停止搜索
        if (limit > 0 && results.length >= limit) {
            break;
        }

        const item = stack.pop(); // 从栈顶取出一个项目

        let isMatch = false;
        // 根据选项匹配标题
        if (searchInTitle && item.title) {
            const title = matchCase ? item.title : item.title.toLowerCase();
            if (title.includes(lowerKeyword)) {
                isMatch = true;
            }
        }

        // 根据选项匹配URL (如果尚未匹配标题)
        if (!isMatch && searchInUrl && item.url) {
            const url = matchCase ? item.url : item.url.toLowerCase();
            if (url.includes(lowerKeyword)) {
                isMatch = true;
            }
        }

        // // 预留：根据选项匹配标签 (如果尚未匹配)
        // if (!isMatch && searchInTags && item.tags && Array.isArray(item.tags)) {
        //     for (const tag of item.tags) {
        //         const lowerTag = matchCase ? tag : tag.toLowerCase();
        //         if (lowerTag.includes(lowerKeyword)) {
        //             isMatch = true;
        //             break;
        //         }
        //     }
        // }

        // 如果匹配，则添加到结果列表
        if (isMatch) {
            results.push(item);
        }

        // 如果是文件夹且有子项，将子项压入栈中继续处理
        // 注意：这里将子项逆序压栈，可以保持原始的深度优先遍历顺序（虽然对于搜索结果顺序影响不大。。。）
        if (item.children && item.children.length > 0) {
            for (let i = item.children.length - 1; i >= 0; i--) {
                stack.push(item.children[i]);
            }
        }
    }

    // 如果需要优先显示文件夹，对结果进行排序
    if (prioritizeFolders && results.length > 0) {
        results.sort((a, b) => {
            const aIsFolder = a.children !== undefined; // 更可靠的文件夹判断
            const bIsFolder = b.children !== undefined;
            if (aIsFolder && !bIsFolder) return -1;
            if (!aIsFolder && bIsFolder) return 1;
            // 可选：如果都是文件夹或都不是，可以按标题排序
            // return a.title.localeCompare(b.title);
            return 0;
        });
    }

    // 当前的实现不支持真正的"增量加载"返回部分结果。要实现增量加载，需要在Worker内部维护状态，并在找到一定数量结果后通过 postMessage 发送部分结果，然后继续搜索。
    // 这需要主线程和Worker之间更复杂的通信协议。目前的 'limit' 选项只是限制最终返回结果的总数。
    
    return results;
}