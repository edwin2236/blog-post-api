import { Request, Response } from 'express'

import { IAuthRepository } from '@/features/auth/repository-interfaces/auth.repository.interface.js'
import { IUserRepository } from '@/features/users/repostory-interfaces/user.repository.interface.js'
import { CreateUserSchema } from '@/shared/schemas/user.schema.js'
import { IEmailService } from '@/shared/services/email.service.js'
import { HttpStatus } from '@/shared/types/http-status.js'
import { APP_BASE_URL } from '@/shared/utils/constants.js'
import { HttpResponse, HttpError } from '@/shared/utils/http-response.js'
import { logger } from '@/shared/utils/logger.js'

export class AuthController {
  private readonly _logger = logger.child({ service: 'AuthController' })

  constructor(
    private readonly authRepository: IAuthRepository,
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailService,
  ) {
    this._logger.defaultMeta = { service: 'AuthController' }
  }

  public authenticate = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return null
      }

      const user = await this.authRepository.findByCredentials(email, password)

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
        return res.status(HttpStatus.BAD_REQUEST).json(
          new HttpError(
            HttpStatus.BAD_REQUEST,
            'Invalid input',
            result.error.errors.map(error => ({
              field: String(error.path),
              message: error.message,
            })),
          ),
        )
      }

      const userExists = await this.userRepository.findBy({ email: result.data.email })

      if (userExists) {
        return res
          .status(HttpStatus.CONFLICT)
          .json(new HttpError(HttpStatus.CONFLICT, 'User already exists'))
      }

      const newUser = await this.authRepository.register(result.data)

      return res
        .status(HttpStatus.CREATED)
        .json(new HttpResponse(HttpStatus.CREATED, newUser))
    } catch (error) {
      this._logger.error('Failed to register user %s', { error })

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'))
    }
  }

  public resetPassword = async (req: Request, res: Response) => {
    try {
      const { email } = req.body

      if (!email) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(new HttpError(HttpStatus.BAD_REQUEST, 'Email is required'))
      }

      const user = await this.userRepository.findBy({ email })

      if (!user) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json(new HttpError(HttpStatus.NOT_FOUND, 'User not found'))
      }

      const token = await this.authRepository.generateResetPasswordToken(email)

      const url = `${APP_BASE_URL}/reset-password/${token}`

      this.emailService.sendEmail(
        email,
        'Password Reset  ',
        `Hello ${user.name}, please click the link below to reset your password. \n<a href="${url}">Reset Password</a>`,
      )

      return res
        .status(HttpStatus.OK)
        .json(new HttpResponse(HttpStatus.OK, { message: 'Password reset email sent' }))
    } catch (error) {
      this._logger.error('Failed to initiate password reset', { error })
      res.status(500).json(new HttpError(500, 'Internal server error'))
    }
  }

  public resetPasswordConfirm = async (req: Request, res: Response) => {
    try {
      const { encodedToken, password } = req.body

      if (!encodedToken || !password) {
        this._logger.warning('Missing required fields')

        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(new HttpError(HttpStatus.BAD_REQUEST, 'Missing required fields'))
      }

      const decodedToken = this.authRepository.decodeResetPasswordToken(encodedToken)

      await this.authRepository.resetPasswordConfirm(
        decodedToken.email,
        decodedToken.token,
        password,
      )

      return res
        .status(HttpStatus.OK)
        .json(new HttpResponse(HttpStatus.OK, 'Password reset successful'))
    } catch (error) {
      this._logger.error('Failed to confirm password reset', { error })
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(new HttpError(HttpStatus.INTERNAL_SERVER_ERROR, 'Internal server error'))
    }
  }
}
