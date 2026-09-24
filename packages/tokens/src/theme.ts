import tokens from "../tokens.json";

export type Tokens = typeof tokens;
export const theme = tokens;

export const focusRing = "0 0 0 3px #0E0C0A, 0 0 0 6px #D9A441";
export const focusScale = 1.05;

/** Minimum body size at 10ft; never render TV text below card/meta sizes. */
export const minSizes = { body: tokens.type.minBody10ft, card: tokens.type.card, meta: tokens.type.meta } as const;
