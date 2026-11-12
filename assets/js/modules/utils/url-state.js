/**
 * 地址栏中搜索状态（q 关键词、page 页码）的唯一读写入口。
 * 只用 history.replaceState，不新增历史记录。
 */

/** 当前地址中的搜索状态：query 无则为 ""，page 无则为 null，否则为解析出的整数（可能是 NaN） */
const readSearchState = () => {
	const params = new URLSearchParams(window.location.search);
	return {
		query: params.get("q") ?? "",
		page: params.has("page")
			? Number.parseInt(params.get("page") ?? "", 10)
			: null,
	};
};

/**
 * 更新地址中的搜索状态，只改动传入的字段：
 * query 为空时删除 q；page 不大于 1 或为 null 时删除 page。
 */
const writeSearchState = (changes) => {
	const url = new URL(window.location.href);
	if ("query" in changes) {
		if (changes.query) url.searchParams.set("q", changes.query);
		else url.searchParams.delete("q");
	}
	if ("page" in changes) {
		if (changes.page > 1) url.searchParams.set("page", String(changes.page));
		else url.searchParams.delete("page");
	}
	if (url.href === window.location.href) return;
	window.history.replaceState(window.history.state, "", url.href);
};

export { readSearchState, writeSearchState };
