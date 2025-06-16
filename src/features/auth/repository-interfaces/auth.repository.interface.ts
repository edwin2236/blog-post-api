import { User } from '@/shared/schemas/user.schema.js'

export interface CreateUserArgs {
  email: string
  password: string
  name: string
  lastName: string
}

export interface IAuthRepository {
  findByCredentials(email: string, password: string): Promise<User>
  register(args: CreateUserArgs): Promise<User>
  resetPassword: (email: string) => Promise<void>
  resetPasswordConfirm: (email: string, token: string, password: string) => Promise<void>
}
