import site from "../../../../site.config.js";

const TITLE_FONT = "LXGW WenKai";
const HOME_FONT = "DingTalk JinBuTi";
const FIRST_SCREEN_FONT_WAIT_LIMIT_MS = 300;

const collectTitleCharacters = (nodes, characters = new Set()) => {
	for (const node of nodes) {
		for (const character of node.title ?? "") characters.add(character);
		if (node.children) collectTitleCharacters(node.children, characters);
	}
	return characters;
};

const ignoreFailure = () => {};

const collectSidebarTitles = (bookmarks) =>
	bookmarks
		.flatMap((node) => [
			node,
			...(node.children ?? []).filter((child) => child.type === "folder"),
		])
		.map((node) => node.title ?? "")
		.join("");

// unicode-range 分片要等字符排版时才开始下载；缓存数据渲染得比这更早，
// 不先加载首屏用到的分片，页面会带着回退字体淡入。分片未缓存时下载会拖慢
// 缓存数据的渲染，所以等待设有上限。
const loadFirstScreenFonts = (bookmarks) => {
	const fontsLoaded = Promise.all([
		document.fonts.load(`1em "${TITLE_FONT}"`, collectSidebarTitles(bookmarks)),
		document.fonts.load(`1em "${HOME_FONT}"`, site.title + site.subtitle),
	]).catch(ignoreFailure);
	const waitLimit = new Promise((resolve) =>
		setTimeout(resolve, FIRST_SCREEN_FONT_WAIT_LIMIT_MS),
	);
	return Promise.race([fontsLoaded, waitLimit]);
};

const afterPageAndFontsLoad = (callback) => {
	const run = () => document.fonts.ready.then(callback);
	if (document.readyState === "complete") run();
	else window.addEventListener("load", run, { once: true });
};

const loadSearchFont = () => {
	for (const face of document.fonts) {
		if (face.family.replaceAll('"', "") === HOME_FONT) {
			face.load().catch(ignoreFailure);
		}
	}
};

// 提前下载所有书签标题会用到的分片，之后的视图不会在分片下载期间显示回退字体。
const preloadFontSlices = (bookmarks) =>
	afterPageAndFontsLoad(() => {
		const titleText = [...collectTitleCharacters(bookmarks)].join("");
		document.fonts.load(`1em "${TITLE_FONT}"`, titleText).catch(ignoreFailure);
	});

// 搜索输入可能用到任意字符，聚焦搜索框时再下载搜索字体的全部分片。
const loadSearchFontOnFocus = () => {
	const input = document.getElementById("search-input");
	if (!input) return;
	if (document.activeElement === input) loadSearchFont();
	else input.addEventListener("focus", loadSearchFont, { once: true });
};

export { loadFirstScreenFonts, loadSearchFontOnFocus, preloadFontSlices };
