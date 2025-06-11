import swaggerJsdoc from 'swagger-jsdoc'
import { zodToJsonSchema } from 'zod-to-json-schema'

import { userSchemas } from '@/shared/domain/schemas/user.schema.js'
import { API_BASE_URL, NODE_ENV } from '@/shared/utils/constants.js'

// Generate OpenAPI schemas from Zod schemas
const convertSchemas = () => {
  const schemas = Object.entries(userSchemas).reduce(
    (acc, [key, schema]) => {
      acc[key] = zodToJsonSchema(schema, {
        target: 'openApi3',
        $refStrategy: 'none',
      })

      return acc
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    {} as Record<string, any>,
  )

  return {
    ...schemas,
    Error: {
      type: 'object',
      required: ['message'],
      properties: {
        message: {
          type: 'string',
          description: 'Error message',
        },
        code: {
          type: 'string',
          description: 'Error code',
        },
      },
    },
  }
}

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog Post API',
      version: '1.0.0',
      description: 'RESTful API for blog posts and user management',
    },
    servers: [
      {
        url: API_BASE_URL,
        description: NODE_ENV === 'production' ? 'Production' : 'Development',
      },
    ],
    components: undefined,
    definitions: convertSchemas(),
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints',
      },
      {
        name: 'Users',
        description: 'User management endpoints',
      },
      {
        name: 'Posts',
        description: 'Blog post management endpoints',
      },
      {
        name: 'Comments',
        description: 'Comment management endpoints',
      },
    ],
  },
  apis: ['src/features/*/presentation/*.router.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
