/**
 * StyleApplicator - 样式应用器类
 * 负责将计算出的样式应用到DOM元素，优化DOM操作性能
 */

export class StyleApplicator {
	constructor() {
		// 批量更新队列 - 使用Map去重
		this.updateQueue = new Map();
		this.isUpdateScheduled = false;
		this.batchUpdateTimer = null;
	}

	/**
	 * 应用样式到元素
	 * @param {HTMLElement} element - 目标元素
	 * @param {Object} styles - 样式对象
	 * @param {boolean} immediate - 是否立即应用
	 */
	applyStyles(element, styles, immediate = false) {
		if (!element || !styles) return;

		if (immediate) {
			this.doApplyStyles(element, styles);
		} else {
			this.updateQueue.set(element, () => this.doApplyStyles(element, styles));
			this.scheduleBatchUpdate();
		}
	}

	/**
	 * 实际执行样式应用
	 * @param {HTMLElement} element - 目标元素
	 * @param {Object} styles - 样式对象
	 */
	doApplyStyles(element, styles) {
		if (!element || !styles || !document.contains(element)) return;

		if (this.isMobileInlineStyles(styles)) {
			this.applyMobileInlineStyles(element, styles);
		} else {
			this.applyDesktopCssVariables(element, styles);
		}
	}

	/**
	 * 判断是否为移动端内联样式
	 * @param {Object} styles - 样式对象
	 * @returns {boolean} 是否为移动端内联样式
	 */
	isMobileInlineStyles(styles) {
		return (
			styles.position === "fixed" ||
			(styles.left && styles.transform && !styles["--centering-offset"])
		);
	}

	/**
	 * 应用移动端内联样式
	 * @param {HTMLElement} element - 目标元素
	 * @param {Object} styles - 样式对象
	 */
	applyMobileInlineStyles(element, styles) {
		// 清除可能存在的CSS变量
		element.style.removeProperty("--centering-offset");

		// 应用内联样式
		Object.entries(styles).forEach(([property, value]) => {
			if (property.startsWith("--")) return; // 跳过CSS变量

			if (value === "") {
				element.style.removeProperty(property);
			} else {
				element.style[property] = value;
			}
		});
	}

	/**
	 * 应用桌面端CSS变量
	 * @param {HTMLElement} element - 目标元素
	 * @param {Object} styles - 样式对象
	 */
	applyDesktopCssVariables(element, styles) {
		// 清除移动端内联样式
		const mobileProperties = ["position", "left", "top", "transform"];
		mobileProperties.forEach((prop) => {
			if (styles[prop] === "") {
				element.style.removeProperty(prop);
			}
		});

		// 应用CSS变量和其他样式
		Object.entries(styles).forEach(([property, value]) => {
			if (value === "") {
				// 清除属性
				if (property.startsWith("--")) {
					// CSS 自定义属性使用 removeProperty
					element.style.removeProperty(property);
				} else {
					// 普通 CSS 属性设置为空字符串
					element.style[property] = "";
				}
			} else {
				// 设置属性
				if (property.startsWith("--")) {
					// CSS 自定义属性使用 setProperty
					element.style.setProperty(property, value);
				} else {
					// 普通 CSS 属性使用 DOM 样式访问器（支持 camelCase）
					element.style[property] = value;
				}
			}
		});
	}

	/**
	 * 应用回退样式
	 * @param {HTMLElement} element - 目标元素
	 */
	applyFallbackStyles(element) {
		if (!element) return;

		// 简单的回退策略
		element.style.left = "50%";
		element.style.transform = "translateX(-50%)";
	}

	/**
	 * 调度批量更新
	 */
	scheduleBatchUpdate() {
		if (this.isUpdateScheduled) return;

		this.isUpdateScheduled = true;

		this.batchUpdateTimer = requestAnimationFrame(() => {
			this.executeBatchUpdate();
		});
	}

	/**
	 * 执行批量更新 - 优化版本，减少重排重绘
	 */
	executeBatchUpdate() {
		if (this.updateQueue.size === 0) {
			this.isUpdateScheduled = false;
			return;
		}

		// 批量执行DOM操作
		const operations = [...this.updateQueue.values()];
		this.updateQueue.clear();

		operations.forEach((operation) => {
			try {
				operation();
			} catch (error) {
				console.warn("[StyleApplicator] Batch operation failed:", error);
			}
		});

		this.isUpdateScheduled = false;

		// 如果还有新的操作排队，继续处理
		if (this.updateQueue.size > 0) {
			this.scheduleBatchUpdate();
		}
	}

	/**
	 * 立即执行所有排队的更新
	 */
	flushUpdates() {
		if (this.updateQueue.size > 0) {
			this.executeBatchUpdate();
		}
	}

	/**
	 * 清理元素的所有居中相关样式
	 * @param {HTMLElement} element - 目标元素
	 */
	clearStyles(element) {
		if (!element) return;

		try {
			const propertiesToClear = [
				"position",
				"left",
				"top",
				"transform",
				"z-index",
				"--centering-offset",
				"--desktop-base-offset",
			];

			propertiesToClear.forEach((property) => {
				element.style.removeProperty(property);
			});
		} catch (error) {
			console.warn("[StyleApplicator] Failed to clear styles:", error);
		}
	}

	/**
	 * 重置元素样式到默认状态
	 * @param {HTMLElement} element - 目标元素
	 */
	resetStyles(element) {
		if (!element) return;

		this.clearStyles(element);
		// 可以在这里添加默认样式应用逻辑
	}

	/**
	 * 检查元素是否存在于DOM中
	 * @param {HTMLElement} element - 要检查的元素
	 * @returns {boolean} 元素是否存在于DOM中
	 */
	isElementInDOM(element) {
		return element && document.contains(element);
	}

	/**
	 * 安全地查找元素
	 * @param {string} selector - CSS选择器
	 * @returns {HTMLElement|null} 找到的元素或null
	 */
	safeQuerySelector(selector) {
		try {
			return document.querySelector(selector);
		} catch (_error) {
			return null;
		}
	}
}
