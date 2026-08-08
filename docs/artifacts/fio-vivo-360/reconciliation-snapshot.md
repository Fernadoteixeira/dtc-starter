# Reconciliation Snapshot — `main`

> **P0.0 — Freeze + snapshot da `main` atual**
> Programa de reconciliação 360º do repositório `dtc-starter`.
> Este documento serve como baseline imutável para auditoria e reconciliação.

---

## Metadados do Snapshot

| Campo | Valor |
|---|---|
| **Data do snapshot** | 2026-08-07 |
| **Repositório** | `dtc-starter` (fork de `medusajs/dtc-starter`) |
| **Branch ativa** | `main` |
| **HEAD SHA (full)** | `b4515b2664c7276d7c2bfc69e3fc3ca5c366abe6` |
| **HEAD SHA (short)** | `b4515b2` |
| **Último commit — autor** | boldfernando |
| **Último commit — data** | Fri Aug 7 00:58:23 2026 -0300 |
| **Último commit — mensagem** | `ok` |
| **Total de arquivos rastreados** | 1.751 |
| **core.autocrlf** | `true` |

---

## Branches Locais

| Branch | SHA (short) | Status de tracking | Observações |
|---|---|---|---|
| `docs/agent-session-state-ledger` | `c4f8f17` | ahead 1, behind 4 | docs(agents): add session state ledger contract |
| `feat/backend-runtime-contract` | `8e56301` | behind 36 | Merge PR #1; checked out em worktree separada (`+`) |
| `feat/fio-vivo-bb04-baseline` | `646e5f8` | gone (sem remote) | feat(storefront): freeze BB-04 baseline |
| `feat/fio-vivo-bb05-medusa-integration` | `99e1bd0` | — | — |
| `fix/ci-gallery-lockfile-sync` | `00c7353` | — | fix(gallery): remove duplicate adapter; checked out em worktree separada (`+`) |
| **`main`** | **`b4515b2`** | **— (HEAD)** | **Branch ativa atual** |
| `pr-b/runtime-contract` | `82791db` | — | pr-b: runtime contract with migrate/seed/readiness |
| `pr-c/reproducible-pipeline` | `125dcb1` | — | pr-c: pin Node 20.18.0 in CI and add .nvmrc |
| `pr-d/dependency-compat` | `62569c4` | — | fix(deps): security overrides + gallery peer dep |
| `pr-e/bb05-reconciliation` | `88f20f5` | — | fix(gallery-hero): reconcile BB-05 — render live Medusa data |
| `pr-f/qa-release-evidence` | `00b28a1` | — | Refactor code structure for improved readability |

**Total de branches locais:** 11 (incluindo `main`)

---

## Submodules

```
fatal: no submodule mapping found in .gitmodules for path '.agents/medusa-agent-skills'
```

| Item | Estado |
|---|---|
| `.gitmodules` | **Ausente** — não existe arquivo `.gitmodules` no repositório |
| `.agents/medusa-agent-skills` | Referenciado como gitlink (submodule) na árvore, mas **sem mapping em `.gitmodules`** — estado **inconsistente/dirty** |
| Outros submodules | Nenhum |

> **⚠️ Anomalia:** O path `.agents/medusa-agent-skills` está registrado na árvore do Git como um submodule (gitlink), mas não há entrada correspondente em `.gitmodules`. Isto indica que o submodule foi adicionado sem configuração adequada, ou o `.gitmodules` foi removido sem desregistrar o submodule. Requer reconciliação.

---

## Tags

| Tag | Observações |
|---|---|
| `bb01-r1-green` | Única tag existente no repositório |

**Total de tags:** 1

---

## Diff vs `origin/main`

```
git diff --stat origin/main HEAD
```

**Resultado:** Sem diff — `HEAD` é idêntico a `origin/main`. A branch local `main` está sincronizada com o remoto.

---

## Versões-Chave das Dependências Críticas

### Runtime

| Componente | Versão esperada | Versão instalada | Fonte |
|---|---|---|---|
| **Node.js** | `>=20` (engines) | `v24.18.0` | `package.json` (root + backend `engines`) / `node --version` |
| **pnpm** | `10.11.1` (pinned) | `10.11.1` | `package.json` `packageManager` / `pnpm --version` |
| **core.autocrlf** | `true` | `true` | `git config` |

