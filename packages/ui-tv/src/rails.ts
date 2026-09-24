import type { CardViewModel } from "./cards";

/** Home rails in PRD §4 order. Uncrowded: max 7 rails, each capped. */
export type RailKey =
  | "continue-watching"
  | "live-now"
  | "pastor-chris"
  | "music"
  | "recommended"
  | "recently-added"
  | "popular";

export interface Rail {
  key: RailKey;
  title: string;
  cards: CardViewModel[];
}

export const RAIL_ORDER: RailKey[] = [
  "continue-watching",
  "live-now",
  "pastor-chris",
  "music",
  "recommended",
  "recently-added",
  "popular",
];

export const RAIL_CAP = 10;

/** Sort rails for Home; drops empty rails except live (which shows fallback §13). */
export function orderRails(rails: Rail[]): Rail[] {
  const byKey = new Map(rails.map((r) => [r.key, r]));
  return RAIL_ORDER.flatMap((key) => {
    const rail = byKey.get(key);
    if (!rail) return [];
    if (rail.cards.length === 0 && key !== "live-now") return [];
    return [{ ...rail, cards: rail.cards.slice(0, RAIL_CAP) }];
  });
}
