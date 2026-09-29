/* PCO TV PWA — test-data app. Device profiles, no accounts, no backend. */
const TABS = ["Home", "Messages", "Music", "Live", "Programs", "Favorites", "Search"];
const DEFAULT_PROFILES = [
  { id: "tare", name: "Tare", color: "#D9A441" },
  { id: "mom", name: "Mom", color: "#7FB2E5" },
  { id: "dad", name: "Dad", color: "#7FD6B2" },
  { id: "kids", name: "Kids", color: "#E8AFAF" },
];
function profiles() { return JSON.parse(localStorage.getItem("pco.profiles") || "null") || DEFAULT_PROFILES; }
function activeId() { return localStorage.getItem("pco.activeProfile") || ""; }
function activeProfile() { return profiles().find((p) => p.id === activeId()); }
const K = (k) => `pco.${activeId()}.${k}`;
const store = {
  get favs() { return JSON.parse(localStorage.getItem(K("favs")) || "[]"); },
  set favs(v) { localStorage.setItem(K("favs"), JSON.stringify(v)); },
  get saved() { return JSON.parse(localStorage.getItem(K("saved")) || "[]"); },
  set saved(v) { localStorage.setItem(K("saved"), JSON.stringify(v)); },
  get progress() { return JSON.parse(localStorage.getItem(K("progress")) || "{}"); },
  set progress(v) { localStorage.setItem(K("progress"), JSON.stringify(v)); },
  get follows() { return JSON.parse(localStorage.getItem(K("follows")) || "[]"); },
  set follows(v) { localStorage.setItem(K("follows"), JSON.stringify(v)); },
};
/** One-time migration: old device-wide data + premium flag move into the first profile. */
function migrateLegacy() {
  if (localStorage.getItem("pco.profiles")) return;
  localStorage.setItem("pco.profiles", JSON.stringify(DEFAULT_PROFILES));
  // Returning device? Move old device-wide data into Tare and stay signed in.
  // Fresh device? Leave no active profile so the picker shows.
  let returning = false;
  for (const k of ["favs", "saved", "progress", "follows", "premium"]) {
    const old = localStorage.getItem(`pco.${k}`);
    if (old !== null) {
      localStorage.setItem(`pco.tare.${k}`, old);
      localStorage.removeItem(`pco.${k}`);
      returning = true;
    }
  }
  if (returning) localStorage.setItem("pco.activeProfile", "tare");
}
let DB = null, tab = "Home", topicFilter = "", query = "";
let queue = { ids: [], i: 0 };

const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
const TRAILER_SEC = 60;   // message hover preview length
const MUSIC_PREVIEW_SEC = 8; // music hover preview length
let MANIFEST = { artwork: {}, trailers: {}, previews: {} };

