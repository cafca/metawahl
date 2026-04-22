import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { toast } from "sonner";
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
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  afterEach(() => {
    Reflect.deleteProperty(navigator, "clipboard");
  });

  it("writes to the clipboard and fires the success toast", async () => {
    const ok = await copyToClipboard("https://example.com/");
    expect(ok).toBe(true);
    expect(writeText).toHaveBeenCalledWith("https://example.com/");
    expect(toast.success).toHaveBeenCalledWith(
      "Link in die Zwischenablage kopiert",
    );
  });

  it("reports failure via the error toast when writeText rejects", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    const ok = await copyToClipboard("https://example.com/");
    expect(ok).toBe(false);
    expect(toast.error).toHaveBeenCalled();
  });
});
