/**
 * <bm-breadcrumbs>：面包屑导航。
 * 通过 `path` 属性传入 [{ title }]（从根到当前文件夹），点击时触发
 * bm-navigate（detail: { index }，-1 表示主页）。
 * 元素本身 display: contents，父元素作为横向滚动容器，组件为其维护边缘渐隐。
 * 规范见 docs/components.md。
 */

import { createIcon } from "../bm-icon/bm-icon.js";

/** 渐隐遮罩宽度与“到达边缘”判定阈值（px） */
const MASK_OFFSET = 15;
const EDGE_THRESHOLD = 10;

const crumbButton = (text, label) => {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "breadcrumb-item";
	button.textContent = text;
	if (label) {
		button.tabIndex = 0;
		button.setAttribute("aria-label", label);
	}
	return button;
};

export class BmBreadcrumbs extends HTMLElement {
	#path = [];
	#scroller = null;
	#raf = 0;

	get path() {
		return this.#path;
	}

	set path(value) {
		this.#path = Array.isArray(value) ? value : [];
		if (this.isConnected) this.render();
	}

	connectedCallback() {
		this.addEventListener("click", this.#onClick);
		this.#scroller = this.parentElement;
		this.#scroller?.addEventListener("scroll", this.#updateMask, {
			passive: true,
		});
		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.#onClick);
		this.#scroller?.removeEventListener("scroll", this.#updateMask);
		cancelAnimationFrame(this.#raf);
		this.#raf = 0;
	}

	render() {
		const icon = document.createElement("span");
		icon.className = "breadcrumb-icon";
		icon.append(createIcon("breadcrumb"));

		const home = crumbButton("主页", "返回主页");
		home.dataset.index = "-1";

		const nodes = [icon, home];
		this.#path.forEach((crumb, index, all) => {
			const separator = document.createElement("span");
			separator.className = "breadcrumb-separator";
			separator.textContent = " > ";

			const isLast = index === all.length - 1;
			const item = crumbButton(
				crumb.title,
				isLast ? "" : `导航到${crumb.title}`,
			);
			if (isLast) item.setAttribute("aria-current", "location");
			else item.dataset.index = String(index);
			nodes.push(separator, item);
		});
		this.replaceChildren(...nodes);

		if (this.#scroller) {
			this.#scroller.classList.toggle(
				"scrollable",
				this.#scroller.scrollWidth > this.#scroller.clientWidth,
			);
		}
		this.#updateMask();
	}

	#onClick = (event) => {
		const item = event.target.closest(".breadcrumb-item[data-index]");
		if (!item) return;
		event.preventDefault();
		event.stopPropagation();
		this.dispatchEvent(
			new CustomEvent("bm-navigate", {
				bubbles: true,
				detail: { index: Number(item.dataset.index) },
			}),
		);
	};

	#updateMask = () => {
		const el = this.#scroller;
		if (!el || this.#raf) return;
		this.#raf = requestAnimationFrame(() => {
			this.#raf = 0;
			const left = el.scrollLeft;
			const max = el.scrollWidth - el.clientWidth;
			if (max <= 0) {
				el.style.maskImage = "";
				el.classList.remove("at-end", "at-start");
				return;
			}
			const start = Math.min(left + MASK_OFFSET, MASK_OFFSET);
			const end = Math.max(MASK_OFFSET - (max - left), 0);
			el.style.maskImage = `linear-gradient(to right, transparent, black ${start}px, black calc(100% - ${end}px), transparent)`;
			el.classList.toggle("at-end", left >= max - EDGE_THRESHOLD);
			el.classList.toggle("at-start", left <= EDGE_THRESHOLD);
		});
	};
}

if (!customElements.get("bm-breadcrumbs")) {
	customElements.define("bm-breadcrumbs", BmBreadcrumbs);
}
