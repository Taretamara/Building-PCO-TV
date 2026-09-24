# ADR-001: TV Platforms for MVP

**Status:** Accepted (Phase 0)
**Date:** 2026-09-24

## Decision
MVP targets **Android TV + Fire TV** from one React Native TV codebase, plus a **Web preview** (Next.js) for stakeholders. tvOS second. Roku / Tizen / webOS deferred.

## Context
PRD is TV-first (§19), global LoveWorld audience on affordable devices. Team is small, repo is docs-only.

## Consequences
- One codebase, D-pad focus once.
- Web preview unblocks content review without TV hardware.
- Native Roku/Tizen work deferred; needs separate ADR to add.
