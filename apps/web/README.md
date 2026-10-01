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
- `scripts/serve.mjs` — zero-dependency static server (service workers require http, not file://) + Paystack init/verify endpoints (secret key server-side only).

## Deploy (free, Netlify)
1. Push to GitHub (done — `netlify.toml` is in the repo root).
2. Go to **app.netlify.com** → Add new site → **Import an existing project** → connect GitHub → `Taretamara/Building-PCO-TV`.
3. Netlify reads `netlify.toml` automatically: publishes `apps/web`, loads serverless functions from `netlify/functions`.
4. Site settings → **Environment variables** → add `PAYSTACK_SECRET_KEY` = your **test** key (paste in Netlify's dashboard only — never in code). Redeploy after adding.
5. Open the Netlify URL (`https://YOUR-SITE.netlify.app/index.html`). HTTPS makes the service worker + install prompt work.
6. Subscribe flow works unchanged: `/api/paystack/*` routes to the functions, callback URL adapts to the live domain. Test card: `4084084084084081`. No real charge in test mode.

## Test-mode subscriptions (Paystack)
- Home hero has **Subscribe — ₦1,500/mo (test)**; the "Pastor Chris Recommended" playlist is locked until subscribed.
- Flow: email → server `POST /api/paystack/initialize` (secret key stays in repo-root `.env`, never in browser) → Paystack test checkout → `callback.html` verifies → premium flag in `localStorage`.
- Without `PAYSTACK_SECRET_KEY` in `.env`, subscribe shows "payments not configured" and everything else still works.
- Test card: `4084084084084081`. No real charge in test mode.
