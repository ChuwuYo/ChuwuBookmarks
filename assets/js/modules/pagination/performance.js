/**
 * 分页性能监控和优化工具
 *
 * 提供性能监控、内存使用跟踪和优化建议功能
 */

import { PERFORMANCE_MONITOR_CONSTANTS } from "../utils/constants.js";

/**
 * 性能监控器类
 */
export class PaginationPerformanceMonitor {
	constructor() {
		this.metrics = {
			renderTimes: [],
			updateTimes: [],
			memoryUsage: [],
			domOperations: 0,
			eventBindings: 0,
		};

		this.isMonitoring = false;
		this.maxMetricsHistory = PERFORMANCE_MONITOR_CONSTANTS.MAX_METRICS_HISTORY;
	}

	/**
	 * 开始性能监控
	 */
	startMonitoring() {
		this.isMonitoring = true;
	}

	/**
	 * 停止性能监控
	 */
	stopMonitoring() {
		this.isMonitoring = false;
	}

	/**
	 * 记录渲染时间
	 * @param {number} startTime - 开始时间
	 * @param {number} endTime - 结束时间
	 */
	recordRenderTime(startTime, endTime) {
		if (!this.isMonitoring) return;

		const renderTime = endTime - startTime;
		this.metrics.renderTimes.push(renderTime);

		// 限制历史记录数量
		if (this.metrics.renderTimes.length > this.maxMetricsHistory) {
			this.metrics.renderTimes.shift();
		}

		// 记录渲染时间（生产环境静默）
	}

	/**
	 * 记录更新时间
	 * @param {number} startTime - 开始时间
	 * @param {number} endTime - 结束时间
	 */
	recordUpdateTime(startTime, endTime) {
		if (!this.isMonitoring) return;

		const updateTime = endTime - startTime;
		this.metrics.updateTimes.push(updateTime);

		if (this.metrics.updateTimes.length > this.maxMetricsHistory) {
			this.metrics.updateTimes.shift();
		}
	}

	/**
	 * 记录内存使用情况
	 * @param {Object} memoryInfo - 内存信息
	 */
	recordMemoryUsage(memoryInfo) {
		if (!this.isMonitoring) return;

		this.metrics.memoryUsage.push({
			timestamp: Date.now(),
			...memoryInfo,
		});

		if (this.metrics.memoryUsage.length > this.maxMetricsHistory) {
			this.metrics.memoryUsage.shift();
		}
	}

	/**
	 * 增加DOM操作计数
	 */
	incrementDOMOperations() {
		if (!this.isMonitoring) return;
		this.metrics.domOperations++;
	}

	/**
	 * 增加事件绑定计数
	 */
	incrementEventBindings() {
		if (!this.isMonitoring) return;
		this.metrics.eventBindings++;
	}

	/**
	 * 获取性能统计
	 * @returns {Object} 性能统计信息
	 */
	getPerformanceStats() {
		const renderTimes = this.metrics.renderTimes;
		const updateTimes = this.metrics.updateTimes;

		return {
			renderStats: {
				count: renderTimes.length,
				average:
					renderTimes.length > 0
						? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length
						: 0,
				max: renderTimes.length > 0 ? Math.max(...renderTimes) : 0,
				min: renderTimes.length > 0 ? Math.min(...renderTimes) : 0,
			},
			updateStats: {
				count: updateTimes.length,
				average:
					updateTimes.length > 0
						? updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length
						: 0,
				max: updateTimes.length > 0 ? Math.max(...updateTimes) : 0,
				min: updateTimes.length > 0 ? Math.min(...updateTimes) : 0,
			},
			domOperations: this.metrics.domOperations,
			eventBindings: this.metrics.eventBindings,
			memoryUsageHistory: this.metrics.memoryUsage.slice(-10), // 最近10次记录
		};
	}
}

/**
 * 内存优化工具
 */
export const MemoryOptimizer = {
	/**
	 * 检查内存使用情况
	 * @param {Object} component - 要检查的组件
	 * @returns {Object} 内存使用信息
	 */
	checkMemoryUsage(component) {
		const usage = {
			elementPoolSize: 0,
			eventListenersCount: 0,
			weakMapEntries: 0,
			pendingUpdates: 0,
		};

		if (component.elementPool) {
			usage.elementPoolSize = Object.values(component.elementPool).reduce(
				(total, pool) => total + pool.length,
				0,
			);
		}

		if (component.eventListeners) {
			usage.eventListenersCount = component.eventListeners.size;
		}

		if (component.pendingUpdates) {
			usage.pendingUpdates = component.pendingUpdates.length;
		}

		return usage;
	},

	/**
	 * 优化内存使用
	 * @param {Object} component - 要优化的组件
	 */
	optimizeMemory(component) {
		// 清理过大的元素池
		if (component.elementPool) {
			Object.keys(component.elementPool).forEach((type) => {
				const pool = component.elementPool[type];
				if (
					pool.length > PERFORMANCE_MONITOR_CONSTANTS.MAX_ELEMENT_POOL_SIZE
				) {
					// 保留最近的元素，清理其余的
					const excess = pool.splice(
						PERFORMANCE_MONITOR_CONSTANTS.MAX_ELEMENT_POOL_SIZE,
					);
					excess.forEach((element) => {
						if (element.parentNode) {
							element.parentNode.removeChild(element);
						}
					});
				}
			});
		}

		// 清理待处理的更新
		if (
			component.pendingUpdates &&
			component.pendingUpdates.length >
				PERFORMANCE_MONITOR_CONSTANTS.MAX_PENDING_UPDATES
		) {
			component.pendingUpdates.length = 0;
		}
	},


};

/**
 * DOM操作优化工具
 */
export const DOMOptimizer = {
	/**
	 * 批量DOM操作包装器
	 * @param {Function} operations - DOM操作函数
	 * @returns {Promise} 操作完成的Promise
	 */
	batchDOMOperations(operations) {
		return new Promise((resolve) => {
			requestAnimationFrame(() => {
				const _startTime = performance.now();

				operations();

				const _endTime = performance.now();

				resolve();
			});
		});
	},

	/**
	 * 优化DOM更新
	 * @param {HTMLElement} container - 容器元素
	 * @param {Function} updateFn - 更新函数
	 */
	optimizedUpdate(container, updateFn) {
		// 使用DocumentFragment减少重排
		const _fragment = document.createDocumentFragment();
		const originalParent = container.parentNode;
		const nextSibling = container.nextSibling;

		// 临时移除容器，减少重排
		if (originalParent) {
			originalParent.removeChild(container);
		}

		// 执行更新
		updateFn(container);

		// 重新插入容器
		if (originalParent) {
			originalParent.insertBefore(container, nextSibling);
		}
	},

	/**
	 * 防抖DOM更新
	 * @param {Function} updateFn - 更新函数
	 * @param {number} delay - 延迟时间
	 * @returns {Function} 防抖后的函数
	 */
	debounceUpdate(updateFn, delay = 16) {
		let timeoutId = null;

		return function (...args) {
			clearTimeout(timeoutId);
			timeoutId = setTimeout(() => {
				updateFn.apply(this, args);
			}, delay);
		};
	},
};

// 全局性能监控实例
export const globalPerformanceMonitor = new PaginationPerformanceMonitor();

// 性能监控器可以手动启动
// globalPerformanceMonitor.startMonitoring();
