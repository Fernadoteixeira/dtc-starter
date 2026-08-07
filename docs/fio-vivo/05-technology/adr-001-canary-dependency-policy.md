# ADR-001: Canary Dependency Policy

| Campo | Valor |
|---|---|
| **ID** | ADR-001 |
| **Título** | Canary Dependency Policy |
| **Status** | Proposed |
| **Data** | 2026-08-07 |
| **Decisor** | Fio Vivo 360 — Technology Track |
| **Supersedes** | — |
| **Referências** | [toolchain-contract.md](./toolchain-contract.md), [reconciliation-ledger.md](../../artifacts/fio-vivo-360/reconciliation-ledger.md) |

## 1. Contexto

O repositório `dtc-starter` é um monorepo Turborepo contendo um backend Medusa v2.18.0 e uma
storefront Next.js. Durante a fase de reconciliação 360º (P0.3 — Toolchain Contract),
descobrimos que três dependências críticas estão em versões canary ou desalinhadas:

| Dependência | Versão atual | Tipo | Consumidor |
|---|---|---|---|
| `next` | `16.3.1-canary.4` | canary | `apps/storefront` (deps) + `eslint-config-next` (devDeps) |
| `turbo` | `2.10.9-canary.1` | canary | root `devDependencies` |
| `vite` | `^8.2.1` | major pre-release não validada com Medusa 2.18 | `apps/backend` (devDeps, transitive do Medusa admin bundler) |

### 1.1 Por que canary é arriscado

1. **Sem garantia de estabilidade.** Canarys são publicações automáticas de `main` do upstream;
   podem incluir mudanças de comportamento sem bump semântico, sem changelog, sem suporte a
   backport. Não há SLA de correções de segurança para canarys.
2. **Histórico de quebra documentado neste repo.** Um upgrade automático anterior elevou o
   TypeScript para `7.x` e quebrou o runtime porque `ts-node` e o Medusa framework dependem das
   APIs antigas do TS 5.x. Canarys em outras dependências reproduzem a mesma classe de risco:
   uma ferramenta upstream muda uma API, o Medusa ainda não suporta, e o pipeline quebra sem
   aviso.
3. **Incompatibilidade com Medusa 2.18.** O Medusa 2.18 declara peerDependencies sobre Next
   15.x, React 19.x e Vite 5.x/6.x (faixa suportada pelo admin bundler). Next 16 canary, Vite 8
   major e Turbo 2.10 canary estão **fora** das faixas testadas pelo Medusa Framework. Qualquer
   patch do Medusa assume Next 15, não 16.
4. **Reprodutibilidade.** Canarys não são imutáveis por versão: o tag `canary` aponta para um
   commit, mas o upstream pode publicar `16.3.2-canary.0` minutos depois, alterando
   transitivamente o `eslint-config-next` e invalidando builds em outro checkout sem
   `--frozen-lockfile` estrito.
5. **Conformidade de auditoria.** A policy do programa 360º exige rastreabilidade de versão
   para todas as ferramentas de build/deploy. Canarys não têm changelog auditável.

### 1.2 Estado específico por dependência

#### Next.js (`next` + `eslint-config-next`)

- Atual: `16.3.1-canary.4` em `apps/storefront` (deps e devDeps).
- A storefront já opera em produção com Next **15.5** + Turbopack, conforme registrado no
  `AGENTS.md`: *"The storefront runs Next.js 15.5 with Turbopack on port 8000."*
- Medusa 2.18 declara suporte a Next 15.x como faixa de storefront compatível. Next 16 canary
  introduz mudanças no App Router, middleware e bundler que **não foram validadas** contra o
  SDK `@medusajs/js-sdk@2.18.0` nem contra `eslint-config-next`.
- O `package.json` da storefront tem `next` como `dependencies` **e** `eslint-config-next`
  como `devDependencies` no mesmo canary, criando um acoplamento rígido: qualquer bump automático
  quebra ambos.

#### Turbo (`turbo`)

- Atual: `2.10.9-canary.1` no root.
- Turborepo 2.x stable existe e suporta todos os recursos usados por este repo
  (`dependsOn`, `outputs`, `--filter`). Não há necessidade de canary.
- Canarys de Turbo podem introduzir mudanças em cache keys, task runner ou remoting que
  afetam o `turbo.json` do repo e o comportamento de `pnpm -r` vs `turbo`.

#### Vite (`vite`)

- Atual: `^8.2.1` em `apps/backend` (devDeps), usado como peer do bundler do Medusa admin
  (`@medusajs/admin-sdk` importa `vite/client` via `src/admin/vite-env.d.ts`).
- Medusa 2.18 não declara suporte a Vite 8. A faixa suportada publicamente é Vite 5.x/6.x
  (usada pelo dashboard interno `@medusajs/dashboard@2.18.0`).
