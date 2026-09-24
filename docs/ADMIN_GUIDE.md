# PCO TV — Admin Guide (Phase 3: publish without code)

For **Content Admins**. No engineering needed — everything below maps to Admin screens
backed by `services/api` (same validation + RBAC as the Sanity CMS in staging/prod).

## Publish a message (5 steps)
1. **Admin → Messages → New.** Fill title, description, speaker, program, ≥1 topic.
2. **Upload** 16:9 artwork + video file (HLS is generated; `transcode.sh` in dev).
3. **Save draft.** Missing fields are listed plainly (e.g. "missing artwork, topics").
4. **Publish.** The §25 gate re-checks; only valid items go live.
5. **Feature (optional):** set Featured rank (1 = top). It leads the Pastor Chris rail on Home.

## Manage music & programs
- **Music:** Artists → Albums (1:1 artwork) → Songs → Curated playlists (MVP: curated only).
- **Programs & Events:** create program page, tag messages by program/event/topic, schedule Live (scheduled → live → ended). When nothing is live, Home shows Upcoming/Recent/Recommended automatically.

## Home curation
- **Admin → Home Curation:** reorder the 7 rails, pin featured items. Max 7 rails, 10 cards each — Home stays uncrowded (§4).

## Super Admin only
- **Users:** list viewers. **Admins:** create/remove content admins, change roles (the last Super Admin cannot be demoted). **Settings:** platform flags. **Activity:** who published/featured what, when.

## Guardrails
- Viewers can never reach these screens (separate admin bundle + server-side role checks).
- Every change is audit-logged. Archive (never delete) so links don't break.
