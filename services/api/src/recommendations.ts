import { store } from "./store";

/**
 * Basic recommendations (§17, §31): affinity from history + favorites + follows.
 * Score: same program +3, shared topic +2 each, recent +1. No ML in MVP.
 */
export interface Signals {
  historyIds: string[];
  favoriteMessageIds: string[];
  followedProgramIds: string[];
}

export function affinityScores(sig: Signals): Map<string, number> {
  const scores = new Map<string, number>();
  const history = store.messages.filter((m) => sig.historyIds.includes(m.id));
  const favs = store.messages.filter((m) => sig.favoriteMessageIds.includes(m.id));
  const topics = new Set([...history, ...favs].flatMap((m) => m.topicIds));
  const programs = new Set([...history.map((m) => m.programId), ...sig.followedProgramIds]);
  for (const m of store.messages) {
    if (m.status !== "published" || sig.historyIds.includes(m.id)) continue;
    let s = 0;
    if (programs.has(m.programId)) s += 3;
    for (const t of m.topicIds) if (topics.has(t)) s += 2;
    if (Date.parse(m.publishedAt) > Date.now() - 1000 * 60 * 60 * 24 * 60) s += 1;
    if (s > 0) scores.set(m.id, s);
  }
  return scores;
}

/** Ranked recommendations, most-affine first, recent tiebreak. */
export function recommendedFor(sig: Signals, limit = 10): string[] {
  const scores = affinityScores(sig);
  return [...store.messages]
    .filter((m) => scores.has(m.id))
    .sort((a, b) => scores.get(b.id)! - scores.get(a.id)! || (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit)
    .map((m) => m.id);
}