function hashStr(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

/* Generated cover art (offline, deterministic). A real file listed in
   media/manifest.json always wins — see media/README.md. */
function artwork(id, title, music) {
  if (MANIFEST.artwork[id]) return `url("${MANIFEST.artwork[id]}")`;
  const h = hashStr(id) % 360, h2 = (h + (music ? 70 : 45)) % 360;
  const initial = (title || "?").trim()[0].toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="270">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${h},45%,32%)"/><stop offset="1" stop-color="hsl(${h2},50%,18%)"/></linearGradient></defs>` +
    `<rect width="480" height="270" fill="url(#g)"/>` +
    `<circle cx="400" cy="40" r="120" fill="hsl(${h2},60%,40%)" opacity="0.35"/>` +
    `<circle cx="60" cy="240" r="90" fill="hsl(${h},60%,45%)" opacity="0.3"/>` +
    `<text x="36" y="200" font-family="Arial,sans-serif" font-size="150" font-weight="bold" fill="rgba(255,255,255,0.85)">${initial}</text>` +
    (music ? `<circle cx="420" cy="210" r="34" fill="rgba(0,0,0,0.45)"/><path d="M412 190 L440 210 L412 230 Z" fill="#F2C66B"/>` : ``) +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* Thumbs carry data-art; hydration sets the picture (keeps templates readable). */
function hydrateArtwork(root) {
  (root || document).querySelectorAll(".thumb[data-art]").forEach((t) => {
    if (t.dataset.done) return;
    const [id, title, m] = t.dataset.art.split("‖");
    t.style.backgroundImage = artwork(id, title, m === "1");
    t.classList.add("art");
    t.dataset.done = "1";
  });
}
const thumb = (id, title, music, inner) =>
  `<div class="thumb" data-art="${id}‖${(title || "").replace(/"/g, "")}‖${music ? 1 : 0}">${inner || ""}</div>`;
const mins = (s) => Math.round(s / 60) + " min";
const progName = (id) => DB.programs.find((p) => p.id === id)?.title || id;
const topicName = (id) => DB.topics.find((t) => t.id === id)?.name || id;

function card(m, badge) {
  const p = store.progress[m.id];
  const pct = p ? Math.round((p.pos / m.durationSec) * 100) : 0;
  return el(`<button class="card" data-open="${m.id}" data-pv="msg:${m.id}">
    ${thumb(m.id, m.title, false, badge ? `<span class="badge ${badge === "NEW" ? "new" : ""}">${badge}</span>` : "")}
    <div class="meta"><b>${m.title}</b><div>${m.speaker} · ${mins(m.durationSec)}</div>
    ${pct ? `<div class="progress"><i style="width:${pct}%"></i></div>` : ""}</div></button>`);
}
const rail = (title, sub, nodes) => {
  const s = el(`<section><h2>${title} <small>${sub}</small></h2><div class="rail"></div></section>`);
  const r = s.querySelector(".rail");
  nodes.forEach((n) => r.append(n));
  return s;
};

function renderTabs() {
  const nav = document.getElementById("tabs");
  nav.innerHTML = "";
  TABS.forEach((t) => {
    const b = el(`<button role="tab" aria-selected="${t === tab}">${t}</button>`);
    b.onclick = () => { tab = t; render(); window.scrollTo(0, 0); };
    nav.append(b);
  });
}

function render() {
  stopPreview();
  renderTabs();
  const s = document.getElementById("screen");
  s.innerHTML = "";
  ({ Home, Messages, Music, Live, Programs, Favorites, Search })[tab](s);
  s.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
  hydrateArtwork(s);
  wirePreviews(s);
}

function Home(s) {
  const msgs = DB.messages.filter((m) => m.status === "published");
  const recent = [...msgs].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
  const cwIds = Object.keys(store.progress);
  const premium = isPremium();
  const who = activeProfile()?.name.toUpperCase() || "FRIEND";
  const hero = el(`<div class="hero"><div class="kicker">WELCOME BACK, ${who} ${premium ? "· ★ PREMIUM" : ""}</div>
    <h1>Turn on. Find something meaningful. Watch.</h1>
    <p>Pastor Chris messages, LoveWorld music, and live programming.</p>
    <div class="rowbtns"><button class="btn primary" id="hero-play">▶ Continue Watching</button>
    ${premium ? "" : `<button class="btn" id="hero-sub">★ Subscribe — ₦1,500/mo (test)</button>`}</div></div>`);
  s.append(hero);
  hero.querySelector("#hero-play").onclick = () => cwIds.length && openDetail(cwIds[0]);
  const subBtn = hero.querySelector("#hero-sub");
  if (subBtn) subBtn.onclick = openSubscribe;
  if (cwIds.length) {
    s.append(rail("Continue Watching", "resume where you stopped",
      cwIds.map((id) => DB.messages.find((m) => m.id === id)).filter(Boolean).map((m) => card(m))));
  }
  const live = DB.live.find((l) => l.status === "live");
  s.append(rail("Live Now", live ? "on air" : "nothing live — upcoming below",
    (live ? [live] : DB.live.filter((l) => l.status === "scheduled"))
      .map((l) => el(`<button class="card" data-live="${l.id}"><div class="thumb" data-art="${l.id}‖${l.title}‖0"><span class="badge">${l.status === "live" ? "● LIVE" : "UPCOMING"}</span></div><div class="meta"><b>${l.title}</b><div>${progName(l.programId)}</div></div></button>`))));
  s.append(rail("Pastor Chris", "messages", recent.slice(0, 8).map((m) => card(m))));
  s.append(rail("LoveWorld Music", "curated playlists",
    DB.playlists.map((p) => el(`<button class="card" data-pl="${p.id}"><div class="thumb" data-art="${p.id}‖${p.title}‖1"></div><div class="meta"><b>${p.title}</b><div>${p.songIds.length} songs</div></div></button>`))));
  s.querySelectorAll("[data-live]").forEach((b) => (b.onclick = () => openLive(b.dataset.live)));
  s.querySelectorAll("[data-pl]").forEach((b) => (b.onclick = () => openPlaylist(b.dataset.pl)));
}

function Messages(s) {
  const chips = el(`<div class="chips"></div>`);
  ["", ...DB.topics].forEach((t) => {
    const b = el(`<button aria-pressed="${(t.id || "") === topicFilter}">${t ? t.name : "All"}</button>`);
    b.onclick = () => { topicFilter = t.id || ""; render(); };
    chips.append(b);
  });
  s.append(el(`<h2>Messages</h2>`), chips);
  const list = DB.messages.filter((m) => m.status === "published" && (!topicFilter || m.topicIds.includes(topicFilter)));
  const r = el(`<div class="rail" style="grid-auto-flow:row;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));display:grid"></div>`);
  list.forEach((m) => r.append(card(m)));
  s.append(r);
}

function Music(s) {
  s.append(rail("Playlists", "curated",
    DB.playlists.map((p) => el(`<button class="card" data-pl="${p.id}"><div class="thumb" data-art="${p.id}‖${p.title}‖1"></div><div class="meta"><b>${p.title}</b><div>${p.songIds.length} songs</div></div></button>`))));
  s.append(rail("Artists", "",
    DB.artists.map((a) => el(`<button class="card" data-artist="${a.id}"><div class="thumb" data-art="${a.id}‖${a.name}‖1"></div><div class="meta"><b>${a.name}</b><div>${a.bio}</div></div></button>`))));
  s.querySelectorAll("[data-pl]").forEach((b) => (b.onclick = () => openPlaylist(b.dataset.pl)));
  s.querySelectorAll("[data-artist]").forEach((b) => (b.onclick = () => {
    const a = DB.artists.find((x) => x.id === b.dataset.artist);
    const songs = DB.songs.filter((x) => x.artistId === a.id);
    openSheet(`${a.name}`, `<p style="color:var(--muted)">${a.bio}</p>` +
      songs.map((x) => `<div class="chips"><button data-play="${x.id}">▶ ${x.title}</button></div>`).join(""));
  }));
}

function Live(s) {
  const now = DB.live.filter((l) => l.status === "live");
  const up = DB.live.filter((l) => l.status === "scheduled");
  const rec = DB.live.filter((l) => l.status === "ended");
  if (!now.length) {
    s.append(el(`<div class="empty" style="margin-top:14px"><b style="color:var(--text)">Nothing is live right now.</b><br>Catch up below — upcoming and recent broadcasts.</div>`));
  }
  const mk = (arr, badge) => arr.map((l) => el(`<button class="card" data-live="${l.id}"><div class="thumb" data-art="${l.id}‖${l.title}‖0"><span class="badge">${badge}</span></div><div class="meta"><b>${l.title}</b><div>${progName(l.programId)}</div></div></button>`));
  if (now.length) s.append(rail("Live Now", "", mk(now, "● LIVE")));
  s.append(rail("Upcoming", "", mk(up, "UPCOMING")));
  s.append(rail("Recently Live", "", mk(rec, "RECENT")));
  s.querySelectorAll("[data-live]").forEach((b) => (b.onclick = () => openLive(b.dataset.live)));
}

function Programs(s) {
  DB.programs.forEach((p) => {
    const eps = DB.messages.filter((m) => m.programId === p.id && m.status === "published");
    const following = store.follows.includes(p.id);
    const sec = el(`<section><h2>${p.title} <small>${eps.length} episodes ${following ? "· Following ✓" : ""}</small></h2><p style="color:var(--muted)">${p.description}</p><div class="rowbtns"><button class="btn" data-follow="${p.id}">${following ? "Unfollow" : "Follow program"}</button></div><div class="rail"></div></section>`);
    eps.slice(0, 6).forEach((m) => sec.querySelector(".rail").append(card(m)));
    s.append(sec);
  });
  s.querySelectorAll("[data-follow]").forEach((b) => (b.onclick = () => {
    const f = store.follows, id = b.dataset.follow;
    store.follows = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    render();
  }));
}

function Favorites(s) {
  const favs = store.favs, saved = store.saved;
  const toCards = (ids) => ids.map((id) => DB.messages.find((m) => m.id === id)).filter(Boolean).map((m) => card(m));
  s.append(el(`<h2>Favorites <small>${favs.length}</small></h2>`));
  s.append(favs.length ? rail("", "", toCards(favs)) : el(`<div class="empty">No favorites yet. Open any message and tap ♥ Favorite.</div>`));
  s.append(el(`<h2>Save for Later <small>${saved.length}</small></h2>`));
  if (saved.length) s.append(rail("", "", toCards(saved)));
}

function Search(s) {
  const input = el(`<input class="searchbar" placeholder="Search messages, programs, music, artists" value="${query}" aria-label="Search">`);
  s.append(el(`<h2>Search</h2>`), input);
  const out = el(`<div></div>`);
  s.append(out);
  const run = () => {
    query = input.value;
    const q = query.trim().toLowerCase();
    out.innerHTML = "";
    if (!q) return;
    const hits = DB.messages.filter((m) => (m.title + " " + m.description).toLowerCase().includes(q) && m.status === "published");
    const artists = DB.artists.filter((a) => (a.name + " " + a.bio).toLowerCase().includes(q));
    if (hits.length) out.append(rail(`Messages (${hits.length})`, "", hits.slice(0, 8).map((m) => card(m))));
    if (artists.length) out.append(rail(`Artists (${artists.length})`, "",
      artists.map((a) => el(`<div class="card"><div class="thumb" data-art="${a.id}‖${a.name}‖1"></div><div class="meta"><b>${a.name}</b><div>${a.bio}</div></div></div>`))));
    if (!hits.length && !artists.length) out.append(el(`<div class="empty">No results for “${query}”. Try “faith” or “healing”.</div>`));
    out.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
    hydrateArtwork(out);
    wirePreviews(out);
  };
  input.oninput = run;
  if (query) run();
  input.focus();
}

function openSheet(title, bodyHtml) {
  const s = document.getElementById("screen");
  s.innerHTML = "";
  const d = el(`<div><button class="back">← Back</button><div class="detail"><h2 style="margin-top:0">${title}</h2>${bodyHtml}</div></div>`);
  s.append(d);
  d.querySelector(".back").onclick = render;
  d.querySelectorAll("[data-play]").forEach((b) => (b.onclick = () => playTrack(b.dataset.play)));
  hydrateArtwork(d);
  wirePreviews(d);
  window.scrollTo(0, 0);
}

function openDetail(id) {
  const m = DB.messages.find((x) => x.id === id);
  if (!m) return;
  const fav = store.favs.includes(id), sv = store.saved.includes(id);
  const related = DB.messages.filter((x) => x.id !== id && x.status === "published" &&
    (x.programId === m.programId || x.topicIds.some((t) => m.topicIds.includes(t)))).slice(0, 4);
  openSheet(m.title, `
    <div style="color:var(--muted)">${m.speaker} · ${progName(m.programId)} · ${m.topicIds.map(topicName).join(", ")} · ${mins(m.durationSec)}</div>
    <p style="color:var(--muted)">${m.description}</p>
    <div class="actions">
      <button class="btn primary" data-watch="${m.id}">▶ ${store.progress[id] ? "Resume" : "Play"}</button>
      <button class="btn" data-fav="${m.id}">${fav ? "♥ Favorited" : "♡ Favorite"}</button>
      <button class="btn" data-save="${m.id}">${sv ? "Saved ✓" : "Save for Later"}</button>
    </div>
    <h2>Related</h2><div class="rail">${related.map((r) => `<button class="card" data-open="${r.id}" data-pv="msg:${r.id}"><div class="thumb" data-art="${r.id}‖${r.title}‖0"></div><div class="meta"><b>${r.title}</b><div>${mins(r.durationSec)}</div></div></button>`).join("")}</div>`);
  const d = document.getElementById("screen");
  d.querySelector("[data-watch]").onclick = () => {
    const p = store.progress;
    p[id] = { pos: p[id]?.pos || 0 };
    store.progress = p;
    playTrack(id, true);
  };
  d.querySelector("[data-fav]").onclick = () => {
    const f = store.favs;
    store.favs = f.includes(id) ? f.filter((x) => x !== id) : [...f, id];
    openDetail(id);
  };
  d.querySelector("[data-save]").onclick = () => {
    const v = store.saved;
    store.saved = v.includes(id) ? v.filter((x) => x !== id) : [...v, id];
    openDetail(id);
  };
  d.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
}

function openLive(id) {
  const l = DB.live.find((x) => x.id === id);
  openSheet(l.title, `<div style="color:var(--muted)">${progName(l.programId)} · ${l.status}</div>
    <p style="color:var(--muted)">${l.status === "live" ? "On air now (test stream)." : l.status === "scheduled" ? "Scheduled — check back at airtime." : "Broadcast ended — replay coming soon."}</p>`);
}

const PREMIUM_PLAYLIST = "pl-006"; // "Pastor Chris Recommended" — subscriber-only demo gate
const isPremium = () => localStorage.getItem(K("premium")) === "1";

function openPlaylist(id) {
  const p = DB.playlists.find((x) => x.id === id);
  if (id === PREMIUM_PLAYLIST && !isPremium()) {
    openSheet(`🔒 ${p.title}`, `<p style="color:var(--muted)">This playlist is for subscribers (test mode — no real charge).</p>
      <div class="rowbtns"><button class="btn primary" id="gate-sub">★ Subscribe — ₦1,500/mo (test)</button></div>`);
    document.getElementById("gate-sub").onclick = openSubscribe;
    return;
  }
  const songs = p.songIds.map((sid) => DB.songs.find((x) => x.id === sid)).filter(Boolean);
  openSheet(`🎵 ${p.title}`, songs.map((x) => {
    const a = DB.artists.find((a) => a.id === x.artistId);
    return `<div class="chips"><button data-play="${x.id}">▶ ${x.title} — ${a?.name || ""}</button></div>`;
  }).join("") + `<div class="rowbtns"><button class="btn primary" id="play-all">Play All</button></div>`);
  document.getElementById("play-all").onclick = () => { queue = { ids: songs.map((x) => x.id), i: 0 }; playTrack(queue.ids[0]); };
}

/* Test-mode subscription via Paystack (key stays server-side in .env). */
function openSubscribe() {
  openSheet("★ Subscribe (test mode)", `
    <div style="color:var(--muted)">PCO Monthly — ₦1,500/mo. Test checkout, no real charge.</div>
    <div style="margin:14px 0"><input id="sub-email" class="searchbar" type="email" placeholder="you@example.com" aria-label="Email"></div>
    <div class="rowbtns"><button class="btn primary" id="sub-go">Continue to Paystack test checkout</button></div>
    <div id="sub-msg" style="color:var(--muted);margin-top:10px"></div>`);
  document.getElementById("sub-go").onclick = async () => {
    const email = document.getElementById("sub-email").value.trim();
    const msg = document.getElementById("sub-msg");
    msg.textContent = "Contacting test checkout…";
    try {
      const r = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, amount: 150000 }),
      });
      const out = await r.json();
      if (!r.ok) throw new Error(out.error || "checkout failed");
      location.href = out.authorization_url;
    } catch (e) {
      msg.textContent = e.message === "payments not configured"
        ? "Payments aren't configured on this server yet (PAYSTACK_SECRET_KEY missing in .env)."
        : "Checkout failed: " + e.message;
    }
  };
}

