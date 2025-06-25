import { loadEnvs } from './loadEnvs.js'

loadEnvs()

export const {
  NODE_PORT = '3000',
  API_BASE_URL = 'http://localhost:8080',
  APP_BASE_URL = 'http://localhost:5173',
  NODE_ENV = 'development',
  AUTH_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  MAILGUN_API_KEY,
  MAILGUN_DOMAIN = 'localhost.com',
  SMTP_HOST = 'localhost',
  SMTP_PORT = '587',
  SMTP_USER,
  SMTP_PASS,
} = process.env

// 30 MINUTES IN DEV AND 24 HOURS IN PROD
export const SESSION_EXPIRES =
  NODE_ENV !== 'production' ? 30 * 60 * 1000 : 24 * 60 * 60 * 1000

// 15 MINUTES
export const RESET_PASSWORD_TOKEN_EXPIRES = 15 * 60 * 1000
