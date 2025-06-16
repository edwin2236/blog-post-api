import { Role } from '@/shared/schemas/user.schema.js'

declare module '@auth/express' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      lastName: string
      role: Role
      isActive: boolean
      emailVerified?: Date | null
      Profile?: {
        avatar?: string | null
      } | null
    }
  }
}

// Extend JWT type if needed
declare module '@auth/express' {
  interface JWT {
    id: string
    email: string
    name: string
    lastName: string
    role: Role
    isActive: boolean
    emailVerified?: Date | null
  }
}

// Extend User type if needed
declare module '@auth/express' {
  interface User {
    id: string
    email: string
    name: string
    lastName: string
    role: Role
    isActive: boolean
    emailVerified?: Date | null
    Profile?: {
      avatar?: string | null
    } | null
  }
}
