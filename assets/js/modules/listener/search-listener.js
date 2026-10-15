/**
 * 搜索相关事件监听模块
 */

/**
 * 把 <bm-search> 的输入交给防抖搜索
 * @param {Function} debounceSearch - 防抖后的搜索函数（接收原始输入事件）
 */
const initSearchListeners = (debounceSearch) => {
	document
		.querySelector("bm-search")
		?.addEventListener("bm-search", (event) =>
			debounceSearch(event.detail.originalEvent),
		);
};

export { initSearchListeners };
