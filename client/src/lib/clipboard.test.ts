import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard, toAbsoluteUrl } from "./clipboard";
import { SITE_ROOT } from "@/config";

describe("toAbsoluteUrl", () => {
  it("prefixes bare paths with SITE_ROOT", () => {
    expect(toAbsoluteUrl("/wahlen/deutschland/1/")).toBe(
      `${SITE_ROOT}/wahlen/deutschland/1/`,
    );
  });

  it("leaves absolute URLs untouched", () => {
    expect(toAbsoluteUrl("https://example.com/foo")).toBe(
      "https://example.com/foo",
    );
  });

  it("adds a separating slash when the path has none", () => {
    expect(toAbsoluteUrl("wahlen/")).toBe(`${SITE_ROOT}/wahlen/`);
  });
});

describe("copyToClipboard", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    writeText.mockReset();
    writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "clipboard");
  });

  it("writes to the clipboard and returns true", async () => {
    const ok = await copyToClipboard("https://example.com/");
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("https://example.com/");
  });

  it("returns false when writeText rejects", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    const ok = await copyToClipboard("https://example.com/");
    expect(ok).toBe(false);
  });
});
