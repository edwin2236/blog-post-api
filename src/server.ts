import { authRouter } from '@/features/auth/auth.router.js'
import { App } from '@/features/index.js'
import { userRouter } from '@/features/users/user.router.js'
import { NODE_PORT } from '@/shared/utils/constants.js'

App.builder()
  .withRouter('/api/auth', authRouter)
  .withRouter('/api/users', userRouter)
  .withSwagger()
  .start(Number(NODE_PORT))
