import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	globalTimeout: 10 * 60 * 1000,
	snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
	expect: {
		toHaveScreenshot: {
			maxDiffPixelRatio: 0.01,
			animations: "disabled",
			stylePath: "./e2e/screenshot.css",
		},
	},
	use: {
		baseURL: `http://127.0.0.1:${PORT}`,
		trace: "on-first-retry",
		locale: "zh-CN",
		colorScheme: "light",
	},
	projects: [
		{
			name: "desktop",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 1440, height: 900 },
			},
		},
		{
			name: "tablet",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 820, height: 1000 },
			},
		},
		{
			name: "mobile",
			use: {
				...devices["Desktop Chrome"],
				viewport: { width: 390, height: 844 },
				isMobile: true,
				hasTouch: true,
				deviceScaleFactor: 1,
			},
		},
	],
	webServer: {
		command: `node server.mjs`,
		env: { PORT: String(PORT) },
		url: `http://127.0.0.1:${PORT}/index.html`,
		reuseExistingServer: !process.env.CI,
	},
});
