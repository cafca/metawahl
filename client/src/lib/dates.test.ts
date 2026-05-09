import { describe, expect, it } from "vitest";
import { formatLongGerman, yearOf } from "./dates";

describe("yearOf", () => {
  it("parses strict ISO dates", () => {
    expect(yearOf("2021-09-26T00:00:00Z")).toBe(2021);
  });

  it("parses the API format with a space and trailing Z", () => {
    // Real API responses look like this — date-fns's parseISO rejects them
    // without normalization.
    expect(yearOf("2006-03-26 00:00:00 Z")).toBe(2006);
  });

  it("returns NaN for null / undefined / empty / invalid input", () => {
    expect(yearOf(null)).toBeNaN();
    expect(yearOf(undefined)).toBeNaN();
    expect(yearOf("")).toBeNaN();
    expect(yearOf("not-a-date")).toBeNaN();
  });
});

describe("formatLongGerman", () => {
  it("formats a strict ISO date in German long form", () => {
    expect(formatLongGerman("2021-09-26T00:00:00Z")).toMatch(
      /\d{1,2}\. September 2021/,
    );
  });

  it("handles the API format with a space and trailing Z", () => {
    expect(formatLongGerman("2006-03-26 00:00:00 Z")).toMatch(
      /\d{1,2}\. März 2006/,
    );
  });

  it("returns an empty string for null / undefined / empty / invalid input", () => {
    expect(formatLongGerman(null)).toBe("");
    expect(formatLongGerman(undefined)).toBe("");
    expect(formatLongGerman("")).toBe("");
    expect(formatLongGerman("garbage")).toBe("");
  });
});
