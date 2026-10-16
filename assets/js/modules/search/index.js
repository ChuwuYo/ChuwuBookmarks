/**
 * 搜索功能模块
 *
 * 本模块负责处理搜索功能的核心逻辑，包括：
 * - Web Worker搜索处理
 * - 分页状态管理
 * - URL状态保持（?q=）
 *
 * 新搜索总是从第一页开始。
 *
 * 性能优化：
 * - 使用Web Worker进行搜索，避免阻塞主线程
 * - 索引常驻 Worker，每次搜索只传关键词
 * - 防抖处理，避免频繁搜索请求
 */

import {
	getSearchSource,
	isFullDataReady,
	waitForFullData,
} from "../loader/index.js";
import { getDeviceType } from "../render/device.js";
import { renderHome } from "../render/home.js";
import {
	renderSearchResults,
	resetSearchPagination,
} from "../render/search.js";
import { SEARCH_DEBOUNCE_CONSTANTS } from "../utils/constants.js";
import { debounce } from "../utils/index.js";
import { getSearchWorkerWrapper, isWorkerSupported } from "../worker/index.js";

/**
 * 可搜索条目：书签树的扁平列表，下标与 Worker 中的索引一一对应。
 * 结果直接取自书签树的节点，点击文件夹结果与侧边栏进入的是同一个对象。
 */
const searchIndex = {
	/** 构建索引时使用的书签树 */
	source: null,
	/** @type {{ node: object, parent: number }[]} parent 为父文件夹条目下标，-1 表示顶层 */
	entries: [],
	/** 已收到当前索引的 Worker 实例（Worker 出错重建后需要重新发送） */
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

/** 书签数据变化时重建条目列表 */
const ensureEntries = () => {
	const source = getSearchSource();
	if (source !== searchIndex.source) {
		searchIndex.source = source;
		searchIndex.entries = buildEntries(source);
		searchIndex.worker = null;
	}
	return searchIndex.entries;
};

/** 数据或 Worker 实例变化时重建并发送索引 */
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

/** 文件夹结果补上父级引用，面包屑才能显示完整路径 */
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

/** 每次发起或取消搜索时递增；Worker 返回的结果编号不是最新时直接丢弃 */
let searchGeneration = 0;

// 标记Worker是否已初始化
let workersWired = false;

// 检查浏览器是否支持Web Worker并初始化
const initSearchWorker = (renderMainContent) => {
	if (!isWorkerSupported()) {
		console.warn(
			"[Search] Web Worker not supported, search functionality unavailable",
		);
		return;
	}

	// 避免重复初始化监听器
	if (workersWired) {
		return;
	}
	workersWired = true;

	getSearchWorkerWrapper().addMessageListener((e) => {
		const { action, id, positions, message } = e.data;
		if (action === "searchResults") {
			if (id !== searchGeneration) return;
			renderSearchResults(toResults(positions), renderMainContent);
		} else if (action === "error") {
			console.error("[Search] Worker error:", message);
		}
	});
};

/** 使尚未返回的搜索失效（清空搜索框、返回主页时调用） */
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

	const computeDebounceMsSafe = (count) => {
		const {
			DEFAULT_MS,
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

		try {
			// 使用统一的设备检测函数
			const isMobile = getDeviceType() === "mobile";
			let ms;
			if (!count || count < SMALL_DATA_THRESHOLD)
				ms = isMobile ? SMALL_DATA_MOBILE_MS : SMALL_DATA_DESKTOP_MS;
			else if (count < MEDIUM_DATA_THRESHOLD)
				ms = isMobile ? MEDIUM_DATA_MOBILE_MS : MEDIUM_DATA_DESKTOP_MS;
			else if (count < LARGE_DATA_THRESHOLD)
				ms = isMobile ? LARGE_DATA_MOBILE_MS : LARGE_DATA_DESKTOP_MS;
			else ms = EXTRA_LARGE_DATA_MS;
			ms = Math.max(MIN_MS, Math.min(MAX_MS, ms));
			return ms;
		} catch (_e) {
			return DEFAULT_MS;
		}
	};

	const runSearch = (event) => {
		const keyword = event.target.value.trim();
		if (!keyword) {
			cancelPendingSearch();
			// 搜索框为空时返回主页，不重新渲染侧边栏
			renderHome();
			// 重置分页状态
			resetPaginationState();
			return;
		}

		// 新搜索时重置分页状态到第一页
		resetPaginationState();

		// 显示加载指示器
		const content = document.getElementById("content");
		const loadingIndicator = document.createElement("div");
		loadingIndicator.className = "loading-indicator search-loading";

		const heading = document.createElement("h2");
		heading.textContent = "正在搜索...";

		const spinner = document.createElement("div");
		spinner.className = "loading-spinner";

		loadingIndicator.appendChild(heading);
		loadingIndicator.appendChild(spinner);

		content.innerHTML = "";
		content.appendChild(loadingIndicator);

		// 从缓存读取数据并发送给搜索Worker（如果存在）
		const posted = postSearchToWorker(keyword);
		if (!posted) {
			// 如果不支持Web Worker，显示错误信息
			const errorMessage = document.createElement("div");
			errorMessage.className =
				"centered-message error-message centered-element vertical-center";
			errorMessage.textContent = "浏览器不支持Web Worker，无法进行搜索";
			content.innerHTML = "";

			const deviceType = getDeviceType();
			if (deviceType === "mobile") {
				document.body.appendChild(errorMessage);
			} else {
				content.appendChild(errorMessage);
			}
		}
	};

	let debounceMs = 0;
	let debounced = null;
	return (event) => {
		// 输入一变就让尚未返回的旧搜索失效（包括仍在等待完整数据的那次）
		cancelPendingSearch();
		const ms = computeDebounceMsSafe(getBookmarksCount());
		if (!debounced || ms !== debounceMs) {
			debounced?.cancel();
			debounceMs = ms;
			debounced = debounce(runSearch, ms);
		}
		debounced(event);
	};
};

/**
 * 重置分页状态 - 新搜索时调用
 */
const resetPaginationState = () => {
	try {
		resetSearchPagination();

		// 清除URL中的分页参数
		const url = new URL(window.location);
		url.searchParams.delete("page");
		window.history.replaceState({}, document.title, url.toString());
	} catch (error) {
		console.error("[Search] Failed to reset pagination state:", error);
	}
};

/**
 * 从URL参数恢复搜索状态
 */
const restoreSearchStateFromURL = () => {
	const url = new URL(window.location);
	const keyword = url.searchParams.get("q");

	if (keyword) {
		const searchInput = document.getElementById("search-input");
		if (searchInput) {
			searchInput.value = keyword;
			// 触发搜索，分页状态由URL参数处理
			triggerSearch(keyword);
		}
	}
};

/**
 * 触发搜索
 * @param {string} keyword - 搜索关键词
 */
const triggerSearch = (keyword) => {
	const posted = postSearchToWorker(keyword);
	if (!posted) {
		console.warn("[Search] Failed to trigger search for keyword:", keyword);
	}
};

export {
	createSearchHandler,
	initSearchWorker,
	resetPaginationState,
	restoreSearchStateFromURL,
	triggerSearch,
};
