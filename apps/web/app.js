/* PCO TV PWA — test-data app. Device profiles, no accounts, no backend. */
const TABS = ["Home", "Messages", "Music", "Live", "Programs", "Favorites", "Community", "Search"];

/* UI language: English, Français, Español. Content (titles, descriptions)
   stays in English for now — chrome translates, catalog follows later. */
const I18N = {
  en: {},
  fr: {
    "Home": "Accueil", "Messages": "Messages", "Music": "Musique", "Live": "En direct",
    "Programs": "Programmes", "Favorites": "Favoris", "Community": "Communauté", "Search": "Recherche",
    "Continue Watching": "Continuer", "Live Now": "En direct", "Pastor Chris": "Pasteur Chris",
    "LoveWorld Music": "Musique LoveWorld", "Recommended for You": "Pour vous",
    "Recently Added": "Récents", "Popular": "Populaires", "Upcoming": "À venir",
    "Recently Live": "Récents en direct", "Playlists": "Listes", "Artists": "Artistes",
    "Related": "Similaires", "Keep watching": "Continuer",
    "▶ Continue Watching": "▶ Continuer", "▶ Play": "▶ Lire", "▶ Resume": "▶ Reprendre",
    "♡ Favorite": "♡ Favori", "♥ Favorited": "♥ Favori ✓", "Save for Later": "À voir",
    "Saved ✓": "Sauvé ✓", "Follow program": "Suivre", "Unfollow": "Ne plus suivre",
    "★ Subscribe": "★ S'abonner", "Install": "Installer", "Later": "Plus tard",
    "Back": "← Retour", "Search messages, programs, music, artists": "Rechercher messages, programmes, musique, artistes",
    "Nothing is live right now.": "Rien en direct pour le moment.",
    "Nothing here yet. Tap ♥ on anything you love.": "Rien ici. Touchez ♥ sur ce que vous aimez.",
    "No reflections yet — share the first one below. What did you learn?": "Aucune réaction — partagez la première. Qu'avez-vous appris ?",
    "Share what you learnt…": "Partagez ce que vous avez appris…",
    "Post reflection": "Publier", "What did you learn?": "Qu'avez-vous appris ?",
    "Billing": "Facturation", "Settings": "Réglages", "Account": "Compte",
    "Sign In": "Se connecter", "TV mode": "Mode TV", "Install app": "Installer l'app",
    "Sign out (log in again next visit)": "Se déconnecter",
    "Language": "Langue", "Brightness": "Luminosité", "Appearance": "Apparence",
    "Monthly": "Mensuel", "Quarterly": "Trimestriel", "Annual": "Annuel",
    "Play": "Lire", "Resume": "Reprendre", "Play All": "Tout lire", "Follow": "Suivre",
    "Following": "Suivi ✓", "Favorites": "Favoris", "Save for Later": "À voir plus tard",
    "No results for": "Aucun résultat pour", "Choose your profile": "Choisissez votre profil",
    "What the family learnt": "Ce que la famille a appris",
    "Continue to checkout": "Continuer au paiement", "Cancel auto-renew": "Annuler le renouvellement",
  },
  es: {
    "Home": "Inicio", "Messages": "Mensajes", "Music": "Música", "Live": "En vivo",
    "Programs": "Programas", "Favorites": "Favoritos", "Community": "Comunidad", "Search": "Buscar",
    "Continue Watching": "Seguir viendo", "Live Now": "Ahora en vivo", "Pastor Chris": "Pastor Chris",
    "LoveWorld Music": "Música LoveWorld", "Recommended for You": "Para ti",
    "Recently Added": "Recién añadido", "Popular": "Populares", "Upcoming": "Próximos",
    "Recently Live": "Recientes en vivo", "Playlists": "Listas", "Artists": "Artistas",
    "Related": "Similares", "Keep watching": "Seguir viendo",
    "▶ Continue Watching": "▶ Seguir viendo", "▶ Play": "▶ Ver", "▶ Resume": "▶ Continuar",
    "♡ Favorite": "♡ Favorito", "♥ Favorited": "♥ Favorito ✓", "Save for Later": "Ver más tarde",
    "Saved ✓": "Guardado ✓", "Follow program": "Seguir programa", "Unfollow": "Dejar de seguir",
    "★ Subscribe": "★ Suscribirse", "Install": "Instalar", "Later": "Después",
    "Back": "← Atrás", "Search messages, programs, music, artists": "Buscar mensajes, programas, música, artistas",
    "Nothing is live right now.": "Nada en vivo ahora mismo.",
    "Nothing here yet. Tap ♥ on anything you love.": "Nada aquí. Toca ♥ en lo que ames.",
    "No reflections yet — share the first one below. What did you learn?": "Sin reflexiones — comparte la primera. ¿Qué aprendiste?",
    "Share what you learnt…": "Comparte lo que aprendiste…",
    "Post reflection": "Publicar", "What did you learn?": "¿Qué aprendiste?",
    "Billing": "Facturación", "Settings": "Ajustes", "Account": "Cuenta",
    "Sign In": "Iniciar sesión", "TV mode": "Modo TV", "Install app": "Instalar app",
    "Sign out (log in again next visit)": "Cerrar sesión",
    "Language": "Idioma", "Brightness": "Brillo", "Appearance": "Apariencia",
    "Monthly": "Mensual", "Quarterly": "Trimestral", "Annual": "Anual",
    "Play": "Ver", "Resume": "Continuar", "Play All": "Reproducir todo", "Follow": "Seguir",
    "Following": "Siguiendo ✓", "Favorites": "Favoritos", "Save for Later": "Ver más tarde",
    "No results for": "Sin resultados para", "Choose your profile": "Elige tu perfil",
    "What the family learnt": "Lo que aprendió la familia",
    "Continue to checkout": "Continuar al pago", "Cancel auto-renew": "Cancelar renovación",
  },
};
const lang = () => (appSettings().lang && I18N[appSettings().lang] ? appSettings().lang : "en");
const t = (s) => (I18N[lang()] && I18N[lang()][s]) || s;
const DEFAULT_PROFILES = [
  { id: "tare", name: "Tare", color: "#D9A441" },
  { id: "mom", name: "Mom", color: "#D9A441" },
  { id: "dad", name: "Dad", color: "#D9A441" },
  { id: "kids", name: "Kids", color: "#D9A441" },
];
function profiles() { return JSON.parse(localStorage.getItem("pco.profiles") || "[]"); }
function activeId() { return localStorage.getItem("pco.activeProfile") || ""; }
function activeProfile() {
  const p = profiles().find((x) => x.id === activeId());
  if (!p && activeId()) localStorage.removeItem("pco.activeProfile");
  return p;
}
const K = (k) => `pco.${activeId()}.${k}`;
const store = {
  get favs() { return JSON.parse(localStorage.getItem(K("favs")) || "[]"); },
  set favs(v) { localStorage.setItem(K("favs"), JSON.stringify(v)); scheduleSync(); },
  get saved() { return JSON.parse(localStorage.getItem(K("saved")) || "[]"); },
  set saved(v) { localStorage.setItem(K("saved"), JSON.stringify(v)); scheduleSync(); },
  get progress() { return JSON.parse(localStorage.getItem(K("progress")) || "{}"); },
  set progress(v) { localStorage.setItem(K("progress"), JSON.stringify(v)); scheduleSync(); },
  get follows() { return JSON.parse(localStorage.getItem(K("follows")) || "[]"); },
  set follows(v) { localStorage.setItem(K("follows"), JSON.stringify(v)); scheduleSync(); },
  get comments() { return JSON.parse(localStorage.getItem(K("comments")) || "{}"); },
  set comments(v) { localStorage.setItem(K("comments"), JSON.stringify(v)); scheduleSync(); },
};

/* Seeded community voices (test data). Real community needs a moderated backend. */
const DEMO_COMMENTS = [
  { msg: "m-001", name: "Grace", text: "I learnt that faith speaks before it sees. I'm declaring over my family daily now.", amens: 14 },
  { msg: "m-001", name: "Emeka", text: "The part on patience with faith reset my prayer life. Thank you Pastor.", amens: 9 },
  { msg: "m-002", name: "Sarah", text: "Watched with my mum — we both cried at the testimonies. Healing is ours!", amens: 21 },
  { msg: "m-005", name: "David", text: "Walking with the Spirit daily: my takeaway is morning fellowship first, phone second.", amens: 7 },
  { msg: "m-006", name: "Faith", text: "Effective fervent prayer — I finally understand why consistency matters more than length.", amens: 11 },
];

function getComments(msgId) {
  const mine = (store.comments[msgId] || []).map((c) => ({ ...c, mine: true }));
  const seeded = DEMO_COMMENTS.filter((c) => c.msg === msgId);
  return [...mine, ...seeded];
}

function postComment(msgId, text) {
  const all = store.comments;
  const list = all[msgId] || [];
  list.unshift({ name: activeProfile()?.name || "Viewer", text: text.trim(), at: Date.now(), amens: [] });
  all[msgId] = list;
  store.comments = all;
}

function toggleAmen(msgId, idx) {
  const all = store.comments;
  const list = all[msgId] || [];
  const me = activeId();
  const c = list[idx];
  if (!c) return;
  c.amens = c.amens.includes(me) ? c.amens.filter((x) => x !== me) : [...c.amens, me];
  all[msgId] = list;
  store.comments = all;
}

function amenCount(c) {
  return Array.isArray(c.amens) ? c.amens.length : c.amens;
}

/* Demo-grade moderation: masked words + personal report/hide.
   A shared backend with approve/report queues is still the real fix (post-MVP). */