function playTrack(id, isVideo) {
  const m = DB.messages.find((x) => x.id === id);
  const song = DB.songs.find((x) => x.id === id);
  const title = m ? `${m.title} — ${m.speaker}` : song ? `♪ ${song.title}` : id;
  const bar = document.getElementById("player");
  bar.hidden = false;
  document.getElementById("player-title").textContent = title + (isVideo ? " (preview — test data)" : "");
  if (m) {
    // Simulate progress so Continue Watching fills in
    const timer = setInterval(() => {
      const p = store.progress;
      const cur = (p[id]?.pos || 0) + 30;
      if (cur >= m.durationSec - 15) { delete p[id]; store.progress = p; clearInterval(timer); return; }
      p[id] = { pos: cur };
      store.progress = p;
    }, 4000);
    bar.dataset.timer = timer;
  }
}
document.getElementById("player").addEventListener("click", (e) => {
  const act = e.target.closest("button")?.dataset.act;
  if (!act) return;
  if (act === "close") {
    document.getElementById("player").hidden = true;
    clearInterval(+document.getElementById("player").dataset.timer);
  }
  if (act === "next" && queue.ids.length) { queue.i = Math.min(queue.ids.length - 1, queue.i + 1); playTrack(queue.ids[queue.i]); }
  if (act === "prev" && queue.ids.length) { queue.i = Math.max(0, queue.i - 1); playTrack(queue.ids[queue.i]); }
});

