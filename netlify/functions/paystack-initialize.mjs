/** POST /api/paystack/initialize — starts a Paystack test checkout.
 * Secret key lives in Netlify env vars; never in code or the browser. */
const BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

const out = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

/* Best-effort per-instance rate limit (serverless instances don't share memory;
   full edge limiting needs Netlify Edge Functions / paid tier — noted in README). */
const bucketMin = [], bucketHour = [];
function overLimit(bucket, max, windowMs) {
  const now = Date.now();
  while (bucket.length && now - bucket[0] > windowMs) bucket.shift();
  if (bucket.length >= max) return true;
  bucket.push(now);
  return false;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return out(405, { error: "method not allowed" });
  if (overLimit(bucketMin, 30, 60000)) return out(429, { error: "too many requests" });
  if (overLimit(bucketHour, 5, 3600000)) return out(429, { error: "checkout limit reached, try later" });
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return out(503, { error: "payments not configured" });
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return out(400, { error: "bad json" });
  }
  if (!body.email || !body.email.includes("@")) return out(400, { error: "valid email required" });
  const amount = Number(body.amount);
  if (!Number.isInteger(amount) || amount < 100) return out(400, { error: "amount must be ≥ 100 kobo" });
  const host = event.headers["x-forwarded-host"] || event.headers.host;
  const proto = event.headers["x-forwarded-proto"] || "https";
  try {
    const r = await fetch(`${BASE}/transaction/initialize`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, amount, callback_url: `${proto}://${host}/callback.html` }),
    });
    const data = await r.json();
    if (!data.status) return out(502, { error: "provider declined request" });
    return out(200, { authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch {
    return out(502, { error: "provider unreachable" });
  }
}