const BLOCKED = ["damn", "hell", "stupid", "idiot", "hate you", "http://", "https://", "www."];
function mask(text) {
  let s = String(text ?? "");
  for (const w of BLOCKED) s = s.replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), (m) => "•".repeat(m.length));
  return s;
}
function hiddenKeys() { return JSON.parse(localStorage.getItem(K("hidden")) || "[]"); }
function hideComment(key) {
  const h = hiddenKeys();
  if (!h.includes(key)) h.push(key);
  localStorage.setItem(K("hidden"), JSON.stringify(h));
  scheduleSync();
}
function unhideAll(msgId) {
  localStorage.setItem(K("hidden"), JSON.stringify(hiddenKeys().filter((k) => !k.startsWith(msgId + ":"))));
}

function commentListHtml(msgId) {
  const hidden = hiddenKeys();
  const mine = (store.comments[msgId] || []).map((c, j) => ({ ...c, mine: true, key: `${msgId}:u${j}`, idx: j }));
  const seeded = DEMO_COMMENTS.filter((c) => c.msg === msgId).map((c, j) => ({ ...c, key: `${msgId}:s${j}` }));
  const total = mine.length + seeded.length;
  const list = [...mine, ...seeded].filter((c) => !hidden.includes(c.key));
  const hiddenCount = total - list.length;
  const hiddenNote = hiddenCount > 0
    ? `<div style="margin:8px 0"><button class="amen" data-unhide="${msgId}">${hiddenCount} hidden by you · Undo</button></div>` : "";
  if (!list.length && !hiddenCount) return `<div class="empty">${t("No reflections yet — share the first one below. What did you learn?")}</div>`;
  return hiddenNote + list.map((c) => `
    <div class="comment"><b>${esc(c.name)}</b>${c.mine ? ` <small>(you)</small>` : ""}
    <p>${esc(mask(c.text))}</p>
    <button class="amen" data-amen="${c.key}">🙏 Amen · ${amenCount(c)}</button>
    <button class="amen" data-report="${c.key}">Report</button></div>`).join("");
}

/* Reflections need an account (spam control). Guests read freely; posting
   or Amen-ing opens the signup gate, then completes the action. */
let pendingComment = null;

function wireComments(scope, msgId, rerender) {
  scope.querySelectorAll("[data-amen]").forEach((b) => (b.onclick = () => {
    if (!SB_USER) { openAuthGate(); return; }
    const [mid, ref] = b.dataset.amen.split(":");
    if (ref.startsWith("u")) toggleAmen(mid, +ref.slice(1));
    rerender();
  }));
  scope.querySelectorAll("[data-report]").forEach((b) => (b.onclick = () => {
    hideComment(b.dataset.report);
    rerender();
  }));
  scope.querySelectorAll("[data-unhide]").forEach((b) => (b.onclick = () => {
    unhideAll(b.dataset.unhide);
    rerender();
  }));
  const form = scope.querySelector("[data-cform]");
  if (form) form.onsubmit = (e) => {
    e.preventDefault();
    const input = scope.querySelector("[data-cinput]");
    const text = input.value.trim().slice(0, 500);
    if (!text) return;
    if (!SB_USER) {
      pendingComment = { msgId, text, rerender };
      openAuthGate();
      return;
    }
    postComment(msgId, text);
    rerender();
  };
}
/** One-time migration: old device-wide data + premium flag move into the first profile. */
function migrateLegacy() {
  if (localStorage.getItem("pco.profiles")) return;
  // Returning device with old data? Keep the classic household tiles so nothing is lost.
  // Fresh device? Start empty — the owner creates their own profiles below.
  let returning = false;
  const stash = {};
  for (const k of ["favs", "saved", "progress", "follows", "premium"]) {
    const old = localStorage.getItem(`pco.${k}`);
    if (old !== null) { stash[k] = old; localStorage.removeItem(`pco.${k}`); returning = true; }
  }
  if (returning) {
    localStorage.setItem("pco.profiles", JSON.stringify(DEFAULT_PROFILES));
    for (const [k, v] of Object.entries(stash)) localStorage.setItem(`pco.tare.${k}`, v);
    localStorage.setItem("pco.activeProfile", "tare");
  } else {
    localStorage.setItem("pco.profiles", JSON.stringify([]));
  }
}
const PROFILE_COLORS = ["#D9A441"];
function addProfile(name) {
  const clean = name.trim().slice(0, 20);
  if (!clean) return null;
  const list = profiles();
  const id = "u" + Date.now().toString(36);
  const used = new Set(list.map((p) => p.color));
  const color = PROFILE_COLORS.find((c) => !used.has(c)) || PROFILE_COLORS[list.length % PROFILE_COLORS.length];
  const rec = { id, name: clean, color, custom: true };
  list.push(rec);
  localStorage.setItem("pco.profiles", JSON.stringify(list));
  return rec;
}
function deleteProfile(pid) {
  localStorage.setItem("pco.profiles", JSON.stringify(profiles().filter((p) => p.id !== pid)));
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.startsWith(`pco.${pid}.`)) localStorage.removeItem(k);
  }
  const meta = pinMeta(); delete meta[pid]; savePinMeta(meta);
  delete sessionPins[pid];
  if (activeId() === pid) {
    localStorage.removeItem("pco.activeProfile");
    localStorage.removeItem("pco.session");
  }
}
let DB = null, tab = "Home", topicFilter = "", query = "";
let queue = { ids: [], i: 0 };

const el = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstChild; };
/* User-typed text must never reach innerHTML raw (stored/reflected XSS). */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const TRAILER_SEC = 60;   // message hover preview length
const MUSIC_PREVIEW_SEC = 8; // music hover preview length
let MANIFEST = { artwork: {}, trailers: {}, previews: {} };

function hashStr(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }

/* Cover art: real files listed in media/manifest.json win; otherwise a
   branded placeholder per content kind (swap in real photos anytime). */
function kindOf(id) {
  if (id.startsWith("l-")) return "live";
  if (id.startsWith("p-")) return "program";
  if (/^(pl|al|a|s)-/.test(id)) return "music";
  return "message";
}
function artwork(id) {
  if (MANIFEST.artwork[id]) return `url("${MANIFEST.artwork[id]}")`;
  return `url("media/placeholders/${kindOf(id)}.svg")`;
}

