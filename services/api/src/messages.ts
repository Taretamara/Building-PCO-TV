import { isFavorite } from "./favorites";
import { getMessage, store } from "./store";
import { watchNext } from "./watchnext";

/** Message Details page assembler (§6) + related + next. */
export interface MessageDetail {
  id: string;
  title: string;
  speaker: string;
  program: string;
  event?: string;
  topics: string[];
  description: string;
  durationLabel: string;
  actions: Array<"play" | "favorite" | "save" | "share">;
  favorited: boolean;
  relatedIds: string[];
  nextId: string | null;
  deepLink: string;
}

export function messageDetail(id: string, userId?: string, historyIds: string[] = []): MessageDetail | null {
  const m = getMessage(id);
  if (!m || m.status !== "published") return null;
  const program = store.programs.find((p) => p.id === m.programId);
  const topicNames = m.topicIds.map((t) => store.topics.find((x) => x.id === t)?.name ?? t);
  const related = store.messages
    .filter(
      (x) =>
        x.id !== id &&
        x.status === "published" &&
        (x.programId === m.programId || x.topicIds.some((t) => m.topicIds.includes(t))),
    )
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, 6)
    .map((x) => x.id);
  return {
    id: m.id,
    title: m.title,
    speaker: m.speaker,
    program: program?.title ?? m.programId,
    topics: topicNames,
    description: m.description,
    durationLabel: `${Math.round(m.durationSec / 60)} min`,
    actions: ["play", "favorite", "save", "share"],
    favorited: userId ? isFavorite(userId, "message", id) : false,
    relatedIds: related,
    nextId: watchNext(id, historyIds),
    deepLink: `pco://message/${id}`,
  };
}
