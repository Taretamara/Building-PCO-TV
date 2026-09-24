import type { Role } from "@pco/content-models";
import { activity } from "./audit";
import { log } from "./audit";
import { requireAction, type Session } from "./auth";

/**
 * Super Admin workflows (§36): manage users/admins, roles, platform settings,
 * view platform activity. Content Admins are denied at every entry point.
 */
export interface UserRecord {
  id: string;
  email: string;
  displayName: string;
  role: Role;
}

const seedUsers: UserRecord[] = [
  { id: "u-1", email: "viewer@example.com", displayName: "Viewer", role: "viewer" },
  { id: "a-1", email: "editor@example.com", displayName: "Editor", role: "content_admin" },
  { id: "s-1", email: "owner@example.com", displayName: "Owner", role: "super_admin" },
];
const users = new Map<string, UserRecord>(seedUsers.map((u) => [u.id, u]));

let userCounter = 100;

export function listUsers(session: Session): UserRecord[] {
  requireAction(session, "manageUsers");
  return [...users.values()];
}

export function createAdmin(session: Session, email: string, displayName: string): UserRecord {
  requireAction(session, "manageAdmins");
  const rec: UserRecord = { id: `a-${userCounter++}`, email, displayName, role: "content_admin" };
  users.set(rec.id, rec);
  log({ actorId: idOf(session), actorRole: roleOf(session), action: "admin.create", target: rec.id, detail: email });
  return rec;
}

export function setRole(session: Session, userId: string, role: Role): UserRecord {
  requireAction(session, "manageAdmins");
  const rec = users.get(userId);
  if (!rec) throw new Error(`not found: ${userId}`);
  if (rec.role === "super_admin" && role !== "super_admin") {
    const supers = [...users.values()].filter((u) => u.role === "super_admin");
    if (supers.length <= 1) throw new Error("cannot demote the last super admin");
  }
  rec.role = role;
  log({ actorId: idOf(session), actorRole: roleOf(session), action: "admin.setRole", target: userId, detail: role });
  return rec;
}

export function removeAdmin(session: Session, userId: string): void {
  requireAction(session, "manageAdmins");
  const rec = users.get(userId);
  if (!rec) throw new Error(`not found: ${userId}`);
  if (rec.role !== "content_admin") throw new Error("only content admins can be removed here");
  users.delete(userId);
  log({ actorId: idOf(session), actorRole: roleOf(session), action: "admin.remove", target: userId });
}

const settings = new Map<string, string>([
  ["home.maxRails", "7"],
  ["notifications.liveNow", "on"],
  ["content.defaultStatus", "draft"],
]);

export function getSettings(session: Session): Record<string, string> {
  requireAction(session, "manageSettings");
  return Object.fromEntries(settings);
}

export function setSetting(session: Session, key: string, value: string): void {
  requireAction(session, "manageSettings");
  settings.set(key, value);
  log({ actorId: idOf(session), actorRole: roleOf(session), action: "settings.set", target: key, detail: value });
}

export function viewActivity(session: Session, limit = 50) {
  requireAction(session, "viewActivity");
  return activity(limit);
}

function idOf(s: Session): string {
  return s.kind === "user" ? s.userId : `guest:${s.deviceId}`;
}
function roleOf(s: Session): string {
  return s.kind === "user" ? s.role : "guest";
}
