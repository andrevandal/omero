import { verifyJWT } from '@/services/auth'
export default defineEventHandler(async (event) => {
  if (getRequestURL(event).pathname.startsWith('/orgs')) {
    const [, jwt] = `${event.headers.get('Authorization')}`.split(' ')
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
    event.context.user = user
  }
})
