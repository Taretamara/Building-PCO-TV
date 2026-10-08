/** GET /api/email-check?domain=X — does this domain accept mail? (MX lookup)
 * Catches typos and fake domains (user@gmailll.con, user@fakedomain12345.xyz).
 * Cannot verify the name part (nobody123@gmail.com) — only a confirmation
 * email can do that. No secrets involved. */
import { resolveMx } from "node:dns/promises";

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
  const domain = (event.queryStringParameters?.domain || "").trim().toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return out(200, { valid: false, reason: "bad-domain" });
  try {
    const mx = await resolveMx(domain);
    return out(200, { valid: mx.length > 0 });
  } catch {
    return out(200, { valid: false });
  }
}
