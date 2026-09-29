/** Copies the single-source catalog into the PWA (test data). Run before dev/build. */
import { copyFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(root, "data"), { recursive: true });
copyFileSync(
  join(root, "..", "..", "packages/content-models/seed/seed.json"),
  join(root, "data/seed.json"),
);
console.log("seed synced to apps/web/data/seed.json");
