import site from "../../../../site.config.js";
import { getDeviceType } from "./device.js";
import { resetSearchPagination } from "./search.js";
import { animationConfig } from "./theme.js";

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

const createHomeTextTimeline = (homeMessage, chineseText, englishText) => {
	const masterTimeline = gsap.timeline();

	masterTimeline.to(homeMessage, {
		opacity: 1,
		duration: animationConfig.duration.medium,
		ease: animationConfig.ease.outQuad,
	});

	masterTimeline.to(
		chineseText,
		{
			opacity: 1,
			scale: 1,
			x: 0,
			duration: animationConfig.duration.long,
			ease: animationConfig.ease.outQuad,
		},
		"-=0.2",
	);

	masterTimeline.to(
		englishText,
		{
			opacity: 1,
			scale: 1,
			x: 0,
			duration: animationConfig.duration.long,
			ease: animationConfig.ease.outQuad,
		},
		"-=0.3",
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
	spans.forEach((charSpan, index) => {
		const char = charSpan.textContent;
		if (char === "的") {
			gsap.set(charSpan, { y: -50, opacity: 0 });
			gsap.to(charSpan, {
				y: 0,
				opacity: 1,
				duration: 0.8,
				delay: 1.2,
				ease: "bounce.out",
			});
		} else {
			gsap.set(charSpan, { opacity: 0, x: -10 });
			gsap.to(charSpan, {
				opacity: 1,
				x: 0,
				duration: 0.2,
				delay: 0.5 + index * 0.05,
				ease: "power1.out",
			});
		}
	});
};

const setupEnglishCharacterAnimation = (spans) => {
	spans.forEach((charSpan, index) => {
		const char = charSpan.textContent;
		if (char === "'" || char === "s") {
			gsap.set(charSpan, { y: -50, opacity: 0 });
			gsap.to(charSpan, {
				y: 0,
				opacity: 1,
				duration: 0.8,
				delay: char === "'" ? 1.5 : 1.7,
				ease: "bounce.out",
			});
		} else {
			gsap.set(charSpan, { opacity: 0, x: -10 });
			gsap.to(charSpan, {
				opacity: 1,
				x: 0,
				duration: 0.2,
				delay: 0.7 + index * 0.04,
				ease: "power1.out",
			});
		}
	});
};

import { clearAllMessages } from "./message.js";

const renderHome = () => {
	const content = document.getElementById("content");
	const breadcrumbs = document.getElementById("breadcrumbs");

	if (!content || !breadcrumbs) return;

	try {
		resetSearchPagination();
	} catch (error) {
		console.error("[Home] Failed to cleanup pagination:", error);
	}

	clearAllMessages();

	const { fragment, homeMessage, chineseText, englishText } =
		createHomeStructure();

	content.innerHTML = "";
	breadcrumbs.innerHTML = "";

	const deviceType = getDeviceType();

	if (deviceType === "mobile") {
		document.body.appendChild(fragment);
	} else {
		content.appendChild(fragment);
	}

	if (deviceType === "mobile") {
		homeMessage.classList.add("mobile-home-message");
	}

	setupHomeTextAnimation(homeMessage, chineseText, englishText);
	createHomeTextTimeline(homeMessage, chineseText, englishText);

	requestAnimationFrame(() => {
		const { fragment: chineseFragment, spans: chineseSpans } =
			createCharacterSpans(site.title);
		chineseText.textContent = "";
		chineseText.appendChild(chineseFragment);
		setupChineseCharacterAnimation(chineseSpans);

		const { fragment: englishFragment, spans: englishSpans } =
			createCharacterSpans(site.subtitle);
		englishText.textContent = "";
		englishText.appendChild(englishFragment);
		setupEnglishCharacterAnimation(englishSpans);
	});
};

export { renderHome };
