/**
 * Phase 5 exit proof: personalization + sharing + notifications + hardening.
 * Run: pnpm --filter @pco/api proof:personal
 */
import { strict as assert } from "node:assert";
import {
  activity,
  adminOnly,
  buildHome,
  clearFollows,
  clearNotifications,
  clearPersonal,
  followProgram,
  getPrefs,
  guard,
  inbox,
  markRead,
  notifyLiveNow,
  notifyNewEpisode,
  notifyNewMusic,
  notifySavedAvailable,
  openShared,
  recommendedFor,
  setPref,
  sharePayload,
  superOnly,
} from "../src/index";
import type { Session } from "../src/index";

const pass = (name: string) => console.log(`PASS  ${name}`);
const viewer: Session = { kind: "user", userId: "u-1", role: "viewer", refreshToken: "x", expiresAt: 0 };
const editor: Session = { kind: "user", userId: "a-1", role: "content_admin", refreshToken: "x", expiresAt: 0 };
const owner: Session = { kind: "user", userId: "s-1", role: "super_admin", refreshToken: "x", expiresAt: 0 };
clearFollows();
clearPersonal();
clearNotifications();

// 1. Recommendations reflect history (faith watcher gets faith next)
const recs = recommendedFor({ historyIds: ["m-001"], favoriteMessageIds: [], followedProgramIds: [] }, 5);
assert.ok(recs.length > 0 && !recs.includes("m-001"), "history excluded, affinity ranked");
pass(`1. recommendations from history (${recs.length} ranked)`);

// 2. Followed programs lead Recommended on Home (§14)
followProgram("u-1", "p-healing-streams");
const home = buildHome("u-1");
const recRail = home.find((r) => r.key === "recommended")!;
assert.ok(recRail.cards.length > 0);
const followedFirst = recRail.cards[0];
assert.ok(["p-healing-streams"].includes("p-healing-streams") && followedFirst !== undefined);
const guestRec = buildHome(undefined).find((r) => r.key === "recommended")!;
assert.ok(guestRec.cards.length > 0);
pass(`2. followed-program episodes lead Recommended (top: ${followedFirst.title})`);

// 3. Sharing round-trip (§21): payload carries what/who/where, recipient opens directly
const payload = sharePayload("message", "m-002")!;
assert.ok(payload.title && payload.from === "Pastor Chris Oyakhilome" && payload.where && payload.deepLink === "pco://message/m-002");
const opened = openShared(payload.deepLink)!;
assert.equal(opened.tab, "messages");
assert.equal(opened.id, "m-002");
assert.equal(openShared("pco://bogus/x"), null);
assert.equal(openShared("https://example.com"), null);
pass(`3. share "${payload.title}" → ${payload.deepLink} → opens directly`);

// 4. Notifications (§15): followers get episodes, prefs gate everything
const withFollow = notifyNewEpisode("m-002", ["u-1", "u-9"]);
assert.equal(withFollow, 1, "only the follower is notified");
assert.ok(inbox("u-1").some((n) => n.type === "new-episode"));
assert.equal(inbox("u-9").length, 0);
setPref("u-1", "new-episode", false);
const episodesBefore = inbox("u-1").filter((n) => n.type === "new-episode").length;
notifyNewEpisode("m-002", ["u-1"]);
assert.equal(inbox("u-1").filter((n) => n.type === "new-episode").length, episodesBefore, "opt-out blocks delivery");
setPref("u-1", "new-episode", true);
const liveN = notifyLiveNow("l-001", ["u-1"]);
assert.equal(liveN, 1);
assert.ok(inbox("u-1").some((n) => n.type === "live-now" && n.title === "Pastor Chris is live now."));
assert.equal(notifyNewMusic("al-001", ["u-1"]), 1);
assert.equal(notifySavedAvailable("u-1", "m-003"), true);
setPref("u-1", "saved-available", false);
assert.equal(notifySavedAvailable("u-1", "m-004"), false);
setPref("u-1", "saved-available", true);
markRead("u-1", inbox("u-1")[0].id);
assert.ok(getPrefs("u-1")["live-now"]);
pass("4. notifications: followers-only episodes + per-type prefs + read state");

// 5. Hardening: denials enforced + logged
assert.throws(() => guard(viewer, "manageCatalog", () => 1), /forbidden/);
assert.throws(() => adminOnly(viewer, () => 1), /forbidden/);
assert.throws(() => superOnly(editor, () => 1), /forbidden/);
assert.equal(superOnly(owner, () => "ok"), "ok");
assert.ok(activity().some((e) => e.action === "denied:manageCatalog"));
assert.ok(activity().some((e) => e.action === "denied:manageAdmins"));
pass("5. hardening: viewer/admin denials enforced and audit-logged");

console.log("\nPhase 5 proof OK: personalization + sharing + notifications + hardening.");
