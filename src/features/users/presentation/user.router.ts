import type { Router as RouterType } from 'express'

import { Router } from 'express'

import { UserController } from '@/features/users/presentation/controllers/user.controller.js'

const userRouter: RouterType = Router()

userRouter.get('/', UserController.getAllUsers)
userRouter.get('/:id', UserController.getUserById)

export { userRouter }
