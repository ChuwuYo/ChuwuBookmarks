/**
 * 搜索相关事件监听模块
 */

/**
 * 初始化搜索相关事件监听
 * @param {Function} debounceSearch - 防抖后的搜索函数
 */
const initSearchListeners = (debounceSearch) => {
	const searchInput = document.getElementById("search-input");
	if (searchInput) {
		// 搜索框事件处理
		searchInput.addEventListener("input", debounceSearch);
		searchInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				debounceSearch(e);
			}
		});

		// 添加Ctrl+K快捷键聚焦搜索框功能
		document.addEventListener("keydown", function handleSearchFocus(e) {
			if (e.ctrlKey && e.key.toLowerCase() === "k") {
				e.preventDefault();
				// 检查 searchInput 是否仍在 DOM 中
				const currentSearchInput = document.getElementById("search-input");
				if (currentSearchInput) {
					currentSearchInput.focus();
				}
			}
		});
	}
};

export { initSearchListeners };
