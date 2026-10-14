/** Zero-dependency static server for the PWA (service workers need http://localhost). */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
};

// Load repo-root .env (key names only are ever referenced; values are never logged).
try {
  const envFile = join(root, "..", "..", ".env");
  if (existsSync(envFile)) {
    for (const line of readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  }
} catch { /* .env optional — payments stay disabled without it */ }

const PAYSTACK_BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

/* Rate limits (per IP, sliding window): general API 30/min, checkout starts 5/hour.
   Stops spam/abuse of the key-backed endpoints. Tune via env. */
const RATE = { windowMs: 60000, max: 30, initMax: 5, initWindowMs: 3600000 };
const hits = new Map(); // ip -> { times: number[] }
const initHits = new Map(); // ip -> { times: number[] }
function limited(map, ip, max, windowMs) {
  const now = Date.now();
  const rec = map.get(ip) || { times: [] };
  rec.times = rec.times.filter((t) => now - t < windowMs);
  if (rec.times.length >= max) return true;
  rec.times.push(now);
  map.set(ip, rec);
  return false;
}
const clientIp = (req) => (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "local").split(",")[0].trim();

/* Recurring plans (NGN kobo). Auto-created in Paystack on first use. */
const BILLING_PLANS = {
  monthly: { name: "PCO Monthly", interval: "monthly", amount: 150000 },
  quarterly: { name: "PCO Quarterly", interval: "quarterly", amount: 400000 },
  annual: { name: "PCO Yearly", interval: "annually", amount: 1500000 },
};

async function paystackPlan(secret, planId) {
  const def = BILLING_PLANS[planId];
  if (!def) throw new Error("unknown plan");
  const list = await (await fetch(`${PAYSTACK_BASE}/plan?perPage=100`, {
    headers: { Authorization: `Bearer ${secret}` },
  })).json();
  const found = (list.data || []).find((p) => p.name === def.name && p.amount === def.amount && p.interval === def.interval);
  if (found) return found.plan_code;
  const created = await (await fetch(`${PAYSTACK_BASE}/plan`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...def, currency: "NGN", send_invoices: true }),
  })).json();
  if (!created.status) throw new Error("plan setup failed");
  return created.data.plan_code;
}

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" }).end(JSON.stringify(obj));
}

function baseUrl(req) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
  const proto = req.headers["x-forwarded-proto"] || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let s = "";
    req.on("data", (c) => (s += c));
    req.on("end", () => {
      try { resolve(s ? JSON.parse(s) : {}); } catch { reject(new Error("bad json")); }
    });
  });
}

