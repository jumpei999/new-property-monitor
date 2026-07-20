import "dotenv/config"
import { chromium } from "playwright"
import type { Property } from "@/types.js"
import { notifyToSlack } from "@/notifier.js"
import {
  scrapeYuzawaResort,
  YUZAWA_RESORT_SEARCH_CONDITION,
} from "@/scrape-yuzawa-resort.js"
import { scrapeAngelFudosan } from "@/scrape-angel-fudosan.js"
import { scrapeYuzawaShoji } from "@/scrape-yuzawa-shoji.js"
import {
  scrapeAkiyaAthome,
  getTodayAkiyaAthomeCondition,
} from "@/scrape-akiya-athome.js"
import { scrapeRakuenAkiya } from "@/scrape-rakuen-akiya.js"
import { scrapeShinanomachiIju } from "@/scrape-shinanomachi-iju.js"
import { scrapeSuumo, SUUMO_SEARCH_CONDITION } from "@/scrape-suumo.js"
import { env } from "@/env.js"
import { ensureDataDir } from "@/config.js"

console.info("⏬ Process started")

ensureDataDir()

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
})

try {
  const todayAkiyaAthomeCondition = getTodayAkiyaAthomeCondition()
  console.info(`📅 Today's Akiya Athome region: ${todayAkiyaAthomeCondition}`)

  const scrapers = [
    {
      name: "Yuzawa Resort (Pets Allowed)",
      run: () =>
        scrapeYuzawaResort(
          context,
          YUZAWA_RESORT_SEARCH_CONDITION.PETS_ALLOWED,
        ),
    },
    {
      name: "Yuzawa Resort (Pets Negotiable)",
      run: () =>
        scrapeYuzawaResort(
          context,
          YUZAWA_RESORT_SEARCH_CONDITION.PETS_NEGOTIABLE,
        ),
    },
    { name: "Angel Fudosan", run: () => scrapeAngelFudosan(context) },
    { name: "Yuzawa Shoji", run: () => scrapeYuzawaShoji(context) },
    {
      name: `Akiya Athome (${todayAkiyaAthomeCondition})`,
      run: () => scrapeAkiyaAthome(context, todayAkiyaAthomeCondition),
    },
    { name: "Rakuen Akiya", run: () => scrapeRakuenAkiya(context) },
    { name: "Shinanomachi Iju", run: () => scrapeShinanomachiIju(context) },
    {
      name: "Suumo (Niigata)",
      run: () => scrapeSuumo(context, SUUMO_SEARCH_CONDITION.NIIGATA),
    },
    {
      name: "Suumo (Nagano)",
      run: () => scrapeSuumo(context, SUUMO_SEARCH_CONDITION.NAGANO),
    },
    {
      name: "Suumo (Fukushima)",
      run: () => scrapeSuumo(context, SUUMO_SEARCH_CONDITION.FUKUSHIMA),
    },
    {
      name: "Suumo (Gunma)",
      run: () => scrapeSuumo(context, SUUMO_SEARCH_CONDITION.GUNMA),
    },
  ]
  const results = await Promise.allSettled(scrapers.map((s) => s.run()))

  const newProperties: Property[] = results
    .filter(
      (r): r is PromiseFulfilledResult<Property[]> => r.status === "fulfilled",
    )
    .flatMap((r) => r.value)

  let hasError = false
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`❌ Failed to process “${scrapers[i]?.name}”: `, r.reason)
      hasError = true
    }
  })

  const {
    GITHUB_RUN_ID: runId,
    GITHUB_REPOSITORY: repository,
    GITHUB_SERVER_URL: serverUrl,
  } = env

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
