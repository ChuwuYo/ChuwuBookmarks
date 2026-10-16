import { expect, test } from "@playwright/test";
import {
	closeSidebar,
	isMobile,
	openApp,
	openSidebarFolder,
	settle,
} from "./helpers.js";

test.describe("visual", () => {
	test("home", async ({ page }) => {
		await openApp(page);
		await expect(page).toHaveScreenshot("home.png");
	});

	test("home dark", async ({ page }) => {
		await openApp(page);
		await page.locator("#theme-toggle").click();
		await settle(page);
		await expect(page).toHaveScreenshot("home-dark.png");
	});

	test("sidebar toggled", async ({ page }) => {
		await openApp(page);
		await page.locator("#toggle-sidebar").click();
		await settle(page);
		await expect(page).toHaveScreenshot("sidebar-toggled.png");
	});

	test("folder", async ({ page }, testInfo) => {
		await openApp(page);
		await openSidebarFolder(page, testInfo, "开发");
		if (isMobile(testInfo)) await closeSidebar(page);
		await page.locator("#content .folder", { hasText: "前端" }).click();
		await settle(page);
		await expect(page).toHaveScreenshot("folder.png");
	});

	test("search results", async ({ page }) => {
		await openApp(page);
		await page.locator("#search-input").fill("demo");
		await expect(page.locator(".pagination-next")).toBeVisible();
		await settle(page);
		await page.locator("#search-input").blur();
		await expect(page).toHaveScreenshot("search.png");
	});

	test("no results", async ({ page }) => {
		await openApp(page);
		await page.locator("#search-input").fill("zzzz-not-found");
		await expect(page.locator(".no-results")).toBeVisible();
		await settle(page);
		await page.locator("#search-input").blur();
		await expect(page).toHaveScreenshot("no-results.png");
	});
});
