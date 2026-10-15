import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const fixture = (name) =>
	readFileSync(resolve(import.meta.dirname, "../fixtures", name), "utf8");

/**
 * Serve fixture data instead of the deployed bookmarks, block third-party
 * requests (favicons, analytics) and open the home page.
 */
export async function openApp(page, path = "/") {
	await page.route("**/structure.json", (route) =>
		route.fulfill({
			contentType: "application/json",
			body: fixture("structure.json"),
		}),
	);
	await page.route("**/bookmarks.json", (route) =>
		route.fulfill({
			contentType: "application/json",
			body: fixture("bookmarks.json"),
		}),
	);
	await page.route(/^https?:\/\/(?!(?:127\.0\.0\.1|localhost)[:/])/, (route) =>
		route.abort(),
	);
	await page.goto(path);
	await page.locator(".home-message .chinese-text").waitFor();
	await settle(page);
}

/** Wait for fonts and GSAP-driven transitions to finish. */
export async function settle(page, ms = 900) {
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(ms);
}

export const isMobile = (testInfo) => testInfo.project.name === "mobile";
export const sidebarStartsCollapsed = (testInfo) =>
	testInfo.project.name !== "desktop";

/** Make sure the sidebar is open, then click a top-level folder in it. */
export async function openSidebarFolder(page, testInfo, title) {
	if (sidebarStartsCollapsed(testInfo)) {
		await page.locator("#toggle-sidebar").click();
		await settle(page, 500);
	}
	await page.locator(".sidebar .folder-name", { hasText: title }).click();
	await settle(page);
}

/** Collapse the sidebar if it is still open (mobile auto-collapses on navigation). */
export async function closeSidebar(page) {
	const open = await page
		.locator(".sidebar")
		.evaluate((el) => !el.classList.contains("collapsed"));
	if (open) {
		await page.locator("#toggle-sidebar").click();
		await settle(page, 500);
	}
}
