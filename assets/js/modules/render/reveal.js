/**
 * 首屏显示
 *
 * index.html 的内联脚本在第一帧前确定主题，并给 <html> 加 .app-loading 让侧栏和主区先隐藏。
 * 首屏内容渲染后调用 revealApp()，下一帧整页一起淡入，避免侧栏先出、主区后出。
 * 只生效一次；内联脚本另有 3 秒兜底。
 */

const LOADING_CLASS = "app-loading";
const ENTERING_CLASS = "app-entering";
const ENTER_DURATION = 200;

let revealed = false;

const revealApp = () => {
	if (revealed) return;
	revealed = true;
	const root = document.documentElement;
	if (!root.classList.contains(LOADING_CLASS)) return;
	requestAnimationFrame(() => {
		root.classList.add(ENTERING_CLASS);
		root.classList.remove(LOADING_CLASS);
		setTimeout(
			() => root.classList.remove(ENTERING_CLASS),
			ENTER_DURATION + 50,
		);
	});
};

export { revealApp };
