import { recentMessages, store } from "./store";

/**
 * Discovery rails (§17): rules-based, no ML in MVP.
 * Because You Watched / More From This Program / More Like This /
 * You May Also Like / New / Popular.
 */
export interface Discovery {
  becauseYouWatched: string[];
  moreFromProgram: string[];
  moreLikeThis: string[];
  youMayAlsoLike: string[];
  newOnPco: string[];
  popular: string[];
}

export function discovery(historyIds: string[], contextId?: string): Discovery {
  const history = store.messages.filter((m) => historyIds.includes(m.id));
  const context = store.messages.find((m) => m.id === contextId);
  const historyTopics = new Set(history.flatMap((m) => m.topicIds));
  const historyPrograms = new Set(history.map((m) => m.programId));

  const becauseYouWatched = store.messages
    .filter((m) => !historyIds.includes(m.id) && m.topicIds.some((t) => historyTopics.has(t)))
    .slice(0, 6)
    .map((m) => m.id);

  const moreFromProgram = context
    ? store.messages.filter((m) => m.programId === context.programId && m.id !== context.id).slice(0, 6).map((m) => m.id)
    : [];

  const moreLikeThis = context
    ? store.messages
        .filter((m) => m.id !== context.id && m.topicIds.some((t) => context.topicIds.includes(t)))
        .slice(0, 6)
        .map((m) => m.id)
    : [];

  const youMayAlsoLike = store.messages
    .filter((m) => !historyIds.includes(m.id) && (historyPrograms.has(m.programId) || m.topicIds.some((t) => historyTopics.has(t))))
    .slice(0, 6)
    .map((m) => m.id);

  const newOnPco = recentMessages(6).map((m) => m.id);
  const popular = [...store.messages].sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999)).slice(0, 6).map((m) => m.id);

  return { becauseYouWatched, moreFromProgram, moreLikeThis, youMayAlsoLike, newOnPco, popular };
}
