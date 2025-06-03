import { PrismaClient } from '@/shared/infrastructure/database/prisma/generated/prisma/index.js'
import { logger } from '@/shared/utils/logger.js'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
prisma.$on('query', (e: { query: string; params: string; duration: string }) => {
  logger.info('Query: ' + e.query)
  logger.info('Params: ' + e.params)
  logger.info('Duration: ' + e.duration + 'ms')
})

export { prisma }
