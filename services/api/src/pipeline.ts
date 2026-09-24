/**
 * Video/audio delivery model (ADR-004).
 * MVP $0: ffmpeg → HLS in R2/Supabase Storage + CDN. Paid upgrade: Mux/Stream
 * without changing these URL contracts — the TV player only sees manifests.
 */

export interface VideoAsset {
  /** Stable id, e.g. message id. */
  id: string;
  /** HLS master manifest URL the TV plays. */
  hlsUrl: string;
  /** Poster + thumbnails at card/hero/background sizes. */
  artwork: { card: string; hero: string; background: string };
  /** Captions track (VTT) when available. */
  captionsUrl?: string;
  durationSec: number;
}

function cdnBase(): string {
  return process.env.CLOUDFLARE_R2_ENDPOINT ?? "https://cdn.pco.tv";
}

function muxOrCdn(id: string): string {
  // Mux playback id wins when the paid upgrade lands; else R2 path.
  const muxId = process.env[`MUX_PLAYBACK_${id.toUpperCase().replace(/-/g, "_")}`];
  if (muxId) return `https://stream.mux.com/${muxId}.m3u8`;
  return `${cdnBase()}/hls/${id}/master.m3u8`;
}

/** Manifest + artwork URLs for any message. Audio reuses the same CDN pattern. */
export function videoForMessage(m: { id: string; durationSec: number }): VideoAsset {
  const base = `${cdnBase()}/artwork/${m.id}`;
  return {
    id: m.id,
    hlsUrl: muxOrCdn(m.id),
    artwork: { card: `${base}/card.jpg`, hero: `${base}/hero.jpg`, background: `${base}/bg.jpg` },
    captionsUrl: `${cdnBase()}/captions/${m.id}.vtt`,
    durationSec: m.durationSec,
  };
}

export function audioForSong(s: { id: string }): { streamUrl: string } {
  return { streamUrl: `${cdnBase()}/audio/${s.id}.m3u8` };
}
