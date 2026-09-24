export type Role = "viewer" | "content_admin" | "super_admin";

export interface Message {
  id: string;
  title: string;
  description: string;
  speaker: string;
  programId: string;
  eventId?: string;
  topicIds: string[];
  publishedAt: string;
  durationSec: number;
  artwork: string;
  status: "draft" | "scheduled" | "published" | "archived";
  featuredRank?: number;
}

export interface Program {
  id: string;
  slug: string;
  title: string;
  description: string;
  artwork: string;
}

export interface Artist {
  id: string;
  name: string;
  bio: string;
  artwork: string;
}

export interface Album {
  id: string;
  artistId: string;
  title: string;
  artwork: string;
  releaseDate: string;
}

export interface Song {
  id: string;
  albumId: string;
  artistId: string;
  title: string;
  durationSec: number;
}

export interface Playlist {
  id: string;
  title: string;
  type: "curated";
  songIds: string[];
  artwork: string;
}

export interface LiveBroadcast {
  id: string;
  title: string;
  status: "scheduled" | "live" | "ended";
  scheduledAt: string;
  programId: string;
  artwork: string;
}
