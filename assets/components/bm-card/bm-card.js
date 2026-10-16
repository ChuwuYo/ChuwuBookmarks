/**
 * <bm-card type="folder|bookmark">：文件夹或书签条目。
 * 通过 `item` 属性传入书签数据（{ title, url, icon }）。
 * 文件夹被点击或按下 Enter / Space 时触发 bm-open-folder
 * （detail: { item, originalEvent }）。规范见 docs/components.md。
 */

import { createIcon } from "../bm-icon/bm-icon.js";

const labelFromUrl = (url) => {
	if (!url) return "";
	if (url.startsWith("data:")) {
		const match = /^data:([^;,]+)/i.exec(url);
		return match?.[1] ? `(${match[1]})` : "(data)";
	}
	try {
		return new URL(url).hostname || url;
	} catch {
		return url;
	}
};

/** 会在页面中执行代码的协议，书签链接一律不使用 */
const UNSAFE_PROTOCOLS = new Set(["javascript:", "vbscript:", "data:"]);

/** 可安全用作链接的地址，不安全或无法解析时返回空字符串 */
const safeHref = (url) => {
	if (!url) return "";
	try {
		const { protocol } = new URL(url, document.baseURI);
		return UNSAFE_PROTOCOLS.has(protocol) ? "" : url;
	} catch {
		return "";
	}
};

const text = (value) => (typeof value === "string" ? value.trim() : "");

/** favicon.im 优先于其他图标源（与 icon-loader 的回退顺序一致） */
const sortIconUrls = (icon) =>
	(Array.isArray(icon) ? icon : [icon])
		.filter((url) => url && typeof url === "string")
		.sort((a, b) => b.includes("favicon.im") - a.includes("favicon.im"));

export class BmCard extends HTMLElement {
	static observedAttributes = ["type"];

	#item = null;
	/** 当前已渲染的类型，type 改变时据此重新渲染 */
	#renderedType = null;

	get item() {
		return this.#item;
	}

	set item(value) {
		this.#item = value ?? null;
		if (this.isConnected) this.render();
	}

	get type() {
		return this.getAttribute("type") === "folder" ? "folder" : "bookmark";
	}

	set type(value) {
		this.setAttribute("type", value);
	}

	attributeChangedCallback() {
		if (this.#renderedType && this.#renderedType !== this.type) this.render();
	}

	connectedCallback() {
		if (!this.hasChildNodes()) this.render();
		this.addEventListener("click", this.#onActivate);
		this.addEventListener("keydown", this.#onKeydown);
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.#onActivate);
		this.removeEventListener("keydown", this.#onKeydown);
	}

	render() {
		const item = this.#item ?? {};
		this.#renderedType = this.type;
		this.classList.remove("folder", "bookmark");
		this.classList.add(this.type);
		if (this.type === "folder") this.#renderFolder(item);
		else this.#renderBookmark(item);
	}

	#renderFolder(item) {
		const name = text(item.title) || "未命名文件夹";
		const icon = document.createElement("span");
		icon.className = "folder-icon";
		icon.append(createIcon("folder"));
		const label = document.createElement("span");
		label.className = "folder-name";
		label.textContent = name;
		this.replaceChildren(icon, label);

		this.tabIndex = 0;
		this.setAttribute("role", "button");
		this.setAttribute("aria-label", `文件夹: ${name}`);
	}

	#renderBookmark(item) {
		const url = text(item.url);
		const title = text(item.title) || labelFromUrl(url) || "未命名书签";

		const icon = document.createElement("span");
		icon.className = "bookmark-icon";
		// 默认链接图标，favicon 加载成功后被替换
		const fallback = document.createElement("span");
		fallback.className = "bookmark-icon-emoji";
		fallback.append(createIcon("link"));
		icon.append(fallback);

		// 书签不是按钮，清除文件夹状态留下的交互属性
		this.removeAttribute("tabindex");
		this.removeAttribute("role");
		this.removeAttribute("aria-label");

		const urls = item.icon ? sortIconUrls(item.icon) : [];
		if (urls.length) {
			const img = document.createElement("img");
			img.className = "bookmark-icon-img";
			img.src = urls[0];
			img.loading = "lazy";
			// 装饰性图标：标题已由相邻链接朗读
			img.alt = "";
			img.setAttribute("aria-hidden", "true");
			if (urls.length > 1) img.dataset.iconUrls = JSON.stringify(urls);
			icon.append(img);
		}

		const link = document.createElement("a");
		link.href = safeHref(url) || "#";
		link.target = "_blank";
		link.rel = "noopener noreferrer";
		link.textContent = title;
		this.replaceChildren(icon, link);
	}

	#open(originalEvent) {
		this.dispatchEvent(
			new CustomEvent("bm-open-folder", {
				bubbles: true,
				detail: { item: this.#item, originalEvent },
			}),
		);
	}

	#onActivate = (event) => {
		if (this.type === "folder") this.#open(event);
	};

	#onKeydown = (event) => {
		if (this.type !== "folder") return;
		if (event.key !== "Enter" && event.key !== " ") return;
		event.preventDefault();
		this.#open(event);
	};
}

if (!customElements.get("bm-card")) customElements.define("bm-card", BmCard);

/**
 * 创建条目元素
 * @param {"folder" | "bookmark"} type
 * @param {object} item 书签数据
 */
export const createCard = (type, item) => {
	const card = document.createElement("bm-card");
	card.setAttribute("type", type);
	card.item = item;
	card.render();
	return card;
};
