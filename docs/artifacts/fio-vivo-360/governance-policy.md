# Governance Policy — Merge & Branch Protection

**Data:** 2026-08-07
**Programa:** Fio Vivo 360º — Reconciliação P0.2
**Repositório:** `Fernadoteixeira/dtc-starter`
**Branch protegida:** `main`
**Baseline SHA (main HEAD):** `b4515b2664c7276d7c2bfc69e3fc3ca5c366abe6`

---

## Contexto

O histórico de PRs #3–#10 demonstrou 4 merges com CI cancelado/falhando (PR #3 FAIL de lint e E2E; PRs #4–#8 com CI indeterminado por checks expirados), um PR "combo pack" de 76 arquivos (PR #4) sem justificativa documentada, um PR no-op sem diff (PR #10), e desvios severos de escopo. Esta política estabelece 10 regras (GOV-001 a GOV-010) para prevenir recorrência.

O reconciliation ledger ([reconciliation-ledger.md](./reconciliation-ledger.md)) classifica os PRs #3–#10 como authoritative/superseded/no-op e serve de base factual para esta política.

---

## Regras de Governança

### GOV-001 — Congelar merges não emergenciais durante reconciliação

| Campo | Valor |
|---|---|
| **Regra** | Durante o período de reconciliação do programa 360º, nenhum PR não emergencial pode ser mergeado em `main`. Merges emergenciais (hotfix de produção) exigem aprovação explícita do responsável designado e justificativa documentada no PR. |
| **Como aplicar no GitHub Settings** | Não há toggle nativo para "freeze". Aplicar via: (1) **Code → Branches → `main` → Restrict pushes that create matching branches**; (2) comunicar freeze no canal do projeto; (3) opcionalmente ativar temporariamente "Require a pull request before merging" com revisor obrigatório que recusa PRs não emergenciais. |
| **Como verificar compliance** | `gh pr list --state merged --base main --limit 5` — verificar se merges recentes têm justificativa de emergência. Comparar datas de merge com o período de freeze declarado. |
| **Responsável** | Admin do repositório (humano) |

---

### GOV-002 — Congelar SHA da main como baseline de reconciliação

| Campo | Valor |
|---|---|
| **Regra** | O SHA `b4515b2664c7276d7c2bfc69e3fc3ca5c366abe6` é o baseline canônico de `main` para a reconciliação P0.2. Todos os PRs reconciliados devem ser comparados contra este SHA. Nenhum commit direto em `main` é permitido durante a reconciliação. |
| **Como aplicar no GitHub Settings** | **Code → Branches → Add rule → Branch name pattern: `main` → ✅ Restrict who can push to matching branches →** selecionar apenas bots/admins de CI. Marcar **"Do not allow bypassing the above settings"** se disponível. |
| **Como verificar compliance** | `git rev-parse main` — confirmar que o HEAD não avançou além do baseline sem um merge via PR. `git merge-base --is-ancestor b4515b2664c7276d7c2bfc69e3fc3ca5c366abe6 main` deve retornar exit code 0. |
| **Responsável** | Admin do repositório (humano) |

---

### GOV-003 — Manter reconciliation ledger atualizado

| Campo | Valor |
|---|---|
| **Regra** | O arquivo `docs/artifacts/fio-vivo-360/reconciliation-ledger.md` deve ser atualizado a cada operação de merge, fechamento de PR, ou mudança de classificação de PR. O ledger é a fonte de verdade para classificação authoritative/superseded/no-op. |
| **Como aplicar no GitHub Settings** | Não é uma configuração do GitHub Settings. É um processo documental: após cada operação de merge/close, atualizar o ledger e incluir o link no PR correspondente. O PR template (GOV-010) deve conter um campo "Reconciliation Ledger Updated?" |
| **Como verificar compliance** | Comparar a data da última entrada do ledger com a data do último merge em `main` (`gh pr list --state merged --base main --limit 1`). Se o merge for mais recente que a última entrada do ledger, há não conformidade. |
| **Responsável** | Engenheiro/a de reconciliação (humano) |

---

### GOV-004 — Classificar PRs como superseded/authoritative

| Campo | Valor |
|---|---|
| **Regra** | Todo PR mergeado deve ser classificado como **authoritative** (vigente na main) ou **superseded** (substituído por PR posterior). A classificação deve ser registrada no reconciliation ledger com a razão e o PR que substituiu. PRs no-op devem ser fechados sem merge. |
| **Como aplicar no GitHub Settings** | Não é uma configuração nativa. Aplicar via: (1) usar **labels** do GitHub (`authoritative`, `superseded`, `no-op`) em cada PR; (2) registrar a classificação no ledger; (3) incluir a classificação no corpo do PR via template. |
| **Como verificar compliance** | `gh pr list --state all --limit 10 --json number,title,labels` — verificar se todos os PRs têm label de classificação. Cruzar com o ledger. |
| **Responsável** | Engenheiro/a de reconciliação (humano) |

