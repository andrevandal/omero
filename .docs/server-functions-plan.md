# Omero Server Functions - Implementation Plan

## Overview

Sistema de Server Functions usando TanStack Start com tratamento de erros funcional, responses tipadas e integração com Better Auth para gerenciar autenticação, autorização e lógica de negócio.

## Arquitetura

```text
Route/Component → Server Function → Repository → Database
                     ↓
                [Better Auth Permissions]
                     ↓
                [Functional Error Handling]
                     ↓
                [Typed API Response]
```

## Estrutura de Arquivos

```text
src/lib/
├── server/
│   ├── posts.ts              # Server functions para posts
│   ├── tags.ts               # Server functions para tags
│   ├── medias.ts             # Server functions para medias
│   ├── organizations.ts      # Server functions para organizations
│   ├── custom-fields.ts      # Server functions para custom fields
│   ├── analytics.ts          # Server functions para analytics
│   └── index.ts              # Barrel exports
├── errors/
│   ├── index.ts              # Error factories e helpers
│   └── types.ts              # Error types
├── types/
│   ├── api.ts                # API response types
│   └── entities.ts           # Entity types
└── repositories/             # (já planejado anteriormente)
```

## Error System (Functional)

### Error Types

```typescript
// src/lib/errors/index.ts
export type AppErrorCode =
  | 'NOT_FOUND' // 404
  | 'FORBIDDEN' // 403
  | 'UNAUTHORIZED' // 401
  | 'VALIDATION_ERROR' // 400
  | 'INTERNAL_ERROR' // 500
  | 'DATABASE_ERROR' // 500
  | 'EXTERNAL_SERVICE_ERROR' // 502/503

export type AppError = {
  code: AppErrorCode
  message: string
  statusCode: number
  userMessage: string
  metadata?: Record<string, any>
}
```

### Error Factories

```typescript
export const createNotFoundError = (
  resource: string,
  id?: string
): AppError => ({
  code: 'NOT_FOUND',
  message: `${resource} not found`,
  statusCode: 404,
  userMessage: 'Resource not found',
  metadata: { resource, id }
})

export const createForbiddenError = (
  action: string,
  resource?: string
): AppError => ({
  code: 'FORBIDDEN',
  message: `Cannot ${action} ${resource || 'resource'}`,
  statusCode: 403,
  userMessage: 'Access denied',
  metadata: { action, resource }
})

export const createValidationError = (
  field: string,
  reason: string
): AppError => ({
  code: 'VALIDATION_ERROR',
  message: `Validation failed for ${field}: ${reason}`,
  statusCode: 400,
  userMessage: 'Invalid data provided',
  metadata: { field, reason }
})

export const createInternalError = (
  operation: string,
  originalError?: unknown
): AppError => ({
  code: 'INTERNAL_ERROR',
  message: `Internal error during ${operation}`,
  statusCode: 500,
  userMessage: 'An unexpected error occurred',
  metadata: {
    operation,
    originalError: String(originalError)
  }
})

export const createDatabaseError = (
  operation: string,
  originalError?: unknown
): AppError => ({
  code: 'DATABASE_ERROR',
  message: `Database error during ${operation}`,
  statusCode: 500,
  userMessage: 'A database error occurred',
  metadata: {
    operation,
    originalError: String(originalError)
  }
})

export const throwApiError = (error: AppError): never => {
  const response = { success: false, error }
  throw new Response(JSON.stringify(response), {
    status: error.statusCode,
    headers: { 'Content-Type': 'application/json' }
  })
}
```

## Typed API Response System

```typescript
// src/lib/types/api.ts
export type ApiSuccess<T = unknown> = {
  success: true
  data: T
}

export type ApiError = {
  success: false
  error: AppError
}

export type ApiResponse<T = unknown> =
  | ApiSuccess<T>
  | ApiError

export const createSuccessResponse = <T>(
  data: T
): ApiSuccess<T> => ({
  success: true,
  data
})

export const createErrorResponse = (
  error: AppError
): ApiError => ({
  success: false,
  error
})
```

## Better Auth Integration

```typescript
// Helper para verificar permissões
const checkPermission = async (
  userId: string,
  permission: Record<string, string[]>
): Promise<boolean> => {
  const result = await auth.api.userHasPermission({
    body: { userId, permission }
  })
  return result
}

// Middleware personalizado para server functions
const withPermission =
  (permission: Record<string, string[]>) =>
  async (context: any) => {
    const hasPermission = await checkPermission(
      context.user.id,
      permission
    )

    if (!hasPermission) {
      throwApiError(
        createForbiddenError(
          Object.values(permission).flat().join(', '),
          Object.keys(permission).join(', ')
        )
      )
    }

    return context
  }
```

## Server Functions por Entidade

### 1. Posts Server Functions (`src/lib/server/posts.ts`)

