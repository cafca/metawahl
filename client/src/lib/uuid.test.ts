import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getOrCreateUuid } from "./uuid";

describe("getOrCreateUuid", () => {
  beforeEach(() => {
    localStorage.removeItem("uuid");
  });

  afterEach(() => {
    localStorage.removeItem("uuid");
  });

  it("returns a non-empty id and persists it", () => {
    const id = getOrCreateUuid();
    expect(id).toBeTruthy();
    expect(id.length).toBeGreaterThan(0);
    expect(localStorage.getItem("uuid")).toBe(id);
  });

  it("returns the same id on subsequent calls", () => {
    const first = getOrCreateUuid();
    const second = getOrCreateUuid();
    expect(second).toBe(first);
  });

  it("honours an id that was already stored", () => {
    localStorage.setItem("uuid", "preset-id");
    expect(getOrCreateUuid()).toBe("preset-id");
  });
});
