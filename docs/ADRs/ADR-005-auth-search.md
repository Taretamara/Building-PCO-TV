# ADR-005: Auth, Search, Recommendations, Notifications, Analytics

**Status:** Accepted (Phase 0)
**Date:** 2026-09-24

## Decision
- Auth: **Supabase Auth** (email + QR-code TV sign-in). Guest browse, upgrade prompt (§18).
- Search: **Postgres full-text** grouped (messages/programs/music/events/artists §16). Typesense self-host/Cloud later.
- Recommendations: **SQL rules** (same series → same topic → history → recent) for Watch Next §6. No ML in MVP.
- Notifications: **OneSignal Free + FCM** with user prefs (§15).
- Analytics/crash: **PostHog Cloud Free (1M events/mo) + Sentry Free (5k/mo)** to prove §32 success criteria.

## Consequences
- All $0 tiers; upgrade on volume. Strings externalized now for i18n readiness (§23).
