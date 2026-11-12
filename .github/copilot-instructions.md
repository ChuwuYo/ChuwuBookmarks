See AGENTS.md in the repository root for rules, commands and the test workflow.

Project: ChuwuBookmarks (static SPA)

Purpose
- Guide AI agents to be productive in this ES-module, no-build, static web app.

Big picture
- Entry flow: index.html loads script.js, which initializes theme, sidebar state, workers, listeners, and restores search state.
- Data pipeline: data-worker.js fetches structure.json first (lazy folder tree), then bookmarks.json in background; loader/index.js merges, caches, and re-renders.
- Search pipeline: search/index.js posts cached data + index hash to search-worker.js; worker does LRU-cached search and returns results for render/search.js.

Key files
- script.js: app bootstrap and DOMContentLoaded initialization.
- assets/js/modules/loader/index.js: data loading, localStorage caching, and background full-data hydration.
- assets/js/data-worker.js: structure.json -> bookmarks shape, full data fetch, index building, hash.
- assets/js/modules/worker/index.js: singleton worker manager; add/remove listeners through wrappers.
- assets/js/modules/search/index.js + assets/js/search-worker.js: search flow, debounce, cache.
- assets/js/modules/utils/url-state.js: the only reader/writer of the q/page URL state (`readSearchState()`, `writeSearchState()`).
- assets/js/modules/render/: all DOM rendering (sidebar, content, home, theme).
- assets/js/modules/listener/index.js: central event wiring.

Project conventions
- ES modules with named exports; keep functions short and single-responsibility.
- Breakpoints and input: layout uses width media queries (range syntax, 480px / 1024px, documented in `assets/css/breakpoints.css`), plus the landscape-phone exception `(any-pointer: coarse) and (height < 600px)` that joins the narrow layout; hover styles go in `(hover: hover) and (pointer: fine)`, everything else in its complement. JS reads the same queries from `assets/js/modules/utils/viewport.js` (`isCompact()`, `isSidebarOverlay()`, `onChange()`); never compare `window.innerWidth`, sniff touch or the user agent (the only exception is the ⌘ / Ctrl shortcut label in `<bm-search>`), or set device classes.
- Scrollbars are native and auto-hiding scrollers are styled in `assets/css/base.css` (`.autohide-scrollbar`, registered `--scrollbar-thumb`, `(pointer: fine)` only); the sidebar adds only its gutter and an always-on thumb for browsers without scroll-driven animations, and horizontal strips (breadcrumbs, pagination) hide theirs with `scrollbar-width: none`. Scroll activity is exposed as `data-scrolling` on the scroller, set only by `trackScrollActivity()` from `assets/js/modules/utils/scroll-activity.js` (idle time from the `--scroll-idle` token); do not draw scroll indicators in JS or animate from scroll events.
- Use passive scroll listeners and requestAnimationFrame for any other scroll/resize UI updates.
- Colours, shadows, focus ring, radii and z-index are tokens in `assets/css/base.css`: colours use `light-dark()` (`color-scheme` follows `data-theme`), every control gets the global `:focus-visible` ring (`--focus-ring-*`), and rules use `--radius-*` / `--z-*` instead of literals.
- Motion durations and easings are tokens in `assets/css/base.css`; JS reads them (and `prefers-reduced-motion`) through `assets/js/modules/utils/motion.js` instead of hard-coding values.
- Entrances and staggers use the shared CSS `@keyframes enter` with `--item-index` (set via `style.setProperty`) × `--stagger-step`; GSAP is reserved for the home title. `#content` and `#breadcrumbs` are written only via `showView()` / `updateView()` from `render/view.js` (check `isCurrentView(view)` after every await); loading, empty and error nodes come from `render/message.js`; clear containers with `replaceChildren()`.
- Components (`assets/components/<name>/`, spec in `docs/components.md`) own their styles in `<name>.css`; global CSS keeps tokens and page layout. State is ARIA for semantics, `data-*` for visuals, classes for identity only, and inline style only for numeric custom properties. Render modules never attach listeners to components: every `bm-*` event is delegated in `listener/component-listener.js`.
- Accessibility: keep ARIA roles/labels on interactive elements (see components/bm-card).

Security
- index.html's meta CSP allows the inline theme script only by its sha256 hash (no 'unsafe-inline' in script-src); recompute the hash after editing that script and keep it in sync with render/theme.js. _headers and vercel.json send frame-ancestors 'none', X-Frame-Options, nosniff and Referrer-Policy.

Data/SEO workflow
- bookmarks.json and structure.json live in repo root; structure.json enables faster initial render.
- After editing structured-data.json, manually sync the inline JSON-LD block in index.html.

Formatting/linting
- Biome is configured in biome.json (tabs, double quotes); vendor files are excluded. Run `npm run lint` in tests/.

Common edit paths
- Add UI control: index.html markup -> listener/ wiring (bm-* events in component-listener.js) -> render/* updates.
- Change search behavior: update both modules/search/index.js and assets/js/search-worker.js.