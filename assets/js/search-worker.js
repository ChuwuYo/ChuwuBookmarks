/**
 * 书签搜索 Web Worker
 *
 * 索引常驻在 Worker 中：主线程只在数据变化时发送一次标题与网址（setIndex），
 * 之后每次搜索只发送关键词，返回命中条目的下标。
 *
 * 匹配规则：关键词按空白拆成多个词，每个词都要出现在标题或网址中（不分大小写，
 * 全角半角视为相同）。排序：标题以关键词开头 > 所有词都在标题中 > 部分词在标题中 >
 * 只在网址中命中；同一档内保持书签原有顺序。
 */

/** @type {{ title: string, url: string }[]} */
let entries = [];

const normalize = (text) => (text ? text.normalize("NFKC").toLowerCase() : "");

const setIndex = (items) => {
	entries = items.map(([title, url]) => ({
		title: normalize(title),
		url: normalize(url),
	}));
};

const search = (keyword) => {
	const words = normalize(keyword).split(/\s+/).filter(Boolean);
	if (!words.length) return [];
	// 连续空白按一个空格算，与拆分后的词保持一致
	const query = words.join(" ");

	// 每档一个数组，最后按档位拼接，档内保持原顺序
	const tiers = [[], [], [], []];
	for (let i = 0; i < entries.length; i++) {
		const { title, url } = entries[i];
		let inTitle = 0;
		let matched = true;
		for (const word of words) {
			if (title.includes(word)) inTitle++;
			else if (!url.includes(word)) {
				matched = false;
				break;
			}
		}
		if (!matched) continue;

		let tier = 3;
		if (inTitle === words.length) tier = title.startsWith(query) ? 0 : 1;
		else if (inTitle > 0) tier = 2;
		tiers[tier].push(i);
	}
	return tiers.flat();
};

self.addEventListener("message", (event) => {
	const { action, id, keyword, items } = event.data ?? {};
	switch (action) {
		case "setIndex":
			setIndex(Array.isArray(items) ? items : []);
			break;
		case "search":
			self.postMessage({
				action: "searchResults",
				id,
				positions: search(String(keyword ?? "")),
			});
			break;
		default:
			self.postMessage({ action: "error", message: `未知操作类型: ${action}` });
	}
});
