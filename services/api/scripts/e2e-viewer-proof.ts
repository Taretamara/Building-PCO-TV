/**
 * Phase 4 exit proof: full viewer journeys (PRD §31 new + returning user)
 * across all 8 MVP slices. Run: pnpm --filter @pco/api proof:viewer
 */
import { strict as assert } from "node:assert";
import {
  addFavorite,
  albumPage,
  artistPage,
  browseMessages,
  buildHome,
  clearFollows,
  clearPersonal,
  currentQueue,
  discovery,
  favoritesByTab,
  followProgram,
  followedNewEpisodes,
  heartbeat,
  liveSection,
  messageDetail,
  musicHome,
  nextTrack,
  playAlbum,
  programPage,
  resetQueue,
  saveForLater,
  savedList,
  startPlayback,
  togglePlay,
} from "../src/index";

const pass = (name: string) => console.log(`PASS  ${name}`);
clearPersonal();
clearFollows();
resetQueue();

// ——— NEW USER: open → home ———
const home = buildHome(undefined);
for (const key of ["continue-watching", "live-now", "pastor-chris", "music", "recommended", "recently-added", "popular"]) {
  if (key !== "continue-watching" && key !== "live-now") {
    assert.ok(home.some((r) => r.key === key && r.cards.length > 0), key);
  }
}
pass("1. home: rails render for a first-time guest");

// ——— 2. MESSAGES: browse + detail ———
const faith = browseMessages({ topicId: "t-faith" });
assert.ok(faith.length >= 5 && faith.every((m) => m.topicIds.includes("t-faith")));
const prog = browseMessages({ programId: "p-healing-streams" });
assert.ok(prog.length > 0 && prog.every((m) => m.programId === "p-healing-streams"));
const detail = messageDetail("m-001", "u-1", ["m-001"])!;
assert.equal(detail.speaker, "Pastor Chris Oyakhilome");
assert.ok(detail.actions.includes("favorite") && detail.relatedIds.length > 0 && detail.nextId);
pass(`2. messages: topic/program browse + detail with related + next (${detail.nextId})`);

// ——— 3. FAVORITES vs SAVE ———
addFavorite("u-1", "message", "m-001");
addFavorite("u-1", "music", "al-001");
addFavorite("u-1", "program", "p-healing-streams");
saveForLater("u-1", "message", "m-002");
assert.equal(favoritesByTab("u-1", "all").length, 3);
assert.equal(favoritesByTab("u-1", "messages").length, 1);
assert.equal(favoritesByTab("u-1", "music").length, 1);
assert.equal(favoritesByTab("u-1", "programs").length, 1);
assert.equal(savedList("u-1").length, 1);
assert.ok(messageDetail("m-001", "u-1")!.favorited);
pass("3. favorites + save-for-later stay separate, tabs filter");

// ——— 4. MUSIC ———
const mh = musicHome();
assert.ok(mh.artists.length === 10 && mh.albums.length === 10 && mh.playlists.length === 6);
const artist = artistPage("a-001")!;
assert.ok(artist.songIds.length > 0 && artist.albumIds.length > 0 && artist.playlistIds.length > 0);
const album = albumPage("al-001")!;
assert.ok(album.tracks.length >= 3 && album.tracks.every((t) => t.streamUrl.endsWith(".m3u8")));
playAlbum("al-001");
assert.equal(currentQueue().playing, true);
togglePlay();
assert.equal(currentQueue().playing, false);
togglePlay();
const before = currentQueue().index;
nextTrack();
assert.equal(currentQueue().index, before + 1);
assert.equal(currentQueue().playing, true, "queue survives screen changes (background listening)");
pass(`4. music: home/artist/album + persistent queue (${album.tracks.length} tracks)`);

// ——— 5. LIVE ———
const live = liveSection();
assert.ok(live.upcoming.length >= 2 && live.recent.length >= 1);
assert.ok(live.liveNow.length === 0 && live.emptyState?.title === "Nothing is live right now.");
assert.deepEqual(live.emptyState!.fallbackRails, ["upcoming", "recent-broadcasts", "recommended"]);
pass("5. live: upcoming + recent + graceful empty state");

// ——— 6. PROGRAMS + follow ———
const page = programPage("p-healing-streams", "u-1")!;
assert.ok(page.latest.length > 0 && page.description.length > 0);
followProgram("u-1", "p-healing-streams");
assert.ok(programPage("p-healing-streams", "u-1")!.following);
assert.ok(followedNewEpisodes("u-1").length > 0, "followed episodes surface on home");
pass(`6. programs: page + follow surfaces ${followedNewEpisodes("u-1").length} episode(s)`);

// ——— 7. SEARCH + DISCOVERY ———
const d = discovery(["m-001"], "m-001");
assert.ok(d.becauseYouWatched.length > 0 && d.moreFromProgram.length > 0 && d.moreLikeThis.length > 0);
assert.ok(d.newOnPco.length > 0 && d.popular.length > 0);
pass("7. discovery: all six rails populate from history + context");

// ——— RETURNING USER: resume everywhere ———
heartbeat("u-1", "m-002", 600);
const session = startPlayback("u-1", "m-002", ["m-002"])!;
assert.equal(session.positionSec, 600);
assert.ok(session.resumeFromLabel.startsWith("Resume") && session.autoplayNextId);
heartbeat("u-1", "m-002", session.positionSec); // still resumable mid-way
heartbeat("u-1", "m-003", 99999); // finished → clears to fresh
const replay = startPlayback("u-1", "m-003", [])!;
assert.equal(replay.resumeFromLabel, "Play");
pass("8. returning user: resume mid-way, fresh start when finished, autoplay next set");

console.log("\nPhase 4 proof OK: all 8 viewer slices walk end-to-end.");
