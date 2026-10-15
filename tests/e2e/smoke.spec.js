import { expect, test } from "@playwright/test";
import {
	bookmarksWithExtraLinks,
	closeSidebar,
	isMobile,
	openApp,
	openSidebarFolder,
	settle,
} from "./helpers.js";

test.describe("smoke", () => {
	test("home page renders sidebar tree and welcome text", async ({ page }) => {
		await openApp(page);
		await expect(page.locator("#sidebar-folders .folder")).toHaveCount(4);
		await expect(page.locator(".home-message")).toBeVisible();
		await expect(page.locator("#search-input")).toBeVisible();
	});

	test("sidebar toggle collapses and expands", async ({ page }) => {
		await openApp(page);
		const sidebar = page.locator(".sidebar");
		const toggle = page.locator("#toggle-sidebar");
		const before = await sidebar.evaluate((el) =>
			el.classList.contains("collapsed"),
		);
		await toggle.click();
		await expect(sidebar).toHaveClass(
			before ? /^(?!.*collapsed)/ : /collapsed/,
		);
		await toggle.click();
		await expect(sidebar).toHaveClass(
			before ? /collapsed/ : /^(?!.*collapsed)/,
		);
	});

	test("folder navigation and breadcrumbs", async ({ page }, testInfo) => {
		await openApp(page);
		await openSidebarFolder(page, testInfo, "开发");
		if (isMobile(testInfo)) await closeSidebar(page);
		await expect(page.locator("#content .bookmark")).toHaveCount(2);
		await page.locator("#content .folder", { hasText: "前端" }).click();
		await settle(page);
		await expect(page.locator("#content .bookmark")).toHaveCount(3);
		const crumbs = page.locator("#breadcrumbs .breadcrumb-item");
		await expect(crumbs.last()).toHaveText("前端");
		await crumbs.first().click();
		await expect(page.locator(".home-message")).toBeVisible();
	});

	test("search shows results with pagination", async ({ page }) => {
		await openApp(page);
		await page.locator("#search-input").fill("demo");
		await expect(page.locator(".search-result-item").first()).toBeVisible();
		await expect(page.locator(".search-result-item")).toHaveCount(20);
		const next = page.locator(".pagination-next");
		await expect(next).toBeVisible();
		await next.click();
		await expect(page.locator(".pagination-page.active")).toHaveText("2");
		await page.locator(".pagination-page", { hasText: "3" }).click();
		await expect(page.locator(".search-result-item")).toHaveCount(5);
	});

	test("pagination collapses distant pages and keeps the page in the URL", async ({
		page,
	}) => {
		await openApp(page, "/", bookmarksWithExtraLinks(160));
		await page.locator("#search-input").fill("demo");
		const pages = page.locator(".pagination-container");
		await expect(pages.locator(".pagination-page")).toHaveText([
			"1",
			"2",
			"3",
			"11",
		]);
		await expect(pages.locator(".pagination-ellipsis")).toHaveCount(1);
		await expect(pages.locator(".pagination-prev")).toBeDisabled();
		await pages.locator(".pagination-page", { hasText: "3" }).click();
		await pages.locator(".pagination-next").click();
		await expect(pages.locator(".pagination-page")).toHaveText([
			"1",
			"3",
			"4",
			"5",
			"11",
		]);
		await expect(pages.locator(".pagination-ellipsis")).toHaveCount(2);
		await expect(page).toHaveURL(/page=4/);
		await pages.locator(".pagination-page", { hasText: "11" }).click();
		await expect(page.locator(".search-result-item")).toHaveCount(5);
		await expect(pages.locator(".pagination-next")).toBeDisabled();
		await pages.locator(".pagination-page", { hasText: /^1$/ }).click();
		await expect(page).not.toHaveURL(/page=/);
	});

	test("search with no match shows empty state", async ({ page }) => {
		await openApp(page);
		await page.locator("#search-input").fill("zzzz-not-found");
		await expect(page.locator(".no-results")).toBeVisible();
	});

	test("second visit renders from the IndexedDB cache", async ({ page }) => {
		await page.addInitScript(() => {
			if (!sessionStorage.getItem("seeded")) {
				localStorage.setItem("bookmarksData", "[]");
				localStorage.setItem("bookmarksHash", "legacy");
				sessionStorage.setItem("seeded", "1");
			}
		});
		await openApp(page);
		await page.locator("#search-input").fill("demo");
		await expect(page.locator(".search-result-item")).toHaveCount(20);
		expect(
			await page.evaluate(() => localStorage.getItem("bookmarksData")),
		).toBeNull();

		// 第二次访问：数据文件不可用时仍能从缓存渲染侧边栏并搜索
		await page.route("**/structure.json", (route) => route.abort());
		await page.route("**/bookmarks.json", (route) => route.abort());
		await page.reload();
		await expect(page.locator("#sidebar-folders .folder")).toHaveCount(4);
		await page.locator("#search-input").fill("demo");
		await expect(page.locator(".search-result-item")).toHaveCount(20);
	});

	test("home shows the configured site title", async ({ page }) => {
		await openApp(page);
		await expect(page.locator(".home-message .chinese-text")).toHaveText(
			"初五的书签",
		);
		await expect(page.locator(".home-message .english-text")).toHaveText(
			"Chuwu's Bookmarks",
		);
	});

	test("theme toggle switches and persists", async ({ page }) => {
		await openApp(page);
		const html = page.locator("html");
		const initial = await html.getAttribute("data-theme");
		await page.locator("#theme-toggle").click();
		await expect(html).not.toHaveAttribute("data-theme", initial);
		const next = await html.getAttribute("data-theme");
		await page.reload();
		await expect(html).toHaveAttribute("data-theme", next);
	});
});
