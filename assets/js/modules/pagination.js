/**
 * 分页：纯函数计算页码 + 渲染分页导航
 */

/** @typedef {number | "ellipsis"} PageItem */

/**
 * 计算要显示的页码序列。
 * 以当前页为中心显示 `windowSize` 个连续页码（靠近首尾时整体平移），
 * 并始终显示首页和末页；中间缺页用 "ellipsis" 表示。
 *
 * @param {number} current 当前页（从 1 开始）
 * @param {number} total 总页数
 * @param {number} [windowSize=3] 连续页码数量
 * @returns {PageItem[]}
 */
export const getPageRange = (current, total, windowSize = 3) => {
	if (!Number.isFinite(total) || total < 1) return [];
	const page = Math.min(Math.max(1, Math.trunc(current) || 1), total);
	const size = Math.min(Math.max(1, windowSize), total);

	let start = Math.max(1, page - Math.floor((size - 1) / 2));
	const end = Math.min(total, start + size - 1);
	start = Math.max(1, end - size + 1);

	const items = [];
	if (start > 1) {
		items.push(1);
		if (start > 2) items.push("ellipsis");
	}
	for (let i = start; i <= end; i++) items.push(i);
	if (end < total) {
		if (end < total - 1) items.push("ellipsis");
		items.push(total);
	}
	return items;
};

/**
 * 计算总页数
 * @param {number} count 条目总数
 * @param {number} perPage 每页条目数
 */
export const getTotalPages = (count, perPage) =>
	Math.max(1, Math.ceil(count / perPage));

const createButton = (className, label, content, page, disabled) => {
	const button = document.createElement("button");
	button.className = `pagination-button ${className}`;
	button.type = "button";
	button.setAttribute("aria-label", label);
	if (page) button.dataset.page = String(page);
	if (disabled) {
		button.disabled = true;
		button.setAttribute("aria-disabled", "true");
		button.tabIndex = -1;
	} else {
		button.tabIndex = 0;
	}
	button.append(content);
	return button;
};

const createArrow = (symbol) => {
	const span = document.createElement("span");
	span.setAttribute("aria-hidden", "true");
	span.textContent = symbol;
	return span;
};

/**
 * 渲染分页导航到 `nav` 元素（替换其全部子节点）
 * @param {HTMLElement} nav
 * @param {number} current
 * @param {number} total
 */
export const renderPagination = (nav, current, total) => {
	const buttons = [
		createButton(
			"pagination-prev",
			"上一页",
			createArrow("‹"),
			0,
			current <= 1,
		),
	];
	for (const item of getPageRange(current, total)) {
		if (item === "ellipsis") {
			const span = document.createElement("span");
			span.className = "pagination-ellipsis";
			span.setAttribute("aria-hidden", "true");
			span.textContent = "…";
			buttons.push(span);
			continue;
		}
		const isCurrent = item === current;
		const button = createButton(
			`pagination-page${isCurrent ? " active" : ""}`,
			isCurrent ? `第${item}页，当前页` : `第${item}页`,
			String(item),
			item,
			false,
		);
		if (isCurrent) button.setAttribute("aria-current", "page");
		buttons.push(button);
	}
	buttons.push(
		createButton(
			"pagination-next",
			"下一页",
			createArrow("›"),
			0,
			current >= total,
		),
	);
	nav.replaceChildren(...buttons);
};

const focusables = (nav) => [
	...nav.querySelectorAll(".pagination-button:not(:disabled)"),
];

/**
 * 创建分页导航。总页数不足两页时返回 null。
 *
 * @param {object} options
 * @param {number} options.total 总页数
 * @param {number} [options.current=1] 当前页
 * @param {(page: number) => void} options.onChange 页码变化回调
 * @returns {{ element: HTMLElement, setPage: (page: number) => void } | null}
 */
export const createPagination = ({ total, current = 1, onChange }) => {
	if (total <= 1) return null;

	const wrapper = document.createElement("div");
	wrapper.className = "pagination-wrapper";
	const nav = document.createElement("nav");
	nav.className = "pagination-container centered-element";
	nav.setAttribute("aria-label", "搜索结果分页导航");
	nav.tabIndex = -1;
	wrapper.append(nav);

	let page = current;
	const setPage = (next) => {
		page = Math.min(Math.max(1, next), total);
		renderPagination(nav, page, total);
	};

	nav.addEventListener("click", (event) => {
		const button = event.target.closest(".pagination-button");
		if (!button || button.disabled) return;
		let next = page;
		if (button.classList.contains("pagination-prev")) next = page - 1;
		else if (button.classList.contains("pagination-next")) next = page + 1;
		else next = Number(button.dataset.page);
		if (next === page || next < 1 || next > total) return;
		setPage(next);
		onChange(next);
	});

	nav.addEventListener("keydown", (event) => {
		const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
		if (!keys.includes(event.key)) return;
		const list = focusables(nav);
		if (!list.length) return;
		event.preventDefault();
		const index = list.indexOf(document.activeElement);
		const target = {
			ArrowLeft: list[Math.max(0, index - 1)],
			ArrowRight: list[Math.min(list.length - 1, index + 1)],
			Home: list[0],
			End: list[list.length - 1],
		}[event.key];
		target?.focus();
	});

	setPage(page);
	return { element: wrapper, setPage };
};
