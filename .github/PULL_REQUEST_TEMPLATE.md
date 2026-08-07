<!-- Fio Vivo 360º — PR Evidence Template (GOV-010)
     Preencha TODAS as seções. PRs incompletos não podem ser aprovados.
     Consulte: docs/artifacts/fio-vivo-360/governance-policy.md -->

## What

<!-- Descrição concisa do que muda neste PR. Liste os arquivos principais. -->

## Why

<!-- Motivação e contexto. Qual problema resolve? Qual Building Block ou gate? -->

## Test

<!-- Como validar as mudanças. Comandos de teste, passos manuais, ou links para specs. -->

## Risk

<!-- Riscos identificados e mitigações. Se baixo risco, explicitar. -->

## Rollback

<!-- Plano de reversão. Comando para reverter, feature flag, ou "revert PR". -->

## Evidence

<!-- Links para CI verde, screenshots, logs, ou resultados de testes. -->

---

### Scope Checklist (GOV-008)

- [ ] Arquivos alterados: <!-- preencher número, ex: 5 -->
- [ ] Linhas de diff: <!-- preencher número aproximado, ex: +120/-30 -->
- [ ] **Se > 20 arquivos ou > 2000 linhas:** justificativa de scope incluída em "Why" acima
- [ ] **Se > 50 arquivos:** label `large-pr-approved` adicionada (requer aprovação do admin do repositório)

### CI Status (GOV-007)

- [ ] `lint` — green
- [ ] `typecheck` — green
- [ ] `unit` — green
- [ ] `integration` — green
- [ ] `e2e` — green

### Reconciliation Ledger (GOV-003)

- [ ] Este PR requer atualização do reconciliation ledger? (Sim/Não)
- [ ] Se Sim: `docs/artifacts/fio-vivo-360/reconciliation-ledger.md` foi atualizado

### Classification (GOV-004)

<!-- Marque a classificação deste PR. Todo PR merged deve ter uma label. -->

- [ ] `authoritative` — conteúdo vigente na main
- [ ] `superseded` — substituído por PR posterior (especificar qual em "Why")
- [ ] `no-op` — sem diff (será fechado sem merge)
- [ ] `emergency-merge` — hotfix de produção durante freeze (GOV-001)

### Review (GOV-006)

- [ ] Revisor é diferente do autor
- [ ] Pelo menos 1 review `APPROVED`
- [ ] Todos os comentários de review resolvidos