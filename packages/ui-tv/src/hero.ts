/** Hero + detail header contracts (§6 Message Details, §4 Home hero). */

export interface HeroViewModel {
  kicker: string;
  title: string;
  description: string;
  primaryAction: { label: string; deepLink: string };
  secondaryActions: { label: string; deepLink: string }[];
}

export interface DetailHeader {
  title: string;
  speaker: string;
  programOrEvent: string;
  topic: string;
  durationLabel: string;
  description: string;
  actions: Array<"favorite" | "save" | "share" | "follow" | "play">;
}

export function durationLabel(totalSec: number): string {
  return `${Math.round(totalSec / 60)} min`;
}
