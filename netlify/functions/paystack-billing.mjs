/** POST /api/paystack/billing — recurring plans: init | status | disable.
 * Secret key server-side only. Plans auto-created on first use. */
const BASE = process.env.PAYSTACK_BASE_URL || "https://api.paystack.co";

const PLANS = {
  monthly: { name: "PCO Monthly", interval: "monthly", amount: 150000 },
  quarterly: { name: "PCO Quarterly", interval: "quarterly", amount: 400000 },
  annual: { name: "PCO Yearly", interval: "annually", amount: 1500000 },
};

const out = (statusCode, obj) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(obj),
});

const bucketMin = [], bucketHour = [];
function overLimit(bucket, max, windowMs) {
  const now = Date.now();
  while (bucket.length && now - bucket[0] > windowMs) bucket.shift();
  if (bucket.length >= max) return true;
  bucket.push(now);
  return false;
}

async function planCode(secret, planId) {
  const def = PLANS[planId];
  if (!def) throw new Error("unknown plan");
  const list = await (await fetch(`${BASE}/plan?perPage=100`, {
    headers: { Authorization: `Bearer ${secret}` },
  })).json();
  const found = (list.data || []).find((p) => p.name === def.name && p.amount === def.amount && p.interval === def.interval);
  if (found) return found.plan_code;
  const created = await (await fetch(`${BASE}/plan`, {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...def, currency: "NGN", send_invoices: true }),
  })).json();
  if (!created.status) throw new Error("plan setup failed");
  return created.data.plan_code;
}

export async function handler(event) {
  if (event.httpMethod !== "POST") return out(405, { error: "method not allowed" });
  if (overLimit(bucketMin, 30, 60000)) return out(429, { error: "too many requests" });
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return out(503, { error: "payments not configured" });
  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return out(400, { error: "bad json" });
  }
  const auth = { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" };
  try {
    if (body.action === "init") {
      if (overLimit(bucketHour, 5, 3600000)) return out(429, { error: "checkout limit reached, try later" });
      if (!body.email?.includes("@")) return out(400, { error: "valid email required" });
      const code = await planCode(secret, body.plan);
      const r = await fetch(`${BASE}/transaction/initialize`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify({
          email: body.email, amount: PLANS[body.plan].amount, plan: code,
          callback_url: `https://${event.headers["x-forwarded-host"] || event.headers.host}/callback.html`,
        }),
      });
      const data = await r.json();
      if (!data.status) return out(502, { error: "provider declined request" });
      return out(200, { authorization_url: data.data.authorization_url, reference: data.data.reference, plan: body.plan });
    }
    if (body.action === "status") {
      if (!body.email?.includes("@")) return out(400, { error: "valid email required" });
      const cust = await (await fetch(`${BASE}/customer/${encodeURIComponent(body.email)}`, { headers: auth })).json();
      if (!cust.status) return out(200, { subscription: null });
      const subs = await (await fetch(`${BASE}/subscription?customer=${cust.data.id}&perPage=5`, { headers: auth })).json();
      const s = (subs.data || [])[0];
      if (!s) return out(200, { subscription: null });
      return out(200, { subscription: {
        code: s.subscription_code, token: s.email_token, status: s.status,
        next_payment: s.next_payment_date, amount: s.amount,
        card: s.authorization ? `${s.authorization.brand || "card"} •••• ${s.authorization.last4} (exp ${s.authorization.exp_month}/${s.authorization.exp_year})` : null,
      } });
    }
    if (body.action === "disable") {
      if (!body.code || !body.token) return out(400, { error: "subscription reference required" });
      const r = await fetch(`${BASE}/subscription/disable`, {
        method: "POST",
        headers: auth,
        body: JSON.stringify({ code: body.code, token: body.token }),
      });
      const data = await r.json();
      if (!data.status) return out(502, { error: "provider declined request" });
      return out(200, { cancelled: true });
    }
    return out(400, { error: "unknown action" });
  } catch {
    return out(502, { error: "provider unreachable" });
  }
}
