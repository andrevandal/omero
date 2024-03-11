import { eventHandler, readValidatedBody, createError, sendError } from 'h3'
import logger from '@/services/logger'
import {
  editOrganizationBodySchema,
  editOrganizationParamsSchema
} from '@/schemas/requests'
import { editOrganization } from '@/repository/organization'
export default eventHandler(async (event) => {
  const log = logger('[PUT] /orgs/[id]')

  const params = await getValidatedRouterParams(event, params =>
    editOrganizationParamsSchema.safeParseAsync(params)
  )

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
  const result = await readValidatedBody(event, body =>
    editOrganizationBodySchema.safeParseAsync(body)
  )

  if (result.success === false) {
    log.debug('Bad request')
    return sendError(
      event,
      createError({
        statusCode: 400,
        statusMessage: 'Bad request',
        data: result.error.issues,
        stack: undefined
      })
    )
  }

  const org = await editOrganization({ id: params.data.orgId, ...result.data })

  if (!org) {
    log.debug('Organization not found')
    return sendError(
      event,
      createError({
        statusCode: 404,
        statusMessage: 'Organization not found or slug is used.',
        data: undefined,
        stack: undefined
      })
    )
  }

  return org
})
