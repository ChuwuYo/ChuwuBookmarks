/**
 * 数据加载模块
 *
 * 加载流程：
 * 1. 读取 IndexedDB 缓存（完整数据优先，其次目录结构）并立即渲染
 * 2. 让 Worker 加载 structure.json（轻量目录结构），有变化时重新渲染
 * 3. 后台加载完整的 bookmarks.json，完成后更新缓存与侧边栏
 * 4. structure.json 不存在时直接加载 bookmarks.json
 */

import { renderHome } from "../render/home.js";
import { showErrorMessage, showLoadingMessage } from "../render/message.js";
import { renderSidebar } from "../render/sidebar.js";
import { clearWorkerCaches } from "../search/index.js";
import { readCache, removeLegacyCache, writeCache } from "../store.js";
import { getDataWorkerWrapper } from "../worker/index.js";

/** 内存中的当前数据 */
const state = {
	/** 侧边栏当前使用的数据（目录结构或完整数据） */
	data: null,
	/** 完整书签数据 */
	full: null,
	/** 扁平搜索索引 */
	index: null,
	/** 完整数据哈希，用作搜索缓存键 */
	hash: null,
};
let fullDataLoadPromise = null;

const getFullBookmarksData = () => state.full;
const isFullDataReady = () => state.full !== null;

/** 等待完整数据加载完成；未在加载时立即返回当前值 */
const waitForFullData = () => {
	if (state.full) return Promise.resolve(state.full);
	return fullDataLoadPromise ?? Promise.resolve(null);
};

/** 搜索所需的数据：完整数据就绪前使用已有的目录结构 */
const getSearchPayload = () => ({
	bookmarks: state.full ?? state.data ?? [],
	index: state.full ? state.index : null,
	indexHash: state.full ? state.hash : null,
});

const showLoadingIndicator = () => {
	const content = document.getElementById("content");
	const breadcrumbs = document.getElementById("breadcrumbs");
	if (!content || !breadcrumbs) return;
	showLoadingMessage(content, breadcrumbs);
};

const render = (data, renderMainContent, { home = true } = {}) => {
	state.data = data;
	renderSidebar(data, renderMainContent);
	if (home) renderHome();
};

const setFullData = ({ data, index, hash }) => {
	state.full = data;
	state.index = index ?? null;
	state.hash = hash ?? null;
};

/** 读取缓存并渲染，返回缓存内容 */
const renderFromCache = async (renderMainContent) => {
	const [bookmarks, structure] = await Promise.all([
		readCache("bookmarks"),
		readCache("structure"),
	]);
	if (bookmarks?.data) {
		setFullData(bookmarks);
		render(bookmarks.data, renderMainContent);
	} else if (structure?.data) {
		render(structure.data, renderMainContent);
	}
	return { bookmarks, structure };
};

const loadBookmarksData = async (renderMainContent) => {
	removeLegacyCache();
	const cached = await renderFromCache(renderMainContent);
	const hasCachedData = Boolean(cached.bookmarks || cached.structure);

	const worker = getDataWorkerWrapper();
	const stop = () => {
		worker.removeMessageListener(onMessage);
		worker.removeErrorListener(onError);
	};

	const fail = (error) => {
		console.error("Worker failed to load data:", error);
		stop();
		if (hasCachedData) renderHome();
		else setTimeout(() => showErrorMessage(new Error(error)), 10);
	};

	function onMessage(event) {
		const { status, data, error, hash, index, isFullData } = event.data;
		// 后台完整数据由 loadFullDataInBackground 处理
		if (isFullData) return;

		switch (status) {
			case "structure_loaded":
				if (!hasCachedData || hash !== cached.structure?.hash) {
					writeCache("structure", { hash, data });
					render(data, renderMainContent);
				}
				loadFullDataInBackground(worker, renderMainContent, stop);
				break;
			case "structure_not_found":
				if (!worker.postMessage({ action: "loadData" })) {
					console.warn("[Loader] Failed to send loadData message to worker");
				}
				break;
			case "success":
				stop();
				setFullData({ data, index, hash });
				if (hash !== cached.bookmarks?.hash) {
					writeCache("bookmarks", { hash, data, index });
					clearWorkerCaches();
					render(data, renderMainContent);
				} else if (!hasCachedData) {
					render(data, renderMainContent);
				}
				break;
			case "error":
				fail(error);
				break;
		}
	}

	function onError(error) {
		console.error("Data Worker encountered an error:", error);
		fail(error.message || "Web Worker加载失败");
	}

	worker.addMessageListener(onMessage);
	worker.addErrorListener(onError);

	if (!worker.postMessage({ action: "loadStructure" })) {
		console.warn("[Loader] Failed to send loadStructure message to worker");
		if (!hasCachedData) fail("无法与数据工作线程通信");
	}
};

/** 后台加载完整数据，完成后更新缓存与侧边栏 */
const loadFullDataInBackground = (worker, renderMainContent, onDone) => {
	if (fullDataLoadPromise && !state.full) return fullDataLoadPromise;

	fullDataLoadPromise = new Promise((resolve) => {
		const onMessage = (event) => {
			const { status, data, index, hash, isFullData } = event.data;
			if (!isFullData) return;
			worker.removeMessageListener(onMessage);

			if (status === "success") {
				setFullData({ data, index, hash });
				writeCache("bookmarks", { hash, data, index });
				clearWorkerCaches();
				render(data, renderMainContent, { home: false });
				onDone();
				resolve(data);
				return;
			}
			console.warn("Full data background load failed:", data);
			resolve(null);
		};

		worker.addMessageListener(onMessage);
		if (!worker.postMessage({ action: "loadFullData" })) {
			console.warn("[Loader] Failed to request full data loading from worker");
			worker.removeMessageListener(onMessage);
			resolve(null);
		}
	});
	return fullDataLoadPromise;
};

export {
	getFullBookmarksData,
	getSearchPayload,
	isFullDataReady,
	loadBookmarksData,
	showErrorMessage,
	showLoadingIndicator,
	waitForFullData,
};