/* ---- Hover previews: 60s message trailers, seconds-long music previews ----
   Real files listed in media/manifest.json play when present; otherwise
   messages get an animated trailer card and songs get a synthesized jingle
   (stand-ins until real media arrives). */
let pvTimer = null, pvClose = null, pvHover = null, audioCtx = null, audioNodes = [];

function ensureCtx() {
  if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch { /* no audio */ } }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
}
window.addEventListener("pointerdown", ensureCtx, { once: false });
window.addEventListener("keydown", ensureCtx);

/* Short synthesized preview jingle per song (pitch derived from id). */
function jingle(songId, seconds) {
  ensureCtx();
  if (!audioCtx) return;
  const scale = [0, 2, 4, 7, 9, 12, 14, 16];
  const base = 220 * Math.pow(2, (hashStr(songId) % 12) / 12);
  const t0 = audioCtx.currentTime + 0.05;
  for (let i = 0; i < seconds; i++) {
    const f = base * Math.pow(2, scale[(hashStr(songId) + i * 3) % scale.length] / 12);
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = "triangle";
    o.frequency.value = f;
    g.gain.setValueAtTime(0, t0 + i);
    g.gain.linearRampToValueAtTime(0.18, t0 + i + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + i + 0.95);
    o.connect(g).connect(audioCtx.destination);
    o.start(t0 + i);
    o.stop(t0 + i + 1);
    audioNodes.push(o);
  }
}

