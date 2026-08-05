# 05.1 — Target Architecture

**Data:** 2026-08-05
**Escopo:** Arquitetura técnica-alvo Fio Vivo sobre Medusa v2 + Next.js 15

---

## 1. Princípios arquiteturais

| # | Princípio | Racional |
|---|---|---|
| 1 | Reusar capacidades nativas do Medusa v2 antes de construir | Price lists, regions, currencies, promotions são nativos |
| 2 | Business logic em workflows, não em routes | Convenção AGENTS.md |
| 3 | Extender sobre construir paralelo | Se price lists suporta cenários, não criar pricing DB separado |
| 4 | Storefront consome Medusa SDK, não acessa DB direto | Convenção AGENTS.md |
| 5 | Feature flags para qualquer mudança reversível | Princípio 17 (rollback) |
| 6 | Observabilidade desde o dia 0 | Não lançar sem telemetria |
| 7 | Internacionalização como cidadão de primeira classe | Multi-region é nativo do Medusa |
| 8 | Não inventar entidades que o commerce engine já oferece | Product, Variant, Collection são Medusa nativos |

---

## 2. Arquitetura-alvo (alto nível)

```text
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTES                                      │
│  BR (pt-BR, BRL)  |  EN (en-US, USD)  |  ES (es-ES, EUR)  |  FR       │
└───────────┬─────────────────────────────────────────────────────────┘
            │
┌───────────▼─────────┐     ┌──────────────────────┐
│  Storefront           │     │  Admin Medusa         │
│  Next.js 15           │     │  (medusa /app)        │
│  - App Router         │     │  - Catálogo           │
│  - [countryCode]      │     │  - Pricing            │
│  - i18n routing       │     │  - Orders             │
│  - Tailwind 3         │     │  - Customers          │
│  - Gallery experience │     │  - Promotions         │
│  - PDP enhanced       │     │  - Regions            │
│  - Checkout (Pix+)    │     │  - Custom modules     │
└───────────┬──────────┘     └──────────┬───────────┘
            │                            │
            │  Store API (publishable)  │  Admin API
            └────────────┬───────────────┘
                         │
            ┌────────────▼───────────────┐
            │     MEUDSA v2 BACKEND       │
            │  @dtc/backend (apps/backend)│
            │                             │
            │  Módulos nativos:            │
            │  - Product, Variant          │
            │  - Collection                │
            │  - Price List (cenários)     │
            │  - Region (BR, US, EU...)     │
            │  - Currency (BRL, USD, EUR)  │
            │  - Promotion (cupom, pix)    │
            │  - Tax, Shipping, Fulfillment │
            │  - Customer, Order           │
            │  - Inventory                 │
            │  - Sales Channel             │
            │  - API Key (publishable)     │
            │                             │
            │  Módulos custom (novos):      │
            │  - fio-vivo-catalog          │
            │  - pricing-engine            │
            │  - artwork-identity          │
            │  - waiting-list              │
            │  - drop-manager              │
            │  - customization             │
            │  - reviews-verified          │
            │  - affiliate                 │
            │  - holiday-calendar          │
            └────────────┬───────────────┘
                         │
        ┌────────────────┼────────────────────┐
        │                │                    │
┌───────▼───┐   ┌───────▼───┐   ┌──────────▼────────┐
│ Postgres  │   │  Redis    │   │  Minio (S3)        │
│  15       │   │  Cache    │   │  Media storage     │
└───────────┘   └──────────┘   └────────────────────┘

┌──────────────────────────────────────────────────────┐
│              ANALYTICS & GROWTH                       │
│  GA4 (gtag) → PostHog/GA4 → Data Warehouse           │
│  Event taxonomy → CDP → CRM → Lifecycle automation   │
└──────────────────────────────────────────────────────┘
```

---

## 3. Módulos Medusa v2 — priorização de extensão

### 3.1 O que o Medusa v2 já oferece (não duplicar)

