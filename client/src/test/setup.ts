import "@testing-library/jest-dom/vitest";

// jsdom does not implement ResizeObserver, which cmdk (shadcn Command) uses.
if (typeof globalThis.ResizeObserver === "undefined") {
  class ResizeObserverShim {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  }
  globalThis.ResizeObserver =
    ResizeObserverShim as unknown as typeof ResizeObserver;
}
