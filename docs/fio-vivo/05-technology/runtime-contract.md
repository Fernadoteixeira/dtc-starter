# Runtime Contract

| Campo | Valor |
|---|---|
| **ID** | P0.4 — Runtime Contract |
| **Versão** | 1.0.0 |
| **Data** | 2026-08-07 |
| **Owner** | Fio Vivo 360 — Technology Track |
| **Referências** | [toolchain-contract.md](./toolchain-contract.md), [AGENTS.md](../../../AGENTS.md), [reconciliation-ledger.md](../../artifacts/fio-vivo-360/reconciliation-ledger.md) |
| **Status** | Proposed |

Este documento é a fonte canônica da sequência de runtime, prontidão (readiness),
fail-fast, idempotência de seed e teardown do backend Medusa e da storefront Next.js.
Qualquer script de CI/CD, pipeline de deploy ou instrução de setup local deve estar
em conformidade com este contrato.

---

## 1. Sequência canônica de runtime (desenvolvimento local)

A ordem abaixo é **obrigatória** — cada etapa depende do estado produzido pela anterior.

```text
docker:up          →  PostgreSQL + serviços de apoio (Redis, etc.)
db:migrate         →  aplica migrations do Medusa ao banco
seed               →  popula dados iniciais (sales channel, region, products, etc.)
backend:dev        →  medusa develop  (http://localhost:9000, admin em /app)
storefront:dev     →  next dev --turbopack  (http://localhost:8000)
```

### 1.1 Comandos correspondentes

| Etapa | Comando (raiz do monorepo) | Script backend |
|---|---|---|
| Docker up | `pnpm run docker:up` | — |
| Migrate | `cd apps/backend && pnpm run db:migrate` | `medusa db:migrate` |
| Seed | `cd apps/backend && pnpm run seed` | `medusa seed --seed-file=src/migration-scripts/initial-data-seed.ts` |
| Backend dev | `pnpm run backend:dev` | `medusa develop` |
| Storefront dev | `pnpm run storefront:dev` | — |

> O Turbo já declara a task `seed` em `turbo.json` (outputs: `[]`) e o root `package.json`
> já expõe `backend:seed` (`turbo seed --filter=@dtc/backend`). Os scripts `db:migrate`
> e `seed` no `apps/backend/package.json` foram adicionados para completar o contrato.

---

## 2. Sequência de CI

A sequência de CI estende a sequência local com probe de prontidão, execução de testes
e teardown determinístico.

```text
docker:up
  ↓
db:migrate
  ↓
seed
  ↓
medusa develop  (ou medusa build && medusa start — conforme o objetivo do job)
  ↓
readiness probe  (backend + storefront, se aplicável)
  ↓
test  (unit + integration + e2e)
  ↓
teardown  (parar processos; desligar containers)
```

### 2.1 Diferenças vs. desenvolvimento local

| Aspecto | Local | CI |
|---|---|---|
| Ambiente | `.env` local | Variáveis injetadas pelo runner |
| Persistência | Containers recreados conforme necessário | Containers efêmeros; banco resetado a cada run |
| Readiness | Implícito (developer observa o terminal) | Probe explícito antes de testar |
| Teardown | `docker:down` manual | Automático no fim do job |

---

## 3. Readiness checks

Antes de declarar o sistema "pronto", verificar cada endpoint. O probe deve usar
retry com backoff (ex.: 30 tentativas a 1s de intervalo) antes de falhar o job.

### 3.1 Backend — Medusa

| Campo | Valor |
|---|---|
| **URL** | `GET http://localhost:9000/health` |
| **Critério** | HTTP 200 |
| **Fallback** | Se `/health` não estiver disponível na versão instalada, usar `GET http://localhost:8000/store/custom` (rota custom existente em `src/api/store/custom/route.ts` que retorna 200). |

> **Observação (débito técnico):** o Medusa v2 expõe um endpoint `/health` built-in,
> mas não há rota custom de health registrada em `src/api/`. O endpoint
> `src/api/store/custom/route.ts` (`GET /store/custom`) retorna 200 sem lógica de
> dependência — não valida DB, Redis ou módulos. Um health check verdadeiro deve
> verificar conectividade com o banco e módulos críticos. **Ação de follow-up (P0.7+):
> implementar `GET /health` custom que probe DB + Redis e retorne 503 se qualquer
> dependência estiver indisponível.**

### 3.2 Storefront — Next.js

