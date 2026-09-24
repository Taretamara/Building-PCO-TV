# PCO TV — Implementation Plan

**Source:** `docs/Untitled document.md` (PRD, 36 sections, V1 Concept + User Roles & Permissions)
**Repo state:** docs-only, `main` tracked to `origin/main`, no app code yet
**Goal:** TV-first streaming destination for Pastor Chris messages, LoveWorld music, and LoveWorld programming. Principle: *Turn on. Find something meaningful. Watch.*

This plan goes from **design system → architecture → build phases → launch**. No unrelated PRD rewrites. No post-MVP scope creep into MVP.

---

## 1. What MVP Must Cover (from PRD §27 + §36)

**Navigation:** Home, Messages, Music, Live, Programs, Favorites, Search

**Must-have slices:**
- Home: category nav, Continue Watching, Recommended, Live Now, Recently Added (+ Popular per §4)
- Messages: Search, Topics, Programs/Events, Recent, Details, Watch Next
- Music: Artists, Albums, Songs, Playlists (curated only for MVP), Favorites
- Live: Live Now, Upcoming, Recent broadcasts + graceful empty state (§13)
- Programs: Program pages, episodes/content, Follow program
- Personalization: Account (optional at first use), Continue Watching, Favorites, Save for Later, basic recommendations
- Playback: video + music playback, resume, next-content recommendations

**Roles (§36):** Customer/Viewer → Content Admin → Super Admin. No extra roles in V1.
**Explicitly deferred (§28):** household profiles, user-created playlists, Kids, offline, enhanced recommendations, interactive live, multi-language UI, watch parties, devotionals.

---

## 2. Recommended Stack (MVP — locked unless ADR overrides)

| Layer | Choice (primary) | Free $0 route for MVP | Trade-off / when to upgrade |
|---|---|---|---|
| TV app | React Native for TV (`react-native-tvos`) + TypeScript | Same — already free / OSS | None. Stay on this. |
| Admin web | Next.js + TypeScript + Tailwind | Same — free / OSS. Host on Vercel Hobby or Cloudflare Pages (free) | Upgrade to Vercel Pro when team seats/bandwidth exceed hobby limits. |
| Monorepo | pnpm + Turborepo, ESLint + Prettier | Same — free / OSS | None. |
| Backend + DB | Supabase (Postgres + RLS + Storage + Edge Functions) | Same — Supabase Free (500MB DB, 1GB storage, 50k MAU). Alt $0: Neon Free (Postgres) + Render Free (Node API) | Upgrade to Supabase Pro ($25/mo) when DB/storage/auth limits hit or you need daily backups. |
| Auth | Supabase Auth (email + QR-code TV sign-in) | Same — free within Supabase Free MAU limits | Upgrade to Clerk/Auth0 paid only if you need enterprise SSO/social on day one. |
| CMS | Sanity (structured content) | Sanity Free (3 seats, generous API) for MVP. Alt $0: Strapi self-hosted on Render Free / Directus on Railway Trial | Upgrade to Sanity Growth when seats/API/bandwidth exceed free or you need roles at scale. Self-host Strapi if you outgrow seat pricing entirely. |
| Video VOD | Mux (upload → HLS → CDN) | $0 route: ffmpeg (OSS) → HLS/MP4 → Supabase Storage Free (1GB) + Cloudflare R2 Free (10GB) + Cloudflare CDN Free. Or YouTube Unlisted embeds (free, fastest) | Free route = you own transcoding + thumbnails/captions + no adaptive-bitrate polish. Upgrade to Mux / Cloudflare Stream ($5–20+/mo) before public launch for adaptive HLS, thumbnails, captions. |
| Live | Mux Live (same vendor as VOD) | $0 route: YouTube Live embed (free unlimited) or Owncast (OSS self-host on Render Free) fronted by Live Now/Upcoming/Recent states | YouTube = free + reliable but YouTube branding + less control. Owncast = full control but you manage uptime. Upgrade to Mux Live / AWS IVS when you need branded low-latency live without YouTube. |
| Audio | Mux audio / CDN MP3-AAC via Supabase Storage + CDN | Same — MP3/AAC in Supabase Storage Free + R2 Free + CDN (no Mux needed for MVP) | Upgrade to Mux/Stream audio only if you need audio analytics at scale. |
| Search | Postgres full-text (MVP) → Typesense later | Same — already free (Postgres FTS). Typesense Cloud free trial / self-host free on Render | Upgrade to Typesense Cloud / Algolia only after library >10k items or typo-tolerance needed. |
| Recommendations | SQL rules (same series → same topic → history → recent) | Same — free (SQL, no service) | ML services (paid) post-MVP only. |
| Notifications | OneSignal + FCM | Same — OneSignal Free (up to 10k subscribers), FCM free unlimited | Upgrade OneSignal to Growth when subscriber/push volume exceeds free. |
| Analytics + crash | PostHog + Sentry | Same — PostHog Cloud Free (1M events/mo), Sentry Free (5k errors/mo) | Upgrade when event/error volume or retention needs exceed free tiers. |
| Storage/CDN | Supabase Storage + Cloudflare CDN (artwork 3 sizes) | Same — Supabase 1GB + R2 10GB + Cloudflare CDN Free | Upgrade to R2 paid / S3 + CloudFront when artwork/video exceeds free GB/bandwidth. |
| CI/CD | GitHub Actions → Play Internal track / TestFlight | Same — GitHub Actions Free (2,000 min/mo private, unlimited public) | Upgrade only if build minutes exceed free (add self-hosted runner — free). |
| State/data-fetch (TV) | TanStack Query + Zustand + Zod | Same — free / OSS | None. |

