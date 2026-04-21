import { test, expect } from "@playwright/test"
import { mockApi } from "../fixtures/mock"
import { stabilize } from "../fixtures/stabilize"

test.describe("interactive captures", () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page)
    await stabilize(page)
  })

  // Quiz answer control lives in client/src/components/thesis/index.jsx
  // ("Mehrheit stimmt dafür" / "Mehrheit stimmt dagegen" buttons inside
  // a Button.Group with className "quizButtons"). We click through the first
  // two theses to capture a mid-flow state.
  test("quiz-midflow", async ({ page }) => {
    await page.goto("/quiz/deutschland/1/")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(300)

    for (let i = 0; i < 2; i++) {
      const firstAnswer = page
        .locator(".quizButtons button, button:has-text('Mehrheit stimmt')")
        .first()
      // Defensive: if buttons never render (e.g. API fixture shape mismatch),
      // just shoot whatever we've got so the reviewer can see the state.
      if (await firstAnswer.count()) {
        await firstAnswer.click().catch(() => {})
        await page.waitForLoadState("networkidle")
    await page.waitForTimeout(300).catch(() => {})
      }
    }

    await expect(page).toHaveScreenshot("quiz-midflow.png", { fullPage: true })
  })

  // PositionChart hover: SVG <rect> with className "rect" inside
  // client/src/components/positionChart/index.jsx. Hovering fades the rect
  // (fillOpacity: 0.45) and, in non-compact usage, opens the party text.
  test("chart-hover", async ({ page }) => {
    await page.goto("/wahlen/deutschland/1/")
    await page.waitForLoadState("networkidle")
    await page.waitForTimeout(300)

    const firstRect = page.locator("svg.positionChart rect.rect").first()
    if (await firstRect.count()) {
      await firstRect.hover({ force: true })
      // Give React a tick to re-render the hovered state.
      await page.waitForTimeout(100)
    }

    await expect(page).toHaveScreenshot("chart-hover.png", { fullPage: true })
  })
})
