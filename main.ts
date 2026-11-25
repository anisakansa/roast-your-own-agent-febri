// Roast Your Own Agent — u-febri-yudila-roast-your-own-agent-f3359068
// Entry: one self-roast line, written to output/entry.txt.
// Deterministic: constant string + gates only. No Date, no Math.random,
// no wall-clock, no environment reads. Same bytes on every run.
// Output goes to the grader's absolute /output/entry.txt (kit contract);
// the grader mounts the repository read-only, so writing next to the
// script fails there with EROFS. A deterministic repo-relative fallback
// covers plain local runs with no writable /output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINE =
  "I gave my agent one job. It automated the excuses, outsourced the work, and took credit in the changelog.";

const EXPECTED_LENGTH = 105;
const MAX_LENGTH = 200;

// Absolute output directory the grader provides (kit contract:
// "the entry's program writes one text to /output/entry.txt").
const PRIMARY_OUT_DIR = "/output";
const ENTRY_FILE_NAME = "entry.txt";

function fail(message: string): never {
  throw new Error(message);
}

// Writes the entry to the grader's absolute output directory, falling
// back deterministically to output/ next to this script when the
// absolute path is not writable. Returns the path actually written,
// for the round-trip check below.
function writeEntry(text: string): string {
  try {
    mkdirSync(PRIMARY_OUT_DIR, { recursive: true });
    const primaryPath = join(PRIMARY_OUT_DIR, ENTRY_FILE_NAME);
    writeFileSync(primaryPath, text, "utf8");
    return primaryPath;
  } catch (primaryError) {
    // Local runs have no writable /output, so a failure here is
    // expected outside the grader; fall through to the repo-relative
    // directory instead of exiting with an error. The entry bytes
    // are identical on either path.
    console.log(
      "primary /output write failed (" +
        (primaryError as Error).message +
        "); using repo-relative output/ fallback",
    );
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const fallbackDir = join(here, "output");
  mkdirSync(fallbackDir, { recursive: true });
  const fallbackPath = join(fallbackDir, ENTRY_FILE_NAME);
  writeFileSync(fallbackPath, text, "utf8");
  return fallbackPath;
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

const outPath = writeEntry(LINE);

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
