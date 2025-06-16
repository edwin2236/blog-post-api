import express, { Application, Router } from 'express'
import swaggerUi from 'swagger-ui-express'

import { swaggerSpec } from '@/shared/configs/swagger.config.js'
import { API_BASE_URL } from '@/shared/utils/constants.js'
import { logger } from '@/shared/utils/logger.js'

export class App {
  private readonly _app: Application
  private static instance: App
  private swaggerPath = '/api-docs'
  private readonly _logger = logger.child({ service: 'App' })

  private constructor() {
    this._app = express()
    this._app.set('trust proxy', true)
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

  public withSwagger(path?: string) {
    if (path) this.swaggerPath = path

    this._app.use(this.swaggerPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec))

    return this
  }

  public build(): Application {
    return this._app
  }

  public start(port: number, callback?: () => void): void {
    this._app.listen(port, () => {
      this._logger.info(`Server is running on port ${port}`)
      this._logger.info(`Swagger docs available at ${API_BASE_URL}${this.swaggerPath}`)
      if (callback) callback()
    })
  }
}
