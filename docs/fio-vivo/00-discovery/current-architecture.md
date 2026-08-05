# 00.3 — Current Architecture

**Data:** 2026-08-05
**Fonte:** Inspeção de código, configs, package.json, AGENTS.md

---

## 1. Visão geral

```text
┌───────────────────────────────────────────────────────────────┐
│                    TURBOREPO MONOREPO (pnpm)                    │
│                                                                │
│  ┌─────────────────────┐       ┌────────────────────────────┐  │
│  │   apps/backend       │       │   apps/storefront           │  │
│  │   Medusa v2.18       │◄──────│   Next.js 15.5 + React 19   │  │
│  │   PostgreSQL 15      │  SDK  │   Tailwind 3 (com v4 leak)  │  │
│  │   Redis + Minio      │       │   Turbopack dev              │  │
│  └─────────────────────┘       └────────────┬───────────────┘  │
│                                               │                 │
│                               ┌──────────────▼──────────────┐  │
│                               │  packages/gallery-experience│  │
│                               │  @dtc/gallery-experience     │  │
│                               │  Componente Fio Vivo         │  │
│                               └─────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

---

## 2. Backend — Medusa v2 (`@dtc/backend`)

### 2.1 Configuração (`medusa-config.ts`)

```typescript
defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors, adminCors, authCors,  // via env
      jwtSecret, cookieSecret,         // via env
    }
  }
})
```

**Módulos custom:** nenhum.
**Plugins:** nenhum declarado no config.
**Links:** nenhum.

### 2.2 API routes

| Rota | Método | Implementação |
|---|---|---|
| `/store/custom` | GET | `res.sendStatus(200)` — placeholder |
| `/admin/custom` | GET | `res.sendStatus(200)` — placeholder |

### 2.3 Seed (`initial-data-seed.ts`)

O seed cria:
- 1 Sales Channel ("Default Sales Channel")
- 1 Publishable API Key
- 1 Store (moedas: EUR default, USD)
- Regiões para países: `gb, de, dk, se, fr, es, it` (7 países europeus)
- Shipping profiles, shipping options
- Tax regions
- Stock location
- Categorias de produto, opções
- Produtos seed do starter Medusa (não Fio Vivo)

> ⚠️ **Sem região Brasil.** Sem BRL. Sem produtos Fio Vivo no backend.

### 2.4 Workflows / Subscribers / Jobs

Todos os diretórios contêm apenas `README.md` de scaffold. **Nenhuma lógica de negócio customizada no backend.**

---

## 3. Storefront — Next.js 15 (`@dtc/storefront`)

### 3.1 Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15.5.21 (App Router, dynamic route `[countryCode]`) |
| React | 19.0.5 |
| Styling | Tailwind 3.0.23 + `tailwindcss-radix` + CSS modules |
| SDK | `@medusajs/js-sdk` 2.18.0 (com fetch interceptor para locale header) |
| Payments | Stripe, PayPal, iDeal, Bancontact |
| Outros | Headless UI, Radix UI, lodash, qs, react-country-flag |
| Dev | `next dev --turbopack -p 8000` |

### 3.2 Roteamento

```text
src/app/[countryCode]/
├── layout.tsx
├── page.tsx (home)
├── products/[id]/page.tsx
├── collections/...
├── categories/...
├── cart/...
├── checkout/...
├── account/...
└── order/...
```

A rota base é `/{countryCode}` — ex: `/dk`, `/br`, `/us`. O `countryCode` determina região, moeda e catálogo via Medusa.

### 3.3 SDK config (`lib/config.ts`)

```typescript
sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,     // default http://localhost:9000
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
})
```

Fetch interceptor injeta `x-medusa-locale` header.

### 3.4 Módulos

| Módulo | Função | Estado |
|---|---|---|
| `home/hero` | Hero nativo do starter | Funcional |
| `home/featured-products` | Product rail | Funcional |
| `home/gallery-hero` | **Galeria Fio Vivo** | Ativo via feature flag |
| `products` | PDP completa (gallery, actions, price, tabs, related) | Funcional (consome Medusa) |
| `cart` | Cart | Funcional |
| `checkout` | Checkout multi-step (shipping, payment, review) | Funcional (Stripe/PayPal/iDeal/Bancontact) |
| `account` | Account, order history, addresses | Funcional |
| `order` | Order confirmation, transfer | Funcional |
| `collections` | Collections listing/detail | Funcional |
| `categories` | Categories | Funcional |
| `nos-gallery` | UI components (calendar, etc) | **Contém bloqueador Tailwind v4** |
| `layout` | Header, footer, nav | Funcional |
| `common` | UI primitives | Funcional |

### 3.5 Gallery Hero (Fio Vivo) — fluxo

```text
index.tsx (server component)
  │
  ├── isGalleryHeroEnabled()?  ── false ──► GalleryHeroFallback
  │                                  ("Medusa DTC Starter")
  │
  ├── fetchGalleryHeroProducts(countryCode)
  │   └── listProducts() via Medusa SDK
  │
  ├── mapStoreProductsToGalleryItems()
  │
  └── GalleryHeroClient (client component)
       │
       ├── BB-03 override: ignora items, usa fixtures hardcoded
       │   fioVivoProducts.map(p => GalleryItem)
       │
       └── GalleryExperience
            ├── Active card (item[0])
            ├── Adjacent card (item[1])
            ├── Continuation fragment (item[2])
            ├── Scene thumbnail rail (3 thumbnails)
            ├── Navigation dots (6 dots)
            ├── CTA "Conhecer a peça"
            └── Counter "01 / 06"
