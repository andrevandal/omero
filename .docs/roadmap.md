# Omero CMS - Development Roadmap

## Project Goal

Migrate from Decap CMS to a custom multi-tenant CMS solution, leveraging existing Astro + IPX + Minio infrastructure for optimal performance and reduced complexity.

## Current Status

✅ **Foundation Complete:**

- Database schema with multi-tenancy, i18n, revisions, custom fields
- Better Auth integration (login/logout/registration/email verification)
- TanStack Router structure
- UI components library (Headless UI + TailwindCSS)
- Email notification templates
- Seed data with realistic portfolio content (Pedro's site)

## MVP 1 - Content-Only CMS (Critical for Decap Migration)

**Goal:** Replace Decap CMS for content management while keeping existing media infrastructure

### Phase 1.1 - Core Infrastructure (Week 1-2)

**Priority: 🔴 Critical**

1. **Data Layer Foundation**
   - [ ] Implement repositories (Posts, Tags, Organizations, Custom Fields)
   - [ ] Create functional error system
   - [ ] Implement typed API responses
   - [ ] **Skip Media repository** (use existing Astro/IPX system)
2. **Server Functions Implementation**
   - [ ] Posts server functions (create, read, update, delete, publish)
   - [ ] Tags server functions (basic CRUD)
   - [ ] Organizations server functions (settings)
   - [ ] Custom Fields server functions
   - [ ] Better Auth permissions integration
   - [ ] **Skip Media server functions** initially

3. **Content-Only Focus**
   - [ ] Text/markdown content management
   - [ ] SEO fields via custom fields
   - [ ] Portfolio custom fields (features, showcase order)
   - [ ] Multi-language content support

**Milestone:** Content API fully functional, no media upload needed

### Phase 1.2 - Admin Interface (Week 3-4)

**Priority: 🔴 Critical**

1. **Posts Management**
   - [ ] Posts listing page with filters (published, draft, private)
   - [ ] Create/Edit post form with multi-language support
   - [ ] Rich text/Markdown editor
   - [ ] Post preview functionality
   - [ ] Publish/unpublish actions
   - [ ] Revision history viewer
   - [ ] **No image upload** - reference existing images via URL/path

2. **Tags Management**
   - [ ] Tags listing with post count
   - [ ] Create/Edit tag form with multi-language
   - [ ] Featured tags toggle
   - [ ] Tag assignment to posts

3. **Custom Fields Integration**
   - [ ] Custom fields editor in post/tag forms
   - [ ] SEO fields (meta title, description, og tags)
   - [ ] Portfolio fields (features list, showcase order, CTA text)
   - [ ] Field validation and type handling

**Milestone:** Complete content management - Pedro can create/edit all textual content

### Phase 1.3 - Organization & Polish (Week 5)

**Priority: 🟡 Important**

1. **Multi-language Support**
   - [ ] Language switcher in admin
   - [ ] Translation status indicators
   - [ ] Required translation validation
   - [ ] Language-specific preview

2. **Organization Configuration**
   - [ ] Organization settings page
   - [ ] Site metadata configuration
   - [ ] Language management (add/remove/set default)
   - [ ] Custom fields definitions management

3. **User Experience Polish**
   - [ ] Loading states and error handling
   - [ ] Toast notifications for actions
   - [ ] Auto-save for drafts
   - [ ] Responsive admin interface
   - [ ] Keyboard shortcuts

**Milestone:** Production-ready content CMS, ready for migration

### Phase 1.4 - Migration Preparation (Week 6)

**Priority: 🔴 Critical**

1. **Content Export/Import Tools**
   - [ ] Decap CMS content export utility
   - [ ] Omero content import utility
   - [ ] Data validation and mapping
   - [ ] Custom fields migration (SEO, portfolio features)

2. **Migration Testing**
   - [ ] Staging environment setup
   - [ ] Full content migration test
   - [ ] Admin interface user testing
   - [ ] Content validation checks

**Milestone:** Ready to migrate from Decap CMS completely

## MVP 2 - Site Integration (Astro + Omero)

**Goal:** Pedro's Astro site consuming content from Omero CMS API

### Phase 2.1 - API Integration (Week 7-8)

**Priority: 🟢 Medium**

1. **Public Content API**
   - [ ] Server functions for public content (no auth)
   - [ ] SEO-optimized content delivery
   - [ ] Custom fields in API responses (SEO tags, portfolio data)
   - [ ] Multi-language content delivery

2. **Astro Integration**
   - [ ] Replace Decap CMS data sources with Omero API calls
   - [ ] Preserve existing image pipeline (IPX + Minio)
   - [ ] Update content pages to use Omero data structure
   - [ ] Maintain existing SEO structure
   - [ ] RSS feed from Omero content

3. **Performance Optimization**
   - [ ] Content caching strategy
   - [ ] API response optimization
   - [ ] Build-time content fetching for Astro

**Milestone:** Pedro's website fully powered by Omero, images still via existing system

### Phase 2.2 - SEO & Performance (Week 9)

**Priority: 🟢 Medium**

1. **SEO Enhancement**
   - [ ] Dynamic meta tags from Omero custom fields
   - [ ] Schema markup from portfolio data
   - [ ] Open Graph optimization using custom fields
   - [ ] Sitemap generation from Omero content

2. **Performance Validation**
   - [ ] Site performance monitoring
   - [ ] SEO score validation
   - [ ] Content delivery speed tests
   - [ ] Caching effectiveness measurement

**Milestone:** Site performance maintained/improved, SEO optimized

## MVP 3 - Advanced Media System (Future)

**Goal:** Integrate IPX + S3 directly into Omero for unified media management

### Phase 3.1 - IPX Integration Planning (Week 10+)

**Priority: 🔵 Future**

1. **Architecture Design**
   - [ ] Study current IPX + Minio setup
   - [ ] Design IPX integration within Omero
   - [ ] S3 storage strategy
   - [ ] Image optimization pipeline

2. **Media Repository Implementation**
   - [ ] Media repositories with IPX integration
   - [ ] S3 upload with automatic IPX processing
   - [ ] Image variant generation (sizes, formats)
   - [ ] Media metadata management

### Phase 3.2 - Admin Media Interface (Week 11+)

**Priority: 🔵 Future**

1. **Upload Interface**
   - [ ] Drag & drop media upload
   - [ ] Automatic IPX optimization
   - [ ] Progress indicators and error handling
   - [ ] Media organization (folders/tags)

2. **Media Management**
   - [ ] Media gallery with IPX variants
   - [ ] Image editing capabilities
   - [ ] Usage tracking (where media is used)
   - [ ] Bulk operations for media

### Phase 3.3 - Site Migration to Omero Media (Week 12+)

**Priority: 🔵 Future**

1. **Gradual Migration**
   - [ ] Migrate existing images to Omero + S3
   - [ ] Update Astro to use Omero media URLs
   - [ ] Preserve IPX optimization benefits
   - [ ] Sunset old Minio setup

**Milestone:** Unified content + media management system

## Technical Architecture

### Current Phase (MVP 1-2)

```text
Astro Site (existing) ← Content API → Omero CMS
     ↓                                    ↑
IPX + Minio (existing)              Better Auth + Admin
```

### Future Phase (MVP 3)

```text
Astro Site ← Content + Media API → Omero CMS + IPX + S3
```

### Repository Pattern (Content-First)

```text
src/lib/repositories/
├── posts.ts           # ✅ MVP 1
├── tags.ts            # ✅ MVP 1
├── organizations.ts   # ✅ MVP 1
├── custom-fields.ts   # ✅ MVP 1
└── medias.ts          # 🔵 MVP 3 (future)

src/lib/server/
├── posts.ts           # ✅ MVP 1
├── tags.ts            # ✅ MVP 1
├── organizations.ts   # ✅ MVP 1
├── custom-fields.ts   # ✅ MVP 1
└── medias.ts          # 🔵 MVP 3 (future)
```

## Migration Strategy

### Content-First Migration (Faster & Safer)

1. **Phase 1:** Migrate all textual content from Decap → Omero
2. **Phase 2:** Update Astro to use Omero API, keep existing images
3. **Phase 3:** (Future) Migrate images to unified Omero system

### Pre-Migration Checklist

- [ ] Backup all Decap CMS content
- [ ] Test Omero admin interface with real content
- [ ] Validate custom fields migration (SEO, portfolio data)
- [ ] Performance test content API

### Migration Day Process

1. **Content Export:** Export all text content from Decap CMS
2. **Data Import:** Import into Omero with translations/custom fields
3. **Site API Switch:** Update Astro to use Omero content API
4. **Validation:** Verify all content displays correctly (images stay the same)
5. **Decap Sunset:** Remove Decap CMS, keep image references

## Success Criteria

### MVP 1 Success Metrics

- ✅ Pedro can manage all textual content through Omero
- ✅ Multi-language content works perfectly
- ✅ Custom fields (SEO, portfolio features) fully functional
- ✅ No content management regression from Decap CMS
- ✅ **Images stay exactly the same** (no disruption)

### MVP 2 Success Metrics

- ✅ Pedro's website content fully from Omero
- ✅ Site performance maintained (images unchanged)
- ✅ SEO maintained or improved via custom fields
- ✅ Build process works with Omero API

### MVP 3 Success Metrics (Future)

- ✅ Unified media management within Omero
- ✅ IPX optimization maintained or improved
- ✅ Better media workflow than current system

## Timeline Summary

**Content Migration:** 6 weeks
**Site Integration:** 3 weeks  
**Advanced Media:** Future (3+ months later)

- **Weeks 1-2:** Core content infrastructure (no media)
- **Weeks 3-4:** Admin interface for content management
- **Week 5:** Multi-language + organization settings
- **Week 6:** Migration tools + testing
- **Weeks 7-8:** Astro integration with Omero API
- **Week 9:** Performance optimization + go-live

**Total to Migration:** 9 weeks  
**Advanced Media System:** Future roadmap item

## Risk Mitigation

### Eliminated Risks (Smart Strategy)

- ❌ **Media Upload Complexity** - Using existing proven system
- ❌ **Image Optimization Issues** - IPX already working
- ❌ **Storage Management** - Minio already configured
- ❌ **Performance Degradation** - Images stay the same

### Remaining Risks (Manageable)

1. **Content API Performance** - Mitigation: Caching, optimization
2. **Astro Integration Issues** - Mitigation: Gradual rollout, staging tests
3. **SEO Impact** - Mitigation: Custom fields preserve all meta data

## Next Steps (This Week)

### Immediate Priority

1. [ ] Implement content repositories (Posts, Tags, Organizations, Custom Fields)
2. [ ] Create error handling + typed responses
3. [ ] Start Posts server functions

### Following Week

1. [ ] Posts admin interface (listing + forms)
2. [ ] Tags admin interface
3. [ ] Custom fields integration in forms

This focused approach gets Pedro off Decap CMS quickly while preserving the proven image optimization system, then allows for future enhancement of the media pipeline.
