import type { BrowserContext } from "playwright"
import type { Property } from "@/types.js"
import { scrapeListPage } from "@/scrape-list-page.js"

export const scrapeRakuenAkiya = async (
  context: BrowserContext,
): Promise<Property[]> =>
  scrapeListPage(context, {
    name: "Rakuen Akiya",
    url: "https://rakuen-akiya.jp/housesearch/feature/?vender_id=&keyword=&bc2=1&kakaku1=0&kakaku2=0&kakaku3=0&kakaku4=0&chiku=0&tochi1=0&tochi2=0&tatemono1=0&tatemono2=0&orderby=%E6%96%B0%E7%9D%80%E9%A0%86",
    fileName: "rakuen-akiya.json",
    waitSelector: "#listBox .boxStyleE",
    itemSelector: "#listBox .boxStyleE",
    extract: ($, el) => {
      const anchor = $(el).find("header h3 a").first()
      return {
        href: anchor.attr("href"),
        title: anchor.text().trim(),
      }
    },
    idPattern: /\/bukken\/(\d+)\//,
  })
