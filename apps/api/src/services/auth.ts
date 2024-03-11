import { H3EventContext } from 'h3'
import { Argon2id } from 'oslo/password'
import { SignJWT, jwtVerify } from 'jose'
import { generateId } from './utils'
import logger from '@/services/logger'

const log = logger('[AUTH]')

const JWTConfig = {
  maxAge: '2h',
  issuer: 'urn:omero',
  audience: 'urn:vandal:services',
  algorithm: 'HS256'
}

const { PRIVATE_JWT_SECRET } = import.meta.env

const jwtSecret = new TextEncoder().encode(PRIVATE_JWT_SECRET)

export function hashPassword (password: string): Promise<string> {
  return new Argon2id().hash(password)
}

export function verifyPassword (
  password: string,
  hash: string
): Promise<boolean> {
  return new Argon2id().verify(hash, password)
}

type JWTPayload = {
  userId: string
  email: string
  orgs?: {
    id: string
    name: string
    slug: string
    role: string
  }[]
}
export async function createJWT ({
  userId,
  ...payload
}: JWTPayload): Promise<{ jwt: string; jti: string } | null> {
  const localLog = log.withTag('createJWT')
  localLog.debug('Creating JWT...', { userId, payload })
  try {
    const jti = generateId(15)
    const jwt = await new SignJWT(payload)
      .setJti(jti)
      .setProtectedHeader({ alg: JWTConfig.algorithm })
      .setIssuer(JWTConfig.issuer)
      .setAudience(JWTConfig.audience)
      .setExpirationTime(JWTConfig.maxAge)
      .setSubject(userId)
      .setIssuedAt()
      .sign(jwtSecret)
    return {
      jwt,
      jti
    }
  } catch (error) {
    log.error(error)
    return null
  }
}

type SignedJWT = {
  jti: string
  iss: string
  aud: string
  exp: number
  sub: string
  iat: number
} & Omit<JWTPayload, 'userId'>

export type ExtractedJWT = {
  sessionId: string
} & JWTPayload

export async function verifyJWT (jwt: string): Promise<ExtractedJWT | null> {
  const localLog = log.withTag('verifyJWT')
  localLog.debug('Verifying JWT...', { jwt })
  try {
    const { payload } = await jwtVerify<SignedJWT>(jwt, jwtSecret, {
      issuer: JWTConfig.issuer,
      audience: JWTConfig.audience
    })
    return {
      userId: payload.sub,
      email: payload.email,
      orgs: payload.orgs,
      sessionId: payload.jti
    }
  } catch (error) {
    localLog.error(error)
    return null
  }
}

export const getUserFromEventContext = (ctx: H3EventContext) => {
  return ctx.user as ExtractedJWT
}
