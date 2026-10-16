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

	test("folder opened before full data loads shows its bookmarks", async ({
		page,
	}, testInfo) => {
		await openApp(page, "/", undefined, { bookmarksDelay: 2500 });
		await openSidebarFolder(page, testInfo, "开发");
		if (isMobile(testInfo)) await closeSidebar(page);
		await expect(page.locator("#content .bookmark")).toHaveCount(2, {
			timeout: 10_000,
		});
		await expect(page.locator(".folder-error")).toHaveCount(0);
	});

	test("bookmarks load when structure.json is missing", async ({ page }) => {
		await openApp(page, "/", undefined, { structure: null });
		await expect(page.locator("#sidebar-folders .folder")).toHaveCount(4);
	});

	test("search restores the page number from the URL", async ({ page }) => {
		await openApp(page, "/?q=demo&page=3", undefined, { waitForHome: false });
		await expect(page.locator(".pagination-page.active")).toHaveText("3");
		await expect(page.locator(".search-result-item")).toHaveCount(5);
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

	test("components expose keyboard and ARIA contracts", async ({
		page,
	}, testInfo) => {
		await openApp(page);
		const toggle = page.locator("#toggle-sidebar");
		const sidebar = page.locator(".sidebar");
		const expanded = !(await sidebar.evaluate((el) =>
			el.classList.contains("collapsed"),
		));
		await expect(toggle).toHaveAttribute("aria-expanded", String(expanded));
		await toggle.click();
		await expect(toggle).toHaveAttribute("aria-expanded", String(!expanded));
		await expect(page.locator("bm-sidebar")).toHaveAttribute(
			"data-state",
			expanded ? "collapsed" : "expanded",
		);
		if (!expanded) await settle(page, 500);
		else await toggle.click();

		const folder = page.locator("#sidebar-folders bm-card", {
			hasText: "开发",
		});
		await expect(folder).toHaveAttribute("role", "button");
		await folder.focus();
		await page.keyboard.press("Enter");
		if (isMobile(testInfo)) await closeSidebar(page);
		await expect(
			page.locator("#breadcrumbs .breadcrumb-item").last(),
		).toHaveAttribute("aria-current", "location");

		await page.keyboard.press("Control+k");
		await expect(page.locator("#search-input")).toBeFocused();
	});

	test("reduced motion shows the home text without animating", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await openApp(page);
		const opacity = await page
			.locator(".home-message")
			.evaluate((el) => getComputedStyle(el).opacity);
		expect(Number(opacity)).toBe(1);
		// GSAP 时间线被加速到几乎瞬时完成
		const timeScale = await page.evaluate(() =>
			window.gsap.globalTimeline.timeScale(),
		);
		expect(timeScale).toBeGreaterThan(1);
	});

	test("theme toggle switches and persists", async ({ page }) => {
		await openApp(page);
		const html = page.locator("html");
		const initial = await html.getAttribute("data-theme");
		await page.locator("#theme-toggle").click();
		await expect(html).not.toHaveAttribute("data-theme", initial);
		const scheme = await html.evaluate(
			(el) => getComputedStyle(el).colorScheme,
		);
		expect(scheme).toBe(await html.getAttribute("data-theme"));
		const next = await html.getAttribute("data-theme");
		await page.reload();
		await expect(html).toHaveAttribute("data-theme", next);
	});

	test("theme switch changes colours in one step without CSS transitions", async ({
		page,
	}) => {
		await openApp(page);
		const result = await page.evaluate(async () => {
			const icon = document.querySelector(".home-icon");
			const seen = new Set([getComputedStyle(icon).color]);
			document.getElementById("theme-toggle").click();
			const start = performance.now();
			await new Promise((resolve) => {
				const tick = (now) => {
					seen.add(getComputedStyle(icon).color);
					if (now - start < 800) requestAnimationFrame(tick);
					else resolve();
				};
				requestAnimationFrame(tick);
			});
			await new Promise((resolve) => setTimeout(resolve, 600));
			return {
				colours: seen.size,
				classes: document.documentElement.className,
				themeColor: document
					.querySelector('meta[name="theme-color"]')
					.getAttribute("content"),
				theme: document.documentElement.dataset.theme,
			};
		});
		expect(result.colours).toBe(2);
		expect(result.classes).not.toContain("theme-switching");
		expect(result.themeColor).toBe(
			result.theme === "dark" ? "#74ceff" : "#23d6e3",
		);
	});
	test("saved dark theme is applied before the first paint", async ({
		page,
	}) => {
		await page.addInitScript(() => {
			if (!sessionStorage.getItem("seeded")) {
				localStorage.setItem("theme", "dark");
				sessionStorage.setItem("seeded", "1");
			}
		});
		// 模块脚本迟迟不到，首帧也必须已经是暗色
		let release;
		const held = new Promise((resolve) => {
			release = resolve;
		});
		await page.route("**/script.js", async (route) => {
			await held;
			await route.continue();
		});
		// 模块脚本会推迟 DOMContentLoaded，这里只等到文档解析出主区
		await page.goto("/", { waitUntil: "commit" });
		await page.locator(".main-content").waitFor({ state: "attached" });
		// 样式表异步到达，轮询直到样式生效；模块脚本一直被拦着，结果反映的就是首帧状态
		await expect
			.poll(() =>
				page.evaluate(() => ({
					theme: document.documentElement.dataset.theme,
					scheme: getComputedStyle(document.documentElement).colorScheme,
					loading: document.documentElement.classList.contains("app-loading"),
					sidebar: getComputedStyle(document.querySelector(".sidebar")).opacity,
					main: getComputedStyle(document.querySelector(".main-content"))
						.opacity,
				})),
			)
			.toEqual({
				theme: "dark",
				scheme: "dark",
				loading: true,
				sidebar: "0",
				main: "0",
			});
		release();
		await expect(page.locator("html")).not.toHaveClass(
			/app-(loading|entering)/,
		);
	});

	test("without a saved theme the page follows the system", async ({
		page,
	}) => {
		await page.emulateMedia({ colorScheme: "dark" });
		await openApp(page);
		const html = page.locator("html");
		await expect(html).toHaveAttribute("data-theme", "dark");
		await page.emulateMedia({ colorScheme: "light" });
		await expect(html).toHaveAttribute("data-theme", "light");
	});

	test("sidebar and main content are revealed together", async ({ page }) => {
		await openApp(page);
		const opacities = await page.evaluate(() =>
			[".sidebar", ".main-content"].map(
				(selector) =>
					getComputedStyle(document.querySelector(selector)).opacity,
			),
		);
		expect(opacities).toEqual(["1", "1"]);
		await expect(page.locator("html")).not.toHaveClass(
			/app-(loading|entering)/,
		);
	});
});
