import bcrypt from 'bcryptjs'

import {
  CreateUserArgs,
  IAuthRepository,
} from '@/features/auth/repository-interfaces/auth.repository.interface.js'
import { client } from '@/shared/database/prisma-client.js'
import { Role, User } from '@/shared/schemas/user.schema.js'
import { logger } from '@/shared/utils/logger.js'

export class AuthRepository implements IAuthRepository {
  private readonly _logger = logger.child({ service: 'App' })

  constructor() {
    this._logger.defaultMeta = { service: 'AuthRepository' }
  }
  async findByCredentials(email: string, password: string): Promise<User> {
    const user = await client.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials')
    }

    return user
  }

  register = async (args: CreateUserArgs): Promise<User> => {
    const user = await client.user.create({
      data: {
        ...args,
        password: bcrypt.hashSync(args.password, 10),
        isActive: true,
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return user
  }

  resetPassword(email: string): Promise<void> {
    this._logger.info('Attempting to reset password', { email })
    throw new Error('Method not implemented.')
  }

  resetPasswordConfirm(email: string, token: string, password: string): Promise<void> {
    this._logger.info('Attempting to confirm password reset', { email })
    throw new Error('Method not implemented.')
  }
}
