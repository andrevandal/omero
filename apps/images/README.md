# images.vandal.services

Serviço de proxy e cache de imagens otimizadas usando Cloudflare Images no edge.

## Motivação

Anteriormente usávamos IPX/Sharp para processamento de imagens, mas isso causava problemas de recursos (CPU/memória) no worker mesmo com cache. A migração para **Cloudflare Images** delega o processamento pesado para a infraestrutura da Cloudflare, enquanto o worker apenas roteia requisições e gerencia cache/segurança.

## Inspiração

- [cloudflare-images-worker](https://github.com/yo-han/cloudflare-images-worker/tree/develop)

## Stack

- Node v24
- Bun
- Hono
- Cloudflare Images (processamento)
- Drizzle ORM
- Turso (Libsql)
- Cloudflare Workers (proxy/routing)
- Cloudflare KV (cache)
- Cloudflare R2 (storage de originais)

## Como funciona?

### Cache Híbrido: KV + R2

Para otimizar custos e performance, usamos uma estratégia de cache em duas camadas:

#### KV (Hot Cache)
- **Velocidade**: ~50-200ms (edge)
- **TTL**: 24 horas
- **Custo**: Incluído no Workers (grátis até 1GB)
- **Uso**: Imagens acessadas recentemente

#### R2 (Cold Cache)
- **Velocidade**: ~200-500ms (região)
- **Persistência**: Infinita (até limpeza manual)
- **Custo**: $0.015/GB/mês (storage) + grátis até 10M reads
- **Uso**: Todas as transformações já processadas
- **Path**: `.cache/{hash}` no bucket da org

#### Vantagens
1. **Economia**: Evita reprocessamento no CF Images (custo por transformação)
2. **Performance**: KV serve imagens populares instantaneamente
3. **Resiliência**: R2 mantém histórico completo de transformações
4. **Controle**: Dashboard pode limpar cache R2 por org/imagem

### Anatomia da URL

```text
/pedrohenri.design/images/primeira-dobra.png?f=webp&w=800&q=85&s=abc123
```

Estrutura: `/${orgSlug}/${imagePath}?${transformParams}&s=${signature}`

- **orgSlug**: Identificador da organização (slug)
- **imagePath**: Caminho da imagem no bucket R2
- **transformParams**: Parâmetros de transformação (IPX)
- **s**: Assinatura HMAC-SHA256 (obrigatória para transformações)

### Fluxo de processamento

1. Parse da URL para extrair `orgSlug`, `imagePath` e params
2. Busca org no banco via slug e valida que está ativa
3. **Busca storage de imagens** da org (`type='images'`)
4. **Se tiver transformações**: Valida assinatura HMAC usando `imageSecretKey` do storage
5. **Se não tiver params**: Retorna imagem original do R2 (redirect 302)
6. Verifica rate limit global (1000 req/hora por padrão)
7. **Cache híbrido (KV → R2 → CF Images)**:
   - 🔥 **Hot cache (KV)**: Tenta buscar do KV (TTL: 24h)
   - 🧊 **Cold cache (R2)**: Se não estiver no KV, busca do R2 em `.cache/{hash}`
   - ⚡ **CF Images**: Se não estiver em nenhum cache, processa com CF Images
8. Se processou com CF Images:
   - Salva no **R2** (`.cache/{hash}`) - cache infinito/permanente
   - Salva no **KV** (hot cache) - TTL de 24h
   - **Registra transformação no banco** (async via `ctx.waitUntil`)
9. Se encontrou no R2, também salva no KV (promote to hot)
10. Retorna imagem otimizada

## Segurança: Signed URLs

### Por que?

Como aceitamos transformações via query params, qualquer pessoa poderia criar variações infinitas alterando a URL, gerando processamento desnecessário. Signed URLs garantem que apenas transformações autorizadas são processadas.

### Schema do banco (Drizzle)

Estrutura de storages: cada org tem **dois storages independentes**:
- **Images Storage**: Para imagens otimizadas (usado pelo image service)
- **Files Storage**: Para arquivos gerais (PDFs, docs, etc)

**Conta Cloudflare Images**: Uma conta única compartilhada entre todas as orgs, com custo separado via tracking por org (product-level billing).

#### Nova tabela: `organization_storages`

```typescript
// packages/database/src/schemas/index.ts

export const organizationStorages = sqliteTable(
  'organization_storages',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['images', 'files'] }).notNull(),
    provider: text('provider', { enum: ['r2', 's3', 'gcs'] }).notNull().default('r2'),

    // R2/S3/GCS config
    bucketName: text('bucket_name').notNull(),
    region: text('region'), // Para S3/GCS
    endpoint: text('endpoint'), // Para custom endpoints

    // Credentials (encrypted ou referência ao secret)
    accessKeyId: text('access_key_id'),
    secretAccessKey: text('secret_access_key'),

    // Images specific (apenas para type='images')
    imageSecretKey: text('image_secret_key'), // HMAC secret para signed URLs (único por org)

    // Settings
    enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
    maxFileSize: integer('max_file_size').default(10485760), // 10MB default
    allowedMimeTypes: text('allowed_mime_types', { mode: 'json' })
      .$type<string[]>()
      .default(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']),

    ...timestamps
  },
  (table) => [
    uniqueIndex('org_storages_org_type_idx').on(table.organizationId, table.type),
    index('org_storages_organization_idx').on(table.organizationId),
    index('org_storages_type_idx').on(table.type)
  ]
);

// Relation
export const organizationStoragesRelations = relations(
  organizationStorages,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationStorages.organizationId],
      references: [organization.id]
    })
  })
);

// Adicionar em organizationRelations
export const organizationRelations = relations(organization, ({ many }) => ({
  // ... relações existentes
  storages: many(organizationStorages),
  imageTransformations: many(imageTransformations)
}));
```

#### Conta Cloudflare Images global

Como todas as orgs compartilham a mesma conta CF Images, o `imagesAccountHash` fica como variável de ambiente no worker:

```env
# .env do worker
CLOUDFLARE_IMAGES_ACCOUNT_HASH=abc123xyz
```

#### Exemplo de dados

```typescript
// Org "pedrohenri.design" com 2 storages
[
  {
    id: 'stor_images_123',
    organizationId: 'org_abc',
    type: 'images',
    provider: 'r2',
    bucketName: 'pedrohenri-images',
    imageSecretKey: 'unique-hmac-secret-for-this-org',
    enabled: true,
    maxFileSize: 10485760, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
  },
  {
    id: 'stor_files_456',
    organizationId: 'org_abc',
    type: 'files',
    provider: 'r2',
    bucketName: 'pedrohenri-files',
    enabled: true,
    maxFileSize: 52428800, // 50MB
    allowedMimeTypes: ['application/pdf', 'application/zip', 'text/plain']
  }
]
```

#### Helper types e funções

```typescript
// packages/database/src/helpers.ts ou similar

export async function getOrgStorage(
  db: Database,
  orgId: string,
  type: 'images' | 'files'
) {
  const storage = await db
    .select()
    .from(organizationStorages)
    .where(
      and(
        eq(organizationStorages.organizationId, orgId),
        eq(organizationStorages.type, type),
        eq(organizationStorages.enabled, true)
      )
    )
    .limit(1);

  return storage[0] || null;
}

// Validar se mime type é permitido
export function isAllowedMimeType(
  storage: typeof organizationStorages.$inferSelect,
  mimeType: string
): boolean {
  const allowed = storage.allowedMimeTypes as string[];
  return allowed.includes(mimeType);
}
```

### Geração da assinatura (client-side)

```typescript
import { createHmac } from 'crypto';

function signImageUrl(
  orgSecret: string,
  path: string,
  params: Record<string, string | number>
): string {
  // Remove signature se existir e ordena params
  const { s, signature, ...cleanParams } = params;
  const sortedParams = Object.keys(cleanParams)
    .sort()
    .map(key => `${key}=${cleanParams[key]}`)
    .join('&');

  const message = sortedParams ? `${path}?${sortedParams}` : path;
  const signature = createHmac('sha256', orgSecret)
    .update(message)
    .digest('hex')
    .substring(0, 16); // Primeiros 16 chars

  return signature;
}

// Uso
const sig = signImageUrl(
  'org-secret-abc123',
  '/pedrohenri.design/images/hero.png',
  { f: 'webp', w: 800, q: 85 }
);
// URL: /pedrohenri.design/images/hero.png?f=webp&w=800&q=85&s=abc123
```

### Validação no Worker

```typescript
async function validateSignature(
  orgSecret: string,
  path: string,
  searchParams: URLSearchParams
): Promise<boolean> {
  const providedSig = searchParams.get('s') || searchParams.get('signature');

  // Se não há params de transformação, não precisa de sig
  const transformParams = Array.from(searchParams.keys()).filter(
    key => !['s', 'signature'].includes(key)
  );
  if (transformParams.length === 0) return true;

  // Se tem transformações mas sem assinatura, inválido
  if (!providedSig) return false;

  // Remove assinatura e ordena params
  const paramsToValidate = new URLSearchParams(searchParams);
  paramsToValidate.delete('s');
  paramsToValidate.delete('signature');

  const sortedParams = Array.from(paramsToValidate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const message = sortedParams ? `${path}?${sortedParams}` : path;

  // Gera assinatura esperada usando Web Crypto API
  const encoder = new TextEncoder();
  const keyData = encoder.encode(orgSecret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
  const expectedSig = Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 16);

  return providedSig === expectedSig;
}
```

## Rate Limiting

Usando `hono-rate-limiter` com `@hono-rate-limiter/cloudflare` (KV store).

### Configuração

```typescript
import { rateLimiter } from 'hono-rate-limiter';
import { CloudflareKVStore } from '@hono-rate-limiter/cloudflare';

const limiter = rateLimiter({
  store: new CloudflareKVStore({ namespace: c.env.KV }),
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 1000, // 1000 requests por hora (global)
  keyGenerator: (c) => {
    // Rate limit global por IP
    return c.req.header('cf-connecting-ip') || 'unknown';
  },
  handler: (c) => {
    return c.json({ error: 'Too many requests' }, 429);
  }
});

app.use('*', limiter);
```

### Rate limiting por org (futuro)

Para implementar quotas por organização, podemos usar o campo `settings` na tabela `organization`:

```typescript
// Schema de settings
interface OrgSettings {
  images?: {
    monthlyQuota?: number; // Limite mensal de transformações
    rateLimitPerHour?: number; // Limite por hora (override do global)
  };
}

// No worker, após identificar org
const orgSettings = org.settings as OrgSettings;
const monthlyQuota = orgSettings?.images?.monthlyQuota;

if (monthlyQuota) {
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const key = `quota:${orgId}:${currentMonth}`;
  const usage = await kv.get<number>(key) || 0;

  if (usage >= monthlyQuota) {
    return c.json({ error: 'Monthly quota exceeded' }, 429);
  }
}
```

## Tracking de Transformações

Para analytics, quotas e billing futuro.

### Schema (Drizzle)

```typescript
// packages/database/src/schemas/index.ts

export const imageTransformations = sqliteTable(
  'image_transformations',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id')
      .notNull()
      .references(() => organization.id, { onDelete: 'cascade' }),
    imagePath: text('image_path').notNull(),
    transformationParams: text('transformation_params').notNull(), // JSON
    cacheHit: integer('cache_hit', { mode: 'boolean' }).notNull().default(false),
    responseTimeMs: integer('response_time_ms'),
    imageSizeBytes: integer('image_size_bytes'),
    ...timestamps
  },
  (table) => [
    index('idx_image_transformations_org_date').on(
      table.organizationId,
      table.createdAt
    ),
    index('idx_image_transformations_cache').on(table.cacheHit),
    index('idx_image_transformations_path').on(
      table.organizationId,
      table.imagePath
    )
  ]
);

// Relation
export const imageTransformationsRelations = relations(
  imageTransformations,
  ({ one }) => ({
    organization: one(organization, {
      fields: [imageTransformations.organizationId],
      references: [organization.id]
    })
  })
);

// Adicionar em organizationRelations
export const organizationRelations = relations(organization, ({ many }) => ({
  // ... relações existentes
  imageTransformations: many(imageTransformations)
}));
```

### Implementação no Worker

**Importante**: Para evitar sobrecarregar o banco, usamos uma estratégia híbrida:

1. **Tracking completo**: Apenas para **cache miss total** (CF Images)
2. **Agregação leve**: Cache hits incrementam contadores no KV
3. **Flush periódico**: KV → DB em batch (via Cron Trigger)

```typescript
// Helper para gerar hash do cache
function generateCacheHash(imagePath: string, params: URLSearchParams): string {
  const sortedParams = Array.from(params.entries())
    .filter(([key]) => !['s', 'signature'].includes(key))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const message = `${imagePath}?${sortedParams}`;

  // Simple hash (ou use crypto.subtle.digest)
  return btoa(message).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
}

// Handler principal
async function handleImageRequest(
  c: Context,
  org: Organization,
  imageStorage: OrganizationStorage,
  imagePath: string,
  searchParams: URLSearchParams
) {
  const startTime = Date.now();
  const cacheHash = generateCacheHash(imagePath, searchParams);

  // KV cache key
  const kvKey = `img:${org.id}:${cacheHash}`;

  // R2 cache path
  const r2CachePath = `.cache/${cacheHash}`;

  let image: ArrayBuffer;
  let cacheSource: 'kv' | 'r2' | 'cf-images';

  // 1. Try KV (hot cache)
  const kvCached = await c.env.KV.get(kvKey, 'arrayBuffer');
  if (kvCached) {
    image = kvCached;
    cacheSource = 'kv';
  } else {
    // 2. Try R2 (cold cache)
    const r2Cached = await c.env.R2.get(imageStorage.bucketName).get(r2CachePath);

    if (r2Cached) {
      image = await r2Cached.arrayBuffer();
      cacheSource = 'r2';

      // Promote to hot cache (KV)
      c.executionCtx.waitUntil(
        c.env.KV.put(kvKey, image, { expirationTtl: 86400 })
      );
    } else {
      // 3. Process with CF Images (cache miss)
      const variant = buildVariant(searchParams);
      const cfImageUrl = `https://imagedelivery.net/${c.env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/${imagePath}/${variant}`;

      const response = await fetch(cfImageUrl);
      if (!response.ok) {
        return c.json({ error: 'Failed to process image' }, response.status);
      }

      image = await response.arrayBuffer();
      cacheSource = 'cf-images';

      // Save to both caches (parallel)
      c.executionCtx.waitUntil(
        Promise.all([
          // Hot cache (KV) - 24h
          c.env.KV.put(kvKey, image, { expirationTtl: 86400 }),

          // Cold cache (R2) - permanent
          c.env.R2.get(imageStorage.bucketName).put(r2CachePath, image, {
            httpMetadata: {
              contentType: response.headers.get('content-type') || 'image/jpeg',
            },
            customMetadata: {
              orgId: org.id,
              imagePath,
              params: searchParams.toString(),
              createdAt: new Date().toISOString()
            }
          })
        ])
      );
    }
  }

  const responseTimeMs = Date.now() - startTime;

  // Track transformation (async)
  c.executionCtx.waitUntil(
    trackTransformation(c.env.KV, db, {
      orgId: org.id,
      imagePath,
      params: searchParams,
      cacheHit: cacheSource !== 'cf-images',
      cacheSource,
      responseTimeMs,
      imageSizeBytes: image.byteLength
    })
  );

  // Return image
  return new Response(image, {
    headers: {
      'Content-Type': 'image/webp', // ou detectar do response
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Cache-Status': cacheSource.toUpperCase(),
      'X-Response-Time': `${responseTimeMs}ms`
    }
  });
}

