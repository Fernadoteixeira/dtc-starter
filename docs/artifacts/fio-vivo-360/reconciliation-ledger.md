# Reconciliation Ledger — PRs #3–#10

**Data:** 2026-08-07
**Baseline SHA (main HEAD):** `b4515b2664c7276d7c2bfc69e3fc3ca5c366abe6`
**Repositório:** `Fernadoteixeira/dtc-starter`
**Branch alvo:** `main`
**Escopo:** Reconstrução do histórico de PRs #3 a #10 (merge commits, branches, CI, classificação superseded/authoritative, commits corretivos não reconciliados).

---

## Metodologia

- Merge commits reconstruídos via `git log --all --merges --oneline --date=short` e `git log main --merges --oneline`.
- Dados de PR (reviews, mergedAt, CI) obtidos via GitHub CLI `gh pr list/view/checks`.
- Diferenciais de arquivos via `git show --stat` e `git diff <merge>^1 <merge> --stat`.
- Ancestry checks via `git merge-base --is-ancestor <sha> main`.
- Status de CI determinado por `gh pr checks`; PRs sem checks registrados (GitHub Actions expirados/removidos) marcados como "indeterminado".

---

## Tabela de PRs #3–#10

| PR | Título | Branch de origem | Merge SHA | Data do merge (UTC) | Arquivos | +/− | CI status | Reviews | Classificação |
|----|--------|------------------|-----------|---------------------|----------|-----|-----------|---------|---------------|
| #3 | Codebase Atlas and Understand-Anything graph validator | `feat/fio-vivo-bb05-medusa-integration` | `c633c0d` | 2026-08-06 19:31 | 13 | +1716/−0 | **FAIL** (Lint & Unit Tests, Playwright E2E x2) | 1 | Authoritative |
| #4 | feat: Fio Vivo BB-05 Medusa integration with Next.js 16 canary upgrades | `feat/fio-vivo-bb05-medusa-integration` | `f6d8ca9` | 2026-08-06 23:48 | 76 | +8195/−1183 | Indeterminado (checks indisponíveis) | 7 | Authoritative |
| #5 | Replace generic Medusa images with authorial Fio Vivo bag images | `feat/fio-vivo-bb05-medusa-integration` | `56517f4` | 2026-08-07 00:03 | 13 | +281/−283 | Indeterminado (checks indisponíveis) | 1 | Authoritative |
| #6 | Replace generic Medusa placeholder images with authorial Fio Vivo bag photography | `copilot/replace-generic-medusa-images` | `82b5e55` | 2026-08-07 00:03 | 1 | +8/−8 | Indeterminado (checks indisponíveis) | 1 | Authoritative (complementa #5) |
| #7 | fix: add Postgres/Redis services and passWithNoTests to E2E CI | `feat/fio-vivo-bb05-medusa-integration` | `dafc294` | 2026-08-07 00:30 | 2 | +31/−1 | Indeterminado (checks indisponíveis) | 1 | **Superseded** por #8/#9 |
| #8 | fix: add Postgres/Redis services, db:migrate step, and passWithNoTests to E2E CI | `copilot/fix-add-postgres-redis-services` | `d5eb05d` | 2026-08-07 01:23 | 2 | +15/−10 | Indeterminado (checks indisponíveis) | 1 | **Superseded** por #9 |
| #9 | PR-A: restore honest CI semantics (remove false green, pin pnpm 10.11.1, explicit test discovery) | `feat/fio-vivo-bb05-medusa-integration` | `cee7a73` | 2026-08-07 01:22 | 2 | +46/−3 | Indeterminado (checks indisponíveis) | 2 | Authoritative (CI final) |
| #10 | No-op: DATABASE_URL in e2e-ci.yml is already a valid connection string | `copilot/fix-code-review-suggestion` | N/A (OPEN, não mergeado) | N/A | 0 | +0/−0 | Indeterminado (sem checks) | 0 | No-op (observação) |

---

## PRs Superseded vs Authoritative

### Authoritative (vigentes na main `b4515b2`)

| PR | SHA | Razão |
|----|-----|-------|
| #3 | `c633c0d` | Codebase Atlas + UA graph validator — conteúdo presente na main. |
| #4 | `f6d8ca9` | BB-05 Medusa integration, Next.js 16 canary, imagens autorais, lockfile — presente na main. |
| #5 | `56517f4` | Migração lint ESLint 9 flat config, .agents/INDEX.md, gallery-hero medusa-adapter — presente na main. |
| #6 | `82b5e55` | Correção focada do initial-data-seed.ts (imagens autorais) — presente na main. |
| #9 | `cee7a73` | CI honest semantics final — `.github/workflows/e2e-ci.yml` na main corresponde à versão do PR #9 (com `--passWithNoTests` no script de test:unit do `apps/backend/package.json`). |

