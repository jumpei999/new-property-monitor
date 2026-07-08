import type { BrowserContext } from "playwright"
import * as cheerio from "cheerio"
import path from "node:path"
import type { Property } from "@/types.js"
import { dataDir } from "@/config.js"
import { detectNewProperties, savePropertyIds } from "@/persistence.js"
import { parseProperties } from "@/parse-properties.js"

export const scrapeYuzawaShoji = async (
  context: BrowserContext,
): Promise<Property[]> => {
  console.info(`⏬ Yuzawa Shoji scraping started`)

  const url = "https://www.yuzawacorp.jp/search/"
  const file = path.join(dataDir, "yuzawa-shoji.json")

  const page = await context.newPage()
  try {
    await page.goto(url)
    await page.locator('form[name="form5"]').getByText("ペット相談").click()
    await page
      .locator('form[name="form5"]')
      .getByText(" この条件で検索")
      .click()
    await page.waitForURL("**/result.html")

    const $ = cheerio.load(await page.content())
    const allProperties = parseProperties($, {
      itemSelector: "td.title",
      extract: ($, el) => {
        const anchor = $(el).find("a").first()
        return {
          href: anchor.attr("href"),
          title: anchor
            .text()
            .trim()
            .replaceAll("NEW\n", "")
            .replaceAll("商談中\n", "")
            .replaceAll("\n", ""),
        }
      },
      idPattern: /(\d{1,8}-\d{1,12})/,
      baseUrl: url,
    })

    if (allProperties.length === 0) {
      console.warn(`⚠️ No properties were found: Yuzawa Shoji`)
      return allProperties
    }

    const newProperties = detectNewProperties(allProperties, file)
    savePropertyIds(allProperties, file)

    return newProperties
  } finally {
    await page.close()
  }
}
