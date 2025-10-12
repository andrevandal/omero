# Planejamento de Páginas - Omero CMS

> Documento de planejamento para todas as páginas/telas do sistema Omero CMS

## Status das Páginas

### ✅ Páginas Existentes (mas precisam de conteúdo)

- `/app/$orgId/posts` - Lista de posts
- `/app/$orgId/posts/$postId` - Editar post
- `/app/$orgId/posts/new` - Criar novo post
- `/app/$orgId/tags` - Lista de tags
- `/app/$orgId/tags/$tagId` - Editar tag
- `/app/$orgId/medias` - Lista de mídias
- `/app/$orgId/medias/$mediaId` - Detalhes da mídia
- `/app/$orgId/medias/new` - Upload de mídia
- `/app/$orgId/settings` - Configurações
- `/app/$orgId/languages` - Gestão de idiomas

---

## 🏠 HOMEPAGE & DASHBOARD

### `/app/$orgId` - Dashboard Principal

**Prioridade: ALTA**

#### Widgets Analíticos

1. **Overview Cards**
   - Total de Posts (publicados/rascunhos)
   - Total de Tags (ativas/inativas)
   - Total de Mídias + espaço utilizado
   - Total de Idiomas configurados

2. **Gráficos de Tendência**
   - Posts criados nos últimos 30 dias (linha)
   - Distribuição de posts por idioma (pizza)
   - Uploads de mídia por semana (barra)

3. **Atividade Recente**
   - Últimos posts criados/editados
   - Últimas mídias enviadas
   - Últimas tags criadas

4. **Quick Actions**
   - Criar novo post
   - Upload de mídia (dropzone)
   - Criar nova tag
   - Convidar membro

#### Métricas por Entidade

- **Posts**: Total, Por idioma, Por status (draft/published)
- **Tags**: Total, Destacadas, Por idioma
- **Mídias**: Total, Espaço utilizado (MB/GB), Por tipo

---

## 📝 GESTÃO DE CONTEÚDO

### Posts - Melhorias Necessárias

#### `/app/$orgId/posts` - Lista de Posts

- [ ] Filtros: status, idioma, tag, data
- [ ] Busca por título/conteúdo
- [ ] Ações em lote (publicar, arquivar)
- [ ] Preview cards com status visual
- [ ] Ordenação por data, título, views

#### `/app/$orgId/posts/new` & `/app/$orgId/posts/$postId` - Editor

- [ ] Editor rico de conteúdo (markdown/WYSIWYG)
- [ ] SEO fields (meta title, description, OG tags)
- [ ] Custom fields dinâmicos
- [ ] Preview em diferentes idiomas
- [ ] Controle de visibilidade (draft/private/public)
- [ ] Agendamento de publicação
- [ ] Histórico de revisões
- [ ] Associar tags
- [ ] Imagens destacadas

### Tags - Melhorias Necessárias

#### `/app/$orgId/tags` - Lista de Tags

- [ ] Filtros: idioma, status, featured
- [ ] Busca por nome
- [ ] Contador de posts associados
- [ ] Ações em lote
- [ ] Drag & drop para reordenar

#### `/app/$orgId/tags/$tagId` - Editor de Tag

- [ ] SEO fields completos
- [ ] Custom fields
- [ ] Tradução por idioma
- [ ] Posts associados
- [ ] Marcar como featured

### Mídias - Melhorias Necessárias

#### `/app/$orgId/medias` - Biblioteca de Mídia

- [ ] Grid view com thumbnails
- [ ] Filtros: tipo, data, tamanho
- [ ] Busca por nome/alt text
- [ ] Upload drag & drop múltiplo
- [ ] Pastas/categorização
- [ ] Informações de uso (onde está sendo usada)

#### `/app/$orgId/medias/$mediaId` - Detalhes da Mídia

- [ ] Preview completo
- [ ] Edição de metadados (título, alt text)
- [ ] Tags associadas
- [ ] Custom fields
- [ ] Histórico de uso
- [ ] Diferentes tamanhos/crops

---

## 👥 GESTÃO DE USUÁRIOS E ORGANIZAÇÃO

### `/app/$orgId/members` - Gestão de Membros

**Status: NÃO EXISTE - CRIAR**

- [ ] Lista de membros com roles
- [ ] Convidar novos membros
- [ ] Alterar permissões
- [ ] Remover membros
- [ ] Histórico de convites

