import type { Router as RouterType, Request, Response } from 'express'

import { ExpressAuth } from '@auth/express'
import Credentials from '@auth/express/providers/credentials'
import GitHub from '@auth/express/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { Router } from 'express'

import { AuthController } from '@/features/auth/controllers/auth.controller.js'
import { AuthRepository } from '@/features/auth/repositories/auth.repository.js'
import { UserRepository } from '@/features/users/repositories/user.repository.js'
import { client } from '@/shared/database/prisma-client.js'
import { Role } from '@/shared/schemas/user.schema.js'
import {
  AUTH_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  NODE_ENV,
} from '@/shared/utils/constants.js'
import { logger } from '@/shared/utils/logger.js'

const authRouter: RouterType = Router()

// Initialize
const _logger = logger.child({ module: 'auth' })
const authRepository = new AuthRepository()
const userRepository = new UserRepository()
const authController = new AuthController(authRepository, userRepository)

_logger.defaultMeta = { module: 'AuthRouter' }

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Create a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/CreateUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/UserResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
authRouter.post('/signup', async (req: Request, res: Response) => {
  void authController.signUp(req, res)
})

/**
 * @swagger
 * /api/auth/signin:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Authenticate user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 user:
 *                   $ref: '#/definitions/UserResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 */
authRouter.all(
  '/{*any}',
  ExpressAuth({
    debug: NODE_ENV !== 'production',
    secret: AUTH_SECRET,
    adapter: PrismaAdapter(client),
    session: {
      strategy: 'jwt', // Must be JWT for Credentials provider
      maxAge: 30 * 24 * 60 * 60,
    },
    providers: [
      Credentials({
        credentials: {
          email: { label: 'Email', type: 'email' },
          password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
          const user = await authController.authenticate(
            credentials.email as string,
            credentials.password as string,
          )

          if (!user) return null

          return user
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
            _logger.error('No email provided from GitHub')
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
      async signIn({ user, account, profile: _profile }) {
        if (account?.provider === 'github' && !user.email) {
          return false
        }

        return true
      },
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id
          token.role = user.role
          token.isActive = user.isActive
          token.lastName = user.lastName

          // Store session for JWT users if not exists
          if (account?.type === 'credentials') {
            const existingSession = await client.session.findFirst({
              where: { userId: user.id },
            })

            if (!existingSession) {
              await client.session.create({
                data: {
                  userId: user.id,
                  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                  sessionToken: crypto.randomUUID(),
                },
              })
            }
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
          await client.session.updateMany({
            where: { userId: session.user.id },
            data: {
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          })
        }

        return session
      },
    },
    events: {
      async signIn({ user }) {
        // Update session expiry on sign in
        await client.session.updateMany({
          where: { userId: user.id },
          data: {
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        })
      },
      async createUser({ user }) {
        await client.profile.create({
          data: {
            userId: user.id as string,
            avatar: user.image || null,
          },
        })
      },
      async signOut(params) {
        if ('token' in params && params.token?.id) {
          await client.session.deleteMany({
            where: { userId: params.token.id },
          })
        }
        if ('session' in params && params.session && 'userId' in params.session) {
          await client.session.deleteMany({
            where: { userId: params.session.userId },
          })
        }
      },
    },
  }),
)

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Request password reset
 *     description: Send password reset email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *     responses:
 *       200:
 *         description: Reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset email sent
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/reset-password', async (req: Request, res: Response) =>
  authController.resetPassword(req, res),
)

/**
 * @swagger
 * /api/auth/reset-password-confirm:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Confirm password reset
 *     description: Reset password with token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               token:
 *                 type: string
 *                 description: Reset token from email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: New password
 *     responses:
 *       200:
 *         description: Password reset successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password reset successful
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/Error'
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
authRouter.post('/reset-password-confirm', authController.resetPasswordConfirm)

// Add this after your router configuration
// Clean up expired sessions every hour

// setInterval(
//   async () => {
//     try {
//       await client.session.deleteMany({
//         where: {
//           expires: {
//             lt: new Date(),
//           },
//         },
//       })
//     } catch (error) {
//       _logger.error('Failed to clean up expired sessions: \n%s', error)
//     }
//   },
//   60 * 60 * 1000,
// )

export { authRouter }
