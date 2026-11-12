import { durationMs } from "./motion.js";

const timers = new WeakMap();

const show = (element) => {
	element.dataset.scrolling = "";
	clearTimeout(timers.get(element));
};

const hideAfter = (element, idle) => {
	timers.set(
		element,
		setTimeout(() => {
			delete element.dataset.scrolling;
			timers.delete(element);
		}, idle),
	);
};

const isOnScrollbar = (element, event) => {
	if (element === document.documentElement) {
		return (
			event.clientX >= element.clientWidth ||
			event.clientY >= element.clientHeight
		);
	}
	const scrollable =
		element.scrollHeight > element.clientHeight ||
		element.scrollWidth > element.clientWidth;
	if (!scrollable) return false;
	const rect = element.getBoundingClientRect();
	return (
		event.clientX >= rect.left + element.clientLeft + element.clientWidth ||
		event.clientY >= rect.top + element.clientTop + element.clientHeight
	);
};

/**
 * 滚动期间给滚动容器加 data-scrolling，停止滚动 idle 毫秒后移除；
 * 用鼠标或笔按住滚动条拖动时一直保留，松开后再计时。
 * - root 为 document.documentElement 时跟踪页面本身的滚动。
 * - 其他元素：跟踪它自身及其后代中任意滚动容器（滚动事件不冒泡，用捕获监听）。
 * idle 默认取 CSS 令牌 --scroll-idle。返回取消跟踪的函数。
 */
export const trackScrollActivity = (root, { idle } = {}) => {
	const isPage = root === document.documentElement;
	const source = isPage ? window : root;
	const scrollOptions = { capture: !isPage, passive: true };
	let delay = idle;
	let held = null;
	let heldPointer = null;

	const getDelay = () => {
		delay ??= durationMs("--scroll-idle");
		return delay;
	};

	const onScroll = (event) => {
		const target =
			event.target === document ? document.documentElement : event.target;
		if (!(target instanceof HTMLElement)) return;
		show(target);
		if (target !== held) hideAfter(target, getDelay());
	};

	const release = () => {
		window.removeEventListener("pointerup", onPointerUp);
		window.removeEventListener("pointercancel", onPointerUp);
		if (held) hideAfter(held, getDelay());
		held = null;
		heldPointer = null;
	};

	const onPointerUp = (event) => {
		if (event.pointerId === heldPointer) release();
	};

	const onPointerDown = (event) => {
		if (event.pointerType === "touch") return;
		const target = isPage ? document.documentElement : event.target;
		if (!(target instanceof HTMLElement)) return;
		if (isPage && event.target !== target) return;
		if (!isOnScrollbar(target, event)) return;
		held = target;
		heldPointer = event.pointerId;
		show(target);
		window.addEventListener("pointerup", onPointerUp);
		window.addEventListener("pointercancel", onPointerUp);
	};

	source.addEventListener("scroll", onScroll, scrollOptions);
	source.addEventListener("pointerdown", onPointerDown, { passive: true });
	return () => {
		source.removeEventListener("scroll", onScroll, scrollOptions);
		source.removeEventListener("pointerdown", onPointerDown);
		release();
	};
};
