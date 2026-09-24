import { log } from "./audit";
import { allowed, type Action, type Session } from "./auth";

/**
 * Permission hardening: every privileged call routes through guard().
 * Denials are audit-logged (who tried what) — UI gating alone is not trusted.
 */
export function guard<T>(session: Session, action: Action, fn: () => T): T {
  if (!allowed(session, action)) {
    log({
      actorId: session.kind === "user" ? session.userId : `guest:${session.deviceId}`,
      actorRole: session.kind === "user" ? session.role : "guest",
      action: `denied:${action}`,
      target: "api",
    });
    throw new Error(`forbidden: ${action}`);
  }
  return fn();
}

/** Content Admin+ only (catalog, curation, live scheduling). */
export function adminOnly<T>(session: Session, fn: () => T): T {
  return guard(session, "manageCatalog", fn);
}

/** Super Admin only (users, admins, settings, activity). */
export function superOnly<T>(session: Session, fn: () => T): T {
  return guard(session, "manageAdmins", fn);
}
