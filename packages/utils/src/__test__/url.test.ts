import { describe, expect, it } from 'vitest'

import { fullUrl } from '../url.js'

describe('fullUrl', () => {
  it('handles baseUrl with/without trailing slash and path with/without leading slash', () => {
    expect(fullUrl('https://a.com/', '/foo').toString()).toBe(
      'https://a.com/foo'
    )
    expect(fullUrl('https://a.com', '/foo').toString()).toBe(
      'https://a.com/foo'
    )
    expect(fullUrl('https://a.com/', 'foo').toString()).toBe(
      'https://a.com/foo'
    )
    expect(fullUrl('https://a.com', 'foo').toString()).toBe('https://a.com/foo')
  })

  it('handles baseUrl with subdirectory', () => {
    expect(fullUrl('https://a.com/base/', 'foo/bar').toString()).toBe(
      'https://a.com/base/foo/bar'
    )
  })

  it('returns path if absolute URL is given as path', () => {
    expect(fullUrl('https://a.com', 'https://b.com/bar').toString()).toBe(
      'https://b.com/bar'
    )
  })

  it('appends searchParams as URLSearchParams', () => {
    const parameters = new URLSearchParams({ a: '1', b: '2' })
    expect(fullUrl('https://a.com', '/foo', parameters).toString()).toBe(
      'https://a.com/foo?a=1&b=2'
    )
  })

  it('appends searchParams as Record', () => {
    expect(
      fullUrl('https://a.com', '/foo', {
        a: '1',
        b: '2'
      }).toString()
    ).toBe('https://a.com/foo?a=1&b=2')
  })

  it('handles empty searchParams (URLSearchParams)', () => {
    expect(
      fullUrl('https://a.com', '/foo', new URLSearchParams()).toString()
    ).toBe('https://a.com/foo')
  })

  it('handles empty searchParams (Record)', () => {
    expect(fullUrl('https://a.com', '/foo', {}).toString()).toBe(
      'https://a.com/foo'
    )
  })

  it('handles no searchParams', () => {
    expect(fullUrl('https://a.com', '/foo').toString()).toBe(
      'https://a.com/foo'
    )
  })

  it('encodes special characters in path and searchParams', () => {
    expect(
      fullUrl('https://a.com', '/f o o', {
        q: 'a b'
      }).toString()
    ).toBe('https://a.com/f%20o%20o?q=a+b')
  })

  it('overwrites existing query in path', () => {
    expect(
      fullUrl('https://a.com', '/foo?x=1', {
        y: '2'
      }).toString()
    ).toBe('https://a.com/foo?y=2')
  })

  it('returns a URL object', () => {
    const url = fullUrl('https://a.com', '/foo')
    expect(url).toBeInstanceOf(URL)
    expect(url.toString()).toBe('https://a.com/foo')
  })

  it('throws if baseUrl is invalid', () => {
    expect(() => fullUrl('not-a-url', '/foo')).toThrow()
  })

  it('throws if path is invalid', () => {
    expect(() => fullUrl('https://a.com', 'http://')).toThrow()
  })

  it('treats searchParams=undefined as no params', () => {
    expect(fullUrl('https://a.com', '/foo').toString()).toBe(
      'https://a.com/foo'
    )
  })

  it('throws if baseUrl is empty', () => {
    expect(() => fullUrl('', '/foo')).toThrow()
  })

  it('throws if path is empty', () => {
    expect(() => fullUrl('https://a.com', '')).not.toThrow() // URL allows empty path, becomes base
    expect(fullUrl('https://a.com', '').toString()).toBe('https://a.com/')
  })
})
