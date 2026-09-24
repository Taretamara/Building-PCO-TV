/**
 * i18n readiness (§23): all UI strings externalized, English only for MVP.
 * Additional locales fall back to English key-by-key; missing-key report
 * tells translators exactly what to add. Subtitle tracks are plumbed per video.
 */

export type Locale = "en";

export const STRINGS = {
  "home.welcome": "Welcome back.",
  "home.continueWatching": "Continue Watching",
  "home.recommended": "Recommended for You",
  "home.liveNow": "Live Now",
  "home.recentlyAdded": "Recently Added",
  "home.popular": "Popular",
  "live.empty.title": "Nothing is live right now.",
  "live.empty.body": "Catch up below — we'll flag you when Pastor Chris is live.",
  "auth.upgrade": "Sign in to save your favorites and continue watching across your devices.",
  "player.resume": "Resume",
  "player.replay": "Replay",
  "player.play": "Play",
  "search.hint": "Search messages, programs, music, artists",
  "favorites.empty": "No favorites yet.",
  "error.load": "Something didn't load.",
  "error.retry": "Try again",
  "notif.liveNow": "Pastor Chris is live now.",
  "notif.newEpisode": "A new episode of {program} is available.",
  "notif.newMusic": "New music from {artist} is now available.",
  "notif.savedAvailable": "Your saved message is now available to watch.",
} as const;

export type StringKey = keyof typeof STRINGS;

const OVERLAYS: Partial<Record<string, Partial<Record<StringKey, string>>>> = {};

export function t(key: StringKey, locale = "en", vars?: Record<string, string>): string {
  const overlay = locale === "en" ? undefined : OVERLAYS[locale]?.[key];
  let s: string = overlay ?? STRINGS[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}

/** Keys present in English but missing for a locale (translation work list). */
export function missingKeys(locale: string): StringKey[] {
  if (locale === "en") return [];
  const overlay = OVERLAYS[locale] ?? {};
  return (Object.keys(STRINGS) as StringKey[]).filter((k) => !(k in overlay));
}

export function stringCount(): number {
  return Object.keys(STRINGS).length;
}

/** Subtitle tracks plumbed per video (English MVP; codes ready for more). */
export interface SubtitleTrack {
  lang: string;
  label: string;
  url: string;
}

export function subtitleTracks(messageId: string, langs: string[] = ["en"]): SubtitleTrack[] {
  const labels: Record<string, string> = { en: "English" };
  return langs.map((lang) => ({
    lang,
    label: labels[lang] ?? lang,
    url: `https://cdn.pco.tv/captions/${messageId}.${lang}.vtt`,
  }));
}
