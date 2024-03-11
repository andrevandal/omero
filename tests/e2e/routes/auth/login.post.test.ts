import { describe, expect, it } from 'vitest'
import { setupTests } from '../../../tests'

export const route = {
  path: '/login',
  method: 'POST'
}
describe(`[${route.method}] ${route.path}`, async () => {
  const ctx = await setupTests()

  it('returns 400 when schema missmatch', async () => {
    const response = await ctx.fetch(route.path, {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid'
      })
    })
    expect(await response.json()).toMatchObject({
      error: {
        message: 'Invalid email'
      }
    })
    expect(response.status).toBe(400)
  })

  it('returns 400 when user not found', async () => {
    const response = await ctx.fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid',
        password: 'invalid'
      })
    })
    expect(await response.json()).toMatchObject({
      error: {
        message: 'Invalid email or password'
      }
    })
    expect(response.status).toBe(400)
  })
  it('returns 400 when credentials are invalid', async () => {
    const response = await ctx.fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid',
        password: 'invalid'
      })
    })
    expect(await response.json()).toMatchObject({
      error: {
        message: 'Invalid email or password'
      }
    })
    expect(response.status).toBe(400)
  })

  it('returns 200 and cookie when credentials are valid', async () => {
    const user = {
      email: 'test@test.com',
      password: 'password'
    } // await ctx.createUser()
    const response = await ctx.fetch('/login', {
      method: 'POST',
      body: JSON.stringify({
        email: user.email,
        password: user.password
      })
    })
    expect(await response.json()).toMatchObject({
      success: true
    })
    expect(response.status).toBe(200)
    expect(response.headers.get('set-cookie')).toBeDefined()
  })
})
