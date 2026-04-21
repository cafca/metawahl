# Metawahl client

React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui SPA.

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

- `src/` — modernized app, grown incrementally over Phases 2–4.
- `src.legacy/` — pre-modernization CRA source, kept as a reference during the port.
  Deleted once every view is ported.
- `public/` — static assets (favicons, manifest, fonts, data fixtures).
- `e2e/` — standalone Playwright visual-regression workspace (own lockfile).
  See `e2e/README.md` and `e2e/KNOWN_ISSUES.md`.

## Visual regression

`npm run test:visual` runs the Phase 0 baseline suite against the built Vite bundle.
Goldens will fail until each view is ported in Phase 4 — that's expected. Update
goldens with `npm run test:visual:update` after each view port commit and confirm
the diff is intentional.