#### Public Functions (sem auth)

```typescript
export const getPublicPost = createServerFn('GET').handler(
  async ({
    data: { slug, orgId, langId }
  }): Promise<ApiResponse<Post>> => {
    try {
      const post = await findPublicPostBySlug(
        slug,
        orgId,
        langId
      )

      if (!post) {
        throwApiError(createNotFoundError('post', slug))
      }

      return createSuccessResponse(post)
    } catch (error) {
      if (error instanceof Response) throw error
      throwApiError(
        createDatabaseError('fetch public post', error)
      )
    }
  }
)

export const getPublicPosts = createServerFn('GET').handler(
  async ({
    data: { orgId, langId, limit, offset }
  }): Promise<ApiResponse<Post[]>> => {
    try {
      const posts = await getAllPublicPosts(orgId, langId, {
        limit,
        offset
      })
      return createSuccessResponse(posts)
    } catch (error) {
      if (error instanceof Response) throw error
      throwApiError(
        createDatabaseError('fetch public posts', error)
      )
    }
  }
)

export const getPostsByTag = createServerFn('GET').handler(
  async ({
    data: { tagSlug, orgId, langId }
  }): Promise<ApiResponse<Post[]>> => {
    try {
      const posts = await getPostsWithTag(
        tagSlug,
        orgId,
        langId
      )
      return createSuccessResponse(posts)
    } catch (error) {
      if (error instanceof Response) throw error
      throwApiError(
        createDatabaseError('fetch posts by tag', error)
      )
    }
  }
)
```

#### Authenticated Functions

```typescript
export const getPost = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { postId, orgId },
      context
    }): Promise<ApiResponse<Post>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['read']
        })

        const post = await findPostById(postId, orgId)
        if (!post) {
          throwApiError(createNotFoundError('post', postId))
        }

        return createSuccessResponse(post)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('fetch post', error)
        )
      }
    }
  )

export const getAllPosts = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId, filters },
      context
    }): Promise<ApiResponse<Post[]>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['read']
        })

        const postRepo = createPostRepository(orgId)
        const posts = await postRepo.findAll(filters)

        return createSuccessResponse(posts)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('fetch all posts', error)
        )
      }
    }
  )

export const getPostRevisions = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { postId, langId },
      context
    }): Promise<ApiResponse<PostRevision[]>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['read']
        })

        const postRepo = createPostRepository() // não precisa orgId para revisões
        const revisions = await postRepo.findWithRevisions(
          postId,
          langId
        )

        return createSuccessResponse(revisions)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('fetch post revisions', error)
        )
      }
    }
  )

export const getDraftPosts = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId, langId },
      context
    }): Promise<ApiResponse<Post[]>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['read']
        })

        const postRepo = createPostRepository(orgId)
        const drafts = await postRepo.findDrafts(langId)

        return createSuccessResponse(drafts)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('fetch draft posts', error)
        )
      }
    }
  )

export const getScheduledPosts = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId, langId },
      context
    }): Promise<ApiResponse<Post[]>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['read']
        })

        const postRepo = createPostRepository(orgId)
        const scheduled = await postRepo.findAll({
          langId,
          scheduledOnly: true
        })

        return createSuccessResponse(scheduled)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError(
            'fetch scheduled posts',
            error
          )
        )
      }
    }
  )
```

#### Write Operations

```typescript
export const createPost = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId, postData },
      context
    }): Promise<ApiResponse<{ postId: string }>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['create']
        })

        const postRepo = createPostRepository(orgId)
        const postId =
          await postRepo.createWithTranslations(postData)

        return createSuccessResponse({ postId })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('create post', error)
        )
      }
    }
  )

export const updatePost = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { postId, langId, updateData },
      context
    }): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['update']
        })

        const postRepo = createPostRepository()
        await postRepo.updateTranslation(
          postId,
          langId,
          updateData
        )

        return createSuccessResponse({ success: true })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('update post', error)
        )
      }
    }
  )

export const publishPost = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { postId, langId, publishAt },
      context
    }): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['publish']
        })

        const postRepo = createPostRepository()
        await postRepo.publish(postId, langId, publishAt)

        return createSuccessResponse({ success: true })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('publish post', error)
        )
      }
    }
  )

export const deletePost = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { postId },
      context
    }): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['delete']
        })

        const postRepo = createPostRepository()
        await postRepo.softDelete(postId)

        return createSuccessResponse({ success: true })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('delete post', error)
        )
      }
    }
  )

// Bulk Operations
export const bulkUpdatePostStatus = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { postIds, status },
      context
    }): Promise<ApiResponse<{ updated: number }>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['update']
        })

        const postRepo = createPostRepository()
        const updated = await postRepo.bulkUpdateStatus(
          postIds,
          status
        )

        return createSuccessResponse({ updated })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError(
            'bulk update post status',
            error
          )
        )
      }
    }
  )

export const bulkAddTagsToPosts = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { postIds, tagIds },
      context
    }): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        await checkPermission(context.user.id, {
          posts: ['update']
        })

        const postRepo = createPostRepository()
        await postRepo.bulkAddTags(postIds, tagIds)

        return createSuccessResponse({ success: true })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError(
            'bulk add tags to posts',
            error
          )
        )
      }
    }
  )
```

