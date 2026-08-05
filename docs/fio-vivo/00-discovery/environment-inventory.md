# 00.1 — Environment Inventory

**Data:** 2026-08-05
**Autor:** Discovery Engine (CPO/Architect mode)
**Fonte:** Inspeção direta do repositório `dtc-starter` + ecossistema local `C:\Users\fjuni\`

---

## 1. Repositório primário

| Atributo | Valor |
|---|---|
| Path | `C:\Users\fjuni\Documents\GitHub\02-medusa-halls\dtc-starter` |
| Origin | `https://github.com/boldfernando/dtc-starter.git` (fork) |
| Upstream | `https://github.com/medusajs/dtc-starter.git` |
| Branch atual | `main` |
| Working tree | 1 arquivo modificado (`packages/gallery-experience/src/styles/gallery-experience.css`), 2 entradas não rastreadas (`.agents/ollama-superpowers-pack-v1.0.0/`, `artifacts/bb-04/...`) |
| Último commit | `c10cde3 docs: add visual evidence report for Fio Vivo BB-04 audit` |

> ⚠️ **Divergência registrada:** o snapshot do workspace Hermes indica branch `master`, mas o branch real é `main`. O remote `origin` aponta para o fork `boldfernando`, não para o upstream Medusa. Trabalhar sempre sobre `main`.

---

## 2. Monorepo (Turborepo + pnpm)

| Componente | Detecção |
|---|---|
| Package manager | pnpm 10.11.1 (declarado em `package.json` → `packageManager`) |
| Lockfile | `pnpm-lock.yaml` (702 KB) |
| Workspaces | `apps/**`, `packages/**` (exclui `apps/backend/.medusa/**`) |
| Build orchestrator | Turborepo 2.x (`turbo.json`) |
| Node engine | `>=20` (root), `>=20` (backend) |
| React | 19.0.5 (storefront), 18.3.1 (backend admin devDeps) |

**Turbo tasks:** `build`, `dev`, `start`, `lint`, `test`, `test:e2e`, `seed`. `dev` é `persistent: true` (não cacheável).

---

## 3. Apps

### 3.1 `apps/backend` — Medusa v2 (`@dtc/backend`)

| Atributo | Valor |
|---|---|
| Medusa | `@medusajs/medusa` 2.18.0 |
| Framework | `@medusajs/framework` 2.18.0 |
| Admin SDK | `@medusajs/admin-sdk` 2.18.0 |
| DB | PostgreSQL 15 (via `docker-compose.yml`) |
| Config | `medusa-config.ts` (DB URL, CORS, secrets via env) |
| Scripts | `build`, `start`, `dev` (`medusa develop`), `lint`, `test:integration:http`, `test:integration:modules`, `test:unit` |

**Estrutura `src/`:** `admin/` (widgets, i18n, routes), `api/` (store/custom, admin/custom — ambos placeholders `sendStatus(200)`), `jobs/`, `links/`, `migration-scripts/` (initial-data-seed.ts), `modules/`, `subscribers/`, `workflows/`.

> **Estado real:** backend é **canônico do starter Medusa**. Nenhum módulo custom, nenhum workflow, nenhum subscriber implementado. Todos os diretórios contêm apenas `README.md` de scaffold.

### 3.2 `apps/storefront` — Next.js 15 (`@dtc/storefront`)

| Atributo | Valor |
|---|---|
| Next.js | 15.5.21 |
| React | 19.0.5 |
| Tailwind | **3.0.23** (declarado) — **mas há token Tailwind v4 no wild** (`--spacing(8)` em `nos-gallery/components/ui/calendar.tsx`) |
| SDK | `@medusajs/js-sdk` 2.18.0 |
| Payments | Stripe (`@stripe/react-stripe-js`, `@stripe/stripe-js`), PayPal, iDeal, Bancontact |
| Dev script | `next dev --turbopack -p 8000` |

> ⚠️ **Bloqueador preexistente:** o dev script usa `--turbopack`, mas há sintaxe Tailwind v4 (`var(--spacing(8))`) em `apps/storefront/src/modules/nos-gallery/components/ui/calendar.tsx:32` que quebra o compilador Turbopack. Workaround temporário documentado na sessão anterior: rodar `next dev -p 8000` sem `--turbopack`.

