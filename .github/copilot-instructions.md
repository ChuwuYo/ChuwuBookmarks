Project: ChuwuBookmarks (static SPA)

Purpose
- Guide AI agents to be productive in this ES-module, no-build, static web app.

Big picture
- Entry flow: index.html loads script.js, which initializes theme, device view, workers, listeners, and restores search state.
- Data pipeline: data-worker.js fetches structure.json first (lazy folder tree), then bookmarks.json in background; loader/index.js merges, caches, and re-renders.
- Search pipeline: search/index.js posts cached data + index hash to search-worker.js; worker does LRU-cached search and returns results for render/search.js.

Key files
- script.js: app bootstrap and DOMContentLoaded initialization.
- assets/js/modules/loader/index.js: data loading, localStorage caching, and background full-data hydration.
- assets/js/data-worker.js: structure.json -> bookmarks shape, full data fetch, index building, hash.
- assets/js/modules/worker/index.js: singleton worker manager; add/remove listeners through wrappers.
- assets/js/modules/search/index.js + assets/js/search-worker.js: search flow, debounce, cache, URL state.
- assets/js/modules/render/: all DOM rendering (sidebar, content, home, theme).
- assets/js/modules/listener/index.js: central event wiring.

Project conventions
- ES modules with named exports; keep functions short and single-responsibility.
- Mobile detection: use window.innerWidth < 480 or getDeviceType() for consistency.
- Use requestAnimationFrame for scroll/resize UI updates and passive scroll listeners where applicable.
- Accessibility: keep ARIA roles/labels on interactive elements (see render/sidebar.js).

Data/SEO workflow
- bookmarks.json and structure.json live in repo root; structure.json enables faster initial render.
- After editing structured-data.json, manually sync the inline JSON-LD block in index.html.

Formatting/linting
- Biome is configured in biome.json (tabs, double quotes); vendor files are excluded.

Common edit paths
- Add UI control: index.html markup -> listener/index.js wiring -> render/* updates.
- Change search behavior: update both modules/search/index.js and assets/js/search-worker.js.