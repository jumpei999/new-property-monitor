import "dotenv/config"
import { chromium } from "playwright"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { Property } from "./types.js"
import { notifyToSlack } from "./notifier.js"
import { Condition, scrapeYuzawaResort } from "@/scrapeYuzawaResort.js"
import { scrapeAngelFudosan } from "./scrapeAngelFudosan.js"
import { scrapeYuzawaShoji } from "./scrapeYuzawaShoji.js"

console.info("⏬ Process started")

export const outputDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data",
)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
})

try {
  const results: Property[][] = await Promise.all([
    scrapeYuzawaResort(browser, Condition.PETS_ALLOWED),
    scrapeYuzawaResort(browser, Condition.PETS_NEGOTIABLE),
    scrapeAngelFudosan(browser),
    scrapeYuzawaShoji(context),
  ])
  const newProperties: Property[] = results.flat()

  if (newProperties.length > 0) notifyToSlack(newProperties)

  console.info("⏫ Process completed")
} catch (error) {
  console.error("❗ An error occurred: ", error)
} finally {
  await browser.close()
}
