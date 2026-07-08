import { z } from "zod"

const envSchema = z.object({
  SLACK_WEBHOOK_URL: z.url(),
  GITHUB_RUN_ID: z.string().optional(),
  GITHUB_REPOSITORY: z.string().optional(),
  GITHUB_SERVER_URL: z.url().optional(),
})

export const env = envSchema.parse(process.env)
