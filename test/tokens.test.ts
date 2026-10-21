import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCANNED_DIRS = ["src/app", "src/components"];
const HEX_COLOUR = /#[0-9a-fA-F]{3,8}\b/g;

function sourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap(
    (entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) {
        return sourceFiles(path);
      }
      return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
    },
  );
}

function hexColoursIn(file: string): string[] {
  return [...readFileSync(join(ROOT, file), "utf8").matchAll(HEX_COLOUR)].map(
    (match) => match[0],
  );
}

describe("design tokens", () => {
  it("keep colour values out of the page and component code", () => {
    const offenders = SCANNED_DIRS.flatMap(sourceFiles)
      .map((file) => ({ file, colours: hexColoursIn(file) }))
      .filter((entry) => entry.colours.length > 0)
      .map((entry) => `${entry.file}: ${entry.colours.join(", ")}`);

    expect(offenders).toEqual([]);
  });
});
