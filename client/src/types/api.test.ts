import { describe, expect, it } from "vitest";
import { formatThesisId } from "./api";

describe("formatThesisId", () => {
  it("pads the election id to three digits and the thesis number to two", () => {
    expect(formatThesisId(1, 1)).toBe("WOM-001-01");
  });

  it("formats multi-digit ids correctly", () => {
    expect(formatThesisId(49, 27)).toBe("WOM-049-27");
    expect(formatThesisId(123, 7)).toBe("WOM-123-07");
  });

  it("handles zero", () => {
    expect(formatThesisId(0, 0)).toBe("WOM-000-00");
  });
});
