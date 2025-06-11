import { logger } from '@/shared/utils/logger.js'

import { PrismaClient } from 'prisma-db'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

const prisma =
  globalThis.__prisma ||
  new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'stdout',
        level: 'error',
      },
      {
        emit: 'stdout',
        level: 'info',
      },
      {
        emit: 'stdout',
        level: 'warn',
      },
    ],
  })

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
prisma.$on('query' as never, (e: { query: string; params: any; duration: number }) => {
  logger.info('Query: ' + e.query)
  logger.info('Params: ' + e.params)
  logger.info('Duration: ' + e.duration + 'ms')
})

export { prisma as client }
