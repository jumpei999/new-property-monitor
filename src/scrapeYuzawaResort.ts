import type { Browser } from "playwright"
import * as cheerio from "cheerio"
import fs from "node:fs"
import path from "node:path"
import type { Property } from "@/types.js"
import { outputDir } from "./main.js"

export const Condition = {
  PETS_ALLOWED: "Pets Allowed",
  PETS_NEGOTIABLE: "Pets Negotiable",
} as const
type Condition = (typeof Condition)[keyof typeof Condition]

export const scrapeYuzawaResort = async (
  browser: Browser,
  condition: Condition,
): Promise<Property[]> => {
  console.info(`⏬ Yuzawa Resort (${condition}) scraping started`)

  let url = "https://yuzawaresort.jp/rent/#contents?facility[]="
  let file
  switch (condition) {
    case Condition.PETS_ALLOWED:
      url += "%E3%83%9A%E3%83%83%E3%83%88%E5%8F%AF"
      file = path.join(outputDir, "yuzawa-resort-pets-allowed.json")
      break
    case Condition.PETS_NEGOTIABLE:
      url += "%E3%83%9A%E3%83%83%E3%83%88(%E5%BF%9C%E7%9B%B8%E8%AB%87)"
      file = path.join(outputDir, "yuzawa-resort-pets-negotiable.json")
      break
  }

  const page = await browser.newPage()
  try {
    await page.goto(url)
    await page.waitForSelector("ul.reals", { timeout: 10000 })

    const content = await page.content()
    const $ = cheerio.load(content)
    const allProperties: Property[] = []

    $("ul.reals > li").each((_, el) => {
      const anchor = $(el).find("h4 > a").first()
      const href = anchor.attr("href")
      const title = anchor.text().trim()

      if (href) {
        const regex: RegExp = /\.\/rent\/(\d+)\.html#contents/
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
      console.warn(`⚠️ No properties were found: Yuzawa Resort (${condition})`)
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
