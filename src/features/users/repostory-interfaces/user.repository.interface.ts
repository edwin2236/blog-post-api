import { User } from '@/shared/schemas/user.schema.js'

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>
  findById(id: string): Promise<User | null>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findBy(key: keyof User, value: any): Promise<User | null>
  findAll(): Promise<User[]>
}
