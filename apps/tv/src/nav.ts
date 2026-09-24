import routes from "../shell/routes.json";

export type TabId = "home" | "messages" | "music" | "live" | "programs" | "favorites" | "search";

export interface Tab {
  id: TabId;
  title: string;
  route: string;
  focusZone: string;
}

export interface DetailRoute {
  id: string;
  pattern: string;
  scheme: string;
  parentTab: TabId;
}

const tabs = routes.tabs as Tab[];
const details = routes.details as DetailRoute[];

export const TABS: Tab[] = tabs;

/** Resolve a deep link (pco://…) or path to a known route. Null = unknown (must show error state, never trap). */
export function resolveDeepLink(link: string): { tab: TabId; detailId?: string; itemId?: string } | null {
  for (const d of details) {
    const prefix = d.scheme.split("/:id")[0];
    if (link.startsWith(prefix + "/")) {
      const itemId = link.slice(prefix.length + 1);
      if (!itemId) return null;
      return { tab: d.parentTab, detailId: d.id, itemId };
    }
  }
  const tab = tabs.find((t) => `pco:/${t.route}` === link || t.route === link);
  return tab ? { tab: tab.id } : null;
}

/** Back from any detail always lands on its parent tab — no dead-ends. */
export function parentTabFor(detailId: string): TabId | null {
  return details.find((d) => d.id === detailId)?.parentTab ?? null;
}

/** Focus zones top-to-bottom for a screen: nav first, content zones after. */
export function focusZonesFor(tab: TabId, contentZones: string[]): string[] {
  return [`nav:${tab}`, ...contentZones];
}
