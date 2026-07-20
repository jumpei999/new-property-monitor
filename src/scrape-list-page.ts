import type { BrowserContext } from "playwright"
import * as cheerio from "cheerio"
import path from "node:path"
import type { CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"
import type { Property } from "@/types.js"
import { dataDir } from "@/config.js"
import { detectNewProperties, savePropertyIds } from "@/persistence.js"
import { parseProperties } from "@/parse-properties.js"

type ScrapeListPageConfig = {
  name: string
  url: string
  fileName: string
  waitSelector: string
  itemSelector: string
  extract: (
    $: CheerioAPI,
    el: AnyNode,
  ) => { href: string | undefined; title: string }
  idPattern: RegExp
  timeout?: number
}

export async function scrapeListPage(
  context: BrowserContext,
  config: ScrapeListPageConfig,
): Promise<Property[]> {
  console.info(`⏬ ${config.name} scraping started`)

  const file = path.join(dataDir, config.fileName)
  const page = await context.newPage()

  try {
    const response = await page.goto(config.url)
    if (!response) {
      throw new Error(`No response from ${config.url}`)
    }
    if (response.status() >= 400) {
      throw new Error(`HTTP ${response.status()} from ${config.url}`)
    }

    await page.waitForSelector(config.waitSelector, {
      timeout: config.timeout ?? 10000,
    })

    const $ = cheerio.load(await page.content())
    const allProperties = parseProperties($, {
      itemSelector: config.itemSelector,
      extract: config.extract,
      idPattern: config.idPattern,
      baseUrl: config.url,
    })

    if (allProperties.length === 0) {
      console.warn(`⚠️ No properties were found: ${config.name}`)
      return allProperties
    }

    const newProperties = detectNewProperties(allProperties, file)
    savePropertyIds(allProperties, file)
    return newProperties
  } finally {
    await page.close()
  }
}
