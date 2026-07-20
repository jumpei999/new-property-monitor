import type { BrowserContext } from "playwright"
import type { Property } from "@/types.js"
import { scrapeListPage } from "@/scrape-list-page.js"

export const AKIYA_ATHOME_SEARCH_CONDITION = {
  NAGANO: "Nagano",
  NIIGATA: "Niigata",
  FUKUSHIMA: "Fukushima",
  GUNMA: "Gunma",
} as const
type AkiyaAthomeSearchCondition =
  (typeof AKIYA_ATHOME_SEARCH_CONDITION)[keyof typeof AKIYA_ATHOME_SEARCH_CONDITION]

const AKIYA_ATHOME_ROTATION = [
  AKIYA_ATHOME_SEARCH_CONDITION.NAGANO,
  AKIYA_ATHOME_SEARCH_CONDITION.NIIGATA,
  AKIYA_ATHOME_SEARCH_CONDITION.FUKUSHIMA,
  AKIYA_ATHOME_SEARCH_CONDITION.GUNMA,
] as const

export const getTodayAkiyaAthomeCondition = (): AkiyaAthomeSearchCondition => {
  const index =
    Math.floor(Date.now() / 86_400_000) % AKIYA_ATHOME_ROTATION.length
  return AKIYA_ATHOME_ROTATION[index]!
}

const SEARCH_CONDITION_CONFIGS = {
  [AKIYA_ATHOME_SEARCH_CONDITION.NAGANO]: {
    fileName: "akiya-athome-nagano.json",
    url: "https://www.akiya-athome.jp/rent/20/?gyosei_cd%5B%5D=20211&gyosei_cd%5B%5D=20486&gyosei_cd%5B%5D=20563&gyosei_cd%5B%5D=20583&proc_search=",
  },
  [AKIYA_ATHOME_SEARCH_CONDITION.NIIGATA]: {
    fileName: "akiya-athome-niigata.json",
    url: "https://www.akiya-athome.jp/rent/15/?br_kbn=rent&pref_cd=15&gyosei_cd%5B%5D=15217&gyosei_cd%5B%5D=15461&proc_search=&page=1&search_sort=kokai_date&item_count=100",
  },
  [AKIYA_ATHOME_SEARCH_CONDITION.FUKUSHIMA]: {
    fileName: "akiya-athome-fukushima.json",
    url: "https://www.akiya-athome.jp/rent/07/?br_kbn=rent&pref_cd=07&gyosei_cd%5B%5D=07202&gyosei_cd%5B%5D=07402&gyosei_cd%5B%5D=07407&gyosei_cd%5B%5D=07408&proc_search=&page=1&search_sort=kokai_date&item_count=100",
  },
  [AKIYA_ATHOME_SEARCH_CONDITION.GUNMA]: {
    fileName: "akiya-athome-gunma.json",
    url: "https://www.akiya-athome.jp/rent/10/?br_kbn=rent&pref_cd=10&gyosei_cd%5B%5D=10449&proc_search=&page=1&search_sort=kokai_date&item_count=100",
  },
} as const

export const scrapeAkiyaAthome = async (
  context: BrowserContext,
  condition: AkiyaAthomeSearchCondition,
): Promise<Property[]> =>
  scrapeListPage(context, {
    name: `Akiya Athome (${condition})`,
    url: SEARCH_CONDITION_CONFIGS[condition].url,
    fileName: SEARCH_CONDITION_CONFIGS[condition].fileName,
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
