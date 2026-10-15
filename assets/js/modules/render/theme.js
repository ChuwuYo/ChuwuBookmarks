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

/** 主题相关 */
const initTheme = () => {
	applyReducedMotion();
	const theme = localStorage.getItem("theme") || "light";
	document.documentElement.setAttribute("data-theme", theme);
};

const toggleTheme = () => {
	const currentTheme = document.documentElement.getAttribute("data-theme");
	const newTheme = currentTheme === "light" ? "dark" : "light";

	// 使用requestAnimationFrame优化渲染
	requestAnimationFrame(() => {
		document.documentElement.setAttribute("data-theme", newTheme);
		localStorage.setItem("theme", newTheme);
	});
};

export { animationConfig, initTheme, toggleTheme };
