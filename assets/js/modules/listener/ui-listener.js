import { renderHome } from "../render/home.js";
import { dataErrorMessage } from "../render/message.js";
import { closeSidebarOverlay } from "../render/sidebar-state.js";
import { toggleTheme } from "../render/theme.js";
import { showView } from "../render/view.js";
import { writeSearchState } from "../utils/url-state.js";

const setupThemeToggle = () => {
	document
		.getElementById("theme-toggle")
		.addEventListener("click", toggleTheme);
};

const setupHomeButton = () => {
	let isProcessing = false;

	const handleHomeNavigation = () => {
		if (isProcessing) return;

		isProcessing = true;

		document.querySelector("bm-search").value = "";

		writeSearchState({ query: "", page: null });

		closeSidebarOverlay();

		requestAnimationFrame(() => {
			try {
				renderHome();
			} catch (error) {
				console.error("Failed to render home:", error);
				showView({ content: [dataErrorMessage(error)] });
			} finally {
				// 确保在下一帧重置状态，即使 renderHome 抛出异常
				requestAnimationFrame(() => {
					isProcessing = false;
				});
			}
		});
	};

	document
		.querySelector(".home-button")
		.addEventListener("click", handleHomeNavigation);
};

const initUIListeners = () => {
	setupThemeToggle();
	setupHomeButton();
};

export { initUIListeners };
