# Metawahl e2e

Standalone Playwright workspace that captures full-page screenshots of the
client across six viewports (360, 600, 768, 1024, 1440, 1920) and diffs them
against committed goldens. The suite runs against a **mocked** API so it stays
deterministic — `page.route` intercepts every `/v3/**` request and serves a
recorded response from `fixtures/api/`. Fathom is stubbed too.

Lives in its own workspace with its own `package.json` and lockfile so the
Playwright + Node toolchain doesn't leak into the main client deps.

## Prerequisites

The Vite dev server (or built preview) must be running on
`http://localhost:3000`. From `client/`:

```sh
npm run dev      # or `npm run build && npm run preview`
```

Tests mock all `/v3/**` API calls via `page.route`, so the server doesn't need
to reach the real backend while the suite runs.

## Install

```sh
cd client/e2e
npm install
npx playwright install chromium
```

## Run

```sh
npm test
```

## Update golden screenshots

When intentional visual changes land, refresh the goldens:

```sh
npm run test:update
```

Commit the PNGs under `__screenshots__/` alongside the code change.

## Re-record API fixtures

Requires a local API reachable at `http://127.0.0.1:3001` (e.g. the Docker
compose stack). Then:

```sh
npm run record-fixtures
```

Writes `fixtures/api/*.json`. The mock in `fixtures/mock.ts` maps URL paths to
these files — keep the two lists in sync if you add endpoints.

## Layout

```
e2e/
  package.json                # standalone workspace
  playwright.config.ts        # 6 viewports, 1% diff tolerance
  fixtures/
    mock.ts                   # page.route handler + Fathom stub
    stabilize.ts              # freezes Date, kills animations
    api/                      # recorded JSON, one file per endpoint
  scripts/
    record-fixtures.mjs       # refresh fixtures from local API
  tests/
    routes.spec.ts            # 13 routes x 6 viewports
    interactive.spec.ts       # quiz mid-flow + chart hover
  __screenshots__/            # committed goldens (per-test subdirs)
```
