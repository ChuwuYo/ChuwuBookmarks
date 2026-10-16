/**
 * 侧边栏滚动提示
 *
 * 侧边栏内容超出可视高度且没滚到底时，在右下角显示向下的小三角。
 *
 * 侧边栏本身高度固定，往里面插入文件夹、展开子文件夹、字体加载完成都只改变它的
 * scrollHeight，不会改变它自身的尺寸，也没有任何事件通知。所以除了观察侧边栏，还要用
 * ResizeObserver 观察里面的内容（头部和 #sidebar-folders）：内容高度一变就重新判断。
 * 同一帧内的多次触发合并成一次检查。
 */

const AT_BOTTOM_TOLERANCE = 2;

let initialized = false;
let sidebar = null;
let hintElement = null;
let frame = 0;

/** 侧边栏是否可滚动且未到底，据此显示或隐藏提示 */
const checkScrollable = () => {
	frame = 0;
	if (!sidebar || !hintElement) return;

	if (sidebar.classList.contains("collapsed")) {
		hintElement.classList.remove("visible");
		return;
	}

	const { scrollHeight, clientHeight, scrollTop } = sidebar;
	const needsScroll = scrollHeight > clientHeight;
	const isAtBottom =
		scrollTop >= scrollHeight - clientHeight - AT_BOTTOM_TOLERANCE;
	hintElement.classList.toggle("visible", needsScroll && !isAtBottom);
};

const scheduleCheck = () => {
	if (!frame) frame = requestAnimationFrame(checkScrollable);
};

/** 观察侧边栏及其内容的尺寸；<bm-sidebar> 是 display: contents，没有盒子，观察它的子元素 */
const observeSizes = () => {
	const observer = new ResizeObserver(scheduleCheck);
	observer.observe(sidebar);
	for (const element of sidebar.querySelectorAll(
		".sidebar-header, #sidebar-folders",
	)) {
		observer.observe(element);
	}
};

const initSidebarScrollHint = () => {
	if (initialized) return;

	sidebar = document.querySelector(".sidebar");
	if (!sidebar) {
		console.warn("[SidebarScrollHint] Sidebar element not found");
		return;
	}

	hintElement = document.createElement("div");
	hintElement.className = "sidebar-scroll-hint";
	hintElement.setAttribute("aria-hidden", "true");
	document.body.appendChild(hintElement);

	sidebar.addEventListener("scroll", scheduleCheck, { passive: true });

	// 折叠/展开侧边栏
	new MutationObserver(scheduleCheck).observe(sidebar, {
		attributes: true,
		attributeFilter: ["class"],
	});

	// ResizeObserver 开始观察后会先回调一次，作为初始检查
	observeSizes();

	initialized = true;
};

export { initSidebarScrollHint };
