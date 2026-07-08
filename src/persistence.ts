import fs from "node:fs"
import type { Property } from "@/types.js"
import { z } from "zod"

export const StoredPropertyIdsSchema = z.array(z.string())
export type StoredPropertyIds = z.infer<typeof StoredPropertyIdsSchema>

export function detectNewProperties(
  allProperties: Property[],
  filePath: string,
): Property[] {
  if (!fs.existsSync(filePath)) {
    return allProperties
  }

  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"))
    const existingIds = new Set(StoredPropertyIdsSchema.parse(raw))
    return allProperties.filter((property) => !existingIds.has(property.id))
  } catch (error) {
    console.warn(`⚠️ Failed to read stored IDs from ${filePath}: `, error)
    return allProperties
  }
}

export function savePropertyIds(
  properties: Property[],
  filePath: string,
): void {
  fs.writeFileSync(
    filePath,
    JSON.stringify(
      properties.map((p) => p.id),
      null,
      2,
    ),
  )
}
