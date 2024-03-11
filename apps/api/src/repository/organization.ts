import { desc, eq, inArray, or } from 'drizzle-orm'
import { getUser } from './user'
import logger from '@/services/logger'
import { dbPool } from '@/connector/database'
import {
  MembershipTable,
  OrganizationsTable,
  type MembershipRoles
} from '@/schemas/db'
import { generateId } from '@/services/utils'
import { CreateOrganization } from '@/schemas/requests'

const log = logger('[REPOSITORY]')

export async function createOrganization (params: CreateOrganization) {
  const localLog = log.withTag('createOrganization')
  const id = generateId(15)
  localLog.debug('Creating organization...', { id, params })
  const { id: ownerId } = await getUser(params.owner)

  if (!ownerId) {
    localLog.debug('Owner not found')
    return null
  }

  const [org] = await dbPool
    .insert(OrganizationsTable)
    .values({
      id,
      name: params.name,
      slug: params.slug,
      description: params.description,
      owner: ownerId
    })
    .returning({
      id: OrganizationsTable.id,
      name: OrganizationsTable.name,
      slug: OrganizationsTable.slug,
      description: OrganizationsTable.description,
      owner: OrganizationsTable.owner
    })
    .onConflictDoNothing()
  return org
}

type EditOrganization = {
  id: string
  name?: string
  description?: string
  slug?: string
}
export async function editOrganization (params: EditOrganization) {
  const localLog = log.withTag('editOrganization')
  localLog.debug('Editing organization...', { params })

  if (!params.description && !params.name) {
    localLog.debug('Nothing to edit')
    return null
  }

  const [org] = await dbPool
    .update(OrganizationsTable)
    .set({
      name: params.name,
      slug: params.slug,
      description: params.description
    })
    .where(eq(OrganizationsTable.id, params.id))
    .returning({
      id: OrganizationsTable.id,
      name: OrganizationsTable.name,
      slug: OrganizationsTable.slug,
      description: OrganizationsTable.description
    })
  return org
}

type ListOrganizations = {
  limit?: number
  offset?: number
  membership?: boolean
  userId?: string
  // includes?: {
  // members?: boolean
  //   projects: boolean
  // }
}
export async function listOrganizations (params: ListOrganizations) {
  const localLog = log.withTag('listOrganizations')
  localLog.debug('Listing organizations...', { params })

  const limit = params.limit || 10
  const offset = params.offset || 0

  // if members, includes members
  // if projects, includes projects

  if (params.membership) {
    const membershipOrgs = await dbPool
      .select({
        id: MembershipTable.id
      })
      .from(MembershipTable)
      .where(eq(MembershipTable.userId, params.userId))

    const orgs = await dbPool
      .select({
        id: OrganizationsTable.id,
        name: OrganizationsTable.name,
        slug: OrganizationsTable.slug,
        description: OrganizationsTable.description
      })
      .from(OrganizationsTable)
      .where(
        or(
          membershipOrgs.length &&
            inArray(
              OrganizationsTable.id,
              membershipOrgs.map(m => m.id)
            ),
          eq(OrganizationsTable.owner, params.userId)
        )
      )
      .limit(limit)
      .offset(offset)
      .orderBy(desc(OrganizationsTable.createdAt))

    return orgs
  }

  const orgs = await dbPool
    .select({
      id: OrganizationsTable.id,
      name: OrganizationsTable.name,
      slug: OrganizationsTable.slug,
      description: OrganizationsTable.description
    })
    .from(OrganizationsTable)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(OrganizationsTable.createdAt))

  return orgs
}

type MembershipAssociation = {
  userId: string
  organizationId: string
  role: MembershipRoles
}
export async function associateMembership (params: MembershipAssociation) {
  const localLog = log.withTag('associateMembership')
  localLog.debug('Associating membership...', { params })

  const [membership] = await dbPool
    .insert(MembershipTable)
    .values({
      id: generateId(15),
      userId: params.userId,
      organizationId: params.organizationId,
      role: params.role
    })
    .returning({
      id: MembershipTable.id,
      role: MembershipTable.role
    })
    .onConflictDoNothing()

  return {
    id: membership.id,
    role: membership.role
  }
}
