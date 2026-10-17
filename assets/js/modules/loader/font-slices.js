import site from "../../../../site.config.js";

const TITLE_FONT = "LXGW WenKai";
const HOME_FONT = "DingTalk JinBuTi";

const collectTitleCharacters = (nodes, characters = new Set()) => {
	for (const node of nodes) {
		for (const character of node.title ?? "") characters.add(character);
		if (node.children) collectTitleCharacters(node.children, characters);
	}
	return characters;
};

const ignoreFailure = () => {};

// A unicode-range slice is fetched only when its characters are first laid
// out. Cached data renders before that would happen, so load the slices the
// first screen shows beforehand; otherwise it fades in with fallback glyphs.
const loadFirstScreenFonts = (bookmarks) =>
	Promise.all([
		document.fonts.load(
			`1em "${TITLE_FONT}"`,
			bookmarks.map((node) => node.title ?? "").join(""),
		),
		document.fonts.load(`1em "${HOME_FONT}"`, site.title + site.subtitle),
	]).catch(ignoreFailure);

const afterPageAndFontsLoad = (callback) => {
	const run = () => document.fonts.ready.then(callback);
	if (document.readyState === "complete") run();
	else window.addEventListener("load", run, { once: true });
};

// Fetch the slices for every bookmark title and for typed searches ahead of
// use, so later views never show fallback glyphs while a slice downloads.
const preloadFontSlices = (bookmarks) =>
	afterPageAndFontsLoad(() => {
		const titleText = [...collectTitleCharacters(bookmarks)].join("");
		document.fonts.load(`1em "${TITLE_FONT}"`, titleText).catch(ignoreFailure);
		for (const face of document.fonts) {
			if (face.family.replaceAll('"', "") === HOME_FONT) {
				face.load().catch(ignoreFailure);
			}
		}
	});

export { loadFirstScreenFonts, preloadFontSlices };
