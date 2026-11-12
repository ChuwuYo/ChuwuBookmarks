import {
	getSearchSource,
	isFullDataReady,
	waitForFullData,
} from "../loader/index.js";
import { renderHome } from "../render/home.js";
import { loadingMessage, searchUnavailableMessage } from "../render/message.js";
import { renderSearchResults } from "../render/search.js";
import {
	isCurrentView,
	leaveView,
	showView,
	updateView,
} from "../render/view.js";
import { SEARCH_DEBOUNCE_CONSTANTS } from "../utils/constants.js";
import { debounce } from "../utils/index.js";
import { readSearchState, writeSearchState } from "../utils/url-state.js";
import { isCompact } from "../utils/viewport.js";
import { getSearchWorkerWrapper } from "../worker/index.js";

const searchIndex = {
	source: null,
	entries: [],
	worker: null,
};

const isFolder = (node) =>
	node.type === "folder" || Array.isArray(node.children);

const buildEntries = (tree) => {
	const entries = [];
	const walk = (nodes, parent) => {
		for (const node of nodes) {
			if (!node || typeof node !== "object") continue;
			const position = entries.push({ node, parent }) - 1;
			if (Array.isArray(node.children)) walk(node.children, position);
		}
	};
	walk(Array.isArray(tree) ? tree : [], -1);
	return entries;
};

const ensureEntries = () => {
	const source = getSearchSource();
	if (source !== searchIndex.source) {
		searchIndex.source = source;
		searchIndex.entries = buildEntries(source);
		searchIndex.worker = null;
	}
	return searchIndex.entries;
};

const syncIndex = (worker) => {
	ensureEntries();
	if (searchIndex.worker === worker) return true;
	const items = searchIndex.entries.map(({ node }) => [
		node.title ?? "",
		node.url ?? "",
	]);
	if (!getSearchWorkerWrapper().postMessage({ action: "setIndex", items })) {
		return false;
	}
	searchIndex.worker = worker;
	return true;
};

const linkParents = (position) => {
	let entry = searchIndex.entries[position];
	while (entry) {
		const parent = searchIndex.entries[entry.parent];
		if (isFolder(entry.node)) entry.node.parent = parent?.node ?? null;
		entry = parent;
	}
};

const toResults = (positions) =>
	positions.flatMap((position) => {
		const entry = searchIndex.entries[position];
		if (!entry) return [];
		if (isFolder(entry.node)) linkParents(position);
		return [entry.node];
	});

let workersWired = false;

const initSearchWorker = () => {
	if (workersWired) return;
	workersWired = true;

	getSearchWorkerWrapper().addMessageListener((e) => {
		const { action, id, positions, message } = e.data;
		if (action === "searchResults") {
			if (isCurrentView(id)) renderSearchResults(id, toResults(positions));
		} else if (action === "error") {
			console.error("[Search] Worker error:", message);
		}
	});
};

const postSearchToWorker = (keyword, view) => {
	const wrapper = getSearchWorkerWrapper();
	const worker = wrapper.getInstance();
	if (!worker || !syncIndex(worker)) return false;
	return wrapper.postMessage({ action: "search", id: view, keyword });
};

const startSearch = async (keyword) => {
	const view = showView({ content: [loadingMessage("正在搜索...")] });
	// 完整数据仍在后台加载时，等它就绪再搜索，避免只搜到目录结构
	if (!isFullDataReady()) await waitForFullData();
	if (!isCurrentView(view)) return;
	if (!postSearchToWorker(keyword, view)) {
		updateView(view, { content: [searchUnavailableMessage()] });
	}
};

const createSearchHandler = () => {
	// 防抖时长按数据量与设备类型分档；数据加载后档位可能变化，届时才换用新的防抖函数
	const getBookmarksCount = () => ensureEntries().length;

	const computeDebounceMs = (count) => {
		const {
			MIN_MS,
			MAX_MS,
			SMALL_DATA_THRESHOLD,
			MEDIUM_DATA_THRESHOLD,
			LARGE_DATA_THRESHOLD,
			SMALL_DATA_DESKTOP_MS,
			SMALL_DATA_MOBILE_MS,
			MEDIUM_DATA_DESKTOP_MS,
			MEDIUM_DATA_MOBILE_MS,
			LARGE_DATA_DESKTOP_MS,
			LARGE_DATA_MOBILE_MS,
			EXTRA_LARGE_DATA_MS,
		} = SEARCH_DEBOUNCE_CONSTANTS;

		const isMobile = isCompact();
		let ms;
		if (!count || count < SMALL_DATA_THRESHOLD)
			ms = isMobile ? SMALL_DATA_MOBILE_MS : SMALL_DATA_DESKTOP_MS;
		else if (count < MEDIUM_DATA_THRESHOLD)
			ms = isMobile ? MEDIUM_DATA_MOBILE_MS : MEDIUM_DATA_DESKTOP_MS;
		else if (count < LARGE_DATA_THRESHOLD)
			ms = isMobile ? LARGE_DATA_MOBILE_MS : LARGE_DATA_DESKTOP_MS;
		else ms = EXTRA_LARGE_DATA_MS;
		return Math.max(MIN_MS, Math.min(MAX_MS, ms));
	};

	const runSearch = (keyword) => {
		writeSearchState({ query: keyword, page: null });
		if (keyword) startSearch(keyword);
		else renderHome();
	};

	let debounceMs = 0;
	let debounced = null;
	return (keyword) => {
		leaveView();
		const ms = computeDebounceMs(getBookmarksCount());
		if (!debounced || ms !== debounceMs) {
			debounced?.cancel();
			debounceMs = ms;
			debounced = debounce(runSearch, ms);
		}
		debounced(keyword);
	};
};

const restoreSearchStateFromURL = () => {
	const { query: keyword } = readSearchState();
	if (!keyword) return;
	document.querySelector("bm-search").value = keyword;
	startSearch(keyword);
};

export { createSearchHandler, initSearchWorker, restoreSearchStateFromURL };
