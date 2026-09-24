/**
 * Phase 1 exit check: navigable shell with no dead-ends (plain node, no RN runtime).
 * - 7 tabs present, unique routes
 * - every seed item resolves to a detail route with a parent tab
 * - every home rail points at a valid tab
 * - every deep-link scheme parses back
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const routes = JSON.parse(readFileSync(join(root, "shell/routes.json"), "utf8"));
const seed = JSON.parse(
  readFileSync(join(root, "..", "..", "packages/content-models/seed/seed.json"), "utf8"),
);

let failures = 0;
const check = (name, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures++;
};

const EXPECTED_TABS = ["home", "messages", "music", "live", "programs", "favorites", "search"];
check("7 tabs", routes.tabs.length === 7 && EXPECTED_TABS.every((t) => routes.tabs.some((r) => r.id === t)));
check(
  "unique tab routes",
  new Set(routes.tabs.map((t) => t.route)).size === routes.tabs.length,
);

const detailById = new Map(routes.details.map((d) => [d.id, d]));
const seedTargets = [
  ...seed.messages.map((m) => ["message", m.id]),
  ...seed.programs.map((p) => ["program", p.id]),
  ...seed.artists.map((a) => ["artist", a.id]),
  ...seed.albums.map((a) => ["album", a.id]),
  ...seed.playlists.map((p) => ["playlist", p.id]),
  ...seed.live.map((l) => ["live", l.id]),
];
check(
  `all ${seedTargets.length} seed items have a detail route + parent tab`,
  seedTargets.every(([kind, id]) => {
    const d = detailById.get(kind);
    return !!d && !!d.parentTab && !!id && d.scheme.includes(":id");
  }),
);

const tabIds = new Set(routes.tabs.map((t) => t.id));
check(
  "home rails all point at valid tabs",
  routes.homeRails.every((r) => tabIds.has(r.sourceTab)),
);
check(
  "every detail has a Back target (parent tab exists)",
  routes.details.every((d) => tabIds.has(d.parentTab)),
);
check(
  "deep-link schemes parse (prefix + id)",
  routes.details.every((d) => {
    const prefix = d.scheme.split("/:id")[0];
    return d.scheme.startsWith("pco://") && prefix.length > "pco://".length;
  }),
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed — shell has dead-ends.`);
  process.exit(1);
}
console.log("\nShell OK: remote-only walkthrough possible, Back always works.");
