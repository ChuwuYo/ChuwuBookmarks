/**
 * <bm-breadcrumbs>：面包屑导航。
 * 通过 `path` 属性传入 [{ title }]（从根到当前文件夹），点击祖先项时触发
 * bm-navigate（detail: { index }，-1 表示主页）。
 * 元素本身 display: contents，父元素作为横向滚动容器；边缘渐隐完全由父元素的
 * CSS 完成，组件不读写父元素。
 * 规范见 docs/components.md。
 */

import { createIcon } from "../bm-icon/bm-icon.js";

const crumbButton = (text, label, index) => {
	const button = document.createElement("button");
	button.type = "button";
	button.className = "breadcrumb-item";
	button.textContent = text;
	button.setAttribute("aria-label", label);
	button.dataset.index = String(index);
	return button;
};

const currentCrumb = (text) => {
	const item = document.createElement("span");
	item.className = "breadcrumb-item";
	item.textContent = text;
	item.setAttribute("aria-current", "location");
	return item;
};

const separator = () => {
	const span = document.createElement("span");
	span.className = "breadcrumb-separator";
	span.setAttribute("aria-hidden", "true");
	span.textContent = " > ";
	return span;
};

const listItem = (...children) => {
	const li = document.createElement("li");
	li.append(...children);
	return li;
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

		const list = document.createElement("ol");
		list.className = "breadcrumb-list";
		list.append(listItem(crumbButton("主页", "返回主页", -1)));
		this.#path.forEach((crumb, index, all) => {
			const item =
				index === all.length - 1
					? currentCrumb(crumb.title)
					: crumbButton(crumb.title, `导航到${crumb.title}`, index);
			list.append(listItem(separator(), item));
		});
		this.replaceChildren(icon, list);
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
