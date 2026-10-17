import { renderHome } from "../render/home.js";
import { showErrorMessage, showLoadingMessage } from "../render/message.js";
import { revealApp } from "../render/reveal.js";
import { renderSidebar } from "../render/sidebar.js";
import { readCache, removeLegacyCache, writeCache } from "../store.js";
import { getDataWorkerWrapper } from "../worker/index.js";
import {
	loadFirstScreenFonts,
	loadSearchFontOnFocus,
	preloadFontSlices,
} from "./font-slices.js";

const state = {
	data: null,
	full: null,
};
let fullDataLoadPromise = null;
let fullDataPending = false;
let fullDataWaiters = [];

const getFullBookmarksData = () => state.full;
const isFullDataReady = () => state.full !== null;

const settleFullData = (data) => {
	fullDataPending = false;
	const waiters = fullDataWaiters;
	fullDataWaiters = [];
	for (const resolve of waiters) resolve(data);
};

const waitForFullData = () => {
	if (state.full) return Promise.resolve(state.full);
	if (!fullDataPending) return Promise.resolve(null);
	return new Promise((resolve) => fullDataWaiters.push(resolve));
};

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
	loadSearchFontOnFocus();
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

let cancelBackgroundLoad = null;
const cancelFullDataLoad = () => {
	cancelBackgroundLoad?.();
	if (!state.full) settleFullData(null);
};

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
