/**
 * UniversalCenteringManager - 统一居中管理器类
 * 负责整合所有子组件，提供统一的居中管理API
 */

import { getDeviceType } from "../../render/device.js";
import { ElementRegistry } from "./element-registry.js";
import { EventCoordinator } from "./event-coordinator.js";
import { PositionCalculator } from "./position-calculator.js";
import { StyleApplicator } from "./style-applicator.js";

export class UniversalCenteringManager {
	constructor() {
		// 初始化所有子组件
		this.elementRegistry = new ElementRegistry();
		this.positionCalculator = new PositionCalculator();
		this.styleApplicator = new StyleApplicator();
		this.eventCoordinator = null;

		// 当前上下文
		this.currentContext = {
			deviceType: getDeviceType(),
			sidebarCollapsed: this.getSidebarState(),
			centeringOffset: "0px",
			screenWidth: window.innerWidth,
		};

		// 前一个上下文，用于检测变化
		this.previousContext = { ...this.currentContext };

		// 销毁标志
		this.isDestroyed = false;

		// 元素缓存 - 存储已查询的DOM元素
		this.elementCache = new Map();
	}

	/**
	 * 初始化管理器
	 */
	initialize() {
		if (this.isDestroyed) {
			return;
		}

		try {
			// 创建事件协调器并传入更新回调
			this.eventCoordinator = new EventCoordinator(
				this.handleContextChange.bind(this),
			);

			// 初始化事件监听
			this.eventCoordinator.initialize();

			// 执行初始更新
			this.forceUpdateAll();
		} catch (error) {
			console.warn("[CenteringManager] Initialization failed:", error);
		}
	}

	/**
	 * 注册元素
	 * @param {string} key - 元素唯一标识
	 * @param {string} selector - CSS选择器
	 * @param {Object} config - 元素配置
	 * @returns {boolean} 注册是否成功
	 */
	registerElement(key, selector, config = {}) {
		if (this.isDestroyed) {
			return false;
		}

		try {
			const success = this.elementRegistry.registerElement(
				key,
				selector,
				config,
			);

			if (success) {
				// 清除该元素的缓存
				this.elementCache.delete(key);

				// 立即更新该元素
				this.updateSingleElement(key);
			}

			return success;
		} catch (error) {
			return false;
		}
	}

	/**
	 * 注销元素
	 * @param {string} key - 元素唯一标识
	 * @returns {boolean} 注销是否成功
	 */
	unregisterElement(key) {
		if (this.isDestroyed) {
			return false;
		}

		try {
			const success = this.elementRegistry.unregisterElement(key);

			if (success) {
				// 先获取缓存的元素
				const element = this.elementCache.get(key);

				// 清理该元素的样式
				if (element) {
					this.styleApplicator.clearStyles(element);
				}

				// 然后清除缓存
				this.elementCache.delete(key);
			}

			return success;
		} catch (error) {
			return false;
		}
	}

	/**
	 * 更新上下文
	 * @param {string} deviceType - 设备类型
	 * @param {boolean} sidebarCollapsed - 侧栏是否收起
	 * @param {string} centeringOffset - 居中偏移量
	 */
	updateContext(deviceType, sidebarCollapsed, centeringOffset) {
		if (this.isDestroyed) {
			return;
		}

		this.previousContext = { ...this.currentContext };

		this.currentContext = {
			deviceType: deviceType || this.currentContext.deviceType,
			sidebarCollapsed:
				sidebarCollapsed !== undefined
					? sidebarCollapsed
					: this.currentContext.sidebarCollapsed,
			centeringOffset: centeringOffset || this.currentContext.centeringOffset,
			screenWidth: window.innerWidth,
		};

		// 通知位置计算器更新上下文
		this.positionCalculator.updateContext(this.currentContext);

		// 更新所有元素
		this.forceUpdateAll();
	}

	/**
	 * 强制更新所有元素
	 */
	forceUpdateAll() {
		if (this.isDestroyed) {
			return;
		}

		try {
			const allElements = this.elementRegistry.getAllElements();

			allElements.forEach((_, key) => {
				this.updateSingleElement(key);
			});

			// 刷新所有待处理的样式更新
			this.styleApplicator.flushUpdates();
		} catch (error) {
			console.warn(
				"[CenteringManager] Force update all elements failed:",
				error,
			);
		}
	}

