/** WatchProgress store (Supabase table in staging/prod). Powers Continue Watching + Resume (§7). */

export interface WatchProgress {
  userId: string;
  contentType: "message" | "song";
  contentId: string;
  positionSec: number;
  durationSec: number;
  updatedAt: string;
}

const rows = new Map<string, WatchProgress>();
const key = (userId: string, contentId: string) => `${userId}:${contentId}`;

export function putProgress(p: Omit<WatchProgress, "updatedAt">): WatchProgress {
  const row: WatchProgress = { ...p, updatedAt: new Date().toISOString() };
  rows.set(key(p.userId, p.contentId), row);
  return row;
}

export function getProgress(userId: string, contentId: string): WatchProgress | undefined {
  return rows.get(key(userId, contentId));
}

/** Unfinished items, most-recent first — the Continue Watching rail. */
export function continueWatching(userId: string, limit = 10): WatchProgress[] {
  return [...rows.values()]
    .filter((r) => r.userId === userId && r.positionSec > 0 && r.positionSec < r.durationSec - 15)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, limit);
}
