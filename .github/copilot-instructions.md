Project: ChuwuBookmarks — AI coding guidance

Purpose
- Help AI agents quickly understand the architecture, conventions, workflows, and common pitfalls for this project.

Big Picture Architecture
- Single-page static web app, no backend, all logic in ES modules under `assets/js/`.
- Entry: `index.html` loads `script.js`, which initializes all modules and UI.
- Bookmarks data: `bookmarks.json` (root) is loaded at startup via `assets/js/modules/loader/index.js` (uses a Web Worker for performance).
- SEO: Structured data is maintained in `structured-data.json` (root) and must be manually synced to an inline `<script type="application/ld+json">` block in `index.html` for best search engine compatibility.

Key Files & Directories
- `index.html`: Main entry, meta tags, SEO, UI skeleton, inline JSON-LD.
- `script.js`: App entry, imports and initializes all modules.
- `assets/js/modules/loader/index.js`: Loads bookmarks, manages cache, triggers sidebar/home rendering.
- `assets/js/modules/render/`: All DOM rendering logic (sidebar, content, home, theme, etc.).
- `assets/js/modules/search/`: Search logic, including Web Worker integration.
- `assets/js/search-worker.js`: Heavy-lifting search and pagination in a separate thread.
- `assets/js/modules/listener/index.js`: Centralized event listeners for UI controls.
- `assets/js/modules/utils/`: Utility functions (centering, scroll indicator, constants).
- `structured-data.json`: Canonical SEO structured data (must be copied to HTML for deployment).

Developer Workflow
- No build step: edit files and open `index.html` directly or deploy as static site.
- For SEO: After editing `structured-data.json`, manually copy its content to the inline JSON-LD block in `index.html`.
- For bookmarks: Replace `bookmarks.json` with your own data (exported via BookmarksPortal or similar tools).
- For UI changes: Edit markup in `index.html`, wire up events in `listener/index.js`, and update rendering logic in `render/` modules.
- For search logic: Update `search/index.js` and `search-worker.js` together.

Patterns & Conventions
- All modules use named exports; keep functions short and single-responsibility.
- Use `DOMContentLoaded` for UI initialization.
- Mobile detection: always use `window.innerWidth < 480` for consistency.
- Use `requestAnimationFrame` for scroll/resize UI updates.
- Use passive event listeners for scroll for performance (`{ passive: true }`).
- Accessibility: Use semantic HTML and ARIA attributes; do not remove them.

Performance & Caching
- Bookmarks data is cached in localStorage for fast reloads.
- Search and pagination run in a Web Worker for UI responsiveness.
- UI event handlers should be lightweight and use passive listeners where possible.

SEO & Structured Data
- Always keep `structured-data.json` and the inline JSON-LD in `index.html` in sync.
- Do not inject structured data via JS at runtime; crawlers may ignore it.

Common Pitfalls
- Forgetting to sync structured data between JSON and HTML (SEO失效)。
- Not using passive listeners for scroll (性能下降)。
- Breaking ARIA/semantic HTML (无障碍失效)。
- Not updating both search/index.js and search-worker.js for search feature changes。

Examples for Common Edits
- 新增UI控件：在`index.html`添加markup，在`listener/index.js`绑定事件，在`render/`模块实现渲染。
- 新增搜索操作符：同时修改`search/index.js`和`search-worker.js`。
- 修改SEO：编辑`structured-data.json`，并同步到`index.html`。

扩展建议
- 如需自动同步SEO结构化数据，可编写简单Node脚本将`structured-data.json`内容注入`index.html`。
- 如需国际化，可扩展`structured-data.json`和`index.html`的`inLanguage`字段，并在渲染模块中适配。

代码风格
- 使用标准ES模块，函数短小、命名清晰、单一职责。
- 保持与现有模块风格一致。

如有疑问
- 优先查看相关文件，明确用户期望的UI和交互，必要时举例说明。

End of file