### Superseded (substituídos por PR posterior)

| PR | SHA | Superseded por | Razão |
|----|-----|----------------|-------|
| #7 | `dafc294` | #8 → #9 | #7 adicionou Postgres/Redis services e `--passWithNoTests` ao e2e-ci.yml, mas foi seguido por #8 (que refinou db:migrate e secrets) e #9 (que substituiu a lógica de CI por "honest semantics" — discovery explícito de testes, `continue-on-error`, gate summary). A versão final do `e2e-ci.yml` na main (`b4515b2`) corresponde à do PR #9, não à do #7. |
| #8 | `d5eb05d` | #9 | #8 refinou o `e2e-ci.yml` (pnpm 10.11.1, db:migrate step, secrets via `${{ secrets.* }}`), mas #9 reverteu algumas dessas escolhas (health-interval 5s, secrets hardcoded como "supersecret", removeu db:migrate explícito) e introduziu a arquitetura de honest CI. O diff #8→main é vazio para `apps/backend/package.json`, confirmando que #8 foi absorvido. |

### No-op

| PR | SHA | Razão |
|----|-----|-------|
| #10 | N/A | PR OPEN, não mergeado. Branch `copilot/fix-code-review-suggestion`. O body do PR explicita: "No code change was needed. The `******` is a GitHub Actions display-layer artifact." Changed files: 0, additions: 0, deletions: 0. Commit `aada1e9` ("Initial plan") é o único commit na branch. |

---

## Commits Corretivos Não Reconciliados

### Commit `88f20f5` — BB-05 gallery-hero reconciliation

| Campo | Valor |
|-------|-------|
| SHA | `88f20f54e561c95499a7d21e14b1ebb2257d8d9c` |
| Autor | boldfernando |
| Data | 2026-08-06 22:13:49 -0300 |
| Mensagem | `fix(gallery-hero): reconcile BB-05 — render live Medusa data in gallery hero` |
| Arquivos | 3 (`initial-data-seed.ts`, `gallery-hero-client.tsx`, `gallery-hero-data.ts`) |
| Diff | +36/−3 |
| Branches | `pr-e/bb05-reconciliation` (HEAD), `pr-f/qa-release-evidence` |
| **Está na main?** | **NÃO** — `git merge-base --is-ancestor 88f20f5 main` retorna exit code 1 |

#### Resumo do commit

> The gallery hero client discarded live items and always rendered a hardcoded fixture, so price/stock/metadata from Medusa never reached the GalleryExperience. Resolve live items first and fall back to the fixture only when empty.
>
> - gallery-hero-client: use items prop when non-empty, fall back to fixture
> - gallery-hero-data: filter by fio-vivo collection via getCollectionByHandle, graceful unfiltered fallback
> - initial-data-seed: capture createProductsWorkflow result and create a fio-vivo collection assigning the seeded products (createCollectionsWorkflow, guarded with try/catch)

#### Chain de branches não mergeadas que contêm `88f20f5`

| Branch | HEAD SHA | Descrição | Ancestry na main |
|--------|----------|-----------|-------------------|
| `pr-b/runtime-contract` | `82791db` | runtime contract (migrate/seed/readiness/classification/logs/teardown) | NÃO (exit 1) |
| `pr-c/reproducible-pipeline` | `125dcb1` | pin Node 20.18.0 in CI, add .nvmrc | NÃO (exit 1) |
| `pr-d/dependency-compat` | `62569c4` | security overrides, gallery-experience peer dep fix | NÃO (exit 1) |
| `pr-e/bb05-reconciliation` | `88f20f5` | BB-05 gallery-hero reconciliation (HEAD = 88f20f5) | NÃO (exit 1) |
| `pr-f/qa-release-evidence` | `00b28a1` | QA and release evidence for corrective PR sequence (PR-F) | NÃO (exit 1) |

Todas as 5 branches acima formam uma chain linear:
```
pr-b → pr-c → pr-d → pr-e (88f20f5) → pr-f (00b28a1)
```
Nenhuma delas foi mergeada na `main`. O PR #11 (OPEN, branch `pr-f/qa-release-evidence`) é o PR que tenta introduzir essa chain.

---

## Observação: PR #10 (no-op)

PR #10 (`copilot/fix-code-review-suggestion`, título "No-op: DATABASE_URL in e2e-ci.yml is already a valid connection string") é um PR aberto, sem diff, criado pelo Copilot SWE agent em resposta a um comentário de review sobre `DATABASE_URL` no `e2e-ci.yml`. O body do PR esclarece que `******` é um artefato de redação do GitHub Actions (o secrets engine redige `postgres:postgres@` porque corresponde a secrets registrados), e que o arquivo está correto. Não há merge, não há diff, não há CI checks. Deve ser fechado sem merge.

