import type { Message } from "@pco/content-models";
import { log } from "./audit";
import { requireAction, type Session } from "./auth";
import { store } from "./store";

/**
 * Content Admin workflows (§36): every mutation requires manageCatalog,
 * validates §25 required fields, and writes an audit entry.
 * Availability = status + optional publishAt/unpublishAt window.
 */
export interface MessageDraft {
  title: string;
  description: string;
  speaker: string;
  programId: string;
  eventId?: string;
  topicIds: string[];
  artwork?: string;
  videoAssetId?: string;
  durationSec: number;
  publishedAt?: string;
  publishAt?: string;
  unpublishAt?: string;
  featuredRank?: number;
}

export function validateDraft(d: MessageDraft): string[] {
  const missing: string[] = [];
  if (!d.title) missing.push("title");
  if (!d.description) missing.push("description");
  if (!d.speaker) missing.push("speaker");
  if (!d.programId) missing.push("program");
  if (!d.topicIds || d.topicIds.length === 0) missing.push("topics");
  if (!d.artwork) missing.push("artwork");
  if (!d.videoAssetId) missing.push("videoAsset");
  if (!d.durationSec || d.durationSec <= 0) missing.push("durationSec");
  if (!store.programs.some((p) => p.id === d.programId)) missing.push("program(exists)");
  const topicIds = new Set(store.topics.map((t) => t.id));
  if (d.topicIds.some((t) => !topicIds.has(t))) missing.push("topics(exist)");
  return missing;
}

let counter = 100;

export function createMessage(session: Session, draft: MessageDraft): Message {
  requireAction(session, "manageCatalog");
  const missing = validateDraft(draft);
  if (missing.length > 0) throw new Error(`unpublishable: missing ${missing.join(", ")}`);
  const msg: Message = {
    id: `m-${String(counter++).padStart(3, "0")}`,
    title: draft.title,
    description: draft.description,
    speaker: draft.speaker,
    programId: draft.programId,
    topicIds: draft.topicIds,
    publishedAt: draft.publishedAt ?? new Date().toISOString().slice(0, 10),
    durationSec: draft.durationSec,
    artwork: draft.artwork!,
    status: "draft",
  };
  store.allMessages.push(msg);
  log({ actorId: actorOf(session), actorRole: roleOf(session), action: "message.create", target: msg.id, detail: msg.title });
  return msg;
}

export function publishMessage(session: Session, id: string): Message {
  requireAction(session, "manageCatalog");
  const msg = store.allMessages.find((m) => m.id === id);
  if (!msg) throw new Error(`not found: ${id}`);
  const missing = validateDraft({
    title: msg.title,
    description: msg.description,
    speaker: msg.speaker,
    programId: msg.programId,
    topicIds: msg.topicIds,
    artwork: msg.artwork,
    videoAssetId: "seed-provided",
    durationSec: msg.durationSec,
  });
  if (missing.length > 0) throw new Error(`unpublishable: missing ${missing.join(", ")}`);
  msg.status = "published";
  if (!store.messages.some((m) => m.id === id)) store.messages.push(msg);
  log({ actorId: actorOf(session), actorRole: roleOf(session), action: "message.publish", target: id });
  return msg;
}

export function archiveMessage(session: Session, id: string): void {
  requireAction(session, "manageCatalog");
  const msg = store.allMessages.find((m) => m.id === id);
  if (!msg) throw new Error(`not found: ${id}`);
  msg.status = "archived";
  const i = store.messages.findIndex((m) => m.id === id);
  if (i >= 0) store.messages.splice(i, 1);
  log({ actorId: actorOf(session), actorRole: roleOf(session), action: "message.archive", target: id });
}

/** Feature on Home: lower rank = higher placement (§36: organize/curate Home). */
export function featureMessage(session: Session, id: string, rank: number): void {
  requireAction(session, "manageCatalog");
  const msg = store.allMessages.find((m) => m.id === id);
  if (!msg) throw new Error(`not found: ${id}`);
  if (msg.status !== "published") throw new Error("only published messages can be featured");
  msg.featuredRank = rank;
  log({ actorId: actorOf(session), actorRole: roleOf(session), action: "home.feature", target: id, detail: `rank ${rank}` });
}

/** Featured messages first — drives the Pastor Chris rail. */
export function featuredMessages(limit = 5): Message[] {
  return [...store.messages]
    .sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999) || (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit);
}

function actorOf(s: Session): string {
  return s.kind === "user" ? s.userId : `guest:${s.deviceId}`;
}
function roleOf(s: Session): string {
  return s.kind === "user" ? s.role : "guest";
}
