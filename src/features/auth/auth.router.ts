import type { Router as RouterType } from 'express'

import { Router } from 'express'

import { AuthController } from '@/features/auth/controllers/auth.controller.js'
import { AuthRepository } from '@/features/auth/repositories/auth.repository.js'
import { UserRepository } from '@/features/users/repositories/user.repository.js'
import { authConfig } from '@/shared/configs/auth.config.js'
import { client } from '@/shared/database/prisma-client.js'
import { EmailService } from '@/shared/services/email.service.js'
import { logger } from '@/shared/utils/logger.js'

const authRouter: RouterType = Router()

// Initialize
const _logger = logger.child({ module: 'auth' })
const authRepository = new AuthRepository()
const userRepository = new UserRepository()
const emailService = new EmailService()

const authController = new AuthController(authRepository, userRepository, emailService)

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
 *               $ref: '#/definitions/ErrorResponse'
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
authRouter.post('/signup', async (req, res) => {
  authController.signUp(req, res)
})

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
 *             $ref: '#/definitions/AuthResetPassword'
 *     responses:
 *       200:
 *         description: Reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthResetPasswordResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
authRouter.post(
  '/reset-password',
  async (req, res) => void authController.resetPassword(req, res),
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
 *             $ref: '#/definitions/AuthResetPasswordConfirm'
 *     responses:
 *       200:
 *         description: Reset email sent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthResetPasswordResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/ErrorResponse'
 */
authRouter.post(
  '/reset-password-confirm',
  async (req, res) => void authController.resetPasswordConfirm(req, res),
)

/**
 * @swagger
 * /api/auth/csrf:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Csrf
 *     description: Get CSRF token
 *     responses:
 *       200:
 *         description: CSRF successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/AuthCsrfToken'
 */
authRouter.all(
  '/{*any}',
  authConfig({
    prismaClient: client,
    logger: _logger,
    authorizeCallback: async ({ email, password }) => {
      return await authController.authenticate(email, password)
    },
  }),
)

export { authRouter }
