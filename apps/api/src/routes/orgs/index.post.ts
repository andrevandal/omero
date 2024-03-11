import { eventHandler, readValidatedBody, createError, sendError } from 'h3'

import logger from '@/services/logger'
import { createOrganizationSchema } from '@/schemas/requests'
import { createOrganization } from '@/repository/organization'
import { getUserFromEventContext } from '@/services/auth'

export default eventHandler(async (event) => {
  const log = logger('[POST] /orgs')

  const self = getUserFromEventContext(event.context)

  const result = await readValidatedBody(event, body =>
    createOrganizationSchema.safeParseAsync(body)
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

  const org = await createOrganization({ ...result.data, owner: self.userId })

  if (!org) {
    log.debug('Organization already exists')
    return sendError(
      event,
      createError({
        statusCode: 409,
        statusMessage: 'Organization already exists',
        data: undefined,
        stack: undefined
      })
    )
  }

  return org
})