```

> ⚠️ **Crítico:** `GalleryHeroClient` recebe `items` como prop mas **ignora** e usa fixtures hardcoded (`fioVivoProducts`). Isto é um override BB-03 temporário. O adapter Medusa existe mas não é usado no client.

### 3.6 Feature flags

| Flag | Default | Efeito |
|---|---|---|
| `NEXT_PUBLIC_GALLERY_HERO_ENABLED` | `"true"` habilita; caso contrário fallback | Liga/desliga galeria Fio Vivo |
| `NEXT_PUBLIC_GALLERY_HEADER_MODE` | `"commerce-bar"` | `"immersive-overlay"` alterna modo header |

---

## 4. Package gallery-experience

### 4.1 Tipos (`types/index.ts`)

```typescript
GalleryItem {
  id, handle, title,
  primaryImage: { url, alt, width, height },
  scenes: GalleryScene[],
  availability, productUrl, ambientColors?
}

GalleryScene {
  id, image: { url, alt, width, height }, label
}
```

### 4.2 Componentes

| Componente | Função |
|---|---|
| `gallery-experience.tsx` | Orquestra layout 3 zonas (active/adjacent/continuation), scene rail, nav, CTA |
| `artwork-card.tsx` | Card individual de obra |
| `gallery-ambient.tsx` | Background dinâmico com cores ambient |

### 4.3 Adapter

`map-store-product-to-gallery-item.ts` converte `HttpTypes.StoreProduct` → `GalleryItem`.

### 4.4 CSS

`gallery-experience.css` — BEM, classes `dtc-gallery__*`. Modificado em BB-04 R1 (reescrita de seletores).

---

## 5. Contrato visual (`.agents/contracts/nos-gallery-first-fold.yaml`)

| Requisito | Valor |
|---|---|
| Viewport de referência | 1600×960 |
| Layout | 3 zonas assimétricas (active center-dominant, adjacent partial) |
| Coluna editorial esquerda | Obrigatória |
| Card ativo dominante | Obrigatório |
| Card adjacente parcialmente visível | Obrigatório |
| Ratio active→adjacent (min) | 1.30 |
| Scene thumbnail rail integrado | Obrigatório |
| Background dinâmico ambient | Obrigatório |
| Grain layer | Obrigatório |
| Vignette layer | Obrigatório |
| Paleta | Copper / Umber / Linen |
| Navegação inferior centralizada | Obrigatória |
| CTA comercial inferior direita | Obrigatório |
| Header Medusa preservado | Obrigatório |
| Aprovação visual humana | Obrigatória |
| Baseline Playwright | Obrigatório |
| Max diff pixel ratio | 0.05 |

| Proibido |
|---|
| Grid de produtos igual-width |
| Paleta SaaS genérica azul |
| Rounded-pill em tudo |
| Scene buttons fora do active card |
| Header commerce duplicado |
| Brain paths hardcoded |
| Keyboard listener global sem focus scope |

---

## 6. Infraestrutura local (docker-compose)

```text
┌──────────────┐     ┌──────────────────┐
│   Traefik    │────►│  dtc-postgres    │ :5432
│  :8082/:8088 │     │  (Postgres 15)   │
└──────┬───────┘     └──────────────────┘
       │             ┌──────────────────┐
       ├────────────►│  dtc-redis       │
       │             └──────────────────┘
       │             ┌──────────────────┐
       ├────────────►│  dtc-minio       │ (S3 storage)
       │             └──────────────────┘
       │             ┌──────────────────┐
       └────────────►│  dtc-mailpit     │ (email dev)
                     └──────────────────┘
