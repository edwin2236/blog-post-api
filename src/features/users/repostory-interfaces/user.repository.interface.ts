import { User } from '@/shared/schemas/user.schema.js'

export interface IUserRepository {
  findBy(params: Partial<User>): Promise<User | null>
  findAll(): Promise<User[]>
}
