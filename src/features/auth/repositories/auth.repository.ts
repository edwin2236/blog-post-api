import bcrypt from 'bcryptjs'

import {
  ExpiredResetPasswordTokenError,
  InvalidTokenError,
} from '@/features/auth/errors.js'
import {
  CreateUserArgs,
  IAuthRepository,
} from '@/features/auth/repository-interfaces/auth.repository.interface.js'
import { UserNotFoundError } from '@/features/users/errors.js'
import { client } from '@/shared/database/prisma-client.js'
import { Role, User, UserResponseSchema } from '@/shared/schemas/user.schema.js'
import { logger } from '@/shared/utils/logger.js'

export class AuthRepository implements IAuthRepository {
  private readonly _logger = logger.child({ service: 'App' })

  constructor() {
    this._logger.defaultMeta = { service: 'AuthRepository' }
  }

  findByCredentials = async (email: string, password: string): Promise<User> => {
    try {
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

      if (!user || !(await bcrypt.compare(password, user.password ?? ''))) {
        throw new Error('Invalid credentials')
      }

      const result = await UserResponseSchema.safeParseAsync(user)

      if (!result.success) {
        throw new Error('Invalid user data')
      }

      return result.data
    } catch (error) {
      this._logger.error('Error finding user by credentials', error)
      throw error
    }
  }

  register = async (args: CreateUserArgs): Promise<User> => {
    try {
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

      const result = await UserResponseSchema.safeParseAsync(user)

      if (!result.success) {
        throw new Error('Invalid user data')
      }

      return result.data
    } catch (error) {
      this._logger.error('Error creating user', error)
      throw error
    }
  }

  generateResetPasswordToken = async (email: string) => {
    try {
      const result = await client.user.findUnique({
        where: { email },
        select: { id: true },
      })

      if (!result?.id) {
        throw new Error('User not found')
      }

      const res = await client.verificationToken.create({
        data: {
          identifier: result.id,
          token: crypto.randomUUID(),
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
        select: {
          token: true,
        },
      })

      return Buffer.from(
        JSON.stringify({
          email,
          token: res.token,
        }),
      ).toString('base64')
    } catch (error) {
      this._logger.error('Error generating reset password token', error)
      throw error
    }
  }

  decodeResetPasswordToken(encodedToken: string): { email: string; token: string } {
    try {
      return JSON.parse(Buffer.from(encodedToken, 'base64').toString('utf-8'))
    } catch (error) {
      this._logger.error('Error decoding reset password token', error)
      throw error
    }
  }

  async resetPasswordConfirm(
    email: string,
    token: string,
    password: string,
  ): Promise<void> {
    try {
      const result = await client.user.findUnique({
        where: { email },
        select: { id: true },
      })

      if (!result?.id) {
        throw new UserNotFoundError()
      }

      const verificationToken = await client.verificationToken.findFirst({
        where: { token, identifier: result.id },
      })

      if (!verificationToken) {
        throw new InvalidTokenError()
      }

      if (verificationToken.expires < new Date()) {
        throw new ExpiredResetPasswordTokenError()
      }

      await client.user.update({
        where: { id: result.id },
        data: { password: bcrypt.hashSync(password, 10) },
      })

      await client.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      })
    } catch (error) {
      this._logger.error('Error confirming password reset', error)
      throw error
    }
  }
}
