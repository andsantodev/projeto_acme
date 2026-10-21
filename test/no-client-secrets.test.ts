import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FORBIDDEN_IN_CLIENT_CODE = [
  { pattern: /localStorage/, reason: "token in localStorage" },
  { pattern: /document\.cookie/, reason: "token read from document.cookie" },
  { pattern: /SERVICE_ROLE/, reason: "service role key" },
];

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

function isClientModule(file: string): boolean {
  const source = readFileSync(join(ROOT, file), "utf8");
  return /^\s*["']use client["']/m.test(source);
}

describe("client code", () => {
  it("keeps session tokens out of localStorage, document.cookie and the service role key", () => {
    const offenders = sourceFiles("src")
      .filter(isClientModule)
      .flatMap((file) => {
        const source = readFileSync(join(ROOT, file), "utf8");
        return FORBIDDEN_IN_CLIENT_CODE.filter(({ pattern }) =>
          pattern.test(source),
        ).map(({ reason }) => `${file}: ${reason}`);
      });

    expect(offenders).toEqual([]);
  });
});
