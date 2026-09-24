/**
 * Player state machine + Watch Next rules (PRD §6 priority):
 * same series/program → same topic → viewing history → recently added.
 */

export type PlayerState = "idle" | "loading" | "playing" | "paused" | "ended";

export interface PlayableRef {
  id: string;
  programId?: string;
  topicIds: string[];
  publishedAt: string;
}

export function next(
  current: PlayableRef,
  library: PlayableRef[],
  historyIds: string[],
): PlayableRef | null {
  const pool = library.filter((m) => m.id !== current.id);
  const sameProgram = pool.filter((m) => current.programId && m.programId === current.programId);
  if (sameProgram.length > 0) return sortRecent(sameProgram)[0];
  const sameTopic = pool.filter((m) => m.topicIds.some((t) => current.topicIds.includes(t)));
  if (sameTopic.length > 0) return sortRecent(sameTopic)[0];
  const fromHistory = pool.filter((m) => historyIds.includes(m.id));
  if (fromHistory.length > 0) return sortRecent(fromHistory)[0];
  return sortRecent(pool)[0] ?? null;
}

function sortRecent(list: PlayableRef[]): PlayableRef[] {
  return [...list].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function resumeLabel(positionSec: number, durationSec: number): string {
  if (positionSec <= 0) return "Play";
  if (positionSec >= durationSec - 15) return "Replay";
  return `Resume · ${Math.round(positionSec / 60)} min in`;
}
