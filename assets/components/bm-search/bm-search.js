/**
 * <bm-search>：搜索输入框（渐进增强 index.html 中已有的输入框）。
 * 输入或按 Enter 时触发 bm-search（detail: { query, originalEvent }），
 * 并提供聚焦快捷键：Apple 平台为 ⌘ + K，其他平台为 Ctrl + K。规范见 docs/components.md。
 */

/** Apple 平台（macOS / iPadOS / iOS）以 Command 为主修饰键 */
const IS_APPLE = /mac|ios|iphone|ipad|ipod/i.test(
	navigator.userAgentData?.platform ?? navigator.platform ?? "",
);
const MODIFIER_LABEL = IS_APPLE ? "⌘" : "Ctrl";
const SHORTCUT_ARIA = IS_APPLE ? "Meta+K" : "Control+K";

export class BmSearch extends HTMLElement {
	#input = null;
	/** 连接前设置的 value，连接后写入输入框 */
	#pendingValue = null;

	get input() {
		return this.#input;
	}

	get value() {
		return this.#input?.value ?? this.#pendingValue ?? "";
	}

	set value(text) {
		if (this.#input) this.#input.value = text;
		else this.#pendingValue = text;
	}

	connectedCallback() {
		this.#input = this.querySelector("input");
		if (!this.#input) {
			this.#input = document.createElement("input");
			this.#input.type = "search";
			this.prepend(this.#input);
		}
		if (this.#pendingValue !== null) {
			this.#input.value = this.#pendingValue;
			this.#pendingValue = null;
		}
		const placeholder = this.getAttribute("placeholder");
		if (placeholder) this.#input.placeholder = placeholder;
		this.#input.setAttribute("aria-keyshortcuts", SHORTCUT_ARIA);
		this.#renderHint();

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

	/** 按平台填充 .shortcut-hint 中的按键提示 */
	#renderHint() {
		const hint = this.querySelector(".shortcut-hint");
		if (!hint) return;
		const keys = [MODIFIER_LABEL, "K"].map((label) => {
			const key = document.createElement("kbd");
			key.textContent = label;
			return key;
		});
		hint.setAttribute("aria-hidden", "true");
		hint.replaceChildren(...keys);
	}

	#onShortcut = (event) => {
		const modifier = IS_APPLE ? event.metaKey : event.ctrlKey;
		const otherModifier = IS_APPLE ? event.ctrlKey : event.metaKey;
		if (
			modifier &&
			!otherModifier &&
			!event.shiftKey &&
			!event.altKey &&
			!event.isComposing &&
			event.key.toLowerCase() === "k"
		) {
			event.preventDefault();
			this.focus();
		}
	};
}

if (!customElements.get("bm-search")) {
	customElements.define("bm-search", BmSearch);
}
