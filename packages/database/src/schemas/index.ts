import { enums } from '@omero/schemas'
import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex
} from 'drizzle-orm/sqlite-core'

const timestamps = {
  createdAt: integer('created_at', {
    mode: 'timestamp'
  }).default(sql`(current_timestamp)`),
  updatedAt: integer('updated_at', {
    mode: 'timestamp'
  }).default(sql`(current_timestamp)`),
  deletedAt: integer('deleted_at', { mode: 'timestamp' })
}

// User/Auth

export const user = sqliteTable(
  'user',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull().unique(),
    emailVerified: integer('email_verified', {
      mode: 'boolean'
    }).notNull(),
    image: text('image'),
    preferredLanguageId: text('preferred_language_id'),
    ...timestamps
  },
  table => [index('user_email_idx').on(table.email)]
)

export const session = sqliteTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: integer('expires_at', {
      mode: 'timestamp'
    }).notNull(),
    token: text('token').notNull().unique(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    activeOrganizationId: text('active_organization_id').references(
      () => organization.id
    ),
    ...timestamps
  },
  table => [
    index('session_user_id_idx').on(table.userId),
    index('session_token_idx').on(table.token)
  ]
)

export const account = sqliteTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: integer('access_token_expires_at', {
      mode: 'timestamp'
    }),
    refreshTokenExpiresAt: integer('refresh_token_expires_at', {
      mode: 'timestamp'
    }),
    scope: text('scope'),
    password: text('password'),
    ...timestamps
  },
  table => [index('account_user_id_idx').on(table.userId)]
)

export const verification = sqliteTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: integer('expires_at', {
      mode: 'timestamp'
    }).notNull(),
    ...timestamps
  },
  table => [index('verification_identifier_idx').on(table.identifier)]
)

export const organization = sqliteTable(
  'organization',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').unique(),
    logo: text('logo'),
    settings: text('settings', {
      mode: 'json'
    })
      .default('{}')
      .$type<Record<string, unknown>>(),
    metadata: text('metadata', {
      mode: 'json'
    })
      .default('{}')
      .$type<Record<string, unknown>>(),
    ...timestamps
  },
  table => [index('organization_slug_idx').on(table.slug)]
)

export const member = sqliteTable(
  'member',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade'
      }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role', { enum: enums.constants.memberRole }).default('member')
  },
  table => [
    index('member_user_id_idx').on(table.userId),
    index('member_organization_id_idx').on(table.organizationId),
    index('member_user_organization_idx').on(table.userId, table.organizationId)
  ]
)

export const invitation = sqliteTable(
  'invitation',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade'
      }),
    email: text('email').notNull(),
    role: text('role', { enum: enums.constants.memberRole }),
    status: text('status', {
      enum: enums.constants.invitationStatus
    }).default('pending'),
    expiresAt: integer('expires_at', {
      mode: 'timestamp'
    }).notNull(),
    inviterId: text('inviter_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' })
  },
  table => [
    index('invitation_email_idx').on(table.email),
    index('invitation_organization_id_idx').on(table.organizationId),
    index('invitation_email_organization_idx').on(
      table.email,
      table.organizationId
    )
  ]
)

export const apikey = sqliteTable('apikey', {
  id: text('id').primaryKey(),
  name: text('name'),
  start: text('start'),
  prefix: text('prefix'),
  key: text('key').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  refillInterval: integer('refill_interval'),
  refillAmount: integer('refill_amount'),
  lastRefillAt: integer('last_refill_at', {
    mode: 'timestamp'
  }),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  rateLimitEnabled: integer('rate_limit_enabled', {
    mode: 'boolean'
  }).default(true),
  rateLimitTimeWindow: integer('rate_limit_time_window').default(86_400_000),
  rateLimitMax: integer('rate_limit_max').default(10),
  requestCount: integer('request_count'),
  remaining: integer('remaining'),
  lastRequest: integer('last_request', {
    mode: 'timestamp'
  }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', {
    mode: 'timestamp'
  }).notNull(),
  updatedAt: integer('updated_at', {
    mode: 'timestamp'
  }).notNull(),
  permissions: text('permissions'),
  metadata: text('metadata', {
    mode: 'json'
  })
    .default('{}')
    .$type<Record<string, unknown>>()
})

// CMS Core

export const languages = sqliteTable('languages', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  ...timestamps
})

export const organizationLanguages = sqliteTable(
  'organization_languages',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade'
      }),
    languageId: text('language_id')
      .notNull()
      .references(() => languages.id, {
        onDelete: 'cascade'
      }),
    isDefault: integer('is_default', { mode: 'boolean' })
      .notNull()
      .default(false),
    ...timestamps
  },
  table => [
    uniqueIndex('org_languages_org_lang_idx').on(
      table.organizationId,
      table.languageId
    ),
    index('org_languages_organization_idx').on(table.organizationId)
  ]
)

export const posts = sqliteTable(
  'posts',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade'
      }),
    type: text('type', { enum: enums.constants.postType }).notNull(),
    ...timestamps
  },
  table => [index('posts_organization_id_idx').on(table.organizationId)]
)