---

### GOV-005 — Fechar/arquivar PRs no-op sem merge

| Campo | Valor |
|---|---|
| **Regra** | PRs sem diff (0 arquivos, 0 adições, 0 deleções) ou PRs que apenas respondem a um comentário de review sem alteração de código devem ser **fechados sem merge**. Nunca mergear um PR no-op. O PR #10 (`copilot/fix-code-review-suggestion`) deve ser fechado. |
| **Como aplicar no GitHub Settings** | (1) Verificar o PR com `gh pr view <n> --json files,additions,deletions`; (2) se `files.length === 0`, fechar com `gh pr close <n> --comment "Fechado: PR no-op sem diff. Resposta ao comentário de review já resolvida." --lock`; (3) adicionar label `no-op`. |
| **Como verificar compliance** | `gh pr list --state closed --limit 10 --json number,title,labels | jq '.[] | select(.labels[].name == "no-op")'` — confirmar que PRs no-op estão fechados, não merged. Verificar que nenhum PR merged tem 0 arquivos alterados. |
| **Responsável** | Admin do repositório (humano) |

---

### GOV-006 — Exigir review aprovado antes de merge

| Campo | Valor |
|---|---|
| **Regra** | Todo PR mergeado em `main` deve ter pelo menos **1 review aprovado** de um revisor diferente do autor. Self-review não conta. Reviews de bots (Copilot) contam como sugestão mas não como aprovação obrigatória. |
| **Como aplicar no GitHub Settings** | **Code → Branches → Add rule → Branch name pattern: `main` → ✅ Require a pull request before merging → Set minimum to 1 → ✅ Require approvals → ✅ Dismiss stale pull request approvals when new commits are pushed → ✅ Require review from Code Owners** (se `CODEOWNERS` existir). |
| **Como verificar compliance** | `gh pr list --state merged --base main --limit 10 --json number,reviews` — verificar se cada PR merged tem pelo menos 1 review com estado `APPROVED` de um usuário diferente do autor. |
| **Responsável** | Admin do repositório (humano) |

---

### GOV-007 — Exigir checks obrigatórios antes de merge

| Campo | Valor |
|---|---|
| **Regra** | Os seguintes checks de CI devem passar (status green) antes de qualquer merge em `main`: **lint**, **typecheck**, **unit tests**, **integration tests**, **E2E tests**. Um PR não pode ser mergeado se qualquer check estiver cancelado, falhando, ou pendente. |
| **Como aplicar no GitHub Settings** | **Code → Branches → Add rule → Branch name pattern: `main` → ✅ Require status checks to pass before merging →** adicionar os checks obrigatórios: `lint`, `typecheck`, `unit`, `integration`, `e2e`. Marcar **✅ Require branches to be up to date before merging**. Os nomes dos checks devem corresponder exatamente aos nomes registrados nas workflows do GitHub Actions. |
| **Como verificar compliance** | `gh pr checks <pr-number>` — verificar que todos os checks obrigatórios estão presentes e com status `success`. Para auditoria histórica: `gh pr view <pr-number> --json statusCheckRollup`. |
| **Responsável** | Admin do repositório (humano) |

---

### GOV-008 — Limite de scope por PR