function stopPreview() {
  clearTimeout(pvHover);
  pvHover = null;
  if (pvClose) { pvClose(); pvClose = null; }
  clearTimeout(pvTimer);
  audioNodes.forEach((o) => { try { o.stop(); } catch { /* ended */ } });
  audioNodes = [];
  document.querySelectorAll("audio[data-pv-audio]").forEach((a) => a.pause());
  document.getElementById("preview")?.remove();
}

function placeOverlay(anchor) {
  const r = anchor.getBoundingClientRect();
  const box = document.getElementById("preview");
  const w = Math.min(320, innerWidth - 16);
  let x = Math.min(Math.max(8, r.left), innerWidth - w - 8);
  let y = r.bottom + 8;
  if (y + 200 > innerHeight) y = Math.max(8, r.top - 210);
  box.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:${w}px;z-index:50`;
}

function countdown(label, bar, total, onDone) {
  const t0 = Date.now();
  const tick = () => {
    const left = Math.max(0, total - (Date.now() - t0) / 1000);
    label.textContent = `0:${String(Math.ceil(left)).padStart(2, "0")}`;
    bar.style.width = `${(100 * (total - left)) / total}%`;
    if (left <= 0) { stopPreview(); onDone && onDone(); return; }
    pvTimer = setTimeout(tick, 250);
  };
  tick();
}

function shellOverlay(html) {
  stopPreview();
  const box = el(`<div id="preview" class="pv" role="dialog" aria-label="Preview">${html}</div>`);
  document.body.append(box);
  pvClose = () => box.remove();
  return box;
}

function showTrailer(messageId, anchor) {
  const m = DB.messages.find((x) => x.id === messageId);
  if (!m) return;
  const real = MANIFEST.trailers[messageId];
  const media = real
    ? `<video src="${real}" muted autoplay loop playsinline style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block"></video>`
    : `<div class="pv-zoom" style="background-image:${artwork(m.id, m.title, false)}"></div>`;
  const box = shellOverlay(`
    ${media}
    <div class="pv-meta"><b>${m.title}</b>
    <div class="pv-sub">TRAILER · <span class="pv-time">1:00</span>${real ? "" : " · preview mock"}</div>
    <div class="pv-bar"><i></i></div></div>`);
  box.onclick = () => { stopPreview(); openDetail(messageId); };
  placeOverlay(anchor);
  countdown(box.querySelector(".pv-time"), box.querySelector(".pv-bar i"), TRAILER_SEC);
}

