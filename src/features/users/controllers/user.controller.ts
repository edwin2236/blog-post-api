import { Request, Response } from 'express'

export class UserController {
  public static getAllUsers(req: Request, res: Response) {
    res.send([
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
      },
      {
        id: '2',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
      },
    ])
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
