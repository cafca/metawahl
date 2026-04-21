# Metawahl e2e (Phase 0 — visual regression baseline)

A standalone Playwright workspace that captures full-page screenshots of the
current (un-modernized) CRA client across six viewports. Runs against a
**mocked** API, so the CRA dev server does not need to reach the real
backend while tests execute.

This workspace is intentionally isolated from `client/package.json` /
`client/yarn.lock`: the client is frozen on Node 10 / react-scripts 2.x
tooling for this phase. Do not merge these into the client's own deps.

See [`KNOWN_ISSUES.md`](./KNOWN_ISSUES.md) for bugs captured in the baseline
that must be fixed (not replicated) during the rewrite.

## Prerequisites

1. Local Docker stack running with the API reachable at `http://127.0.0.1:3001`
   (only required when re-recording fixtures; `npm test` itself mocks the API).
2. CRA dev server running at `http://localhost:3000`. The easiest way:

   ```sh
   docker build --target dev -t metawahl-client:dev client/
   docker run --rm -p 3000:3000 metawahl-client:dev
   ```

   If the dev stage fails on your machine, the classic fallback works too:

   ```sh
   nvm use 10 && (cd client && yarn install && yarn start)
   ```

   Tests mock all `/v3/**` API calls via `page.route`, so the dev server does
   not need to reach the real API while the suite runs.

## Install

```sh
cd client/e2e
npm install
npx playwright install chromium
```

## Re-record API fixtures

Requires the local Docker API on `127.0.0.1:3001`.

```sh
npm run record-fixtures
```

This writes `fixtures/api/*.json`. The mock in `fixtures/mock.ts` maps URL
paths to these files; keep the two lists in sync if you add endpoints.

## Update golden screenshots

```sh
npm run test:update
```

Commit the PNGs under `__screenshots__/` alongside your code changes.

## Run

```sh
npm test
```

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
    routes.spec.ts            # 12 routes x 6 viewports
    interactive.spec.ts       # quiz mid-flow + chart hover
  __screenshots__/            # committed goldens (per-test subdirs)
```
