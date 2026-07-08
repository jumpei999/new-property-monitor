import { z } from "zod"

export const propertySchema = z.object({
  id: z.string(),
  title: z.string(),
  link: z.string(),
})
export type Property = z.infer<typeof propertySchema>
