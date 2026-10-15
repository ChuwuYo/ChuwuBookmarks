/**
 * <bm-search>：搜索输入框（渐进增强 index.html 中已有的输入框）。
 * 输入或按 Enter 时触发 bm-search（detail: { query, originalEvent }），
 * 并提供 Ctrl/⌘ + K 聚焦快捷键。规范见 docs/components.md。
 */

export class BmSearch extends HTMLElement {
	#input = null;

	get input() {
		return this.#input;
	}

	get value() {
		return this.#input?.value ?? "";
	}

	set value(text) {
		if (this.#input) this.#input.value = text;
	}

	connectedCallback() {
		this.#input = this.querySelector("input");
		if (!this.#input) {
			this.#input = document.createElement("input");
			this.#input.type = "search";
			this.prepend(this.#input);
		}
		const placeholder = this.getAttribute("placeholder");
		if (placeholder) this.#input.placeholder = placeholder;

		this.#input.addEventListener("input", this.#emit);
		this.#input.addEventListener("keydown", this.#onEnter);
		document.addEventListener("keydown", this.#onShortcut);
	}

	disconnectedCallback() {
		this.#input?.removeEventListener("input", this.#emit);
		this.#input?.removeEventListener("keydown", this.#onEnter);
		document.removeEventListener("keydown", this.#onShortcut);
	}

	focus(options) {
		this.#input?.focus(options);
	}

	#emit = (originalEvent) => {
		this.dispatchEvent(
			new CustomEvent("bm-search", {
				bubbles: true,
				detail: { query: this.value.trim(), originalEvent },
			}),
		);
	};

	#onEnter = (event) => {
		if (event.key === "Enter") this.#emit(event);
	};

	#onShortcut = (event) => {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
			event.preventDefault();
			this.focus();
		}
	};
}

if (!customElements.get("bm-search")) {
	customElements.define("bm-search", BmSearch);
}
