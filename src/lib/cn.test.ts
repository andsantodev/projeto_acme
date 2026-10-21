import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins the classes that exist", () => {
    expect(cn("flex", undefined, "gap-2", false, null)).toBe("flex gap-2");
  });

  it("returns an empty string when nothing is passed", () => {
    expect(cn()).toBe("");
  });
});
