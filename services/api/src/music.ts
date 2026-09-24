import { audioForSong } from "./pipeline";
import { store } from "./store";

/**
 * Music as a first-class citizen (§10–12): music home, artist page, album page,
 * curated playlists, and a persistent queue for background-style listening.
 */
export interface MusicHome {
  featured: string[];
  latestReleases: string[];
  popular: string[];
  artists: string[];
  albums: string[];
  playlists: string[];
}

export function musicHome(): MusicHome {
  const albums = [...store.albums].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1));
  return {
    featured: store.playlists.slice(0, 2).map((p) => p.id),
    latestReleases: albums.slice(0, 4).map((a) => a.id),
    popular: store.playlists.slice(0, 4).map((p) => p.id),
    artists: store.artists.map((a) => a.id),
    albums: albums.map((a) => a.id),
    playlists: store.playlists.map((p) => p.id),
  };
}

export interface ArtistPage {
  id: string;
  name: string;
  bio: string;
  songIds: string[];
  albumIds: string[];
  playlistIds: string[];
  relatedArtistIds: string[];
}

export function artistPage(id: string): ArtistPage | null {
  const a = store.artists.find((x) => x.id === id);
  if (!a) return null;
  const albumIds = store.albums.filter((x) => x.artistId === id).map((x) => x.id);
  const songIds = store.songs.filter((x) => x.artistId === id).map((x) => x.id);
  const playlistIds = store.playlists.filter((p) => p.songIds.some((s) => songIds.includes(s))).map((p) => p.id);
  const relatedArtistIds = store.artists.filter((x) => x.id !== id).slice(0, 3).map((x) => x.id);
  return { id: a.id, name: a.name, bio: a.bio, songIds, albumIds, playlistIds, relatedArtistIds };
}

export interface AlbumPage {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  tracks: Array<{ id: string; title: string; durationLabel: string; streamUrl: string }>;
}

export function albumPage(id: string): AlbumPage | null {
  const al = store.albums.find((x) => x.id === id);
  if (!al) return null;
  const artist = store.artists.find((a) => a.id === al.artistId);
  const tracks = store.songs
    .filter((s) => s.albumId === id)
    .map((s) => ({
      id: s.id,
      title: s.title,
      durationLabel: `${Math.floor(s.durationSec / 60)}:${String(s.durationSec % 60).padStart(2, "0")}`,
      streamUrl: audioForSong(s).streamUrl,
    }));
  return { id: al.id, title: al.title, artist: artist?.name ?? al.artistId, artwork: al.artwork, tracks };
}

/** Persistent queue: play/pause/prev/next survive screen changes (§12). */
export interface Queue {
  trackIds: string[];
  index: number;
  playing: boolean;
}

let queue: Queue = { trackIds: [], index: 0, playing: false };

export function playAll(songIds: string[]): Queue {
  queue = { trackIds: [...songIds], index: 0, playing: true };
  return queue;
}

export function playAlbum(albumId: string): Queue {
  return playAll(store.songs.filter((s) => s.albumId === albumId).map((s) => s.id));
}

export function togglePlay(): Queue {
  queue = { ...queue, playing: !queue.playing };
  return queue;
}

export function nextTrack(): Queue {
  if (queue.index < queue.trackIds.length - 1) queue = { ...queue, index: queue.index + 1 };
  return queue;
}

export function prevTrack(): Queue {
  if (queue.index > 0) queue = { ...queue, index: queue.index - 1 };
  return queue;
}

export function currentQueue(): Queue {
  return queue;
}

export function resetQueue(): void {
  queue = { trackIds: [], index: 0, playing: false };
}