export const postsTranslations = sqliteTable(
  'posts_translations',
  {
    id: text('id').primaryKey(),
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    languageId: text('language_id')
      .notNull()
      .references(() => languages.id, {
        onDelete: 'cascade'
      }),
    currentRevisionId: text('current_revision_id'),
    visibility: text('visibility', {
      enum: enums.constants.visibility
    }).notNull(),
    publishedAt: integer('published_at', {
      mode: 'timestamp'
    }),
    customFields: text('custom_fields', { mode: 'json' })
      .default('{}')
      .$type<Record<string, unknown>>(),
    ...timestamps
  },
  table => [
    uniqueIndex('posts_translations_post_language_idx').on(
      table.postId,
      table.languageId
    )
  ]
)

export const postsRevisions = sqliteTable(
  'posts_revisions',
  {
    id: text('id').primaryKey(),
    postId: text('post_id').references(() => posts.id, {
      onDelete: 'cascade'
    }),
    postTranslationsId: text('post_translations_id').references(
      () => postsTranslations.id,
      {
        onDelete: 'cascade'
      }
    ),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: text('content'),
    publishedAt: integer('published_at', {
      mode: 'timestamp'
    }),
    ...timestamps
  },
  table => [index('posts_revisions_slug_idx').on(table.slug)]
)

export const tags = sqliteTable(
  'tags',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade'
      }),
    featured: integer('featured', {
      mode: 'boolean'
    }).default(false),
    visibility: text('visibility', {
      enum: enums.constants.visibility
    }).notNull(),
    ...timestamps
  },
  table => [index('tags_organization_id_idx').on(table.organizationId)]
)

export const tagsTranslations = sqliteTable(
  'tags_translations',
  {
    id: text('id').primaryKey(),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    languageId: text('language_id')
      .notNull()
      .references(() => languages.id, {
        onDelete: 'cascade'
      }),
    currentRevisionId: text('current_revision_id'),
    visibility: text('visibility', {
      enum: enums.constants.visibility
    }).default('draft'),
    publishedAt: integer('published_at', {
      mode: 'timestamp'
    }),
    customFields: text('custom_fields', {
      mode: 'json'
    })
      .default('{}')
      .$type<Record<string, unknown>>(),
    ...timestamps
  },
  table => [
    uniqueIndex('tags_translations_tag_language_idx').on(
      table.tagId,
      table.languageId
    )
  ]
)

export const tagsRevisions = sqliteTable(
  'tags_revisions',
  {
    id: text('id').primaryKey(),
    tagId: text('tag_id').references(() => tags.id, {
      onDelete: 'cascade'
    }),
    tagTranslationsId: text('tag_translations_id').references(
      () => tagsTranslations.id,
      {
        onDelete: 'cascade'
      }
    ),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    content: text('content'),
    publishedAt: integer('published_at', {
      mode: 'timestamp'
    }),
    ...timestamps
  },
  table => [index('tags_revisions_slug_idx').on(table.slug)]
)

export const postsTags = sqliteTable(
  'posts_tags',
  {
    id: text('id').primaryKey(),
    postId: text('post_id').references(() => posts.id, {
      onDelete: 'cascade'
    }),
    tagId: text('tag_id').references(() => tags.id, {
      onDelete: 'cascade'
    }),
    ...timestamps
  },
  table => [
    uniqueIndex('posts_tags_post_tag_idx').on(table.postId, table.tagId)
  ]
)

export const medias = sqliteTable(
  'medias',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade'
      }),
    name: text('name').notNull(),
    type: text('type', { enum: enums.constants.mediaType }).notNull(),
    url: text('url').notNull(),
    size: integer('size').notNull(),
    title: text('title'),
    altText: text('alt_text'),
    metadata: text('metadata', {
      mode: 'json'
    })
      .default('{}')
      .$type<Record<string, unknown>>(),
    customFields: text('custom_fields', {
      mode: 'json'
    })
      .default('{}')
      .$type<Record<string, unknown>>(),
    ...timestamps
  },
  table => [index('medias_organization_id_idx').on(table.organizationId)]
)

export const mediasTags = sqliteTable(
  'medias_tags',
  {
    id: text('id').primaryKey(),
    mediaId: text('media_id').references(() => medias.id, {
      onDelete: 'cascade'
    }),
    tagId: text('tag_id').references(() => tags.id, {
      onDelete: 'cascade'
    }),
    ...timestamps
  },
  table => [
    uniqueIndex('medias_tags_media_tag_idx').on(table.mediaId, table.tagId)
  ]
)

export const customFieldDefinitions = sqliteTable(
  'custom_field_definitions',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, {
        onDelete: 'cascade'
      }),
    entityType: text('entity_type', {
      enum: enums.constants.customFields.entityType
    }).notNull(),
    fieldKey: text('field_key').notNull(),
    fieldType: text('field_type', {
      enum: enums.constants.customFields.fieldType
    }).notNull(),
    required: integer('required', { mode: 'boolean' }).notNull().default(false),
    data: text('data', { mode: 'json' }), // JSON for select/radio options
    validation: text('validation', { mode: 'json' }),
    ...timestamps
  },
  table => [
    uniqueIndex('custom_field_definitions_org_entity_key_idx').on(
      table.organizationId,
      table.entityType,
      table.fieldKey
    ),
    index('custom_field_definitions_organization_id_idx').on(
      table.organizationId
    ),
    index('custom_field_definitions_entity_type_idx').on(table.entityType)
  ]
)

