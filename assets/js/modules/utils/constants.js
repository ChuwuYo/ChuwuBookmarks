/**
 * 统一常量配置文件
 *
 * 该文件定义了项目中所有的配置常量，避免魔法数字的出现
 * 提高代码的可读性和可维护性
 */

/**
 * 布局相关常量
 */
export const LAYOUT_CONSTANTS = {
	/**
	 * 侧边栏基础偏移量
	 * 用于桌面端居中计算，包含侧边栏宽度和内边距
	 * 计算依据：侧边栏宽度(100px) + 边距(10px) = 110px
	 */
	SIDEBAR_BASE_OFFSET: "110px",

	/**
	 * 搜索容器默认顶部位置
	 * 移动端搜索容器距离顶部的固定距离
	 */
	SEARCH_CONTAINER_TOP_MOBILE: "20px",

	/**
	 * 主页消息默认顶部位置
	 * 主页消息在屏幕中的垂直位置
	 */
	HOME_MESSAGE_TOP: "45%",

	/**
	 * 错误消息默认顶部位置
	 * 错误消息在屏幕中的垂直位置
	 */
	ERROR_MESSAGE_TOP: "50%",
};

/**
 * 性能相关常量
 */
export const PERFORMANCE_CONSTANTS = {
	/**
	 * 动画帧延迟时间
	 * 对应60fps的单帧时间（1000ms/60 ≈ 16.67ms）
	 * 用于与浏览器渲染周期同步
	 */
	ANIMATION_FRAME_DELAY_MS: 16,

	/**
	 * 内存使用警告阈值
	 * 当内存使用超过此值时触发警告（单位：字节）
	 * 50MB = 50 * 1024 * 1024 bytes
	 */
	MEMORY_USAGE_WARNING_THRESHOLD_BYTES: 50 * 1024 * 1024,

	/**
	 * 内存使用警告阈值（MB单位，用于显示）
	 * 便于日志输出和调试时的可读性
	 */
	MEMORY_USAGE_WARNING_THRESHOLD_MB: 50,

	/**
	 * 缓存历史记录保留数量
	 * 性能监控时保留的历史数据条数，避免内存泄漏
	 */
	CACHE_HISTORY_RETENTION_COUNT: 50,
};

/**
 * 事件防抖和节流相关常量
 */
export const DEBOUNCE_THROTTLE_CONSTANTS = {
	/**
	 * 窗口大小改变事件防抖延迟
	 * 用于resize事件的防抖处理，减少频繁触发
	 * 平衡响应性和性能：150ms足够快速响应用户操作，同时避免过度计算
	 */
	WINDOW_RESIZE_DEBOUNCE_MS: 150,

	/**
	 * 侧边栏状态变化防抖延迟
	 * 用于MutationObserver监听侧边栏状态变化的防抖处理
	 */
	SIDEBAR_CHANGE_DEBOUNCE_MS: 100,

	/**
	 * 布局变化事件防抖延迟
	 * 用于避免频繁派发layoutChange事件
	 */
	LAYOUT_CHANGE_DEBOUNCE_MS: 50,

	/**
	 * 搜索输入防抖延迟
	 * 用户输入搜索关键词时的防抖延迟，提升用户体验
	 */
	SEARCH_INPUT_DEBOUNCE_MS: 300,
};

/**
 * Z-Index层级常量
 */
export const Z_INDEX_CONSTANTS = {
	/**
	 * 搜索容器层级
	 * 确保搜索容器始终在其他元素之上
	 */
	SEARCH_CONTAINER: 999,

	/**
	 * 消息提示层级
	 * 用于各种消息提示的层级
	 */
	MESSAGE_OVERLAY: 10,

	/**
	 * 默认层级
	 * 表示使用浏览器默认的z-index值
	 */
	AUTO: "auto",
};

/**
 * 内存监控相关常量
 */
export const MEMORY_MONITORING_CONSTANTS = {
	/**
	 * 最大事件监听器数量
	 * 用于检测潜在的内存泄漏
	 */
	MAX_LISTENER_COUNT: 50,

	/**
	 * 内存泄漏检查间隔
	 * 定期检查内存使用情况（单位：毫秒）
	 * 30秒 = 30 * 1000ms
	 */
	MEMORY_LEAK_CHECK_INTERVAL_MS: 30 * 1000,
};

/**
 * 获取内存使用警告阈值（字节）
 * @returns {number} 内存警告阈值（字节）
 */
export function getMemoryWarningThresholdBytes() {
	return PERFORMANCE_CONSTANTS.MEMORY_USAGE_WARNING_THRESHOLD_BYTES;
}

/**
 * 获取内存使用警告阈值（MB）
 * @returns {number} 内存警告阈值（MB）
 */
export function getMemoryWarningThresholdMB() {
	return PERFORMANCE_CONSTANTS.MEMORY_USAGE_WARNING_THRESHOLD_MB;
}

/**
 * 检查内存使用是否超过阈值
 * @param {number} memoryUsage - 当前内存使用量（字节）
 * @returns {boolean} 是否超过阈值
 */
export function isMemoryUsageExcessive(memoryUsage) {
	return (
		memoryUsage > PERFORMANCE_CONSTANTS.MEMORY_USAGE_WARNING_THRESHOLD_BYTES
	);
}
