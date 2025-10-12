# Omero Repository Layer - Implementation Plan

## Overview

Implementação de uma camada de abstração funcional para operações de banco de dados do Omero CMS, focando nas entidades principais: Posts, Tags, Media, Organizations e Custom Fields.

## Estrutura de Arquivos

```text
src/lib/repositories/
├── base/
│   ├── filters.ts           # Higher-order functions para filtros comuns
│   ├── types.ts            # Tipos compartilhados
│   └── utils.ts            # Utilitários (slugify, etc.)
├── posts.ts                # Repository de posts
├── tags.ts                 # Repository de tags
├── medias.ts              # Repository de medias
├── organizations.ts       # Repository de organizations
├── custom-fields.ts       # Repository de custom fields
└── index.ts              # Barrel exports
```

## Entidades e Operações

### 1. Posts Repository (`posts.ts`)

**Factory Function:** `createPostRepository(organizationId: string)`

**Operações de Leitura:**

- `findPublishedBySlug(slug: string, languageId: string)` - Post público por slug
- `findBySlug(slug: string, languageId: string, includePrivate?: boolean)` - Post por slug (incluindo privados se for admin)
- `findAll(filters)` - Lista posts com filtros (visibility, languageId, limit, offset, tagId)
- `findDrafts(languageId: string)` - Posts em draft
- `findPrivate(languageId: string)` - Posts privados
- `findByTag(tagId: string, languageId: string, visibility?: string)` - Posts por tag
- `findWithRevisions(postId: string, languageId: string)` - Post com histórico de revisões
- `countByStatus(languageId: string)` - Contagem por status (public, draft, private)

**Operações de Escrita:**

- `createWithTranslations(data)` - Criar post com múltiplas traduções
- `updateTranslation(postId, languageId, data)` - Atualizar tradução específica
- `createRevision(postTranslationId, data)` - Criar nova revisão
- `publish(postId, languageId)` - Publicar post
- `unpublish(postId, languageId)` - Despublicar post
- `softDelete(postId)` - Soft delete
- `restore(postId)` - Restaurar post deletado
- `addTags(postId, tagIds)` - Associar tags
- `removeTags(postId, tagIds)` - Remover tags

**Funções Standalone:**

- `findPostBySlug(slug, orgId, langId)` - Busca direta
- `getAllPublicPosts(orgId, langId, limit?)` - Lista pública
- `getPostsWithTag(tagSlug, orgId, langId)` - Posts por tag slug

### 2. Tags Repository (`tags.ts`)

**Factory Function:** `createTagRepository(organizationId: string)`

**Operações de Leitura:**

- `findPublishedBySlug(slug: string, languageId: string)` - Tag pública por slug
- `findBySlug(slug: string, languageId: string)` - Tag por slug
- `findAll(filters)` - Lista tags (visibility, featured, languageId)
- `findFeatured(languageId: string)` - Tags em destaque
- `findWithPostCount(languageId: string)` - Tags com contagem de posts
- `findByIds(tagIds: string[], languageId: string)` - Tags por IDs

**Operações de Escrita:**

- `createWithTranslations(data)` - Criar tag com traduções
- `updateTranslation(tagId, languageId, data)` - Atualizar tradução
- `createRevision(tagTranslationId, data)` - Nova revisão
- `toggleFeatured(tagId)` - Alternar destaque
- `updateVisibility(tagId, languageId, visibility)` - Alterar visibilidade
- `softDelete(tagId)` - Soft delete
- `restore(tagId)` - Restaurar

**Funções Standalone:**

- `getFeaturedTags(orgId, langId)` - Tags destacadas
- `getTagBySlug(slug, orgId, langId)` - Busca por slug
- `getAllTags(orgId, langId)` - Todas as tags

### 3. Media Repository (`medias.ts`)

**Factory Function:** `createMediaRepository(organizationId: string)`

**Operações de Leitura:**

- `findById(mediaId: string)` - Media por ID
- `findAll(filters)` - Lista medias (type, tagId, limit, offset)
- `findByType(type: 'image' | 'video' | 'document')` - Medias por tipo
- `findByTag(tagId: string)` - Medias por tag
- `findRecent(limit?: number)` - Medias recentes
- `searchByName(query: string)` - Busca por nome
- `getTotalSize()` - Tamanho total dos arquivos
- `getUsageStats()` - Estatísticas de uso

**Operações de Escrita:**

