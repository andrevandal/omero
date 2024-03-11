import { describe, it, expect } from 'vitest'
import type { H3Event } from 'h3'
import getPing from '../../src/routes/ping.get'

describe('[GET] /ping', () => {
  it('returns pong', async () => {
    const event = {} as H3Event
    const response = await getPing(event)
    expect(response).toStrictEqual('pong')
  })
})
