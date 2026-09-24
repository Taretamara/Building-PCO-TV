import type { Role } from "@pco/content-models";

/**
 * Auth model (Supabase Auth implements this in staging/prod — ADR-005).
 * - Guest: browse + play, local-only progress. No persistence.
 * - Signed-in: favorites / saved / follows / progress / recommendations.
 * - TV sign-in: QR device-code flow (no password typing on remote, §18).
 */

export type Session =
  | { kind: "guest"; deviceId: string }
  | { kind: "user"; userId: string; role: Role; refreshToken: string; expiresAt: number };

export function guestSession(deviceId: string): Session {
  return { kind: "guest", deviceId };
}

/** Step 1 (TV): request device code, show QR linking to /activate?code=XXXX. */
export function startDeviceFlow(deviceId: string): { code: string; qrDeepLink: string; expiresInSec: number } {
  const code = deviceId.slice(-4).toUpperCase().padStart(4, "0") + "-TV";
  return { code, qrDeepLink: `https://pco.tv/activate?code=${encodeURIComponent(code)}`, expiresInSec: 600 };
}

/** Step 2 (phone/web approves) → Step 3 (TV polls, exchanges code for session). */
export function exchangeDeviceCode(code: string, userId: string, role: Role): Session {
  if (!code.endsWith("-TV")) throw new Error("invalid device code");
  return { kind: "user", userId, role, refreshToken: `rt_${userId}_${Date.now()}`, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 };
}

export function refresh(session: Extract<Session, { kind: "user" }>): Session {
  return { ...session, refreshToken: `rt_${session.userId}_${Date.now()}`, expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 };
}

/** Permission matrix (§36), enforced server-side — UI gating is not enough. */
export type Action =
  | "browse"
  | "play"
  | "favorite"
  | "save"
  | "follow"
  | "manageCatalog"
  | "manageUsers"
  | "manageAdmins"
  | "manageSettings"
  | "viewActivity";

const GUEST_ALLOW: Action[] = ["browse", "play"];
const VIEWER_ALLOW: Action[] = ["browse", "play", "favorite", "save", "follow"];
const CATALOG_ALLOW: Action[] = [...VIEWER_ALLOW, "manageCatalog"];
const SUPER_ALLOW: Action[] = [...CATALOG_ALLOW, "manageUsers", "manageAdmins", "manageSettings", "viewActivity"];

export function allowed(session: Session, action: Action): boolean {
  if (session.kind === "guest") return GUEST_ALLOW.includes(action);
  if (session.role === "viewer") return VIEWER_ALLOW.includes(action);
  if (session.role === "content_admin") return CATALOG_ALLOW.includes(action);
  return SUPER_ALLOW.includes(action);
}

export function requireAction(session: Session, action: Action): void {
  if (!allowed(session, action)) throw new Error(`forbidden: ${action} requires higher role`);
}

/** Upgrade prompt copy (§18) — shown when guests hit a persisted feature. */
export const UPGRADE_PROMPT = "Sign in to save your favorites and continue watching across your devices.";

export function needsUpgradePrompt(session: Session, action: Action): boolean {
  return session.kind === "guest" && (["favorite", "save", "follow"] as Action[]).includes(action);
}
