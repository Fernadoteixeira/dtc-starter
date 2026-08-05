# 00.2 — Repository Map

**Data:** 2026-08-05
**Fonte:** Inspeção direta do filesystem (ignorando `node_modules`, `.next`, `.turbo`, `dist`)

---

## Árvore de diretórios relevante (profundidade controlada)

```text
dtc-starter/
├── .agents/
│   ├── contracts/
│   │   └── nos-gallery-first-fold.yaml          # Contrato visual da primeira dobra
│   ├── fio-vivo-antigravity-rug-pack/
│   ├── hooks.json                               # PreToolUse firewall + Stop gate (PowerShell)
│   ├── nos-gallery-canonical-skills-205/
│   ├── ollama-superpowers-pack-v1.0.0/          # (não rastreado)
│   ├── product-lifecycle-canonical-skills-315/
│   ├── scripts/
│   │   ├── pretool-firewall.ps1
│   │   └── stop-gate.ps1
│   └── skills/
│       └── web-design-guidelines/SKILL.md
│
├── .github/workflows/
│   └── 360 E2E & Integration CI Pipeline.yml
│
├── AGENTS.md                                    # Autoridade de convenções do repo
├── CLAUDE.md                                    # Pointer para AGENTS.md
├── README.md                                    # README do starter Medusa
│
├── apps/
│   ├── backend/                                 # @dtc/backend — Medusa v2
│   │   ├── medusa-config.ts
│   │   ├── src/
│   │   │   ├── admin/                           # Scaffold (i18n, README)
│   │   │   ├── api/
│   │   │   │   ├── admin/custom/route.ts        # Placeholder GET → 200
│   │   │   │   └── store/custom/route.ts       # Placeholder GET → 200
│   │   │   ├── jobs/README.md
│   │   │   ├── links/README.md
│   │   │   ├── migration-scripts/
│   │   │   │   └── initial-data-seed.ts         # Seed canônico (EUR/USD, países EU)
│   │   │   ├── modules/README.md
│   │   │   ├── subscribers/README.md
│   │   │   └── workflows/README.md
│   │   └── integration-tests/http/
│   │
│   └── storefront/                              # @dtc/storefront — Next.js 15
│       ├── public/images/fio-vivo/              # 6 produtos × 4 cenas = 24 PNGs
│       │   ├── fv-001-espiral-dourada/          # 01-frente, 02-perfil, 03-gesto, 04-detalhe
│       │   ├── fv-002-orbita-negra/
│       │   ├── fv-003-trama-solar/
│       │   ├── fv-004-fio-ancestral/
│       │   ├── fv-005-tranca-ambar/
│       │   └── fv-006-duna-terracota/
│       └── src/
│           ├── app/
│           │   ├── [countryCode]/               # Dynamic route por country code
│           │   ├── layout.tsx
│           │   ├── not-found.tsx
│           │   ├── opengraph-image.jpg
│           │   └── twitter-image.jpg
│           ├── lib/
│           │   ├── config.ts                    # SDK Medusa (publishable key, fetch interceptor)
│           │   ├── constants.tsx                # paymentInfoMap (Stripe, PayPal, iDeal, Bancontact)
│           │   ├── context/
│           │   ├── data/                        # Camada de dados (products, etc.)
│           │   ├── hooks/
│           │   └── util/
│           ├── modules/
│           │   ├── account/
│           │   ├── cart/
│           │   ├── categories/
│           │   ├── checkout/                    # 18 componentes (addresses, payment, shipping, review)
│           │   ├── collections/
│           │   ├── common/
│           │   ├── home/
│           │   │   ├── components/
│           │   │   │   ├── featured-products/   # Product rail nativo
│           │   │   │   └── hero/               # Hero nativo do starter
│           │   │   └── gallery-hero/           # ← FONTE DE VERDADE FIO VIVO
│           │   │       ├── __tests__/medusa-adapter.test.js
│           │   │       ├── fixtures/
│           │   │       │   └── fio-vivo-products.ts   # ← FIXTURE CANÔNICA
│           │   │       ├── gallery-hero-analytics.ts
│           │   │       ├── gallery-hero-client.tsx     # Consome fixtures (BB-03 override)
│           │   │       ├── gallery-hero-data.ts       # fetchGalleryHeroProducts (Medusa)
│           │   │       ├── gallery-hero-fallback.tsx  # Fallback "Medusa DTC Starter"
│           │   │       ├── gallery-hero-feature-flags.ts
│           │   │       ├── index.tsx                  # Orquestra fallback → adapter → client
│           │   │       └── medusa-adapter.ts
│           │   ├── layout/
│           │   ├── nos-gallery/                 # Contém calendar.tsx (bloqueador Tailwind v4)
│           │   ├── order/
│           │   ├── products/                    # Product detail (gallery, actions, tabs, price, related)
│           │   ├── shipping/
│           │   ├── skeletons/
│           │   └── store/
│           ├── styles/
│           └── types/
│
├── artifacts/bb-04/                             # Evidências visuais e relatórios BB-04
│   ├── bb04-gate4-runtime-recovery-report.md
│   ├── fio-vivo-bb04-visual-evidence-report.md
│   ├── fio-vivo-desktop-1600x960.png
│   ├── fio-vivo-mobile-*.png                    # 3 viewports mobile
│   ├── fio-vivo-tablet-768x1024.png
│   ├── fio-vivo-runtime-measurements.json
│   ├── r1/                                      # R1 (auditoria pós-fix CSS)
│   │   ├── fio-vivo-r1-desktop-1600x960.png
│   │   ├── fio-vivo-r1-runtime-measurements.json
│   │   └── SHA256SUMS.txt
│   └── SHA256SUMS.txt
│
├── e2e/                                         # Playwright specs
│   ├── admin/inventory-orders.spec.ts
│   ├── gallery-accessibility.spec.ts
│   ├── gallery-commerce-journey.spec.ts
│   ├── gallery-hero-fallback.spec.ts
│   ├── performance/lighthouse-a11y.spec.ts
│   ├── storefront/auth-account.spec.ts
│   ├── storefront/checkout.spec.ts
│   └── visual-evidence-generator.spec.ts
│
├── packages/
│   └── gallery-experience/                      # @dtc/gallery-experience
│       └── src/
│           ├── adapters/medusa/map-store-product-to-gallery-item.ts
│           ├── components/
│           │   ├── artwork-card.tsx
│           │   ├── gallery-ambient.tsx
│           │   └── gallery-experience.tsx       # Componente principal
│           ├── index.ts
│           ├── styles/gallery-experience.css   # CSS BEM (modificado em R1)
│           └── types/index.ts
│
├── docker-compose.yml                           # Traefik + Postgres + Redis + Minio + Mailpit + Adminer
├── eslint.config.ts                            # @medusajs/eslint-plugin recommended
├── package.json                                 # Root: pnpm 10.11.1, turbo, playwright
├── playwright.config.ts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
└── .gitignore
```

