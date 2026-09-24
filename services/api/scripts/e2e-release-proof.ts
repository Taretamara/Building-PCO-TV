/**
 * Phase 6 exit proof: perf + i18n + QA + §32 success.
 * Run: pnpm --filter @pco/api proof:release
 */
import { strict as assert } from "node:assert";
import {
  artworkCoverage,
  missingKeys,
  PERF_BUDGETS,
  prefetchPlan,
  runAutomatedQA,
  MANUAL_QA,
  stringCount,
  subtitleTracks,
  successDashboard,
  t,
} from "../src/index";

const pass = (name: string) => console.log(`PASS  ${name}`);

// 1. Perf: prefetch plan ordered + capped, full artwork coverage
const plan = prefetchPlan("u-1");
assert.ok(plan.length > 0 && plan.length <= PERF_BUDGETS.railPrefetchCount);
assert.ok(plan.every((p, i, arr) => i === 0 || arr[i - 1].priority <= p.priority), "priority ordered");
const cov = artworkCoverage("u-1");
assert.equal(cov.missing.length, 0, `missing artwork: ${cov.missing.join(",")}`);
pass(`1. perf: ${plan.length} prefetches ordered, ${cov.total} cards covered, budgets ${PERF_BUDGETS.coldStartMs}/${PERF_BUDGETS.playerStartupMs}ms`);

// 2. i18n: strings externalized, fallback, subtitle tracks
assert.ok(stringCount() >= 15);
assert.equal(t("home.welcome"), "Welcome back.");
assert.equal(t("notif.newEpisode", "en", { program: "Healing Streams" }), "A new episode of Healing Streams is available.");
assert.deepEqual(missingKeys("en"), []);
assert.ok(subtitleTracks("m-001")[0].url.endsWith("m-001.en.vtt"));
pass(`2. i18n: ${stringCount()} keys externalized, fallback + VTT plumbing ok`);

// 3. QA matrix: automated green, manual list complete
const results = runAutomatedQA();
for (const r of results) console.log(`      [${r.pass ? "PASS" : "FAIL"}] ${r.name} — ${r.evidence}`);
assert.ok(results.every((r) => r.pass));
assert.equal(MANUAL_QA.length, 6);
pass("3. QA: 4/4 automated green, 6 manual cases defined");

// 4. §32 success dashboard: all five green
const answers = successDashboard();
for (const a of answers) console.log(`      [${a.pass ? "YES" : "NO"}] ${a.question} — ${a.evidence}`);
assert.ok(answers.every((a) => a.pass));
pass("4. success: all five §32 questions answer YES");

console.log("\nPhase 6 proof OK: release-ready pending manual QA + field approvals.");
