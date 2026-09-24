import type {
  Album,
  Artist,
  LiveBroadcast,
  Message,
  Playlist,
  Program,
  Song,
} from "@pco/content-models";
import seed from "../../../packages/content-models/seed/seed.json";

/**
 * Seed-backed store. Supabase (Postgres) replaces this module in staging/prod;
 * every accessor keeps its signature so the TV + admin don't change (ADR-003).
 */
export interface Topic {
  id: string;
  slug: string;
  name: string;
}

interface SeedShape {
  topics: Topic[];
  programs: Program[];
  messages: Message[];
  artists: Artist[];
  albums: Album[];
  songs: Song[];
  playlists: Playlist[];
  live: LiveBroadcast[];
}

const data = seed as unknown as SeedShape;

export const store = {
  topics: data.topics,
  programs: data.programs,
  messages: data.messages.filter((m) => m.status === "published"),
  allMessages: data.messages,
  artists: data.artists,
  albums: data.albums,
  songs: data.songs,
  playlists: data.playlists,
  live: data.live,
};

export function getMessage(id: string): Message | undefined {
  return store.allMessages.find((m) => m.id === id);
}

export function messagesByProgram(programId: string): Message[] {
  return store.messages.filter((m) => m.programId === programId);
}

export function messagesByTopic(topicId: string): Message[] {
  return store.messages.filter((m) => m.topicIds.includes(topicId));
}

export function recentMessages(limit = 10): Message[] {
  return [...store.messages].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1)).slice(0, limit);
}
