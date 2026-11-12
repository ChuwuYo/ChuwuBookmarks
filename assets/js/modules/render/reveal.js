import { durationMs } from "../utils/motion.js";

let revealed = false;

const revealApp = () => {
	if (revealed) return;
	revealed = true;
	const root = document.documentElement;
	if (root.dataset.reveal !== "loading") return;
	requestAnimationFrame(() => {
		root.dataset.reveal = "entering";
		setTimeout(() => {
			if (root.dataset.reveal === "entering")
				root.removeAttribute("data-reveal");
		}, durationMs("--duration-3"));
	});
};

export { revealApp };