> $0 MVP path: Supabase Free + Sanity Free + Vercel Hobby/Cloudflare Pages + R2 Free + ffmpeg/YouTube + OneSignal Free + PostHog Free + Sentry Free + GitHub Actions Free = ~$0/mo until content volume and users grow. Then upgrade video (Mux/Stream) first, then Supabase/Sanity.
> Rule: any deviation from this table needs a 1-page ADR in `docs/ADRs/`. Otherwise build to this table.

## 2. Architectural Decisions (decide in Phase 0, before building UI)

### 2.1 TV platforms — Recommendation: start narrow
- **Option A (recommended for MVP): Android TV / Fire TV (one codebase) + Web TV fallback for testing.**
  Why: largest LoveWorld global reach on affordable devices, single stack, fast iteration.
- **Option B:** tvOS (Apple TV) as second target if audience data demands it.
- **Deferred:** Roku (BrightScript), Samsung Tizen, LG webOS — separate native work, do after product-market fit.

**Decision needed:** Confirm MVP targets. Suggested: `Android TV + Fire TV first, tvOS second, Web preview for stakeholders`.

### 2.2 Frontend stack — Recommendation
- **TV app:** React Native for TV (`react-native-tvos`) — shares code between Android TV / Fire TV / tvOS, remote-focus handling mature.
  - Alternative: Flutter for TV (less mature focus tooling) or fully native (2x cost). Avoid for MVP.
- **Admin web (Content Admin / Super Admin):** Next.js + TypeScript + Tailwind. Desktop-first, not TV UI.
- **Marketing / preview web (optional):** same Next.js app, reuse components, not a full viewer replacement.

**Why this split:** TV needs 10-foot UI + D-pad focus. Admin needs dense forms + tables. One stack cannot serve both well.

### 2.3 Backend — Recommendation: API-first, managed services
- **API:** Node.js (NestJS) or Supabase/Firebase if team is small. Prefer **Postgres + REST or tRPC/GraphQL** for typed contracts.
  - Small team shortcut: **Supabase (Postgres + Auth + Storage + RLS)** to get Roles (§36) fast. Migrate to custom NestJS later if needed.
