import { createEvent } from 'h3'
import {
  RequestMethod,
  createRequest,
  createResponse,
  Headers,
  Body
} from 'node-mocks-http'
export type { Headers, Body } from 'node-mocks-http'
export function eventFactory ({
  url,
  method,
  headers,
  body
}: {
  url: string
  method: RequestMethod
  headers?: Headers
  body?: Body
}) {
  const request = createRequest({
    url,
    method,
    headers,
    body
  })
  const response = createResponse({})
  const event = createEvent(request, response)
  return { response, request, event }
}

export default { eventFactory }
