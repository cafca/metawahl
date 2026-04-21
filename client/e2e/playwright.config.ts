import { defineConfig, devices } from "@playwright/test"

const viewports = [
  { name: "mobile-360", width: 360, height: 800 },
  { name: "mobile-600", width: 600, height: 900 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 768 },
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "wide-1920", width: 1920, height: 1080 },
]

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
    baseURL: "http://localhost:3000",
    ignoreHTTPSErrors: true,
  },
  projects: viewports.map((v) => ({
    name: v.name,
    use: {
      ...devices["Desktop Chrome"],
      viewport: { width: v.width, height: v.height },
    },
  })),
})
