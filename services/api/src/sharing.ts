import { albumPage, artistPage } from "./music";
import { messageDetail } from "./messages";
import { programPage } from "./follows";
import { store } from "./store";

/**
 * Sharing (§21): payload says what it is, who it's from, where to watch/listen.
 * The recipient opens the deep link directly — no search needed.
 */
export type ShareKind = "message" | "song" | "program" | "playlist" | "live" | "artist" | "album";

export interface SharePayload {
  kind: ShareKind;
  title: string;
  from: string;
  where: string;
  deepLink: string;
}

export function sharePayload(kind: ShareKind, id: string): SharePayload | null {
  switch (kind) {
    case "message": {
      const d = messageDetail(id);
      if (!d) return null;
      return { kind, title: d.title, from: d.speaker, where: d.program, deepLink: d.deepLink };
    }
    case "program": {
      const p = programPage(id);
      if (!p) return null;
      return { kind, title: p.title, from: "LoveWorld", where: "PCO TV · Programs", deepLink: `pco://program/${id}` };
    }
    case "artist": {
      const a = artistPage(id);
      if (!a) return null;
      return { kind, title: a.name, from: "LoveWorld Music", where: "PCO TV · Music", deepLink: `pco://artist/${id}` };
    }
    case "album": {
      const a = albumPage(id);
      if (!a) return null;
      return { kind, title: a.title, from: a.artist, where: "PCO TV · Music", deepLink: `pco://album/${id}` };
    }
    case "song": {
      const s = store.songs.find((x) => x.id === id);
      if (!s) return null;
      const artist = store.artists.find((a) => a.id === s.artistId);
      return { kind, title: s.title, from: artist?.name ?? "LoveWorld Music", where: "PCO TV · Music", deepLink: `pco://song/${id}` };
    }
    case "playlist": {
      const p = store.playlists.find((x) => x.id === id);
      if (!p) return null;
      return { kind, title: p.title, from: "LoveWorld Music", where: "PCO TV · Music", deepLink: `pco://playlist/${id}` };
    }
    case "live": {
      const l = store.live.find((x) => x.id === id);
      if (!l) return null;
      return { kind, title: l.title, from: "LoveWorld", where: "PCO TV · Live", deepLink: `pco://live/${id}` };
    }
  }
}

export interface OpenedShare {
  tab: "messages" | "music" | "programs" | "live";
  detail: string;
  id: string;
  title: string;
}

/** Recipient path: deep link → exact content. Null = unknown link (error state, never trap). */
export function openShared(deepLink: string): OpenedShare | null {
  const m = /^pco:\/\/(message|song|program|playlist|live|artist|album)\/(.+)$/.exec(deepLink);
  if (!m) return null;
  const [, kind, id] = m;
  const payload = sharePayload(kind as ShareKind, id);
  if (!payload) return null;
  const tab = kind === "message" ? "messages" : kind === "live" ? "live" : kind === "program" ? "programs" : "music";
  return { tab, detail: kind, id, title: payload.title };
}