async function trackTransformation(
  kv: KVNamespace,
  db: Database,
  data: {
    orgId: string;
    imagePath: string;
    params: URLSearchParams;
    cacheHit: boolean;
    cacheSource: 'kv' | 'r2' | 'cf-images';
    responseTimeMs: number;
    imageSizeBytes: number;
  }
) {
  try {
    if (data.cacheSource === 'cf-images') {
      // Cache MISS total: registra completo no banco (gera custo!)
      await db.insert(imageTransformations).values({
        id: crypto.randomUUID(),
        organizationId: data.orgId,
        imagePath: data.imagePath,
        transformationParams: JSON.stringify(Object.fromEntries(data.params)),
        cacheHit: false,
        responseTimeMs: data.responseTimeMs,
        imageSizeBytes: data.imageSizeBytes,
        createdAt: new Date()
      });
    } else {
      // Cache HIT (KV ou R2): apenas incrementa contador
      const today = new Date().toISOString().split('T')[0];
      const key = `stats:hits:${data.orgId}:${today}:${data.cacheSource}`;

      const current = parseInt(await kv.get(key) || '0');
      await kv.put(key, (current + 1).toString(), {
        expirationTtl: 86400 * 7 // 7 dias
      });
    }
  } catch (error) {
    console.error('Failed to track transformation:', error);
  }
}
```

### Limpeza de cache R2 (Dashboard)

```typescript
// API endpoint para limpar cache
async function clearImageCache(
  orgId: string,
  options?: {
    imagePath?: string; // Limpar imagem específica
    before?: Date; // Limpar caches antes de uma data
  }
) {
  const storage = await getOrgStorage(db, orgId, 'images');
  if (!storage) throw new Error('Storage not found');

  const r2 = env.R2.get(storage.bucketName);

  if (options?.imagePath) {
    // Limpar todas as transformações de uma imagem específica
    const listed = await r2.list({ prefix: '.cache/' });

    for (const object of listed.objects) {
      const metadata = await r2.head(object.key);
      if (metadata?.customMetadata?.imagePath === options.imagePath) {
        await r2.delete(object.key);
      }
    }
  } else {
    // Limpar todo o cache da org
    const listed = await r2.list({ prefix: '.cache/' });

    for (const object of listed.objects) {
      const metadata = await r2.head(object.key);
      if (metadata?.customMetadata?.orgId === orgId) {
        await r2.delete(object.key);
      }
    }
  }

  return { cleared: true };
}

