/**
 * Phase 3 exit proof: a non-engineer-equivalent flow —
 * draft → validate → publish → feature on Home, plus Super Admin user/role/settings/activity.
 * Run: pnpm --filter @pco/api proof:admin
 */
import { strict as assert } from "node:assert";
import {
  activity,
  archiveMessage,
  buildHome,
  createAdmin,
  createMessage,
  featuredMessages,
  featureMessage,
  getSettings,
  listUsers,
  publishMessage,
  removeAdmin,
  setRole,
  setSetting,
  viewActivity,
} from "../src/index";
import type { Session } from "../src/index";

const pass = (name: string) => console.log(`PASS  ${name}`);
const viewer: Session = { kind: "user", userId: "u-1", role: "viewer", refreshToken: "x", expiresAt: 0 };
const editor: Session = { kind: "user", userId: "a-1", role: "content_admin", refreshToken: "x", expiresAt: 0 };
const owner: Session = { kind: "user", userId: "s-1", role: "super_admin", refreshToken: "x", expiresAt: 0 };

// 1. Viewer cannot publish (denied before validation)
assert.throws(() => publishMessage(viewer, "m-001"), /forbidden/);
pass("viewer cannot publish (RBAC denies first)");

// 2. Draft with missing fields is rejected with a clear list (non-engineer friendly)
assert.throws(
  () => createMessage(editor, { title: "", description: "", speaker: "", programId: "nope", topicIds: [], durationSec: 0 }),
  /unpublishable: missing/,
);
pass("incomplete draft rejected with missing-field list");

// 3. Complete draft → publish → feature on Home
const draft = createMessage(editor, {
  title: "Faith for This Week",
  description: "A midweek charge to walk by faith.",
  speaker: "Pastor Chris Oyakhilome",
  programId: "p-your-loveworld",
  topicIds: ["t-faith"],
  artwork: "16:9",
  videoAssetId: "upload-123",
  durationSec: 2400,
});
assert.equal(draft.status, "draft");
const published = publishMessage(editor, draft.id);
assert.equal(published.status, "published");
featureMessage(editor, draft.id, 1);
const top = featuredMessages(3);
assert.ok(top[0].id === draft.id, "featured message leads the rail");
const home = buildHome(undefined);
assert.ok(home.some((r) => r.cards.some((c) => c.id === draft.id)));
pass(`publish + feature: ${draft.id} leads Home rails`);

// 4. Archive removes from viewer surfaces
archiveMessage(editor, draft.id);
assert.ok(!buildHome(undefined).some((r) => r.cards.some((c) => c.id === draft.id)));
pass("archive removes message from Home");

// 5. Super Admin: users, roles, settings, activity
assert.equal(listUsers(owner).length >= 3, true);
const admin = createAdmin(owner, "new@example.com", "New Editor");
assert.equal(admin.role, "content_admin");
assert.throws(() => createAdmin(editor, "x@example.com", "X"), /forbidden/);
setRole(owner, admin.id, "content_admin");
removeAdmin(owner, admin.id);
assert.throws(() => setRole(owner, "s-1", "viewer"), /last super admin/);
setSetting(owner, "notifications.liveNow", "on");
assert.equal(getSettings(owner)["notifications.liveNow"], "on");
assert.throws(() => viewActivity(editor), /forbidden/);
assert.ok(viewActivity(owner).length > 0);
assert.ok(activity().some((e) => e.action === "message.publish"));
pass("super admin: users/roles/settings/activity, last-super-admin protected");

console.log("\nPhase 3 proof OK: publish → feature → Home, roles enforced, activity logged.");
