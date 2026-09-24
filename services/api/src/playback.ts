import { resumeLabel } from "@pco/ui-tv";
import { getProgress, putProgress } from "./progress";
import { getMessage } from "./store";
import { videoForMessage } from "./pipeline";
import { watchNext } from "./watchnext";

/**
 * Unified playback (§7 + §12): video resumes everywhere, music continues in
 * background, and finishing suggests Watch Next (no abrupt dead stop).
 */
export interface PlaybackSession {
  contentId: string;
  hlsUrl: string;
  positionSec: number;
  resumeFromLabel: string;
  autoplayNextId: string | null;
}

export function startPlayback(userId: string | undefined, messageId: string, historyIds: string[]): PlaybackSession | null {
  const m = getMessage(messageId);
  if (!m || m.status !== "published") return null;
  const asset = videoForMessage(m);
  const saved = userId ? getProgress(userId, messageId) : undefined;
  const positionSec = saved?.positionSec ?? 0;
  return {
    contentId: messageId,
    hlsUrl: asset.hlsUrl,
    positionSec,
    resumeFromLabel: resumeLabel(positionSec, m.durationSec),
    autoplayNextId: watchNext(messageId, historyIds),
  };
}

/** Heartbeat from the player; finished (>95%) clears resume so replay starts clean. */
export function heartbeat(userId: string, messageId: string, positionSec: number): void {
  const m = getMessage(messageId);
  if (!m) return;
  if (positionSec >= m.durationSec * 0.95) {
    putProgress({ userId, contentType: "message", contentId: messageId, positionSec: 0, durationSec: m.durationSec });
    return;
  }
  putProgress({ userId, contentType: "message", contentId: messageId, positionSec, durationSec: m.durationSec });
}