// Estatísticas de cache
async function getCacheStats(orgId: string) {
  const storage = await getOrgStorage(db, orgId, 'images');
  if (!storage) throw new Error('Storage not found');

  const r2 = env.R2.get(storage.bucketName);
  const listed = await r2.list({ prefix: '.cache/' });

  let totalSize = 0;
  let totalCount = 0;

  for (const object of listed.objects) {
    const metadata = await r2.head(object.key);
    if (metadata?.customMetadata?.orgId === orgId) {
      totalSize += object.size;
      totalCount++;
    }
  }

  return {
    cachedTransformations: totalCount,
    totalSizeBytes: totalSize,
    totalSizeMB: (totalSize / 1024 / 1024).toFixed(2),
    estimatedMonthlyCost: (totalSize / 1024 / 1024 / 1024 * 0.015).toFixed(4) // $0.015/GB/mês
  };
}
```

### Cron Job para agregar cache hits (opcional)

```typescript
// Cloudflare Worker Cron Trigger (1x por dia)
export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateKey = yesterday.toISOString().split('T')[0];

    // Lista todas as orgs com stats do dia anterior
    const keys = await env.KV.list({ prefix: `stats:hits:` });

    for (const key of keys.keys) {
      const match = key.name.match(/stats:hits:([^:]+):(.+)/);
      if (!match) continue;

      const [_, orgId, date] = match;
      if (date !== dateKey) continue;

      const hitCount = parseInt(await env.KV.get(key.name) || '0');

      // Cria registro agregado
      await db.insert(imageTransformations).values({
        id: crypto.randomUUID(),
        organizationId: orgId,
        imagePath: '_aggregated_hits', // Path especial para agregados
        transformationParams: JSON.stringify({ aggregated: true, count: hitCount }),
        cacheHit: true,
        responseTimeMs: 0,
        imageSizeBytes: 0,
        createdAt: yesterday
      });

      // Remove do KV após flush
      await env.KV.delete(key.name);
    }
  }
};
```

### Cache Performance Metrics

```typescript
// Métricas de cache por fonte (últimos 7 dias)
const getCachePerformance = async (orgId: string, kv: KVNamespace, days: number = 7) => {
  let kvHits = 0;
  let r2Hits = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];

    kvHits += parseInt(await kv.get(`stats:hits:${orgId}:${dateKey}:kv`) || '0');
    r2Hits += parseInt(await kv.get(`stats:hits:${orgId}:${dateKey}:r2`) || '0');
  }

  // CF Images hits = transformações no banco
  const result = await db
    .select({ count: count() })
    .from(imageTransformations)
    .where(
      and(
        eq(imageTransformations.organizationId, orgId),
        eq(imageTransformations.cacheHit, false),
        gte(imageTransformations.createdAt, new Date(Date.now() - days * 86400000))
      )
    );

  const cfImagesHits = result[0]?.count || 0;
  const totalRequests = kvHits + r2Hits + cfImagesHits;

  return {
    total: totalRequests,
    kv: kvHits,
    kvPercent: totalRequests > 0 ? ((kvHits / totalRequests) * 100).toFixed(2) : 0,
    r2: r2Hits,
    r2Percent: totalRequests > 0 ? ((r2Hits / totalRequests) * 100).toFixed(2) : 0,
    cfImages: cfImagesHits,
    cfImagesPercent: totalRequests > 0 ? ((cfImagesHits / totalRequests) * 100).toFixed(2) : 0,
    overallCacheHitRate: totalRequests > 0 ? (((kvHits + r2Hits) / totalRequests) * 100).toFixed(2) : 0
  };
};
```

### Analytics Queries

```typescript
// Total de transformações no mês atual (apenas CF Images = novas transformações)
const getMonthlyTransformations = async (orgId: string) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: count() })
    .from(imageTransformations)
    .where(
      and(
        eq(imageTransformations.organizationId, orgId),
        eq(imageTransformations.cacheHit, false), // Apenas cache miss
        gte(imageTransformations.createdAt, startOfMonth)
      )
    );

  return result[0]?.count || 0;
};

