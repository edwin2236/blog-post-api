import { Request, Response } from 'express'

export class UserController {
  public static getAllUsers(req: Request, res: Response) {
    res.send('Hello World!')
  }

  public static getUserById(req: Request, res: Response) {
    const { id } = req.params

    if (typeof id !== 'string') {
      res.status(400).send('Invalid user ID')

      return
    }
    res.send(`Hello World! ${id}`)
  }
}
