/**
 * 侧边栏滚动提示器模块
 * 简单检测侧边栏是否需要滚动，并显示向下滚动提示
 */

// 模块级变量
let initialized = false;
let sidebar = null;
let hintElement = null;
let observer = null;

/**
 * 防抖函数 - 延迟执行，避免高频触发
 */
const debounce = (func, wait) => {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

// 绑定的事件处理函数引用
const boundCheckScrollable = () => checkScrollable();
const debouncedCheckScrollable = debounce(boundCheckScrollable, 150); // 防抖处理resize事件

/**
 * 检查侧边栏是否可滚动并更新提示显示
 */
function checkScrollable() {
	if (!sidebar || !hintElement) return;

	// 侧边栏折叠时隐藏提示
	if (sidebar.classList.contains("collapsed")) {
		hintElement.classList.remove("visible");
		return;
	}

	const scrollHeight = sidebar.scrollHeight;
	const clientHeight = sidebar.clientHeight;
	const scrollTop = sidebar.scrollTop;

	// 如果内容超出容器高度且未滚动到底部，显示提示
	const needsScroll = scrollHeight > clientHeight;
	const isAtBottom = scrollTop >= scrollHeight - clientHeight - 2; // 容差改为2px

	if (needsScroll && !isAtBottom) {
		hintElement.classList.add("visible");
	} else {
		hintElement.classList.remove("visible");
	}
}

/**
 * 初始化侧边栏滚动提示器
 */
function initSidebarScrollHint() {
	// 防止重复初始化
	if (initialized) return;

	sidebar = document.querySelector(".sidebar");
	if (!sidebar) {
		console.warn("[SidebarScrollHint] Sidebar element not found");
		return;
	}

	// 创建提示器元素
	hintElement = document.createElement("div");
	hintElement.className = "sidebar-scroll-hint";
	hintElement.setAttribute("aria-hidden", "true");
	document.body.appendChild(hintElement);

	// 监听滚动事件
	sidebar.addEventListener("scroll", boundCheckScrollable, { passive: true });

	// 监听窗口大小变化（使用防抖处理）
	window.addEventListener("resize", debouncedCheckScrollable);

	// 监听侧边栏折叠状态变化
	observer = new MutationObserver(boundCheckScrollable);
	observer.observe(sidebar, { attributes: true, attributeFilter: ["class"] });

	// 初始检查
	setTimeout(checkScrollable, 100);

	initialized = true;
}

/**
 * 销毁侧边栏滚动提示器
 */
function _destroySidebarScrollHint() {
	if (!initialized) return;

	// 移除事件监听器
	if (sidebar) {
		sidebar.removeEventListener("scroll", boundCheckScrollable);
	}
	window.removeEventListener("resize", debouncedCheckScrollable);

	// 断开MutationObserver
	if (observer) {
		observer.disconnect();
		observer = null;
	}

	// 移除DOM元素
	if (hintElement?.parentNode) {
		hintElement.parentNode.removeChild(hintElement);
	}

	// 重置状态
	sidebar = null;
	hintElement = null;
	initialized = false;
}

export { initSidebarScrollHint };