// Total de requests (miss + hits agregados do KV)
const getTotalRequests = async (orgId: string, kv: KVNamespace) => {
  const today = new Date().toISOString().split('T')[0];

  // Cache hits de hoje (ainda no KV)
  const hitsKey = `stats:hits:${orgId}:${today}`;
  const todayHits = parseInt(await kv.get(hitsKey) || '0');

  // Transformações únicas (cache miss) no banco
  const result = await db
    .select({ count: count() })
    .from(imageTransformations)
    .where(
      and(
        eq(imageTransformations.organizationId, orgId),
        eq(imageTransformations.cacheHit, false)
      )
    );

  const uniqueTransformations = result[0]?.count || 0;

  return {
    totalRequests: uniqueTransformations + todayHits,
    uniqueTransformations,
    cacheHits: todayHits
  };
};

// Taxa de cache hit (estimativa)
const getCacheHitRate = async (orgId: string, kv: KVNamespace, days: number = 7) => {
  let totalHits = 0;

  // Soma hits dos últimos N dias no KV
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    const key = `stats:hits:${orgId}:${dateKey}`;
    totalHits += parseInt(await kv.get(key) || '0');
  }

  // Total de transformações únicas (cache miss) no período
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({ count: count() })
    .from(imageTransformations)
    .where(
      and(
        eq(imageTransformations.organizationId, orgId),
        eq(imageTransformations.cacheHit, false),
        gte(imageTransformations.createdAt, startDate)
      )
    );

  const uniqueTransformations = result[0]?.count || 0;
  const totalRequests = uniqueTransformations + totalHits;

  return totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;
};