| Entidade | Nativo? | Como usar para Fio Vivo |
|---|---|---|
| Product | ✅ | Cadastrar 6+ peças Fio Vivo |
| ProductVariant | ✅ | Variações de cor, tamanho, acabamento |
| Collection | ✅ | Coleção "Duna", "Trança", etc. |
| PriceList | ✅ | Cenários (validação, recomendado, premium) |
| Region | ✅ | BR (BRL), US (USD), EU (EUR) |
| Currency | ✅ | BRL, USD, EUR |
| Promotion | ✅ | Cupom, Pix discount, frete grátis |
| TaxRate | ✅ | Impostos por região |
| ShippingProfile | ✅ | BR, internacional |
| Fulfillment | ✅ | Made-to-order lead time |
| Inventory | ✅ | Estoque por stock location |
| Customer | ✅ | Account, addresses, orders |
| Order | ✅ | Order management |
| SalesChannel | ✅ | DTC, B2B |
| PublishableAPIKey | ✅ | Por canal |
| Module Link | ✅ | Linkar custom modules a products |

### 3.2 Módulos custom a criar (apenas o que não é nativo)

| Módulo | Função | Prioridade | Complexidade |
|---|---|---|---|
| `fio-vivo-catalog` | Metadados artesanais (materiais, técnicas, complexidade, tempo de produção) | P0 | Média |
| `pricing-engine` | Cálculo dinâmico (multiplicadores, demanda, capacidade) | P1 | Alta |
| `artwork-identity` | Peças numeradas, série, certificado | P1 | Média |
| `waiting-list` | Lista de espera genuína | P1 | Baixa |
| `drop-manager` | Drops, pré-venda, reserva com sinal | P2 | Média |
| `customization` | Opções de personalização (cor, alça, acabamento) | P2 | Alta |
| `reviews-verified` | Reviews apenas de compradores verificados | P2 | Média |
| `affiliate` | Programa de afiliados com atribuição | P2 | Média |
| `holiday-calendar` | Calendário comercial versionado | P2 | Baixa |
| `experiment` | Registro de experimentos de pricing/UX | P3 | Baixa |

### 3.3 Module links

| Link | De | Para | Tipo |
|---|---|---|---|
| Product → ArtworkIdentity | Product | artwork-identity | 1:1 |
| ProductVariant → CustomizationOption | ProductVariant | customization | 1:N |
| Product → WaitingListEntry | Product | waiting-list | 1:N |
| Product → DropEntry | Product | drop-manager | M:N |
| Product → PricingScenario | PriceList | pricing-engine | 1:1 (extend) |
| Customer → AffiliateAttribution | Customer | affiliate | 1:1 |
| Order → ReviewVerified | Order | reviews-verified | 1:1 |

---

## 4. Storefront — evolução

### 4.1 Migração de fixtures para Medusa

```text
HOJE:
  GalleryHeroClient → fioVivoProducts (hardcoded) → GalleryExperience

ALVO:
  GalleryHero (server) → fetchGalleryHeroProducts(countryCode)
    → Medusa Store API /products?countryCode=br
    → mapStoreProductsToGalleryItems (adapter existente)
    → GalleryHeroClient → GalleryExperience
```

> O adapter já existe (`medusa-adapter.ts`). O override BB-03 deve ser removido quando produtos estiverem no backend.

### 4.2 PDP enhancement

| Seção | Implementação |
|---|---|
| Above-fold | Preço, prazo, disponibilidade, CTA, variante, personalização |
| Gallery 360° | Plugin ou sequência de imagens orbitais |
| Vídeo de processo | Mídia vinculada ao produto (Medusa media) |
| História da peça | Metadata extendida (fio-vivo-catalog) |
| Materiais | Metadata extendida |
| Dimensões | Metadata extendida + tabela visual |
| Capacidade | Metadata (foto com objetos de referência) |
| Cuidados | Metadata extendida |
| Reviews verificadas | reviews-verified module + widget |
| Related products | Cross-sell (Medusa related + custom logic) |
| Lista de espera | waiting-list module + form inline |
| Mesma coleção | Collection query |

