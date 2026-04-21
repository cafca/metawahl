import { test, expect } from "@playwright/test"
import { mockApi } from "../fixtures/mock"
import { stabilize } from "../fixtures/stabilize"

const routes: Array<{ path: string; name: string }> = [
  { path: "/", name: "landing" },
  { path: "/wahlen/", name: "wahlen-index" },
  { path: "/wahlen/deutschland/", name: "wahlen-deutschland" },
  { path: "/wahlen/deutschland/1/", name: "wahlen-deutschland-1" },
  { path: "/quiz/deutschland/1/", name: "quiz-deutschland-1" },
  { path: "/wahlen/deutschland/1/1/", name: "wahlen-deutschland-1-1" },
  { path: "/themen/", name: "themen" },
  { path: "/themenliste/", name: "themenliste" },
  { path: "/themen/schule/", name: "themen-schule" },
  { path: "/legal/", name: "legal" },
  { path: "/404", name: "not-found" },
]

test.describe("route screenshots", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await stabilize(page)
  })

  for (const { path, name } of routes) {
    test(name, async ({ page }) => {
      await page.goto(path)
      // Wait for any async fetches to settle before shooting.
      await page.waitForLoadState("networkidle")
      // Wait until document.body.scrollHeight holds steady for a few ticks —
      // CRA + Semantic UI + remote font loads cause late layout shifts that
      // otherwise make full-page captures unstable.
      await page.waitForFunction(() => {
        const w = window as unknown as { __lastH?: number; __stableCount?: number }
        const h = document.body.scrollHeight
        if (w.__lastH === h) {
          w.__stableCount = (w.__stableCount || 0) + 1
        } else {
          w.__stableCount = 0
          w.__lastH = h
        }
        return (w.__stableCount || 0) >= 4
      }, null, { polling: 100, timeout: 10_000 }).catch(() => {})
      // Scroll to top so any lazy observers have measured everything at rest.
      await page.evaluate(() => window.scrollTo(0, 0))
      await expect(page).toHaveScreenshot(`${name}.png`, {
        fullPage: true,
        timeout: 15_000,
      })
    })
  }
})