// Top imagens mais transformadas (apenas cache miss)
const getTopImages = async (orgId: string, limit: number = 10) => {
  return db
    .select({
      imagePath: imageTransformations.imagePath,
      count: count()
    })
    .from(imageTransformations)
    .where(
      and(
        eq(imageTransformations.organizationId, orgId),
        eq(imageTransformations.cacheHit, false)
      )
    )
    .groupBy(imageTransformations.imagePath)
    .orderBy(desc(count()))
    .limit(limit);
};

// Bandwidth estimado (apenas transformações únicas)
const getEstimatedBandwidth = async (orgId: string, days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select({
      totalBytes: sum(imageTransformations.imageSizeBytes)
    })
    .from(imageTransformations)
    .where(
      and(
        eq(imageTransformations.organizationId, orgId),
        eq(imageTransformations.cacheHit, false),
        gte(imageTransformations.createdAt, startDate)
      )
    );

  return result[0]?.totalBytes || 0;
};

// Custo estimado no CF Images
const getEstimatedCost = async (orgId: string) => {
  const monthStart = new Date();
  monthStart.setDate(1);

  const result = await db
    .select({ count: count() })
    .from(imageTransformations)
    .where(
      and(
        eq(imageTransformations.organizationId, orgId),
        eq(imageTransformations.cacheHit, false),
        gte(imageTransformations.createdAt, monthStart)
      )
    );

  const transformations = result[0]?.count || 0;

  // Cloudflare Images pricing (exemplo)
  // Free: 100k transformações/mês
  // Paid: $5 por 100k transformações adicionais
  const freeQuota = 100_000;
  const costPerExtraTransformation = 0.00005; // $5 / 100k

  if (transformations <= freeQuota) {
    return { cost: 0, transformations, remaining: freeQuota - transformations };
  }

  const extraTransformations = transformations - freeQuota;
  const cost = extraTransformations * costPerExtraTransformation;

  return { cost, transformations, exceeded: extraTransformations };
};
```

## Cloudflare Images Integration

O worker atua como proxy, traduzindo os parâmetros de transformação para a URL do Cloudflare Images.

### Como funciona

1. **Upload para R2**: Imagens originais ficam no R2 (controle total)
2. **Delivery via CF Images**: Worker faz fetch via Cloudflare Images API
3. **Cache em KV**: Resultado em cache para evitar reprocessamento

### Cloudflare Images URL Format

```text
https://imagedelivery.net/{account_hash}/{image_id}/{variant}
```

Onde:
- `account_hash`: Hash da conta Cloudflare (por org)
- `image_id`: Path da imagem (ex: `images/hero.jpg`)
- `variant`: Transformações (ex: `width=800,quality=85,format=webp`)

### Mapeamento de parâmetros

Nossa URL → Cloudflare Images variant:

| Nosso param | CF Images | Descrição |
|-------------|-----------|-----------|
| `w=800` | `width=800` | Largura |
| `h=600` | `height=600` | Altura |
| `q=85` | `quality=85` | Qualidade (1-100) |
| `f=webp` | `format=webp` | Formato (webp, avif, json, jpeg, png) |
| `fit=cover` | `fit=cover` | Modo (scale-down, contain, cover, crop, pad) |
| `blur=20` | `blur=20` | Blur (1-250) |
| `sharpen=1` | `sharpen=1` | Sharpen (0-10) |
| `brightness=0.1` | `brightness=0.1` | Brilho (-1 a 1) |
| `contrast=1.2` | `contrast=1.2` | Contraste (0-2) |
| `gamma=1.2` | `gamma=1.2` | Gamma (0.5-2.2) |
| `gravity=auto` | `gravity=auto` | Ponto focal (auto, left, right, top, bottom, etc) |

### Exemplo de tradução

```typescript
// Nossa URL
/pedrohenri.design/images/hero.jpg?w=800&h=600&fit=cover&q=85&f=webp&s=abc123

