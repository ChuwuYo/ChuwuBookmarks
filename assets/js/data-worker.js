
importScripts('oboe-browser.min.js');

// Main message handler
self.onmessage = (event) => {
    if (event.data.action === 'loadData') {
        const bookmarks = [];
        oboe('../../bookmarks.json')
            .node('!.[]', (item) => {
                bookmarks.push(item);
                return oboe.drop; // Free up memory as we go
            })
            .done(() => {
                // On success, send the entire dataset back in one go
                self.postMessage({ status: 'success', data: bookmarks });
            })
            .fail((error) => {
                // On failure, report the error
                self.postMessage({ status: 'error', error: `Failed to load or parse bookmarks.json: ${error.thrown || 'Unknown error'}` });
            });
    }
};

// The following functions are preserved for potential future use but are not called by the primary message handler.

const cache = {
    process: new Map(),
    sort: new Map(),
    filter: new Map()
};

const generateCacheKey = (action, params) => {
    return JSON.stringify({ action, params });
};

function processBookmarks(bookmarks, options = {}) {
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
    
    const urlMap = new Map();
    
    function process(items, depth = 0) {
        if (opts.calculateDepth && depth > result.maxDepth) {
            result.maxDepth = depth;
        }
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type === 'folder') {
                if (opts.countFolders) result.totalFolders++;
                if (item.children && item.children.length > 0) process(item.children, depth + 1);
            } else {
                if (opts.countBookmarks) result.totalBookmarks++;
                
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

function sortBookmarks(bookmarks, sortBy = 'title', sortOrder = 'asc') {
    const clonedBookmarks = structuredClone ? structuredClone(bookmarks) : JSON.parse(JSON.stringify(bookmarks));
    
    function sort(items) {
        items.sort((a, b) => {
            if (a.type === 'folder' && b.type !== 'folder') return -1;
            if (a.type !== 'folder' && b.type === 'folder') return 1;
            
            let valueA = a[sortBy] ?? '';
            let valueB = b[sortBy] ?? '';
            
            if (typeof valueA === 'string') valueA = valueA.toLowerCase();
            if (typeof valueB === 'string') valueB = valueB.toLowerCase();
            
            return sortOrder === 'asc' 
                ? (valueA < valueB ? -1 : valueA > valueB ? 1 : 0)
                : (valueA > valueB ? -1 : valueA < valueB ? 1 : 0);
        });
        
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

function filterBookmarks(bookmarks, filters = {}, options = {}) {
    const clonedBookmarks = structuredClone ? structuredClone(bookmarks) : JSON.parse(JSON.stringify(bookmarks));
    
    const processedFilters = {};
    if (filters.title) processedFilters.title = filters.title.toLowerCase();
    if (filters.url) processedFilters.url = filters.url.toLowerCase();
    
    function filter(items) {
        return items.filter(item => {
            if (processedFilters.title && item.title) {
                const titleMatch = item.title.toLowerCase().includes(processedFilters.title);
                if (!titleMatch && item.type !== 'folder') return false;
            }
            
            if (processedFilters.url && item.url) {
                const urlMatch = item.url.toLowerCase().includes(processedFilters.url);
                if (!urlMatch) return false;
            }
            
            if (item.type === 'folder' && item.children && item.children.length > 0) {
                item.children = filter(item.children);
                
                if (item.children.length === 0 && processedFilters.title && 
                    !item.title.toLowerCase().includes(processedFilters.title)) {
                    return false;
                }
            }
            
            return true;
        });
    }
    
    if (options.limit) {
        const result = filter(clonedBookmarks);
        return result.slice(0, options.limit);
    }
    
    return filter(clonedBookmarks);
}