### Monorepo root (`package.json`)

| Dependência | Versão | Tipo |
|---|---|---|
| `turbo` | `2.10.9-canary.1` | devDependency |
| `typescript` | `^5.6.2` (override) | pnpm override + devDependency |
| `eslint` | `^9.39.4` | devDependency |
| `@medusajs/eslint-plugin` | `2.18.0` | devDependency |
| `@playwright/test` | `^1.62.1` | devDependency |
| `prettier` | `^3.2.5` | devDependency |
| `@types/react` | `19.0.5` (override) | pnpm override |
| `@types/react-dom` | `19.0.5` (override) | pnpm override |

### Backend (`apps/backend/package.json` — `@dtc/backend` v0.0.1)

| Dependência | Versão | Tipo |
|---|---|---|
| `@medusajs/medusa` | `2.18.0` | dependency |
| `@medusajs/framework` | `2.18.0` | dependency |
| `@medusajs/cli` | `2.18.0` | dependency |
| `@medusajs/dashboard` | `2.18.0` | dependency |
| `@medusajs/admin-sdk` | `2.18.0` | dependency |
| `@medusajs/ui` | `4.2.0` | dependency |
| `@medusajs/test-utils` | `2.18.0` | devDependency |
| `react` | `^19.2.8` | devDependency |
| `react-dom` | `^19.2.8` | devDependency |
| `typescript` | `^5.6.2` | devDependency |
| `vite` | `^8.2.1` | devDependency |
| `jest` | `^30.4.2` | devDependency |
| `zod` | `4.4.3` | dependency |
| `react-router-dom` | `7.18.2` | dependency |
| `@tanstack/react-query` | `5.101.4` | dependency |

### Storefront (`apps/storefront/package.json` — `@dtc/storefront` v1.0.3)

| Dependência | Versão | Tipo |
|---|---|---|
| `next` | `16.3.1-canary.4` | dependency |
| `react` | `19.0.5` | dependency |
| `react-dom` | `19.0.5` | dependency |
| `@headlessui/react` | `^2.2.0` | dependency |
| `@medusajs/js-sdk` | `2.18.0` | dependency |
| `@medusajs/icons` | `2.18.0` | dependency |
| `@medusajs/ui-preset` | `2.18.0` | dependency |
| `@stripe/react-stripe-js` | `^5.3.0` | dependency |
| `@stripe/stripe-js` | `^8.2.0` | dependency |
| `tailwindcss` | `^3.0.23` | devDependency (Tailwind v3, **não v4**) |
| `eslint-config-next` | `16.3.1-canary.4` | devDependency |
| `typescript` | `^5.3.2` | devDependency |
| `@dtc/gallery-experience` | `workspace:*` | dependency (workspace) |

### Gallery Experience (`packages/gallery-experience/package.json` — `@dtc/gallery-experience` v1.0.0)

| Dependência | Versão | Tipo |
|---|---|---|
| `framer-motion` | `12.42.2` | dependency |
| `clsx` | `^2.1.1` | dependency |
| `tailwind-merge` | `^3.3.1` | dependency |
| `next` | `^15.0.0` | peerDependency |
| `react` | `^19.0.0` | peerDependency |
| `react-dom` | `^19.0.0` | peerDependency |

> **⚠️ Nota de compatibilidade:** O peer dependency `next: ^15.0.0` do gallery-experience é incompatível com a versão `16.3.1-canary.4` usada na storefront. Isto pode causar avisos de peer dep ou comportamento indefinido.

---

## Resumo de Arquivos Rastreados por Categoria

**Total de arquivos rastreados:** 1.751

### Por diretório top-level

