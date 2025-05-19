import { loadEnvFile } from 'node:process'

export const loadEnvs = () => {
  const envFile =
    process.env.NODE_ENV === 'production' ? '/.env' : '/.env.local'

  loadEnvFile(process.cwd() + envFile)
}