/* Thumbs carry data-art; hydration sets the picture (keeps templates readable). */
function hydrateArtwork(root) {
  (root || document).querySelectorAll(".thumb[data-art]").forEach((t) => {
    if (t.dataset.done) return;
    const [id] = t.dataset.art.split("‖");
    t.style.backgroundImage = artwork(id);
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
  const s = el(`<section><h2>${t(title)}${sub ? ` <small>${sub}</small>` : ""}</h2><div class="rail"></div></section>`);
  const r = s.querySelector(".rail");
  nodes.forEach((n) => r.append(n));
  return s;
};

function renderTabs() {
  const nav = document.getElementById("tabs");
  nav.innerHTML = "";
  TABS.forEach((name) => {
    const b = el(`<button role="tab" aria-selected="${name === tab}">${t(name)}</button>`);
    b.onclick = () => { tab = name; track("tab_view", { tab: name }); render(); window.scrollTo(0, 0); };
    nav.append(b);
  });
}

function render() {
  stopPreview();
  renderTabs();
  const s = document.getElementById("screen");
  s.innerHTML = "";
  ({ Home, Messages, Music, Live, Programs, Favorites, Community, Search })[tab](s);
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
  const guest = !SB_USER;
  const hero = el(`<div class="hero slim"><div class="kicker">${guest ? "PCO TV" : `WELCOME BACK, ${who}`} ${premium ? "· ★ PREMIUM" : ""}</div>
    <div class="rowbtns"><button class="btn primary" id="hero-play">▶ ${t("Continue Watching")}</button>
    ${premium ? "" : `<button class="btn" id="hero-sub">★ Subscribe</button>`}</div></div>`);
  s.append(hero);
  installPopup();
  hero.querySelector("#hero-play").onclick = () => cwIds.length && openDetail(cwIds[0]);
  const subBtn = hero.querySelector("#hero-sub");
  if (subBtn) subBtn.onclick = openBilling;
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
  s.append(el(`<h2>${t("Messages")}</h2>`), chips);
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
    s.append(el(`<div class="empty" style="margin-top:14px"><b style="color:var(--text)">${t("Nothing is live right now.")}</b><br>Catch up below.</div>`));
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
    const sec = el(`<section><h2>${p.title} <small>${eps.length} episodes ${following ? "· Following ✓" : ""}</small></h2><p style="color:var(--muted)">${p.description}</p>    <div class="rowbtns"><button class="btn" data-follow="${p.id}">${following ? t("Unfollow") : t("Follow program")}</button></div><div class="rail"></div></section>`);
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
  s.append(el(`<h2>${t("Favorites")} <small>${favs.length}</small></h2>`));
  s.append(favs.length ? rail("", "", toCards(favs)) : el(`<div class="empty">Nothing here yet. Tap ♥ on anything you love.</div>`));
  s.append(el(`<h2>${t("Save for Later")} <small>${saved.length}</small></h2>`));
  if (saved.length) s.append(rail("", "", toCards(saved)));
}

function relatedFor(id, n = 4) {
  const m = DB.messages.find((x) => x.id === id);
  if (!m) return [];
  return DB.messages.filter((x) => x.id !== id && x.status === "published" &&
    (x.programId === m.programId || x.topicIds.some((t) => m.topicIds.includes(t)))).slice(0, n);
}

/* Post-watch moment: reflect, read the community, keep watching. */
function openFinished(id) {
  const m = DB.messages.find((x) => x.id === id);
  if (!m) return;
  const next = relatedFor(id);
  openSheet(`✓ Finished: ${m.title}`, `
    <div class="kicker">WHAT DID YOU LEARN?</div>
    <p style="color:var(--muted)">Before you move on — capture one takeaway for yourself and the family.</p>
    <div data-clist>${commentListHtml(id)}</div>
    <form data-cform><input data-cinput class="searchbar" placeholder="${t("Share what you learnt…")}" aria-label="Share what you learnt">
    <div class="rowbtns"><button class="btn primary" type="submit">${t("Post reflection")}</button></div></form>
    <h2>${t("Keep watching")}</h2><div class="rail">${next.map((r) => `<button class="card" data-open="${r.id}"><div class="thumb" data-art="${r.id}‖${r.title}‖0"></div><div class="meta"><b>${r.title}</b><div>${mins(r.durationSec)}</div></div></button>`).join("")}</div>`);
  const d = document.getElementById("screen");
  wireComments(d, id, () => openFinished(id));
  d.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
}

function Community(s) {
  s.append(el(`<div class="hero"><div class="kicker">LEARN OUT LOUD · TEST DATA</div>
    <h1>${t("What the family learnt")}</h1>
    <p>Reflections from every profile on this device.</p></div>`));
  const items = [];
  for (const mid of Object.keys(store.comments)) {
    for (const c of store.comments[mid]) items.push({ msgId: mid, ...c, when: c.at || 0 });
  }
  for (const c of DEMO_COMMENTS) items.push({ msgId: c.msg, name: c.name, text: c.text, amens: c.amens, when: 0 });
  items.sort((a, b) => b.when - a.when);
  const wrap = el(`<div></div>`);
  if (!items.length) wrap.append(el(`<div class="empty">No reflections yet. Finish any message — you'll be invited to share what you learnt.</div>`));
  items.slice(0, 20).forEach((c) => {
    const m = DB.messages.find((x) => x.id === c.msgId);
    wrap.append(el(`<div class="comment"><b>${esc(c.name)}</b> <small>on “${esc(m?.title || c.msgId)}”</small><p>${esc(mask(c.text))}</p>
      <div class="rowbtns"><button class="btn" data-open="${c.msgId}">Watch & join in</button></div></div>`));
  });
  s.append(wrap);
  s.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
}

function Search(s) {
  const input = el(`<input class="searchbar" placeholder="${t("Search messages, programs, music, artists")}" value="${esc(query)}" aria-label="Search">`);
  s.append(el(`<h2>${t("Search")}</h2>`), input);
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
    if (!hits.length && !artists.length) out.append(el(`<div class="empty">${t("No results for")} “${esc(query)}”.</div>`));
    if (q.length > 2) track("search", { query: q.slice(0, 40), hits: hits.length });
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
    <div style="color:var(--faint);font-size:12px">Demo content · © LoveWorld</div>
    <p style="color:var(--muted)">${m.description}</p>
    <div class="actions">
      <button class="btn primary" data-watch="${m.id}">▶ ${store.progress[id] ? t("Resume") : t("Play")}</button>
      <button class="btn" data-fav="${m.id}">${fav ? t("♥ Favorited") : t("♡ Favorite")}</button>
      <button class="btn" data-save="${m.id}">${sv ? t("Saved ✓") : t("Save for Later")}</button>
    </div>
    <h2>${t("Related")}</h2><div class="rail">${related.map((r) => `<button class="card" data-open="${r.id}" data-pv="msg:${r.id}"><div class="thumb" data-art="${r.id}‖${r.title}‖0"></div><div class="meta"><b>${r.title}</b><div>${mins(r.durationSec)}</div></div></button>`).join("")}</div>
    <h2>💬 ${t("What did you learn?")}</h2><div data-clist>${commentListHtml(id)}</div>
    <form data-cform><input data-cinput class="searchbar" placeholder="${t("Share what you learnt…")}" aria-label="Share what you learnt">
    <div class="rowbtns"><button class="btn primary" type="submit">${t("Post reflection")}</button></div></form>`);
  const d = document.getElementById("screen");
  d.querySelector("[data-watch]").onclick = () => {
    const p = store.progress;
    p[id] = { pos: p[id]?.pos || 0 };
    store.progress = p;
    playTrack(id, true);
  };
  d.querySelector("[data-fav]").onclick = () => {
    const f = store.favs;
    const adding = !f.includes(id);
    store.favs = adding ? [...f, id] : f.filter((x) => x !== id);
    if (adding) track("favorite_added", { id });
    openDetail(id);
  };
  d.querySelector("[data-save]").onclick = () => {
    const v = store.saved;
    store.saved = v.includes(id) ? v.filter((x) => x !== id) : [...v, id];
    openDetail(id);
  };
  d.querySelectorAll("[data-open]").forEach((b) => (b.onclick = () => openDetail(b.dataset.open)));
  wireComments(d, id, () => openDetail(id));
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
  }).join("") + `<div class="rowbtns"><button class="btn primary" id="play-all">${t("Play All")}</button></div>`);
  document.getElementById("play-all").onclick = () => { queue = { ids: songs.map((x) => x.id), i: 0 }; playTrack(queue.ids[0]); };
}

/* Old single-plan checkout retired — Billing sheet (plans + manage) replaces it. */
function openSubscribe() {
  openBilling();
}

/* Guest browsing: a device-local "Guest" profile keeps namespacing sane
   until signup. On signup the guest's data merges into the chosen profile. */
function ensureGuest() {
  const list = profiles();
  if (!list.some((p) => p.id === "guest")) {
    list.push({ id: "guest", name: "Guest", color: "#D9A441", guest: true });
    localStorage.setItem("pco.profiles", JSON.stringify(list));
  }
}
function browseAsGuest() {
  ensureGuest();
  localStorage.setItem("pco.activeProfile", "guest");
  tab = "Home";
  paintAvatar();
  render();
  window.scrollTo(0, 0);
}
function mergeGuestInto(pid) {
  if (pid === "guest") return;
  const get = (k, fb) => { try { return JSON.parse(localStorage.getItem(`pco.${pid}.${k}`) ?? fb); } catch { return JSON.parse(fb); } };
  const gget = (k, fb) => { try { return JSON.parse(localStorage.getItem(`pco.guest.${k}`) ?? fb); } catch { return JSON.parse(fb); } };
  for (const k of ["favs", "saved", "follows"]) {
    const union = [...get(k, "[]"), ...gget(k, "[]").filter((x) => !get(k, "[]").includes(x))];
    localStorage.setItem(`pco.${pid}.${k}`, JSON.stringify(union));
  }
  for (const k of ["progress", "comments"]) {
    localStorage.setItem(`pco.${pid}.${k}`, JSON.stringify({ ...get(k, "{}"), ...gget(k, "{}") }));
  }
  if (localStorage.getItem("pco.guest.premium") === "1") localStorage.setItem(`pco.${pid}.premium`, "1");
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.startsWith("pco.guest.")) localStorage.removeItem(k);
  }
  localStorage.setItem("pco.profiles", JSON.stringify(profiles().filter((p) => p.id !== "guest")));
}

/* Signup gate on play: browsing is free, watching needs an account. */
let pendingPlay = null;
function openAuthGate() {
  openSheet("🔑 Create a free account to watch", `
    <p style="color:var(--muted)">Browsing is free. One account unlocks playback everywhere.</p>
    <input id="acc-email" class="searchbar" type="email" placeholder="you@example.com" aria-label="Email">
    <input id="acc-pw" class="searchbar" type="password" placeholder="Password (6+ characters)" aria-label="Password">
    <div class="rowbtns"><button class="btn primary" id="gate-up">Create account</button>
    <button class="btn" id="gate-in">I have an account</button></div>
    <div style="margin-top:8px"><a href="reset.html" style="color:var(--muted);font-size:14px">Forgot password?</a></div>
    <div id="acc-msg" style="color:var(--muted);font-size:14px;margin-top:8px"></div>`);
  const d = document.getElementById("screen");
  d.querySelector("#gate-up").onclick = () => authAction("up");
  d.querySelector("#gate-in").onclick = () => authAction("in");
}

function playTrack(id, isVideo) {
  if (!SB_USER) {
    pendingPlay = { id, isVideo };
    openAuthGate();
    return;
  }
  const m = DB.messages.find((x) => x.id === id);
  const song = DB.songs.find((x) => x.id === id);
  const title = m ? `${m.title} — ${m.speaker}` : song ? `♪ ${song.title}` : id;
  const bar = document.getElementById("player");
  bar.hidden = false;
  document.getElementById("player-title").textContent = title + (isVideo ? " (preview — test data)" : "");
  track("playback_started", { id, kind: m ? "message" : "song" });
  if (m) {
    // Simulate progress so Continue Watching fills in
    const timer = setInterval(() => {
      const p = store.progress;
      const cur = (p[id]?.pos || 0) + 30;
      if (cur >= m.durationSec - 15) { delete p[id]; store.progress = p; clearInterval(timer); openFinished(id); return; }
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
    : `<div class="pv-zoom" style="background-image:${artwork(m.id)}"></div>`;
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

/* Header auto-hides on scroll down, returns on scroll up (cleaner reading). */
let lastY = 0;
window.addEventListener("scroll", () => {
  const y = window.scrollY || 0;
  const nav = document.querySelector(".nav");
  if (!nav) return;
  if (y > 8 && y > lastY + 2) nav.classList.add("nav-hidden");
  else if (y < lastY - 2) nav.classList.remove("nav-hidden");
  lastY = y;
}, { passive: true });

/* ---- Install: always-visible button + per-device guide ----
   Chrome/Android may offer a one-tap prompt (beforeinstallprompt); every
   other browser gets simple manual steps. No prompt? The guide still works. */
let deferredPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

function isInstalled() {
  return window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true; // iOS home-screen apps
}

function installSteps() {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const android = /android/i.test(navigator.userAgent);
  if (ios) return `<b>iPhone / iPad</b><br>1. Tap <b>Share</b> (square with arrow) below.<br>2. Tap <b>Add to Home Screen</b>.<br>3. Tap <b>Add</b> — PCO TV opens fullscreen like a real app.`;
  if (android) return `<b>Android</b><br>1. Tap the <b>⋮ menu</b> (top right).<br>2. Tap <b>Add to Home screen</b> or <b>Install app</b>.<br>3. Confirm — find PCO TV on your home screen.`;
  return `<b>Computer</b><br>1. Click the <b>install icon</b> at the right of the address bar.<br>2. Click <b>Install</b>.<br>Or Chrome menu (⋮) → <b>Save and share → Install page as app</b>.`;
}

function openInstallGuide() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt = null;
    return;
  }
  openSheet("📲 Install PCO TV", `
    <p style="color:var(--muted)">Get the app icon, fullscreen viewing, and offline access. Free, no app store needed.</p>
    <p>${installSteps()}</p>`);
}

function setupInstallButton() {
  // No top-bar button (per request): the popup + sidebar entry are the way in.
  const b = document.getElementById("install");
  if (b) b.hidden = true;
}

/* Install suggestion popup: appears once per visit, stays 5s, ✕ to dismiss.
   After cancel it never nags again this visit — the nav "Install app"
   button stays as the quiet, easy-to-find entry point. */
const INSTALL_SHOW_MS = 5000;
function installPopup() {
  if (isInstalled()) return;
  if (sessionStorage.getItem("pco.installShown") === "1") return;
  sessionStorage.setItem("pco.installShown", "1");
  setTimeout(() => {
    if (document.getElementById("install-toast") || isInstalled()) return;
    const toast = el(`<div id="install-toast" class="install-toast" role="dialog" aria-label="Install app suggestion">
      <button id="it-x" aria-label="Dismiss">✕</button>
      <div><b>📲 Get the PCO TV app</b><div>Icon, fullscreen, works offline — free.</div>
      <div class="toast-bar"><i></i></div></div>
      <button class="btn primary" id="it-go">Install</button></div>`);
    document.body.append(toast);
    toast.querySelector(".toast-bar i").style.animationDuration = `${INSTALL_SHOW_MS}ms`;
    const done = () => toast.remove();
    toast.querySelector("#it-x").onclick = done;
    toast.querySelector("#it-go").onclick = () => { done(); openInstallGuide(); };
    setTimeout(() => { toast.classList.add("leaving"); setTimeout(done, 300); }, INSTALL_SHOW_MS);
  }, 1500);
}

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
    scheduleSync();
  }
/* Cloud catalog: admin-published items (pco_catalog) merge into the local
   seed library at boot. Offline or unconfigured → seed only. */
async function mergeCloudCatalog() {
  try {
    const sb = await sbClient();
    if (!sb) return;
    const { data, error } = await sb.from("pco_catalog").select("id,kind,data").eq("status", "published").limit(200);
    if (error || !data) return;
    for (const row of data) {
      const d = row.data || {};
      if (row.kind === "message" && d.title && !DB.messages.some((m) => m.id === `c-${row.id}`)) {
        DB.messages.push({
          id: `c-${row.id}`, title: d.title, description: d.description || "",
          speaker: d.speaker || "Pastor Chris Oyakhilome", programId: d.programId || "p-your-loveworld",
          topicIds: d.topicIds || [], publishedAt: d.publishedAt || new Date().toISOString().slice(0, 10),
          durationSec: d.durationSec || 2400, artwork: "16:9", status: "published",
        });
      } else if (row.kind === "program" && d.title && !DB.programs.some((p) => p.id === `c-${row.id}`)) {
        DB.programs.push({ id: `c-${row.id}`, slug: `c-${row.id}`, title: d.title, description: d.description || "", artwork: "16:9" });
      } else if (row.kind === "live" && d.title && !DB.live.some((l) => l.id === `c-${row.id}`)) {
        const upcoming = d.scheduledAt && Date.parse(d.scheduledAt) > Date.now();
        DB.live.push({ id: `c-${row.id}`, title: d.title, status: upcoming ? "scheduled" : "live", scheduledAt: d.scheduledAt || new Date().toISOString(), programId: d.programId || "p-your-loveworld", artwork: "16:9" });
      }
    }
  } catch { /* offline — seed library stands alone */ }
}

  updateOnline();
  ensureAvatar();
  ensureTvButton();
  ensureDrawer();
  applySettings();
  setupInstallButton();
  initAnalytics();
  sbClient().then(() => paintAccount());
  mergeCloudCatalog().then(() => bootRoute());
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
}).catch(() => {
  document.getElementById("screen").innerHTML =
    `<div class="empty" style="margin-top:14px">Couldn't load test data. Serve over http: <b>node scripts/serve.mjs</b> then open http://localhost:5173/index.html</div>`;
});

/* ---- Profile PIN + vault encryption (device-grade protection) ----
   Optional 4-digit PIN per profile. Setting a PIN encrypts that profile's
   data (favorites, progress, comments, premium) with AES-GCM-256, the key
   derived from the PIN via PBKDF2. Plaintext is wiped; the PIN is never
   stored — only a verifier hash. Forget the PIN = data unrecoverable. */
const enc = new TextEncoder(), dec = new TextDecoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const rand = (n) => crypto.getRandomValues(new Uint8Array(n));

function pinMeta() { return JSON.parse(localStorage.getItem("pco.pinMeta") || "{}"); }
function savePinMeta(m) { localStorage.setItem("pco.pinMeta", JSON.stringify(m)); }
const hasPin = (pid) => !!pinMeta()[pid] || !!localStorage.getItem(`pco.${pid}.vault`);

async function deriveKey(pin, salt) {
  const base = await crypto.subtle.importKey("raw", enc.encode(`pco:${pin}`), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function verifier(pin, salt) {
  const k = await deriveKey(pin, salt);
  const sig = await crypto.subtle.encrypt({ name: "AES-GCM", iv: new Uint8Array(12) }, k, enc.encode("pco-pin-ok"));
  return b64(sig);
}

/** Set a PIN: encrypts current profile data into the vault, wipes plaintext. */
async function setPin(pid, pin) {
  const data = {};
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k?.startsWith(`pco.${pid}.`)) { data[k] = localStorage.getItem(k); localStorage.removeItem(k); }
  }
  const salt = rand(16), iv = rand(12);
  const key = await deriveKey(pin, salt);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(data)));
  localStorage.setItem(`pco.${pid}.vault`, JSON.stringify({ salt: b64(salt), iv: b64(iv), data: b64(ct) }));
  localStorage.setItem(`pco.${pid}.verify`, JSON.stringify({ salt: b64(salt), verify: await verifier(pin, salt) }));
  const meta = pinMeta(); meta[pid] = true; savePinMeta(meta);
}

