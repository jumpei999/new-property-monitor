import type { CheerioAPI } from "cheerio"
import type { AnyNode } from "domhandler"
import { propertySchema, type Property } from "@/types.js"

type ParseConfig = {
  itemSelector: string
  extract: (
    $: CheerioAPI,
    el: AnyNode,
  ) => { href: string | undefined; title: string }
  idPattern: RegExp
  baseUrl: string
}

export function parseProperties(
  $: CheerioAPI,
  config: ParseConfig,
): Property[] {
  const properties: Property[] = []

  $(config.itemSelector).each((_, el) => {
    const { href, title } = config.extract($, el)
    if (!href) return

    const idMatch = config.idPattern.exec(href)
    if (!idMatch?.[1]) return

    properties.push(
      propertySchema.parse({
        id: idMatch[1],
        title,
        link: new URL(href, config.baseUrl).href,
      }),
    )
  })

  return properties
}
