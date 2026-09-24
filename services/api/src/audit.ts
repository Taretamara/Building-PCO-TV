/** Append-only audit log. Super Admin reads it via viewActivity (§36). */

export interface AuditEntry {
  at: string;
  actorId: string;
  actorRole: string;
  action: string;
  target: string;
  detail?: string;
}

const entries: AuditEntry[] = [];

export function log(entry: Omit<AuditEntry, "at">): AuditEntry {
  const full: AuditEntry = { ...entry, at: new Date().toISOString() };
  entries.push(full);
  return full;
}

export function activity(limit = 100): AuditEntry[] {
  return entries.slice(-limit).reverse();
}

export function clearAudit(): void {
  entries.length = 0;
}
