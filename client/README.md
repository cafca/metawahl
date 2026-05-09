# Metawahl client

React 19 + Vite + TypeScript + Fomantic-UI CSS SPA.

## Prerequisites

- Node 22 (`nvm use` picks up `.nvmrc`)
- npm 11+

## Scripts

| Command                      | What it does                                         |
| ---------------------------- | ---------------------------------------------------- |
| `npm run dev`                | Vite dev server on http://localhost:3000             |
| `npm run build`              | Type-check and produce production bundle in `dist/`  |
| `npm run preview`            | Serve the built bundle on http://localhost:3000      |
| `npm run typecheck`          | `tsc --noEmit`                                       |
| `npm run lint`               | ESLint (flat config)                                 |
| `npm run format`             | Prettier write                                       |
| `npm test`                   | Vitest single run (jsdom + RTL)                      |
| `npm run test:watch`         | Vitest watch mode                                    |
| `npm run test:visual`        | Delegate to `e2e/` Playwright suite                  |
| `npm run test:visual:update` | Update Playwright golden screenshots                 |

## Layout

- `src/` — application source.
- `public/` — static assets (favicons, manifest, fonts, data fixtures).
- `e2e/` — standalone Playwright visual-regression workspace with its own
  lockfile. See `e2e/README.md`.

## Visual regression

`npm run test:visual` runs the Playwright suite against the built Vite bundle
with API responses served from `e2e/fixtures/api/*.json`. Use
`npm run test:visual:update` to refresh golden screenshots after intentional
visual changes.