/** Check a PIN without touching data. Throws on wrong PIN. */
async function verifyPin(pid, pin) {
  const raw = localStorage.getItem(`pco.${pid}.verify`);
  if (!raw) throw new Error("wrong pin");
  const v = JSON.parse(raw);
  if ((await verifier(pin, unb64(v.salt))) !== v.verify) throw new Error("wrong pin");
}

/** Unlock attempt: wrong PIN throws, data untouched. */
async function unlockPin(pid, pin) {
  await verifyPin(pid, pin);
  const raw = localStorage.getItem(`pco.${pid}.vault`);
  if (!raw) return;
  const v = JSON.parse(raw);
  const key = await deriveKey(pin, unb64(v.salt));
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(v.iv) }, key, unb64(v.data));
  const data = JSON.parse(dec.decode(pt));
  for (const [k, val] of Object.entries(data)) localStorage.setItem(k, val);
  localStorage.removeItem(`pco.${pid}.vault`);
}

/** Remove PIN (data stays readable on this device afterwards). */
async function removePin(pid, pin) {
  await unlockPin(pid, pin);
  localStorage.removeItem(`pco.${pid}.verify`);
  const meta = pinMeta(); delete meta[pid]; savePinMeta(meta);
}

/* Session PINs live in memory only — never localStorage. Enables silent
   re-lock when switching profiles; a reload forgets them (safe default). */
const sessionPins = {};

async function setActive(pid) {
  const prev = activeId();
  if (!isRemember() && prev && prev !== pid && sessionPins[prev]) {
    await setPin(prev, sessionPins[prev]);
    delete sessionPins[prev];
  }
  localStorage.setItem("pco.activeProfile", pid);
  if (isRemember()) localStorage.setItem("pco.session", pid);
  mergeGuestInto(pid);
  tab = "Home";
  paintAvatar();
  render();
  window.scrollTo(0, 0);
  if (pendingPlay) {
    const p = pendingPlay;
    pendingPlay = null;
    playTrack(p.id, p.isVideo);
  }
  if (pendingSync && SB_USER) {
    pendingSync = false;
    afterAuth().catch(() => {});
  } else if (SB_USER && !cloudCache) {
    // Fresh session on this profile: pull its slice if local is empty.
    cloudLoad().then(() => {
      const slice = cloudCache.profiles?.[pid];
      if (slice && localEmpty()) { applyCloud(slice); render(); }
    }).catch(() => {});
  }
}

