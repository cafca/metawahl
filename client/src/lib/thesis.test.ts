import { describe, expect, it } from "vitest";
import { extractThesisId } from "./thesis";

describe("extractThesisId", () => {
  it("parses a well-formed id", () => {
    expect(extractThesisId("WOM-001-02")).toEqual({
      type: "WOM",
      womId: 1,
      thesisNum: 2,
    });
  });

  it("accepts unpadded numeric segments", () => {
    expect(extractThesisId("WOM-42-7")).toEqual({
      type: "WOM",
      womId: 42,
      thesisNum: 7,
    });
  });

  it("returns null for ids with fewer than three segments", () => {
    expect(extractThesisId("WOM-001")).toBeNull();
    expect(extractThesisId("WOM")).toBeNull();
    expect(extractThesisId("")).toBeNull();
  });

  it("returns null when a numeric segment is not a valid integer", () => {
    expect(extractThesisId("WOM-abc-2")).toBeNull();
    expect(extractThesisId("WOM-1-xx")).toBeNull();
  });
});