- **Auth:** Supabase Auth / Clerk / Auth0. Requirements: optional guest browsing, upgrade-to-account prompt (§18), token refresh on TV, QR-code sign-in from TV (typing passwords with remote is painful).
- **CMS (critical for Content Admin):** Do NOT build custom CMS in MVP. Use **Sanity / Strapi / Directus** with roles mapped to Content Admin / Super Admin. Custom curation UI only for Home ordering + Featured (§36: organize/curate Home).
- **Video:** Upload → transcode → HLS/DASH → CDN.
  - Recommended: **Mux / Cloudflare Stream / AWS Elemental + CloudFront**. Start with Mux or Cloudflare Stream to avoid building transcoding.
  - Must store: renditions, thumbnails, captions (VTT), duration, artwork variants.
- **Audio:** Same pipeline or direct MP3/AAC via CDN + metadata (artist/album/track). No need for separate music server in MVP.
- **Live:** HLS live via Mux Live / AWS IVS / Cloudflare. Needs: Live Now / Upcoming / Recently Live states, schedule model, fallback rail when nothing live (§13).
- **Search:** Postgres full-text for MVP. Move to Typesense/Algolia when library grows (§16 unified results: messages + programs + music + events + artists).
- **Recommendations (MVP = rules-based, not ML):** SQL rules implementing PRD §6 Watch Next priority: same series → same topic → history → recently added. ML later.
- **Notifications:** OneSignal / Firebase Cloud Messaging for TV + email. User-controlled preferences (§15).
- **Analytics:** PostHog / Mixpanel + video heartbeat events (started, 25/50/75/95%, completed, resume). Needed to prove §32 success criteria.
- **Storage/CDN:** S3-compatible + CloudFront/Cloudflare. Artwork at 3 sizes (card, hero, background).

### 2.4 Monorepo layout (proposed)
```
/apps
  /tv              # react-native-tvos app (Android TV, Fire TV, tvOS)
  /admin           # Next.js admin (Content Admin + Super Admin)
  /web-preview     # optional stakeholder preview (reuse packages)
/packages
  /ui-tv           # TV design system (focusable components)
  /ui-web          # admin design tokens + forms
  /api-client      # typed API client
  /content-models  # Zod schemas shared FE/BE/CMS
  /config          # eslint, tsconfig, tokens
/services
  /api             # NestJS or Supabase edge functions
  /workers         # transcoding webhooks, recommendations refresh, notifications
/infra             # IaC (Terraform/Pulumi or SST), envs
/docs
  Untitled document.md (PRD — do not rewrite)
  IMPLEMENTATION_PLAN.md (this file)
  ADRs/
```

### 2.5 Data model (minimum viable entities)
- `User(id, email, displayName, role: viewer|content_admin|super_admin, notificationPrefs, createdAt)`
- `Message(id, title, description, speakerId, programId, eventId, topicIds[], publishedAt, durationSec, videoAssetId, artworkIds, status: draft|scheduled|published|archived, featuredRank)`
- `Program(id, slug, title, description, artwork, followerCount, status)`
- `ProgramFollow(userId, programId)`
- `Topic(id, slug, name)` — Faith, Healing, Prayer, etc. (§5)
- `Event(id, name, startsAt, endsAt)`
- `Artist(id, name, bio, artwork)`, `Album(id, artistId, title, artwork, releaseDate)`, `Song(id, albumId, artistId, title, durationSec, audioAssetId, artwork)`
- `Playlist(id, title, type: curated, songIds[], artwork, status)` — user-created deferred
- `LiveBroadcast(id, title, status: scheduled|live|ended, scheduledAt, endedAt, streamUrl, programId, artwork)`
- `WatchProgress(userId, contentType, contentId, positionSec, durationSec, updatedAt)` — powers Continue Watching + Resume
- `Favorite(userId, contentType, contentId, createdAt)` vs `SavedForLater(userId, contentType, contentId, createdAt)` — keep separate (§9)
- `HomeSection(id, key, title, order, rule, curatedIds[])` — powers Home curation (§36)
- `Notification(id, userId, type, title, body, deepLink, readAt)`

