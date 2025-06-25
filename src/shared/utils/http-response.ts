import { HttpStatus } from '@/shared/types/http-status.js'

export class HttpResponse {
  constructor(
    public statusCode: number,
    public data?: unknown,
  ) {}
}

export class HttpError extends Error {
  constructor(
    public statusCode: HttpStatus,
    public message: string,
    public errors?: { field: string; message: string }[],
  ) {
    super(message)
  }
}
