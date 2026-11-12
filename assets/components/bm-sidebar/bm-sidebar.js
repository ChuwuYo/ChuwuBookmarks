/**
 * <bm-sidebar>：放在 <aside class="sidebar"> 内，包裹侧边栏头部与文件夹导航。
 * - 点击 [data-sidebar-toggle] 按钮时触发 bm-sidebar-toggle（detail: { collapsed }），
 *   由应用决定是否以及如何收起/展开。
 * - `collapsed` 属性写入收起状态：<aside> 与元素自身的 data-state，以及切换按钮的 aria-expanded。
 * - 子元素滚动期间带 data-scrolling，停止 --scroll-idle 后移除。
 * 规范见 docs/components.md。
 */

import { trackScrollActivity } from "../../js/modules/utils/scroll-activity.js";

export class BmSidebar extends HTMLElement {
	#untrackScroll = null;

	get #host() {
		return this.closest(".sidebar") ?? this.parentElement;
	}

	get collapsed() {
		return this.#host?.dataset.state === "collapsed";
	}

	set collapsed(value) {
		const state = value ? "collapsed" : "expanded";
		const host = this.#host;
		if (host && host.dataset.state !== state) host.dataset.state = state;
		this.#sync();
	}

	connectedCallback() {
		this.addEventListener("click", this.#onClick);
		this.#untrackScroll = trackScrollActivity(this);
		this.#sync();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.#onClick);
		this.#untrackScroll?.();
		this.#untrackScroll = null;
	}

	toggle() {
		const collapsed = !this.collapsed;
		this.dispatchEvent(
			new CustomEvent("bm-sidebar-toggle", {
				bubbles: true,
				detail: { collapsed },
			}),
		);
		return collapsed;
	}

	#onClick = (event) => {
		if (!event.target.closest("[data-sidebar-toggle]")) return;
		event.preventDefault();
		event.stopPropagation();
		this.toggle();
	};

	#sync() {
		const state = this.#host?.dataset.state;
		if (!state) return;
		if (this.dataset.state !== state) this.dataset.state = state;
		for (const button of this.querySelectorAll("[data-sidebar-toggle]")) {
			button.setAttribute("aria-expanded", String(state !== "collapsed"));
		}
	}
}

if (!customElements.get("bm-sidebar")) {
	customElements.define("bm-sidebar", BmSidebar);
}
