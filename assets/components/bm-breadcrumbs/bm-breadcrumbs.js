/**
 * <bm-breadcrumbs>：面包屑导航。
 * 通过 `path` 属性传入 [{ title }]（从根到当前文件夹），点击时触发
 * bm-navigate（detail: { index }，-1 表示主页）。
 * 元素本身 display: contents，父元素作为横向滚动容器；边缘渐隐完全由父元素的
 * CSS 完成，组件不读写父元素。
 * 规范见 docs/components.md。
 */

import { createIcon } from "../bm-icon/bm-icon.js";

const crumbButton = (text, label) => {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "breadcrumb-item";
	button.textContent = text;
	if (label) button.setAttribute("aria-label", label);
	return button;
};

export class BmBreadcrumbs extends HTMLElement {
	#path = [];

	get path() {
		return this.#path;
	}

	set path(value) {
		this.#path = Array.isArray(value) ? value : [];
		if (this.isConnected) this.render();
	}

	connectedCallback() {
		this.addEventListener("click", this.#onClick);
		this.render();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.#onClick);
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
}

if (!customElements.get("bm-breadcrumbs")) {
	customElements.define("bm-breadcrumbs", BmBreadcrumbs);
}
