import type { Page } from "@playwright/test"

const FROZEN_NOW = Date.parse("2025-01-15T12:00:00Z")

/**
 * Make a page deterministic for visual regression:
 *   - disable animations / transitions / caret
 *   - freeze `Date.now()` and `new Date()` (zero-arg) to a fixed instant
 *     (other Date operations still work as expected)
 */
export async function stabilize(page: Page) {
  await page.addInitScript((now: number) => {
    const OriginalDate = Date
    const FrozenDate = function (this: unknown, ...args: unknown[]) {
      if (args.length === 0) {
        return new OriginalDate(now)
      }
      // @ts-expect-error spread into Date constructor
      return new OriginalDate(...args)
    } as unknown as DateConstructor
    // Preserve prototype chain so instanceof etc keep working.
    FrozenDate.prototype = OriginalDate.prototype
    FrozenDate.now = () => now
    FrozenDate.parse = OriginalDate.parse
    FrozenDate.UTC = OriginalDate.UTC
    // @ts-expect-error override global
    globalThis.Date = FrozenDate
  }, FROZEN_NOW)

  // Inject the anti-animation stylesheet on every navigation, via an init
  // script that appends a <style> tag once the document head exists.
  await page.addInitScript(() => {
    const css = `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
      html { scroll-behavior: auto !important; }
    `
    const inject = () => {
      if (!document.head) return false
      if (document.getElementById("e2e-stabilize-style")) return true
      const style = document.createElement("style")
      style.id = "e2e-stabilize-style"
      style.textContent = css
      document.head.appendChild(style)
      return true
    }
    if (!inject()) {
      const observer = new MutationObserver(() => {
        if (inject()) observer.disconnect()
      })
      observer.observe(document.documentElement, { childList: true, subtree: true })
    }
  })
}
