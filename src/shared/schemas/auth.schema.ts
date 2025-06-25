import { z } from 'zod'

import { ResponseSchema } from '@/shared/schemas/response.schema.js'

const ResetPasswordSchema = z.object({
  email: z.string().email().min(2).max(255),
})

const ResetPasswordResponseSchema = z.object({
  message: z.string().min(1).max(255),
})

const ResetPasswordConfirmSchema = z.object({
  encodedToken: z.string().min(1),
  password: z.string().min(8).max(255),
})

const CsrfTokenSchema = z.object({
  csrfToken: z.string().min(1),
})

export const authSchemas = {
  AuthResetPassword: ResetPasswordSchema,
  AuthResetPasswordConfirm: ResetPasswordConfirmSchema,
  AuthResetPasswordResponse: ResponseSchema(ResetPasswordResponseSchema),
  AuthCsrfToken: CsrfTokenSchema,
}

export type ResetPassword = z.infer<typeof ResetPasswordSchema>

export type ResetPasswordConfirm = z.infer<typeof ResetPasswordConfirmSchema>
