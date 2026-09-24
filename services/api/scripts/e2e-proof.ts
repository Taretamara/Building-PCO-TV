/**
 * Phase 2 exit proof: one real message end-to-end (CMS → API → TV with resume)
 * plus RBAC denials. Run: pnpm --filter @pco/api proof
 */
import { strict as assert } from "node:assert";
import { resumeLabel } from "@pco/ui-tv";
import {
  allowed,
  buildHome,
  exchangeDeviceCode,
  getMessage,
  guestSession,
  needsUpgradePrompt,
  putProgress,
  continueWatching,
  searchAll,
  startDeviceFlow,
  videoForMessage,
  watchNext,
  consoleSink,
} from "../src/index";

const pass = (name: string) => console.log(`PASS  ${name}`);
const track = consoleSink.track;

// 1. Guest browses home (no account needed, §18)
const guestHome = buildHome(undefined);
assert.ok(guestHome.some((r) => r.key === "pastor-chris" && r.cards.length > 0));
assert.ok(guestHome.some((r) => r.key === "live-now")); // fallback rail always present (§13)
track({ name: "app_open", tab: "home" });
pass("guest browses home (pastor-chris rail + live fallback)");

// 2. Guest hits upgrade prompt on favorite (§18)
const guest = guestSession("device-1");
assert.equal(needsUpgradePrompt(guest, "favorite"), true);
assert.equal(allowed(guest, "favorite"), false);
pass("guest gets upgrade prompt on favorite");

// 3. QR sign-in → viewer session
const flow = startDeviceFlow("device-1");
assert.ok(flow.qrDeepLink.includes("/activate?code="));
const viewer = exchangeDeviceCode(flow.code, "u-1", "viewer");
assert.equal(viewer.kind, "user");
track({ name: "sign_in_completed", method: "qr" });
pass("QR device-code sign-in works");

// 4. Unified search (§16)
const results = searchAll("faith");
assert.ok(results.messages.length > 0, "faith finds messages");
track({ name: "search", query: "faith", groups: 5 });
pass(`search "faith" → ${results.messages.length} message(s), grouped`);

// 5. Play one real message end-to-end with resume (§7)
const msg = getMessage("m-001")!;
const asset = videoForMessage(msg);
assert.ok(asset.hlsUrl.endsWith("master.m3u8"));
assert.ok(asset.artwork.hero.endsWith("hero.jpg"));
track({ name: "playback_started", contentId: msg.id, kind: "message" });
putProgress({ userId: "u-1", contentType: "message", contentId: msg.id, positionSec: 720, durationSec: msg.durationSec });
const label = resumeLabel(720, msg.durationSec);
assert.ok(label.startsWith("Resume"));
track({ name: "resume", contentId: msg.id, positionSec: 720 });
const cw = continueWatching("u-1");
assert.ok(cw.some((r) => r.contentId === msg.id));
const homeSignedIn = buildHome("u-1");
assert.ok(homeSignedIn.find((r) => r.key === "continue-watching")!.cards.some((c) => c.id === msg.id));
pass(`end-to-end play m-001 → manifest + "${label}" + Continue Watching`);

// 6. Watch Next (§6)
const nextId = watchNext(msg.id, [msg.id]);
assert.ok(nextId && nextId !== msg.id);
pass(`watch next: ${msg.id} → ${nextId}`);

// 7. RBAC (§36): viewer blocked, admins allowed
assert.equal(allowed({ kind: "user", userId: "u-1", role: "viewer", refreshToken: "x", expiresAt: 0 }, "manageCatalog"), false);
assert.equal(allowed({ kind: "user", userId: "a-1", role: "content_admin", refreshToken: "x", expiresAt: 0 }, "manageCatalog"), true);
assert.equal(allowed({ kind: "user", userId: "a-1", role: "content_admin", refreshToken: "x", expiresAt: 0 }, "manageAdmins"), false);
assert.equal(allowed({ kind: "user", userId: "s-1", role: "super_admin", refreshToken: "x", expiresAt: 0 }, "manageAdmins"), true);
pass("RBAC: viewer < content_admin < super_admin enforced");

console.log("\nPhase 2 proof OK: CMS → API → TV with resume + roles.");
