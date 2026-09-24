/**
 * CMS content schemas (Sanity-compatible shape, plain TS — no vendor lock-in at type level).
 * Mirrors PRD §24–25 + §36: every publishable item needs artwork/title/description/
 * speaker-or-artist/program-or-album/category before it can go live.
 */

export interface SchemaField {
  name: string;
  title: string;
  type: string;
  required: boolean;
  options?: string[];
}

export interface ContentSchema {
  name: string;
  title: string;
  statusWorkflow: Array<"draft" | "scheduled" | "published" | "archived">;
  requiredForPublish: string[];
  fields: SchemaField[];
}

const req = (name: string, title: string, type: string, options?: string[]): SchemaField => ({
  name,
  title,
  type,
  required: true,
  options,
});
const opt = (name: string, title: string, type: string): SchemaField => ({
  name,
  title,
  type,
  required: false,
});

export const SCHEMAS: ContentSchema[] = [
  {
    name: "message",
    title: "Message",
    statusWorkflow: ["draft", "scheduled", "published", "archived"],
    requiredForPublish: ["title", "description", "speaker", "program", "topics", "artwork", "videoAsset", "durationSec", "publishedAt"],
    fields: [
      req("title", "Title", "string"),
      req("description", "Description", "text"),
      req("speaker", "Speaker", "reference:speaker"),
      req("program", "Program", "reference:program"),
      opt("event", "Event", "reference:event"),
      req("topics", "Topics", "array:reference:topic"),
      req("artwork", "Artwork (16:9 + 1:1)", "image"),
      req("videoAsset", "Video asset (HLS)", "reference:videoAsset"),
      req("durationSec", "Duration (sec)", "number"),
      req("publishedAt", "Published at", "datetime"),
      opt("featuredRank", "Featured rank", "number"),
      req("status", "Status", "string", ["draft", "scheduled", "published", "archived"]),
    ],
  },
  {
    name: "program",
    title: "Program",
    statusWorkflow: ["draft", "published", "archived"],
    requiredForPublish: ["title", "description", "artwork", "slug"],
    fields: [
      req("title", "Title", "string"),
      req("slug", "Slug", "slug"),
      req("description", "Description", "text"),
      req("artwork", "Artwork", "image"),
      req("status", "Status", "string", ["draft", "published", "archived"]),
    ],
  },
  {
    name: "liveBroadcast",
    title: "Live Broadcast",
    statusWorkflow: ["draft", "scheduled", "published", "archived"],
    requiredForPublish: ["title", "program", "scheduledAt", "streamUrl", "artwork"],
    fields: [
      req("title", "Title", "string"),
      req("program", "Program", "reference:program"),
      req("scheduledAt", "Scheduled at", "datetime"),
      opt("endedAt", "Ended at", "datetime"),
      req("streamUrl", "Stream URL (HLS live)", "url"),
      req("artwork", "Artwork", "image"),
      req("status", "Status", "string", ["scheduled", "live", "ended"]),
    ],
  },
  {
    name: "artist",
    title: "Artist",
    statusWorkflow: ["draft", "published", "archived"],
    requiredForPublish: ["name", "bio", "artwork"],
    fields: [req("name", "Name", "string"), req("bio", "Bio", "text"), req("artwork", "Artwork (1:1)", "image")],
  },
  {
    name: "album",
    title: "Album",
    statusWorkflow: ["draft", "published", "archived"],
    requiredForPublish: ["title", "artist", "artwork", "releaseDate"],
    fields: [
      req("title", "Title", "string"),
      req("artist", "Artist", "reference:artist"),
      req("artwork", "Artwork (1:1)", "image"),
      req("releaseDate", "Release date", "date"),
    ],
  },
  {
    name: "song",
    title: "Song",
    statusWorkflow: ["draft", "published", "archived"],
    requiredForPublish: ["title", "artist", "album", "audioAsset", "durationSec"],
    fields: [
      req("title", "Title", "string"),
      req("artist", "Artist", "reference:artist"),
      req("album", "Album", "reference:album"),
      req("audioAsset", "Audio asset", "file"),
      req("durationSec", "Duration (sec)", "number"),
    ],
  },
  {
    name: "playlist",
    title: "Playlist (curated, MVP)",
    statusWorkflow: ["draft", "published", "archived"],
    requiredForPublish: ["title", "songs", "artwork"],
    fields: [req("title", "Title", "string"), req("songs", "Songs", "array:reference:song"), req("artwork", "Artwork", "image")],
  },
  {
    name: "homeSection",
    title: "Home Section (curation)",
    statusWorkflow: ["draft", "published"],
    requiredForPublish: ["key", "title", "order"],
    fields: [
      req("key", "Key", "string", ["continue-watching", "live-now", "pastor-chris", "music", "recommended", "recently-added", "popular"]),
      req("title", "Title", "string"),
      req("order", "Order", "number"),
      opt("curatedIds", "Curated ids", "array:string"),
    ],
  },
];
