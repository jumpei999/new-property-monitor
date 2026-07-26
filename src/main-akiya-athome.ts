import "dotenv/config"
import { chromium } from "playwright"
import type { Property } from "@/types.js"
import { notifyToSlack } from "@/notifier.js"
import {
  scrapeAkiyaAthome,
  AKIYA_ATHOME_SEARCH_CONDITION,
} from "@/scrape-akiya-athome.js"
import { ensureDataDir } from "@/config.js"

const AKIYA_ATHOME_DELAY_MS = 2000

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

console.info("⏬ Akiya Athome process started")

ensureDataDir()

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
})

const akiyaConditions = [
  AKIYA_ATHOME_SEARCH_CONDITION.NAGANO,
  AKIYA_ATHOME_SEARCH_CONDITION.NIIGATA,
  AKIYA_ATHOME_SEARCH_CONDITION.FUKUSHIMA,
  AKIYA_ATHOME_SEARCH_CONDITION.GUNMA,
] as const

try {
  const newProperties: Property[] = []
  let hasError = false

  for (const condition of akiyaConditions) {
    const name = `Akiya Athome (${condition})`
    try {
      const found = await scrapeAkiyaAthome(context, condition)
      newProperties.push(...found)
    } catch (reason) {
      console.error(`❌ Failed to process “${name}”: `, reason)
      hasError = true
    }
    await sleep(AKIYA_ATHOME_DELAY_MS)
  }

  if (newProperties.length > 0 || hasError)
    await notifyToSlack(
      newProperties,
      hasError,
      "Local Execution (Akiya Athome)",
    )

  console.info("⏫ Akiya Athome process completed")
} catch (e) {
  console.error("❌ Unexpected fatal error:", e)
  process.exit(1)
} finally {
  await browser.close()
}
