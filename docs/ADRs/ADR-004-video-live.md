# ADR-004: Video, Audio, Live

**Status:** Accepted (Phase 0)
**Date:** 2026-09-24

## Decision
- VOD MVP ($0): **ffmpeg (OSS) → HLS/MP4 → Supabase Storage (1GB free) + Cloudflare R2 (10GB free) + Cloudflare CDN free**. Or YouTube Unlisted embeds for fastest seeding.
- Live MVP ($0): **YouTube Live embed** fronted by Live Now / Upcoming / Recently Live states + fallback rails (§13). Alternative: Owncast self-host.
- Audio: MP3/AAC via same storage + CDN (background listening §12).

## Upgrade trigger
Before public launch: **Mux or Cloudflare Stream** for adaptive HLS, thumbnails, captions; **Mux Live / AWS IVS** for branded low-latency live.

## Consequences
- MVP proves playback/resume without video bills. Ops burden (transcoding/thumbnails) returns until paid upgrade.
