import { authRouter } from '@/features/auth/presentation/auth.router.js'
import { App } from '@/features/index.js'
import { userRouter } from '@/features/users/presentation/user.router.js'
import { loadEnvs } from '@/shared/utils/loadEnvs.js'

loadEnvs()

const PORT = process.env.NODE_PORT ?? 3000

App.builder()
  .withRouter('/api/auth', authRouter)
  .withRouter('/api/users', userRouter)
  .start(Number(PORT))
