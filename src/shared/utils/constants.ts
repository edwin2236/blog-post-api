import { loadEnvs } from './loadEnvs.js'

loadEnvs()

export const {
  NODE_PORT = '3000',
  API_BASE_URL = 'http://localhost:3000',
  NODE_ENV = 'development',
  AUTH_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
} = process.env
