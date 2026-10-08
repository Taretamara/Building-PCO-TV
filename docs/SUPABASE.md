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
Favorites, saved, follows, progress, reflections, premium flag — per active
device profile, debounced ~3s, offline-first (local copy always works).
Device profiles + PIN vaults stay local-only by design.
Shared community (everyone sees everyone) still needs a comments table +
moderation queue — post-MVP.
