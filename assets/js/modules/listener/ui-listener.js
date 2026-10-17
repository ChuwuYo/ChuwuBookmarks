import { isMobileDevice, updateSidebarState } from "../render/device.js";
import { renderHome } from "../render/home.js";
import { showErrorMessage } from "../render/message.js";
import { toggleTheme } from "../render/theme.js";

const setupSidebarToggle = () => {
	document.addEventListener("bm-sidebar-toggle", (event) => {
		const sidebar = document.querySelector(".sidebar");
		if (sidebar) updateSidebarState(sidebar, event.detail.collapsed);
	});
};

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

			const searchInput = document.getElementById("search-input");
			if (searchInput) {
				searchInput.value = "";
			}

			const url = new URL(window.location);
			url.searchParams.delete("q");
			url.searchParams.delete("page");
			window.history.replaceState({}, document.title, url.toString());

			if (isMobileDevice()) {
				const sidebar = document.querySelector(".sidebar");
				if (sidebar && !sidebar.classList.contains("collapsed")) {
					updateSidebarState(sidebar, true);
				}
			}

			requestAnimationFrame(() => {
				try {
					renderHome();
				} catch (error) {
					console.error("Failed to render home:", error);
					showErrorMessage(error);
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
	setupSidebarToggle();
	setupThemeToggle();
	setupHomeButton();
};

export { initUIListeners };
