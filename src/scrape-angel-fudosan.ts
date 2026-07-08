import type { BrowserContext } from "playwright"
import * as cheerio from "cheerio"
import path from "node:path"
import type { Property } from "@/types.js"
import { dataDir } from "@/config.js"
import { detectNewProperties, savePropertyIds } from "@/persistence.js"
import { parseProperties } from "@/parse-properties.js"

export const scrapeAngelFudosan = async (
  context: BrowserContext,
): Promise<Property[]> => {
  console.info(`⏬ Angel Fudosan scraping started`)

  const file = path.join(dataDir, "angel-fudosan.json")
  const url =
    "https://www.angel-f.com/chintai/search_list?sort=11&big_areas[]=yuzawa&small_areas[]=yuzawa-area&small_areas[]=iwappara&small_areas[]=nakazato&small_areas[]=ishiuchi&small_areas[]=naeba&y2_yachin_min=&y2_yachin_max=&s_yachin_min=&s_yachin_max=&menseki_min=&menseki_max=&new=&henkou=&chiku_min=&chiku_max=&kashinushi=&point[]=pet&chintai_name=&inquiry_number=&limit=20&return=1"

  const page = await context.newPage()
  try {
    await page.goto(url)
    await page.waitForSelector("ul.project_list", { timeout: 10000 })

    const content = await page.content()
    const $ = cheerio.load(content)
    const allProperties = parseProperties($, {
      itemSelector: "ul.project_list > li",
      extract: ($, el) => {
        const anchor = $(el).find("a").first()
        return {
          href: anchor.attr("href"),
          title: anchor.find("p").first().text().trim(),
        }
      },
      idPattern: /(\d{1,8})\.html/,
      baseUrl: url,
    })

    if (allProperties.length === 0) {
      console.warn(`⚠️ No properties were found: Angel Fudosan`)
      return allProperties
    }

    const newProperties = detectNewProperties(allProperties, file)
    savePropertyIds(allProperties, file)

    return newProperties
  } finally {
    await page.close()
  }
}
