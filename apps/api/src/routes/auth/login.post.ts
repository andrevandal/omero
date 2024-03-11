import { eventHandler, readValidatedBody, createError, sendError } from 'h3'

import logger from '@/services/logger'
import { loginUserSchema } from '@/schemas/requests'
import { loginUser } from '@/repository/user'
const log = logger('[POST] /login')

// [POST] /login
export default eventHandler(async (event) => {
  log.debug('New request...', event.path, event.method)
  const result = await readValidatedBody(event, body =>
    loginUserSchema.safeParseAsync(body)
  )

  if (result.success === false) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Invalid credentials',
        data: result.error.issues,
        stack: undefined
      })
    )
  }

  const { email, password } = result.data

  const user = await loginUser({
    email,
    password
  })

  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Invalid credentials',
        data: {
          message: 'Invalid email or password'
        },
        stack: undefined
      })
    )
  }

  log.debug('User signed up successfully', { email, ...user })

  return {
    success: true,
    message: 'Logged in',
    jwt: user.jwt
  }
})
