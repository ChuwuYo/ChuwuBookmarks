import { createCard } from "../../../components/bm-card/bm-card.js";
import { prefersReducedMotion } from "../utils/motion.js";
import { clearAllMessages, showNoResultsMessage } from "./message.js";

const ITEMS_PER_PAGE = 20;

const sortFoldersFirst = (results) =>
	[...results].sort((a, b) => (b.type === "folder") - (a.type === "folder"));

let view = null;

const renderPage = (container, results, page) => {
	requestAnimationFrame(() => {
		container.innerHTML = "";
		const start = (page - 1) * ITEMS_PER_PAGE;
		const items = results.slice(start, start + ITEMS_PER_PAGE);
		if (!items.length) return;

		const fragment = document.createDocumentFragment();
		items.forEach((item, index) => {
			const element = createCard(
				item.type === "folder" ? "folder" : "bookmark",
				item,
			);
			element.style.setProperty("--item-index", index);
			element.classList.add("search-result-item");
			fragment.appendChild(element);
		});
		container.appendChild(fragment);
		container.firstElementChild?.setAttribute("tabindex", "0");
	});
};

const PAGE_CHANGE_ANIMATION = "dim-and-restore";

const onPageChanged = (event) => {
	const content = event.currentTarget;
	if (event.target !== content) return;
	if (event.animationName !== PAGE_CHANGE_ANIMATION) return;
	content.removeAttribute("data-page-changing");
	content.querySelector('.search-result-item[tabindex="0"]')?.focus();
};

const playPageTransition = (content) => {
	content.addEventListener("animationend", onPageChanged);
	content.toggleAttribute("data-page-changing", true);
	requestAnimationFrame(() =>
		window.scrollTo({
			top: 0,
			behavior: prefersReducedMotion() ? "auto" : "smooth",
		}),
	);
};

const updateHistory = (page) => {
	const keyword = document.querySelector("bm-search")?.value.trim();
	if (!keyword) return;
	const url = new URL(window.location);
	url.searchParams.set("q", keyword);
	if (page > 1) url.searchParams.set("page", page);
	else url.searchParams.delete("page");
	window.history.replaceState({ page, keyword }, "", url.toString());
};

const resetSearchPagination = () => {
	view = null;
	document.getElementById("content")?.removeAttribute("data-page-changing");
};

const pageFromUrl = (total) => {
	const raw = new URL(window.location).searchParams.get("page");
	const page = Number.parseInt(raw ?? "", 10);
	if (!Number.isFinite(page) || page < 1) return 1;
	return Math.min(page, total);
};

const renderSearchResults = (results) => {
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
	renderPage(container, sorted, page);
	if (page > 1) updateHistory(page);
	else if (new URL(window.location).searchParams.has("page")) updateHistory(1);

	if (total > 1) {
		const pagination = document.createElement("bm-pagination");
		pagination.setAttribute("label", "搜索结果分页导航");
		pagination.setAttribute("total", String(total));
		pagination.setAttribute("current", String(page));
		content.appendChild(pagination);
		view = { content, container, results: sorted };
	}
};

/** 切换到已渲染搜索结果的第 page 页（响应 bm-page-change） */
const showSearchPage = (page) => {
	if (!view) return;
	renderPage(view.container, view.results, page);
	playPageTransition(view.content);
	updateHistory(page);
};

export { renderSearchResults, resetSearchPagination, showSearchPage };
