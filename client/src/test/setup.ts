import "@testing-library/jest-dom/vitest";

// jsdom 29 / vitest 4 ships an empty `localStorage` object on `window`
// (no setItem/getItem/removeItem/clear). Provide a small in-memory shim
// so code under test can read and persist values like in a real browser.
function makeStorageShim(): Storage {
  let data: Record<string, string> = {};
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      data = {};
    },
    getItem(key: string) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key]! : null;
    },
    key(i: number) {
      return Object.keys(data)[i] ?? null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = String(value);
    },
  };
}

if (typeof window !== "undefined") {
  if (
    typeof window.localStorage !== "object" ||
    typeof window.localStorage.setItem !== "function"
  ) {
    Object.defineProperty(window, "localStorage", {
      value: makeStorageShim(),
      configurable: true,
    });
  }
  if (
    typeof window.sessionStorage !== "object" ||
    typeof window.sessionStorage.setItem !== "function"
  ) {
    Object.defineProperty(window, "sessionStorage", {
      value: makeStorageShim(),
      configurable: true,
    });
  }
}

// jsdom does not implement ResizeObserver.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverShim {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver =
    ResizeObserverShim as unknown as typeof ResizeObserver;
}
