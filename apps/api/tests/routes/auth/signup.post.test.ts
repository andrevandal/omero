import { describe, it, expect, vi } from 'vitest'
import postSignup from '@/routes/auth/signup.post'

import { eventFactory, Headers, Body } from '@/utils'

const { dbPoolMock, dbHttpMock } = vi.hoisted(() => {
  return {
    dbPoolMock: vi.fn(),
    dbHttpMock: vi.fn()
  }
})

vi.mock('@/connector/database', () => {
  return {
    dbPool: dbPoolMock,
    dbHttp: dbHttpMock
  }
})

const signupEvent = (body: Body, headers?: Headers) =>
  eventFactory({
    url: '/signup',
    method: 'POST',
    headers: headers ?? {
      'Content-Type': 'application/json'
    },
    body
  })

describe('[POST] /signup', () => {
  // returns 400 if email invalid
  it('returns 400 if email invalid', async () => {
    const { event, response } = signupEvent({
      email: 'testtest.com',
      password: 'password'
    })

    await postSignup(event)

    const { _isEndCalled, _getJSONData, statusCode, statusMessage } = response
    const { data } = _getJSONData()

    expect(statusCode).toEqual(400)
    expect(_isEndCalled()).toBeTruthy()
    expect(statusMessage).toEqual('Invalid credentials')
    expect(data.length).toBeGreaterThan(0)
  })

  // returns 400 if password invalid
  it('returns 400 if password invalid', async () => {
    const { event, response } = signupEvent({
      email: 'test@test.com'
    })

    await postSignup(event)

    const { _isEndCalled, _getJSONData, statusCode, statusMessage } = response
    const { data } = _getJSONData()

    expect(statusCode).toEqual(400)
    expect(_isEndCalled()).toBeTruthy()
    expect(statusMessage).toEqual('Invalid credentials')
    expect(data.length).toBeGreaterThan(0)
  })

  // returns 401 if credentials are invalid
  it('returns 401 if credentials are invalid', async () => {
    const { event, response } = signupEvent({
      email: 'test@test.com',
      password: 'wrong'
    })

    await postSignup(event)

    const { _isEndCalled, _getJSONData, statusCode, statusMessage } = response
    const { data } = _getJSONData()

    expect(statusCode).toEqual(401)
    expect(_isEndCalled()).toBeTruthy()
    expect(statusMessage).toEqual('Invalid credentials')
    expect(data).toEqual({
      message: 'Invalid email or password'
    })
  })

  // returns 200 and cookie if credentials are valid
  it('returns 200 and cookie if credentials are valid', async () => {
    const { event, response } = signupEvent({
      email: 'test@test.com',
      password: 'password'
    })

    const data = await postSignup(event)

    const { getHeader, statusCode } = response
    const cookie = getHeader('set-cookie')

    expect(statusCode).toEqual(200)
    // expect(_isEndCalled()).toBeTruthy()
    expect(data).toStrictEqual({
      message: 'Logged in'
    })
    expect(cookie).toBeDefined()
    expect(cookie).toBe('test=123')
  })
})
