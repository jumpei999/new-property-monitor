import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const dataDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../data",
)

export function ensureDataDir(): void {
  fs.mkdirSync(dataDir, { recursive: true })
}
