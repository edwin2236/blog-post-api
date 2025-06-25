import { z } from 'zod'

export const ResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    statusCode: z.number().min(100).max(599),
    message: z.string().min(1).max(1000),
    data: z.lazy(() => schema).optional(),
  })

export const ErrorResponseSchema = z.object({
  statusCode: z.number().min(400).max(499),
  message: z.string().min(1).max(1000),
  errors: z.array(
    z.object({
      field: z.string().min(1).max(100),
      message: z.string().min(1).max(1000),
    }),
  ),
})