async function enterProfile(pid) {
  if (pid === activeId() && !localStorage.getItem(`pco.${pid}.vault`)) {
    tab = "Home"; paintAvatar(); render(); window.scrollTo(0, 0); return;
  }
  if (!hasPin(pid)) { await setActive(pid); return; }
  const name = profiles().find((p) => p.id === pid)?.name || pid;
  askPin(`Profile “${name}” is locked`, async (pin) => {
    await unlockPin(pid, pin);
    sessionPins[pid] = pin;
    await setActive(pid);
  });
}

async function goPicker() {
  const prev = activeId();
  if (!isRemember() && prev && sessionPins[prev]) {
    await setPin(prev, sessionPins[prev]);
    delete sessionPins[prev];
  }
  renderPicker();
}

function managePin(pid) {
  const name = profiles().find((p) => p.id === pid)?.name || pid;
  if (!hasPin(pid)) {
    askPin(`Set a PIN for ${name}`, async (first) => {
      askPin(`Repeat the PIN for ${name}`, async (second) => {
        if (first !== second) { renderPicker(); return; }
        if (!crypto.subtle) { renderPicker(); return; }
        await setPin(pid, first);
        renderPicker();
      });
    });
    return;
  }
  askPin(`Current PIN for ${name}`, async (pin) => {
    await verifyPin(pid, pin);
    openSheet(`PIN · ${name}`, `<div class="rowbtns">
      <button class="btn" id="pin-change">Change PIN</button>
      <button class="btn" id="pin-remove">Remove PIN (data stays readable)</button></div>`);
    const d = document.getElementById("screen");
    d.querySelector("#pin-change").onclick = () => {
      askPin(`New PIN for ${name}`, async (first) => {
        askPin(`Repeat the PIN for ${name}`, async (second) => {
          if (first !== second) { renderPicker(); return; }
          await unlockPin(pid, pin);
          await setPin(pid, first);
          sessionPins[pid] = first;
          renderPicker();
        });
      });
    };
    d.querySelector("#pin-remove").onclick = async () => {
      await removePin(pid, pin);
      renderPicker();
    };
  });
}

function pinPadHtml(title, sub) {
  return `<div style="text-align:center;padding:30px 0"><div class="kicker">${title}</div>
    <h1 style="font-size:28px">Enter PIN</h1>
    <p style="color:var(--muted)">${sub}</p>
    <div id="pin-dots" style="font-size:30px;letter-spacing:12px;margin:10px 0">○○○○</div>
    <div class="pinpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((d) =>
      d === "" ? `<span></span>` : `<button data-pin="${d}">${d}</button>`).join("")}</div>
    <div class="rowbtns" style="justify-content:center"><button class="btn" id="pin-cancel">Cancel</button></div>
    <div id="pin-err" style="color:var(--live);margin-top:8px"></div></div>`;
}

function wirePinPad(scope, onComplete) {
  let entry = "";
  const dots = scope.querySelector("#pin-dots");
  scope.querySelector("#pin-cancel").onclick = goPicker;
  scope.querySelectorAll("[data-pin]").forEach((b) => (b.onclick = async () => {
    if (b.dataset.pin === "⌫") entry = entry.slice(0, -1);
    else if (entry.length < 4) entry += b.dataset.pin;
    dots.textContent = "●".repeat(entry.length) + "○".repeat(4 - entry.length);
    if (entry.length === 4) {
      const pin = entry; entry = "";
      dots.textContent = "○○○○";
      await onComplete(pin).catch(() => {
        scope.querySelector("#pin-err").textContent = "Wrong PIN — try again.";
      });
    }
  }));
}

function askPin(sub, onComplete) {
  const s = document.getElementById("screen");
  s.innerHTML = "";
  const w = el(`<div>${pinPadHtml("PCO TV · PROFILE LOCK", sub)}</div>`);
  s.append(w);
  wirePinPad(w, onComplete);
  window.scrollTo(0, 0);
}

/* ---- Profiles (device-only demo login, PRD §19 family experience) ---- */

function ensureAvatar() {
  if (document.getElementById("profile-btn")) return;
  const b = el(`<button id="profile-btn" aria-label="Switch profile"></button>`);
  b.onclick = goPicker;
  document.querySelector(".nav").insertBefore(b, document.getElementById("install"));
  paintAvatar();
}

function paintAvatar() {
  const b = document.getElementById("profile-btn");
  if (!b) return;
  // Profiles stay invisible until sign-in; guests just browse.
  if (!SB_USER) { b.style.display = "none"; return; }
  b.style.display = "";
  const p = activeProfile();
  b.textContent = p ? p.name[0].toUpperCase() : "?";
  b.style.cssText = `margin-left:8px;width:38px;height:38px;border-radius:50%;border:2px solid var(--gold);background:var(--surface2);color:var(--text);font-size:17px;font-weight:800`;
}

/* ---- Analytics + error capture (PostHog, anonymous, offline-buffered) ----
   Random device id only — never email. Events send when a POSTHOG_KEY is
   configured (via /api/config); otherwise they stay local. Crashes go out
   as $exception events the same way. */
