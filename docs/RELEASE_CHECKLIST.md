# PCO TV — Release Checklist (Phase 6 gate)

## Store submission
- [ ] Play Store (Android TV): listing, TV screenshots, feature graphic, privacy policy URL, content rating questionnaire.
- [ ] Amazon Appstore (Fire TV): same assets + Fire TV preview images.
- [ ] Version code bumped; `pco://` deep-link intents registered per platform.
- [ ] Crash-free sessions ≥99.5% on internal track (Sentry).

## Content & live readiness
- [ ] Catalog passes `pnpm --filter @pco/cms validate` (artwork/title/description/speaker/program/category).
- [ ] Home curated: Continue Watching, Live Now, Pastor Chris, Music, Recommended, Recent, Popular.
- [ ] Live-event dry run completed (encoder → HLS → Live Now rail → fallback after end).

## Quality gates (all automated)
- [ ] `pnpm build` + `pnpm typecheck` green.
- [ ] `proof`, `proof:admin`, `proof:viewer`, `proof:personal`, `proof:release` all pass.
- [ ] `verify-shell.mjs` (no dead-ends) + content gate pass.
- [ ] Automated QA matrix green (D-pad walk, guest↔account, empty states, type floors).
- [ ] Manual QA signed: HDMI-CEC, voice, 720p/1080p/4K, network loss, captions.

## Rollout
- [ ] Staged rollout (internal → 10% → 50% → 100%) with rollback build kept.
- [ ] §32 dashboard reviewed: all five questions green.
- [ ] Support path published (contact + known issues).
- [ ] 5+ real LoveWorld viewer approvals recorded.
