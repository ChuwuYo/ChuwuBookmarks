/**
 * 书签搜索Web Worker
 * 用于在后台线程处理搜索操作，避免阻塞主UI线程
 */

// 监听来自主线程的消息
self.addEventListener('message', function(e) {
    const { action, data } = e.data;
    
    // 根据不同的操作类型执行相应的处理
    switch(action) {
        case 'search':
            const results = searchBookmarks(data.keyword, data.bookmarks);
            // 将搜索结果发送回主线程
            self.postMessage({
                action: 'searchResults',
                results: results
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
 * @returns {Array} - 搜索结果
 */
function searchBookmarks(keyword, data) {
    const results = [];
    keyword = keyword.toLowerCase();
    
    // 递归搜索函数
    function searchItems(items) {
        items.forEach(item => {
            // 匹配标题或URL
            if (item.title.toLowerCase().includes(keyword) || 
                (item.url && item.url.toLowerCase().includes(keyword))) {
                results.push(item);
            }
            // 递归搜索子项
            if (item.children) searchItems(item.children);
        });
    }
    
    searchItems(data);
    return results;
}