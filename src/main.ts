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
  const results = await Promise.allSettled([
    scrapeYuzawaResort(browser, Condition.PETS_ALLOWED),
    scrapeYuzawaResort(browser, Condition.PETS_NEGOTIABLE),
    scrapeAngelFudosan(browser),
    scrapeYuzawaShoji(context),
  ])

  const newProperties: Property[] = results
    .filter(
      (r): r is PromiseFulfilledResult<Property[]> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value)

  const processNames = [
    "Yuzawa Resort (Pets Arrowed)",
    "Yuzawa Resort (Pets Negotiable)",
    "Angel Fudosan",
    "Yuzawa Shoji",
  ]
  let hasError = false
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`❌ Failed to process “${processNames[i]}”: `, r.reason)
      hasError = true
    }
  })

  const runId = process.env.GITHUB_RUN_ID
  const repository = process.env.GITHUB_REPOSITORY
  const serverUrl = process.env.GITHUB_SERVER_URL

  const actionUrl = runId
    ? `${serverUrl}/${repository}/actions/runs/${runId}`
    : "Local Execution"

  if (newProperties.length > 0 || hasError)
    await notifyToSlack(newProperties, hasError, actionUrl)

  console.info("⏫ Process completed")
} catch (e) {
  console.error("❌ Unexpected fatal error:", e)
  process.exit(1)
} finally {
  await browser.close()
}
