# 10.3 — Gate Table

**Data:** 2026-08-05
**Sessão:** Fio Vivo 360º Mega Prompt

---

## Status permitidos

- **PASS** — Gate aprovado com evidência
- **PASS WITH RISK** — Gate aprovado com ressalvas documentadas
- **BLOCKED** — Gate bloqueado por dependência não resolvida
- **NOT STARTED** — Gate não iniciado

---

## Gate Table

| Gate | Descrição | Status | Evidência | Bloqueio | Próxima ação |
|------|-----------|--------|-----------|----------|--------------|
| **Gate 0** | Descoberta concluída | **PASS** | 6 artefatos em `docs/fio-vivo/00-discovery/`: environment-inventory, repository-map, current-architecture, current-capabilities-matrix (101 caps), risks-and-constraints (12 riscos), assumptions-and-open-evidence | Nenhum | — |
| **Gate 1** | Fonte de verdade identificada | **PASS WITH RISK** | `fio-vivo-products.ts` identificada como fixture canônica (6 peças, 24 imagens); backend Medusa confirmado sem produtos Fio Vivo | Fixtures hardcoded no storefront, não no backend; override BB-03 ativo; metadados 100% "a informar" | Migrar para backend Medusa após coletar dados da artesã |
| **Gate 2** | PRD e arquitetura aprováveis | **PASS WITH RISK** | 4 artefatos em `01-product/` (vision, strategy, prd-360, personas); 1 em `05-technology/` (target-architecture); 4 em `02-design/` (experience, design-system, product-page-spec, catalog-wireframes) | PRD refere-se a hipóteses não validadas (preços, materiais, capacidade); arquitetura-alvo depende de dados externos | Validar PRD com artesã; confirmar preços e materiais |
| **Gate 3** | Modelo de dados validado | **NOT STARTED** | Spec de modelo de dados em `target-architecture.md` (módulos custom: fio-vivo-catalog, pricing-engine, artwork-identity, waiting-list, drop-manager, customization, reviews-verified, affiliate, holiday-calendar) | Sem implementação; sem migrations; sem validação de schema | Implementar após P0 (dados da artesã) e P1 (região BR, migração backend) |
| **Gate 4** | Design e jornada especificados | **PASS WITH RISK** | 4 artefatos em `02-design/`: experience-principles, design-system-extension, product-page-spec, catalog-wireframes; contrato visual YAML existente e validado (BB-04 R1) | Specs referem-se a metadados "a informar"; sem dados de dimensões, materiais, peso confirmados | Preencher metadados com dados da artesã; sessão fotográfica para lacunas (traseira, interior, uso no corpo, vídeo) |
| **Gate 5** | Pricing engine com testes | **NOT STARTED** | 4 artefatos em `03-pricing/`: pricing-strategy, pricing-engine-spec, pricing-examples, discount-governance; fórmulas auditáveis especificadas (Custo Completo, Piso Sustentável, Índice de Demanda, Preço Dinâmico, Corredores) | Sem dados de custo real (materiais, mão de obra, overhead); sem implementação do módulo; sem testes unitários | Coletar dados de custo (P0); implementar custom module (P2); escrever testes (piso, taxas, multiplicadores, limites) |
| **Gate 6** | Catálogo e checkout funcionando | **BLOCKED** | Gallery Hero funcional (BB-04 R1 verified, HTTP 200 em `/dk`); checkout components existem (18 componentes); cart, account, order modules presentes | Sem região BR no backend; sem BRL; sem Pix; produtos Fio Vivo não cadastrados no backend (apenas fixtures); default region `dk` | P0: coletar dados artesã; P1: criar região BR + BRL, migrar produtos para backend, integrar Pix |
| **Gate 7** | Analytics validado | **NOT STARTED** | 1 artefato em `07-analytics/`: analytics-architecture (North Star PSEEP, 9 ramos de métricas, 34 eventos taxonomy, 9 dashboards, 7 alertas) | Sem implementação de event taxonomy; sem CDP; sem PostHog; GA4 parcial (apenas gallery events) | Implementar event taxonomy P0 (17 eventos); migrar para PostHog (P1); configurar dashboards (P2) |
| **Gate 8** | Performance, a11y, segurança | **PASS WITH RISK** | E2E specs existem (8 specs incluindo a11y + lighthouse + performance); @axe-core/playwright configurado; CORS/JWT via env (existentes); Bloqueador Turbopack documentado | Sem LGPD/GDPR compliance; sem Sentry/observability; sem consent management; bloqueador Turbopack preexistente (calendar.tsx) | Resolver Turbopack (P1); implementar LGPD (P2); adicionar Sentry (P2); configurar cookie banner (P2) |
| **Gate 9** | Plano de lançamento e rollback | **PASS WITH RISK** | Roadmap em 6 horizontes (Day 0 a 12 meses); gates definidos (Gate 0-9); rollback strategy via feature flags; decision log (15 decisões) | Sem deploy pipeline (CI é validação apenas); sem staging environment | Configurar deploy pipeline (P2); criar staging (P1); definir rollback runbook (P2) |

---

## Resumo

| Status | Gates |
|---|---|
| PASS | Gate 0 |
| PASS WITH RISK | Gate 1, 2, 4, 8, 9 |
| BLOCKED | Gate 6 |
| NOT STARTED | Gate 3, 5, 7 |

- **Aprovados (total ou com risco):** 6/10
- **Bloqueados:** 1/10
- **Não iniciados:** 3/10

---

## Caminho crítico

```text
Gate 0 (PASS) → Gate 1 (PASS WITH RISK)
  → [P0: dados da artesã] → Gate 2 (validar PRD)
  → [P1: região BR + produtos backend + Pix] → Gate 6 (desbloquear)
    → Gate 3 (modelo de dados) → Gate 5 (pricing engine)
    → Gate 7 (analytics) → Gate 8 (security)
    → Gate 9 (deploy) → Lançamento
```

> O caminho crítico passa por **P0 (dados da artesã)** — sem metadados e custos, nenhum gate de implementação pode ser aprovado.

---

*Fim do gate-table.md*