### 2.6 Permission matrix (enforce on backend, not just UI)
| Action | Viewer | Content Admin | Super Admin |
|---|---|---|---|
| Browse/watch/listen/search/favorite/save/follow | ✅ | ✅ | ✅ |
| Manage messages/music/artists/albums/programs/topics/events/artwork/featured/Home curation/live scheduling/availability | ❌ | ✅ | ✅ |
| Manage users, create/remove admins, platform settings, permissions, view platform activity | ❌ | ❌ | ✅ |

- Guest (signed-out): browse + play, no persistence except local progress. Prompt to sign in to save/resume (§18).
- Use RBAC middleware + row-level checks. Admin web hidden from viewers entirely.

### 2.7 API surface (MVP sketch)
- `GET /home?userId=` → ordered sections (continueWatching, liveNow, pastorChris, music, recommended, recent, popular)
- `GET /messages?topic=&program=&event=&sort=recent&q=` + `GET /messages/:id` + `GET /messages/:id/next`
- `GET /programs`, `GET /programs/:id`, `POST /programs/:id/follow`
- `GET /music/{artists,albums,songs,playlists}`, `GET /artists/:id`, `GET /albums/:id`
- `GET /live` → `{liveNow[], upcoming[], recent[]}`
- `GET /search?q=` → grouped `{messages, programs, music, events, artists}`
- `GET/PUT /me/progress`, `GET/POST/DELETE /me/favorites`, `/me/saved`, `/me/follows`
- Admin: `POST/PUT /admin/{messages,programs,music,live,home-sections,...}` gated by role
- Super: `/admin/users`, `/admin/admins`, `/admin/settings`, `/admin/activity`

---

## 3. Design System — TV-First (Phase 1, before feature build)

Do this once, reuse everywhere. TV is not a big phone.

**Principles (§19–22):** simple, large/readable at distance, high contrast, D-pad navigable, shared-viewing safe, faithful/warm/premium.

**Tokens:**
- Color: background (near-black warm), surface, primary accent (gold/deep blue — decide once), text high/low, focus ring (always visible, 3px+), live badge red, success/warning. WCAG AA minimum.
- Type: scale for 1080p/4K safe area, min 20–24px body at 10ft, display/hero sizes, line-height generous. One family, weights limited.
- Spacing/radius: 8pt grid, card radius consistent, focus scale (1.04–1.06) + elevation, not color alone.
- Motion: 150–250ms focus transitions, fade/slide for rails, no autoplay motion without user action, reduced-motion respect where platform allows.
- Artwork: 16:9 hero, 16:9 + 1:1 + 4:5 card variants, placeholder shimmer, required title/speaker/duration overlay rules (§25 content quality).

**Components (TV package):**
- Focus engine wrapper (spatial navigation, focus memory per rail/screen)
- Rails/rows (Continue Watching with progress bar, Recommended, Live Now, Pastor Chris, Music, Recently Added, Popular)
- Cards (Message, Program, Album, Artist, Playlist, Live) with consistent metadata
- Hero/banner, detail header (title, speaker, program/event, topic, duration, description, Favorite/Save/Share/Follow actions)
- Player UI (video + mini/background audio player per §12: Play/Pause, Prev/Next, Favorite, Add to Playlist (deferred for user lists), View Album/Artist)
- Search keyboard (grid + voice hint), empty states, error states, “Nothing is live” fallback (§13)
- QR sign-in, settings toggles (notifications, captions, language placeholder)

**Admin web tokens:** reuse color/type where sensible, but dense table/form patterns separate.

**Deliverables:** Figma library + tokens JSON + Storybook (TV) + accessibility checklist + artwork spec sheet for Content Admins.

---

## 4. Phased Build Plan