---

## Mapeamento por domínio

### Produto (fonte de verdade)

| O quê | Onde | Tipo |
|---|---|---|
| Catálogo Fio Vivo (6 peças) | `apps/storefront/src/modules/home/gallery-hero/fixtures/fio-vivo-products.ts` | Fixture TypeScript hardcoded |
| Imagens dos produtos | `apps/storefront/public/images/fio-vivo/fv-00X-*/0Y-*.png` | 24 PNGs (4 cenas × 6 produtos) |
| Componente de galeria | `packages/gallery-experience/src/components/gallery-experience.tsx` | Componente React |
| Orquestração no storefront | `apps/storefront/src/modules/home/gallery-hero/index.tsx` | Server component |
| Adapter Medusa → Gallery | `apps/storefront/src/modules/home/gallery-hero/medusa-adapter.ts` | Adapter |
| Feature flag | `gallery-hero-feature-flags.ts` | `NEXT_PUBLIC_GALLERY_HERO_ENABLED` |

### Commerce engine (Medusa v2)

| O quê | Onde | Estado |
|---|---|---|
| Config Medusa | `apps/backend/medusa-config.ts` | Mínima (DB, CORS, secrets) |
| Seed inicial | `apps/backend/src/migration-scripts/initial-data-seed.ts` | **Genérico europeu** (EUR/USD, países gb/de/dk/se/fr/es/it) |
| API routes custom | `src/api/store/custom/route.ts`, `src/api/admin/custom/route.ts` | Placeholders `sendStatus(200)` |
| Módulos custom | `src/modules/` | Nenhum (apenas README) |
| Workflows | `src/workflows/` | Nenhum (apenas README) |
| Subscribers | `src/subscribers/` | Nenhum (apenas README) |
| Links | `src/links/` | Nenhum (apenas README) |
| Jobs | `src/jobs/` | Nenhum (apenas README) |