function showMusic(songId, anchor) {
  const song = DB.songs.find((x) => x.id === songId);
  if (!song) return;
  const artist = DB.artists.find((a) => a.id === song.artistId);
  const box = shellOverlay(`
    <div class="pv-meta pv-music"><span class="eq"><i></i><i></i><i></i><i></i></span>
    <div><b>♪ ${song.title}</b><div class="pv-sub">${artist?.name || ""} · preview <span class="pv-time">0:08</span></div></div></div>
    <div class="pv-bar"><i></i></div>`);
  placeOverlay(anchor);
  const real = MANIFEST.previews[songId];
  if (real) {
    const a = new Audio(real);
    a.dataset.pvAudio = "1";
    a.play().catch(() => {});
  } else {
    jingle(songId, MUSIC_PREVIEW_SEC);
  }
  countdown(box.querySelector(".pv-time"), box.querySelector(".pv-bar i"), MUSIC_PREVIEW_SEC);
}

function firstSongOfPlaylist(plId) {
  const p = DB.playlists.find((x) => x.id === plId);
  return p?.songIds[0];
}
function firstSongOfArtist(artistId) {
  return DB.songs.find((x) => x.artistId === artistId)?.id;
}

/* Hover intent (500ms) + keyboard focus trigger previews; leave/blur/scroll/Esc stops. */
function wirePreviews(scope) {
  const arm = (node, fn) => {
    node.addEventListener("mouseenter", () => {
      clearTimeout(pvHover);
      pvHover = setTimeout(() => fn(node), 500);
    });
    node.addEventListener("mouseleave", stopPreview);
    node.addEventListener("focus", () => {
      clearTimeout(pvHover);
      pvHover = setTimeout(() => fn(node), 500);
    });
    node.addEventListener("blur", stopPreview);
  };
  scope.querySelectorAll("[data-pv]").forEach((n) => {
    const [, id] = n.dataset.pv.split(":");
    arm(n, (a) => showTrailer(id, a));
  });
  scope.querySelectorAll("[data-pl]").forEach((n) => arm(n, (a) => {
    const s = firstSongOfPlaylist(n.dataset.pl);
    if (s) showMusic(s, a);
  }));
  scope.querySelectorAll("[data-artist]").forEach((n) => arm(n, (a) => {
    const s = firstSongOfArtist(n.dataset.artist);
    if (s) showMusic(s, a);
  }));
  scope.querySelectorAll("[data-play]").forEach((n) => arm(n, (a) => showMusic(n.dataset.play, a)));
}
window.addEventListener("scroll", () => { if (document.getElementById("preview")) stopPreview(); }, true);
window.addEventListener("keydown", (e) => { if (e.key === "Escape") stopPreview(); });