┌──────────────────┐
│  dtc-db-dashboard│ :8081 (Adminer)
│   (Adminer)      │
└──────────────────┘
```

---

## 7. Analytics

| Camada | Implementação |
|---|---|
| Coleta | `trackGalleryEvent` → `window.gtag` (GA4) |
| Eventos | `product_id`, `product_handle`, `index`, `scene_id`, `locale`, `timestamp` |
| Destino | GA4 via gtag |

> **Lacunas:** sem event taxonomy estruturada, sem funnel tracking, sem CDP, sem data warehouse, sem product analytics (Amplitude/Mixpanel/PostHog), sem attribution, sem server-side tracking.

---

## 8. Fluxos que funcionam end-to-end

| Fluxo | Estado | Evidência |
|---|---|---|
| Storefront renderiza home em `/dk` | ✅ Funcional (webpack mode) | HTTP 200 confirmado em BB-04 R1 |
| Gallery Hero renderiza 6 produtos Fio Vivo | ✅ Funcional (com feature flag) | Runtime measurements R1 |
| Navegação entre produtos na galeria | ✅ Funcional | 6 dots, scene rail |
| Checkout com Stripe/PayPal | ✅ Configurado (não testado nesta sessão) | Componentes presentes |
| Account, order history | ✅ Presente (não testado) | Módulos completos |
| Backend Medusa admin em `/app` | ✅ Funcional | Gate 4 report |

## 9. Fluxos que NÃO funcionam ou estão ausentes

| Fluxo | Estado |
|---|---|
| Turbopack dev (dev script default) | ❌ Bloqueado por `--spacing()` em calendar.tsx |
| Produtos Fio Vivo no backend Medusa | ❌ Não cadastrados |
| Região Brasil / BRL | ❌ Não configurada |
| Pricing dinâmico | ❌ Inexistente |
| Personalização | ❌ Inexistente |
| Lista de espera | ❌ Inexistente |
| Drops / pré-venda | ❌ Inexistente |
| Reviews verificadas | ❌ Inexistente |
| Afiliados | ❌ Inexistente |
| Internacionalização (i18n conteúdo) | ❌ Inexistente (apenas locale header) |
| Event taxonomy estruturada | ❌ Inexistente |
| CRM / lifecycle marketing | ❌ Inexistente |
| SEO estruturado (schema.org, breadcrumbs) | ❌ Não auditado |
| Feature flags系统 além de 2 flags | ❌ Mínimo |

---

*Fim do current-architecture.md*