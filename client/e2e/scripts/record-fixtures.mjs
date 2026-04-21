#!/usr/bin/env node
// Record API fixtures for Playwright visual regression tests.
//
// Hits the local Docker API (http://127.0.0.1:3001/v3) — NEVER the live API —
// and writes the responses as JSON into ../fixtures/api/.
//
// Keep the list in sync with fixtures/mock.ts.

import { writeFile, mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, "..", "fixtures", "api")

const API_ROOT = process.env.API_ROOT || "http://127.0.0.1:3001/v3"

// path -> fixture filename
const endpoints = [
  { path: "/base", file: "base.json" },
  { path: "/elections/1", file: "elections-1.json" },
  { path: "/thesis/WOM-001-01", file: "thesis-WOM-001-01.json" },
  { path: "/quiz/1", file: "quiz-1.json" },
  // `schule` exists in the local dev DB and returns rich tag data.
  // Override via `TAG_SLUG=xxx` if you want a different tag fixture.
  { path: `/tags/${process.env.TAG_SLUG || "schule"}`, file: "tags-schule.json" },
]

async function fetchJson(url) {
  const res = await fetch(url)
  const text = await res.text()
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(text) }
  } catch {
    return { ok: false, status: res.status, json: { error: "non-json", body: text.slice(0, 200) } }
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  let ok = 0
  let bad = 0
  for (const { path, file } of endpoints) {
    const url = API_ROOT + path
    process.stdout.write(`-> ${url} ... `)
    try {
      const r = await fetchJson(url)
      await writeFile(join(OUT_DIR, file), JSON.stringify(r.json, null, 2) + "\n", "utf8")
      if (r.ok) {
        console.log(`200 OK -> ${file}`)
        ok++
      } else {
        console.log(`HTTP ${r.status} (wrote response anyway) -> ${file}`)
        bad++
      }
    } catch (err) {
      console.log(`FAILED: ${err.message}`)
      bad++
    }
  }
  console.log(`\nDone. ${ok} ok, ${bad} non-2xx or error.`)
  if (bad > 0) {
    console.log("Tip: start the local Docker API stack so it listens on :3001.")
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
