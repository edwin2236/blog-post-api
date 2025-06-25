import { logger } from '@/shared/utils/logger.js'

import { PrismaClient } from 'prisma-db'

declare global {
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

const _logger = logger.child({ module: 'PrismaClient' })

// eslint-disable-next-line @typescript-eslint/no-explicit-any
prisma.$on('query' as never, (e: { query: string; params: any; duration: number }) => {
  _logger.info('Query: ' + e.query)
  _logger.info('Params: ' + e.params)
  _logger.info('Duration: ' + e.duration + 'ms')
})

export { prisma as client }
