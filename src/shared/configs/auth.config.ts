import { ExpressAuth } from '@auth/express'
import Credentials from '@auth/express/providers/credentials'
import GitHub from '@auth/express/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'
import { Logger } from 'winston'

import { Role, User } from '@/shared/schemas/user.schema.js'
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  NODE_ENV,
  SESSION_EXPIRES,
} from '@/shared/utils/constants.js'

interface AuthParams {
  prismaClient: PrismaClient
  logger: Logger
  authorizeCallback: (credentials: {
    email: string
    password: string
  }) => Promise<null | User>
}

export const authConfig = (params: AuthParams) => {
  const { prismaClient, logger, authorizeCallback } = params

  return ExpressAuth({
    debug: NODE_ENV !== 'production',
    adapter: PrismaAdapter(prismaClient),
    session: {
      strategy: 'database',
      maxAge: SESSION_EXPIRES,
    },
    providers: [
      Credentials({
        type: 'credentials',
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials, _request) {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          return await authorizeCallback({
            email: credentials.email as string,
            password: credentials.password as string,
          })
        },
      }),
      GitHub({
        clientId: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        profile(profile) {
          const [firstName, ...lastNameParts] = (
            profile.name ||
            profile.login ||
            ''
          ).split(' ')

          if (!profile.email) {
            logger.error('No email provided from GitHub')
            throw new Error('No email provided from GitHub')
          }

          return {
            id: profile.id.toString(),
            email: profile.email, // Will be string since we checked above
            name: firstName,
            lastName: lastNameParts.join(' ') || firstName,
            password: '',
            role: Role.USER,
            isActive: true,
            emailVerified: new Date(),
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user, account }) {
        if (account?.provider === 'credentials') {
          const sessionToken = crypto.randomUUID()
          const expires = new Date(Date.now() + SESSION_EXPIRES)

          const previousSession = await prismaClient.session.findFirst({
            where: { userId: user.id },
          })

          if (!previousSession) {
            const session = await PrismaAdapter(prismaClient).createSession!({
              userId: user.id!,
              sessionToken,
              expires,
            })

            token.sessionId = session.sessionToken
          } else {
            token.sessionId = previousSession.sessionToken
          }
        }

        return token
      },
      async session({ session, token, user }) {
        if (session.user) {
          session.user.id = String(token.id || user.id)
          session.user.role = (token.role || user.role) as Role
          session.user.isActive = Boolean(token.isActive || user.isActive)
          session.user.lastName = String(token.lastName || user.lastName)

          // Update session expiry
          await prismaClient.session.updateMany({
            where: { userId: session.user.id },
            data: {
              expires: new Date(Date.now() + SESSION_EXPIRES),
            },
          })
        }

        return session
      },
    },
    events: {
      async createUser({ user }) {
        await prismaClient.profile.create({
          data: {
            userId: user.id as string,
            avatar: user.image || null,
          },
        })
      },
      async signOut(params) {
        if ('token' in params && params.token?.id) {
          await prismaClient.session.deleteMany({
            where: { userId: params.token.id },
          })
        }
        if ('session' in params && params.session && 'userId' in params.session) {
          await prismaClient.session.deleteMany({
            where: { userId: params.session.userId },
          })
        }
      },
    },
  })
}
