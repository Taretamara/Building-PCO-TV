/**
 * Focus engine contracts for the TV (D-pad / remote) experience.
 * Pure functions — no RN imports so logic is unit-testable and runs in CI.
 * The RN layer (Phase 1 shell) binds these to spatial navigation.
 */

export type Direction = "up" | "down" | "left" | "right";

export interface FocusZone {
  /** Stable zone id, e.g. "nav", "rail:continue-watching", "hero", "player". */
  id: string;
  /** Item ids in visual order. */
  items: string[];
}

/** Remembers last-focused item per zone so Back / re-entry restores position. */
export class FocusMemory {
  private map = new Map<string, string>();
  remember(zoneId: string, itemId: string): void {
    this.map.set(zoneId, itemId);
  }
  recall(zoneId: string, fallback: string): string {
    return this.map.get(zoneId) ?? fallback;
  }
}

export interface FocusState {
  zoneIndex: number;
  itemIndex: number;
}

/** Move within/between zones in visual order. Never loses focus: clamps at edges. */
export function move(
  zones: FocusZone[],
  state: FocusState,
  direction: Direction,
): FocusState {
  const zone = zones[state.zoneIndex];
  if (!zone) return { zoneIndex: 0, itemIndex: 0 };
  if (direction === "left") {
    return { ...state, itemIndex: Math.max(0, state.itemIndex - 1) };
  }
  if (direction === "right") {
    return { ...state, itemIndex: Math.min(zone.items.length - 1, state.itemIndex + 1) };
  }
  if (direction === "down") {
    const next = Math.min(zones.length - 1, state.zoneIndex + 1);
    return { zoneIndex: next, itemIndex: 0 };
  }
  const prev = Math.max(0, state.zoneIndex - 1);
  return { zoneIndex: prev, itemIndex: 0 };
}

export function focusedId(zones: FocusZone[], state: FocusState): string | null {
  const zone = zones[state.zoneIndex];
  return zone ? (zone.items[state.itemIndex] ?? null) : null;
}