### 2. Tags Server Functions (`src/lib/server/tags.ts`)

#### Public Functions

```typescript
export const getPublicTag = createServerFn('GET').handler(
  async ({
    data: { slug, orgId, langId }
  }): Promise<ApiResponse<Tag>> => {
    try {
      const tag = await getTagBySlug(slug, orgId, langId)

      if (!tag) {
        throwApiError(createNotFoundError('tag', slug))
      }

      return createSuccessResponse(tag)
    } catch (error) {
      if (error instanceof Response) throw error
      throwApiError(
        createDatabaseError('fetch public tag', error)
      )
    }
  }
)

export const getFeaturedTags = createServerFn(
  'GET'
).handler(
  async ({
    data: { orgId, langId }
  }): Promise<ApiResponse<Tag[]>> => {
    try {
      const tags = await getFeaturedTags(orgId, langId)
      return createSuccessResponse(tags)
    } catch (error) {
      if (error instanceof Response) throw error
      throwApiError(
        createDatabaseError('fetch featured tags', error)
      )
    }
  }
)
```

#### Write Operations

```typescript
export const createTag = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId, tagData },
      context
    }): Promise<ApiResponse<{ tagId: string }>> => {
      try {
        await checkPermission(context.user.id, {
          tags: ['create']
        })

        const tagRepo = createTagRepository(orgId)
        const tagId =
          await tagRepo.createWithTranslations(tagData)

        return createSuccessResponse({ tagId })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('create tag', error)
        )
      }
    }
  )

export const updateTag = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { tagId, langId, updateData },
      context
    }): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        await checkPermission(context.user.id, {
          tags: ['update']
        })

        const tagRepo = createTagRepository()
        await tagRepo.updateTranslation(
          tagId,
          langId,
          updateData
        )

        return createSuccessResponse({ success: true })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('update tag', error)
        )
      }
    }
  )

export const toggleTagFeatured = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { tagId },
      context
    }): Promise<ApiResponse<{ featured: boolean }>> => {
      try {
        await checkPermission(context.user.id, {
          tags: ['update']
        })

        const tagRepo = createTagRepository()
        const featured = await tagRepo.toggleFeatured(tagId)

        return createSuccessResponse({ featured })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('toggle tag featured', error)
        )
      }
    }
  )
```

### 3. Media Server Functions (`src/lib/server/medias.ts`)

```typescript
export const uploadMedia = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId, file, metadata },
      context
    }): Promise<ApiResponse<{ mediaId: string }>> => {
      try {
        await checkPermission(context.user.id, {
          media: ['create']
        })

        const mediaRepo = createMediaRepository(orgId)
        const mediaId = await mediaRepo.create({
          ...metadata,
          file,
          uploadedBy: context.user.id
        })

        return createSuccessResponse({ mediaId })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('upload media', error)
        )
      }
    }
  )

export const bulkDeleteMedia = createServerFn('POST')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { mediaIds },
      context
    }): Promise<ApiResponse<{ deleted: number }>> => {
      try {
        await checkPermission(context.user.id, {
          media: ['delete']
        })

        const mediaRepo = createMediaRepository()
        const deleted = await mediaRepo.bulkDelete(mediaIds)

        return createSuccessResponse({ deleted })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('bulk delete media', error)
        )
      }
    }
  )
```

### 4. Organizations Server Functions (`src/lib/server/organizations.ts`)

```typescript
export const getOrganization = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId },
      context
    }): Promise<ApiResponse<Organization>> => {
      try {
        await checkPermission(context.user.id, {
          organization: ['read']
        })

        const org = await findOrganizationById(orgId)
        if (!org) {
          throwApiError(
            createNotFoundError('organization', orgId)
          )
        }

        return createSuccessResponse(org)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('fetch organization', error)
        )
      }
    }
  )

export const updateOrganizationSettings = createServerFn(
  'POST'
)
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId, settings },
      context
    }): Promise<ApiResponse<{ success: boolean }>> => {
      try {
        await checkPermission(context.user.id, {
          organization: ['update']
        })

        await updateSettings(orgId, settings)

        return createSuccessResponse({ success: true })
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError(
            'update organization settings',
            error
          )
        )
      }
    }
  )
```

### 5. Analytics Server Functions (`src/lib/server/analytics.ts`)