- Vite 8 é major; mesmo se `^8.2.1` resolver para uma release estável em sentido semântico,
  a API de plugins, o resolvedor de ESM e o sistema de env podem ter mudado em relação às
  versões com que o Medusa admin foi testado.

## 2. Decisão

### 2.1 Política geral

**Canary é proibido em produção sem ADR explícita.**

1. Todas as dependências de runtime, build e tooling devem usar **versões estáveis publicadas**
   (não `*-canary.*`, `*-alpha.*`, `*-beta.*` nem `next`-tagged).
2. Uma exceção só é aceita com um novo ADR (ex.: ADR-002) justificando a necessidade de uma
   API exclusiva do canary, com plano de rollback e janela de validação contra o Medusa
   Framework.
3. Esta política **não** proíbe usar uma major recente estável (ex.: Next 16.0.0 se/when
   lançada) — proíbe apenas versões pré-lançamento.

### 2.2 Decisão por dependência

| Dependência | Decisão | Versão target | Justificativa |
|---|---|---|---|
| **Next.js** | **Downgrade para 15.x stable** | `15.5.x` (última 15 estável) | A storefront já roda em produção com 15.5 + Turbopack; Medusa 2.18 valida Next 15; Next 16 canary não tem changelog nem garantias de peer compat com `@medusajs/js-sdk@2.18`. Manter canary exigiria revalidar manualmente middleware, App Router e Turbopack — custo > benefício. |
| **Turbo** | **Downgrade para 2.x stable** | `2.x` (última 2 estável) | Turborepo 2 stable cobre todos os recursos usados; canary adiciona risco ao cache e ao task runner sem benefício funcional. |
| **Vite** | **Alinhar à faixa suportada pelo Medusa 2.18** | `^6.x` (ou a faixa peer declarada por `@medusajs/admin-sdk@2.18`) | Vite 8 não é validado pelo Medusa 2.18; alinhar ao peer range evita quebras no admin bundler. Se a faixa peer não incluir 6, usar a maior faixa peer declarada. |

### 2.3 Exceções registradas

Nenhuma exceção é concedida por esta ADR. Qualquer uso futuro de canary requer ADR novo.

## 3. Consequences

### 3.1 O que muda imediatamente

- **Storefront**: `next` e `eslint-config-next` passam a ser `15.x` estável. Migração de
  qualquer API removida entre 16-canary e 15.5 deve ser tratada no rebase de package.json
  (próximo passo do programa, fora do escopo deste ADR).
- **Root**: `turbo` passa a ser `2.x` estável. Comportamento de `turbo.json` é preservado.
- **Backend**: `vite` em `apps/backend` é alinhado à faixa peer do Medusa admin. O
  `src/admin/vite-env.d.ts` permanece válido pois `vite/client` é estável desde Vite 5.
- **TypeScript**: permanece 5.x — esta ADR não toca em TS, mas registra que a política
  canary se aplica igualmente: TS 7 só é admitida via ADR quando `ts-node` e o Medusa
  Framework suportarem suas APIs (ver [toolchain-contract.md](./toolchain-contract.md),
  seção "Proibições").

### 3.2 O que preserva

- Reprodutibilidade: `pnpm install --frozen-lockfile` passa a resolver sempre as mesmas
  versões, sem risco de um canary ser republicado entre installs.
- Auditoria: toda versão de produção passa a ter changelog e semver auditável.
- Compatibilidade Medusa: mantém todas as deps dentro das faixas peer testadas por
  `@medusajs/medusa@2.18.0`.

### 3.3 Trade-offs

- **Perde**: acesso antecipado a APIs futuras de Next 16 e Turbo 2.11. Nenhuma dessas APIs
  é usada hoje no repo, então o custo é zero.
- **Risco residual**: o downgrade de Next 16 → 15 pode exigir ajustes pontuais no
  `middleware.ts` ou em direttivas do App Router. Esse trabalho é de responsabilidade do
  rebase de package.json subsequente, não desta ADR.

### 3.4 Próximos passos (fora do escopo desta ADR)

- Rebasear `package.json` (root + storefront + backend) para as versões target desta ADR.
- Rodar `pnpm install --frozen-lockfile`, `tsc --noEmit` em ambos os apps, e a suíte de testes
  para confirmar que o downgrade não introduz regressões.
- Atualizar `engines.node` de `>=20` para `^20.18.0` (ver toolchain-contract).

## 4. Compliance

Esta ADR é enforced pelo [toolchain-contract.md](./toolchain-contract.md), seção
"Proibições" e "Validação". Qualquer `package.json` que declarar `*-canary.*`,
`*-alpha.*`, `*-beta.*` ou `next` após a aprovação desta ADR deve ser rejeitado em review.