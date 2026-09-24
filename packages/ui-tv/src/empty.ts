/** Empty + error states. Live never shows a dead screen (§13). */

export interface EmptyState {
  title: string;
  body: string;
  fallbackRails: string[];
}

export const NOTHING_LIVE: EmptyState = {
  title: "Nothing is live right now.",
  body: "Catch up below — we'll flag you when Pastor Chris is live.",
  fallbackRails: ["upcoming", "recent-broadcasts", "recommended"],
};

export const EMPTY_FAVORITES: EmptyState = {
  title: "No favorites yet.",
  body: "Press and hold OK on anything meaningful to save it here.",
  fallbackRails: ["recommended", "popular"],
};

export function errorState(retryDeepLink: string): EmptyState {
  return {
    title: "Something didn't load.",
    body: "Check connection and try again. No focus traps: Back always works.",
    fallbackRails: [retryDeepLink],
  };
}
