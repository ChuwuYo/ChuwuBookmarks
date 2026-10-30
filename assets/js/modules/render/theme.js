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

const applyReducedMotion = () => {
	const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
	if (!query || typeof gsap === "undefined") return;
	const apply = () => gsap.globalTimeline.timeScale(query.matches ? 100 : 1);
	apply();
	query.addEventListener("change", apply);
};

const THEME_COLOR = { light: "#23d6e3", dark: "#74ceff" };
const syncThemeColor = (theme) => {
	for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
		meta.setAttribute("content", THEME_COLOR[theme] ?? THEME_COLOR.light);
	}
};

const THEME_KEY = "theme";

/** 本次会话中手动选择的主题；存储不可用时也能保住用户的选择 */
let manualTheme = null;

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

const initTheme = () => {
	applyReducedMotion();
	const root = document.documentElement;
	const theme = readStoredTheme() ?? getSystemTheme();
	if (root.getAttribute("data-theme") !== theme) {
		root.setAttribute("data-theme", theme);
	}
	syncThemeColor(theme);

	systemThemeQuery()?.addEventListener("change", () => {
		if (manualTheme || readStoredTheme()) return;
		const next = getSystemTheme();
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
 * 切换期间暂停全站 CSS 过渡：子元素继承的颜色会在父元素过渡中途反复重启，造成卡顿和多次闪烁。
 */
const SWITCH_CLASS = "theme-switching";
const CIRCLE_CLASS = "theme-switching-circle";
const REVERSE_CLASS = "theme-switching-reverse";
const EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
const DURATION = { expand: 600, collapse: 500 };
const ENABLE_TRANSITIONS_DELAY = 500;
const SAFETY_TIMEOUT = 2000;
const PROBE_NAME = "theme-origin-probe";
let switchId = 0;

const prefersReducedMotion = () =>
	window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

const applyTheme = (theme) => {
	manualTheme = theme;
	document.documentElement.setAttribute("data-theme", theme);
	try {
		localStorage.setItem(THEME_KEY, theme);
	} catch {
		// 存储不可用（如隐私模式）时只切换本次会话
	}
	syncThemeColor(theme);
};

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

/**
 * 视口左上角在快照容器（snapshot containing block）中的位置。
 * 手机上快照容器包含可收起的地址栏，原点和视口不同；getBoundingClientRect 是视口坐标，
 * 直接用会让圆心偏移。用一个固定在视口左上角的命名元素，读它的 ::view-transition-group 位移，
 * 得到两个坐标系之间的偏移。桌面端偏移为 0。
 */
const createProbe = () => {
	// 连续快速切换时，上一次的 probe 可能还没清理；同名元素会让新的过渡放弃动画
	for (const stale of document.querySelectorAll("[data-theme-origin-probe]")) {
		stale.remove();
	}
	const probe = document.createElement("div");
	probe.dataset.themeOriginProbe = "";
	probe.setAttribute("aria-hidden", "true");
	probe.style.cssText = `position:fixed;top:0;left:0;width:1px;height:1px;pointer-events:none;view-transition-name:${PROBE_NAME}`;
	document.body.append(probe);
	return probe;
};

const getProbeOffset = () => {
	const { transform } = getComputedStyle(
		document.documentElement,
		`::view-transition-group(${PROBE_NAME})`,
	);
	if (!transform || transform === "none" || typeof DOMMatrix !== "function") {
		return { x: 0, y: 0 };
	}
	const matrix = new DOMMatrix(transform);
	return { x: matrix.e, y: matrix.f };
};

const parsePx = (value) =>
	value?.endsWith("px") ? Number.parseFloat(value) : Number.NaN;

const getSnapshotSize = () => {
	const box = getComputedStyle(
		document.documentElement,
		"::view-transition-group(root)",
	);
	const width = parsePx(box.width);
	const height = parsePx(box.height);
	return {
		width: width > 0 ? width : window.innerWidth,
		height: height > 0 ? height : window.innerHeight,
	};
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
	const probe = circle ? createProbe() : null;
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
				const { width, height } = getSnapshotSize();
				const offset = getProbeOffset();
				const x = origin.x + offset.x;
				const y = origin.y + offset.y;
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
			probe?.remove();
			if (!isCurrent()) return;
			setGsapPaused(false);
			root.classList.remove(SWITCH_CLASS, CIRCLE_CLASS, REVERSE_CLASS);
		});
};

export { animationConfig, initTheme, toggleTheme };