### Storefront (Next.js 15)

| Domínio | Path | Componentes |
|---|---|---|
| Home | `modules/home/` | hero, featured-products, gallery-hero |
| Produto | `modules/products/` | image-gallery, product-actions, product-price, product-tabs, related-products, thumbnail, product-preview |
| Checkout | `modules/checkout/` | addresses, country-select, shipping, payment (Stripe/PayPal/iDeal/Bancontact), review, discount-code, submit-button |
| Cart | `modules/cart/` | (presente) |
| Account | `modules/account/` | (presente) |
| Order | `modules/order/` | (presente) |
| Collections | `modules/collections/` | (presente) |
| Categories | `modules/categories/` | (presente) |
| Layout | `modules/layout/` | (presente) |
| Common | `modules/common/` | UI components |
| Shipping | `modules/shipping/` | (presente) |
| nos-gallery | `modules/nos-gallery/` | Contém `calendar.tsx` (bloqueador Tailwind v4) |

### Design system

| O quê | Onde |
|---|---|
| CSS gallery-experience | `packages/gallery-experience/src/styles/gallery-experience.css` |
| Contrato visual primeira dobra | `.agents/contracts/nos-gallery-first-fold.yaml` |
| Skill web-design | `.agents/skills/web-design-guidelines/SKILL.md` |
| Storefront styles | `apps/storefront/src/styles/` |

### Analytics

| O quê | Onde | Cobertura |
|---|---|---|
| Gallery analytics | `gallery-hero-analytics.ts` | `trackGalleryEvent` → `window.gtag` (GA4) |
| Eventos rastreados | gallery-hero-analytics.ts | product_id, product_handle, index, scene_id, locale, timestamp |

> **Lacuna:** sem product analytics estruturado, sem event taxonomy, sem CDP, sem data warehouse.

### Testes

| Tipo | Path | Cobertura |
|---|---|---|
| E2E Playwright | `e2e/` | gallery, checkout, auth, a11y, performance |
| Unit backend | `apps/backend/src/**/__tests__/*.unit.spec.ts` | Nenhum encontrado |
| Integration backend | `apps/backend/integration-tests/http/*.spec.ts` | Diretório existe, specs não inspecionadas |
| Unit gallery adapter | `apps/storefront/src/modules/home/gallery-hero/__tests__/medusa-adapter.test.js` | 1 spec |

### CI/CD

| O quê | Path |
|---|---|
| Workflow | `.github/workflows/360 E2E & Integration CI Pipeline.yml` |
| Config Playwright | `playwright.config.ts` |
| Config Turbo | `turbo.json` |
| Config ESLint | `eslint.config.ts` |

### Infra

| O quê | Path |
|---|---|
| Docker compose | `docker-compose.yml` (Postgres, Redis, Minio, Mailpit, Traefik, Adminer) |
| Env template backend | `apps/backend/.env.template` |
| Env template storefront | `apps/storefront/.env.template` |

---

## Arquivos modificados (working tree)

| Arquivo | Status |
|---|---|
| `packages/gallery-experience/src/styles/gallery-experience.css` | Modified (BB-04 R1) |

## Arquivos não rastreados

| Path | Observação |
|---|---|
| `.agents/ollama-superpowers-pack-v1.0.0/` | Pack de skills local |
| `artifacts/bb-04/bb04-gate4-runtime-recovery-report.md` | Relatório Gate 4 |
| `artifacts/bb-04/r1/` | Artefatos R1 |

---

*Fim do repository-map.md*