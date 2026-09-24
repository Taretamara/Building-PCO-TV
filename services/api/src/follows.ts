import { messagesByProgram, store } from "./store";

/** Followed programs surface new episodes on Home (§14). */
const follows = new Map<string, Set<string>>(); // userId -> programIds

export function followProgram(userId: string, programId: string): void {
  if (!store.programs.some((p) => p.id === programId)) throw new Error(`not found: ${programId}`);
  if (!follows.has(userId)) follows.set(userId, new Set());
  follows.get(userId)!.add(programId);
}

export function unfollowProgram(userId: string, programId: string): void {
  follows.get(userId)?.delete(programId);
}

export function followedPrograms(userId: string): string[] {
  return [...(follows.get(userId) ?? [])];
}

export function isFollowing(userId: string, programId: string): boolean {
  return follows.get(userId)?.has(programId) ?? false;
}

/** Latest episode per followed program — the Home surfacing. */
export function followedNewEpisodes(userId: string, perProgram = 2): Array<{ programId: string; messageId: string }> {
  return followedPrograms(userId).flatMap((pid) =>
    messagesByProgram(pid)
      .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
      .slice(0, perProgram)
      .map((m) => ({ programId: pid, messageId: m.id })),
  );
}

export interface ProgramPage {
  id: string;
  title: string;
  description: string;
  latest: string[];
  previous: string[];
  relatedMessageIds: string[];
  upcomingLive: string[];
  followerCount: number;
  following: boolean;
}

/** Program page assembler (§14). */
export function programPage(programId: string, userId?: string): ProgramPage | null {
  const p = store.programs.find((x) => x.id === programId);
  if (!p) return null;
  const eps = messagesByProgram(programId).sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const related = store.messages
    .filter((m) => m.programId !== programId && m.topicIds.some((t) => eps[0]?.topicIds.includes(t)))
    .slice(0, 5)
    .map((m) => m.id);
  const upcomingLive = store.live.filter((l) => l.programId === programId && l.status === "scheduled").map((l) => l.id);
  const followers = [...follows.values()].filter((s) => s.has(programId)).length;
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    latest: eps.slice(0, 3).map((m) => m.id),
    previous: eps.slice(3, 10).map((m) => m.id),
    relatedMessageIds: related,
    upcomingLive,
    followerCount: followers,
    following: userId ? isFollowing(userId, programId) : false,
  };
}

export function clearFollows(): void {
  follows.clear();
}
