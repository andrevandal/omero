import { describe, it, expect, vi } from 'vitest'
import postLogin from '@/routes/auth/login.post'
import { eventFactory, Headers, Body } from '@/utils'

const { dbPoolMock, dbHttpMock } = vi.hoisted(() => {
  return {
    dbPoolMock: {
      select: vi.fn().mockImplementation(function () {
        return this // Retorna o próprio objeto mock
      }),
      from: vi.fn().mockImplementation(function (table: string) {
        this.table = table // Armazena a tabela
        return this // Retorna o próprio objeto mock
      }),
      where: vi.fn().mockImplementation(function (predicate: any) {
        this.predicate = predicate // Armazena o predicado
        return this // Retorna o próprio objeto mock
      })
    },
    dbHttpMock: vi.fn()
  }
})

vi.mock('@/connector/database', () => {
  return {
    dbPool: dbPoolMock,
    dbHttp: dbHttpMock
  }
})

const loginEvent = (body: Body, headers?: Headers) =>
  eventFactory({
    url: '/login',
    method: 'POST',
    headers: headers ?? {
      'Content-Type': 'application/json'
    },
    body
  })

describe('[POST] /login', () => {
  // returns 400 if email invalid
  it('returns 400 if email invalid', async () => {
    const { event, response } = loginEvent({
      email: 'testtest.com',
      password: 'password'
    })

    await postLogin(event)

    const { _isEndCalled, _getJSONData, statusCode, statusMessage } = response
    const { data } = _getJSONData()

    expect(statusCode).toEqual(400)
    expect(_isEndCalled()).toBeTruthy()
    expect(statusMessage).toEqual('Invalid credentials')
    expect(data.length).toBeGreaterThan(0)
  })

  // returns 400 if password invalid
  it('returns 400 if password invalid', async () => {
    const { event, response } = loginEvent({
      email: 'test@test.com'
    })

    await postLogin(event)

    const { _isEndCalled, _getJSONData, statusCode, statusMessage } = response
    const { data } = _getJSONData()

    expect(statusCode).toEqual(400)
    expect(_isEndCalled()).toBeTruthy()
    expect(statusMessage).toEqual('Invalid credentials')
    expect(data.length).toBeGreaterThan(0)
  })

  // returns 401 if credentials are invalid
  it('returns 401 if credentials are invalid', async () => {
    const { event, response } = loginEvent({
      email: 'test@test.com',
      password: 'wrong'
    })

    // dbPoolMock.mockImplementationOnce(() => {
    //   return {
    //     select: vi.fn().mockImplementation(() => {
    //       return {
    //         from: vi.fn().mockImplementation(() => {
    //           return {
    //             where: vi.fn().mockImplementation(() => {
    //               return Promise.resolve([])
    //             })
    //           }
    //         })
    //       }
    //     })
    //   }
    // })

    await postLogin(event)

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
    const { event, response } = loginEvent({
      email: 'test@test.com',
      password: 'password'
    })

    const data = await postLogin(event)

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