```typescript
export const getContentStats = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId },
      context
    }): Promise<ApiResponse<ContentStats>> => {
      try {
        await checkPermission(context.user.id, {
          analytics: ['read']
        })

        const analyticsRepo =
          createAnalyticsRepository(orgId)
        const stats = await analyticsRepo.getContentStats()

        return createSuccessResponse(stats)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('fetch content stats', error)
        )
      }
    }
  )

export const getStorageUsage = createServerFn('GET')
  .middleware([auth.middleware])
  .handler(
    async ({
      data: { orgId },
      context
    }): Promise<ApiResponse<StorageStats>> => {
      try {
        await checkPermission(context.user.id, {
          analytics: ['read']
        })

        const analyticsRepo =
          createAnalyticsRepository(orgId)
        const storage =
          await analyticsRepo.getStorageUsage()

        return createSuccessResponse(storage)
      } catch (error) {
        if (error instanceof Response) throw error
        throwApiError(
          createDatabaseError('fetch storage usage', error)
        )
      }
    }
  )
```

## Client Usage Examples

### In Route Loaders

```typescript
// Public route
export const Route = createFileRoute('/$orgId/posts/$slug')({
  loader: ({ params }) => getPublicPost({
    slug: params.slug,
    orgId: params.orgId,
    langId: 'pt-br'
  }),
  errorComponent: ({ error }) => {
    if (error.code === 'NOT_FOUND') {
      return <NotFoundPage />
    }
    return <ErrorPage error={error} />
  }
})

// Admin route
export const Route = createFileRoute('/_app/$orgId/posts/$postId')({
  loader: ({ params }) => getPost({
    postId: params.postId,
    orgId: params.orgId
  })
})
```

### In Components

```typescript
import { updatePost, publishPost } from '@/lib/server/posts'

const EditPost = () => {
  const updateMutation = useMutation({
    mutationFn: updatePost,
    onSuccess: (response) => {
      if (response.success) {
        toast.success('Post updated successfully')
      }
    },
    onError: (error) => {
      const apiError = error as ApiError
      switch (apiError.error.code) {
        case 'FORBIDDEN':
          toast.error('You don\'t have permission to edit this post')
          break
        case 'NOT_FOUND':
          toast.error('Post not found')
          break
        case 'VALIDATION_ERROR':
          toast.error(`Validation error: ${apiError.error.metadata?.field}`)
          break
        case 'DATABASE_ERROR':
        case 'INTERNAL_ERROR':
          toast.error('Server error. Please try again.')
          break
        default:
          toast.error(apiError.error.userMessage)
      }
    }
  })

  const publishMutation = useMutation({
    mutationFn: publishPost,
    onSuccess: () => {
      toast.success('Post published successfully')
    }
  })

  return (
    <div>
      <button
        onClick={() => updateMutation.mutate({
          postId,
          langId: 'pt-br',
          updateData: { content }
        })}
      >
        Save Draft
      </button>

      <button
        onClick={() => publishMutation.mutate({
          postId,
          langId: 'pt-br'
        })}
      >
        Publish Now
      </button>
    </div>
  )
}
```

## Global Error Handling

```typescript
// src/app/components/ErrorBoundary.tsx
export const ApiErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary
      fallback={({ error }) => {
        if (error.code) {
          switch (error.code) {
            case 'NOT_FOUND':
              return <NotFoundPage />
            case 'FORBIDDEN':
              return <UnauthorizedPage />
            case 'INTERNAL_ERROR':
            case 'DATABASE_ERROR':
              return <ServerErrorPage />
            default:
              return <GenericErrorPage error={error} />
          }
        }
        return <UnknownErrorPage />
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Implementation Phases

### Phase 1 - Foundation

1. ✅ Error system (`src/lib/errors/`)
2. ✅ API types (`src/lib/types/api.ts`)
3. ✅ Better Auth permission helpers
4. ✅ Global error handler

### Phase 2 - Core Functions

1. ✅ Posts server functions (complete)
2. ✅ Tags server functions (essential)
3. ✅ Basic media server functions

### Phase 3 - Advanced Features

1. ✅ Media server functions (complete)
2. ✅ Organizations server functions
3. ✅ Custom fields server functions
4. ✅ Analytics server functions

### Phase 4 - Integration & Polish

1. ✅ Route integration
2. ✅ Client error handling
3. ✅ Performance optimization
4. ✅ Documentation & testing

## Technical Considerations

- **Type Safety**: Responses always tipadas com `ApiResponse<T>`
- **Error Consistency**: Códigos de erro padronizados
- **Better Auth**: Integração nativa com sistema de permissões
- **Performance**: Repositories otimizados + error handling eficiente
- **Debugging**: Logs estruturados para erros 5xx
- **Testing**: Funções puras facilmente testáveis
- **Tree-shaking**: Imports granulares otimizados
