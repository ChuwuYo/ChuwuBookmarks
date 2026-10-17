// 插入或展开文件夹、字体加载完成只改变侧边栏的 scrollHeight，不改变它的尺寸，
// 也没有事件通知，所以还要观察里面的内容。

const AT_BOTTOM_TOLERANCE = 2;

let initialized = false;
let sidebar = null;
let hintElement = null;
let frame = 0;

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

	new MutationObserver(scheduleCheck).observe(sidebar, {
		attributes: true,
		attributeFilter: ["class"],
	});

	// ResizeObserver 开始观察后会先回调一次，作为初始检查
	observeSizes();

	initialized = true;
};

export { initSidebarScrollHint };
