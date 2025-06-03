import type { Router as RouterType } from 'express'

import { ExpressAuth } from '@auth/express'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Router } from 'express'

import { prisma } from '@/shared/infrastructure/database/prisma-client.js'

const authRouter: RouterType = Router()

authRouter.use(
  ExpressAuth({
    providers: [],
    adapter: PrismaAdapter(prisma),
  }),
)

export { authRouter }