let PH = { key: null, host: "", queue: [] };
function deviceId() {
  let id = localStorage.getItem("pco.device");
  if (!id) {
    id = "d" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("pco.device", id);
  }
  return id;
}
function flushAnalytics() {
  if (!PH.key || !navigator.onLine || !PH.queue.length) return;
  const batch = PH.queue.splice(0, 20);
  fetch(`${PH.host}/capture/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: PH.key,
      batch_key: deviceId(),
      events: batch.map((e) => ({ ...e, distinct_id: deviceId(), properties: { ...(e.properties || {}), app: "pco-tv", device: "web" } })),
    }),
  }).catch(() => { PH.queue.unshift(...batch); });
}
function track(name, props) {
  const e = { event: name, properties: props || {}, timestamp: new Date().toISOString() };
  if (!PH.key) return; // unconfigured: no-op (nothing leaves the device)
  PH.queue.push(e);
  if (PH.queue.length > 50) PH.queue.shift();
  if (navigator.onLine) flushAnalytics();
  else {
    try { localStorage.setItem("pco.analytics", JSON.stringify(PH.queue)); } catch { /* full */ }
  }
}
window.addEventListener("online", flushAnalytics);
window.addEventListener("error", (e) => track("$exception", { message: String(e.message || "error").slice(0, 200), source: String(e.filename || "").slice(-60) }));
window.addEventListener("unhandledrejection", (e) => track("$exception", { message: String(e.reason?.message || e.reason || "rejection").slice(0, 200) }));

async function initAnalytics() {
  try {
    const r = await fetch("/api/config");
    if (!r.ok) return;
    const cfg = await r.json();
    if (!cfg.posthogKey) return;
    PH.key = cfg.posthogKey;
    PH.host = cfg.posthogHost || "https://us.i.posthog.com";
    try { PH.queue = JSON.parse(localStorage.getItem("pco.analytics") || "[]"); } catch { PH.queue = []; }
    track("app_open", { tab });
  } catch { /* analytics optional */ }
}

/* ---- Supabase accounts: real login, cloud-synced personal data ----
   Email auth via Supabase (free tier). One row per user in pco_data (RLS:
   owners only). localStorage stays the offline cache; cloud is the truth
   across devices. Device profiles + PINs stay local-only by design. */
let SB = null, SB_USER = null, syncTimer = null;
const DATA_KEYS = ["favs", "saved", "progress", "follows", "comments", "premium", "hidden"];

async function sbClient() {
  if (SB) return SB;
  let cfg;
  try {
    const r = await fetch("/api/config");
    if (!r.ok) return null;
    cfg = await r.json();
  } catch { return null; }
  try {
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.44.4");
    SB = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const { data } = await SB.auth.getSession();
    SB_USER = data.session?.user || null;
    SB.auth.onAuthStateChange((_ev, session) => {
      SB_USER = session?.user || null;
      paintAccount();
      paintAvatar();
    });
    return SB;
  } catch { return null; }
}

function collectLocal() {
  const out = {};
  for (const k of DATA_KEYS) {
    try { out[k] = JSON.parse(localStorage.getItem(K(k)) || (k === "progress" ? "{}" : k === "comments" ? "{}" : "[]")); }
    catch { out[k] = null; }
  }
  if (localStorage.getItem(K("premium")) === "1") out.premium = "1";
  return out;
}

function applyCloud(data) {
  for (const k of DATA_KEYS) {
    if (data[k] === undefined || data[k] === null) continue;
    localStorage.setItem(K(k), typeof data[k] === "string" ? data[k] : JSON.stringify(data[k]));
  }
}

async function cloudRow() {
  const { data, error } = await SB.from("pco_data").select("data").eq("user_id", SB_USER.id).maybeSingle();
  if (error) throw error;
  return data;
}

/* Cloud shape: { profiles: { <pid>: {...DATA_KEYS} } } — every device
   profile gets its own slice, so switching profiles can never clobber
   another profile's data. Sync only runs with an active profile. */
let cloudCache = null, pendingSync = false;

function localEmpty() {
  const local = collectLocal();
  return DATA_KEYS.every((k) => {
    const v = local[k];
    return v === null || v === undefined || (Array.isArray(v) && !v.length) || (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length);
  });
}

async function cloudLoad() {
  const row = await cloudRow();
  cloudCache = (row && row.data) || { profiles: {} };
  return cloudCache;
}

async function cloudSave() {
  if (!SB || !SB_USER || !activeId()) return;
  cloudCache = cloudCache || { profiles: {} };
  cloudCache.profiles = cloudCache.profiles || {};
  cloudCache.profiles[activeId()] = collectLocal();
  await SB.from("pco_data").upsert({ user_id: SB_USER.id, data: cloudCache, updated_at: new Date().toISOString() });
}

function scheduleSync() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    if (!SB || !SB_USER || !activeId()) return;
    try { await cloudSave(); }
    catch { /* offline — local copy remains truth until next sync */ }
  }, 3000);
}

/** First sign-in: needs an active profile (deferred to picker otherwise). */
async function afterAuth() {
  paintAccount();
  if (!activeId()) { pendingSync = true; renderPicker(); return; }
  try {
    await cloudLoad();
    const slice = cloudCache.profiles?.[activeId()];
    if (!slice) await cloudSave();
    else if (localEmpty()) applyCloud(slice);
    else await cloudSave(); // both sides have data: device wins, merged up
  } catch { /* table missing? run the SQL in docs/SUPABASE.md */ }
  if (pendingComment) {
    const pc = pendingComment;
    pendingComment = null;
    try { postComment(pc.msgId, pc.text); } catch { /* session not ready */ }
    openDetail(pc.msgId);
    return;
  }
  if (pendingPlay) renderPicker(); // choose a profile — playback starts on entry
  else render();
}

function paintAccount() {
  let chip = document.getElementById("account-chip");
  document.getElementById("signin-btn")?.remove();
  if (!SB_USER) { chip?.remove(); return; }
  if (!chip) {
    chip = el(`<button id="account-chip" aria-label="Account"></button>`);
    chip.onclick = accountSheet;
    document.querySelector(".nav").append(chip);
  }
  chip.textContent = "👤 " + (SB_USER.email || "account").split("@")[0];
  chip.style.cssText = "margin-left:8px;background:var(--surface2);border:1px solid var(--line);color:var(--text);border-radius:999px;padding:8px 14px;font-size:14px";
}

function accountSheet() {
  openSheet(`👤 ${SB_USER?.email || "Account"}`, `
    <p style="color:var(--muted)">Signed in. Your favorites, progress, reflections, and subscription sync to any device with this login. Profiles + PINs stay on each device.</p>
    <div class="rowbtns"><button class="btn primary" id="acc-sync">Sync now</button>
    <button class="btn" id="acc-out">Sign out</button></div>
    <div id="acc-msg" style="color:var(--muted);margin-top:10px"></div>`);
  const d = document.getElementById("screen");
  d.querySelector("#acc-sync").onclick = async () => {
    d.querySelector("#acc-msg").textContent = "Syncing…";
    try {
      await cloudLoad();
      const slice = cloudCache.profiles?.[activeId()];
      if (slice) applyCloud(slice);
      d.querySelector("#acc-msg").textContent = "Synced ✓";
      render();
    } catch { d.querySelector("#acc-msg").textContent = "Sync failed — offline?"; }
  };
  d.querySelector("#acc-out").onclick = async () => {
    await SB.auth.signOut();
    SB_USER = null;
    paintAccount();
    renderLanding();
  };
}

async function authAction(mode) {
  const email = document.getElementById("acc-email")?.value.trim();
  const pw = document.getElementById("acc-pw")?.value || "";
  const msg = document.getElementById("acc-msg");
  if (!email?.includes("@") || pw.length < 6) {
    if (msg) msg.textContent = "Enter an email and a 6+ character password.";
    return;
  }
  if (msg) msg.textContent = "Connecting…";
  if (mode === "up") {
    // Reject fake/typo domains before creating the account (MX lookup).
    // Note: a real domain with a made-up name (x@gmail.com) still passes —
    // only a confirmation email can catch those.
    try {
      const domain = email.split("@")[1].toLowerCase();
      const chk = await (await fetch(`/api/email-check?domain=${encodeURIComponent(domain)}`)).json();
      if (!chk.valid) {
        if (msg) msg.textContent = "That email domain doesn't accept mail — check for typos.";
        return;
      }
    } catch { /* offline — let Supabase decide */ }
  }
  try {
    const sb = await sbClient();
    if (!sb) throw new Error("offline");
    const { data, error } = mode === "up"
      ? await sb.auth.signUp({ email, password: pw })
      : await sb.auth.signInWithPassword({ email, password: pw });
    if (error) throw error;
    SB_USER = data.user || data.session?.user || SB_USER;
    if (!SB_USER) {
      const { data: s2 } = await sb.auth.getSession();
      SB_USER = s2.session?.user || null;
    }
    if (msg) msg.textContent = SB_USER ? "Signed in ✓" : "Check your email to confirm, then sign in.";
    if (SB_USER) { track(mode === "up" ? "signed_up" : "signed_in", {}); await afterAuth(); }
  } catch (e) {
    if (msg) msg.textContent = "Couldn't sign in: " + (e.message || "offline?");
  }
}

/* ---- TV companion mode: TV displays, phone is the remote ----
   TV opens TV mode and shows a 6-letter code. Phone enters the code and
   sends commands over a Supabase Realtime broadcast channel (pco-tv-CODE).
   No new vendor, no pairing accounts. TV enforces the same signup gate. */
let TV = { active: false, code: "", channel: null, connected: false, focusIdx: 0 };

function tvCode() {
  const abc = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => abc[Math.floor(Math.random() * abc.length)]).join("");
}

async function enterTvMode() {
  stopPreview();
  const sb = await sbClient();
  if (!sb) {
    openSheet("📺 TV mode", `<p style="color:var(--muted)">TV mode needs internet and configured accounts (same setup as sign-in). Then try again.</p>`);
    return;
  }
  TV.active = true;
  TV.code = tvCode();
  TV.connected = false;
  TV.channel = sb.channel(`pco-tv-${TV.code}`);
  TV.channel.on("broadcast", { event: "cmd" }, ({ payload }) => tvCommand(payload));
  let status = "unknown";
  try {
    status = await TV.channel.subscribe();
  } catch (e) {
    status = "error";
  }
  if (status !== "SUBSCRIBED") {
    console.warn("[tv] live channel failed:", status);
    TV.active = false;
    openSheet("📺 TV mode", `<p style="color:var(--muted)">Couldn't connect to the TV link. Check your internet connection and try again.</p>`);
    return;
  }
  renderTvScreen();
}

function exitTvMode() {
  TV.active = false;
  try { TV.channel?.unsubscribe(); } catch { /* noop */ }
  TV.channel = null;
  render();
}

function renderTvScreen() {
  const s = document.getElementById("screen");
  s.innerHTML = "";
  const w = el(`<div style="text-align:center;padding:36px 0;max-width:720px;margin:0 auto">
    <div class="kicker">PCO TV · TV MODE ${TV.connected ? "· CONNECTED ✓" : "· WAITING FOR PHONE…"}</div>
    <h1 style="font-size:clamp(30px,6vw,52px);margin:12px 0">Turn on. Find something meaningful. Watch.</h1>
    <div style="font-size:56px;font-weight:800;letter-spacing:14px;color:var(--gold);margin:10px 0" aria-label="Pairing code">${TV.code}</div>
    <p style="color:var(--muted);font-size:17px">On your phone: open PCO TV → tap <b>📺 TV</b> → <b>Control a TV</b> → enter this code.<br>Then drive this screen from the phone. Same signup rules apply here.</p>
    <div class="rowbtns" style="justify-content:center"><button class="btn" id="tv-exit">Exit TV mode</button></div>
    <div id="tv-stage" style="margin-top:18px;text-align:left"></div></div>`);
  s.append(w);
  w.querySelector("#tv-exit").onclick = exitTvMode;
  window.scrollTo(0, 0);
}

/* Commands from the phone. Focus moves for D-pad; content actions reuse the app. */
function tvCommand(cmd) {
  if (!TV.active || !cmd || typeof cmd.t !== "string") return;
  TV.connected = true;
  const stage = document.getElementById("tv-stage");
  const focusables = () => [...document.querySelectorAll("#screen button, .nav button")].filter((b) => b.offsetParent !== null);
  switch (cmd.t) {
    case "tab":
      if (TABS.includes(cmd.id)) { tab = cmd.id; render(); renderTvChrome(); }
      break;
    case "detail":
      openDetail(cmd.id);
      break;
    case "play":
      playTrack(cmd.id, true);
      break;
    case "pause":
      document.getElementById("player").hidden = true;
      break;
    case "back":
      render(); renderTvChrome();
      break;
    case "move": {
      const items = focusables();
      if (!items.length) break;
      TV.focusIdx = ((TV.focusIdx + (cmd.dir === 1 ? 1 : -1)) % items.length + items.length) % items.length;
      items[TV.focusIdx].focus();
      items[TV.focusIdx].scrollIntoView({ block: "nearest" });
      break;
    }
    case "ok": {
      const items = focusables();
      if (items[TV.focusIdx]) items[TV.focusIdx].click();
      break;
    }
  }
  void stage;
}

/* Re-render content under the TV chrome after tab/back commands. */
function renderTvChrome() {
  if (!TV.active) return;
  const code = TV.code, connected = TV.connected;
  render();
  const s = document.getElementById("screen");
  const bar = el(`<div style="text-align:center;padding:10px;border:1px solid var(--line);border-radius:12px;margin-bottom:8px">
    <span class="kicker">TV MODE · CODE ${code} ${connected ? "· CONNECTED ✓" : ""}</span>
    <div class="rowbtns" style="justify-content:center;margin-top:6px"><button class="btn" id="tv-exit2">Exit TV mode</button></div></div>`);
  s.prepend(bar);
  bar.querySelector("#tv-exit2").onclick = exitTvMode;
}

