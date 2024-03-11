import { or, eq, inArray } from 'drizzle-orm'
import { dbPool } from '@/connector/database'
import { MembershipTable, OrganizationsTable, UsersTable } from '@/schemas/db'
import { generateId } from '@/services/utils'
import {
  hashPassword,
  verifyPassword,
  createJWT,
  verifyJWT
} from '@/services/auth'
import logger from '@/services/logger'

const log = logger('[REPOSITORY]')

type User = {
  email: string
  password: string
}

export async function registerUser ({
  email,
  password
}: User): Promise<{ id: string; name: string; email: string } | null> {
  const localLog = log.withTag('registerUser')
  const userId = generateId(15)
  const hashedPassword = await hashPassword(password)

  localLog.debug('Creating user...', { email, userId })

  const [result] = await dbPool
    .insert(UsersTable)
    .values({
      id: userId,
      email,
      password: hashedPassword
    })
    .onConflictDoNothing()
    .returning({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email
    })

  // TODO: send email verification

  return result
}

export async function loginUser ({
  email,
  password
}: User): Promise<{ jwt: string } | null> {
  const localLog = log.withTag('loginUser')
  localLog.debug('Login user...', { email })

  const [existingUser] = await dbPool
    .select()
    .from(UsersTable)
    .where(eq(UsersTable.email, email))
    .limit(1)

  if (!existingUser) {
    localLog.debug('User not found...', { email })
    return null
  }

  // localLog.log({ password, password2: existingUser.password })

  const validPassword = await verifyPassword(password, existingUser.password)

  if (!validPassword) {
    localLog.debug('Invalid password...', { email })
    return null
  }

  const membership = await dbPool
    .select({
      orgId: MembershipTable.organizationId,
      orgRole: MembershipTable.role
    })
    .from(MembershipTable)
    .where(eq(MembershipTable.userId, existingUser.id))

  const organizations = await dbPool
    .select({
      id: OrganizationsTable.id,
      name: OrganizationsTable.name,
      slug: OrganizationsTable.slug,
      owner: OrganizationsTable.owner
    })
    .from(OrganizationsTable)
    .where(
      or(
        eq(OrganizationsTable.owner, existingUser.id),
        membership.length &&
          inArray(
            MembershipTable.organizationId,
            membership.map(m => m.orgId)
          )
      )
    )
    .limit(100)

  type Organization = {
    id: string
    name: string
    slug: string
    role: string
  }
  const orgs = organizations.reduce((acc, org) => {
    acc.push({
      id: org.id,
      slug: org.slug,
      name: org.name,
      role: org.owner === existingUser.id ? 'owner' : 'member'
    })
    acc[org.slug] = {
      name: org.name,
      role:
        org.owner === existingUser.id
          ? 'owner'
          : membership.find(m => m.orgId === org.id)?.orgRole
    }
    return acc
  }, [] as Organization[])

  const { jwt, jti } = await createJWT({
    userId: existingUser.id,
    email: existingUser.email,
    orgs
  })

  // TODO: createSession({jti, userId: existingUser.id, })

  localLog.debug('User logged in...', { email, jwt, jti })

  return { jwt }
}

export async function getUser (
  id: string
): Promise<{ id: string; name: string; email: string } | null> {
  const [user] = await dbPool
    .select({
      id: UsersTable.id,
      name: UsersTable.name,
      email: UsersTable.email
    })
    .from(UsersTable)
    .where(eq(UsersTable.id, id))
    .limit(1)

  return user
}

export async function getUserFromToken (token: string) {
  const validToken = await verifyJWT(token)
  if (!validToken) {
    return null
  }

  const { userId, email, orgs, sessionId } = validToken

  const user = await getUser(userId)
  if (!user) {
    return null
  }

  return {
    email,
    ...user,
    orgs,
    sessionId
  }
}