**Módulos do storefront:** `account`, `cart`, `categories`, `checkout`, `collections`, `common`, `home`, `layout`, `nos-gallery`, `order`, `products`, `shipping`, `skeletons`, `store`.

---

## 4. Packages

### `packages/gallery-experience` (`@dtc/gallery-experience`)

Pacote isolado e reutilizável que renderiza a experiência de galeria Fio Vivo.

| Arquivo | Função |
|---|---|
| `src/components/gallery-experience.tsx` | Componente principal (active/adjacent/continuation + scene rail + nav + CTA) |
| `src/components/artwork-card.tsx` | Card de obra |
| `src/components/gallery-ambient.tsx` | Background dinâmico ambient |
| `src/adapters/medusa/map-store-product-to-gallery-item.ts` | Adapter Medusa product → GalleryItem |
| `src/types/index.ts` | Tipos `GalleryItem`, `GalleryScene` |
| `src/styles/gallery-experience.css` | CSS BEM (alvo de BB-04 R1) |

> Consumido pelo storefront via `@dtc/gallery-experience` (workspace:*). Há build JS+TS dual (`.js` e `.tsx` lado a lado) — herança de geração do pacote.

---

## 5. Infraestrutura (docker-compose.yml)

| Container | Imagem | Porta | Função |
|---|---|---|---|
| `dtc-traefik` | traefik:v3.0 | 8082:80, 8088:8080 | Reverse proxy + dashboard |
| `dtc-postgres` | postgres:15-alpine | 5432 | DB principal |
| `dtc-db-dashboard` | adminer | 8081:8080 | Query runner |
| `dtc-redis` | (presente no compose, confirmado healthy no Gate 4) | — | Cache Medusa |
| `dtc-minio` | (presente no compose, confirmado healthy) | — | S3-compatible storage |
| `dtc-mailpit` | (presente no compose, confirmado healthy) | — | Email capture dev |
| `dtc-minio-init` | — | — | Minio bootstrap |

> Rede local via Traefik labels: `traefik.localhost`, `db.localhost`, etc. Configurado para desenvolvimento local — **não é configuração de produção**.

---

## 6. CI/CD (`.github/workflows/`)

| Workflow | Gatilho | Jobs |
|---|---|---|
| `360 E2E & Integration CI Pipeline` | push/PR em `main`/`master` | `lint-and-unit` (pnpm lint + backend unit), `e2e-playwright` (2 shards) |

- Node 20, pnpm 10, Playwright com `--with-deps`
- Upload de `playwright-report/` como artifact (retenção 14 dias)
- **Sem deploy pipeline configurado** — CI é validação apenas

---

## 7. Testes (e2e/)

| Spec | Escopo |
|---|---|
| `e2e/admin/inventory-orders.spec.ts` | Admin inventory |
| `e2e/gallery-accessibility.spec.ts` | A11y da galeria |
| `e2e/gallery-commerce-journey.spec.ts` | Jornada commerce galeria |
| `e2e/gallery-hero-fallback.spec.ts` | Fallback do hero |
| `e2e/performance/lighthouse-a11y.spec.ts` | Lighthouse + a11y |
| `e2e/storefront/auth-account.spec.ts` | Auth/account |
| `e2e/storefront/checkout.spec.ts` | Checkout |
| `e2e/visual-evidence-generator.spec.ts` | Gerador de evidência visual |

Config: `playwright.config.ts` + `playwright-report/` + `test-results/`.

---

## 8. Ecossistema local `C:\Users\fjuni\` (inspeção bounded)

### A. Agentes, copilotos e automações
- `.agents/` (no repo) — contracts, skills, hooks (firewall + stop-gate PowerShell), fio-vivo-antigravity-rug-pack, nos-gallery-canonical-skills-205, product-lifecycle-canonical-skills-315, ollama-superpowers-pack-v1.0.0
- `.codex/`, `.copilot/`, `.cursor/`, `.kimi-code/`, `.kimi-work/`, `.kimi-webbridge/`, `.gemini/`, `.openclaw/`, `.impeccable/`, `.github-copilot-cli/` — múltiplos assistentes de IA instalados
- `.aitk/` — AI toolkit

