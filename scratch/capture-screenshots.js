const { chromium } = require("@playwright/test")
const fs = require("fs")
const path = require("path")

const outputDir = "C:\\Users\\fjuni\\.gemini\\antigravity-ide\\brain\\94a4d943-0f46-4dc7-9f6e-05559bcb84be"

const routes = [
  { name: "storefront_home.png", url: "http://localhost:8000/dk" },
  { name: "storefront_catalog.png", url: "http://localhost:8000/dk/store" },
  { name: "storefront_account.png", url: "http://localhost:8000/dk/account" },
  { name: "medusa_admin_login.png", url: "http://localhost:9000/app" },
  { name: "traefik_dashboard.png", url: "http://localhost:8088" },
  { name: "adminer_db_dashboard.png", url: "http://localhost:8081" },
  { name: "mailpit_dashboard.png", url: "http://localhost:8025" },
]

async function capture() {
  console.log("Launching Chromium...")
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  for (const r of routes) {
    try {
      console.log(`Navigating to ${r.url}...`)
      await page.goto(r.url, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {})
      await page.waitForTimeout(2000)
      const filepath = path.join(outputDir, r.name)
      await page.screenshot({ path: filepath, fullPage: false })
      console.log(`Saved screenshot: ${filepath}`)
    } catch (err) {
      console.error(`Failed capturing ${r.url}:`, err.message)
    }
  }

  await browser.close()
  console.log("All screenshots captured successfully!")
}

capture().catch(console.error)
