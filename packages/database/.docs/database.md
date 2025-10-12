# DATABASE.md

> Schema version: v1 — June 2025

## Overview

This document describes the database schema used in **Omero CMS**.

- The database is multi-tenant — all content is scoped to an `organization_id`.
- Users can belong to multiple organizations.
- Content is versioned (revisions model).
- Internationalization (i18n) is supported via `languages` and per-organization settings.
- API keys support resource-based permissions.
- All content supports soft deletion (logical deletion with `deleted_at`).

---

## Table Summary

| Table                      | Purpose                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------- |
| `user`                     | System users; may belong to multiple organizations.                                      |
| `session`                  | Tracks login sessions per user.                                                          |
| `account`                  | External identity providers (OAuth, etc).                                                |
| `verification`             | Temporary tokens for verification flows (email validation, password reset, magic links). |
| `organization`             | Root entity for multi-tenant architecture.                                               |
| `organization.settings`    | JSON field controlling enabled languages, default language, and future settings.         |
| `member`                   | Association between users and organizations (RBAC).                                      |
| `invitation`               | Invites users to an organization.                                                        |
| `apikey`                   | API keys scoped per user, with resource-based permissions.                               |
| `languages`                | Global list of supported languages.                                                      |
| `posts`                    | Root entity for content posts.                                                           |
| `posts_translations`       | Translation per post per language.                                                       |
| `posts_revisions`          | Versioned revisions of post content.                                                     |
| `tags`                     | Tag definitions.                                                                         |
| `tags_translations`        | Translation per tag per language.                                                        |
| `tags_revisions`           | Versioned revisions of tag content.                                                      |
| `posts_tags`               | M2M linking between posts and tags.                                                      |
| `medias`                   | Uploaded media files.                                                                    |
| `medias_tags`              | M2M linking between media and tags.                                                      |
| `custom_field_definitions` | Defines custom fields available per organization and entity type.                        |

---

## Relationships

### Multi-tenancy

- `posts`, `tags`, `medias` all have `organization_id NOT NULL`.
- Queries always filter by current active organization.

### Users and Organizations

- Users can belong to multiple organizations via `member`.
- Users can switch their `activeOrganizationId` (tracked in `session`).
- `member.role` supports basic RBAC (`owner`, `admin`, `member` — extensible).

### Content Translations & Revisions

- `posts` → `posts_translations` → `posts_revisions`
- `tags` → `tags_translations` → `tags_revisions`
- Revisions store versioned `slug` (SEO friendly) and metadata (meta_title, og_tags, schema_markup).
- `slug` is indexed for fast lookup.

### Soft Deletion

- All core entities (`posts`, `tags`, `medias`) support soft delete via `deleted_at`.
- Soft deleted content is hidden from the user.
- No undelete UI in MVP.

### Media

- `medias` is used to store media files.
- `title` and `alt_text` fields are stored in the media itself — `alt_text` is contextual and should be set when used in content.
- Media files can be tagged using `medias_tags`.

### Custom Fields

- `custom_field_definitions` allows organizations to define additional fields for posts, tags, and media.
- Each definition specifies the field type (`text`, `textarea`, `boolean`, `number`, `select`, `object`, `list`, `image`), validation rules, and whether it supports internationalization.
- Custom field values are stored as JSON in the `custom_fields` column of `posts_translations`, `tags_translations`, and `medias` tables.
- Field definitions are scoped per organization and entity type, with unique constraints on `(organization_id, entity_type, field_key)`.

---

## API Key Permissions

API keys are issued per `user_id`.
They support **resource-based permissions**, stored in the `permissions` JSON field.

### Permissions format

```ts
type Permissions = {
  [resourceType: string]: string[]
}
```

### Example

```json
{
  "posts": ["read", "write", "delete"],
  "tags": ["read", "write"],
  "media": ["read", "write", "delete"],
  "organization": ["read"]
}
```

### Supported Actions

- `read`
- `write`
- `delete`

### Supported Resource Types

- `posts`
- `tags`
- `media`
- `organization`

### Usage

- API endpoints will validate if the API key used has permission for the requested action on the requested resource type.
- Permissions are fully extensible.

---

## Internationalization (i18n)

- `languages` is a global table of supported languages.
- Each `organization` has a `settings` JSON field:

```json
{
  "languages": [
    { "code": "pt-BR" },
    { "code": "en-US" },
    { "code": "es-ES" }
  ],
  "defaultLanguage": "pt-BR"
}
```

- The default language is either the first in the list or explicitly set as `defaultLanguage`.
- User preferred language is stored in `user.preferred_language_id`.

---

## Enums

The schema uses several enums to ensure data consistency:

### Member Roles

- `member` - Basic organization member
- `admin` - Organization administrator
- `owner` - Organization owner (highest permission)

### Invitation Status

- `pending` - Invitation sent but not yet responded to
- `accepted` - User accepted the invitation
- `declined` - User declined the invitation
- `expired` - Invitation expired before response

### Custom Field Types

- `text` - Single line text input
- `textarea` - Multi-line text input
- `boolean` - True/false checkbox
- `number` - Numeric input
- `select` - Dropdown/select from predefined options
- `object` - Nested object structure for complex data
- `list` - Array/list of values
- `image` - Image field with upload capability

### Content Types

- `article` - Blog post or article content
- `page` - Static page content

### Visibility Settings

- `draft` - Content not published
- `private` - Published but private
- `public` - Publicly visible content

### Media Types

- `image` - Image files (jpg, png, gif, etc.)
- `video` - Video files
- `document` - Document files (pdf, doc, etc.)

---

## Notes

- The `verification` table does not link directly to `user`; this is intentional to allow use in flows where no `user` exists yet (email verification, magic link login, etc.).
- The schema is designed for flexibility and will evolve with additional capabilities such as:
  - More advanced roles and permissions per organization.
  - More advanced audit logging.
  - Workflow states per content (draft, review, published, archived).

---
