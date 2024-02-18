import {
  uuid,
  text,
  timestamp,
  uniqueIndex,
  varchar,
  boolean,
  index,
  pgTable
} from 'drizzle-orm/pg-core'

export type externalMetadata = Partial<{}>

export const UsersTable = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    username: text('username').unique().notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' })
  },
  t => ({
    usernameIdx: uniqueIndex().on(t.username)
  })
)

type AuthenticationProvider = 'email'

export const AuthenticationTable = pgTable(
  'authentication',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .references(() => UsersTable.id, { onDelete: 'cascade' })
      .notNull(),
    provider: varchar('provider', { length: 10 })
      .$type<AuthenticationProvider>()
      .notNull(),
    identifier: varchar('identifier', { length: 255 }).notNull(),
    password: text('password'),
    verified: boolean('verified').default(false).notNull(),
    verificationCode: varchar('verification_code', { length: 10 }),
    expiresAt: timestamp('expires_at', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' })
  },
  t => ({
    userIdIdx: index().on(t.userId),
    providerIdx: index().on(t.provider),
    identifierIdx: index().on(t.identifier),
    uniqueProviderUser: uniqueIndex().on(t.userId, t.provider, t.identifier)
  })
)

export const OrganizationsTable = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    description: text('description'),
    owner: uuid('owner')
      .references(() => UsersTable.id, { onDelete: 'set null' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' })
  },
  t => ({
    nameIdx: index().on(t.name)
  })
)

type OrganizationRoles = 'admin' | 'member'

export const OrganizationMembersTable = pgTable(
  'organization_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    organizationId: uuid('organization_id')
      .references(() => OrganizationsTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => UsersTable.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 10 })
      .$type<OrganizationRoles>()
      .default('member')
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }),
    deletedAt: timestamp('deleted_at', { mode: 'string' })
  },
  t => ({
    organizationIdIdx: index().on(t.organizationId),
    userIdIdx: index().on(t.userId)
  })
)
