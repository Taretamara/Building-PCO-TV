# PCO TV — Supabase accounts setup (free tier)

## 1. Run this SQL (Dashboard → SQL Editor → New query → Run)
```sql
create table if not exists pco_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}',
  updated_at timestamptz default now()
);
alter table pco_data enable row level security;
drop policy if exists "owners only" on pco_data;
create policy "owners only" on pco_data
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- TV companion mode: allow the app's live pairing channels (open codes only,
-- no user data flows here; same anonymous access as the public anon key).
drop policy if exists "pco tv broadcast" on realtime.messages;
create policy "pco tv broadcast" on realtime.messages
  for all to anon, authenticated using (true) with check (true);
```

## 2. Email sign-in without friction (demo)
Authentication → Providers → Email → turn OFF **Confirm email**
(otherwise new accounts must click an email link before first sign-in).
Also set Authentication → URL Configuration → Site URL to the Netlify URL.

## 3. Keys (never in git, never in recordings)
- Local: add to repo-root `.env` (git-ignored):
  ```
  SUPABASE_URL=https://klyjbpljzfhpoifvsiww.supabase.co
  SUPABASE_ANON_KEY=your-anon-public-key
  ```
- Netlify: Site settings → Environment variables → add both →
  Deploys → Trigger deploy.
- The app reads them at runtime via `/api/config`. The anon key is public
  by design; row-level security above is what protects user data.

## What syncs
Favorites, saved, follows, progress, reflections, premium flag — stored per
device profile inside one row (`{ profiles: { <pid>: {...} } }`), debounced
~3s, offline-first (local copy always works). Sync needs an active profile;
signing in from landing defers until you pick one. Profiles + PIN vaults
stay local-only by design.
Shared community (everyone sees everyone) still needs a comments table +
moderation queue — post-MVP.

## 4. Admin catalog (add content from `admin.html`)
Run this SQL once (same SQL Editor):
```sql
create table if not exists pco_catalog (
  id bigint generated always as identity primary key,
  kind text not null,
  data jsonb not null default '{}',
  status text not null default 'published',
  created_at timestamptz default now()
);
alter table pco_catalog enable row level security;
drop policy if exists "public read published" on pco_catalog;
create policy "public read published" on pco_catalog
  for select using (status = 'published');
drop policy if exists "admins write" on pco_catalog;
create policy "admins write" on pco_catalog
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') in ('content_admin', 'super_admin'))
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') in ('content_admin', 'super_admin'));
```
Then make yourself admin (no SQL needed): Dashboard → Authentication →
Users → your user → **⋯ → Edit user** → **App metadata** → set
`{"role": "super_admin"}` → Save. Open `admin.html` on the site, sign in,
and publish — items appear in the app within a minute.