// Relations
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  members: many(member),
  invitations: many(invitation),
  apikeys: many(apikey),
  preferredLanguage: one(languages, {
    fields: [user.preferredLanguageId],
    references: [languages.id]
  })
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id]
  }),
  activeOrganization: one(organization, {
    fields: [session.activeOrganizationId],
    references: [organization.id]
  })
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id]
  })
}))

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  posts: many(posts),
  tags: many(tags),
  medias: many(medias),
  sessions: many(session),
  customFieldDefinitions: many(customFieldDefinitions),
  organizationLanguages: many(organizationLanguages)
}))

export const memberRelations = relations(member, ({ one }) => ({
  user: one(user, {
    fields: [member.userId],
    references: [user.id]
  }),
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id]
  })
}))

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id]
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id]
  })
}))

export const apikeyRelations = relations(apikey, ({ one }) => ({
  user: one(user, {
    fields: [apikey.userId],
    references: [user.id]
  })
}))

export const languagesRelations = relations(languages, ({ many }) => ({
  users: many(user),
  postsTranslations: many(postsTranslations),
  tagsTranslations: many(tagsTranslations),
  organizationLanguages: many(organizationLanguages)
}))

export const postsRelations = relations(posts, ({ one, many }) => ({
  organization: one(organization, {
    fields: [posts.organizationId],
    references: [organization.id]
  }),
  translations: many(postsTranslations),
  revisions: many(postsRevisions),
  postsTags: many(postsTags)
}))

export const postsTranslationsRelations = relations(
  postsTranslations,
  ({ one, many }) => ({
    post: one(posts, {
      fields: [postsTranslations.postId],
      references: [posts.id]
    }),
    language: one(languages, {
      fields: [postsTranslations.languageId],
      references: [languages.id]
    }),
    currentRevision: one(postsRevisions, {
      fields: [postsTranslations.currentRevisionId],
      references: [postsRevisions.id]
    }),
    revisions: many(postsRevisions)
  })
)

export const postsRevisionsRelations = relations(postsRevisions, ({ one }) => ({
  post: one(posts, {
    fields: [postsRevisions.postId],
    references: [posts.id]
  }),
  postTranslation: one(postsTranslations, {
    fields: [postsRevisions.postTranslationsId],
    references: [postsTranslations.id]
  })
}))

export const tagsRelations = relations(tags, ({ one, many }) => ({
  organization: one(organization, {
    fields: [tags.organizationId],
    references: [organization.id]
  }),
  translations: many(tagsTranslations),
  revisions: many(tagsRevisions),
  postsTags: many(postsTags),
  mediasTags: many(mediasTags)
}))

export const tagsTranslationsRelations = relations(
  tagsTranslations,
  ({ one, many }) => ({
    tag: one(tags, {
      fields: [tagsTranslations.tagId],
      references: [tags.id]
    }),
    language: one(languages, {
      fields: [tagsTranslations.languageId],
      references: [languages.id]
    }),
    currentRevision: one(tagsRevisions, {
      fields: [tagsTranslations.currentRevisionId],
      references: [tagsRevisions.id]
    }),
    revisions: many(tagsRevisions)
  })
)

export const tagsRevisionsRelations = relations(tagsRevisions, ({ one }) => ({
  tag: one(tags, {
    fields: [tagsRevisions.tagId],
    references: [tags.id]
  }),
  tagTranslation: one(tagsTranslations, {
    fields: [tagsRevisions.tagTranslationsId],
    references: [tagsTranslations.id]
  })
}))

export const postsTagsRelations = relations(postsTags, ({ one }) => ({
  post: one(posts, {
    fields: [postsTags.postId],
    references: [posts.id]
  }),
  tag: one(tags, {
    fields: [postsTags.tagId],
    references: [tags.id]
  })
}))

export const mediasRelations = relations(medias, ({ one, many }) => ({
  organization: one(organization, {
    fields: [medias.organizationId],
    references: [organization.id]
  }),
  mediasTags: many(mediasTags)
}))

export const mediasTagsRelations = relations(mediasTags, ({ one }) => ({
  media: one(medias, {
    fields: [mediasTags.mediaId],
    references: [medias.id]
  }),
  tag: one(tags, {
    fields: [mediasTags.tagId],
    references: [tags.id]
  })
}))

export const customFieldDefinitionsRelations = relations(
  customFieldDefinitions,
  ({ one }) => ({
    organization: one(organization, {
      fields: [customFieldDefinitions.organizationId],
      references: [organization.id]
    })
  })
)

export const organizationLanguagesRelations = relations(
  organizationLanguages,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationLanguages.organizationId],
      references: [organization.id]
    }),
    language: one(languages, {
      fields: [organizationLanguages.languageId],
      references: [languages.id]
    })
  })
)
