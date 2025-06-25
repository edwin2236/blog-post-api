import { z } from 'zod'

import { ResponseSchema } from '@/shared/schemas/response.schema.js'

const Roles = z.enum(['USER', 'ADMIN'], {
  description: "The user's role in the system",
  errorMap: _issue => ({
    message: 'Role must be either USER or ADMIN',
  }),
})

// Base User Schema with rich descriptions
export const UserSchema = z.object({
  id: z.string().uuid().describe('The unique identifier of the user'),
  email: z.string().email().describe("The user's email address"),
  emailVerified: z.date().nullable().describe("When the user's email was verified"),
  name: z.string().min(2).max(100).optional().describe("The user's first name"),
  lastName: z.string().min(2).max(100).optional().describe("The user's last name"),
  password: z
    .string()
    .min(8)
    .max(100)
    .optional()
    .describe("The user's password - minimum 8 characters"),
  createdAt: z.date().describe('When the user was created'),
  updatedAt: z.date().describe('When the user was last updated'),
  isActive: z.boolean().default(true).describe('Whether the user account is active'),
  role: Roles.default('USER'),
})

// Schema for user creation (registration)
export const CreateUserSchema = UserSchema.omit({
  id: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  role: true,
})
  .required({
    password: true,
  })
  .describe('Data required to create a new user')

// Schema for user responses (without sensitive data)
export const UserResponseSchema = UserSchema.omit({
  password: true,
  emailVerified: true,
}).describe('User data returned in responses (excludes sensitive information)')

// Schema for login
export const LoginSchema = z
  .object({
    email: z.string().email().describe("The user's email address"),
    password: z.string().min(8).describe("The user's password"),
  })
  .describe('Credentials required for login')

// Export all schemas for swagger generation
export const userSchemas = {
  User: UserSchema,
  CreateUser: CreateUserSchema,
  UserResponse: ResponseSchema(UserResponseSchema),
  Login: LoginSchema,
} as const

// Export types
export type User = z.infer<typeof UserResponseSchema>

export type CreateUser = z.infer<typeof CreateUserSchema>

export type UserResponse = z.infer<typeof UserResponseSchema>

export type Role = z.infer<typeof Roles>

export const Role = Roles.Enum
