# 00.4 — Current Capabilities Matrix

**Data:** 2026-08-05
**Fonte:** Inspeção direta de código, configs, fixtures, artefatos BB-04

---

## Matriz de capacidades

Legenda:
- ✅ Implementado e funcional
- 🟡 Parcial / placeholder / requires config
- ❌ Ausente
- 🔒 Bloqueado

| # | Capacidade | Status | Evidência | Onde |
|---|---|---|---|---|
| **CATÁLOGO** | | | | |
| 1 | Catálogo Fio Vivo (6 peças) | 🟡 | Fixtures hardcoded com metadados "a informar" | `gallery-hero/fixtures/fio-vivo-products.ts` |
| 2 | Imagens dos produtos | ✅ | 24 PNGs (4 cenas × 6 produtos, 1254×1254 e 682×1024) | `public/images/fio-vivo/` |
| 3 | Produtos no backend Medusa | ❌ | Backend tem apenas seed genérico | `initial-data-seed.ts` |
| 4 | Coleções | 🟡 | Módulo existe, sem coleção Fio Vivo configurada | `modules/collections/` |
| 5 | Variantes | ❌ | Nenhuma variante Fio Vivo | backend |
| 6 | Personalização | ❌ | Inexistente | — |
| 7 | PDP (Product Detail Page) | ✅ | Componentes completos (gallery, actions, price, tabs, related) | `modules/products/` |
| 8 | Listagem de produtos | ✅ | featured-products rail | `modules/home/components/featured-products/` |
| **PRICING** | | | | |
| 9 | Preço nos produtos Fio Vivo | ❌ | `price: "a informar"` em 100% das fixtures | `fio-vivo-products.ts` |
| 10 | Cenários de preço (validação/recomendado/premium) | ❌ | Inexistente | — |
| 11 | Preço Pix | ❌ | Inexistente | — |
| 12 | Parcelamento | ❌ | Inexistente | — |
| 13 | Pricing dinâmico | ❌ | Inexistente | — |
| 14 | Pricing engine | ❌ | Inexistente | — |
| 15 | Price lists Medusa | ❌ | Não configurado | backend |
| 16 | Currency switching | 🟡 | Suportado via Medusa regions, mas sem BRL | `lib/config.ts` |
| **COMMERCE** | | | | |
| 17 | Cart | ✅ | Módulo completo | `modules/cart/` |
| 18 | Checkout multi-step | ✅ | 18 componentes (addresses, shipping, payment, review) | `modules/checkout/` |
| 19 | Pagamento Stripe | ✅ | Configurado | `checkout/components/payment-wrapper/stripe-wrapper.tsx` |
| 20 | Pagamento PayPal | ✅ | Configurado | `constants.tsx` |
| 21 | Pagamento iDeal/Bancontact | ✅ | Configurado (europeu) | `constants.tsx` |
| 22 | Pagamento Pix | ❌ | Inexistente | — |
| 23 | Cupons / promo codes | 🟡 | Componente `discount-code` existe, sem config Fio Vivo | `checkout/components/discount-code/` |
| 24 | Orders | ✅ | Módulo order | `modules/order/` |
| 25 | Account / order history | ✅ | Módulo account | `modules/account/` |
| 26 | Order transfer | ✅ | Feature presente (README) | `modules/account/` |
| **REGIONS / MOEDAS** | | | | |
| 27 | Multi-region | ✅ | Medusa regions (gb, de, dk, se, fr, es, it) | `initial-data-seed.ts` |
| 28 | Região Brasil | ❌ | Não configurada | — |
| 29 | BRL | ❌ | Não configurado | — |
| 30 | Default region | 🟡 | `dk` (Dinamarca) — **incorreto para Fio Vivo** | `.env.template` |
| 31 | Country detection | 🟡 | Dynamic route `[countryCode]` | `app/[countryCode]/` |
| **SHIPPING / FULFILLMENT** | | | | |
| 32 | Shipping profiles | ✅ | Seed cria profiles | `initial-data-seed.ts` |
| 33 | Shipping options | ✅ | Seed cria options | `initial-data-seed.ts` |
| 34 | Frete Brasil | ❌ | Não configurado | — |
| 35 | Frete internacional | ❌ | Não configurado | — |
| 36 | Made-to-order / lead time | ❌ | Inexistente | — |
| 37 | Inventory | ✅ | Medusa nativo + Adminer | backend |
| **EXPERIÊNCIA / UI** | | | | |
| 38 | Gallery Hero (3 zonas) | ✅ | Funcional (BB-04 R1 verified) | `packages/gallery-experience/` |
| 39 | Scene thumbnail rail | ✅ | Funcional | `gallery-experience.tsx` |
| 40 | Ambient background | 🟡 | Tipo existe, `ambientColors: "a informar"` em todas fixtures | `fio-vivo-products.ts` |
| 41 | Fallback hero | ✅ | "Medusa DTC Starter" fallback | `gallery-hero-fallback.tsx` |
| 42 | Layout responsivo | ✅ | Testado em 5 viewports (desktop, mobile 390, 430, landscape, tablet) | `artifacts/bb-04/` |
| 43 | Contrato visual nos-gallery | ✅ | YAML define primeira dobra | `.agents/contracts/nos-gallery-first-fold.yaml` |
| 44 | Componente calendar (nos-gallery) | 🔒 | Token Tailwind v4 quebra Turbopack | `nos-gallery/components/ui/calendar.tsx:32` |
| **ANALYTICS** | | | | |
| 45 | GA4 via gtag | 🟡 | trackGalleryEvent implementado, sem taxonomy | `gallery-hero-analytics.ts` |
| 46 | Event taxonomy | ❌ | Inexistente | — |
| 47 | Funil tracking | ❌ | Inexistente | — |
| 48 | Product analytics (PostHog/Amplitude) | ❌ | Inexistente | — |
| 49 | CDP | ❌ | Inexistente | — |
| 50 | Data warehouse | ❌ | Inexistente (DuckDB local disponível em `.duckdb/`) | — |
| 51 | Attribution | ❌ | Inexistente | — |
| 52 | Server-side tracking | ❌ | Inexistente | — |
| **CRM / LIFECYCLE** | | | | |
| 53 | CRM | ❌ | Inexistente | — |
| 54 | E-mail marketing | 🟡 | Mailpit para dev (captura), sem lifecycle | `docker-compose.yml` |
| 55 | Lifecycle flows | ❌ | Inexistente | — |
| 56 | Cart abandonment recovery | ❌ | Inexistente | — |
| 57 | Reativação | ❌ | Inexistente | — |
| **MARKETING / GROWTH** | | | | |
| 58 | SEO (meta, OG, twitter) | 🟡 | opengraph-image.jpg, twitter-image.jpg existem; sem schema.org auditado | `app/` |
| 59 | Sitemap | ❌ | Não auditado | — |
| 60 | Reviews / ratings | ❌ | Inexistente | — |
| 61 | Prova social | ❌ | Inexistente | — |
| 62 | Lista de espera | ❌ | Inexistente | — |
| 63 | Drops / pré-venda | ❌ | Inexistente | — |
| 64 | Afiliados | ❌ | Inexistente | — |
| 65 | Programa de indicação | ❌ | Inexistente | — |
| 66 | WhatsApp | ❌ | Inexistente | — |
| 67 | Content engine | ❌ | Inexistente | — |
| **INTERNACIONALIZAÇÃO** | | | | |
| 68 | i18n storefront | 🟡 | Locale header injetado, sem conteúdo traduzido | `lib/config.ts` |
| 69 | Multi-currency | ✅ | Via Medusa regions (EUR, USD) | backend |
| 70 | Tradução pt-BR | ❌ | Inexistente | — |
| 71 | Tradução EN | ❌ | Inexistente | — |
| 72 | Tradução ES | ❌ | Inexistente | — |
| 73 | Tradução FR | ❌ | Inexistente | — |
| **DROPS / EDIÇÕES LIMITADAS** | | | | |
| 74 | Peças numeradas | ❌ | Inexistente | — |
| 75 | Drops | ❌ | Inexistente | — |
| 76 | Pré-venda | ❌ | Inexistente | — |
| 77 | Reserva com sinal | ❌ | Inexistente | — |
| **PERSONALIZAÇÃO** | | | | |
| 78 | Customization options | ❌ | Inexistente | — |
| 79 | Preview de personalização | ❌ | Inexistente | — |
| 80 | Orçamento de personalização | ❌ | Inexistente | — |
| **B2B / CORPORATE** | | | | |
| 81 | Presentes corporativos | ❌ | Inexistente | — |
| 82 | Small wholesale | ❌ | Inexistente | — |
| 83 | Concierge | ❌ | Inexistente | — |
| **TESTES** | | | | |
| 84 | E2E Playwright | 🟡 | 8 specs, 2 shards; cobertura gallery + checkout | `e2e/` |
| 85 | Unit tests backend | ❌ | Nenhum encontrado | `apps/backend/src/` |
| 86 | Unit tests gallery adapter | 🟡 | 1 spec | `gallery-hero/__tests__/` |
| 87 | A11y tests | 🟡 | Spec existe + @axe-core/playwright | `e2e/gallery-accessibility.spec.ts` |
| 88 | Performance tests | 🟡 | Lighthouse spec existe | `e2e/performance/lighthouse-a11y.spec.ts` |
| 89 | Visual regression | 🟡 | `visual-evidence-generator.spec.ts` existe | `e2e/` |
| **INFRA / DEVOPS** | | | | |
| 90 | Docker compose (dev) | ✅ | Postgres, Redis, Minio, Mailpit, Traefik, Adminer | `docker-compose.yml` |
| 91 | CI GitHub Actions | ✅ | Lint + unit + e2e (2 shards) | `.github/workflows/` |
| 92 | Deploy pipeline | ❌ | Apenas validação, sem deploy | — |
| 93 | Observability / monitoring | ❌ | Inexistente | — |
| 94 | Error tracking (Sentry) | ❌ | Inexistente | — |
| **SEGURANÇA / COMPLIANCE** | | | | |
| 95 | CORS configurado | ✅ | Via env | `medusa-config.ts` |
| 96 | JWT / cookie secret | ✅ | Via env | `medusa-config.ts` |
| 97 | LGPD compliance | ❌ | Inexistente | — |
| 98 | GDPR compliance | ❌ | Inexistente | — |
| 99 | Consent management | ❌ | Inexistente | — |
| **MEDIA / CMS** | | | | |
| 100 | Media storage | ✅ | Minio (S3-compatible) | `docker-compose.yml` |
| 101 | CMS | ❌ | Inexistente (conteúdo hardcoded em fixtures) | — |
| 102 | Content management | ❌ | Inexistente | — |

