// 常量定义消息动作
const ACTIONS = {
    LOAD_DATA: 'loadData',
};

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
            self.postMessage({ status: 'success', data: bookmarks });
        } catch (error) {
            self.postMessage({
                status: 'error',
                error: `Failed to load or parse bookmarks from ${bookmarksUrl}: ${error.message}`
            });
        }
    }
};
