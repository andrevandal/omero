import { eventHandler, readValidatedBody, createError, sendError } from 'h3'
import logger from '@/services/logger'
import { registerUser } from '@/repository/user'
import { registerUserSchema } from '@/schemas/requests'

const log = logger('[POST] /signup')

// [POST] /signup
export default eventHandler(async (event) => {
  log.debug('New request...', event.path, event.method)
  const result = await readValidatedBody(event, body =>
    registerUserSchema.safeParseAsync(body)
  )

  if (result.success === false) {
    log.debug('Invalid credentials')
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

  const userId = await registerUser({
    email,
    password
  })

  if (!userId) {
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'User already exists',
        data: undefined,
        stack: undefined
      })
    )
  }

  log.debug('User signed up successfully', { email, userId })

  return {
    success: true,
    message: 'Signed up successfully'
  }
})
