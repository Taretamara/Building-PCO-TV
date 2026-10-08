/** GET /api/config — public client config (anon key is public by design; RLS guards data). */
export async function handler() {
  const u = process.env.SUPABASE_URL;
  const k = process.env.SUPABASE_ANON_KEY;
  if (!u || !k) {
    return { statusCode: 503, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ error: "accounts not configured" }) };
  }
  return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ supabaseUrl: u, supabaseAnonKey: k }) };
}