// 1. Busca storage de imagens da org
const imageStorage = await getOrgStorage(db, org.id, 'images');
if (!imageStorage) {
  return c.json({ error: 'Image storage not configured' }, 500);
}

// 2. Traduz para CF Images (usa env.CLOUDFLARE_IMAGES_ACCOUNT_HASH)
const variant = 'width=800,height=600,fit=cover,quality=85,format=webp';
const cfImageUrl = `https://imagedelivery.net/${env.CLOUDFLARE_IMAGES_ACCOUNT_HASH}/images/hero.jpg/${variant}`;

// 3. Worker faz fetch, cacheia e retorna
const image = await fetch(cfImageUrl);
await kv.put(cacheKey, await image.arrayBuffer(), { expirationTtl: 86400 });
```

### Flexible Variants (recomendado)

Ao invés de criar variants fixas no Cloudflare Images, usamos **flexible variants** (via URL) para máxima flexibilidade:

```typescript
// Habilitar no CF Images Dashboard:
// Settings → Flexible variants → Enabled
```

Isso permite qualquer combinação de parâmetros na URL sem pré-configuração.

## Dependências internas

- @omero/database
- @omero/schemas

## Variáveis de Ambiente

```env
# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=

# Database (Turso)
DATABASE_URL=
DATABASE_AUTH_TOKEN=

# Workers KV Namespace (binding)
KV=

# R2 Bucket (binding)
R2_BUCKET=
```

## Roadmap

### Fase 1: MVP
- [x] Signed URLs para segurança
- [x] Rate limiting global
- [x] Tracking de transformações
- [x] Cache híbrido (KV + R2)
- [ ] Implementar worker proxy
- [ ] Integração com Cloudflare Images
- [ ] Integração com R2 (originais e cache)

### Fase 2: Analytics
- [ ] Dashboard de uso por org
- [ ] Métricas de cache (KV vs R2 vs CF Images)
- [ ] Top imagens mais processadas
- [ ] Bandwidth tracking
- [ ] API de limpeza de cache R2

### Fase 3: Quotas e Billing
- [ ] Sistema de quotas mensais por org
- [ ] Rate limiting configurável por org
- [ ] Alertas de uso (80%, 90%, 100%)
- [ ] Webhook para limites excedidos
- [ ] Integração com billing
