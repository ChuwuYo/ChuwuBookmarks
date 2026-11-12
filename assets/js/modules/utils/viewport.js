/**
 * 视口与输入方式的唯一来源。断点与 assets/css/breakpoints.css 中记录的一致：
 * 布局按宽度判断，唯一例外是并入手机布局的横屏手机 (any-pointer: coarse) and (height < 600px)；
 * 悬停效果只按 (hover: hover) and (pointer: fine) 判断。
 */

const BREAKPOINTS = Object.freeze({ narrow: 480, sidebar: 1024 });

const SHORT_TOUCH = "(any-pointer: coarse) and (height < 600px)";

const QUERIES = Object.freeze({
	compact: `(width < ${BREAKPOINTS.narrow}px), ${SHORT_TOUCH}`,
	sidebarOverlay: `(width < ${BREAKPOINTS.sidebar}px)`,
});

const lists = new Map();

const getList = (name) => {
	const query = QUERIES[name];
	if (!query) throw new Error(`Unknown viewport query: ${name}`);
	let list = lists.get(name);
	if (!list) {
		list = window.matchMedia(query);
		lists.set(name, list);
	}
	return list;
};

const matches = (name) => getList(name).matches;

/** 手机布局：窄屏，或高度不足 600px 的触屏设备（横屏手机） */
const isCompact = () => matches("compact");

/** 侧边栏覆盖内容、默认收起：宽度小于 1024px */
const isSidebarOverlay = () => matches("sidebarOverlay");

/** 订阅某个查询的匹配变化，回调参数为新的 matches；返回取消订阅函数 */
const onChange = (name, callback) => {
	const list = getList(name);
	const listener = (event) => callback(event.matches);
	list.addEventListener("change", listener);
	return () => list.removeEventListener("change", listener);
};

export { isCompact, isSidebarOverlay, onChange };
