import { App } from './app/index.js'
import { userRouter } from './app/users/user-router.js'
import { loadEnvs } from './shared/utils/loadEnvs.js'

loadEnvs()

const PORT = process.env.NODE_PORT ?? 3000

App.builder().withRouter('/api/users', userRouter).start(Number(PORT))
