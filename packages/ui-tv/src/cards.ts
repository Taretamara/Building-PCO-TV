/** Card view-models: one consistent metadata contract per content kind (§25). */

export type CardKind = "message" | "program" | "album" | "artist" | "playlist" | "live";

export interface CardViewModel {
  id: string;
  kind: CardKind;
  title: string;
  subtitle: string;
  artworkRatio: "16:9" | "1:1" | "4:5";
  /** 0..100 when resumable; undefined when not started. */
  progressPct?: number;
  badge?: "LIVE" | "NEW" | "UPCOMING" | "RECENT";
  /** Deep link the card opens (§21). */
  deepLink: string;
}

export function messageCard(m: {
  id: string;
  title: string;
  speaker: string;
  durationSec: number;
  progressPct?: number;
  isNew?: boolean;
}): CardViewModel {
  return {
    id: m.id,
    kind: "message",
    title: m.title,
    subtitle: `${m.speaker} · ${Math.round(m.durationSec / 60)} min`,
    artworkRatio: "16:9",
    progressPct: m.progressPct,
    badge: m.isNew ? "NEW" : undefined,
    deepLink: `pco://message/${m.id}`,
  };
}

export function liveCard(l: { id: string; title: string; status: "scheduled" | "live" | "ended" }): CardViewModel {
  return {
    id: l.id,
    kind: "live",
    title: l.title,
    subtitle: l.status === "live" ? "Live now" : l.status === "scheduled" ? "Upcoming" : "Recently live",
    artworkRatio: "16:9",
    badge: l.status === "live" ? "LIVE" : l.status === "scheduled" ? "UPCOMING" : "RECENT",
    deepLink: `pco://live/${l.id}`,
  };
}
