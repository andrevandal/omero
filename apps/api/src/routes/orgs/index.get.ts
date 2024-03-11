import { eventHandler } from 'h3'
import logger from '@/services/logger'
import { getUserFromEventContext } from '@/services/auth'
import { getOrganizationsQuerySchema } from '@/schemas/requests'
import { listOrganizations } from '@/repository/organization'
import { isSuperAdmin } from '@/services/permissions'

export default eventHandler(async (event) => {
  const log = logger('[GET] /orgs')

  const query = await getValidatedRouterParams(event, params =>
    getOrganizationsQuerySchema.safeParseAsync(params)
  )

  if (query.success === false) {
    log.debug('Bad request')
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad request',
        data: query.error.issues,
        stack: undefined
      })
    )
  }

  const self = getUserFromEventContext(event.context)

  const organizations = await listOrganizations({
    userId: self.userId,
    limit: query.data.limit,
    offset: query.data.offset,
    membership: isSuperAdmin(self.email) ? query.data.membership : true
    // ...(query.data.members || query.data.projects
    //   ? {
    //       includes: {
    //         members: query.data.members
    //         projects: query.data.projects
    //       }
    //     }
    //   : {})
  })

  return organizations
})
