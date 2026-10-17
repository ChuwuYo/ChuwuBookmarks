const initSearchListeners = (debounceSearch) => {
	document
		.querySelector("bm-search")
		?.addEventListener("bm-search", (event) =>
			debounceSearch(event.detail.originalEvent),
		);
};

export { initSearchListeners };