---

## Recomendação de Ação por PR

| PR | Recomendação |
|----|--------------|
| #3 | **Manter (authoritative).** Conteúdo vigente na main. CI falhou (Lint + E2E), mas os artefatos (Codebase Atlas, validator) são docs/scripts não bloqueantes. |
| #4 | **Manter (authoritative).** Bulk merge do BB-05 (imagens, lockfile, configs). CI indeterminado (checks expirados). Recomenda-se re-rodar CI para confirmar integridade do lockfile. |
| #5 | **Manter (authoritative).** ESLint 9 flat config + gallery-hero adapter. CI indeterminado. Verificar se lint passa localmente. |
| #6 | **Manter (authoritative).** Correção cirúrgica do initial-data-seed.ts (8 linhas de imagens). CI indeterminado. |
| #7 | **Arquivar (superseded).** Substituído por #8→#9. O `e2e-ci.yml` na main não corresponde à versão do #7. |
| #8 | **Arquivar (superseded).** Substituído por #9. O `e2e-ci.yml` final na main vem do #9, não do #8. |
| #9 | **Manter (authoritative).** CI honest semantics — versão final vigente na main. |
| #10 | **Fechar sem merge (no-op).** PR sem diff, sem código, sem necessidade. O comentário de review já foi resolvido pelo owner. |
| #11 | **Avaliar merge.** PR OPEN contendo a chain pr-b→pr-f, incluindo `88f20f5` (BB-05 reconciliation) e `00b28a1` (QA evidence). Se mergeado, introduz `88f20f5` na main. |

---

## Commits Corretivos — Ação Recomendada

| Commit | Branch | Status na main | Ação recomendada |
|--------|--------|----------------|------------------|
| `88f20f5` | `pr-e/bb05-reconciliation` | **AUSENTE** | Merge via PR #11 (ou cherry-pick isolado) se a reconciliação BB-05 do gallery-hero for necessária. Confirmar que `gallery-hero-client.tsx` e `gallery-hero-data.ts` não conflitam com versões atuais na main. |

---

## Linha do Tempo de Merges (UTC-3)

```
2026-08-06 16:31  PR #3 merge   (c633c0d)  Codebase Atlas + UA validator
2026-08-06 20:48  PR #4 merge   (f6d8ca9)  BB-05 Medusa integration bulk
2026-08-06 21:03  PR #5 merge   (56517f4)  ESLint 9 + gallery-hero adapter
2026-08-06 21:03  PR #6 merge   (82b5e55)  initial-data-seed images fix
2026-08-06 21:30  PR #7 merge   (dafc294)  CI: Postgres/Redis + passWithNoTests  ← superseded
2026-08-06 22:13  88f20f5       (pr-e)     BB-05 gallery-hero reconciliation    ← não mergeado
2026-08-06 22:22  PR #9 merge   (cee7a73)  CI: honest semantics (PR-A)           ← authoritative
2026-08-06 22:23  PR #8 merge   (d5eb05d)  CI: db:migrate + secrets refinement   ← superseded
2026-08-06 23:57  24d0de3       (main)     UA graph validator (merge commit)
2026-08-07 00:17  9aabbad       (main)     "revolution"
2026-08-07 00:41  8587c6c       (main)     "ok"
2026-08-07 00:58  b4515b2       (main)     "ok" ← BASELINE
```

---

## Notas Finais

1. **PR #10 é um PR GitHub distinto do commit `2ec7a53`** (que tem `(#10)` no título e é um squash commit do upstream `medusajs/dtc-starter` para bump `@medusajs/*` v2.14.1, datado de 2026-04-27, já na main). O PR #10 do `Fernadoteixeira/dtc-starter` é o PR no-op descrito acima.

2. **PRs #3, #4, #5, #7, #9 usam a mesma branch `feat/fio-vivo-bb05-medusa-integration`** como head ref. Cada merge subsequente avançou a branch e o merge trouxe apenas o delta incremental. Isso é esperado em fluxos de feature-branch de longa duração.

3. **CI status dos PRs #4–#10 é indeterminado** porque GitHub Actions não retém logs de checks indefinidamente e `gh pr checks` não retorna dados para esses PRs. Apenas o PR #3 tem checks registrados (todos FAIL: Lint & Unit Tests, Playwright E2E Shard 1/2 e 2/2).

4. **Commit `88f20f5` está confirmadamente AUSENTE da main** (`git merge-base --is-ancestor 88f20f5 main` → exit 1). Está presente apenas em `pr-e/bb05-reconciliation` e `pr-f/qa-release-evidence`, ambas não mergeadas.

5. **PR #11 (OPEN)** é o veículo para introduzir a chain pr-b→pr-f na main, incluindo `88f20f5`. Ação requer avaliação humana.