function updateOnline() {
  document.getElementById("offline-bar").hidden = navigator.onLine;
}
window.addEventListener("online", updateOnline);
window.addEventListener("offline", updateOnline);

let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const b = document.getElementById("install");
  b.hidden = false;
  b.onclick = () => { b.hidden = true; deferredPrompt.prompt(); deferredPrompt = null; };
});

Promise.all([
  fetch("data/seed.json").then((r) => r.json()),
  fetch("media/manifest.json").then((r) => r.json()).catch(() => ({ artwork: {}, trailers: {}, previews: {} })),
]).then(([db, manifest]) => {
  DB = db;
  MANIFEST = { artwork: {}, trailers: {}, previews: {}, ...manifest };
  migrateLegacy();
  // Premium granted while away (callback page) lands on the active profile.
  if (localStorage.getItem("pco.pendingPremium") === "1" && activeId()) {
    localStorage.setItem(K("premium"), "1");
    localStorage.removeItem("pco.pendingPremium");
  }
  updateOnline();
  ensureAvatar();
  if (!activeId()) renderPicker();
  else render();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
}).catch(() => {
  document.getElementById("screen").innerHTML =
    `<div class="empty" style="margin-top:14px">Couldn't load test data. Serve over http: <b>node scripts/serve.mjs</b> then open http://localhost:5173/index.html</div>`;
});