### Phase 0 — Decisions & Setup (3–7 days, no feature code)
- [ ] Lock TV targets (Android TV/Fire TV ± tvOS), frontend/backend/CMS/video/live vendors from §2
- [ ] Create monorepo + CI (lint/typecheck/test/build), envs (dev/staging/prod), secrets
- [ ] ADR-001…005 (platforms, FE stack, BE/CMS, video/live, auth/search)
- [ ] Seed content model + 20–30 sample items (real titles/topics/artwork placeholders) for design/dev
- **Exit:** `pnpm build` green, staging deploys, sample content renders in a blank TV shell.

### Phase 1 — Design System + App Shell (1–2 weeks)
- [ ] Tokens + TV component library (focus, rails, cards, hero, player chrome, search, empty/error)
- [ ] App shell: nav (Home/Messages/Music/Live/Programs/Favorites/Search), routing, focus graphs, deep links (`pco://message/:id` etc. for Sharing §21)
- [ ] Accessibility pass (§22): contrast, focus visibility, captions toggle, clear playback controls
- [ ] Admin shell (login-gated, role-gated nav)
- **Exit:** navigable empty shell on emulator/device with remote only, no dead-ends.

### Phase 2 — Platform Foundation (1–2 weeks, parallel with Phase 1 backend)
- [ ] Auth: guest browse, email + QR-code TV sign-in, session refresh, sign-in prompt copy (§18)
- [ ] CMS wired: Message/Program/Topic/Event/Artist/Album/Song/Playlist/Live schemas, draft→published flow, artwork upload requirements (§25)
- [ ] Video/audio pipeline: upload → HLS → CDN → player proof (resume via `WatchProgress`)
- [ ] Search index (unified grouped results §16), basic topic/program filters
- [ ] Analytics events + crash reporting
- **Exit:** one real message plays end-to-end from CMS → API → TV with resume.

### Phase 3 — Content & Home Management (Roles come alive)
- [ ] Content Admin tools: CRUD messages/music/programs, topic/event tagging, artwork/title/description validation, featured flags, availability scheduling, Home curation order, Live schedule (§36 list)
- [ ] Super Admin tools: user list, create/remove admins, role assignment, platform settings, activity view, permission toggles
- [ ] Backend RBAC enforcement + audit log
- [ ] Seed full demo library (50+ messages across topics/programs, 10+ artists/albums, 5+ curated playlists, 2–3 programs with episodes)
- **Exit:** non-engineer can publish a message and feature it on Home without code.

### Phase 4 — Viewer MVP Slices (build in this order, each shippable)
1. **Home:** Continue Watching, Live Now, Pastor Chris, LoveWorld Music, Recommended, Recently Added, Popular. Uncrowded per §4 principle.
2. **Messages:** browse by Topic/Program/Event/Date (§5), Message Details (§6), Watch Next rules.
3. **Music:** music home, artist page, album page (artwork/tracklist/Play All/Favorite/Save), curated playlists (§10–12), background-style listening.
4. **Live:** Live Now / Upcoming / Recently Live + empty-state rails (§13).
5. **Programs:** program page (description, latest/previous, related, upcoming, Favorite/Follow), Follow → surfaces on Home (§14).
6. **Favorites + Save for Later:** separate lists, tabs All/Messages/Music/Programs (§8–9).
7. **Search + Discovery:** global search (§16), Because You Watched / More From This Program / More Like This / New / Popular (§17).
8. **Playback polish:** resume everywhere (§7), Watch Next autoplay suggestion, music mini-player persistence.
- **Exit per slice:** remote-only walkthrough + content-absent states + analytics events firing.

### Phase 5 — Personalization, Sharing, Notifications
- [ ] Continue Watching sync across sessions/devices (signed-in), basic recommendations (history/topic/program affinity)
- [ ] Followed-program surfacing on Home
- [ ] Sharing: deep link + title/who/where payload (§21), recipient opens directly
- [ ] Notifications: live-now, new episode, new music, saved-available + preferences (§15)
- [ ] Permission hardening: viewer cannot hit admin APIs, admin cannot manage users/settings
- **Exit:** new-user journey (§31) and returning-user journey both work without manual setup.

