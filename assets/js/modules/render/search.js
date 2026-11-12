import { createCard } from "../../../components/bm-card/bm-card.js";
import { prefersReducedMotion } from "../utils/motion.js";
import { readSearchState, writeSearchState } from "../utils/url-state.js";
import { noResultsMessage } from "./message.js";
import { isCurrentView, updateView } from "./view.js";

const ITEMS_PER_PAGE = 20;

const sortFoldersFirst = (results) =>
	[...results].sort((a, b) => (b.type === "folder") - (a.type === "folder"));

let paged = null;

const renderPage = (container, results, page) => {
	requestAnimationFrame(() => {
		const start = (page - 1) * ITEMS_PER_PAGE;
		const cards = results
			.slice(start, start + ITEMS_PER_PAGE)
			.map((item, index) => {
				const card = createCard(
					item.type === "folder" ? "folder" : "bookmark",
					item,
				);
				card.style.setProperty("--item-index", index);
				card.classList.add("search-result-item");
				return card;
			});
		container.replaceChildren(...cards);
	});
};

const focusFirstResult = (content) => {
	const first = content.querySelector(".search-result-item");
	const target = first?.type === "folder" ? first : first?.querySelector("a");
	target?.focus({ preventScroll: true });
};

const PAGE_CHANGE_ANIMATION = "dim-and-restore";

const onPageChanged = (event) => {
	const content = event.currentTarget;
	if (event.target !== content) return;
	if (event.animationName !== PAGE_CHANGE_ANIMATION) return;
	content.removeAttribute("data-page-changing");
	focusFirstResult(content);
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
	const keyword = document.querySelector("bm-search").value.trim();
	if (!keyword) return;
	writeSearchState({ query: keyword, page });
};

const pageFromUrl = (total) => Math.min(readSearchState().page ?? 1, total);

const renderSearchResults = (view, results) => {
	if (!isCurrentView(view)) return;
	paged = null;

	if (!results?.length) {
		updateView(view, { content: [noResultsMessage()] });
		return;
	}

	const sorted = sortFoldersFirst(results);
	const container = document.createElement("div");
	container.className = "results-container";

	const total = Math.ceil(sorted.length / ITEMS_PER_PAGE);
	const page = pageFromUrl(total);
	renderPage(container, sorted, page);
	updateHistory(page);

	if (total <= 1) {
		updateView(view, { content: [container] });
		return;
	}

	const pagination = document.createElement("bm-pagination");
	pagination.setAttribute("label", "搜索结果分页导航");
	pagination.setAttribute("total", String(total));
	pagination.setAttribute("current", String(page));
	updateView(view, { content: [container, pagination] });
	paged = { view, container, results: sorted };
};

const showSearchPage = (page) => {
	if (!paged || !isCurrentView(paged.view)) return;
	renderPage(paged.container, paged.results, page);
	playPageTransition(document.getElementById("content"));
	updateHistory(page);
};

export { renderSearchResults, showSearchPage };
