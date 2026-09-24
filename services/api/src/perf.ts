import { buildHome } from "./home";
import { videoForMessage } from "./pipeline";
import { getMessage } from "./store";

/**
 * Performance contracts (Phase 6 gate). TV must feel instant on broadband:
 * cold start <3s, player startup <2s, 60fps rails via prefetched cached images.
 */
export const PERF_BUDGETS = {
  coldStartMs: 3000,
  playerStartupMs: 2000,
  railPrefetchCount: 20,
  maxHeroBytes: 500_000,
} as const;

export interface PrefetchItem {
  url: string;
  priority: number;
  reason: string;
}

/**
 * Image prefetch plan for Home: hero/first-visible-rail artwork first,
 * then the rest. The RN shell feeds this to the image cache on launch.
 */
export function prefetchPlan(userId?: string): PrefetchItem[] {
  const rails = buildHome(userId);
  const items: PrefetchItem[] = [];
  rails.forEach((rail, railIdx) => {
    rail.cards.forEach((card, cardIdx) => {
      const m = getMessage(card.id);
      const url = m ? videoForMessage(m).artwork.hero : `https://cdn.pco.tv/artwork/${card.id}/hero.jpg`;
      items.push({
        url,
        priority: railIdx * 100 + cardIdx,
        reason: `${rail.key}:${card.id}`,
      });
    });
  });
  return items
    .sort((a, b) => a.priority - b.priority)
    .slice(0, PERF_BUDGETS.railPrefetchCount);
}

/** Every visible card must resolve hero artwork (no blank tiles on rails). */
export function artworkCoverage(userId?: string): { total: number; missing: string[] } {
  const missing: string[] = [];
  let total = 0;
  for (const rail of buildHome(userId)) {
    for (const card of rail.cards) {
      total++;
      const m = getMessage(card.id);
      const url = m ? videoForMessage(m).artwork.hero : `https://cdn.pco.tv/artwork/${card.id}/hero.jpg`;
      if (!url.startsWith("https://")) missing.push(card.id);
    }
  }
  return { total, missing };
}