| Campo | Valor |
|---|---|
| **Regra** | PRs com mais de **20 arquivos alterados** ou mais de **2000 linhas de diff** devem incluir uma justificativa explícita de scope no corpo do PR (campo "Why" do template) e aprovação de um segundo revisor. PRs com 50+ arquivos (como PR #4 com 76 arquivos) são proibidos sem aprovação documentada do admin do repositório. O template de PR deve incluir a contagem de arquivos. |
| **Como aplicar no GitHub Settings** | Não há toggle nativo para limite de arquivos. Aplicar via: (1) **PR template** (GOV-010) que exige preencher contagem de arquivos e justificativa se > 20; (2) revisor deve verificar `gh pr view <n> --json files \| jq '.files \| length'` antes de aprovar; (3) usar GitHub Actions com um job que falha se `files > 20` e não houver label `large-pr-approved`. |
| **Como verificar compliance** | `gh pr list --state merged --base main --limit 20 --json number,files \| jq '.[] \| {pr: .number, count: (.files \| length)}'` — identificar PRs com > 20 arquivos e verificar se têm justificativa no corpo. |
| **Responsável** | Revisor do PR (humano); admin para > 50 arquivos |

---

### GOV-009 — Bloquear auto/self-merge quando CI não estiver green

| Campo | Valor |
|---|---|
| **Regra** | O auto-merge e o self-merge (autor mescla seu próprio PR) ficam **bloqueados** quando qualquer check obrigatório (GOV-007) não estiver green. O autor não pode mergear seu próprio PR sem review aprovado, independentemente do status do CI. |
| **Como aplicar no GitHub Settings** | **Code → Branches → Add rule → Branch name pattern: `main` → ✅ Require a pull request before merging → ✅ Require approvals (min 1) → ✅ Require status checks to pass before merging** (vincula ao GOV-007). **Settings → General → Pull Requests → ✅ Disable auto-merge** (ou manter auto-merge mas apenas com todos os checks green). **✅ Restrict who can dismiss pull request reviews** (para evitar que o autor dispense um review bloqueante). |
| **Como verificar compliance** | `gh pr list --state merged --base main --limit 10 --json number,author,reviewDecision,statusCheckRollup` — cruzar: se o author é igual ao mergista e não há review `APPROVED`, ou se algum check não é `success`, há violação. |
| **Responsável** | Admin do repositório (humano) |

---

### GOV-010 — Padronizar PR evidence template

| Campo | Valor |
|---|---|
| **Regra** | Todo PR mergeado deve usar o template padronizado (`.github/PULL_REQUEST_TEMPLATE.md`) contendo as seções obrigatórias: **What** (o que muda), **Why** (por que), **Test** (como testar), **Risk** (riscos), **Rollback** (como reverter), **Evidence** (evidência de testes/screenshots/CI). PRs sem template completo não podem ser aprovados. |
| **Como aplicar no GitHub Settings** | (1) Criar o arquivo `.github/PULL_REQUEST_TEMPLATE.md` no repositório (já criado por esta política); (2) o GitHub automaticamente usa o template ao criar PRs; (3) revisor deve verificar que todas as 6 seções estão preenchidas antes de aprovar. |
| **Como verificar compliance** | `gh pr list --state merged --base main --limit 10 --json number,body` — verificar se o corpo do PR contém as 6 seções (`## What`, `## Why`, `## Test`, `## Risk`, `## Rollback`, `## Evidence`). |
| **Responsável** | Revisor do PR (humano) |

---

## PR Evidence Template

O arquivo `.github/PULL_REQUEST_TEMPLATE.md` foi criado como parte desta política. O template exige:

1. **What** — descrição concisa das mudanças
2. **Why** — motivação e contexto
3. **Test** — como validar as mudanças
4. **Risk** — riscos identificados e mitigações
5. **Rollback** — plano de reversão
6. **Evidence** — links para CI verde, screenshots, logs
7. **Scope checklist** — contagem de arquivos e justificativa se > 20
8. **Reconciliation ledger** — confirmação de atualização

---

## Checklist de Aplicação para o Admin do Repositório

> **Instruções:** O admin do repositório deve executar cada item abaixo no GitHub Settings do repositório `Fernadoteixeira/dtc-starter`. Cada item corresponde a uma ou mais regras GOV.

### Configuração de Branch Protection (GOV-001, GOV-002, GOV-006, GOV-007, GOV-009)

- [ ] **Acessar:** Settings → Branches → Add branch protection rule
- [ ] **Branch name pattern:** `main`
- [ ] [ ] **Require a pull request before merging** → Minimum: 1 approval (GOV-006)
- [ ] [ ] **Dismiss stale pull request approvals when new commits are pushed** (GOV-006)
- [ ] [ ] **Require status checks to pass before merging** (GOV-007)
  - [ ] Adicionar checks: `lint`, `typecheck`, `unit`, `integration`, `e2e`
  - [ ] **Require branches to be up to date before merging**
- [ ] [ ] **Require conversation resolution before merging** (GOV-010 — garante que todos os comentários do template foram resolvidos)
- [ ] [ ] **Require review from Code Owners** (se `.github/CODEOWNERS` existir) (GOV-006)
- [ ] [ ] **Restrict who can push to matching branches** → apenas CI/admin (GOV-002)
- [ ] [ ] **Restrict who can dismiss pull request reviews** → apenas admins (GOV-009)
- [ ] [ ] **Do not allow bypassing the above settings** (GOV-002, GOV-009)
- [ ] [ ] **Create** (salvar a regra)

### Configuração de Auto-merge (GOV-009)

- [ ] **Acessar:** Settings → General → Pull Requests
- [ ] [ ] **Allow auto-merge** → desativar, OU ativar apenas com checks obrigatórios green
- [ ] [ ] Confirmar que o autor do PR não pode self-merge sem review aprovado

### Criação de Labels (GOV-004, GOV-005, GOV-008)

- [ ] **Acessar:** Issues → Labels → New label
- [ ] [ ] Criar label `authoritative` (verde) — PR vigente na main
- [ ] [ ] Criar label `superseded` (amarelo) — PR substituído por outro
- [ ] [ ] Criar label `no-op` (cinza) — PR sem diff, fechado sem merge
- [ ] [ ] Criar label `large-pr-approved` (azul) — PR > 20 arquivos com aprovação do admin (GOV-008)
- [ ] [ ] Criar label `emergency-merge` (vermelho) — hotfix de produção durante freeze (GOV-001)

### Fechamento de PRs No-op (GOV-005)

- [ ] **Verificar:** `gh pr view 10 --json files,additions,deletions`
- [ ] [ ] Se `files.length === 0`: `gh pr close 10 --comment "Fechado: PR no-op sem diff (GOV-005)." --lock`
- [ ] [ ] Adicionar label `no-op` ao PR #10

### Validação do PR Template (GOV-010)

- [ ] **Confirmar:** arquivo `.github/PULL_REQUEST_TEMPLATE.md` existe na raiz do repositório
- [ ] [ ] Criar um PR de teste e verificar que o template aparece automaticamente
- [ ] [ ] Confirmar que as 6 seções (What/Why/Test/Risk/Rollback/Evidence) + scope checklist + reconciliation ledger estão presentes

### Validação de CI Checks (GOV-007)

- [ ] **Verificar workflows existentes:** `ls .github/workflows/`
- [ ] [ ] Confirmar que existem jobs nomeados `lint`, `typecheck`, `unit`, `integration`, `e2e`
- [ ] [ ] Se algum não existir, documentar como faltante e criar issue para implementar
- [ ] [ ] Confirmar que os nomes dos jobs no GitHub Actions correspondem aos nomes registrados no branch protection rule

### Congelamento de Baseline (GOV-002)

- [ ] **Verificar:** `git rev-parse main` retorna `b4515b2664c7276d7c2bfc69e3fc3ca5c366abe6` ou um descendente via merge de PR
- [ ] [ ] Confirmar que nenhum commit direto (sem PR) foi feito em `main` após o baseline
- [ ] [ ] `git log main --oneline --no-merges --since="2026-08-07"` deve estar vazio (nenhum commit direto após baseline)

---

## Tabela Resumo

| Regra | Título | Tipo | Responsável |
|-------|--------|------|-------------|
| GOV-001 | Congelar merges não emergenciais durante reconciliação | Processo | Admin do repo |
| GOV-002 | Congelar SHA da main como baseline | Branch protection | Admin do repo |
| GOV-003 | Manter reconciliation ledger atualizado | Processo documental | Eng. de reconciliação |
| GOV-004 | Classificar PRs como superseded/authoritative | Processo + labels | Eng. de reconciliação |
| GOV-005 | Fechar/arquivar PRs no-op sem merge | Ação direta | Admin do repo |
| GOV-006 | Exigir review aprovado antes de merge | Branch protection | Admin do repo |
| GOV-007 | Exigir checks obrigatórios (lint, typecheck, unit, integration, E2E) | Branch protection | Admin do repo |
| GOV-008 | Limite de scope por PR (proibir combo pack de 76 arquivos) | Processo + CI gate | Revisor + Admin |
| GOV-009 | Bloquear auto/self-merge quando CI não estiver green | Branch protection | Admin do repo |
| GOV-010 | Padronizar PR evidence template | Template de repo | Revisor de PR |

---

## Referências

- [Reconciliation Ledger](./reconciliation-ledger.md) — classificação factual de PRs #3–#10
- [Decision Log](./decision-log.md) — 15 decisões do programa 360º
- [Gate Table](./gate-table.md) — status de 10 gates de qualidade
- [PR Evidence Template](../../../.github/PULL_REQUEST_TEMPLATE.md) — template padronizado de PR
- [GitHub: Managing branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/managing-branch-protection-rules)
- [GitHub: About required status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/about-protected-branches#require-status-checks-before-merging)

---

*Fim de governance-policy.md*