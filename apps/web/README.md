# PCO TV Web (PWA, test data)

Installable, offline-capable web app. Dependency-free — no build step.

## Run locally
```bash
nvm use
pnpm --filter @pco/web dev
# open http://localhost:5173/index.html
```

## What's inside
- `index.html` + `styles.css` + `app.js` — 7 tabs (Home/Messages/Music/Live/Programs/Favorites/Search), detail pages, music queue, offline bar. Favorites, saved, follows, and progress persist in `localStorage`.
- `data/seed.json` — copied from `packages/content-models/seed/seed.json` by `scripts/sync-data.mjs`. Test data only.
- `manifest.webmanifest` + `icons/` — installable (Add to Home Screen). Note: store-grade install prompts need 192/512px PNG icons; SVGs ship for now.
- `sw.js` — caches the app shell + seed for offline use.
- `scripts/serve.mjs` — zero-dependency static server (service workers require http, not file://).
