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

/**
 * 居中管理器常量
 */
export const CENTERING_CONSTANTS = {
	/**
	 * 位置计算缓存最大大小
	 */
	POSITION_CACHE_MAX_SIZE: 50,

	/**
	 * 固定顶部默认偏移（像素）
	 */
	FIXED_TOP_DEFAULT_OFFSET_PX: 20,

	/**
	 * 分页控件移动端底部偏移（像素）
	 */
	PAGINATION_MOBILE_BOTTOM_OFFSET_PX: 20,
};