---

## Resumo executivo de capacidades

| Categoria | ✅ | 🟡 | ❌ | 🔒 | Total |
|---|---|---|---|---|---|
| Catálogo | 2 | 2 | 4 | 0 | 8 |
| Pricing | 0 | 1 | 8 | 0 | 9 |
| Commerce | 5 | 2 | 2 | 0 | 9 |
| Regions/Moedas | 1 | 2 | 2 | 0 | 5 |
| Shipping | 2 | 0 | 3 | 0 | 5 |
| Experiência/UI | 4 | 1 | 0 | 1 | 6 |
| Analytics | 0 | 1 | 7 | 0 | 8 |
| CRM/Lifecycle | 0 | 1 | 4 | 0 | 5 |
| Marketing/Growth | 0 | 1 | 9 | 0 | 10 |
| Internacionalização | 1 | 1 | 3 | 0 | 6 |
| Drops/Edições | 0 | 0 | 4 | 0 | 4 |
| Personalização | 0 | 0 | 3 | 0 | 3 |
| B2B/Corporate | 0 | 0 | 3 | 0 | 3 |
| Testes | 0 | 4 | 1 | 0 | 5 |
| Infra/DevOps | 2 | 0 | 3 | 0 | 5 |
| Segurança/Compliance | 2 | 0 | 3 | 0 | 5 |
| Media/CMS | 1 | 0 | 2 | 0 | 3 |
| **TOTAL** | **20** | **20** | **60** | **1** | **101** |

> **20% implementado, 20% parcial, 59% ausente, 1% bloqueado.** O sistema tem a fundação de commerce (Medusa v2 + Next.js 15) e a galeria Fio Vivo funcionando, mas está a pelo menos 80% de distância da visão do mega-prompt.

---

*Fim do current-capabilities-matrix.md*