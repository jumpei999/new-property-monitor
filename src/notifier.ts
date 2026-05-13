import axios from "axios"
import type { Property } from "@/types.js"

const slackWebhookUri = process.env.SLACK_WEBHOOK_URL as string

export const notifyToSlack = async (properties: Property[]) => {
  console.info("⏬ Slack notifications started")

  const content = properties.map((p) => `• <${p.link}|${p.title}>`).join("\n")

  const blocks = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: "Today's new properties",
        emoji: true,
      },
      level: 1,
    },
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
  ]

  await axios.post(slackWebhookUri, { blocks })
}
