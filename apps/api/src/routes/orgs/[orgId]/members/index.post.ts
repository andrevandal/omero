import { eventHandler, readValidatedBody } from 'h3'
import logger from '@/services/logger'
import {
  organizationIdParamsSchema,
  createMembershipBodySchema
} from '@/schemas/requests'
import { getUserFromEventContext } from '@/services/auth'
import { canAssociateMembers } from '@/services/permissions'
import { associateMembership } from '@/repository/organization'
export default eventHandler(async (event) => {
  const log = logger('[POST] /orgs/[orgId]/members')

  const params = await getValidatedRouterParams(event, params =>
    organizationIdParamsSchema.safeParseAsync(params)
  )

  log.debug('Params', params)

  if (params.success === false) {
    log.debug('Bad request')
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad request',
        data: params.error.issues,
        stack: undefined
      })
    )
  }

  const body = await readValidatedBody(event, body =>
    createMembershipBodySchema.safeParseAsync(body)
  )

  if (body.success === false) {
    log.debug('Bad request')
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad request',
        data: body.error.issues,
        stack: undefined
      })
    )
  }

  const self = getUserFromEventContext(event.context)

  if (!canAssociateMembers(self.orgs, params.data.orgId)) {
    return sendError(
      event,
      createError({
        statusCode: 403,
        statusMessage: 'Not allowed',
        data: undefined,
        stack: undefined
      })
    )
  }

  const association = await associateMembership({
    userId: body.data.userId,
    organizationId: params.data.orgId,
    role: body.data.role
  })

  return association
})
