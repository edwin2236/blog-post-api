import { IUserRepository } from '@/features/users/repostory-interfaces/user.repository.interface.js'
import { client } from '@/shared/database/prisma-client.js'
import { User } from '@/shared/schemas/user.schema.js'
import { logger } from '@/shared/utils/logger.js'

export class UserRepository implements IUserRepository {
  private readonly _logger = logger.child({ service: 'App' })

  constructor() {
    this._logger.defaultMeta = { service: 'UserRepository' }
  }

  async findBy(params: Partial<User>): Promise<User | null> {
    const result = await client.user.findFirst({
      where: params,
      omit: {
        password: true,
      },
    })

    if (!result) return null

    return {
      ...result,
      name: result.name ?? undefined,
      lastName: result.lastName ?? undefined,
    }
  }

  findAll(): Promise<User[]> {
    throw new Error('Method not implemented.')
  }
}
