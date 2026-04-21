import type { Page, Route } from "@playwright/test"
import * as fs from "fs"
import * as path from "path"

// __dirname resolves correctly because Playwright transpiles this file as
// CommonJS by default. Fixtures live alongside this file under ./api.
const fixturesDir = path.join(__dirname, "api")

// Map API pathname (after /v3) -> fixture file slug.
// Keep in sync with scripts/record-fixtures.mjs.
type Entry = { match: RegExp; fixture: string }
const map: Entry[] = [
  { match: /^\/base\/?$/, fixture: "base.json" },
  { match: /^\/elections\/1\/?$/, fixture: "elections-1.json" },
  { match: /^\/elections\/1\/1\/?$/, fixture: "elections-1-1.json" },
  { match: /^\/thesis\/WOM-001-01\/?$/, fixture: "thesis-WOM-001-01.json" },
  { match: /^\/quiz\/1\/?$/, fixture: "quiz-1.json" },
  { match: /^\/tags\/schule\/?$/, fixture: "tags-schule.json" },
]

function loadFixture(file: string): string | null {
  const full = path.join(fixturesDir, file)
  try {
    return fs.readFileSync(full, "utf8")
  } catch {
    return null
  }
}

export async function mockApi(page: Page) {
  // Stub Fathom analytics — prevents network flakes in tests.
  // The app loads the tracker from fathom.metawahl.de (see public/index.html);
  // cdn.usefathom.com is the upstream. Stub both.
  const fathomStub = (route: Route) =>
    route.fulfill({ status: 204, contentType: "application/javascript", body: "" })
  await page.route("https://cdn.usefathom.com/**", fathomStub)
  await page.route(/fathom\.metawahl\.de\/.*/i, fathomStub)
  await page.route(/\/tracker\.js(\?.*)?$/i, fathomStub)

  // Intercept all /v3/** calls.
  await page.route("**/v3/**", async (route: Route) => {
    const url = new URL(route.request().url())
    // Pathname may be /v3/..., so strip the /v3 prefix for matching.
    const afterV3 = url.pathname.replace(/^.*\/v3/, "")

    // Quiz answer submission is fire-and-forget; accept any POST to
    // /quiz/<id>/<thesisNum> with an empty 204.
    if (/^\/quiz\/\d+\/\d+\/?$/.test(afterV3)) {
      return route.fulfill({ status: 204, body: "" })
    }

    for (const entry of map) {
      if (entry.match.test(afterV3)) {
        const body = loadFixture(entry.fixture)
        if (body == null) {
          // eslint-disable-next-line no-console
          console.warn(`[mockApi] fixture missing for ${afterV3} -> ${entry.fixture}`)
          return route.fulfill({
            status: 404,
            contentType: "application/json",
            body: JSON.stringify({ error: "fixture missing", path: afterV3 }),
          })
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body,
        })
      }
    }

    // Unmapped /v3/** request: log a gap, stub with 404 JSON.
    // eslint-disable-next-line no-console
    console.warn(`[mockApi] unmapped ${afterV3}`)
    return route.fulfill({
      status: 404,
      contentType: "application/json",
      body: "{}",
    })
  })
}
