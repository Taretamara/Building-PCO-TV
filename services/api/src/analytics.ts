/**
 * Analytics + crash contracts (§32 success dashboard).
 * Dev/CI: console sink. Prod: PostHog (events) when POSTHOG_KEY is set.
 * No hard vendor deps — safe to run anywhere.
 */

export type AnalyticsEvent =
  | { name: "app_open"; tab: string }
  | { name: "playback_started"; contentId: string; kind: string }
  | { name: "playback_progress"; contentId: string; pct: 25 | 50 | 75 | 95 }
  | { name: "playback_completed"; contentId: string }
  | { name: "resume"; contentId: string; positionSec: number }
  | { name: "search"; query: string; groups: number }
  | { name: "favorite_added"; contentId: string }
  | { name: "program_followed"; programId: string }
  | { name: "live_joined"; broadcastId: string }
  | { name: "sign_in_completed"; method: "qr" | "email" };

export interface Sink {
  track(e: AnalyticsEvent): void;
  crash(err: unknown, context?: Record<string, string>): void;
}

export const consoleSink: Sink = {
  track: (e) => console.log(`[analytics] ${e.name}`, e),
  crash: (err, context) => console.error("[crash]", err, context ?? {}),
};

export function sink(): Sink {
  if (!process.env.POSTHOG_KEY) return consoleSink;
  const key = process.env.POSTHOG_KEY;
  const host = process.env.POSTHOG_HOST ?? "https://app.posthog.com";
  return {
    track: (e) => {
      fetch(`${host}/capture/`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ api_key: key, event: e.name, properties: e }),
      }).catch((err) => console.error("[posthog]", err));
    },
    crash: (err, context) => console.error("[crash]", err, context ?? {}),
  };
}
