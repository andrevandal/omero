import {
  text,
  timestamp,
  uniqueIndex,
  varchar,
  index,
  pgTable,
  boolean,
  unique,
  json,
  primaryKey
} from 'drizzle-orm/pg-core'

export type externalMetadata = Partial<{}>

export const UsersTable = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').unique().notNull(),
    password: text('password').notNull(),
    emailVerified: boolean('email_verified').notNull().default(false),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    emailIdx: uniqueIndex().on(t.email)
  })
)

export const SessionTable = pgTable(
  'users_session',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => UsersTable.id, { onDelete: 'cascade' }),
    expiresAt: timestamp('expires_at', {
      mode: 'date'
    }).notNull(),
    userAgent: text('user_agent'),
    ip: text('ip'),
    createdAt: timestamp('created_at', {
      mode: 'date'
    })
      .notNull()
      .defaultNow()
  },
  t => ({
    userIdIdx: index().on(t.userId)
  })
)

export const OrganizationsTable = pgTable(
  'orgs',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    owner: text('owner')
      .references(() => UsersTable.id, { onDelete: 'set null' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    nameIdx: index().on(t.name),
    slugIdx: uniqueIndex().on(t.slug)
  })
)

export type MembershipRoles = 'admin' | 'member'

export const MembershipTable = pgTable(
  'orgs_members',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .references(() => OrganizationsTable.id, { onDelete: 'cascade' })
      .notNull(),
    userId: text('user_id')
      .references(() => UsersTable.id, { onDelete: 'cascade' })
      .notNull(),
    role: varchar('role', { length: 10 })
      .$type<MembershipRoles>()
      .default('member')
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    organizationIdIdx: index().on(t.organizationId),
    userIdIdx: index().on(t.userId)
  })
)
export type ProjectsMetadata = Partial<{
  schema?: Record<string, any>
}>

export const ProjectsTable = pgTable(
  'projects',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique().notNull(),
    description: text('description'),
    metadata: json('metadata').$type<ProjectsMetadata>().default({}),
    organizationId: text('organization_id')
      .references(() => OrganizationsTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    organizationIdIdx: index().on(t.organizationId),
    slugIdx: index().on(t.slug)
  })
)

export type BucketProviders = 'vandal.services'

export const BucketsTable = pgTable(
  'buckets',
  {
    name: text('name').notNull(),
    provider: text('provider')
      .$type<BucketProviders>()
      .notNull()
      .default('vandal.services'),
    endpoint: text('endpoint').notNull().default('minio.vandal.services'),
    files: text('files').notNull().default('files.vandal.services'),
    projectId: text('project_id')
      .references(() => ProjectsTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    pk: primaryKey({ columns: [t.projectId, t.name, t.provider] }),
    projectIdIdx: index().on(t.projectId),
    nameIdx: index().on(t.name),
    providerIdx: index().on(t.provider)
  })
)

export type ProjectsPagesMetadata = Partial<{
  schema?: Record<string, any>
}>

export const PagesTable = pgTable(
  'pages',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    title: text('name'),
    description: text('description'),
    socialImage: text('social_image'),
    coverImage: text('cover_image'),
    private: boolean('private').notNull().default(false),
    published: boolean('published').notNull().default(false),
    publishedAt: timestamp('published_at', { mode: 'date' }),
    metadata: json('metadata').$type<ProjectsPagesMetadata>().default({}),
    projectId: text('project_id')
      .references(() => ProjectsTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    projectIdIdx: index().on(t.projectId),
    slugIdx: index().on(t.slug),
    unq: uniqueIndex().on(t.projectId, t.slug)
  })
)

export const CategoriesTable = pgTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    socialImage: text('social_image'),
    coverImage: text('cover_image'),
    private: boolean('private').notNull().default(false),
    projectId: text('project_id')
      .references(() => ProjectsTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    projectIdIdx: index().on(t.projectId),
    slugIdx: index().on(t.slug),
    unq: unique().on(t.projectId, t.slug)
  })
)

export const TagsTable = pgTable(
  'tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    socialImage: text('social_image'),
    coverImage: text('cover_image'),
    private: boolean('private').notNull().default(false),
    projectId: text('project_id')
      .references(() => ProjectsTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    projectIdIdx: index().on(t.projectId),
    slugIdx: index().on(t.slug),
    unq: unique().on(t.projectId, t.slug)
  })
)

export type PostsMetadata = Partial<{
  schema?: Record<string, any>
}>

export const PostsTable = pgTable(
  'posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    socialImage: text('social_image'),
    coverImage: text('cover_image'),
    private: boolean('private').notNull().default(false),
    published: boolean('published').notNull().default(false),
    publishedAt: timestamp('published_at', { mode: 'date' }),
    content: text('content'),
    metadata: json('metadata').$type<PostsMetadata>().default({}),
    projectId: text('project_id')
      .references(() => ProjectsTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }),
    deletedAt: timestamp('deleted_at', { mode: 'date' })
  },
  t => ({
    projectIdIdx: index().on(t.projectId),
    slugIdx: index().on(t.slug),
    unq: unique().on(t.projectId, t.slug)
  })
)

export const PostsCategoriesTable = pgTable(
  'posts_to_categories',
  {
    postId: text('post_id')
      .references(() => PostsTable.id, { onDelete: 'cascade' })
      .notNull(),
    categoryId: text('category_id')
      .references(() => CategoriesTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
  },
  t => ({
    postIdIdx: index().on(t.postId),
    categoryIdIdx: index().on(t.categoryId),
    pk: primaryKey({ columns: [t.postId, t.categoryId] })
  })
)

export const PostsTagsTable = pgTable(
  'posts_to_tags',
  {
    postId: text('post_id')
      .references(() => PostsTable.id, { onDelete: 'cascade' })
      .notNull(),
    tagId: text('tag_id')
      .references(() => TagsTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' })
  },
  t => ({
    postIdIdx: index().on(t.postId),
    tagIdIdx: index().on(t.tagId),
    pk: primaryKey({ columns: [t.postId, t.tagId] })
  })
)
