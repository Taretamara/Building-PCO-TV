/**
 * Favorites vs Save for Later (§8–9): separate stores, separate meanings.
 * Favorites = long-term important. Saved = watch/listen later.
 * Tabs: All | Messages | Music | Programs.
 */
export type FavKind = "message" | "music" | "program";

export interface SavedItem {
  userId: string;
  kind: FavKind;
  refId: string;
  at: string;
}

const favorites: SavedItem[] = [];
const savedLater: SavedItem[] = [];

function add(list: SavedItem[], userId: string, kind: FavKind, refId: string): void {
  if (!list.some((i) => i.userId === userId && i.kind === kind && i.refId === refId)) {
    list.push({ userId, kind, refId, at: new Date().toISOString() });
  }
}

function remove(list: SavedItem[], userId: string, kind: FavKind, refId: string): void {
  const i = list.findIndex((x) => x.userId === userId && x.kind === kind && x.refId === refId);
  if (i >= 0) list.splice(i, 1);
}

export function addFavorite(userId: string, kind: FavKind, refId: string): void {
  add(favorites, userId, kind, refId);
}
export function removeFavorite(userId: string, kind: FavKind, refId: string): void {
  remove(favorites, userId, kind, refId);
}
export function saveForLater(userId: string, kind: FavKind, refId: string): void {
  add(savedLater, userId, kind, refId);
}
export function unsaveForLater(userId: string, kind: FavKind, refId: string): void {
  remove(savedLater, userId, kind, refId);
}
export function isFavorite(userId: string, kind: FavKind, refId: string): boolean {
  return favorites.some((i) => i.userId === userId && i.kind === kind && i.refId === refId);
}

/** Favorites tab view. Tab "music" covers songs + albums + playlists. */
export function favoritesByTab(userId: string, tab: "all" | "messages" | "music" | "programs"): SavedItem[] {
  const mine = favorites.filter((i) => i.userId === userId);
  if (tab === "all") return mine;
  if (tab === "messages") return mine.filter((i) => i.kind === "message");
  if (tab === "programs") return mine.filter((i) => i.kind === "program");
  return mine.filter((i) => i.kind === "music");
}

export function savedList(userId: string): SavedItem[] {
  return savedLater.filter((i) => i.userId === userId);
}

export function clearPersonal(): void {
  favorites.length = 0;
  savedLater.length = 0;
}
