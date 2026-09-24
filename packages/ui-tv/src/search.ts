/** Unified grouped search (§16): messages + programs + music + events + artists. */

export interface SearchGroups {
  messages: string[];
  programs: string[];
  music: string[];
  events: string[];
  artists: string[];
}

export function groupedSearch(
  q: string,
  index: { messages: string[]; programs: string[]; music: string[]; events: string[]; artists: string[]; titles: Map<string, string> },
): SearchGroups {
  const needle = q.trim().toLowerCase();
  if (!needle) return { messages: [], programs: [], music: [], events: [], artists: [] };
  const match = (ids: string[]) =>
    ids.filter((id) => (index.titles.get(id) ?? "").toLowerCase().includes(needle)).slice(0, RAIL_CAP_LOCAL);
  return {
    messages: match(index.messages),
    programs: match(index.programs),
    music: match(index.music),
    events: match(index.events),
    artists: match(index.artists),
  };
}

const RAIL_CAP_LOCAL = 10;

/** TV search keyboard rows: ABC grid + digits + space/backspace + voice hint. */
export const SEARCH_KEYBOARD_ROWS = [
  "ABCDEFG".split(""),
  "HIJKLMN".split(""),
  "OPQRSTU".split(""),
  "VWXYZ019".split(""),
  ["SPACE", "BACK", "VOICE"],
];
