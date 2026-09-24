/**
 * Deterministic demo-library expansion (idempotent: skips ids that already exist).
 * Run: node services/cms/scripts/expand-seed.mjs
 * Targets: ~56 messages, 10 artists, 10 albums, ~32 songs, 6 playlists, 3 live.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const seedPath = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "packages/content-models/seed/seed.json");
const seed = JSON.parse(readFileSync(seedPath, "utf8"));

const TITLES = {
  "t-faith": ["Faith for the Harvest", "Unshakeable Faith", "Faith Speaks", "The Faith Life", "Faith and Patience", "Victorious Faith"],
  "t-healing": ["Healing Is Yours", "The Healing Anointing", "Walk in Divine Health", "Miracles Today", "Healing Words", "Wholeness for Families"],
  "t-prayer": ["The Prayer Life", "Praying in the Spirit", "Night of Prayer", "Prevailing Prayer", "Thanksgiving and Prayer", "Prayer for Nations"],
  "t-spirit": ["Led by the Spirit", "The Spirit of Wisdom", "Fellowship of the Spirit", "Gifts of the Spirit", "The Anointing", "Rivers of Living Water"],
  "t-living": ["The Excellent Life", "Walking in Love", "Integrity and Grace", "Daily Devotion", "Character of Christ", "Wisdom for Living"],
  "t-family": ["Godly Homes", "Raising Champions", "Marriage and Grace", "Blessing Your Children", "Family Altar", "Peace at Home"],
  "t-purpose": ["Your Divine Assignment", "Called and Chosen", "Finish Your Course", "Vision and Direction", "Excellence in Work", "Serving with Joy"],
  "t-evangelism": ["Win Your World", "The Soul Winner", "Love Takes Action", "Preach the Gospel", "Compassion in Action", "Harvest Time"],
};
const PROGRAMS = ["p-your-loveworld", "p-healing-streams", "p-communion"];

const haveMessages = new Set(seed.messages.map((m) => m.id));
let n = 9;
let day = 10;
for (const [topicId, titles] of Object.entries(TITLES)) {
  titles.forEach((title, i) => {
    const id = `m-${String(n).padStart(3, "0")}`;
    n++;
    if (haveMessages.has(id)) return;
    const programId = PROGRAMS[(n + i) % PROGRAMS.length];
    const month = String(1 + ((n + i) % 8)).padStart(2, "0");
    const status = id === "m-056" ? "draft" : id === "m-055" ? "scheduled" : "published";
    seed.messages.push({
      id,
      title,
      description: `${title} — teaching with Pastor Chris Oyakhilome.`,
      speaker: "Pastor Chris Oyakhilome",
      programId,
      topicIds: [topicId],
      publishedAt: `2026-${month}-${String(day).padStart(2, "0")}`,
      durationSec: 1500 + ((n * 137) % 2100),
      artwork: "16:9",
      status,
    });
    day = (day % 27) + 1;
  });
}

const ARTISTS = ["Eternal Sound", "Psalms Collective", "Hosanna Voices", "Covenant Music", "New Wine Band", "Shalom Singers", "Kingdom Anthem"];
for (const name of ARTISTS) {
  const id = `a-${String(seed.artists.length + 1).padStart(3, "0")}`;
  if (seed.artists.some((a) => a.name === name)) continue;
  seed.artists.push({ id, name, bio: `${name} — LoveWorld music ministry.`, artwork: "1:1" });
}

const ALBUM_DEFS = [
  ["Praise Rising", 0], ["Songs of Devotion", 1], ["Joyful Noise", 2], ["Hymns Renewed", 3],
  ["Overflow", 4], ["Glory Sound", 5], ["Testimony", 6], ["Selah Moments", 7],
];
for (const [title, artistIdx] of ALBUM_DEFS) {
  if (seed.albums.some((a) => a.title === title)) continue;
  const id = `al-${String(seed.albums.length + 1).padStart(3, "0")}`;
  const artist = seed.artists[artistIdx % seed.artists.length];
  seed.albums.push({ id, artistId: artist.id, title, artwork: "1:1", releaseDate: `2026-0${1 + (seed.albums.length % 8)}-15` });
}

const SONG_WORDS = ["Hallelujah", "Amen", "Glory", "Grace", "Mercy", "Shout", "Rejoice", "Holy", "Worthy", "Triumph", "Emmanuel", "Jubilee"];
let s = seed.songs.length + 1;
for (const album of seed.albums) {
  const existing = seed.songs.filter((x) => x.albumId === album.id).length;
  for (let k = existing; k < 3; k++) {
    const id = `s-${String(s).padStart(3, "0")}`;
    s++;
    seed.songs.push({
      id,
      albumId: album.id,
      artistId: album.artistId,
      title: `${SONG_WORDS[(s * 7) % SONG_WORDS.length]} ${SONG_WORDS[(s * 3) % SONG_WORDS.length]}`,
      durationSec: 170 + ((s * 53) % 140),
    });
  }
}

const NEW_PLAYLISTS = [
  ["Praise", ["s-005", "s-006", "s-007"]],
  ["Evening Worship", ["s-008", "s-009", "s-010"]],
  ["Pastor Chris Recommended", ["s-001", "s-005", "s-009"]],
];
for (const [title, songIds] of NEW_PLAYLISTS) {
  if (seed.playlists.some((p) => p.title === title)) continue;
  const valid = songIds.filter((id) => seed.songs.some((x) => x.id === id));
  seed.playlists.push({ id: `pl-${String(seed.playlists.length + 1).padStart(3, "0")}`, title, type: "curated", songIds: valid, artwork: "1:1" });
}

if (!seed.live.some((l) => l.id === "l-003")) {
  seed.live.push({ id: "l-003", title: "Global Communion Service", status: "scheduled", scheduledAt: "2026-10-05T18:00:00Z", programId: "p-communion", artwork: "16:9" });
}

writeFileSync(seedPath, JSON.stringify(seed, null, 2) + "\n");
console.log(
  `seed: ${seed.messages.length} messages, ${seed.artists.length} artists, ${seed.albums.length} albums, ${seed.songs.length} songs, ${seed.playlists.length} playlists, ${seed.live.length} live`,
);
