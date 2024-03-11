import { eventHandler } from 'h3'
import { verifyJWT } from '@/services/auth'

// [GET] /me
export default eventHandler(async (event) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, jwt] = `${event.headers.get('Authorization')}`.split(' ')
  if (!jwt) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        stack: undefined
      })
    )
  }
  const user = await verifyJWT(jwt)
  if (!user) {
    return sendError(
      event,
      createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        stack: undefined
      })
    )
  }
  return user
})
