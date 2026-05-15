import type { Browser, BrowserContext } from "playwright"
import * as cheerio from "cheerio"
import fs from "node:fs"
import path from "node:path"
import type { Property } from "@/types.js"
import { outputDir } from "./main.js"

export const scrapeYuzawaShoji = async (
  context: BrowserContext,
): Promise<Property[]> => {
  console.info(`⏬ Yuzawa Shoji scraping started`)

  const url = "https://www.yuzawacorp.jp/search/"
  const file = path.join(outputDir, "yuzawa-shoji.json")

  const page = await context.newPage()
  try {
    await page.goto(url)
    await page.locator('form[name="form5"]').getByText("ペット相談").click()
    await page
      .locator('form[name="form5"]')
      .getByText(" この条件で検索")
      .click()
    await page.waitForURL("**/result.html")

    const content = await page.content()
    const $ = cheerio.load(content)
    const allProperties: Property[] = []

    $("td.title").each((_, el) => {
      const anchor = $(el).find("a").first()
      const href = anchor.attr("href")
      const title = anchor
        .text()
        .trim()
        .replaceAll("NEW\n", "")
        .replaceAll("商談中\n", "")
        .replaceAll("\n", "")

      if (href) {
        const regex: RegExp = /(\d+-\d+)/
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
      console.warn(`⚠️ No properties were found: Yuzawa Shoji`)
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