### 4.3 Checkout enhancement

| Item | Implementação |
|---|---|
| Pix | Provider de pagamento (Stripe BR ou Mercado Pago) |
| Boleto | Provider (opcional) |
| Frete BR | Shipping options por região BR |
| Embalagem presente | Gift option (add-on no cart) |
| Cartão personalizado | Add-on no cart |
| Prazo de produção visível | Display no checkout |
| Price lock | Preservar preço por janela (sessão) |

### 4.4 i18n

| Camada | Implementação |
|---|---|
| Roteamento | `/[countryCode]/...` (já existe) |
| Locale | pt-BR, en-US, es-ES, fr-FR |
| Tradução conteúdo | Metadata por locale no Medusa (product title, description por locale) |
| UI strings | next-intl ou equivalente |
| Moeda | Region-based (BRL, USD, EUR) |
| Format | date, number, currency por locale |

---

## 5. Pricing engine — arquitetura técnica

### 5.1 Localização

| Opção | Pros | Contras | Recomendado? |
|---|---|---|---|
| Custom module Medusa | Integrado, usa module links, workflows | Complexidade Medusa module | ✅ Sim |
| API route standalone | Simples | Sem acesso a context Medusa | Não |
| Edge function | Rápido | Sem DB access | Não |
| Storefront-only | Simples | Inseguro (client-side) | Não |

### 5.2 Design do módulo pricing-engine

```text
apps/backend/src/modules/pricing-engine/
├── index.ts              # Module definition
├── service.ts            # calculatePrice(productId, context)
├── models/
│   ├── pricing-scenario.ts    # Validação/Recomendado/Premium
│   ├── pricing-rule.ts        # Regras de multiplicador
│   └── price-history.ts       # Histórico de mudanças
├── migrations/
│   └── *.ts
└── __tests__/
    └── service.unit.spec.ts
```

### 5.3 Workflow de pricing

```text
calculate-dynamic-price workflow:
  Step 1: get base price (price list do cenário ativo)
  Step 2: get cost data (fio-vivo-catalog)
  Step 3: calculate floor price
  Step 4: get demand index (consultas, reservas, pedidos)
  Step 5: get capacity (production capacity)
  Step 6: apply multipliers
  Step 7: apply incentives (pix discount, cupom)
  Step 8: clamp to floor
  Step 9: log to price-history
  Step 10: return final price + breakdown
```

### 5.4 API endpoint

```typescript
// src/api/store/products/[id]/dynamic-price/route.ts
export async function GET(req, res) {
  const { id } = req.params
  const context = {
    countryCode: req.query.country_code,
    scenario: req.query.scenario, // validation|recommended|premium
    couponCode: req.query.coupon,
    isPix: req.query.pix === "true",
  }
  const result = await calculateDynamicPriceWorkflow(container).run({
    input: { productId: id, context }
  })
  res.json(result)
}
```

---

## 6. Analytics — arquitetura

### 6.1 Stack recomendada

| Camada | Ferramenta | Prioridade |
|---|---|---|
| Product analytics | GA4 (existente) → PostHog (P1) | P0 (GA4) → P1 (PostHog) |
| Event tracking | gtag (existente) → PostHog SDK | P0 → P1 |
| Data warehouse | DuckDB (local disponível) ou BigQuery | P2 |
| CRM | Medusa Customer + custom fields | P0 |
| Lifecycle | E-mail via Medusa + Mailchimp/Brevo | P1 |
| Attribution | GA4 + UTM | P0 |
| Error tracking | Sentry | P1 |
| Observability | OpenTelemetry + Medusa logs | P2 |