### B. Modelos locais e runtimes de IA
- `.ollama/` — Ollama (modelos locais; não inspeccionar conteúdo)
- `.lmstudio/` — LM Studio
- `.genkit/` — Genkit (Firebase AI)
- `.mem0/` — Mem0 (memória de agent)
- `.sem/` — SEM (semantic engine?)

### C. IDEs e extensões
- `.vscode/`, `.vscode-insiders/`, `.vscode-insiders-shared/`, `.vscode-shared/`, `.vscode-server/`, `.antigravity-ide/`

### D. Linguagens e package managers
- `.bun/`, `.cargo/`, `.rustup/`, `.pnpm-store/` (não inspeccionar)

### E. Containers, cloud e infra
- `.docker/`, `.kube/`, `.azure/` — **sensíveis** (não exibir credenciais)

### F. Bancos, analytics e dados
- `.duckdb/` — DuckDB local
- `.u2net/` — U2Net (segmentação de imagem)

### G. Autenticação, assinatura e segurança
- `.mcp-auth/`, `.sigstore/`, `.config/` — **sensíveis**

### H. Caches, artefatos transitórios
- `.cache/`, `.local/`

### I. Potencialmente relevantes
- `.aitk`, `.genkit`, `.ollama`, `.lmstudio`, `.mem0` — podem acelerar workflows de IA e memory
- `.duckdb/` — pode acelerar analytics local

### J. Fora de escopo / sensíveis
- `AppData/` — não varredura recursiva
- `Apple/` — fora de escopo Windows
- `.mcp-auth/`, `.azure/`, `.docker/`, `.kube/`, `.sigstore/`, `.config/`, `AppData/` — diretórios de segurança reforçada (Seção 3.3 do mega-prompt)

---

## 9. Variáveis de ambiente documentadas (nomes apenas)

### Backend (`apps/backend/.env.template`)
- `DATABASE_URL`
- `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS`
- `JWT_SECRET`, `COOKIE_SECRET`

### Storefront (`apps/storefront/.env.template`)
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (obrigatório)
- `NEXT_PUBLIC_MEDUSA_BACKEND_URL` (default `http://localhost:9000`)
- `NEXT_PUBLIC_DEFAULT_REGION` (default `dk` — **não é BR**)
- `NEXT_PUBLIC_BASE_URL`
- `NEXT_PUBLIC_STRIPE_KEY`
- `MEDUSA_CLOUD_S3_HOSTNAME`, `MEDUSA_CLOUD_S3_PATHNAME`
- `NODE_ENV`

### Feature flags Fio Vivo (descobertas no código)
- `NEXT_PUBLIC_GALLERY_HERO_ENABLED` (`"true"` ativa galeria)
- `NEXT_PUBLIC_GALLERY_HEADER_MODE` (`"immersive-overlay"` | default `"commerce-bar"`)

> **Estado:** `.env.local` e `.env` existem (não vazios). Valores não exibidos.

---

## 10. Convenções arquiteturais (de AGENTS.md)

- Backend routing é file-based: `src/api/store/<path>/route.ts`
- Business logic em workflows, não em route handlers
- No semicolons, double quotes, 2-space indent
- Files: kebab-case. Types/classes: PascalCase. DB columns: snake_case
- No emojis em code/comments/commits
- Backend deve satisfazer `@medusajs/eslint-plugin` recommended (nunca silenciar regras `@medusajs/*`)
- Não hand-editar lockfile
- Não editar migrations existentes — adicionar nova
- Off-limits: `.medusa/`, `.next/`, `dist/`, `.turbo/`, `.env`, `.env.local`

---

## 11. Sensitive directories — status

| Diretório | Regra | Status |
|---|---|---|
| `.mcp-auth/` | Não exibir credenciais | Detectado, conteúdo não lido |
| `.azure/` | Não exibir credenciais | Detectado, conteúdo não lido |
| `.docker/` | Não exibir credenciais | Detectado, conteúdo não lido |
| `.kube/` | Não exibir credenciais | Detectado, conteúdo não lido |
| `.sigstore/` | Não exibir credenciais | Detectado, conteúdo não lido |
| `.config/` | Não exibir credenciais | Detectado, conteúdo não lido |
| `AppData/` | Não varredura recursiva | Não inspeccionado |
| `Apple/` | Fora de escopo | Não inspeccionado |

---

*Fim do environment-inventory.md*