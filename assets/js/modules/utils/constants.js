/**
 * 统一常量配置文件
 *
 * 该文件定义了项目中所有的配置常量，避免魔法数字的出现
 * 提高代码的可读性和可维护性
 */

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
 * 渲染模块常量
 */
export const RENDER_CONSTANTS = {
	/**
	 * 面包屑遮罩渐变偏移（像素）
	 */
	BREADCRUMB_MASK_OFFSET: 15,

	/**
	 * 面包屑滚动检测阈值（像素）
	 */
	BREADCRUMB_SCROLL_THRESHOLD: 10,

	/**
	 * 移动端高度断点（像素）
	 * 用于检测手机设备（包括横屏）
	 */
	MOBILE_HEIGHT_BREAKPOINT: 600,

	/**
	 * 侧边栏动画错开延迟（秒）
	 */
	SIDEBAR_ANIMATION_STAGGER: 0.05,

	/**
	 * 搜索淡入延迟（毫秒）
	 */
	SEARCH_FADE_IN_DELAY_MS: 150,

	/**
	 * 搜索淡入总时长（毫秒）
	 */
	SEARCH_FADE_TOTAL_DURATION_MS: 300,

	/**
	 * 页面切换反馈时长（毫秒）
	 */
	PAGE_CHANGE_FEEDBACK_DURATION_MS: 200,
};

/**
 * 搜索防抖常量
 */
export const SEARCH_DEBOUNCE_CONSTANTS = {
	/**
	 * 默认防抖时间（毫秒）
	 */
	DEFAULT_MS: 250,

	/**
	 * 最小防抖时间（毫秒）
	 */
	MIN_MS: 120,

	/**
	 * 最大防抖时间（毫秒）
	 */
	MAX_MS: 500,

	/**
	 * 小数据量阈值（书签数量）
	 */
	SMALL_DATA_THRESHOLD: 2000,

	/**
	 * 中数据量阈值（书签数量）
	 */
	MEDIUM_DATA_THRESHOLD: 5000,

	/**
	 * 大数据量阈值（书签数量）
	 */
	LARGE_DATA_THRESHOLD: 20000,

	/**
	 * 小数据量防抖时间 - 桌面端（毫秒）
	 */
	SMALL_DATA_DESKTOP_MS: 140,

	/**
	 * 小数据量防抖时间 - 移动端（毫秒）
	 */
	SMALL_DATA_MOBILE_MS: 180,

	/**
	 * 中数据量防抖时间 - 桌面端（毫秒）
	 */
	MEDIUM_DATA_DESKTOP_MS: 200,

	/**
	 * 中数据量防抖时间 - 移动端（毫秒）
	 */
	MEDIUM_DATA_MOBILE_MS: 260,

	/**
	 * 大数据量防抖时间 - 桌面端（毫秒）
	 */
	LARGE_DATA_DESKTOP_MS: 300,

	/**
	 * 大数据量防抖时间 - 移动端（毫秒）
	 */
	LARGE_DATA_MOBILE_MS: 380,

	/**
	 * 超大数据量防抖时间（毫秒）
	 */
	EXTRA_LARGE_DATA_MS: 500,
};