async function paystack(path, secret, body) {
  const r = await fetch(`${PAYSTACK_BASE}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  return r.json();
}

const PORT = process.env.PORT || 5173;
createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");

  // GET /api/config → public client config (anon key is public by design; RLS guards data)
  if (req.method === "GET" && url.pathname === "/api/config") {
    const u = process.env.SUPABASE_URL, k = process.env.SUPABASE_ANON_KEY;
    if (!u || !k) return json(res, 503, { error: "accounts not configured" });
    return json(res, 200, {
      supabaseUrl: u,
      supabaseAnonKey: k,
      posthogKey: process.env.POSTHOG_KEY || null,
      posthogHost: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    });
  }

  // GET /api/email-check?domain=X → { valid } (MX lookup; catches fake domains)
  if (req.method === "GET" && url.pathname === "/api/email-check") {
    if (limited(hits, clientIp(req), RATE.max, RATE.windowMs)) return json(res, 429, { error: "too many requests" });
    const domain = (url.searchParams.get("domain") || "").trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return json(res, 200, { valid: false });
    try {
      const { resolveMx } = await import("node:dns/promises");
      const mx = await resolveMx(domain);
      return json(res, 200, { valid: mx.length > 0 });
    } catch { return json(res, 200, { valid: false }); }
  }

  // POST /api/paystack/billing { action: "init"|"status"|"disable", ... }
  if (req.method === "POST" && url.pathname === "/api/paystack/billing") {
    const ip = clientIp(req);
    if (limited(hits, ip, RATE.max, RATE.windowMs)) return json(res, 429, { error: "too many requests" });
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return json(res, 503, { error: "payments not configured" });
    let body;
    try { body = await readBody(req); } catch { return json(res, 400, { error: "bad json" }); }
    try {
      if (body.action === "init") {
        if (limited(initHits, ip, RATE.initMax, RATE.initWindowMs)) return json(res, 429, { error: "checkout limit reached, try later" });
        if (!body.email?.includes("@")) return json(res, 400, { error: "valid email required" });
        const code = await paystackPlan(secret, body.plan);
        const out = await paystack("/transaction/initialize", secret, {
          email: body.email, amount: BILLING_PLANS[body.plan].amount,
          plan: code, callback_url: `${baseUrl(req)}/callback.html`,
        });
        if (!out.status) return json(res, 502, { error: "provider declined request" });
        return json(res, 200, { authorization_url: out.data.authorization_url, reference: out.data.reference, plan: body.plan });
      }
      if (body.action === "status") {
        if (!body.email?.includes("@")) return json(res, 400, { error: "valid email required" });
        const cust = await (await fetch(`${PAYSTACK_BASE}/customer/${encodeURIComponent(body.email)}`, {
          headers: { Authorization: `Bearer ${secret}` },
        })).json();
        if (!cust.status) return json(res, 200, { subscription: null });
        const subs = await (await fetch(`${PAYSTACK_BASE}/subscription?customer=${cust.data.id}&perPage=5`, {
          headers: { Authorization: `Bearer ${secret}` },
        })).json();
        const s = (subs.data || [])[0];
        if (!s) return json(res, 200, { subscription: null });
        return json(res, 200, { subscription: {
          code: s.subscription_code, token: s.email_token, status: s.status,
          next_payment: s.next_payment_date, amount: s.amount,
          card: s.authorization ? `${s.authorization.brand || "card"} •••• ${s.authorization.last4} (exp ${s.authorization.exp_month}/${s.authorization.exp_year})` : null,
        } });
      }
      if (body.action === "disable") {
        if (!body.code || !body.token) return json(res, 400, { error: "subscription reference required" });
        const out = await paystack("/subscription/disable", secret, { code: body.code, token: body.token });
        if (!out.status) return json(res, 502, { error: "provider declined request" });
        return json(res, 200, { cancelled: true });
      }
      return json(res, 400, { error: "unknown action" });
    } catch { return json(res, 502, { error: "provider unreachable" }); }
  }

  // POST /api/paystack/initialize { email, amount } → { authorization_url, reference }
  if (req.method === "POST" && url.pathname === "/api/paystack/initialize") {
    const ip = clientIp(req);
    if (limited(hits, ip, RATE.max, RATE.windowMs)) return json(res, 429, { error: "too many requests" });
    if (limited(initHits, ip, RATE.initMax, RATE.initWindowMs)) return json(res, 429, { error: "checkout limit reached, try later" });
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return json(res, 503, { error: "payments not configured" });
    let body;
    try { body = await readBody(req); } catch { return json(res, 400, { error: "bad json" }); }
    if (!body.email || !body.email.includes("@")) return json(res, 400, { error: "valid email required" });
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 100) return json(res, 400, { error: "amount must be ≥ 100 kobo" });
    try {
      const out = await paystack("/transaction/initialize", secret, {
        email: body.email,
        amount,
        callback_url: `${baseUrl(req)}/callback.html`,
      });
      if (!out.status) return json(res, 502, { error: "provider declined request" });
      return json(res, 200, { authorization_url: out.data.authorization_url, reference: out.data.reference });
    } catch { return json(res, 502, { error: "provider unreachable" }); }
  }

  // GET /api/paystack/verify?reference=X → { status, amount }
  if (req.method === "GET" && url.pathname === "/api/paystack/verify") {
    if (limited(hits, clientIp(req), RATE.max, RATE.windowMs)) return json(res, 429, { error: "too many requests" });
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) return json(res, 503, { error: "payments not configured" });
    const ref = url.searchParams.get("reference");
    if (!ref) return json(res, 400, { error: "reference required" });
    try {
      const out = await paystack(`/transaction/verify/${encodeURIComponent(ref)}`, secret);
      if (!out.status) return json(res, 502, { error: "provider declined request" });
      return json(res, 200, { status: out.data.status, amount: out.data.amount });
    } catch { return json(res, 502, { error: "provider unreachable" }); }
  }

  const path = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
  const file = join(root, path);
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "Content-Type": types[extname(file)] ?? "application/octet-stream" }).end(readFileSync(file));
}).listen(PORT, () => console.log(`PCO TV PWA on port ${PORT}`));
