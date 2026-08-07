# Toolchain Contract

| Campo | Valor |
|---|---|
| **ID** | P0.3 — Toolchain Contract |
| **Versão** | 1.0.0 |
| **Data** | 2026-08-07 |
| **Owner** | Fio Vivo 360 — Technology Track |
| **Referências** | [ADR-001 — Canary Dependency Policy](./adr-001-canary-dependency-policy.md), [reconciliation-ledger.md](../../artifacts/fio-vivo-360/reconciliation-ledger.md), [AGENTS.md](../../../AGENTS.md) |
| **Status** | Proposed |

Este documento é a fonte canônica de versões de toolchain do repositório `dtc-starter`.
Qualquer `package.json`, `.nvmrc` ou configuração de CI/CD deve estar em conformidade com
este contrato. Versões divergentes são não-conformidades e devem ser justificadas por um
ADR.

---

## 1. Tabela de versões

| Toolchain | Versão atual (estado observado) | Versão target (contrato) | Rationale | ADR |
|---|---|---|---|---|
| **Node.js** | `>=20` (engines); runtime 24.18.0 no ambiente | `20.18.0` (LTS — Iron) | LTS ativo na faixa suportada pelo Medusa 2.18 (`>=20`); pinar exato para reprodutibilidade entre devs e CI; ambiente 24.x deve ser trocado por 20.18.0 via `.nvmrc`. | — |
| **pnpm** | `10.11.1` (pinned via `packageManager`) | `10.11.1` | Pinned no `package.json` root via campo `packageManager`; sem mudança. Não introduzir segundo package manager. | — |
| **TypeScript** | `^5.6.2` (backend/root pnpm overrides), `^5.3.2` (storefront) | `5.6.x` (alinhado entre root/backend/storefront) | `ts-node` e o Medusa Framework dependem das APIs do TS 5.x; TS 7 quebrou o runtime no upgrade automático anterior. Unificar em 5.6.x. | ADR-001 (política canary aplica-se a TS) |
| **`@types/node`** | `^26.1.2` (backend), `17.0.21` (storefront) | `^20.x` (alinhado ao Node 20.18) | `@types/node` major deve espelhar o major do runtime Node. `^26` está dois majors à frente do runtime e permite APIs inexistentes no Node 20; `17` está defasado. | — |
| **Next.js** | `16.3.1-canary.4` | `15.5.x` (última 15 estável) | Storefront já roda em 15.5 + Turbopack; Medusa 2.18 valida Next 15; canary proibido por ADR-001. | [ADR-001](./adr-001-canary-dependency-policy.md) |
| **`eslint-config-next`** | `16.3.1-canary.4` | `15.5.x` (mesma versão de `next`) | Deve espelhar exatamente a versão do `next` para evitar drift de regras. | ADR-001 |
| **React** | `19.0.5` (storefront), `^19.2.8` (backend admin) | `19.0.5` (storefront) / `^19.2.8` (backend) reconciliados via pnpm overrides | Manter 19.x em ambos; backend usa 19.2.8 porque acompanha o `@medusajs/dashboard@2.18`. Reconciliação real é feita via `pnpm.overrides` no root (`@types/react`: `19.0.5`). Os tipos devem refletir a versão de runtime consumida. Se houver conflito de tipos, alinhar `@types/react` à versão maior (19.2). | — |
| **`@types/react`** | `19.0.5` (overrides root + storefront), `^19.2.18` (backend) | `19.0.5` (storefront/overrides), `^19.2.18` (backend) | Não podem divergir entre si além do major; backend declara types compatíveis com React 19.2. | — |
| **Vite** | `^8.2.1` (backend devDeps) | `^6.x` (faixa peer suportada por `@medusajs/admin-sdk@2.18`) | Vite 8 não é validado pelo Medusa 2.18; alinhar ao peer range declarado pelo admin SDK. Se a faixa peer não incluir 6.x, usar a maior faixa peer declarada por `@medusajs/admin-sdk`. | ADR-001 |
| **Turbo** | `2.10.9-canary.1` (root) | `2.x` (última 2 estável) | Turborepo 2 stable cobre todos os recursos usados; canary proibido por ADR-001. | ADR-001 |
| **Medusa** | `2.18.0` (backend deps) | `2.18.0` (constraint fixa) | Constraint do programa; não bump sem ADR. Todos os `@medusajs/*` devem estar em 2.18.0 coerentemente. | — |
| **Jest** | `^30.4.2` (backend devDeps) | `^30.x` | Compatível com Node 20 e TS 5.6; sem mudança. | — |
| **ESLint** | `^9.39.4` (root), `^9.13.0` (storefront) | `^9.x` (alinhado entre root/storefront) | Flat config; manter 9.x. Unificar minor entre root e storefront. | — |
| **Tailwind CSS** | `^3.0.23` (storefront) | `^3.x` | AGENTS.md: "Tailwind CSS v3 (not v4)". Manter 3.x; proibir sintaxe v4. | — |
| **Playwright** | `^1.62.1` (root) | `^1.62.x` | Sem mudança. | — |

### 1.1 Notas sobre reconciliação