/* ---- Profiles (device-only demo login, PRD §19 family experience) ---- */

function ensureAvatar() {
  if (document.getElementById("profile-btn")) return;
  const b = el(`<button id="profile-btn" aria-label="Switch profile"></button>`);
  b.onclick = renderPicker;
  document.querySelector(".nav").insertBefore(b, document.getElementById("install"));
  paintAvatar();
}

function paintAvatar() {
  const b = document.getElementById("profile-btn");
  if (!b) return;
  const p = activeProfile();
  b.textContent = p ? p.name[0].toUpperCase() : "?";
  b.style.cssText = `margin-left:8px;width:38px;height:38px;border-radius:50%;border:2px solid ${p ? p.color : "#8A7D68"};background:#201914;color:#F7F1E6;font-size:17px;font-weight:800`;
}

function renderPicker() {
  stopPreview();
  const s = document.getElementById("screen");
  s.innerHTML = "";
  const wrap = el(`<div style="text-align:center;padding:40px 0"><div class="kicker">PCO TV · WHO'S WATCHING?</div>
    <h1 style="font-size:32px">Choose your profile</h1>
    <p style="color:var(--muted)">Demo login — profiles live on this device only. Each person gets their own favorites, progress, and subscriptions.</p>
    <div id="plist" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:20px"></div></div>`);
  s.append(wrap);
  const list = wrap.querySelector("#plist");
  profiles().forEach((p) => {
    const t = el(`<button style="background:var(--surface);border:2px solid ${p.color};border-radius:16px;padding:22px 26px;color:var(--text);font-size:17px;min-width:130px">
      <div style="font-size:34px;font-weight:800;color:${p.color}">${p.name[0]}</div>${p.name}</button>`);
    t.onclick = () => {
      localStorage.setItem("pco.activeProfile", p.id);
      tab = "Home";
      paintAvatar();
      render();
      window.scrollTo(0, 0);
    };
    list.append(t);
  });
  window.scrollTo(0, 0);
}