function ensureTvButton() {
  // TV lives in the sidebar only — no header button (keeps the bar clean).
  document.getElementById("tv-btn")?.remove();
}

let RC = null; // remote channel
async function openTvRemote() {
  openSheet("📺 TV", `
    <div class="rowbtns"><button class="btn primary" id="tv-host">Show TV code (this is the TV)</button></div>
    <div style="margin-top:16px"><b>Control a TV</b>
    <p style="color:var(--muted);font-size:14px">Enter the 6-letter code shown on the TV screen.</p>
    <input id="tv-code" class="searchbar" placeholder="ABC123" maxlength="6" style="text-transform:uppercase" aria-label="TV code">
    <div class="rowbtns"><button class="btn primary" id="tv-join">Connect</button></div>
    <div id="tv-msg" style="color:var(--muted);font-size:14px;margin-top:8px"></div></div>`);
  const d = document.getElementById("screen");
  d.querySelector("#tv-host").onclick = enterTvMode;
  d.querySelector("#tv-join").onclick = async () => {
    const code = (d.querySelector("#tv-code").value || "").trim().toUpperCase();
    const msg = d.querySelector("#tv-msg");
    if (!/^[A-Z2-9]{6}$/.test(code)) { msg.textContent = "Enter the 6-letter code from the TV."; return; }
    msg.textContent = "Connecting…";
    const sb = await sbClient();
    if (!sb) { msg.textContent = "Needs internet + configured accounts."; return; }
    try { await RC?.unsubscribe(); } catch { /* noop */ }
    RC = sb.channel(`pco-tv-${code}`);
    let st = "unknown";
    try {
      st = await RC.subscribe();
    } catch { st = "error"; }
    if (st !== "SUBSCRIBED") {
      console.warn("[tv] remote join failed:", st);
      msg.textContent = "Couldn't reach that TV. Check the code and connection, then try again.";
      try { await RC?.unsubscribe(); } catch { /* noop */ }
      RC = null;
      return;
    }
    remoteUI(code);
  };
}

function sendCmd(cmd) {
  if (!RC) return;
  RC.send({ type: "broadcast", event: "cmd", payload: cmd });
}

function remoteUI(code) {
  openSheet(`📺 Remote · ${code}`, `
    <div class="rpad">
      <div></div><button data-rc="up">▲</button><div></div>
      <button data-rc="left">◀</button><button data-rc="ok">OK</button><button data-rc="right">▶</button>
      <div></div><button data-rc="down">▼</button><div></div>
    </div>
    <div class="chips" style="justify-content:center">
      ${TABS.map((t) => `<button data-rtab="${t}">${t}</button>`).join("")}
    </div>
    <div class="rowbtns" style="justify-content:center">
      <button class="btn" data-rc="pause">⏸ Pause TV</button>
      <button class="btn" data-rc="back">← Back</button>
      <button class="btn" id="rc-off">Disconnect</button>
    </div>
    <p style="color:var(--muted);font-size:13px;text-align:center">Drive the TV: move + OK to browse, tabs to jump, Back to go back.</p>`);
  const d = document.getElementById("screen");
  d.querySelectorAll("[data-rc]").forEach((b) => (b.onclick = () => {
    const k = b.dataset.rc;
    if (k === "up" || k === "left") sendCmd({ t: "move", dir: -1 });
    else if (k === "down" || k === "right") sendCmd({ t: "move", dir: 1 });
    else sendCmd({ t: k });
  }));
  d.querySelectorAll("[data-rtab]").forEach((b) => (b.onclick = () => sendCmd({ t: "tab", id: b.dataset.rtab })));
  d.querySelector("#rc-off").onclick = async () => {
    try { await RC?.unsubscribe(); } catch { /* noop */ }
    RC = null;
    render();
  };
}

/* ---- Sidebar drawer: Billing, Settings, Account (not a dashboard) ---- */
const BILLING_PLANS_UI = [
  { id: "monthly", name: "Monthly", price: "₦1,500/mo" },
  { id: "quarterly", name: "Quarterly", price: "₦4,000/3 mo" },
  { id: "annual", name: "Annual", price: "₦15,000/yr" },
];

function ensureDrawer() {
  if (document.getElementById("menu-btn")) return;
  const b = el(`<button id="menu-btn" aria-label="Menu">☰</button>`);
  b.style.cssText = "background:none;border:1px solid var(--line);color:var(--text);border-radius:10px;padding:9px 12px;font-size:17px;margin-right:4px";
  b.onclick = openDrawer;
  document.querySelector(".nav").prepend(b);
  const scrim = el(`<div id="scrim" hidden></div>`);
  scrim.onclick = closeDrawer;
  document.body.append(scrim);
  const d = el(`<aside id="drawer" hidden aria-label="Menu">
    <div class="drawer-head"><div class="logo">PCO <span>TV</span></div><button id="drawer-x" aria-label="Close">✕</button></div>
    <button data-go="billing">💳 <span class="dl" data-k="Billing">Billing</span></button>
    <button data-go="settings">⚙ <span class="dl" data-k="Settings">Settings</span></button>
    <button data-go="account" id="drawer-account">👤 <span class="dl" data-k="Account">Account</span></button>
    <button data-go="signin" id="drawer-signin">🔑 <span class="dl" data-k="Sign In">Sign In</span></button>
    <button data-go="tv">📺 <span class="dl" data-k="TV mode">TV mode</span></button>
    <button data-go="install">📲 <span class="dl" data-k="Install app">Install app</span></button>
  </aside>`);
  document.body.append(d);
  d.querySelector("#drawer-x").onclick = closeDrawer;
  d.querySelectorAll("[data-go]").forEach((x) => (x.onclick = () => {
    closeDrawer();
    ({ billing: openBilling, settings: openSettings, account: () => (SB_USER ? accountSheet() : renderLanding()), signin: renderLanding, tv: openTvRemote, install: openInstallGuide })[x.dataset.go]();
  }));
}

function openDrawer() {
  document.querySelectorAll("#drawer .dl").forEach((s) => { s.textContent = t(s.dataset.k); });
  document.getElementById("drawer-signin").style.display = SB_USER ? "none" : "";
  document.getElementById("drawer-account").style.display = SB_USER ? "" : "none";
  document.getElementById("drawer").hidden = false;
  document.getElementById("scrim").hidden = false;
  requestAnimationFrame(() => document.getElementById("drawer").classList.add("open"));
}
function closeDrawer() {
  document.getElementById("drawer")?.classList.remove("open");
  const d = document.getElementById("drawer"), s = document.getElementById("scrim");
  if (d) setTimeout(() => { d.hidden = true; }, 200);
  if (s) s.hidden = true;
}

