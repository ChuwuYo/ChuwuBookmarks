/**
 * <bm-pagination total="11" current="1" label="搜索结果分页导航">
 * 分页导航，页码变化时触发 bm-page-change（detail: { page }）。规范见 docs/components.md。
 */

import { getPageRange } from "./page-range.js";

const toInt = (value, fallback) => {
	const n = Number.parseInt(value, 10);
	return Number.isFinite(n) ? n : fallback;
};

const arrow = (symbol) => {
	const span = document.createElement("span");
	span.setAttribute("aria-hidden", "true");
	span.textContent = symbol;
	return span;
};

const button = ({ className, label, content, page, disabled }) => {
	const el = document.createElement("button");
	el.type = "button";
	el.className = `pagination-button ${className}`;
	el.setAttribute("aria-label", label);
	if (page) el.dataset.page = String(page);
	if (disabled) {
		el.disabled = true;
		el.setAttribute("aria-disabled", "true");
	}
	el.tabIndex = disabled ? -1 : 0;
	el.append(content);
	return el;
};

export class BmPagination extends HTMLElement {
	static observedAttributes = ["total", "current", "label"];

	#nav = null;

	get total() {
		return Math.max(1, toInt(this.getAttribute("total"), 1));
	}

	set total(value) {
		this.setAttribute("total", String(value));
	}

	get current() {
		return Math.min(
			Math.max(1, toInt(this.getAttribute("current"), 1)),
			this.total,
		);
	}

	set current(value) {
		this.setAttribute("current", String(value));
	}

	connectedCallback() {
		if (!this.#nav) {
			this.#nav = document.createElement("nav");
			this.#nav.className = "pagination-container centered-element";
			this.#nav.tabIndex = -1;
			this.#nav.addEventListener("click", this.#onClick);
			this.#nav.addEventListener("keydown", this.#onKeydown);
			this.replaceChildren(this.#nav);
		}
		this.render();
	}

	attributeChangedCallback() {
		if (this.#nav) this.render();
	}

	render() {
		const nav = this.#nav;
		nav.setAttribute("aria-label", this.getAttribute("label") || "分页导航");
		const { current, total } = this;
		nav.hidden = total <= 1;
		if (nav.hidden) {
			nav.replaceChildren();
			return;
		}

		const items = [
			button({
				className: "pagination-prev",
				label: "上一页",
				content: arrow("‹"),
				disabled: current <= 1,
			}),
		];
		for (const item of getPageRange(current, total)) {
			if (item === "ellipsis") {
				const span = document.createElement("span");
				span.className = "pagination-ellipsis";
				span.setAttribute("aria-hidden", "true");
				span.textContent = "…";
				items.push(span);
				continue;
			}
			const active = item === current;
			const el = button({
				className: `pagination-page${active ? " active" : ""}`,
				label: active ? `第${item}页，当前页` : `第${item}页`,
				content: String(item),
				page: item,
			});
			if (active) el.setAttribute("aria-current", "page");
			items.push(el);
		}
		items.push(
			button({
				className: "pagination-next",
				label: "下一页",
				content: arrow("›"),
				disabled: current >= total,
			}),
		);
		nav.replaceChildren(...items);
	}

	#onClick = (event) => {
		const target = event.target.closest(".pagination-button");
		if (!target || target.disabled) return;
		const { current, total } = this;
		let page = toInt(target.dataset.page, current);
		if (target.classList.contains("pagination-prev")) page = current - 1;
		if (target.classList.contains("pagination-next")) page = current + 1;
		if (page === current || page < 1 || page > total) return;
		this.current = page;
		this.dispatchEvent(
			new CustomEvent("bm-page-change", { bubbles: true, detail: { page } }),
		);
	};

	#onKeydown = (event) => {
		const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
		if (!keys.includes(event.key)) return;
		const list = [
			...this.#nav.querySelectorAll(".pagination-button:not(:disabled)"),
		];
		if (!list.length) return;
		event.preventDefault();
		const index = list.indexOf(document.activeElement);
		const next = {
			ArrowLeft: list[Math.max(0, index - 1)],
			ArrowRight: list[Math.min(list.length - 1, index + 1)],
			Home: list[0],
			End: list.at(-1),
		}[event.key];
		next?.focus();
	};
}

if (!customElements.get("bm-pagination")) {
	customElements.define("bm-pagination", BmPagination);
}
