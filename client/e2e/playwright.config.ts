import { defineConfig, devices } from "@playwright/test"

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-600", width: 600, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
]

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4173"
// Set PLAYWRIGHT_SKIP_WEBSERVER=1 to point tests at an already-running dev or
// preview server instead of having Playwright start its own.
const manageServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER !== "1"

export default defineConfig({
  testDir: "./tests",
  // Co-locate all golden PNGs under a single committed directory.
  snapshotDir: "./__screenshots__",
  snapshotPathTemplate: "{snapshotDir}/{testFilePath}/{arg}-{projectName}{ext}",
  fullyParallel: true,
  reporter: [["list"]],
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
    },
  },
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
  },
  ...(manageServer && {
    webServer: {
      command: "npm run build --prefix .. && npm run preview --prefix .. -- --port 4173 --host 127.0.0.1",
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      stdout: "pipe",
      stderr: "pipe",
    },
  }),
  projects: viewports.map((v) => ({
    name: v.name,
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width: v.width, height: v.height },
    },
  })),
})
