import { loadEnvFile } from 'node:process'

export const loadEnvs = () => {
  loadEnvFile(`${process.cwd()}/.env`)
}
