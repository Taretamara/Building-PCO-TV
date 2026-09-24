import { messageCard, liveCard, orderRails, type Rail } from "@pco/ui-tv";
import { continueWatching } from "./progress";
import { getMessage, recentMessages, store } from "./store";

/**
 * GET /home builder. Section order follows PRD §4; empty rails drop out
 * except live-now, which renders the "Nothing is live" fallback (§13).
 */
export function buildHome(userId?: string): Rail[] {
  const progress = userId ? continueWatching(userId) : [];
  const cwCards = progress.flatMap((p) => {
    const m = getMessage(p.contentId);
    if (!m) return [];
    const pct = Math.round((p.positionSec / p.durationSec) * 100);
    return [messageCard({ id: m.id, title: m.title, speaker: m.speaker, durationSec: m.durationSec, progressPct: pct })];
  });

  const live = store.live.find((l) => l.status === "live");
  const liveCards = (live ? [live] : []).map((l) => liveCard(l));

  const pastorCards = recentMessages(10).map((m) =>
    messageCard({ id: m.id, title: m.title, speaker: m.speaker, durationSec: m.durationSec }),
  );
  const musicCards = store.playlists.map((p) => ({
    id: p.id,
    kind: "playlist" as const,
    title: p.title,
    subtitle: `${p.songIds.length} songs`,
    artworkRatio: "1:1" as const,
    deepLink: `pco://playlist/${p.id}`,
  }));
  const recentCards = recentMessages(10).map((m) =>
    messageCard({ id: m.id, title: m.title, speaker: m.speaker, durationSec: m.durationSec, isNew: true }),
  );

  return orderRails([
    { key: "continue-watching", title: "Continue Watching", cards: cwCards },
    { key: "live-now", title: "Live Now", cards: liveCards },
    { key: "pastor-chris", title: "Pastor Chris", cards: pastorCards },
    { key: "music", title: "LoveWorld Music", cards: musicCards },
    { key: "recommended", title: "Recommended for You", cards: pastorCards.slice(0, 5) },
    { key: "recently-added", title: "Recently Added", cards: recentCards },
    { key: "popular", title: "Popular", cards: pastorCards.slice(0, 5) },
  ]);
}
