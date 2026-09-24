import { next } from "@pco/ui-tv";
import { store } from "./store";

/** GET /messages/:id/next — Watch Next priority: series → topic → history → recent (§6). */
export function watchNext(currentId: string, historyIds: string[]): string | null {
  const current = store.allMessages.find((m) => m.id === currentId);
  if (!current) return null;
  const result = next(
    { id: current.id, programId: current.programId, topicIds: current.topicIds, publishedAt: current.publishedAt },
    store.allMessages.map((m) => ({ id: m.id, programId: m.programId, topicIds: m.topicIds, publishedAt: m.publishedAt })),
    historyIds,
  );
  return result?.id ?? null;
}
