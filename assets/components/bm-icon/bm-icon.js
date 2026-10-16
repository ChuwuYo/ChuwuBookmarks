/**
 * <bm-icon name="folder" label="可选的无障碍名称">
 * 渲染 assets/images/icons.svg 中的同名 symbol。规范见 docs/components.md。
 */

const SPRITE_URL = new URL("../../images/icons.svg", import.meta.url).href;
const SVG_NS = "http://www.w3.org/2000/svg";

export class BmIcon extends HTMLElement {
	static observedAttributes = ["name", "label"];

	connectedCallback() {
		this.render();
	}

	attributeChangedCallback() {
		if (this.isConnected) this.render();
	}

	get name() {
		return this.getAttribute("name") ?? "";
	}

	set name(value) {
		this.setAttribute("name", value);
	}

	get label() {
		return this.getAttribute("label") ?? "";
	}

	set label(value) {
		if (value) this.setAttribute("label", value);
		else this.removeAttribute("label");
	}

	render() {
		let svg = this.querySelector(":scope > svg");
		if (!svg) {
			svg = document.createElementNS(SVG_NS, "svg");
			svg.setAttribute("focusable", "false");
			svg.setAttribute("aria-hidden", "true");
			svg.append(document.createElementNS(SVG_NS, "use"));
			this.replaceChildren(svg);
		}
		svg.firstElementChild.setAttribute("href", `${SPRITE_URL}#${this.name}`);

		if (this.label) {
			this.setAttribute("role", "img");
			this.setAttribute("aria-label", this.label);
			this.removeAttribute("aria-hidden");
		} else {
			this.removeAttribute("role");
			this.removeAttribute("aria-label");
			this.setAttribute("aria-hidden", "true");
		}
	}
}

if (!customElements.get("bm-icon")) customElements.define("bm-icon", BmIcon);

/**
 * 创建图标元素（供渲染代码使用）
 * @param {string} name 图标名
 * @param {string} [label] 无障碍名称；省略时图标为装饰性
 */
export const createIcon = (name, label) => {
	const icon = document.createElement("bm-icon");
	icon.setAttribute("name", name);
	if (label) icon.setAttribute("label", label);
	return icon;
};
