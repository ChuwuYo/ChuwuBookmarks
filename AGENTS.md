# AGENTS.md

ChuwuBookmarks is a static, zero-build bookmark navigation site. `index.html`
loads native ES modules directly; there is no bundler, transpiler or framework.
Anyone must be able to fork the repo and deploy the root folder as-is to
GitHub Pages, Vercel, Netlify or Cloudflare Pages.

## Hard rules

- Keep the site zero-build. Never add a `package.json`, build step or
  framework to the repository root. Development tooling lives in `tests/`.
- Keep the existing look: colours, rounded shapes, spacing, fonts and motion.
  Visual changes must be intentional and reflected in updated screenshots.
- UI components are native Custom Elements rendered in light DOM (no Shadow
  DOM), so the global stylesheets keep working. See `docs/components.md`.
- Commit messages and PR descriptions describe the change objectively.

## Layout

| Path | Purpose |
| --- | --- |
| `index.html`, `script.js`, `styles.css` | Entry document, bootstrap, CSS entry |
| `assets/js/modules/` | App modules (render, listener, loader, search, worker, store, utils) |
| `assets/js/data-worker.js`, `assets/js/search-worker.js` | Web Workers for data loading and search |
| `assets/components/<name>/` | Light-DOM custom elements (JS + CSS pair each), spec in `docs/components.md` |
| `assets/css/` | Global stylesheets imported by `styles.css`; colour tokens use `light-dark()` |
| `site.config.js` | Home page title and subtitle |
| `bookmarks.json`, `structure.json` | Bookmark data (full tree / lightweight folder tree) |
| `tests/` | Biome + Playwright tooling, fixtures, screenshot baselines |

## Commands

All commands run from `tests/` (Node 22+):

```bash
cd tests
npm ci
npx playwright install chromium   # first time only
npm run lint        # biome ci over the whole repository
npm test            # smoke + visual tests (desktop / tablet / mobile)
npm run test:smoke  # behaviour tests only
npm run test:update # regenerate screenshots after an intentional visual change
npm run serve       # serve the repo root at http://127.0.0.1:4173
```

Tests serve fixture data from `tests/fixtures/` instead of the real
`bookmarks.json`, and block third-party requests, so they are deterministic.

Screenshot baselines depend on the fonts and renderer of the machine that
created them. CI runs the behaviour tests; run the visual tests locally before
and after layout work and only refresh baselines for intended changes.

## Workflow for changes

1. Run `npm run lint` and `npm test` before editing to confirm a green start.
2. Make one focused change.
3. Run lint and the full test suite again. Pixel diffs are regressions unless
   the change is meant to alter the visuals.
4. Commit with an objective message.