| Campo | Valor |
|---|---|
| **URL** | `GET http://localhost:8000/` |
| **Critério** | HTTP 200 |
| **Pré-condição** | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` configurada; backend já em readiness |

> A storefront valida `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` em runtime via
> `check-env-variables.js` e aborta (`process.exit(1)`) se ausente. Esse check é
> fail-fast no nível de processo, não no nível de probe — o CI deve garantir a
> variável antes de iniciar o processo.

---

## 4. Fail-fast requirements

O sistema deve falhar imediatamente — com mensagem acionável — se uma pré-condição
crítica não for atendida. **Nunca** deixar o processo arrancar e falhar de forma
silenciosa ou criptográfica mais adiante.

### 4.1 Antes de `db:migrate`

| Variável | Onde | Consequência se ausente |
|---|---|---|
| `DATABASE_URL` | `apps/backend/.env` | Migrador não consegue conectar; erro de connection string |

### 4.2 Antes de `backend:dev` / `medusa develop`

| Variável | Onde | Consequência se ausente |
|---|---|---|
| `DATABASE_URL` | `apps/backend/.env` | Backend não inicia |
| `JWT_SECRET` | `apps/backend/.env` | Medusa exige para assinar tokens; startup falha |
| `COOKIE_SECRET` | `apps/backend/.env` | Medusa exige para cookies de sessão; startup falha |
| `STORE_CORS` | `apps/backend/.env` | CORS mal configurado; storefront bloqueada |
| `ADMIN_CORS` | `apps/backend/.env` | CORS mal configurado; admin bloqueado |
| `AUTH_CORS` | `apps/backend/.env` | CORS mal configurado; auth bloqueado |

> **Nota sobre nomes de variáveis:** o requisito original mencionava
> `MEDUSA_ADMIN_JWT_SECRET` e `MEDUSA_JWT_SECRET`. A configuração real deste repositório
> (confirmada em `medusa-config.ts` e `.env.template`) usa `JWT_SECRET` e
> `COOKIE_SECRET`. O Medusa v2 unificou o secret JWT de admin e store em
> `JWT_SECRET`; não há `MEDUSA_ADMIN_JWT_SECRET` separado. Este contrato usa os nomes
> reais do projeto.

### 4.3 Antes de `storefront:dev`

| Variável | Onde | Consequência se ausente |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `apps/storefront/.env` | `check-env-variables.js` aborta com `exit(1)` antes do start |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | `apps/storefront/.env` | Storefront aponta para backend errado; chamadas falham |

---

## 5. Seed idempotency

### 5.1 Estado atual (não-conformidade)

O arquivo `src/migration-scripts/initial-data-seed.ts` **não é idempotente**. Ele
executa workflows `create*` (createSalesChannels, createRegions, createProducts,
etc.) sem verificar se os registros já existem. Executar o seed uma segunda vez
contra o mesmo banco criará registros duplicados (sales channels, regions,
produtos, stock locations, tax regions, etc.).

### 5.2 Contrato exigido

O seed **deve** ser seguro para execução múltipla. Cada operação de criação deve
ser precedida por um lookup (query) e, se o registro já existir, deve ser reutilizado
ou atualizado (upsert) — não recriado.

Padrão canônico:

```typescript
// 1. Lookup antes de criar
const { data: existing } = await query.graph({
  entity: "sales_channel",
  fields: ["id"],
  filters: { name: "Default Sales Channel" },
})

if (existing.length > 0) {
  defaultSalesChannel = existing[0]  // reutilizar
} else {
  // criar (mesmo fluxo atual)
}
```

### 5.3 Débito técnico

| # | Item | Severidade | Correção em |
|---|---|---|---|
| TD-SEED-01 | Seed não idempotente — ausência de lookup/upsert antes de cada `create*Workflow` | Alta | P0.7 |

---

## 6. Teardown

A ordem de teardown é a **reversa** da sequência de runtime. Parar o processo mais
externo primeiro evita conexões órfãs e logs ruidosos.

```text
storefront:dev  →  parar processo (SIGTERM)
  ↓
backend:dev     →  parar processo (SIGTERM)
  ↓
docker:down     →  parar containers (PostgreSQL, Redis, etc.)
```

### 6.1 Em CI

- Matyar processos iniciados pelo job em ordem reversa (storefront → backend).
- Executar `pnpm run docker:down` ao final, **mesmo em caso de falha** (step de
  cleanup com `if: always()` ou equivalente).
- Não deixar containers órfãos entre runs — usar `--remove-orphans` com
  `docker compose up` ou garantir `docker compose down -v` no teardown para
  eliminar volumes do banco efêmero.

---

## 7. Débitos técnicos registrados

| # | Item | Onde | Severidade | Correção em |
|---|---|---|---|---|
| TD-SEED-01 | Seed não idempotente — sem lookup/upsert | `src/migration-scripts/initial-data-seed.ts` | Alta | P0.7 |
| TD-HEALTH-01 | Sem endpoint `/health` custom que probe dependências | `src/api/` | Média | P0.7 |
| TD-PASS-01 | `test:unit` usa `--passWithNoTests` — mascara suites sem testes | `apps/backend/package.json` | Média | P0.7 |
| TD-MIGRATE-01 | `db:migrate` não tem task declarada em `turbo.json` (apenas `seed`) | `turbo.json` | Baixa | P0.7 |

### 7.1 Detalhe: `--passWithNoTests` (TD-PASS-01)

O script `test:unit` em `apps/backend/package.json` é:

```json
"test:unit": "TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules jest --silent --runInBand --forceExit --passWithNoTests"
```

A flag `--passWithNoTests` faz o Jest retornar exit code 0 mesmo quando nenhum arquivo
de teste corresponde ao padrão de match. Isso mascara silenciosamente a ausência de
testes unitários — se a glob não encontrar nenhum `*.unit.spec.ts`, o CI passa
como se tudo estivesse verde. **Ação: remover `--passWithNoTests` em P0.7**, garantindo
antes que exista pelo menos um teste unitário real para evitar quebra do pipeline.

---

## 8. Referências cruzadas

- [AGENTS.md — Commands](../../../AGENTS.md) — comandos canônicos do monorepo
- [toolchain-contract.md](./toolchain-contract.md) — versões de toolchain
- [adr-001-canary-dependency-policy.md](./adr-001-canary-dependency-policy.md) — política de dependências
- [reconciliation-ledger.md](../../artifacts/fio-vivo-360/reconciliation-ledger.md) — ledger de reconciliação 360