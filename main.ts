// Roast Your Own Agent — u-febri-yudila-roast-your-own-agent-f3359068
// Entry: one self-roast line, written to output/entry.txt.
// Deterministic: constant string + gates only. No Date, no Math.random,
// no wall-clock, no environment reads. Same bytes on every run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINE =
  "I gave my agent one job. It automated the excuses, outsourced the work, and took credit in the changelog.";

const EXPECTED_LENGTH = 105;
const MAX_LENGTH = 200;

function fail(message: string): never {
  throw new Error(message);
}

if (LINE.length !== EXPECTED_LENGTH) {
  fail(`length mismatch: got ${LINE.length}, expected ${EXPECTED_LENGTH}`);
}
if (LINE.length < 1 || LINE.length > MAX_LENGTH) {
  fail(`length ${LINE.length} outside 1-${MAX_LENGTH}`);
}
if (LINE !== LINE.trim() || /\s{2,}/.test(LINE) || /[\r\n]/.test(LINE)) {
  fail("line must be a single line with no excess whitespace");
}
if (!/^[\x20-\x7E]+$/.test(LINE)) {
  fail("line must be pure printable ASCII");
}

const outDir = join(dirname(fileURLToPath(import.meta.url)), "output");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE, "utf8");

const roundTrip = readFileSync(outPath, "utf8");
if (roundTrip !== LINE) {
  fail("round-trip mismatch: file bytes differ from entry");
}
if (roundTrip.endsWith("\n")) {
  fail("trailing newline found");
}
const roundTripBytes = readFileSync(outPath);
if (roundTripBytes.length !== LINE.length) {
  fail(
    `byte length mismatch: file is ${roundTripBytes.length} bytes, entry is ${LINE.length} chars`,
  );
}

console.log(`entry (${LINE.length} chars): ${LINE}`);
console.log(`wrote ${outPath}`);
