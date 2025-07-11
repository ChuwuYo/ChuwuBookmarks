
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


