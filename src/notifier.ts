import axios from "axios"
import type { Property } from "@/types.js"
import type { KnownBlock } from "@slack/types"
import { env } from "@/env.js"

const slackWebhookUri = env.SLACK_WEBHOOK_URL
const SLACK_SECTION_TEXT_LIMIT = 3000

function groupPropertiesBySource(
  properties: Property[],
): Map<string, Property[]> {
  const groups = new Map<string, Property[]>()
  for (const property of properties) {
    const existing = groups.get(property.source)
    if (existing) {
      existing.push(property)
    } else {
      groups.set(property.source, [property])
    }
  }
  return groups
}

function chunkPropertyLines(properties: Property[]): string[] {
  const sections = [...groupPropertiesBySource(properties).entries()].map(
    ([source, items]) => {
      const lines = items.map((p) => `• <${p.link}|${p.title}>`)
      return `*${source}*\n${lines.join("\n")}`
    },
  )
  const lines = sections.flatMap((section, index) => {
    const sectionLines = section.split("\n")
    return index === 0 ? sectionLines : ["", ...sectionLines]
  })
  const chunks: string[] = []
  let current = ""

  for (const line of lines) {
    const next = current ? `${current}\n${line}` : line
    if (next.length > SLACK_SECTION_TEXT_LIMIT) {
      if (current) chunks.push(current)
      current =
        line.length > SLACK_SECTION_TEXT_LIMIT
          ? `${line.slice(0, SLACK_SECTION_TEXT_LIMIT - 1)}…`
          : line
    } else {
      current = next
    }
  }

  if (current) chunks.push(current)
  return chunks
}

export const notifyToSlack = async (
  properties: Property[],
  hasError: boolean,
  actionUrl: string,
) => {
  console.info("⏬ Slack notifications started")

  const blocks: KnownBlock[] = []

  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text:
        properties.length > 0
          ? "🏠 Today's new properties"
          : "⚠️ Error notification",
      emoji: true,
    },
  })

  if (properties.length > 0) {
    blocks.push({ type: "divider" })
    for (const text of chunkPropertyLines(properties)) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text,
        },
      })
    }
  }

  if (hasError) {
    blocks.push(
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "❌ An error occurred on some sites",
        },
      },
    )
    if (actionUrl.startsWith("http")) {
      blocks.push({
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View logs",
              emoji: true,
            },
            url: actionUrl,
            style: "danger",
            action_id: "view_logs",
          },
        ],
      })
    }
  }

  try {
    await axios.post(slackWebhookUri, { blocks })
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `Slack notification failed: ${error.response?.status ?? error.code}`,
        { cause: error.response?.data },
      )
    }
    throw error
  }
}
