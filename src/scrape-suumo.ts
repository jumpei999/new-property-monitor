import type { BrowserContext } from "playwright"
import type { Property } from "@/types.js"
import { scrapeListPage } from "@/scrape-list-page.js"

export const SUUMO_SEARCH_CONDITION = {
  NIIGATA: "Niigata",
  NAGANO: "Nagano",
  FUKUSHIMA: "Fukushima",
  GUNMA: "Gunma",
} as const

type SuumoSearchCondition =
  (typeof SUUMO_SEARCH_CONDITION)[keyof typeof SUUMO_SEARCH_CONDITION]

const SEARCH_CONDITION_CONFIGS = {
  [SUUMO_SEARCH_CONDITION.NIIGATA]: {
    fileName: "suumo-niigata.json",
    url: "https://suumo.jp/jj/chintai/ichiran/FR301FC005/?ar=040&bs=040&ta=15&sc=15217&sc=15460&cb=0.0&ct=9999999&mb=0&mt=9999999&et=9999999&cn=9999999&tc=0401102&shkr1=03&shkr2=03&shkr3=03&shkr4=03&sngz=&po1=09&po2=99&pc=100",
  },
  [SUUMO_SEARCH_CONDITION.NAGANO]: {
    fileName: "suumo-nagano.json",
    url: "https://suumo.jp/jj/chintai/ichiran/FR301FC005/?ar=040&bs=040&ta=20&sc=20213&sc=20480&sc=20560&sc=20580&cb=0.0&ct=9999999&mb=0&mt=9999999&et=9999999&cn=9999999&tc=0401102&shkr1=03&shkr2=03&shkr3=03&shkr4=03&sngz=&po1=09&po2=99&pc=100",
  },
  [SUUMO_SEARCH_CONDITION.FUKUSHIMA]: {
    fileName: "suumo-fukushima.json",
    url: "https://suumo.jp/jj/chintai/ichiran/FR301FC005/?ar=020&bs=040&ta=07&sc=07202&sc=07400&cb=0.0&ct=9999999&mb=0&mt=9999999&et=9999999&cn=9999999&tc=0401102&shkr1=03&shkr2=03&shkr3=03&shkr4=03&sngz=&po1=09&po2=99&pc=100",
  },
  [SUUMO_SEARCH_CONDITION.GUNMA]: {
    fileName: "suumo-gunma.json",
    url: "https://suumo.jp/jj/chintai/ichiran/FR301FC005/?ar=030&bs=040&ta=10&sc=10440&cb=0.0&ct=9999999&mb=0&mt=9999999&et=9999999&cn=9999999&tc=0401102&shkr1=03&shkr2=03&shkr3=03&shkr4=03&sngz=&po1=09&po2=99&pc=100",
  },
} as const

export const scrapeSuumo = async (
  context: BrowserContext,
  condition: SuumoSearchCondition,
): Promise<Property[]> =>
  scrapeListPage(context, {
    name: `SUUMO (${condition})`,
    url: SEARCH_CONDITION_CONFIGS[condition].url,
    fileName: SEARCH_CONDITION_CONFIGS[condition].fileName,
    waitSelector: "#js-bukkenList, .error_pop--fr",
    itemSelector: "#js-bukkenList .property",
    extract: ($, el) => {
      const anchor = $(el).find("a.js-cassetLinkHref").first()
      return {
        href: anchor.attr("href"),
        title: anchor.text().trim(),
      }
    },
    idPattern: /\/chintai\/bc_(\d+)\//,
  })