### 6.2 Event taxonomy (resumo — ver 07-analytics/event-taxonomy.md)

Eventos rastrear de P0:
- `product_list_viewed`, `product_viewed`, `product_media_viewed`
- `product_added_to_cart`, `checkout_started`, `order_completed`
- `coupon_applied`, `coupon_rejected`

P1:
- `product_saved`, `waitlist_joined`, `personalization_started`
- `review_requested`, `review_submitted`, `referral_shared`
- `drop_viewed`, `drop_reserved`, `gift_option_added`

---

## 7. Segurança e compliance

| Item | Implementação | Prioridade |
|---|---|---|
| CORS | Configurado via env (existente) | ✅ |
| JWT/Cookie secret | Via env (existente) | ✅ |
| LGPD | Consent management + privacy policy | P1 |
| GDPR | Cookie banner + data export | P1 (se EU) |
| Fraud prevention | Medusa nativo + regras custom | P2 |
| Rate limiting | Medusa nativo + middleware | P2 |
| Audit log | price-history, order log | P1 |
| Backup | Automated pg_dump ou Medusa Cloud | P1 |

---

## 8. Deployment

| Ambiente | Plataforma | Status |
|---|---|---|
| Dev local | Docker compose (Postgres, Redis, Minio, Mailpit) | ✅ |
| CI | GitHub Actions (lint + unit + e2e) | ✅ |
| Staging | A configurar (Vercel preview + Medusa Cloud staging) | P1 |
| Production | Vercel (storefront) + Medusa Cloud (backend) | P1 |
| DB prod | Managed Postgres (Medusa Cloud ou RDS) | P1 |
| Media prod | S3 (AWS) ou Minio prod | P1 |
| CDN | Vercel Edge (storefront) | P1 |

---

## 9. Integrações de terceiros

| Integração | Função | Prioridade | Status |
|---|---|---|---|
| Stripe | Pagamento internacional | P0 | ✅ Configurado |
| Mercado Pago (ou Stripe BR) | Pix, boleto, cartão BR | P0 | ❌ Pendente |
| Correios/Melhor Envio | Frete BR | P1 | ❌ Pendente |
| WhatsApp Business API | Atendimento | P0 | ❌ Pendente |
| GA4 | Analytics | P0 | 🟡 Parcial |
| PostHog | Product analytics | P1 | ❌ Pendente |
| Sentry | Error tracking | P1 | ❌ Pendente |
| Brevo/Mailchimp | E-mail marketing | P1 | ❌ Pendente |
| Instagram Shopping | Catálogo social | P2 | ❌ Pendente |
| Pinterest Tag | Tracking Pinterest | P2 | ❌ Pendente |
| Google Shopping | Feed | P2 | ❌ Pendente |

---

## 10. Feature flags

| Flag | Default | Função |
|---|---|---|
| `NEXT_PUBLIC_GALLERY_HERO_ENABLED` | false → true | Liga galeria (existente) |
| `NEXT_PUBLIC_GALLERY_HEADER_MODE` | commerce-bar | Modo header (existente) |
| `NEXT_PUBLIC_PRICING_ENGINE_ENABLED` | false | Liga pricing dinâmico |
| `NEXT_PUBLIC_PIX_ENABLED` | false | Liga Pix no checkout |
| `NEXT_PUBLIC_WAITLIST_ENABLED` | false | Liga lista de espera |
| `NEXT_PUBLIC_CUSTOMIZATION_ENABLED` | false | Liga personalização |
| `NEXT_PUBLIC_DROPS_ENABLED` | false | Liga drops |
| `NEXT_PUBLIC_REVIEWS_ENABLED` | false | Liga reviews |
| `NEXT_PUBLIC_INTERNATIONAL_ENABLED` | false | Liga mercados internacionais |
| `NEXT_PUBLIC_ANALYTICS_V2_ENABLED` | false | Liga PostHog |

---

*Fim do target-architecture.md*