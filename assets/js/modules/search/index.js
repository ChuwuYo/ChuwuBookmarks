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
 * - 搜索结果缓存，提升重复搜索的响应速度
 * - 防抖处理，避免频繁搜索请求
 */

import {
	getSearchPayload,
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
import {
	getDataWorkerWrapper,
	getSearchWorkerWrapper,
	isWorkerSupported,
} from "../worker/index.js";

// 清除所有Worker缓存
const clearWorkerCaches = () => {
	if (!isWorkerSupported()) return;
	getSearchWorkerWrapper().postMessage({ action: "clearCache" });
};

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

	// 从统一的 Worker 管理模块获取搜索 Worker 包装器
	const searchWorkerWrapper = getSearchWorkerWrapper();

	// 定义搜索结果监听器
	const onSearchMessage = (e) => {
		const { action, results, message } = e.data;

		switch (action) {
			case "searchResults":
				renderSearchResults(results, renderMainContent);
				break;
			case "cacheCleared":
				// 缓存已清除，无需额外操作
				break;
			case "error":
				console.error("[Search] Worker error:", message);
				break;
		}
	};

	// 注册搜索结果监听器
	searchWorkerWrapper.addMessageListener(onSearchMessage);

	// 从统一的 Worker 管理模块获取数据处理 Worker 包装器
	const dataWorkerWrapper = getDataWorkerWrapper();

	// 定义数据处理监听器
	const onDataMessage = (e) => {
		const { action, message } = e.data;

		switch (action) {
			case "processResult":
			case "sortResult":
			case "filterResult":
				// 预留扩展点
				break;
			case "error":
				console.error("[Search] Data worker error:", message);
				break;
		}
	};

	// 注册数据处理监听器
	dataWorkerWrapper.addMessageListener(onDataMessage);
};

/** 每次发起或取消搜索时递增，用于丢弃已过期的延迟搜索 */
let searchGeneration = 0;

/** 使尚在等待完整数据的搜索失效（清空搜索框、返回主页时调用） */
const cancelPendingSearch = () => {
	searchGeneration++;
};

const postSearchToWorker = (keyword, useCache = true) => {
	if (!isWorkerSupported()) return null;
	const generation = ++searchGeneration;

	const post = () => {
		const payload = getSearchPayload();
		return getSearchWorkerWrapper().postMessage({
			action: "search",
			data: {
				keyword,
				bookmarks: payload.bookmarks,
				index: payload.index,
				indexHash: payload.indexHash,
				useCache,
			},
		});
	};

	// 完整数据仍在后台加载时，等它就绪再搜索，避免只搜到目录结构
	if (!isFullDataReady()) {
		waitForFullData().then(() => {
			const current = document.getElementById("search-input")?.value.trim();
			if (generation !== searchGeneration) return;
			if (current !== undefined && current !== keyword) return;
			post();
		});
		return true;
	}
	return post();
};

const createSearchHandler = () => {
	// 防抖时长按数据量与设备类型分档；数据加载后档位可能变化，届时才换用新的防抖函数
	const getBookmarksCount = () => {
		const payload = getSearchPayload();
		return (payload.index || payload.bookmarks || []).length || 0;
	};

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
	clearWorkerCaches,
	createSearchHandler,
	initSearchWorker,
	resetPaginationState,
	restoreSearchStateFromURL,
	triggerSearch,
};