- **TypeScript storefront vs root**: o root `pnpm.overrides.typescript` é `^5.6.2` mas a
  storefront declara `^5.3.2`. Como pnpm overrides tem precedência, a versão resolvida é
  `5.6.x`. O target é unificar a declaração em `^5.6.2` para evitar confusão.
- **React 19.0.5 vs 19.2.8**: são dois minors do mesmo major. O backend admin (Medusa
  dashboard) exige 19.2.x; a storefront usa 19.0.5. A reconciliação consiste em garantir que
  `@types/react` reflita a versão real de runtime em cada app. Se a storefront usar 19.0.5
  e o backend 19.2.8, os `@types/react` devem acompanhar cada um — não forçar um único
  override para ambos sem ADR.
- **`@types/node`**: a divergência atual (`^26` no backend, `17.0.21` na storefront) é o
  sintoma mais grave: `^26` permite usar APIs do Node 26 que não existem no runtime 20.18,
  gerando falsos negativos de tipo. O target é `^20.x` em ambos.

---

## 2. Proibições

As seguintes versões/usos são **proibidos** neste repositório enquanto este contrato
estiver vigente:

| # | Proibição | Motivo | ADR |
|---|---|---|---|
| P1 | **TypeScript 7.x** (`^7`, `7.0.0`, etc.) | `ts-node` e o Medusa Framework dependem das APIs do TS 5.x; TS 7 quebrou o runtime no upgrade automático anterior. Só é admitida via novo ADR que demonstre suporte upstream. | ADR-001 |
| P2 | **Segundo package manager** (`npm`, `yarn`, `bun`) ao lado do pnpm | Cria segundo lockfile e quebra o workspace. O repo é pnpm-only (`packageManager: "pnpm@10.11.1"`). | — |
| P3 | **Canary / alpha / beta / next-tagged** em qualquer dep de produção ou build | Sem changelog, sem SLA de segurança, sem garantia semântica. Exceção só via ADR. | ADR-001 |
| P4 | **`@types/node` major > Node runtime major** (ex.: `^26` com Node 20) | Permite APIs inexistentes no runtime; gera falsos negativos de tipo. | — |
| P5 | **Tailwind v4-only syntax** (`@theme`, `--spacing()`, etc.) | O repo usa Tailwind v3; v4-only syntax quebra o build da storefront. | AGENTS.md |
| P6 | **Bump de `@medusajs/*` fora do major 2.18.0** | Constraint do programa; todos os pacotes Medusa devem estar coerentemente em 2.18.0. | — |
| P7 | **Hand-edit do `pnpm-lock.yaml`** | Lockfile só muda como efeito colateral de `pnpm install`. | AGENTS.md |
| P8 | **Commit de `.env` / `.env.local`** | Segredo. Editar `.env.template` para documentar novas variáveis. | AGENTS.md |

---

## 3. Validação

Compliance com este contrato deve ser verificável por comandos determinísticos. A ordem
abaixo é a sequência canônica de validação após qualquer mudança de toolchain:

```bash
# 1. Node version — deve ser 20.18.0 (lida do .nvmrc)
nvm use
node -v   # expect: v20.18.0

# 2. Install frozen — lockfile não deve mudar
pnpm install --frozen-lockfile

# 3. TypeScript — type-check em ambos os apps
cd apps/backend   && pnpm exec tsc --noEmit
cd apps/storefront && pnpm exec tsc --noEmit

# 4. Lint (inclui regras @medusajs/eslint-plugin no backend)
pnpm run lint

# 5. Testes de unidade (backend)
cd apps/backend && pnpm run test:unit

# 6. Verificação de proibições (heurística)
#    Nenhum package.json deve conter canary/alpha/beta/next-tagged:
grep -rE '"[^"]*(canary|alpha|beta|next)"' --include=package.json . \
  | grep -v node_modules | grep -v .medusa || echo "OK: no pre-release deps"

#    @types/node não deve passar de ^20:
grep -E '"@types/node"\s*:\s*"\^?(2[1-9]|[3-9][0-9])' apps/*/package.json \
  && echo "FAIL: @types/node major > 20" || echo "OK: @types/node aligned"

#    TypeScript não deve ser 7+:
grep -E '"typescript"\s*:\s*"\^?7' apps/*/package.json package.json \
  && echo "FAIL: TS 7 detected" || echo "OK: TS < 7"
```

### 3.1 Gate de CI sugerido

Em CI, executar os passos 1–5 acima como gate obrigatório antes de qualquer job de build/deploy.
O passo 6 (grep de proibições) deve rodar como step separado e falhar o pipeline se encontrar
qualquer match.

### 3.2 Quando o contrato muda

- Mudança de versão target de qualquer linha da tabela da seção 1 exige bump de versão
  deste documento (semver) e, se for mudança de política (não só de patch), um ADR novo ou
  emenda ao ADR-001.
- O `.nvmrc` é a fonte canônica da versão de Node; este contrato referencia-o. Se os dois
  divergirem, o `.nvmrc` prevalece para runtime, e este contrato deve ser corrigido para
  alinhar.