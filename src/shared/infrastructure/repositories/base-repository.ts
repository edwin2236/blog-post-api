import { PrismaClient } from '@prisma/client'

export class BaseRepository {
  constructor(protected readonly client: PrismaClient) {}
}
