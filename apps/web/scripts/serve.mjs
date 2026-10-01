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

  // POST /api/paystack/initialize { email, amount } → { authorization_url, reference }
  if (req.method === "POST" && url.pathname === "/api/paystack/initialize") {
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
