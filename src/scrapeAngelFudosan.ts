import type { Browser } from "playwright"
import * as cheerio from "cheerio"
import fs from "node:fs"
import path from "node:path"
import type { Property } from "@/types.js"
import { outputDir } from "./main.js"

export const scrapeAngelFudosan = async (
  browser: Browser,
): Promise<Property[]> => {
  console.info(`⏬ Angel Fudosan scraping started`)

  const file = path.join(outputDir, "angel-fudosan.json")
  const url =
    "https://www.angel-f.com/chintai/search_list?sort=11&big_areas[]=yuzawa&small_areas[]=yuzawa-area&small_areas[]=iwappara&small_areas[]=nakazato&small_areas[]=ishiuchi&small_areas[]=naeba&y2_yachin_min=&y2_yachin_max=&s_yachin_min=&s_yachin_max=&menseki_min=&menseki_max=&new=&henkou=&chiku_min=&chiku_max=&kashinushi=&point[]=pet&chintai_name=&inquiry_number=&limit=20&return=1"

  const page = await browser.newPage()
  try {
    await page.goto(url)
    await page.waitForSelector("ul.project_list", { timeout: 10000 })

    const content = await page.content()
    const $ = cheerio.load(content)
    const allProperties: Property[] = []

    $("ul.project_list > li").each((_, el) => {
      const anchor = $(el).find("a").first()
      const href = anchor.attr("href")
      const title = anchor.find("p").first().text().trim()

      if (href) {
        const regex: RegExp = /(\d+)\.html/
        const idMatch = regex.exec(href)
        if (idMatch?.[1]) {
          allProperties.push({
            id: idMatch[1],
            title,
            link: new URL(href, url).href,
          })
        }
      }
    })

    if (allProperties.length === 0) {
      console.warn(`⚠️ No properties were found: Angel Fudosan`)
      return allProperties
    }

    let lastIds: string[] = []
    if (fs.existsSync(file)) {
      lastIds = JSON.parse(fs.readFileSync(file, "utf-8"))
    }

    const newProperties = allProperties.filter((p) => !lastIds.includes(p.id))

    if (newProperties.length > 0) {
      fs.writeFileSync(
        file,
        JSON.stringify(
          allProperties.map((p) => p.id),
          null,
          2,
        ),
      )
    }

    return newProperties
  } finally {
    await page.close()
  }
}
