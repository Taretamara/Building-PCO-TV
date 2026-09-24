import { followedPrograms } from "./follows";
import { getMessage, store } from "./store";

/**
 * Notifications (§15): only things the user cares about —
 * live now, new episode of a followed program, new music, saved-available.
 * Users control each type via prefs. Outbox is per-user with read state.
 */
export type NotificationType = "live-now" | "new-episode" | "new-music" | "saved-available";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  deepLink: string;
  at: string;
  read: boolean;
}

export type NotificationPrefs = Record<NotificationType, boolean>;

const DEFAULT_PREFS: NotificationPrefs = {
  "live-now": true,
  "new-episode": true,
  "new-music": true,
  "saved-available": true,
};

const prefs = new Map<string, NotificationPrefs>();
const outbox: Notification[] = [];
let counter = 1;

export function getPrefs(userId: string): NotificationPrefs {
  return prefs.get(userId) ?? { ...DEFAULT_PREFS };
}

export function setPref(userId: string, type: NotificationType, on: boolean): NotificationPrefs {
  const p = getPrefs(userId);
  p[type] = on;
  prefs.set(userId, p);
  return p;
}

function push(userId: string, type: NotificationType, title: string, body: string, deepLink: string): void {
  if (!getPrefs(userId)[type]) return;
  outbox.push({ id: `n-${counter++}`, userId, type, title, body, deepLink, at: new Date().toISOString(), read: false });
}

export function inbox(userId: string): Notification[] {
  return outbox.filter((n) => n.userId === userId).sort((a, b) => (a.at < b.at ? 1 : -1));
}

export function markRead(userId: string, id: string): void {
  const n = outbox.find((x) => x.id === id && x.userId === userId);
  if (n) n.read = true;
}

/** "Pastor Chris is live now." → all opted-in users. Returns recipient count. */
export function notifyLiveNow(broadcastId: string, userIds: string[]): number {
  const l = store.live.find((x) => x.id === broadcastId);
  if (!l) throw new Error(`not found: ${broadcastId}`);
  let n = 0;
  for (const u of userIds) {
    const before = inbox(u).length;
    push(u, "live-now", "Pastor Chris is live now.", l.title, `pco://live/${l.id}`);
    if (inbox(u).length > before) n++;
  }
  return n;
}

/** "A new episode of [Program] is available." → followers only. */
export function notifyNewEpisode(messageId: string, userIds: string[]): number {
  const m = getMessage(messageId);
  if (!m) throw new Error(`not found: ${messageId}`);
  const program = store.programs.find((p) => p.id === m.programId);
  let n = 0;
  for (const u of userIds) {
    if (!followedPrograms(u).includes(m.programId)) continue;
    const before = inbox(u).length;
    push(u, "new-episode", `A new episode of ${program?.title ?? "your program"} is available.`, m.title, `pco://message/${m.id}`);
    if (inbox(u).length > before) n++;
  }
  return n;
}

/** "New music from [Artist] is now available." */
export function notifyNewMusic(albumId: string, userIds: string[]): number {
  const al = store.albums.find((a) => a.id === albumId);
  if (!al) throw new Error(`not found: ${albumId}`);
  const artist = store.artists.find((a) => a.id === al.artistId);
  let n = 0;
  for (const u of userIds) {
    const before = inbox(u).length;
    push(u, "new-music", `New music from ${artist?.name ?? "LoveWorld"} is now available.`, al.title, `pco://album/${al.id}`);
    if (inbox(u).length > before) n++;
  }
  return n;
}

/** "Your saved message is now available to watch." */
export function notifySavedAvailable(userId: string, messageId: string): boolean {
  const m = getMessage(messageId);
  if (!m) return false;
  const before = inbox(userId).length;
  push(userId, "saved-available", "Your saved message is now available to watch.", m.title, `pco://message/${m.id}`);
  return inbox(userId).length > before;
}

export function clearNotifications(): void {
  outbox.length = 0;
  prefs.clear();
  counter = 1;
}
