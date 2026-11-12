let reducedMotionQuery = null;

const getReducedMotionQuery = () => {
	reducedMotionQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
	return reducedMotionQuery;
};

const prefersReducedMotion = () => getReducedMotionQuery().matches;

const readToken = (name) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();

const parseTime = (value) => {
	const number = Number.parseFloat(value);
	if (!Number.isFinite(number)) return 0;
	return value.endsWith("ms") ? number : number * 1000;
};

/** 时长令牌（如 "--duration-3"）当前在 CSS 中的取值，单位毫秒 */
const durationMs = (name) => parseTime(readToken(name));

/** 时长令牌，单位秒，供 GSAP 使用 */
const durationS = (name) => durationMs(name) / 1000;

/** 缓动令牌的 CSS 写法，供 Web Animations API 使用 */
const easing = (name) => readToken(name) || "ease";

/** GSAP 核心不解析 cubic-bezier()；power1.out 即 --ease-out 所用的二次缓出曲线 */
const GSAP_EASE = { out: "power1.out", bounce: "bounce.out" };

const REDUCED_GSAP_TIME_SCALE = 100;

const syncGsapWithReducedMotion = () => {
	if (typeof gsap === "undefined") return;
	const apply = () =>
		gsap.globalTimeline.timeScale(
			prefersReducedMotion() ? REDUCED_GSAP_TIME_SCALE : 1,
		);
	apply();
	getReducedMotionQuery().addEventListener("change", apply);
};

export {
	durationMs,
	durationS,
	easing,
	GSAP_EASE,
	prefersReducedMotion,
	syncGsapWithReducedMotion,
};
