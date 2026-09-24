# ADR-002: Frontend Stack

**Status:** Accepted (Phase 0)
**Date:** 2026-09-24

## Decision
- TV app: **React Native for TV (`react-native-tvos`) + TypeScript**, TanStack Query + Zustand + Zod.
- Admin web: **Next.js + TypeScript + Tailwind** (Vercel Hobby / Cloudflare Pages free for MVP).
- Shared: pnpm + Turborepo monorepo, `packages/ui-tv`, `packages/api-client`, `packages/content-models`.

## Context
TV needs 10-foot D-pad UI; admin needs dense forms. One stack cannot serve both.

## Consequences
- Shared types/schemas across tv/admin/api.
- Node 20+ required for dev (local is Node 16 — upgrade via nvm: `nvm install 20`).
