#!/usr/bin/env npx tsx
/**
 * Copy lint - the zero-cost half of the copy gate.
 *
 * Usage (from web/):
 *   npm run copy:lint             # fails when a string in the inventory trips a pattern check and isn't in the baseline
 *   npm run copy:lint -- --update # rewrites the baseline (only when a flagged string is deliberately kept)
 *
 * It reads the committed inventory (docs/copy/inventory/inventory.json) and runs the voice judge's pattern
 * checks (web/lib/evals/voice-judge/lexical.ts) on every string. Strings flagged on November 6, 2026 are in
 * docs/copy/lint-baseline.json: the debt this check doesn't block, to be worked down. A new flagged string, or
 * a known one that gained a tic, fails. A baseline entry whose string is gone or clean is reported, so the
 * baseline shrinks as copy improves. No model call, no key, no spend.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { lexicalTics, looksLikeCode } from "../lib/evals/voice-judge/lexical";
import type { TicId } from "../lib/evals/voice-judge/types";

const repoRoot = path.resolve(process.cwd(), "..");
const inventoryPath = path.join(repoRoot, "docs/copy/inventory/inventory.json");
const baselinePath = path.join(repoRoot, "docs/copy/lint-baseline.json");
const update = process.argv.includes("--update");

type Entry = { text: string; moment: string; kind: string; file: string; line: number };
type Flag = { key: string; text: string; moment: string; tics: TicId[]; where: string };

if (!existsSync(inventoryPath)) {
    console.error("No inventory: run `npm run copy:inventory` first.");
    process.exit(2);
}

const inventory = JSON.parse(readFileSync(inventoryPath, "utf8")) as { entries: Entry[] };
const flags = new Map<string, Flag>();
for (const entry of inventory.entries) {
    if (looksLikeCode(entry.text)) continue;
    const tics = lexicalTics(entry);
    if (tics.length === 0) continue;
    const key = `${entry.moment}\u0000${entry.text}`;
    const existing = flags.get(key);
    const where = `${entry.file}:${entry.line}`;
    if (existing) {
        existing.tics = [...new Set([...existing.tics, ...tics])].sort() as TicId[];
        continue;
    }
    flags.set(key, { key, text: entry.text, moment: entry.moment, tics: [...tics].sort() as TicId[], where });
}

if (update) {
    const baseline = [...flags.values()]
        .sort((a, b) => a.where.localeCompare(b.where) || a.text.localeCompare(b.text))
        .map(({ text, moment, tics, where }) => ({ text, moment, tics, where }));
    writeFileSync(baselinePath, JSON.stringify({
        note: "Strings the copy lint's pattern checks flag but the gate doesn't block yet: known debt, to be worked down. Regenerate only to remove fixed entries or to keep a flagged string on purpose, and say why in the PR (docs/promptops/shipping-gate.md, Copy).",
        updated: new Date().toISOString().slice(0, 10),
        entries: baseline,
    }, null, 2) + "\n");
    console.log(`Wrote ${path.relative(repoRoot, baselinePath)}: ${baseline.length} known flagged strings.`);
    process.exit(0);
}

const baseline = existsSync(baselinePath)
    ? (JSON.parse(readFileSync(baselinePath, "utf8")).entries as Array<{ text: string; moment: string; tics: TicId[] }>)
    : [];
const known = new Map(baseline.map((entry) => [`${entry.moment}\u0000${entry.text}`, new Set(entry.tics)]));

const failures: string[] = [];
for (const flag of flags.values()) {
    const before = known.get(flag.key);
    const added = flag.tics.filter((tic) => !before?.has(tic));
    if (added.length) failures.push(`  ${flag.where}  [${added.join(", ")}]  ${flag.text.slice(0, 140)}`);
}
const fixed = [...known.keys()].filter((key) => !flags.has(key)).length;

if (failures.length) {
    console.error(`Copy lint: ${failures.length} string(s) trip a pattern check (docs/copy-system.md §4):`);
    console.error(failures.join("\n"));
    console.error("Fix the string, or, if it is right as written, run `npm run copy:lint -- --update` and say why in the PR.");
    process.exit(1);
}
console.log(`Copy lint passed: ${flags.size} known flagged strings, no new ones${fixed ? `; ${fixed} baseline entries are fixed, so run --update to shrink the baseline` : ""}.`);
