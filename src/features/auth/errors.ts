export class ExpiredResetPasswordTokenError extends Error {
  constructor() {
    super('ExpiredResetPasswordTokenError')
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super('InvalidTokenError')
  }
}