| Diretório / arquivo | Qtd. de arquivos | Observações |
|---|---|---|
| `.agents/` | 1.314 | Skill packs, hooks, contracts, medusa skills, scripts |
| `apps/` | 285 | backend (28) + storefront (257) |
| `docs/` | 87 | artifacts (63) + fio-vivo (23) + codebase-atlas (1) |
| `packages/` | 18 | gallery-experience |
| `e2e/` | 8 | test specs |
| `scripts/` | 13 | scripts de validação |
| `.github/` | 2 | CI/CD |
| `.codegraph/` | 3 | índice CodeGraph |
| `.obsidian/` | 3 | config Obsidian |
| `.claude/` | 1 | CLAUDE.md |
| Raiz (root-level) | 14 | ver abaixo |

### Breakdown de `apps/`

| App | Qtd. de arquivos |
|---|---|
| `apps/backend` | 28 |
| `apps/storefront` | 257 |

### Breakdown de `docs/`

| Subdiretório | Qtd. de arquivos |
|---|---|
| `docs/artifacts/` | 63 |
| `docs/fio-vivo/` | 23 |
| `docs/dtc-starter-codebase-atlas.html` | 1 |

### Breakdown de `.agents/`

| Subdiretório | Qtd. de arquivos |
|---|---|
| `product-lifecycle-canonical-skills-315/` | 455 |
| `ollama-superpowers-pack-v1.0.0/` | 419 |
| `nos-gallery-canonical-skills-205/` | 292 |
| `skills/` | 128 (inclui 18 Medusa skills) |
| `fio-vivo-antigravity-rug-pack/` | 11 |
| `contracts/` | 3 |
| `scripts/` | 2 |
| `medusa-agent-skills/` | 1 (gitlink/submodule) |
| `hooks.json` | 1 |
| `INDEX.md` | 1 |
| `templates/` | 1 |

### Arquivos na raiz

```
.gitignore
.npmrc
AGENTS.md
CLAUDE.md
docker-compose.yml
env.local.txt
eslint.config.ts
LICENSE
package.json
playwright.config.ts
pnpm-lock.yaml
pnpm-workspace.yaml
README.md
turbo.json
```

---

## Estado do Worktree

### Arquivos modificados (unstaged)

```
 m apps/storefront/src/modules/nos-gallery
```

| Path | Estado | Descrição |
|---|---|---|
| `apps/storefront/src/modules/nos-gallery` | modificado (submodule dirty) | O submodule `nos-gallery` contém modificações não commitadas no worktree |

### Arquivos não rastreados (untracked)

```
(nenhum)
```

Nenhum arquivo não rastreado (após aplicar `.gitignore`).

### Observações

- O worktree tem **1 item modificado**: o submodule `apps/storefront/src/modules/nos-gallery` está dirty.
- **Zero arquivos untracked** — o worktree está limpo quanto a novos arquivos.
- O submodule `.agents/medusa-agent-skills` tem mapping ausente (ver seção Submodules).

---

## Anomalias e Pontos de Atenção

1. **Submodule órfão (`.agents/medusa-agent-skills`):** gitlink na árvore sem `.gitmodules`. Requer decisão: registrar `.gitmodules` ou remover o gitlink.
2. **Submodule dirty (`apps/storefront/src/modules/nos-gallery`):** modificações não commitadas no worktree do submodule.
3. **Peer dep incompatível:** `@dtc/gallery-experience` declara `next: ^15.0.0` mas a storefront usa `next: 16.3.1-canary.4`.
4. **Node runtime mismatch:** `engines` declara `>=20` mas o ambiente executa `v24.18.0`. Não é erro, mas deve ser documentado para reprodutibilidade.
5. **`.nvmrc` ausente:** não há `.nvmrc` rastreado; a branch `pr-c/reproducible-pipeline` propõe pinar Node 20.18.0.
6. **Múltiplas branches de trabalho:** 10 branches locais além de `main`, várias com divergência significativa (até 36 commits behind). A reconciliação deve considerar qual merges descartar e quais preservar.

---

## Referências

- AGENTS.md — estrutura do projeto, convenções e off-limits
- CLAUDE.md — aponta para AGENTS.md
- `.agents/contracts/session-state-ledger.md` — contrato de gate/autorização para multi-turn BB
- `docs/fio-vivo-360/` — documentação estratégica do programa Fio Vivo 360

---

*Snapshot gerado em 2026-08-07 por comando Git read-only. Nenhum commit foi criado.*