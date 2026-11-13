import {
	durationMs,
	easing,
	prefersReducedMotion,
	syncGsapWithReducedMotion,
} from "../utils/motion.js";

const THEME_COLOR = { light: "#23d6e3", dark: "#74ceff" };
const syncThemeColor = (theme) => {
	for (const meta of document.querySelectorAll('meta[name="theme-color"]')) {
		meta.setAttribute("content", THEME_COLOR[theme] ?? THEME_COLOR.light);
	}
};

const THEME_KEY = "theme";

let themeTurn = 0;

const setRootTheme = (theme) => {
	const root = document.documentElement;
	root.setAttribute("data-theme", theme);
	themeTurn += (themeTurn % 2 === 1) === (theme === "dark") ? 0 : 1;
	root.style.setProperty("--theme-turn", themeTurn);
	document
		.getElementById("theme-toggle")
		.setAttribute("aria-pressed", String(theme === "dark"));
};

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
	window.matchMedia("(prefers-color-scheme: dark)");

const getSystemTheme = () => (systemThemeQuery().matches ? "dark" : "light");

const preferredTheme = () =>
	manualTheme ?? readStoredTheme() ?? getSystemTheme();

const followPreference = () => {
	const root = document.documentElement;
	const next = preferredTheme();
	if (root.getAttribute("data-theme") === next) return;
	root.setAttribute(SWITCHING_ATTR, "");
	setRootTheme(next);
	syncThemeColor(next);
	afterStyleCommit(() => root.removeAttribute(SWITCHING_ATTR));
};

const initTheme = () => {
	syncGsapWithReducedMotion();
	const theme = preferredTheme();
	setRootTheme(theme);
	syncThemeColor(theme);

	systemThemeQuery().addEventListener("change", followPreference);
	window.addEventListener("storage", (event) => {
		if (event.key !== null && event.key !== THEME_KEY) return;
		manualTheme = readStoredTheme();
		followPreference();
	});
};

/**
 * 切换期间新触发的 CSS 过渡时长为 0：子元素继承的颜色会在父元素过渡中途反复重启，造成卡顿和多次闪烁。
 */
const SWITCHING_ATTR = "data-theme-switching";
const TRANSITION_ATTR = "data-theme-transition";
const SAFETY_MARGIN = 2000;
const PROBE_NAME = "theme-origin-probe";
let switchId = 0;

/** 新主题的样式至少渲染过一帧后再执行，此时恢复过渡不会补播颜色变化 */
const afterStyleCommit = (callback) =>
	requestAnimationFrame(() => requestAnimationFrame(callback));

const storeOverride = (theme) => {
	try {
		if (theme) localStorage.setItem(THEME_KEY, theme);
		else localStorage.removeItem(THEME_KEY);
	} catch {
		// 存储不可用（如隐私模式）时只切换本次会话
	}
};

const applyTheme = (theme) => {
	manualTheme = theme === getSystemTheme() ? null : theme;
	storeOverride(manualTheme);
	setRootTheme(theme);
	syncThemeColor(theme);
};

const getOrigin = () => {
	const rect = document
		.querySelector("#theme-toggle .theme-icon")
		.getBoundingClientRect();
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
	document.body.append(probe);
	return probe;
};

const getProbeOffset = () => {
	const { transform } = getComputedStyle(
		document.documentElement,
		`::view-transition-group(${PROBE_NAME})`,
	);
	if (!transform || transform === "none") {
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

const toggleTheme = () => {
	const root = document.documentElement;
	const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
	const id = ++switchId;
	const isCurrent = () => id === switchId;

	root.setAttribute(SWITCHING_ATTR, "");

	if (typeof document.startViewTransition !== "function") {
		applyTheme(next);
		afterStyleCommit(() => {
			if (isCurrent()) root.removeAttribute(SWITCHING_ATTR);
		});
		return;
	}

	const circle = !prefersReducedMotion();
	const reverse = next === "light";
	const origin = circle ? getOrigin() : null;
	const probe = circle ? createProbe() : null;
	if (circle) {
		root.setAttribute(TRANSITION_ATTR, reverse ? "circle reverse" : "circle");
	} else {
		root.removeAttribute(TRANSITION_ATTR);
	}
	void root.offsetLeft; // 先让属性生效，再拍旧快照

	const transition = document.startViewTransition(() => applyTheme(next));

	// 性能差的设备上拍快照就要几百毫秒，兜底计时在动画开始时重新计，否则会在动画末尾强行跳过
	let safety = 0;
	let clip;
	const armSafety = (duration) => {
		clearTimeout(safety);
		safety = setTimeout(
			() => transition.skipTransition(),
			duration + SAFETY_MARGIN,
		);
	};

	armSafety(0);
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
				const duration = durationMs(
					reverse ? "--duration-theme-collapse" : "--duration-theme-expand",
				);
				armSafety(duration);
				clip = root.animate(reverse ? keyframes.reverse() : keyframes, {
					duration,
					easing: easing("--ease-standard"),
					pseudoElement,
					fill: "forwards", // 没有它，结束瞬间会闪一下
				});
			})
			.catch(() => {}); // 被跳过时 ready 会 reject
	} else {
		transition.ready.then(() => armSafety(0)).catch(() => {});
	}

	transition.finished
		.catch(() => {})
		.finally(() => {
			clearTimeout(safety);
			clip?.cancel();
			probe?.remove();
			if (!isCurrent()) return;
			root.removeAttribute(SWITCHING_ATTR);
			root.removeAttribute(TRANSITION_ATTR);
		});
};

export { initTheme, toggleTheme };