	/**
	 * 更新单个元素
	 * @param {string} key - 元素唯一标识
	 */
	updateSingleElement(key) {
		if (this.isDestroyed) {
			return;
		}

		try {
			const config = this.elementRegistry.getElementConfig(key);
			if (!config) {
				return;
			}

			// 获取或查询DOM元素
			let element = this.elementCache.get(key);

			// 检查缓存的元素是否仍在DOM中
			if (element && !this.styleApplicator.isElementInDOM(element)) {
				// 缓存的元素已被移除，清除缓存并重新查询
				this.elementCache.delete(key);
				element = null;
			}

			// 如果没有有效的缓存元素，重新查询
			if (!element) {
				element = this.styleApplicator.safeQuerySelector(config.selector);
				if (element) {
					this.elementCache.set(key, element);
				}
			}

			if (!element) {
				return;
			}

			// 计算位置样式
			const styles = this.positionCalculator.calculatePosition(
				config,
				this.currentContext,
			);

			// 应用样式
			this.styleApplicator.applyStyles(element, styles);
		} catch (error) {
			console.warn(
				"[CenteringManager] Update single element failed:",
				key,
				error,
			);
		}
	}

	/**
	 * 处理上下文变化
	 * @param {string} eventType - 事件类型
	 * @param {Object} data - 事件数据
	 */
	handleContextChange(eventType, data) {
		if (this.isDestroyed) {
			return;
		}

		try {
			switch (eventType) {
				case "resize":
					this.updateContext(
						getDeviceType(),
						this.currentContext.sidebarCollapsed,
						this.currentContext.centeringOffset,
					);
					break;

				case "sidebarChange":
					this.updateContext(
						this.currentContext.deviceType,
						data.collapsed,
						this.currentContext.centeringOffset,
					);
					break;

				case "layoutChange":
					this.updateContext(
						getDeviceType(),
						this.getSidebarState(),
						this.currentContext.centeringOffset,
					);
					break;

				case "centeringOffsetChange":
					this.updateContext(
						this.currentContext.deviceType,
						this.currentContext.sidebarCollapsed,
						data.offset || this.currentContext.centeringOffset,
					);
					break;

				default:
					// 未知事件类型，尝试恢复到默认上下文
					this.recoverFromContextError();
			}
		} catch (error) {
			// 处理失败，尝试恢复
			this.recoverFromContextError();
		}
	}

	/**
	 * 从上下文错误中恢复
	 */
	recoverFromContextError() {
		if (this.isDestroyed) {
			return;
		}

		try {
			// 重新检测设备类型和侧栏状态
			const newDeviceType = getDeviceType();
			const newSidebarState = this.getSidebarState();

			// 如果检测到变化，更新上下文
			if (
				newDeviceType !== this.currentContext.deviceType ||
				newSidebarState !== this.currentContext.sidebarCollapsed
			) {
				this.updateContext(
					newDeviceType,
					newSidebarState,
					this.currentContext.centeringOffset,
				);
			}
		} catch (error) {
			// 恢复失败，使用最小化回退配置
			this.forceUpdateAll();
		}
	}

	/**
	 * 获取侧栏状态
	 * @returns {boolean} 侧栏是否收起
	 */
	getSidebarState() {
		try {
			const sidebar = document.querySelector(".sidebar");
			if (!sidebar) {
				// 侧栏不存在时，视为已折叠
				return true;
			}

			return (
				sidebar.classList.contains("collapsed") ||
				sidebar.getAttribute("data-collapsed") === "true"
			);
		} catch (error) {
			// 错误时也视为已折叠
			return true;
		}
	}

	/**
	 * 销毁管理器，清理所有资源
	 */
	destroy() {
		if (this.isDestroyed) {
			return;
		}

		try {
			// 销毁事件协调器
			if (this.eventCoordinator) {
				this.eventCoordinator.destroy();
				this.eventCoordinator = null;
			}

			// 清理所有注册元素的样式
			const allElements = this.elementRegistry.getAllElements();
			allElements.forEach((_, key) => {
				const element = this.elementCache.get(key);
				if (element) {
					this.styleApplicator.clearStyles(element);
				}
			});

			// 清理元素缓存
			this.elementCache.clear();

			// 清理注册表
			this.elementRegistry.clear();

			// 清理计算缓存
			this.positionCalculator.clearCache();

			// 标记为已销毁
			this.isDestroyed = true;
		} catch (error) {
			console.warn("[CenteringManager] Error during destruction:", error);
		}
	}
}
