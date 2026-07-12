import type { BrowserContext } from "playwright"
import type { Property } from "@/types.js"
import { scrapeListPage } from "@/scrape-list-page.js"

export const scrapeAkiyaAthome = async (
  context: BrowserContext,
): Promise<Property[]> =>
  scrapeListPage(context, {
    name: "Akiya Athome",
    url: "https://www.akiya-athome.jp/rent/20/?gyosei_cd%5B%5D=20211&gyosei_cd%5B%5D=20486&gyosei_cd%5B%5D=20563&gyosei_cd%5B%5D=20583&proc_search=",
    fileName: "akiya-athome.json",
    waitSelector: "#bukken_list",
    itemSelector: "#bukken_list section.propety",
    extract: ($, el) => {
      const anchor = $(el).find(".propetyTitle a").first()
      return {
        href: anchor.attr("href"),
        title: anchor.text().trim(),
      }
    },
    idPattern: /\/bukken\/detail\/rent\/(\d+)/,
  })
