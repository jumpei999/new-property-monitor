import type { BrowserContext } from "playwright"
import type { Property } from "@/types.js"
import { scrapeListPage } from "@/scrape-list-page.js"

export const YUZAWA_RESORT_SEARCH_CONDITION = {
  PETS_ALLOWED: "Pets Allowed",
  PETS_NEGOTIABLE: "Pets Negotiable",
} as const
type YuzawaResortSearchCondition =
  (typeof YUZAWA_RESORT_SEARCH_CONDITION)[keyof typeof YUZAWA_RESORT_SEARCH_CONDITION]

const SEARCH_CONDITION_CONFIGS = {
  [YUZAWA_RESORT_SEARCH_CONDITION.PETS_ALLOWED]: {
    urlSuffix: "%E3%83%9A%E3%83%83%E3%83%88%E5%8F%AF",
    fileName: "yuzawa-resort-pets-allowed.json",
  },
  [YUZAWA_RESORT_SEARCH_CONDITION.PETS_NEGOTIABLE]: {
    urlSuffix: "%E3%83%9A%E3%83%83%E3%83%88(%E5%BF%9C%E7%9B%B8%E8%AB%87)",
    fileName: "yuzawa-resort-pets-negotiable.json",
  },
} as const

export const scrapeYuzawaResort = async (
  context: BrowserContext,
  condition: YuzawaResortSearchCondition,
): Promise<Property[]> =>
  scrapeListPage(context, {
    name: `Yuzawa Resort (${condition})`,
    url:
      "https://yuzawaresort.jp/rent/#contents?facility[]=" +
      SEARCH_CONDITION_CONFIGS[condition].urlSuffix,
    fileName: SEARCH_CONDITION_CONFIGS[condition].fileName,
    waitSelector: "ul.reals",
    itemSelector: "ul.reals > li",
    extract: ($, el) => {
      const anchor = $(el).find("h4 > a").first()
      return {
        href: anchor.attr("href"),
        title: anchor.text().trim(),
      }
    },
    idPattern: /\.\/rent\/(\d+)\.html#contents/,
  })
