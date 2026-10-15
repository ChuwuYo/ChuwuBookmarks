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
 * 分页模块常量
 */
export const PAGINATION_CONSTANTS = {
	/**
	 * 默认每页项目数
	 */
	DEFAULT_ITEMS_PER_PAGE: 20,

	/**
	 * 默认最大可见页码数
	 */
	DEFAULT_MAX_VISIBLE_PAGES: 5,

	/**
	 * 最大每页项目数限制
	 */
	MAX_PAGE_SIZE: 1000,

	/**
	 * 默认防抖延迟（毫秒）
	 */
	DEFAULT_DEBOUNCE_DELAY_MS: 150,

	/**
	 * 导航按钮防抖延迟（毫秒）
	 * 用于上一页/下一页按钮
	 */
	NAV_BUTTON_DEBOUNCE_MS: 100,

	/**
	 * 处理状态延迟（毫秒）
	 * 防止重复点击的处理状态持续时间
	 */
	PROCESSING_STATE_DELAY_MS: 200,

	/**
	 * 点击反馈动画持续时间（毫秒）
	 */
	CLICK_FEEDBACK_DURATION_MS: 150,

	/**
	 * 触觉反馈振动持续时间（毫秒）
	 */
	VIBRATION_DURATION_MS: 50,

	/**
	 * 懒加载创建分页控件超时时间（毫秒）
	 */
	LAZY_CREATE_TIMEOUT_MS: 100,

	/**
	 * 元素池最大大小（每类型）
	 */
	MAX_POOL_SIZE_PER_TYPE: 20,

	/**
	 * DOM优化器默认防抖延迟（毫秒）
	 * 对应约60fps的单帧时间
	 */
	DOM_OPTIMIZER_DEBOUNCE_MS: 16,
};

/**
 * 性能监控常量
 */
export const PERFORMANCE_MONITOR_CONSTANTS = {
	/**
	 * 性能指标历史记录最大数量
	 * 防止内存泄漏
	 */
	MAX_METRICS_HISTORY: 100,

	/**
	 * 元素池最大大小
	 */
	MAX_ELEMENT_POOL_SIZE: 10,

	/**
	 * 待处理更新最大数量
	 */
	MAX_PENDING_UPDATES: 5,

	/**
	 * 内存使用历史显示条目数
	 */
	MEMORY_USAGE_HISTORY_DISPLAY_COUNT: 10,
};

/**
 * 触摸交互常量
 */
export const TOUCH_CONSTANTS = {
	/**
	 * 最小触摸目标大小（像素）
	 * 符合WCAG无障碍标准
	 */
	MIN_TOUCH_TARGET_SIZE: 44,

	/**
	 * 滑动手势阈值（像素）
	 * 超过此值认为是有效滑动
	 */
	SWIPE_THRESHOLD_PX: 50,

	/**
	 * 滑动最大持续时间（毫秒）
	 * 超过此值不认为是滑动手势
	 */
	SWIPE_MAX_DURATION_MS: 300,
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
