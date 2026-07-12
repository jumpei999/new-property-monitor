import type { BrowserContext } from "playwright"
import type { Property } from "@/types.js"
import { scrapeListPage } from "@/scrape-list-page.js"

export const scrapeShinanomachiIju = async (
  context: BrowserContext,
): Promise<Property[]> =>
  scrapeListPage(context, {
    name: "Shinanomachi Iju",
    url: "https://shinanomachi-iju.jp/akiya/?property_type=rent",
    fileName: "shinanomachi-iju.json",
    waitSelector: "#archive-list",
    itemSelector: "#archive-list .akiya-list-item",
    extract: ($, el) => {
      const anchor = $(el).find("a.list-link").first()
      return {
        href: anchor.attr("href"),
        title: $(el).find("h2.title").first().text().trim(),
      }
    },
    idPattern: /\/akiya\/([^/]+)\//,
  })
