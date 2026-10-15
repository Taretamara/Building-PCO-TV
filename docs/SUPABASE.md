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

-- Allowlist: ONLY emails in this table can use admin.html or write content.
create table if not exists pco_admins (
  email text primary key,
  role text not null check (role in ('content_admin', 'super_admin')),
  created_at timestamptz default now()
);
alter table pco_admins enable row level security;
drop policy if exists "own row" on pco_admins;
create policy "own row" on pco_admins
  for select to authenticated using (email = (auth.jwt() ->> 'email'));
drop policy if exists "admins write" on pco_catalog;
create policy "admins write" on pco_catalog
  for all to authenticated
  using (exists (select 1 from pco_admins
    where email = (auth.jwt() ->> 'email') and role in ('content_admin', 'super_admin')))
  with check (exists (select 1 from pco_admins
    where email = (auth.jwt() ->> 'email') and role in ('content_admin', 'super_admin')));
```
Then add yourself (replace with your email, keep it lowercase):
```sql
insert into pco_admins (email, role) values ('you@example.com', 'super_admin');
```
Add more admins the same way (`content_admin` for editors). Remove one with
`delete from pco_admins where email = '...'`. Viewer signups are unaffected —
anyone can still create a viewer account; only allowlisted emails pass admin.

## 5. Shared community (everyone sees everyone)
Run this SQL once. Reflections become public to all app users; only signed-in
users can post (the app already gates posting behind login). Word filter +
Report/hide still apply on-device; full moderation queue stays post-MVP.
```sql
create table if not exists pco_community (
  id bigint generated always as identity primary key,
  message_id text not null,
  name text not null,
  text text not null check (char_length(text) between 1 and 500),
  amens integer not null default 0,
  created_at timestamptz default now()
);
alter table pco_community enable row level security;
drop policy if exists "public read" on pco_community;
create policy "public read" on pco_community
  for select using (true);
drop policy if exists "signed-in post" on pco_community;
create policy "signed-in post" on pco_community
  for insert to authenticated
  with check (char_length(text) between 1 and 500);
```
