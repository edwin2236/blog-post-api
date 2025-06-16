import { Request, Response } from 'express'

import { IAuthRepository } from '@/features/auth/repository-interfaces/auth.repository.interface.js'
import { IUserRepository } from '@/features/users/repostory-interfaces/user.repository.interface.js'
import { CreateUserSchema } from '@/shared/schemas/user.schema.js'
import { logger } from '@/shared/utils/logger.js'

export class AuthController {
  private readonly _logger = logger.child({ service: 'AuthController' })

  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly userRepository: IUserRepository,
  ) {
    this._logger.defaultMeta = { service: 'AuthController' }
  }

  public authenticate = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        this._logger.error('Email and password are required')
        throw new Error('Email and password are required')
      }

      this._logger.info('Attempting to login user %s', { email })

      const user = await this.authRepository.findByCredentials(email, password)

      this._logger.info('User logged in successfully', { userId: user.id })

      return user
    } catch (error) {
      this._logger.error('Failed to authenticate user', { error })

      return null
    }
  }

  public signUp = async (req: Request, res: Response) => {
    try {
      const input = req.body
      const result = CreateUserSchema.safeParse(input)

      if (!result.success) {
        this._logger.warning('Invalid input %s', { input })

        return res.status(400).json({
          message: 'Invalid input',
          errors: result.error.errors.map(error => ({
            field: error.path,
            message: error.message,
          })),
        })
      }

      const userExists = await this.userRepository.findBy('email', result.data.email)

      if (userExists) {
        this._logger.warning('User already exists %s', { email: result.data.email })

        return res.status(409).json({ message: 'User already exists' })
      }

      const newUser = await this.authRepository.register(result.data)

      this._logger.info('User registered successfully %s', newUser.id)

      return res.status(201).json(newUser)
    } catch (error) {
      this._logger.error('Failed to register user %s', { error })

      return { message: 'Internal server error', error }
    }
  }

  public resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body

      if (!email) {
        this._logger.warn('Missing required fields', { email })
        res.status(400).json({ message: 'Email is required' })

        return
      }

      this._logger.info('Attempting to reset password', { email })
      await this.authRepository.resetPassword(email)

      this._logger.info('Password reset email sent', { email })
      res.status(200).json({ message: 'Password reset email sent' })
    } catch (error) {
      this._logger.error('Failed to initiate password reset', { error })
      res.status(500).json({ message: 'Internal server error' })
    }
  }

  public resetPasswordConfirm = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, token, password } = req.body

      if (!email || !token || !password) {
        this._logger.warn('Missing required fields', { email })
        res.status(400).json({ message: 'Email, token, and new password are required' })

        return
      }

      this._logger.info('Attempting to confirm password reset', { email })
      await this.authRepository.resetPasswordConfirm(email, token, password)

      this._logger.info('Password reset completed', { email })
      res.status(200).json({ message: 'Password reset successful' })
    } catch (error) {
      this._logger.error('Failed to confirm password reset', { error })
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