### Phase 6 — Hardening & Release Readiness
- [ ] TV performance: cold start <3s on target device, rail scroll 60fps, image caching/prefetch, player startup <2s on broadband
- [ ] Accessibility audit (§22) + family viewing check (readable at distance, simple language)
- [ ] i18n readiness (§23): strings externalized, English only, subtitle track support plumbed
- [ ] Content quality gate (§25): every item requires artwork/title/description/speaker/program/category before publish
- [ ] QA matrix: D-pad only, voice search if available, network loss, HDMI-CEC, 720p/108ers/4K, account ↔ guest switching
- [ ] Store submission: Play Store (Android TV) / Appstore (Fire TV) listings, privacy policy, age rating, screenshots on TV
- [ ] Success instrumentation (§32): can user find Pastor Chris? music? live? return to favorites? come back? — dashboard each.
- **Exit:** TestFlight/internal-track build approved by 5+ real LoveWorld viewers.

### Phase 7 — Launch + Post-MVP (do NOT pull forward)
- Launch: staged rollout, curated Home, live-event dry run, support path.
- Then in order per PRD value: user playlists → profiles → Kids → offline → enhanced recommendations → interactive live → multi-language → devotionals/watch parties.

---

## 5. Build Order & Dependencies (critical path)
```
Decisions (0) → Design system + shell (1) → Auth/CMS/pipeline (2) → Admin tools (3)
  → Home + Playback resume (4.1+4.8) → Messages (4.2) → Live (4.4) → Programs (4.5)
  → Music (4.3) → Favorites/Save (4.6) → Search/Discovery (4.7)
  → Personalization/Sharing/Notifications (5) → Hardening (6) → Launch (7)
```
- Home + resume first: proves core promise fastest.
- Live early if a real event date exists — needs stream rehearsal.
- Music can parallelize after API contracts freeze.

## 6. Testing Strategy
- Unit: permission checks, Watch Next rules, Home section ordering, progress math.
- API contract: Zod schemas shared, integration tests for search/grouping, role denials.
- TV e2e: Detox/Appium or Maestro for TV — focus navigation scripts, player resume, offline/empty states.
- Manual TV checklist every slice: remote-only, no pointer, focus never lost, back button sane, captions work.
- Content QA: broken artwork/links report for Content Admins.

## 7. Risks & Mitigations
- **Content supply / rights:** need licensed LoveWorld catalog + artwork before UI polish matters → seed early, gate launch on library size.
- **Live reliability:** never leave empty screen (§13) + rehearse with real encoder + fallback VOD rails.
- **TV input pain:** QR sign-in + voice search; never require email typing on TV.
- **Scope creep (profiles/offline/i18n):** enforce §28 deferral; any exception needs ADR.
- **Recommendation complexity:** ship rules-based first; ML only after history volume.

## 8. Open Questions for You
1. MVP TV targets: Android TV + Fire TV only, or include Apple TV day one?
2. Real content source: existing LoveWorld library/API or manual CMS entry?
3. Live provider preference (Mux / AWS IVS / Cloudflare) and first live event date?
4. Auth provider preference (Supabase / Clerk / Auth0) and account requirements (email only?)?
5. Team size: solo or team — determines Supabase shortcut vs custom NestJS?

## 9. Suggested Immediate Next Steps
1. Answer §8 Q1–Q4 (one line each is enough).
2. Scaffold monorepo (`apps/tv`, `apps/admin`, `packages/*`, `services/api`) + CI.
3. Build tokens + TV shell + CMS schemas in parallel.
4. Seed 30 sample items and prove CMS → API → TV playback.

---
*Teams should treat this file as the build contract. PRD remains the product truth; this file is the execution order.*
