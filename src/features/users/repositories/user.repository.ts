import { IUserRepository } from '@/features/users/repostory-interfaces/user.repository.interface.js'
import { client } from '@/shared/database/prisma-client.js'
import { User } from '@/shared/schemas/user.schema.js'
import { logger } from '@/shared/utils/logger.js'

export class UserRepository implements IUserRepository {
  private readonly _logger = logger.child({ service: 'App' })

  constructor() {
    this._logger.defaultMeta = { service: 'UserRepository' }
  }

  findByEmail(email: string): Promise<User | null> {
    throw new Error('Method not implemented.')
  }
  findById(id: string): Promise<User | null> {
    throw new Error('Method not implemented.')
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  findBy(key: keyof User, value: any): Promise<User | null> {
    return client.user.findFirst({
      where: {
        [key]: value,
      },
    })
  }
  findAll(): Promise<User[]> {
    throw new Error('Method not implemented.')
  }
}