async function billingCall(payload) {
  const r = await fetch("/api/paystack/billing", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const out = await r.json();
  if (!r.ok) throw new Error(out.error || "billing failed");
  return out;
}

function openBilling() {
  if (!SB_USER) {
    openSheet("💳 Billing", `<p style="color:var(--muted)">Sign in to manage your subscription — plans, saved card, and cancel live here.</p>
      <div class="rowbtns"><button class="btn primary" id="b-login">Sign in</button></div>`);
    document.getElementById("screen").querySelector("#b-login").onclick = renderLanding;
    return;
  }
  openSheet(`💳 ${t("Billing")}`, `<div id="bill-body"><p style="color:var(--muted)">Loading subscription…</p></div>`);
  const body = document.getElementById("screen").querySelector("#bill-body");
  billingCall({ action: "status", email: SB_USER.email }).then(({ subscription: sub }) => {
    const active = sub && sub.status === "active";
    body.innerHTML = `
      ${active ? `<div class="detail" style="margin:0 0 12px"><b>★ ${sub.amount / 100 >= 1000 ? "Annual" : sub.amount / 100 >= 3000 ? "Quarterly" : "Monthly"} · Active</b>
        <div style="color:var(--muted);font-size:14px">Renews ${sub.next_payment ? new Date(sub.next_payment).toDateString() : "soon"} · ${sub.card || "card on file"}</div>
        <div class="rowbtns"><button class="btn" id="b-cancel">${t("Cancel auto-renew")}</button></div></div>`
      : `<p style="color:var(--muted)">No active subscription${sub ? ` (last: ${sub.status})` : ""}. Pick a plan — test mode, no real charge:</p>
        <div class="chips" id="b-plans">${BILLING_PLANS_UI.map((p, i) =>
          `<button data-plan="${p.id}" aria-pressed="${i === 0}"><b>${t(p.name)}</b><br>${p.price}</button>`).join("")}</div>
        <div class="rowbtns"><button class="btn primary" id="b-go">${t("Continue to checkout")}</button></div>`}
      <div id="b-msg" style="color:var(--muted);font-size:14px;margin-top:8px"></div>`;
    let plan = "monthly";
    body.querySelectorAll("[data-plan]")?.forEach((x) => (x.onclick = () => {
      plan = x.dataset.plan;
      body.querySelectorAll("[data-plan]").forEach((y) => y.setAttribute("aria-pressed", String(y === x)));
    }));
    const go = body.querySelector("#b-go");
    if (go) go.onclick = async () => {
      body.querySelector("#b-msg").textContent = "Starting test checkout…";
      try {
        const out = await billingCall({ action: "init", email: SB_USER.email, plan });
        track("checkout_started", { plan });
        location.href = out.authorization_url;
      } catch (e) { body.querySelector("#b-msg").textContent = "Checkout failed: " + e.message; }
    };
    const cancel = body.querySelector("#b-cancel");
    if (cancel) cancel.onclick = async () => {
      if (!confirm("Cancel auto-renew? You keep access until the period ends.")) return;
      body.querySelector("#b-msg").textContent = "Cancelling…";
      try {
        await billingCall({ action: "disable", code: sub.code, token: sub.token });
        localStorage.removeItem(K("premium"));
        body.querySelector("#b-msg").textContent = "Auto-renew cancelled ✓";
        setTimeout(openBilling, 1200);
      } catch (e) { body.querySelector("#b-msg").textContent = "Cancel failed: " + e.message; }
    };
  }).catch((e) => {
    body.innerHTML = `<div class="empty">Billing unavailable: ${esc(e.message)}. Everything else still works.</div>`;
  });
}

/* Settings: language (framework ready), brightness, light/dark theme. */
function appSettings() {
  try { return JSON.parse(localStorage.getItem("pco.settings") || "{}"); }
  catch { return {}; }
}
function saveSettings(s) { localStorage.setItem("pco.settings", JSON.stringify(s)); }
function applySettings() {
  const s = appSettings();
  document.documentElement.dataset.theme = s.theme === "light" ? "light" : "dark";
  let ov = document.getElementById("bright");
  if (s.brightness > 0) {
    if (!ov) {
      ov = el(`<div id="bright"></div>`);
      document.body.append(ov);
    }
    ov.style.opacity = Math.min(0.7, s.brightness / 100);
  } else ov?.remove();
}
function openSettings() {
  const s = appSettings();
  openSheet(`⚙ ${t("Settings")}`, `
    <h2>${t("Language")}</h2>
    <div class="chips" id="set-lang">
      <button data-lang="en" aria-pressed="${lang() === "en"}">English</button>
      <button data-lang="fr" aria-pressed="${lang() === "fr"}">Français</button>
      <button data-lang="es" aria-pressed="${lang() === "es"}">Español</button>
    </div>
    <p style="color:var(--muted);font-size:14px">Menus and buttons translate. Video titles stay in English for now.</p>
    <h2>${t("Brightness")}</h2>
    <input id="set-bright" type="range" min="0" max="70" value="${s.brightness || 0}" style="width:100%" aria-label="Brightness">
    <h2>${t("Appearance")}</h2>
    <div class="chips" id="set-theme">
      <button data-th="dark" aria-pressed="${(s.theme || "dark") === "dark"}">🌙 Dark</button>
      <button data-th="light" aria-pressed="${s.theme === "light"}">☀ Light</button>
    </div>`);
  const d = document.getElementById("screen");
  d.querySelectorAll("[data-lang]").forEach((x) => (x.onclick = () => {
    saveSettings({ ...appSettings(), lang: x.dataset.lang });
    render();
  }));
  d.querySelector("#set-bright").oninput = (e) => {
    const next = { ...appSettings(), brightness: +e.target.value };
    saveSettings(next);
    applySettings();
  };
  d.querySelectorAll("[data-th]").forEach((x) => (x.onclick = () => {
    saveSettings({ ...appSettings(), theme: x.dataset.th });
    applySettings();
    openSettings();
  }));
}

/* ---- Landing + persistent session (Netflix-style: log in once, stay in) ---- */
const isRemember = () => localStorage.getItem("pco.remember") !== "0";
const savedSession = () => localStorage.getItem("pco.session") || "";

function bootRoute() {
  const sid = savedSession();
  const ok = sid && profiles().some((p) => p.id === sid) &&
    !localStorage.getItem(`pco.${sid}.vault`);
  if (ok) {
    localStorage.setItem("pco.activeProfile", sid);
    tab = "Home";
    paintAvatar();
    render();
  } else {
    browseAsGuest(); // straight into content — no gate before browsing
  }
}

function renderLanding() {
  stopPreview();
  const s = document.getElementById("screen");
  s.innerHTML = "";
  const w = el(`<div style="text-align:center;padding:48px 0 30px;max-width:640px;margin:0 auto">
    <div class="logo" style="font-size:34px">PCO <span>TV</span></div>
    <h1 style="font-size:clamp(30px,6vw,46px);margin:14px 0 6px">Turn on. Find something meaningful. Watch.</h1>
    <p style="color:var(--muted);font-size:17px">Messages, music, and live for the whole family.</p>
    <div class="rowbtns" style="justify-content:center;margin-top:18px">
      <button class="btn primary" id="land-go" style="font-size:17px;padding:14px 34px">Sign In</button>
      <button class="btn" id="land-browse" style="font-size:17px;padding:14px 26px">Browse first →</button>
    </div>
    <label style="display:block;margin-top:14px;color:var(--muted);font-size:14px">
      <input type="checkbox" id="land-remember" ${isRemember() ? "checked" : ""}> Keep me signed in on this device</label>
    <div class="detail" style="margin-top:22px;text-align:left">
      <b>👤 Account (syncs across devices)</b>
      <p style="color:var(--muted);font-size:14px">Optional. Without it, everything stays on this device only.</p>
      <input id="acc-email" class="searchbar" type="email" placeholder="you@example.com" aria-label="Email">
      <input id="acc-pw" class="searchbar" type="password" placeholder="Password (6+ characters)" aria-label="Password">
      <div class="rowbtns"><button class="btn primary" id="acc-in">Sign in</button>
      <button class="btn" id="acc-up">Create account</button></div>
      <div style="margin-top:8px"><a href="reset.html" style="color:var(--muted);font-size:14px">Forgot password?</a></div>
      <div id="acc-msg" style="color:var(--muted);font-size:14px;margin-top:8px"></div>
    </div>
    <div class="chips" style="justify-content:center;margin-top:22px">
      <span class="amen">🎙 Messages</span><span class="amen">🎵 Music</span><span class="amen">🔴 Live</span>
    </div>
    <p style="color:var(--faint);font-size:12px;margin-top:22px">Demo build · test data · profiles + PINs live on this device only.</p>
  </div>`);
  s.append(w);
  w.querySelector("#land-remember").onchange = (e) => {
    localStorage.setItem("pco.remember", e.target.checked ? "1" : "0");
    if (!e.target.checked) localStorage.removeItem("pco.session");
  };
  w.querySelector("#land-go").onclick = renderPicker;
  w.querySelector("#land-browse").onclick = browseAsGuest;
  w.querySelector("#acc-in").onclick = () => authAction("in");
  w.querySelector("#acc-up").onclick = () => authAction("up");
  sbClient().then((sb) => { if (sb) paintAccount(); });
  window.scrollTo(0, 0);
}

async function signOut() {
  const prev = activeId();
  if (prev && sessionPins[prev]) {
    await setPin(prev, sessionPins[prev]);
    delete sessionPins[prev];
  }
  localStorage.removeItem("pco.session");
  localStorage.removeItem("pco.activeProfile");
  tab = "Home";
  paintAvatar();
  renderLanding();
}

function renderPicker() {
  stopPreview();
  const s = document.getElementById("screen");
  s.innerHTML = "";
  const wrap = el(`<div style="text-align:center;padding:40px 0"><div class="kicker">PCO TV · WHO'S WATCHING?</div>
    <h1 style="font-size:32px">${t("Choose your profile")}</h1>
    <p style="color:var(--muted)">Profiles live on this device only. Each person gets their own favorites, progress, and subscriptions.</p>
    <div id="plist" style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:20px"></div>
    <div style="margin-top:22px"><input id="newprof" class="searchbar" style="max-width:280px;margin:0 auto" placeholder="New profile name…" aria-label="New profile name" maxlength="20">
    <div class="rowbtns" style="justify-content:center"><button class="btn primary" id="addprof">＋ Add profile</button></div></div></div>`);
  s.append(wrap);
  const add = () => {
    const input = wrap.querySelector("#newprof");
    const rec = addProfile(input.value);
    if (rec) enterProfile(rec.id);
    else input.focus();
  };
  wrap.querySelector("#addprof").onclick = add;
  wrap.querySelector("#newprof").onkeydown = (e) => { if (e.key === "Enter") add(); };
  const list = wrap.querySelector("#plist");
  profiles().forEach((p) => {
    const locked = hasPin(p.id);
    const cell = el(`<div style="display:flex;flex-direction:column;gap:8px;align-items:center"></div>`);
    const t = el(`<button style="background:var(--surface);border:2px solid var(--gold);border-radius:16px;padding:22px 26px;color:var(--text);font-size:17px;min-width:130px">
      <div style="font-size:34px;font-weight:800;color:var(--gold)">${esc(p.name[0])}</div>${esc(p.name)} ${locked ? "🔒" : ""}</button>`);
    t.onclick = () => enterProfile(p.id);
    const row = el(`<div style="display:flex;gap:6px"></div>`);
    const gear = el(`<button class="btn" style="font-size:13px;padding:6px 12px">${locked ? "PIN ⚙" : "Set PIN 🔓"}</button>`);
    gear.onclick = (e) => { e.stopPropagation(); managePin(p.id); };
    const del = el(`<button class="btn" style="font-size:13px;padding:6px 12px" aria-label="Delete profile">✕</button>`);
    del.onclick = (e) => {
      e.stopPropagation();
      if (confirm(`Delete ${p.name}'s profile and all their saved data on this device?`)) {
        deleteProfile(p.id);
        renderPicker();
      }
    };
    row.append(gear, del);
    cell.append(t, row);
    list.append(cell);
  });
  if (savedSession()) {
    const out = el(`<div class="rowbtns" style="justify-content:center;margin-top:26px">
      <button class="btn" id="signout">Sign out (log in again next visit)</button></div>`);
    wrap.append(out);
    out.querySelector("#signout").onclick = signOut;
  }
  window.scrollTo(0, 0);
}
