import { groupedSearch } from "@pco/ui-tv";
import { store } from "./store";

/**
 * Unified grouped search (§16): one query across messages/programs/music/events/artists.
 * Postgres FTS replaces this in staging/prod; grouping contract stays identical.
 */
export function searchAll(q: string) {
  const titles = new Map<string, string>();
  for (const m of store.allMessages) titles.set(m.id, `${m.title} ${m.description}`);
  for (const p of store.programs) titles.set(p.id, `${p.title} ${p.description}`);
  for (const s of store.songs) titles.set(s.id, s.title);
  for (const a of store.artists) titles.set(a.id, `${a.name} ${a.bio}`);
  for (const t of store.topics) titles.set(t.id, t.name);
  return groupedSearch(q, {
    messages: store.allMessages.map((m) => m.id),
    programs: store.programs.map((p) => p.id),
    music: store.songs.map((s) => s.id),
    events: store.topics.map((t) => t.id),
    artists: store.artists.map((a) => a.id),
    titles,
  });
}

/** Topic / program / recent filters for Messages browse (§5). */
export function browseMessages(filter: { topicId?: string; programId?: string; recent?: number }) {
  let list = [...store.messages];
  if (filter.programId) list = list.filter((m) => m.programId === filter.programId);
  if (filter.topicId) list = list.filter((m) => m.topicIds.includes(filter.topicId!));
  list.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  return filter.recent ? list.slice(0, filter.recent) : list;
}
