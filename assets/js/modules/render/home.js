import site from "../../../../site.config.js";
import { durationS, GSAP_EASE } from "../utils/motion.js";
import { isCompact } from "../utils/viewport.js";
import { resetSearchPagination } from "./search.js";

const createHomeStructure = () => {
	const fragment = document.createDocumentFragment();
	const homeMessage = document.createElement("div");
	homeMessage.className = "home-message centered-element vertical-center";
	homeMessage.setAttribute("role", "status");
	homeMessage.setAttribute("aria-live", "polite");

	const chineseText = document.createElement("div");
	chineseText.className = "chinese-text";

	const englishText = document.createElement("div");
	englishText.className = "english-text";

	homeMessage.appendChild(chineseText);
	homeMessage.appendChild(englishText);
	fragment.appendChild(homeMessage);

	return { fragment, homeMessage, chineseText, englishText };
};

const setupHomeTextAnimation = (homeMessage, chineseText, englishText) => {
	gsap.set(homeMessage, { opacity: 0 });
	gsap.set(chineseText, {
		opacity: 0,
		scale: 0.8,
		x: -50,
		transformOrigin: "center center",
		textContent: site.title,
	});
	gsap.set(englishText, {
		opacity: 0,
		scale: 0.8,
		x: -50,
		transformOrigin: "center center",
		textContent: site.subtitle,
	});
};

/** 首页标题的编排时间（秒），只在这里使用，没有对应的 CSS 值 */
const INTRO = {
	textDuration: 0.5,
	dropDuration: 0.8,
	charDelay: { chinese: 0.5, english: 0.7 },
	dropDelay: { chinese: 1.2, apostrophe: 1.5, s: 1.7 },
	englishStaggerRatio: 0.8,
};

const createHomeTextTimeline = (homeMessage, chineseText, englishText) => {
	const masterTimeline = gsap.timeline();
	const fade = durationS("--duration-4");
	const overlap = durationS("--duration-3");

	masterTimeline.to(homeMessage, {
		opacity: 1,
		duration: fade,
		ease: GSAP_EASE.out,
	});

	masterTimeline.to(
		chineseText,
		{
			opacity: 1,
			scale: 1,
			x: 0,
			duration: INTRO.textDuration,
			ease: GSAP_EASE.out,
		},
		`-=${overlap}`,
	);

	masterTimeline.to(
		englishText,
		{
			opacity: 1,
			scale: 1,
			x: 0,
			duration: INTRO.textDuration,
			ease: GSAP_EASE.out,
		},
		`-=${fade}`,
	);

	return masterTimeline;
};

/** 按字素簇切分，emoji 与组合字符不会被拆开 */
const splitGraphemes = (text) => {
	if (typeof Intl !== "undefined" && Intl.Segmenter) {
		const segmenter = new Intl.Segmenter(undefined, {
			granularity: "grapheme",
		});
		return Array.from(segmenter.segment(text), ({ segment }) => segment);
	}
	return Array.from(text);
};

const createCharacterSpans = (chars) => {
	const fragment = document.createDocumentFragment();
	const spans = splitGraphemes(chars).map((char) => {
		const charSpan = document.createElement("span");
		charSpan.textContent = char;
		charSpan.className = "home-char";
		fragment.appendChild(charSpan);
		return charSpan;
	});
	return { fragment, spans };
};

const setupChineseCharacterAnimation = (spans) => {
	const charDuration = durationS("--duration-3");
	const stagger = durationS("--stagger-step");
	spans.forEach((charSpan, index) => {
		const char = charSpan.textContent;
		if (char === "的") {
			gsap.set(charSpan, { y: -50, opacity: 0 });
			gsap.to(charSpan, {
				y: 0,
				opacity: 1,
				duration: INTRO.dropDuration,
				delay: INTRO.dropDelay.chinese,
				ease: GSAP_EASE.bounce,
			});
		} else {
			gsap.set(charSpan, { opacity: 0, x: -10 });
			gsap.to(charSpan, {
				opacity: 1,
				x: 0,
				duration: charDuration,
				delay: INTRO.charDelay.chinese + index * stagger,
				ease: GSAP_EASE.out,
			});
		}
	});
};

const setupEnglishCharacterAnimation = (spans) => {
	const charDuration = durationS("--duration-3");
	const stagger = durationS("--stagger-step") * INTRO.englishStaggerRatio;
	spans.forEach((charSpan, index) => {
		const char = charSpan.textContent;
		if (char === "'" || char === "s") {
			gsap.set(charSpan, { y: -50, opacity: 0 });
			gsap.to(charSpan, {
				y: 0,
				opacity: 1,
				duration: INTRO.dropDuration,
				delay: char === "'" ? INTRO.dropDelay.apostrophe : INTRO.dropDelay.s,
				ease: GSAP_EASE.bounce,
			});
		} else {
			gsap.set(charSpan, { opacity: 0, x: -10 });
			gsap.to(charSpan, {
				opacity: 1,
				x: 0,
				duration: charDuration,
				delay: INTRO.charDelay.english + index * stagger,
				ease: GSAP_EASE.out,
			});
		}
	});
};

import { clearAllMessages } from "./message.js";

const renderHome = () => {
	const content = document.getElementById("content");
	const breadcrumbs = document.getElementById("breadcrumbs");

	if (!content || !breadcrumbs) return;

	resetSearchPagination();

	clearAllMessages();

	const { fragment, homeMessage, chineseText, englishText } =
		createHomeStructure();

	breadcrumbs.replaceChildren();

	if (isCompact()) {
		content.replaceChildren();
		document.body.appendChild(fragment);
	} else {
		content.replaceChildren(fragment);
	}

	setupHomeTextAnimation(homeMessage, chineseText, englishText);
	createHomeTextTimeline(homeMessage, chineseText, englishText);

	requestAnimationFrame(() => {
		const { fragment: chineseFragment, spans: chineseSpans } =
			createCharacterSpans(site.title);
		chineseText.replaceChildren(chineseFragment);
		setupChineseCharacterAnimation(chineseSpans);

		const { fragment: englishFragment, spans: englishSpans } =
			createCharacterSpans(site.subtitle);
		englishText.replaceChildren(englishFragment);
		setupEnglishCharacterAnimation(englishSpans);
	});
};

export { renderHome };
