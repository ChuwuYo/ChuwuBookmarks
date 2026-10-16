/**
 * 主题、设备适配、渲染和搜索功能模块
 */

const animationConfig = {
	duration: {
		short: 0.15,
		base: 0.2,
		medium: 0.3,
		long: 0.5,
	},
	ease: {
		inOutCubic: "cubic-bezier(0.4, 0, 0.2, 1)",
		outQuad: "power1.out",
		default: "ease",
	},
};

/**
 * 系统开启“减少动态效果”时，让 GSAP 动画几乎瞬间完成（保留最终状态与回调）
 */
const applyReducedMotion = () => {
	const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
	if (!query || typeof gsap === "undefined") return;
	const apply = () => gsap.globalTimeline.timeScale(query.matches ? 100 : 1);
	apply();
	query.addEventListener("change", apply);
};

/** 浏览器地址栏颜色跟随站内主题，而不是系统主题 */
const THEME_COLOR = { light: "#23d6e3", dark: "#74ceff" };
const syncThemeColor = (theme) => {
	for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
		meta.setAttribute("content", THEME_COLOR[theme] ?? THEME_COLOR.light);
	}
};

const THEME_KEY = "theme";

const readStoredTheme = () => {
	try {
		const theme = localStorage.getItem(THEME_KEY);
		return theme === "light" || theme === "dark" ? theme : null;
	} catch {
		return null;
	}
};

const systemThemeQuery = () =>
	window.matchMedia?.("(prefers-color-scheme: dark)") ?? null;

const getSystemTheme = () => (systemThemeQuery()?.matches ? "dark" : "light");

/**
 * 主题相关
 *
 * 首帧的 data-theme 已由 index.html 内联脚本设好（保存过的主题，否则跟随系统），这里只做同步：
 * 没有保存过主题时继续跟随系统的深浅色变化；用户手动切换后以保存的主题为准。
 */
const initTheme = () => {
	applyReducedMotion();
	const root = document.documentElement;
	const theme = readStoredTheme() ?? getSystemTheme();
	if (root.getAttribute("data-theme") !== theme) {
		root.setAttribute("data-theme", theme);
	}
	syncThemeColor(theme);

	systemThemeQuery()?.addEventListener("change", () => {
		if (readStoredTheme()) return;
		const next = getSystemTheme();
		// 与手动切换一样暂停全站过渡，颜色一步到位
		root.classList.add(SWITCH_CLASS);
		root.setAttribute("data-theme", next);
		syncThemeColor(next);
		setTimeout(
			() => root.classList.remove(SWITCH_CLASS),
			ENABLE_TRANSITIONS_DELAY,
		);
	});
};

/**
 * 主题切换
 *
 * - 切换期间给 <html> 加 .theme-switching，暂停全站 CSS 过渡，避免每个元素各自从旧色
 *   过渡到新色（子元素继承的颜色会在父元素过渡中途反复重启，造成卡顿和多次闪烁）。
 *   直接切换时在 500ms 后恢复；View Transition 时在动画结束后恢复。
 * - 支持 View Transitions 时，以主题按钮图标中心为圆心：切到暗色时新主题快照画圆展开
 *   （600ms），切到亮色时旧主题快照在上层收缩（500ms），缓动 cubic-bezier(.4, 0, .2, 1)。
 * - 系统开启“减少动态效果”时不画圆，使用浏览器默认的交叉淡入；不支持 View Transitions
 *   时直接切换。
 * - 动画期间暂停 GSAP 时间线，结束后恢复；2 秒内未结束则强制跳过，保证页面不会卡在快照上。
 */
const SWITCH_CLASS = "theme-switching";
const CIRCLE_CLASS = "theme-switching-circle";
const REVERSE_CLASS = "theme-switching-reverse";
const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const DURATION = { expand: 600, collapse: 500 };
const ENABLE_TRANSITIONS_DELAY = 500;
const SAFETY_TIMEOUT = 2000;
let switchId = 0;

const prefersReducedMotion = () =>
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const applyTheme = (theme) => {
	document.documentElement.setAttribute("data-theme", theme);
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {
		// 存储不可用（如隐私模式）时只切换本次会话
	}
	syncThemeColor(theme);
};

/** 圆心：主题按钮图标的中心 */
const getOrigin = () => {
	const button = document.getElementById("theme-toggle");
	const icon = button?.querySelector(
		document.documentElement.getAttribute("data-theme") === "dark"
			? ".moon"
			: ".sun",
	);
	const target = icon ?? button;
	if (!target) return { x: window.innerWidth / 2, y: 0 };
	const rect = target.getBoundingClientRect();
	return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
};

/** 以快照自身尺寸的百分比表示圆，避免不同浏览器对 px 与设备像素比的解释差异 */
const circleIn = (width, height) => (radius, x, y) =>
	`circle(${(radius / Math.hypot(width, height)) * Math.SQRT2 * 100}% at ${(x / width) * 100}% ${(y / height) * 100}%)`;

const setGsapPaused = (paused) => {
	if (typeof gsap === "undefined") return;
	if (paused) gsap.globalTimeline.pause();
	else gsap.globalTimeline.resume();
};

const toggleTheme = () => {
	const root = document.documentElement;
	const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
	const id = ++switchId;
	const isCurrent = () => id === switchId;

	root.classList.add(SWITCH_CLASS);

	if (typeof document.startViewTransition !== "function") {
		applyTheme(next);
		setTimeout(() => {
			if (isCurrent()) root.classList.remove(SWITCH_CLASS);
		}, ENABLE_TRANSITIONS_DELAY);
		return;
	}

	const circle = !prefersReducedMotion();
	const reverse = next === "light";
	const origin = circle ? getOrigin() : null;
	root.classList.toggle(CIRCLE_CLASS, circle);
	root.classList.toggle(REVERSE_CLASS, circle && reverse);
	void root.offsetLeft; // 先让类名生效，再拍旧快照

	const transition = document.startViewTransition(() => applyTheme(next));
	setGsapPaused(true);

	const safety = setTimeout(
		() => transition.skipTransition?.(),
		SAFETY_TIMEOUT,
	);

	let clip;
	if (circle) {
		transition.ready
			.then(() => {
				const pseudoElement = `::view-transition-${reverse ? "old" : "new"}(root)`;
				const box = getComputedStyle(root, pseudoElement);
				const width = Number.parseFloat(box.width) || window.innerWidth;
				const height = Number.parseFloat(box.height) || window.innerHeight;
				const { x, y } = origin;
				const radius = Math.hypot(
					Math.max(x, width - x),
					Math.max(y, height - y),
				);
				const toCircle = circleIn(width, height);
				const keyframes = [
					{ clipPath: toCircle(0, x, y) },
					{ clipPath: toCircle(radius, x, y) },
				];
				clip = root.animate(reverse ? keyframes.reverse() : keyframes, {
					duration: reverse ? DURATION.collapse : DURATION.expand,
					easing: EASING,
					pseudoElement,
					fill: "forwards", // 没有它，结束瞬间会闪一下
				});
			})
			.catch(() => {}); // 被跳过时 ready 会 reject
	} else {
		transition.ready.catch(() => {});
	}

	transition.finished
		.catch(() => {})
		.finally(() => {
			clearTimeout(safety);
			clip?.cancel();
			if (!isCurrent()) return;
			setGsapPaused(false);
			root.classList.remove(SWITCH_CLASS, CIRCLE_CLASS, REVERSE_CLASS);
		});
};

export { animationConfig, initTheme, toggleTheme };
