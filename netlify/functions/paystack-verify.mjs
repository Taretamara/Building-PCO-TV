/** GET /api/paystack/verify?reference=X — confirms a test payment. */
const BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

const out = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

const bucket = [];
function overLimit(max, windowMs) {
  const now = Date.now();
  while (bucket.length && now - bucket[0] > windowMs) bucket.shift();
  if (bucket.length >= max) return true;
  bucket.push(now);
  return false;
}

export async function handler(event) {
  if (event.httpMethod !== "GET") return out(405, { error: "method not allowed" });
  if (overLimit(30, 60000)) return out(429, { error: "too many requests" });
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return out(503, { error: "payments not configured" });
  const ref = event.queryStringParameters?.reference;
  if (!ref) return out(400, { error: "reference required" });
  try {
    const r = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(ref)}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await r.json();
    if (!data.status) return out(502, { error: "provider declined request" });
    return out(200, { status: data.data.status, amount: data.data.amount });
  } catch {
    return out(502, { error: "provider unreachable" });
  }
}
