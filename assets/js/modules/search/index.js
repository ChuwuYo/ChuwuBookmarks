import {
	getSearchSource,
	isFullDataReady,
	waitForFullData,
} from "../loader/index.js";
import { renderHome } from "../render/home.js";
import { renderLoading } from "../render/message.js";
import {
	renderSearchResults,
	resetSearchPagination,
} from "../render/search.js";
import { SEARCH_DEBOUNCE_CONSTANTS } from "../utils/constants.js";
import { debounce } from "../utils/index.js";
import { readSearchState, writeSearchState } from "../utils/url-state.js";
import { isCompact } from "../utils/viewport.js";
import { getSearchWorkerWrapper, isWorkerSupported } from "../worker/index.js";

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

let searchGeneration = 0;

let workersWired = false;

const initSearchWorker = () => {
	if (!isWorkerSupported()) {
		console.warn(
			"[Search] Web Worker not supported, search functionality unavailable",
		);
		return;
	}

	if (workersWired) {
		return;
	}
	workersWired = true;

	getSearchWorkerWrapper().addMessageListener((e) => {
		const { action, id, positions, message } = e.data;
		if (action === "searchResults") {
			if (id !== searchGeneration) return;
			renderSearchResults(toResults(positions));
		} else if (action === "error") {
			console.error("[Search] Worker error:", message);
		}
	});
};

const cancelPendingSearch = () => {
	searchGeneration++;
};

const postSearchToWorker = (keyword) => {
	if (!isWorkerSupported()) return null;
	const generation = ++searchGeneration;

	const post = () => {
		const wrapper = getSearchWorkerWrapper();
		const worker = wrapper.getInstance();
		if (!worker || !syncIndex(worker)) return false;
		return wrapper.postMessage({ action: "search", id: generation, keyword });
	};

	// 完整数据仍在后台加载时，等它就绪再搜索，避免只搜到目录结构
	if (!isFullDataReady()) {
		waitForFullData().then(() => {
			if (generation !== searchGeneration) return;
			post();
		});
		return true;
	}
	return post();
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
		if (!keyword) {
			cancelPendingSearch();
			renderHome();
			resetPaginationState();
			return;
		}

		resetPaginationState();

		const content = document.getElementById("content");
		renderLoading(content, "正在搜索...");

		const posted = postSearchToWorker(keyword);
		if (!posted) {
			const errorMessage = document.createElement("div");
			errorMessage.className =
				"centered-message error-message centered-element vertical-center";
			errorMessage.textContent = "浏览器不支持Web Worker，无法进行搜索";
			if (isCompact()) {
				content.replaceChildren();
				document.body.appendChild(errorMessage);
			} else {
				content.replaceChildren(errorMessage);
			}
		}
	};

	let debounceMs = 0;
	let debounced = null;
	return (keyword) => {
		cancelPendingSearch();
		const ms = computeDebounceMs(getBookmarksCount());
		if (!debounced || ms !== debounceMs) {
			debounced?.cancel();
			debounceMs = ms;
			debounced = debounce(runSearch, ms);
		}
		debounced(keyword);
	};
};

const resetPaginationState = () => {
	resetSearchPagination();
	writeSearchState({ page: null });
};

const restoreSearchStateFromURL = () => {
	const { query: keyword } = readSearchState();

	if (keyword) {
		const search = document.querySelector("bm-search");
		if (search) {
			search.value = keyword;
			triggerSearch(keyword);
		}
	}
};

const triggerSearch = (keyword) => {
	const posted = postSearchToWorker(keyword);
	if (!posted) {
		console.warn("[Search] Failed to trigger search for keyword:", keyword);
	}
};

export { createSearchHandler, initSearchWorker, restoreSearchStateFromURL };