### `/app/$orgId/invitations` - Convites

**Status: NÃO EXISTE - CRIAR**

- [ ] Convites pendentes
- [ ] Convites aceitos/recusados
- [ ] Reenviar convites
- [ ] Definir role do convite

### `/app/$orgId/organization` - Configurações da Org

**Status: EXPANDIR SETTINGS ATUAL**

- [ ] Informações básicas (nome, logo, slug)
- [ ] Configurações de idiomas
- [ ] Metadados e SEO
- [ ] Configurações de marca
- [ ] Danger zone (deletar org)

---

## 🔧 CONFIGURAÇÕES AVANÇADAS

### `/app/$orgId/custom-fields` - Custom Fields

**Status: NÃO EXISTE - CRIAR**

- [ ] Lista de custom fields por entidade
- [ ] Criar novo field definition
- [ ] Tipos: text, textarea, boolean, number, select, object, list, image
- [ ] Configurar validações
- [ ] Preview nos formulários

### `/app/$orgId/api-keys` - Gestão de API Keys

**Status: NÃO EXISTE - CRIAR**

- [ ] Lista de API keys do usuário
- [ ] Criar nova key com permissões
- [ ] Rate limiting configurável
- [ ] Logs de uso
- [ ] Revogar keys

### `/app/$orgId/languages` - Melhorar Existente

- [ ] Lista de idiomas disponíveis
- [ ] Habilitar/desabilitar por organização
- [ ] Definir idioma padrão
- [ ] Configurações de localização

---

## 👤 PERFIL DO USUÁRIO

### `/profile` - Dados Pessoais

**Status: NÃO EXISTE - CRIAR**

- [ ] Informações pessoais (nome, email, foto)
- [ ] Preferências de idioma
- [ ] Configurações de notificação
- [ ] Alterar senha
- [ ] Conexões OAuth
- [ ] Sessões ativas

### `/profile/organizations` - Minhas Organizações

**Status: NÃO EXISTE - CRIAR**

- [ ] Lista de organizações do usuário
- [ ] Role em cada organização
- [ ] Trocar organização ativa
- [ ] Sair da organização

---

## 🎨 SIDEBAR E NAVEGAÇÃO

### Estrutura da Sidebar

```text
📊 Dashboard
📝 Conteúdo
  ├── Posts
  ├── Tags
  └── Mídia
👥 Equipe
  ├── Membros
  └── Convites
⚙️ Configurações
  ├── Organização
  ├── Idiomas
  ├── Custom Fields
  └── API Keys
👤 Perfil (dropdown no header)
  ├── Meus Dados
  ├── Organizações
  └── Sair
```

---

## 🚀 PRIORIDADES DE IMPLEMENTAÇÃO

### Fase 1 - Core Features (4-6 semanas)

1. **Dashboard com widgets analíticos**
2. **Melhorar editores de Posts/Tags/Mídia**
3. **Sistema de Custom Fields**
4. **Gestão básica de membros**

### Fase 2 - Advanced Features (3-4 semanas)

1. **API Keys com permissões**
2. **Perfil de usuário completo**
3. **Configurações avançadas da organização**
4. **Sistema de convites**

### Fase 3 - Polish & UX (2-3 semanas)

1. **Melhorar busca e filtros**
2. **Ações em lote**
3. **Histórico e audit logs**
4. **Otimizações de performance**

---

## 📊 WIDGETS ANALÍTICOS DETALHADOS

### Cards de Overview

```typescript
interface OverviewCard {
  title: string
  value: number | string
  change: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  icon: string
  href?: string
}
```

### Widgets Específicos

1. **Posts Analytics**
   - Total posts, publicados, rascunhos
   - Posts por idioma
   - Trending posts (mais visualizados)

2. **Media Analytics**
   - Espaço utilizado vs. limite
   - Arquivos por tipo (imagem, vídeo, documento)
   - Uploads por período

3. **Team Analytics**
   - Membros ativos
   - Contribuições por membro
   - Últimas atividades

4. **Performance Metrics**
   - Tempo de carregamento médio
   - API calls por período
   - Rate limit status

---

## 🎯 MÉTRICAS DE SUCESSO

- [ ] Tempo para criar um post completo < 5min
- [ ] Upload de mídia < 10seg para arquivos até 10MB
- [ ] Dashboard carrega em < 2seg
- [ ] 0 cliques perdidos na navegação
- [ ] Onboarding de novos membros < 5min
