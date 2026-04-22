// Harvest computed styles from legacy Semantic UI app for token translation.
// Usage: LEGACY_URL=http://127.0.0.1:5000 node scripts/harvest-tokens.mjs
import { chromium } from "@playwright/test"
import { writeFileSync, mkdirSync } from "node:fs"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const LEGACY_URL = process.env.LEGACY_URL ?? "http://127.0.0.1:5000"
const OUT = fileURLToPath(new URL("../fixtures/tokens.json", import.meta.url))

const ROUTES = ["/", "/wahlen/", "/themen/", "/legal/", "/daten/"]

const PROPS = [
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing",
  "color", "backgroundColor",
  "borderRadius", "borderColor", "borderWidth",
  "padding", "margin",
  "width", "maxWidth",
  "boxShadow",
]

const SELECTORS = [
  "html", "body",
  "h1", "h2", "h3", "h4", "h5",
  "p", "a",
  ".ui.container",
  ".ui.segment",
  ".ui.header",
  ".ui.button",
  ".ui.primary.button",
  ".ui.basic.button",
  ".ui.label",
  ".ui.menu",
  ".ui.menu .item",
  ".ui.menu .active.item",
  ".ui.grid",
  ".ui.card",
  ".ui.list",
  ".ui.breadcrumb",
  ".ui.divider",
  ".ui.input input",
  ".ui.dropdown",
  ".ui.modal",
]

function pick(style) {
  const o = {}
  for (const p of PROPS) o[p] = style.getPropertyValue(p.replace(/([A-Z])/g, "-$1").toLowerCase()) || style[p]
  return o
}

const out = {}
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
const page = await ctx.newPage()

for (const route of ROUTES) {
  const url = `${LEGACY_URL}${route}`
  console.log(`visit ${url}`)
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30_000 })
  } catch (e) {
    console.warn(`  skip (${e.message})`)
    continue
  }
  await page.waitForTimeout(500)
  const data = await page.evaluate(({ sels, props }) => {
    const res = {}
    for (const sel of sels) {
      const el = document.querySelector(sel)
      if (!el) { res[sel] = null; continue }
      const cs = getComputedStyle(el)
      const o = {}
      for (const p of props) {
        const kebab = p.replace(/([A-Z])/g, "-$1").toLowerCase()
        o[p] = cs.getPropertyValue(kebab) || cs[p]
      }
      res[sel] = o
    }
    return res
  }, { sels: SELECTORS, props: PROPS })
  out[route] = data
}

await browser.close()
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(out, null, 2))
console.log(`wrote ${OUT}`)
