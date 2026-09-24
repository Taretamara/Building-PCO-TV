# ADR-003: Backend, CMS, Roles

**Status:** Accepted (Phase 0)
**Date:** 2026-09-24

## Decision
- Backend/DB: **Supabase Free** (Postgres + RLS + Storage + Edge Functions). RBAC enforced in RLS + API middleware.
- CMS: **Sanity Free** for structured content (messages/music/programs/topics/artwork). Home curation + featured flags in CMS.
- Roles (§36): `viewer → content_admin → super_admin`. Guest browses; viewers persist favorites/saved/follows/progress; content_admin manages catalog; super_admin manages users/admins/settings/activity.

## Free fallback
Neon Free (Postgres) + Render Free (Node) if Supabase limits hit; Strapi self-hosted if Sanity seats exceed free.

## Consequences
- ~$0/mo until scale. Upgrade path: Supabase Pro, Sanity Growth.
