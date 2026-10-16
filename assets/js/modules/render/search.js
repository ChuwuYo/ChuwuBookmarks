/**
 * 搜索结果渲染：分页显示结果，文件夹排在书签前面
 */

import "../../../components/bm-pagination/bm-pagination.js";
import { RENDER_CONSTANTS } from "../utils/constants.js";
import { createElement } from "./elements.js";
import { loadIconsForElements } from "./icon-loader.js";
import { clearAllMessages, showNoResultsMessage } from "./message.js";

const ITEMS_PER_PAGE = 20;

/** 进行中的定时器，新搜索或返回主页时清理 */
const timers = new Set();
const later = (fn, ms) => {
	const id = setTimeout(() => {
		timers.delete(id);
		fn();
	}, ms);
	timers.add(id);
};

const sortFoldersFirst = (results) =>
	[...results].sort((a, b) => (b.type === "folder") - (a.type === "folder"));

const renderPage = (container, results, page, renderMainContent) => {
	requestAnimationFrame(() => {
		container.innerHTML = "";
		const start = (page - 1) * ITEMS_PER_PAGE;
		const items = results.slice(start, start + ITEMS_PER_PAGE);
		if (!items.length) return;

		const fragment = document.createDocumentFragment();
		const bookmarks = [];
		items.forEach((item, index) => {
			const isFolder = item.type === "folder";
			const element = createElement(
				isFolder ? "folder" : "bookmark",
				item,
				isFolder ? () => renderMainContent(item) : null,
			);
			element.style.cssText = `--item-index: ${index}`;
			element.classList.add("search-result-item");
			fragment.appendChild(element);
			if (!isFolder) bookmarks.push(element);
		});
		container.appendChild(fragment);
		loadIconsForElements(bookmarks);
		container.firstElementChild?.setAttribute("tabindex", "0");
	});
};

/** 翻页后的过渡：内容区淡出再淡入，并聚焦第一条结果 */
const playPageTransition = (content) => {
	content.classList.add("page-changing");
	later(
		() => content.classList.remove("page-changing"),
		RENDER_CONSTANTS.PAGE_CHANGE_FEEDBACK_DURATION_MS,
	);

	later(() => {
		const reduce = window.matchMedia?.(
			"(prefers-reduced-motion: reduce)",
		).matches;
		window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
		content.classList.add("search-results-fade", "search-results-fade-dim");
		later(() => {
			content.classList.remove("search-results-fade-dim");
			content.classList.add("search-results-fade-full");
		}, RENDER_CONSTANTS.SEARCH_FADE_IN_DELAY_MS);
		later(() => {
			content.classList.remove(
				"search-results-fade",
				"search-results-fade-full",
			);
			content.querySelector('.search-result-item[tabindex="0"]')?.focus();
		}, RENDER_CONSTANTS.SEARCH_FADE_TOTAL_DURATION_MS);
	}, 16);
};

/** 把当前页写入地址栏，第一页时移除 page 参数 */
const updateHistory = (page) => {
	const keyword = document.getElementById("search-input")?.value.trim();
	if (!keyword) return;
	const url = new URL(window.location);
	url.searchParams.set("q", keyword);
	if (page > 1) url.searchParams.set("page", page);
	else url.searchParams.delete("page");
	window.history.replaceState({ page, keyword }, "", url.toString());
};

const resetSearchPagination = () => {
	for (const id of timers) clearTimeout(id);
	timers.clear();
	document
		.getElementById("content")
		?.classList.remove(
			"page-changing",
			"search-results-fade",
			"search-results-fade-dim",
			"search-results-fade-full",
		);
};

/** 地址栏中的页码，缺失或非法时为第一页，并限制在 [1, total] 内 */
const pageFromUrl = (total) => {
	const raw = new URL(window.location).searchParams.get("page");
	const page = Number.parseInt(raw ?? "", 10);
	if (!Number.isFinite(page) || page < 1) return 1;
	return Math.min(page, total);
};

const renderSearchResults = (results, renderMainContent) => {
	const content = document.getElementById("content");
	const breadcrumbs = document.getElementById("breadcrumbs");
	if (!content || !breadcrumbs) return;

	clearAllMessages();
	resetSearchPagination();
	content.innerHTML = "";
	breadcrumbs.innerHTML = "";

	if (!results?.length) {
		showNoResultsMessage(content);
		return;
	}

	const sorted = sortFoldersFirst(results);
	const container = document.createElement("div");
	container.className = "results-container";
	content.appendChild(container);

	const total = Math.ceil(sorted.length / ITEMS_PER_PAGE);
	const page = pageFromUrl(total);
	renderPage(container, sorted, page, renderMainContent);
	if (page > 1) updateHistory(page);
	else if (new URL(window.location).searchParams.has("page")) updateHistory(1);

	if (total > 1) {
		const pagination = document.createElement("bm-pagination");
		pagination.setAttribute("label", "搜索结果分页导航");
		pagination.setAttribute("total", String(total));
		pagination.setAttribute("current", String(page));
		pagination.addEventListener("bm-page-change", ({ detail: { page } }) => {
			playPageTransition(content);
			renderPage(container, sorted, page, renderMainContent);
			updateHistory(page);
		});
		content.appendChild(pagination);
	}
};

export { renderSearchResults, resetSearchPagination };
