/**
 * <bm-sidebar>：放在 <aside class="sidebar"> 内，包裹侧边栏头部与文件夹导航。
 * - 点击 [data-sidebar-toggle] 按钮时触发 bm-sidebar-toggle（detail: { collapsed }），
 *   由应用决定如何收起/展开（动画、断点等）。
 * - 侧边栏状态（.collapsed 类）同步到 data-state 与切换按钮的 aria-expanded。
 * 规范见 docs/components.md。
 */

export class BmSidebar extends HTMLElement {
	#aside = null;
	#observer = null;

	get collapsed() {
		return this.#aside?.classList.contains("collapsed") ?? false;
	}

	connectedCallback() {
		this.#aside = this.closest(".sidebar") ?? this.parentElement;
		this.addEventListener("click", this.#onClick);
		this.#observer = new MutationObserver(() => this.#sync());
		this.#observer.observe(this.#aside, {
			attributes: true,
			attributeFilter: ["class"],
		});
		this.#sync();
	}

	disconnectedCallback() {
		this.removeEventListener("click", this.#onClick);
		this.#observer?.disconnect();
		this.#observer = null;
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
		const state = this.collapsed ? "collapsed" : "expanded";
		if (this.dataset.state !== state) this.dataset.state = state;
		for (const button of this.querySelectorAll("[data-sidebar-toggle]")) {
			button.setAttribute("aria-expanded", String(!this.collapsed));
		}
	}
}

if (!customElements.get("bm-sidebar")) {
	customElements.define("bm-sidebar", BmSidebar);
}
