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
import { revealApp } from "../render/reveal.js";
import { renderSidebar } from "../render/sidebar.js";
import { readCache, removeLegacyCache, writeCache } from "../store.js";
import { getDataWorkerWrapper } from "../worker/index.js";
import { loadFirstScreenFonts, preloadFontSlices } from "./font-slices.js";

/** 内存中的当前数据 */
const state = {
	/** 侧边栏当前使用的数据（目录结构或完整数据） */
	data: null,
	/** 完整书签数据 */
	full: null,
};
let fullDataLoadPromise = null;
/** 完整数据加载流程是否仍在进行（含尚未发出完整数据请求的阶段） */
let fullDataPending = false;
/** 等待完整数据的回调，加载成功或失败时统一结算 */
let fullDataWaiters = [];

const getFullBookmarksData = () => state.full;
const isFullDataReady = () => state.full !== null;

const settleFullData = (data) => {
	fullDataPending = false;
	const waiters = fullDataWaiters;
	fullDataWaiters = [];
	for (const resolve of waiters) resolve(data);
};

/** 等待完整数据加载完成；加载失败或未在加载时返回 null */
const waitForFullData = () => {
	if (state.full) return Promise.resolve(state.full);
	if (!fullDataPending) return Promise.resolve(null);
	return new Promise((resolve) => fullDataWaiters.push(resolve));
};

/** 搜索使用的书签树：完整数据就绪前使用已有的目录结构 */
const getSearchSource = () => state.full ?? state.data ?? [];

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
	revealApp();
};

const setFullData = ({ data }) => {
	state.full = data;
	preloadFontSlices(data);
	settleFullData(data);
};

/** 读取缓存并渲染，返回缓存内容 */
const renderFromCache = async (renderMainContent) => {
	const [bookmarks, structure] = await Promise.all([
		readCache("bookmarks"),
		readCache("structure"),
	]);
	if (bookmarks?.data) {
		setFullData(bookmarks);
		await loadFirstScreenFonts(bookmarks.data);
		render(bookmarks.data, renderMainContent);
	} else if (structure?.data) {
		await loadFirstScreenFonts(structure.data);
		render(structure.data, renderMainContent);
	}
	return { bookmarks, structure };
};

const loadBookmarksData = async (renderMainContent) => {
	removeLegacyCache();
	fullDataPending = true;
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
		cancelFullDataLoad();
		if (hasCachedData) renderHome();
		else setTimeout(() => showErrorMessage(new Error(error)), 10);
	};

	function onMessage(event) {
		const { status, data, error, hash, isFullData } = event.data;
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
					fail("无法与数据工作线程通信");
				}
				break;
			case "success":
				stop();
				setFullData({ data });
				if (hash !== cached.bookmarks?.hash) {
					writeCache("bookmarks", { hash, data });
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
		fail("无法与数据工作线程通信");
	}
};

/** 取消进行中的后台加载：移除监听并结算等待者，之后可重新发起 */
let cancelBackgroundLoad = null;
const cancelFullDataLoad = () => {
	cancelBackgroundLoad?.();
	if (!state.full) settleFullData(null);
};

/** 后台加载完整数据，完成后更新缓存与侧边栏 */
const loadFullDataInBackground = (worker, renderMainContent, onDone) => {
	if (fullDataLoadPromise) return fullDataLoadPromise;

	let settled = false;
	fullDataLoadPromise = new Promise((resolve) => {
		const finish = (data) => {
			settled = true;
			worker.removeMessageListener(onMessage);
			cancelBackgroundLoad = null;
			fullDataLoadPromise = null;
			resolve(data);
		};
		cancelBackgroundLoad = () => finish(null);

		function onMessage(event) {
			const { status, data, hash, isFullData, error } = event.data;
			if (!isFullData) return;

			if (status === "success") {
				setFullData({ data });
				writeCache("bookmarks", { hash, data });
				render(data, renderMainContent, { home: false });
				onDone();
				finish(data);
				return;
			}
			console.warn("Full data background load failed:", error);
			onDone();
			finish(null);
			if (!state.full) settleFullData(null);
		}

		worker.addMessageListener(onMessage);
		if (!worker.postMessage({ action: "loadFullData" })) {
			console.warn("[Loader] Failed to request full data loading from worker");
			finish(null);
			if (!state.full) settleFullData(null);
		}
	});
	const promise = fullDataLoadPromise;
	// executor 内同步失败时 finish 已清空，外层赋值不能把已结算的 Promise 写回
	if (settled) fullDataLoadPromise = null;
	return promise;
};

export {
	getFullBookmarksData,
	getSearchSource,
	isFullDataReady,
	loadBookmarksData,
	showErrorMessage,
	showLoadingIndicator,
	waitForFullData,
};
