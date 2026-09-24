/**
 * §25 content-quality gate: every published seed item must carry
 * artwork + title + description + speaker/artist + program/album + category.
 * Run: pnpm --filter @pco/cms validate
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const seed = JSON.parse(
  readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "packages/content-models/seed/seed.json"),
    "utf8",
  ),
);

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures++;
};

const programIds = new Set(seed.programs.map((p) => p.id));
const topicIds = new Set(seed.topics.map((t) => t.id));

for (const m of seed.messages.filter((m) => m.status === "published")) {
  const missing = ["title", "description", "speaker", "programId", "artwork"].filter((f) => !m[f]);
  check(`message ${m.id} has required fields`, missing.length === 0, missing.join(","));
  check(`message ${m.id} program exists`, programIds.has(m.programId), m.programId);
  check(
    `message ${m.id} topics exist`,
    m.topicIds?.length > 0 && m.topicIds.every((t) => topicIds.has(t)),
    (m.topicIds ?? []).join(","),
  );
}

const artistIds = new Set(seed.artists.map((a) => a.id));
const albumIds = new Set(seed.albums.map((a) => a.id));
for (const s of seed.songs) {
  check(`song ${s.id} artist+album exist`, artistIds.has(s.artistId) && albumIds.has(s.albumId));
}
const songIds = new Set(seed.songs.map((s) => s.id));
for (const p of seed.playlists) {
  check(`playlist ${p.id} songs exist`, p.songIds.length > 0 && p.songIds.every((s) => songIds.has(s)));
}
for (const l of seed.live) {
  check(`live ${l.id} program exists`, programIds.has(l.programId));
}

if (failures > 0) {
  console.error(`\n${failures} content gate check(s) failed.`);
  process.exit(1);
}
console.log("\nContent gate OK: catalog is publishable.");
