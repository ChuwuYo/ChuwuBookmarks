/**
 * EventCoordinator - 事件协调器类
 * 负责监听和协调各种影响居中的事件
 */

import { DEBOUNCE_THROTTLE_CONSTANTS } from "../constants.js";

export class EventCoordinator {
	constructor(updateCallback) {
		this.updateCallback = updateCallback;

		// 事件监听器引用
		this.listeners = {
			resize: null,
			sidebarObserver: null,
			layoutChange: null,
			centeringOffsetChange: null,
		};

		// 防抖和节流配置
		this.debounceDelay = DEBOUNCE_THROTTLE_CONSTANTS.WINDOW_RESIZE_DEBOUNCE_MS;
		this.throttleDelay = DEBOUNCE_THROTTLE_CONSTANTS.SIDEBAR_CHANGE_DEBOUNCE_MS;

		// 防抖和节流定时器
		this.timers = {
			resize: null,
			sidebarChange: null,
		};

		// 初始化状态
		this.isDestroyed = false;
	}

	/**
	 * 初始化所有事件监听器
	 */
	initialize() {
		if (this.isDestroyed) {
			return;
		}

		try {
			this.setupResizeListener();
			this.setupSidebarObserver();
			this.setupLayoutChangeListener();
			this.setupCenteringOffsetListener();
		} catch (error) {
			console.warn("[EventCoordinator] Initialization failed:", error);
		}
	}

	/**
	 * 设置窗口resize事件监听器（防抖处理）
	 */
	setupResizeListener() {
		this.listeners.resize = this.debounce(() => {
			if (this.isDestroyed) return;

			// 触发更新回调
			if (this.updateCallback) {
				this.updateCallback("resize", {
					width: window.innerWidth,
					height: window.innerHeight,
				});
			}
		}, this.debounceDelay);

		window.addEventListener("resize", this.listeners.resize);
	}

	/**
	 * 设置侧栏状态变化监听器（MutationObserver）
	 */
	setupSidebarObserver() {
		try {
			const sidebar = document.querySelector(".sidebar");
			if (!sidebar) {
				return;
			}

			this.listeners.sidebarObserver = new MutationObserver(
				this.throttle((mutations) => {
					if (this.isDestroyed) return;

					let sidebarStateChanged = false;

					mutations.forEach((mutation) => {
						if (
							mutation.type === "attributes" &&
							(mutation.attributeName === "class" ||
								mutation.attributeName === "data-collapsed")
						) {
							sidebarStateChanged = true;
						}
					});

					if (sidebarStateChanged) {
						const isCollapsed =
							sidebar.classList.contains("collapsed") ||
							sidebar.getAttribute("data-collapsed") === "true";

						if (this.updateCallback) {
							this.updateCallback("sidebarChange", {
								collapsed: isCollapsed,
								element: sidebar,
							});
						}
					}
				}, this.throttleDelay),
			);

			// 开始观察侧栏的属性变化
			this.listeners.sidebarObserver.observe(sidebar, {
				attributes: true,
				attributeFilter: ["class", "data-collapsed"],
			});
		} catch (error) {
			console.warn("[EventCoordinator] Sidebar observer setup failed:", error);
		}
	}

	/**
	 * 设置自定义布局变化事件监听器
	 */
	setupLayoutChangeListener() {
		this.listeners.layoutChange = (event) => {
			if (this.isDestroyed) return;

			if (this.updateCallback) {
				this.updateCallback("layoutChange", event.detail || {});
			}
		};

		document.addEventListener("layoutChange", this.listeners.layoutChange);
	}

	/**
	 * 设置居中偏移变化事件监听器
	 */
	setupCenteringOffsetListener() {
		this.listeners.centeringOffsetChange = (event) => {
			if (this.isDestroyed) return;

			if (this.updateCallback) {
				this.updateCallback("centeringOffsetChange", event.detail || {});
			}
		};

		document.addEventListener(
			"centeringOffsetChange",
			this.listeners.centeringOffsetChange,
		);
	}

	/**
	 * 防抖函数
	 * @param {Function} func - 要防抖的函数
	 * @param {number} delay - 延迟时间（毫秒）
	 * @returns {Function} 防抖后的函数
	 */
	debounce(func, delay) {
		return (...args) => {
			clearTimeout(this.timers.resize);
			this.timers.resize = setTimeout(() => func.apply(this, args), delay);
		};
	}

	/**
	 * 节流函数
	 * @param {Function} func - 要节流的函数
	 * @param {number} delay - 延迟时间（毫秒）
	 * @returns {Function} 节流后的函数
	 */
	throttle(func, delay) {
		let lastCall = 0;
		return (...args) => {
			const now = Date.now();
			if (now - lastCall >= delay) {
				lastCall = now;
				func.apply(this, args);
			}
		};
	}

	/**
	 * 手动触发更新事件
	 * @param {string} eventType - 事件类型
	 * @param {Object} data - 事件数据
	 */
	triggerUpdate(eventType, data = {}) {
		if (this.isDestroyed) return;

		if (this.updateCallback) {
			this.updateCallback(eventType, data);
		}
	}

	/**
	 * 销毁事件协调器，清理所有监听器
	 */
	destroy() {
		if (this.isDestroyed) return;

		try {
			// 清理resize监听器
			if (this.listeners.resize) {
				window.removeEventListener("resize", this.listeners.resize);
				this.listeners.resize = null;
			}

			// 清理侧栏观察器
			if (this.listeners.sidebarObserver) {
				this.listeners.sidebarObserver.disconnect();
				this.listeners.sidebarObserver = null;
			}

			// 清理自定义事件监听器
			if (this.listeners.layoutChange) {
				document.removeEventListener(
					"layoutChange",
					this.listeners.layoutChange,
				);
				this.listeners.layoutChange = null;
			}

			if (this.listeners.centeringOffsetChange) {
				document.removeEventListener(
					"centeringOffsetChange",
					this.listeners.centeringOffsetChange,
				);
				this.listeners.centeringOffsetChange = null;
			}

			// 清理所有定时器
			Object.values(this.timers).forEach((timer) => {
				if (timer) clearTimeout(timer);
			});
			this.timers = {};

			// 清理回调引用，防止内存泄漏
			this.updateCallback = null;

			// 标记为已销毁
			this.isDestroyed = true;
		} catch (error) {
			console.warn("[EventCoordinator] Error during destruction:", error);
		}
	}
}
