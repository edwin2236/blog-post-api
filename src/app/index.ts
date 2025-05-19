import express, { Application, Router } from 'express'

import { logger } from '@/shared/utils/logger.js'

export class App {
  private readonly _app: Application
  private static instance: App

  private constructor() {
    this._app = express()
    this._app.use(express.json())
  }

  public static builder(): App {
    if (!App.instance) {
      App.instance = new App()
    }

    return App.instance
  }

  public withRouter(path: string, router: Router) {
    this._app.use(path, router)

    return this
  }

  public build(): Application {
    return this._app
  }

  public start(port: number, callback?: () => void): void {
    this._app.listen(port, () => {
      logger.info(`Server is running on port ${port}`)
      if (callback) callback()
    })
  }
}
