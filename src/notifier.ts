import axios from "axios"
import type { Property } from "@/types.js"
import type { KnownBlock } from "@slack/types"
import { env } from "@/env.js"

const slackWebhookUri = env.SLACK_WEBHOOK_URL

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
    const content = properties.map((p) => `• <${p.link}|${p.title}>`).join("\n")
    blocks.push(
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${content}`,
        },
      },
    )
  }

  if (hasError) {
    blocks.push(
      {
        type: "divider",
      },
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

  await axios.post(slackWebhookUri, { blocks })
}
