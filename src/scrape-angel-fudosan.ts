import type { BrowserContext } from "playwright"
import type { Property } from "@/types.js"
import { scrapeListPage } from "@/scrape-list-page.js"

export const scrapeAngelFudosan = async (
  context: BrowserContext,
): Promise<Property[]> =>
  scrapeListPage(context, {
    name: "Angel Fudosan",
    url: "https://www.angel-f.com/chintai/search_list?sort=11&big_areas[]=yuzawa&small_areas[]=yuzawa-area&small_areas[]=iwappara&small_areas[]=nakazato&small_areas[]=ishiuchi&small_areas[]=naeba&y2_yachin_min=&y2_yachin_max=&s_yachin_min=&s_yachin_max=&menseki_min=&menseki_max=&new=&henkou=&chiku_min=&chiku_max=&kashinushi=&point[]=pet&chintai_name=&inquiry_number=&limit=20&return=1",
    fileName: "angel-fudosan.json",
    waitSelector: "ul.project_list",
    itemSelector: "ul.project_list > li",
    extract: ($, el) => {
      const anchor = $(el).find("a").first()
      return {
        href: anchor.attr("href"),
        title: anchor.find("p").first().text().trim(),
      }
    },
    idPattern: /(\d{1,8})\.html/,
  })
