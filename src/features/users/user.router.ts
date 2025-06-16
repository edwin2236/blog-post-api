import type { Router as RouterType } from 'express'

import { Router } from 'express'

import { UserController } from '@/features/users/controllers/user.controller.js'

const userRouter: RouterType = Router()

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
userRouter.get('/', UserController.getAllUsers)
userRouter.get('/:id', UserController.getUserById)

export { userRouter }
