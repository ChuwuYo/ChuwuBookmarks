/**
 * PositionCalculator - 位置计算器类
 * 负责根据设备类型和上下文计算元素位置样式
 */

export class PositionCalculator {
	constructor() {
		// 缓存计算结果以提高性能 - 使用LRU缓存
		this.calculationCache = new Map();
		this.maxCacheSize = 50;
		this.lastContext = null;
	}

	/**
	 * 计算元素位置样式
	 * @param {Object} config - 元素配置
	 * @param {Object} context - 上下文信息
	 * @returns {Object} 计算出的样式对象
	 */
	calculatePosition(config, context) {
		// 快速验证关键参数
		if (!config?.positioning || !context?.deviceType) {
			return {};
		}

		const { deviceType } = context;
		const cacheKey = this.generateCacheKey(config, context);

		// 检查缓存
		if (this.calculationCache.has(cacheKey)) {
			return this.calculationCache.get(cacheKey);
		}

		const positioning = config.positioning[deviceType];
		if (!positioning?.strategy) {
			return {};
		}

		let styles = {};

		try {
			// 执行位置计算 - 简化的错误处理
			switch (positioning.strategy) {
				case "fixed-center":
					styles = this.calculateFixedCenter(positioning);
					break;
				case "fixed-top":
					styles = this.calculateFixedTop(positioning);
					break;
				case "css-controlled":
					styles = this.calculateCssControlled(positioning, config, context);
					break;
				default:
					// 未知策略静默处理，不输出警告
					return {};
			}

			// 设置z-index
			if (config.zIndex && config.zIndex !== "auto") {
				styles.zIndex = config.zIndex;
			}

			// 缓存结果
			this.setCacheWithLRU(cacheKey, styles);
		} catch (error) {
			console.warn(
				"[PositionCalculator] Calculate position failed:",
				error.message,
			);
			return {};
		}

		return styles;
	}

	/**
	 * 计算移动端固定居中位置
	 * @param {Object} positioning - 定位配置
	 * @returns {Object} 样式对象
	 */
	calculateFixedCenter(positioning) {
		const styles = {
			position: "fixed",
			left: "50%",
			transform: "translate(-50%, -50%)",
		};

		// 处理top或bottom属性
		if (positioning.top) {
			styles.top = positioning.top;
			styles.bottom = "";
		} else if (positioning.bottom) {
			styles.bottom = positioning.bottom;
			styles.top = "";
			styles.transform = "translateX(-50%)";
		} else {
			styles.top = "50%";
			styles.bottom = "";
		}

		return styles;
	}

	/**
	 * 计算移动端固定顶部居中位置
	 * @param {Object} positioning - 定位配置
	 * @returns {Object} 样式对象
	 */
	calculateFixedTop(positioning) {
		const styles = {
			position: "fixed",
			left: "50%",
			transform: "translateX(-50%)",
		};

		// 设置top值
		if (positioning.top) {
			styles.top = positioning.top;
		} else {
			styles.top = "20px";
		}

		return styles;
	}

	/**
	 * 计算桌面端CSS控制位置
	 * @param {Object} positioning - 定位配置
	 * @param {Object} config - 完整元素配置
	 * @param {Object} context - 上下文信息
	 * @returns {Object} 样式对象
	 */
	calculateCssControlled(positioning, config, context) {
		const { sidebarCollapsed, centeringOffset } = context;

		const styles = {
			// 移除内联样式，让CSS接管
			position: "",
			left: "",
			top: "",
			transform: "",
		};

		// 计算偏移量
		let calculatedOffset = "0px";

		if (config.useCenteringOffset && centeringOffset) {
			// 使用动态偏移
			calculatedOffset = centeringOffset;
		} else if (positioning.baseOffset) {
			// 使用基础偏移
			if (sidebarCollapsed) {
				calculatedOffset = "0px";
			} else {
				calculatedOffset = positioning.baseOffset;
			}
		}

		// 设置CSS变量
		styles["--centering-offset"] = calculatedOffset;

		return styles;
	}

	/**
	 * 更新上下文并清理相关缓存
	 * @param {Object} newContext - 新的上下文信息
	 */
	updateContext(newContext) {
		// 如果上下文发生变化，清理缓存
		if (!this.isContextEqual(this.lastContext, newContext)) {
			this.clearCache();
			this.lastContext = { ...newContext };
		}
	}

	/**
	 * 检查两个上下文是否相等
	 * @param {Object} context1 - 上下文1
	 * @param {Object} context2 - 上下文2
	 * @returns {boolean} 是否相等
	 */
	isContextEqual(context1, context2) {
		if (!context1 || !context2) return false;

		return (
			context1.deviceType === context2.deviceType &&
			context1.sidebarCollapsed === context2.sidebarCollapsed &&
			context1.centeringOffset === context2.centeringOffset
		);
	}

	/**
	 * 生成缓存键
	 * @param {Object} config - 元素配置
	 * @param {Object} context - 上下文信息
	 * @returns {string} 缓存键
	 */
	generateCacheKey(config, context) {
		const configHash = JSON.stringify({
			positioning: config.positioning,
			useCenteringOffset: config.useCenteringOffset,
			zIndex: config.zIndex,
		});

		const contextHash = JSON.stringify(context);

		return `${configHash}|${contextHash}`;
	}

	/**
	 * 获取基础居中样式（回退方案）
	 * @returns {Object} 基础样式对象
	 */
	getBasicCenteringStyles() {
		return {
			left: "50%",
			transform: "translateX(-50%)",
		};
	}

	/**
	 * LRU缓存设置
	 * @param {string} key - 缓存键
	 * @param {Object} value - 缓存值
	 */
	setCacheWithLRU(key, value) {
		// 如果已存在，先删除再重新添加（移到最新）
		if (this.calculationCache.has(key)) {
			this.calculationCache.delete(key);
		}
		// 检查缓存大小限制
		else if (this.calculationCache.size >= this.maxCacheSize) {
			// 删除最旧的项（Map的第一个项）
			const firstKey = this.calculationCache.keys().next().value;
			this.calculationCache.delete(firstKey);
		}
		this.calculationCache.set(key, value);
	}

	/**
	 * 清理计算缓存
	 */
	clearCache() {
		this.calculationCache.clear();
	}
}
