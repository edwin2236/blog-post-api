import { dirname, resolve } from 'node:path'
import { loadEnvFile } from 'node:process'
import { fileURLToPath } from 'node:url'

export const loadEnvs = () => {
  const __dirname = dirname(fileURLToPath(import.meta.url))

  const envPath = resolve(__dirname, '../../../.env')

  loadEnvFile(envPath)
}
