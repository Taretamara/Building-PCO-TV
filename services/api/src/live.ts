import { NOTHING_LIVE } from "@pco/ui-tv";
import { store } from "./store";

/**
 * Live section (§13): Live Now / Upcoming / Recently Live.
 * When nothing is live, the section stays useful via fallback rails — never empty.
 */
export interface LiveSection {
  liveNow: string[];
  upcoming: string[];
  recent: string[];
  emptyState: typeof NOTHING_LIVE | null;
}

export function liveSection(): LiveSection {
  const liveNow = store.live.filter((l) => l.status === "live").map((l) => l.id);
  const upcoming = store.live
    .filter((l) => l.status === "scheduled")
    .sort((a, b) => (a.scheduledAt > b.scheduledAt ? 1 : -1))
    .map((l) => l.id);
  const recent = store.live
    .filter((l) => l.status === "ended")
    .sort((a, b) => (a.scheduledAt < b.scheduledAt ? 1 : -1))
    .map((l) => l.id);
  return { liveNow, upcoming, recent, emptyState: liveNow.length === 0 ? NOTHING_LIVE : null };
}
