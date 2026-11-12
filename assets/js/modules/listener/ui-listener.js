import { renderHome } from "../render/home.js";
import { dataErrorMessage } from "../render/message.js";
import { closeSidebarOverlay } from "../render/sidebar-state.js";
import { toggleTheme } from "../render/theme.js";
import { showView } from "../render/view.js";
import { writeSearchState } from "../utils/url-state.js";

const setupThemeToggle = () => {
	const themeToggle = document.getElementById("theme-toggle");
	if (themeToggle) {
		const themeToggleHandler = (e) => {
			if (
				e.type === "click" ||
				(e.type === "keydown" && (e.key === "Enter" || e.key === " "))
			) {
				e.preventDefault();
				toggleTheme();
			}
		};

		themeToggle.addEventListener("click", themeToggleHandler);
		themeToggle.addEventListener("keydown", themeToggleHandler);
	}
};

const setupHomeButton = () => {
	const homeButton = document.querySelector(".home-button");
	if (homeButton) {
		let isProcessing = false;

		const handleHomeNavigation = () => {
			if (isProcessing) return;

			isProcessing = true;

			const search = document.querySelector("bm-search");
			if (search) search.value = "";

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

		const homeNavigationHandler = (e) => {
			if (
				e.type === "click" ||
				(e.type === "keydown" && (e.key === "Enter" || e.key === " "))
			) {
				e.preventDefault();
				handleHomeNavigation();
			}
		};

		homeButton.addEventListener("click", homeNavigationHandler);
		homeButton.addEventListener("keydown", homeNavigationHandler);
	}
};

const initUIListeners = () => {
	setupThemeToggle();
	setupHomeButton();
};

export { initUIListeners };