- `create(data)` - Criar media
- `update(mediaId, data)` - Atualizar metadata
- `addTags(mediaId, tagIds)` - Associar tags
- `removeTags(mediaId, tagIds)` - Remover tags
- `softDelete(mediaId)` - Soft delete
- `restore(mediaId)` - Restaurar

**Funções Standalone:**

- `getMediaById(mediaId, orgId)` - Busca por ID
- `getRecentMedia(orgId, limit?)` - Medias recentes
- `getMediaByType(type, orgId)` - Por tipo

### 4. Organizations Repository (`organizations.ts`)

**Funções (não precisa de factory, são globais):**

- `findById(orgId: string)` - Organização por ID
- `findBySlug(slug: string)` - Organização por slug
- `findByUserId(userId: string)` - Organizações do usuário
- `updateSettings(orgId: string, settings: object)` - Atualizar configurações
- `updateMetadata(orgId: string, metadata: object)` - Atualizar metadata
- `getLanguages(orgId: string)` - Idiomas da organização
- `setDefaultLanguage(orgId: string, langId: string)` - Definir idioma padrão
- `addLanguage(orgId: string, langId: string)` - Adicionar idioma
- `removeLanguage(orgId: string, langId: string)` - Remover idioma

### 5. Custom Fields Repository (`custom-fields.ts`)

**Factory Function:** `createCustomFieldRepository(organizationId: string)`

**Operações de Leitura:**

- `findByEntity(entityType: 'post' | 'tag' | 'media')` - Definições por entidade
- `findById(definitionId: string)` - Definição por ID
- `validateFieldData(entityType: string, data: object)` - Validar dados customizados

**Operações de Escrita:**

- `createDefinition(data)` - Criar definição de campo
- `updateDefinition(definitionId, data)` - Atualizar definição
- `deleteDefinition(definitionId)` - Deletar definição
- `reorderDefinitions(entityType, definitionIds)` - Reordenar campos

## Funcionalidades Especiais

### Multi-tenancy

Todos os repositories que trabalham com dados específicos da organização recebem `organizationId` e filtram automaticamente.

### Internacionalização (i18n)

Posts e Tags têm traduções. Os repositories lidam com:

- Busca por idioma específico
- Fallback para idioma padrão
- Operações em múltiplos idiomas

### Versionamento (Revisions)

Posts e Tags têm sistema de revisões:

- Histórico de alterações
- Revertimento para versões anteriores
- Comparação entre versões

### Soft Delete

Entidades principais suportam soft delete:

- Marcação como deletado sem remoção física
- Filtros automáticos para excluir deletados
- Funcionalidade de restauração

### Custom Fields

Sistema flexível de campos customizados:

- Definições por organização e tipo de entidade
- Validação de tipos (text, number, select, etc.)
- Estruturas complexas (objects, lists)

## Padrões de Implementação

### 1. Factory Functions

```typescript
export const createPostRepository = (
  organizationId: string
) => ({
  // métodos específicos
})
```

### 2. Standalone Functions

```typescript
export const findPostBySlug = (
  slug: string,
  orgId: string,
  langId: string
) =>
  createPostRepository(orgId).findPublishedBySlug(
    slug,
    langId
  )
```

### 3. Higher-Order Functions para Filtros

```typescript
const withOrgFilter = (query, orgId, schema) =>
  query.where(eq(schema.organizationId, orgId))
```

### 4. Transações para Operações Complexas

```typescript
return db.transaction(async (tx) => {
  // múltiplas operações
})
```

## Próximos Passos

1. ✅ Criar estrutura base (`base/filters.ts`, `base/types.ts`)
2. ✅ Implementar Posts Repository
3. ✅ Implementar Tags Repository
4. ✅ Implementar Media Repository
5. ✅ Implementar Organizations Repository
6. ✅ Implementar Custom Fields Repository
7. ✅ Criar barrel exports (`index.ts`)
8. ✅ Escrever testes unitários
9. ✅ Documentar APIs
10. ✅ Integrar com as rotas existentes

## Considerações Técnicas

- **Performance**: Usar joins otimizados e índices adequados
- **Type Safety**: Aproveitar tipos do Drizzle + TypeScript strict
- **Error Handling**: Retornos consistentes e tratamento de erros
- **Testing**: Funções puras facilitam mocking e testes
- **Tree-shaking**: Estrutura permite importação granular
- **Caching**: Preparado para implementação de cache futuro
