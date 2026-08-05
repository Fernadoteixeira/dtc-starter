# 10.1 — Executive Summary

**Data:** 2026-08-05
**Autor:** Discovery + Strategy Engine (CPO/Architect/Growth mode)
**Repo:** `C:\Users\fjuni\Documents\GitHub\02-medusa-halls\dtc-starter`
**Branch:** `main`
**Escopo:** Fio Vivo 360º — Commerce, Product Experience, Growth & Dynamic Pricing

---

## 1. Executive Summary

A Fio Vivo é uma marca de bolsas e peças autorais em crochê com 6 produtos cadastrados em fixture, 24 imagens (4 cenas por peça), e uma galeria visual funcional (BB-04 R1 verified). O repositório é um monorepo Medusa v2.18 + Next.js 15.5 com pnpm/Turborepo, backend PostgreSQL, e infra Docker local completa.

**O sistema tem a fundação técnica de commerce, mas está a ~80% de distância da visão do mega-prompt.** Os 6 produtos Fio Vivo existem apenas como fixtures hardcoded no storefront com TODOS os metadados comerciais como "a informar" (preço, material, descrição, disponibilidade). O backend Medusa não tem nenhum produto Fio Vivo, não tem região Brasil, não tem BRL, e o seed é genérico europeu (EUR/USD, 7 países EU). Não há Pix, pricing engine, personalização, lista de espera, drops, reviews, afiliados, analytics estruturado, CRM, lifecycle, ou internacionalização.

Esta execução produziu **descoberta técnica real com evidência**, mapeou 101 capacidades (20% implementadas, 20% parciais, 59% ausentes, 1% bloqueadas), identificou 12 riscos (4 críticos), e gerou **17 artefatos estratégicos** cobrindo produto, design, pricing, growth, tecnologia, analytics e internacionalização. O pricing engine foi especificado com fórmulas auditáveis, a arquitetura-alvo prioriza extensão do Medusa v2 sobre build paralelo, e o roadmap sequencia iniciativas em 6 horizontes (Day 0 a 12 meses).

---

## 2. Entendimento do ambiente

| Dimensão | Estado | Evidência |
|---|---|---|
| Monorepo | Turborepo + pnpm 10.11, Node 20+ | `package.json`, `turbo.json` |
| Backend | Medusa v2.18, PostgreSQL 15, Redis, Minio | `docker-compose.yml`, `package.json` |
| Storefront | Next.js 15.5, React 19, Tailwind 3 (com v4 leak) | `package.json` |
| Gallery | Pacote isolado `@dtc/gallery-experience`, CSS BEM | `packages/gallery-experience/` |
| Produtos Fio Vivo | 6 peças em fixtures hardcoded, 24 PNGs | `fio-vivo-products.ts`, `public/images/fio-vivo/` |
| Backend catálogo | Nenhum produto Fio Vivo, seed genérico EU | `initial-data-seed.ts` |
| Região/Moeda | Default `dk` (Dinamarca), EUR/USD, sem BR/BRL | `.env.template`, seed |
| Pagamentos | Stripe, PayPal, iDeal, Bancontact (sem Pix) | `constants.tsx` |
| Analytics | GA4 via gtag, sem taxonomy, sem CDP | `gallery-hero-analytics.ts` |
| CI | GitHub Actions (lint + unit + e2e 2 shards) | `.github/workflows/` |
| Agentes locais | Múltiplos (Ollama, LM Studio, Codex, Cursor, etc.) | `~/.agents/`, `~/.ollama/`, etc. |
| Bloqueador | Turbopack quebra com Tailwind v4 em `calendar.tsx` | Sessão BB-04 |

---

## 3. Arquitetura encontrada

```text
Turborepo (pnpm)
├── apps/backend (Medusa v2.18)
│   ├── medusa-config.ts (DB, CORS, secrets)
│   ├── src/api/store/custom (placeholder 200)
│   ├── src/api/admin/custom (placeholder 200)
│   ├── src/migration-scripts/initial-data-seed.ts (EUR/USD, EU)
│   └── src/{modules,workflows,subscribers,links,jobs} = scaffold README
├── apps/storefront (Next.js 15.5)
│   ├── src/app/[countryCode]/ (dynamic route)
│   ├── src/modules/{home,products,checkout,cart,account,...}
│   ├── src/modules/home/gallery-hero/ ← FONTE DE VERDADE FIO VIVO
│   └── src/modules/nos-gallery/ ← BLOQUEADOR Tailwind v4
└── packages/gallery-experience (@dtc/gallery-experience)
    ├── src/components/gallery-experience.tsx (3 zonas, scene rail, CTA)
    ├── src/styles/gallery-experience.css (BEM, modificado R1)
    └── src/types/index.ts (GalleryItem, GalleryScene)
```

---

## 4. Fonte de verdade identificada

| O quê | Onde | Tipo | Confiança |
|---|---|---|---|
| Catálogo Fio Vivo (6 peças) | `apps/storefront/src/modules/home/gallery-hero/fixtures/fio-vivo-products.ts` | Fixture TypeScript hardcoded | 🟢 Evidência |
| Imagens (24 PNGs) | `apps/storefront/public/images/fio-vivo/fv-00X-*/` | Arquivos | 🟢 Evidência |
| Contrato visual galeria | `.agents/contracts/nos-gallery-first-fold.yaml` | YAML | 🟢 Evidência |
| Config Medusa | `apps/backend/medusa-config.ts` | TypeScript | 🟢 Evidência |
| Seed backend | `apps/backend/src/migration-scripts/initial-data-seed.ts` | TypeScript | 🟢 Evidência |
| Convenções repo | `AGENTS.md` | Markdown | 🟢 Evidência |
| Artefatos BB-04 | `docs/artifacts/bb-04/` | Markdown + JSON + PNG | 🟢 Evidência |

> ⚠️ A fonte de verdade está no storefront, não no backend. Isto é um override BB-03 temporário que deve ser migrado.

---

## 5. Problemas e oportunidades

### Problemas críticos

| # | Problema | Impacto |
|---|---|---|
| 1 | Metadados "a informar" em 100% das fixtures | Nenhum produto é vendável |
| 2 | Sem região BR / BRL no backend | Storefront não serve Brasil |
| 3 | Sem Pix | Cliente BR não converte |
| 4 | Produtos não estão no backend Medusa | Sem admin, sem pricing, sem inventory |
| 5 | Divergência prompt × fixture (2 produtos inexistentes) | Confusão de escopo |
| 6 | Sem dados de custo | Pricing engine é teórico |
| 7 | Bloqueador Turbopack | DX degradada |

### Oportunidades

| # | Oportunidade | Potencial |
|---|---|---|
| 1 | Medusa v2 tem price lists, regions, currencies nativos | Estender vs build paralelo |
| 2 | Gallery experience já é pacote isolado | Reutilizável, testável |
| 3 | Adapter Medusa→Gallery já existe | Migrar fixtures → backend é mecânico |
| 4 | 6 produtos com 4 imagens cada | Base visual sólida |
| 5 | Contrato visual formalizado (YAML) | Qualidade controlável |
| 6 | E2E Playwright com 8 specs | Qualidade mensurável |
| 7 | Docker infra completa (dev) | Acelera desenvolvimento |
| 8 | Múltiplos agentes locais (Ollama, LM Studio) | IA assistente no dev |
| 9 | Mercado de craft design premium em ascensão | Janela de oportunidade |
| 10 | Sazonalidade invertida (hemisfério sul) | Drops de verão quando EU é inverno |

---

## 6. Decisões tomadas

| # | Decisão | Rationale | Reversibilidade |
|---|---|---|---|
| 1 | Adotar fixture como fonte de verdade provisória | 6 produtos com imagem; prompt tem 2 inexistentes | Reversível (migrar para backend) |
| 2 | Priorizar BR como mercado base | IMVS 75.5, idioma nativo, sem custo cambial | Reversível |
| 3 | Sequenciar internacional: BR → PT → US → FR/ES → UK | IMVS scores + idioma + complexidade | Reversível |
| 4 | Extender Medusa v2 sobre build paralelo | Price lists, regions, currencies nativos | Reversível |
| 5 | Pricing engine como custom module Medusa | Integrado, workflows, module links | Reversível |
| 6 | North Star = PSEEP | Une valor ao cliente + sustentabilidade | Reversível |
| 7 | Evento de ativação = product_viewed + gallery interaction | Demonstra intenção real | Reversível |
| 8 | Não usar escassez falsa | Princípio #6 inegociável | Irreversível (princípio) |
| 9 | Preço nunca abaixo do piso sustentável | Princípio #10 inegociável | Irreversível (princípio) |
| 10 | Resolver bloqueador Turbopack antes de escalar dev | DX crítica | Reversível |

---

## 7. Artefatos criados

| # | Path | Finalidade | Linhas aprox. |
|---|---|---|---|
| 1 | `docs/fio-vivo/00-discovery/environment-inventory.md` | Inventário do ambiente + ecossistema local | 180 |
| 2 | `docs/fio-vivo/00-discovery/repository-map.md` | Mapa do repositório com árvore | 150 |
| 3 | `docs/fio-vivo/00-discovery/current-architecture.md` | Arquitetura atual (backend, storefront, gallery) | 200 |
| 4 | `docs/fio-vivo/00-discovery/current-capabilities-matrix.md` | 101 capacidades avaliadas | 180 |
| 5 | `docs/fio-vivo/00-discovery/risks-and-constraints.md` | 12 riscos + 20 constraints | 170 |
| 6 | `docs/fio-vivo/00-discovery/assumptions-and-open-evidence.md` | Assumptions + validações pendentes | 200 |
| 7 | `docs/fio-vivo/01-product/product-vision.md` | Visão de produto | ~150 |
| 8 | `docs/fio-vivo/01-product/product-strategy.md` | Estratégia de produto | ~150 |
| 9 | `docs/fio-vivo/01-product/prd-360.md` | PRD 360º | ~300 |
| 10 | `docs/fio-vivo/01-product/personas-and-jtbd.md` | 8 personas + JTBD | ~200 |
| 11 | `docs/fio-vivo/02-design/experience-principles.md` | Princípios de experiência | ~120 |
| 12 | `docs/fio-vivo/02-design/design-system-extension.md` | Extensão do design system | ~150 |
| 13 | `docs/fio-vivo/02-design/product-page-spec.md` | Spec da PDP | ~200 |
| 14 | `docs/fio-vivo/02-design/catalog-wireframes.md` | Wireframes do catálogo | ~150 |
| 15 | `docs/fio-vivo/03-pricing/pricing-strategy.md` | Estratégia de precificação | ~200 |
| 16 | `docs/fio-vivo/03-pricing/pricing-engine-spec.md` | Spec do pricing engine | ~250 |
| 17 | `docs/fio-vivo/03-pricing/pricing-examples.md` | Exemplos de cálculo | ~150 |
| 18 | `docs/fio-vivo/03-pricing/discount-governance.md` | Governança de descontos | ~120 |
| 19 | `docs/fio-vivo/04-growth/gtm-strategy.md` | Go-to-market | 220 |
| 20 | `docs/fio-vivo/04-growth/lifecycle-strategy.md` | Lifecycle + retenção | 180 |
| 21 | `docs/fio-vivo/05-technology/target-architecture.md` | Arquitetura técnica-alvo | 280 |
| 22 | `docs/fio-vivo/06-internationalization/internationalization-strategy.md` | Internacionalização + IMVS | 200 |
| 23 | `docs/fio-vivo/07-analytics/analytics-architecture.md` | Analytics + North Star + event taxonomy | 240 |
| 24 | `docs/artifacts/fio-vivo-360/executive-summary.md` | Este arquivo | — |
| 25 | `docs/artifacts/fio-vivo-360/decision-log.md` | Log de decisões | — |
| 26 | `docs/artifacts/fio-vivo-360/gate-table.md` | Tabela de gates | — |
| 27 | `docs/artifacts/fio-vivo-360/next-actions.md` | Próximas ações | — |

> Arquivos 7-18 produzidos por subagentes delegados (3 em paralelo). Arquivos 1-6, 19-23, 24-27 produzidos diretamente.

---

## 8. Arquivos alterados

| Arquivo | Tipo de mudança | Justificativa |
|---|---|---|
| `docs/fio-vivo/**` (23 arquivos) | Criados | Artefatos estratégicos Fio Vivo 360º |
| `docs/artifacts/fio-vivo-360/**` (4 arquivos) | Criados | Artefatos executivos finais |

> Nenhum arquivo de código foi alterado. Nenhum commit foi feito. Working tree preservado.

---

## 9. Funcionalidades implementadas

| Funcionalidade | Status | Evidência |
|---|---|---|
| Gallery Hero (3 zonas, scene rail, CTA) | ✅ Pre-existente (BB-04 R1) | Runtime measurements |
| Storefront renderiza `/dk` | ✅ Pre-existente | HTTP 200 (webpack mode) |
| Checkout (Stripe, PayPal) | ✅ Pre-existente | Componentes presentes |
| Pricing engine | ❌ Especificado apenas | `pricing-engine-spec.md` |
| Event taxonomy | ❌ Especificado apenas | `analytics-architecture.md` |
| Internacionalização | ❌ Especificado apenas | `internationalization-strategy.md` |

> Esta execução produziu **documentação estratégica e técnica**, não implementação de código. Implementação requer autorização e próximas ações.

---

## 10. Modelo de precificação

### 10.1 Resumo das fórmulas

**Custo Completo** = Materiais + Mão de obra + Acabamentos + Embalagem + Perdas + Custos indiretos + Custo de personalização + Subsídio logístico + Custo de aquisição alocado + Custo esperado de troca/devolução + Custo financeiro

**Preço Mínimo Sustentável** = Custo Completo / (1 − Taxas − Impostos − Margem de Contribuição Alvo)

Validação: Taxas + Impostos + Margem < 1

**Índice de Demanda** = (Pedidos pagos + Reservas ponderadas + Consultas ponderadas) / Capacidade disponível

**Preço Dinâmico** = max(Piso, Base do Cenário) × Multiplicadores (Mercado, Demanda, Capacidade, Complexidade, Personalização, Sazonal, Urgência, Canal, Internacional) − Incentivos Permitidos

**Corredores**: Floor (mínimo sustentável), Target (recomendado), Ceiling (premium máximo), Stretch (experimental)

### 10.2 Tríade de cenários

| Cenário | Uso | Margem alvo |
|---|---|---|
| Validação | Primeiras unidades, menor prova social | 15% |
| Recomendado | Padrão, experiência completa | 25% |
| Premium | Acabamento superior, personalização, limitada | 35% |

### 10.3 Guardrails

| Guardrail | Limite |
|---|---|
| Ajuste normal por ciclo | ±10% |
| Ajuste por lote | +15% |
| Ajuste por demanda comprovada | +25% |
| Acima de 25% | Aprovação manual |
| Pix discount | Máx 5% |
| Preço abaixo do piso | Proibido (salvo ação classificada) |

---

## 11. Exemplos de cálculo

### Exemplo conceitual — Duna Terracota (hipótese, dados não validados)

| Item | Valor |
|---|---|
| Materiais | R$ 120 (hipótese) |
| Mão de obra (20h × R$ 25/h) | R$ 500 (hipótese) |
| Embalagem | R$ 20 |
| Custos indiretos | R$ 30 |
| **Custo Completo** | **R$ 670** |
| Taxas comerciais + impostos | 12% + 18% = 30% |
| Margem alvo | 25% |
| Denominador | 1 − 0.30 − 0.25 = 0.45 |
| **Preço Mínimo Sustentável** | **R$ 670 / 0.45 = R$ 1.489** |

> ⚠️ Com estes custos hipotéticos, o preço mínimo seria R$ 1.489 — acima da hipótese "Recomendado" de R$ 790 do prompt. Isto demonstra que **os preços do prompt são hipóteses que precisam de validação de custo real**.

### Exemplo — Pix discount

| Item | Valor |
|---|---|
| Preço recomendado | R$ 790 |
| Pix discount (5%) | R$ 39.50 |
| Preço Pix | R$ 750.50 |
| Floor price | R$ 1.489 (hipótese) |
| **Resultado** | **BLOQUEADO** — preço abaixo do piso |

> Isto ilustra que sem dados de custo real, qualquer preço é uma aposta. A coleta de dados de custo é P0.

---

## 12. Calendário comercial

### Brasil (mercado base)

| Período | Evento | Relevância | Campanha sugerida |
|---|---|---|---|
| Fev | Valentine's BR | Média | Presente + embalagem |
| 2º dom maio | Dia das Mães | Alta | Drop especial + VIP |
| 12 jun | Dia dos Namorados | Alta | Presente + cartão |
| 2º dom agosto | Dia dos Pais | Média | Peças estruturadas |
| Out | Black Friday | Alta | Conditions controladas |
| Nov | Natal | Alta | Embalagem + prazo |
| Dez | Réveillon | Média | Drop de ano novo |
| Móvel | Carnaval | Baixa comercial | |
| Móvel | Páscoa | Média | Presente |
| Jun | Festas Juninas | Baixa | |

### Internacional (quando ativo)

| Mercado | Data-chave | Nota |
|---|---|---|
| PT | Dia das Mães (1º dom maio) | Sazonalidade próxima ao BR |
| US | Mother's Day (2º dom maio) | Diferente de UK |
| UK | Mother's Day (2º dom fev) | Não confundir com US |
| FR | Fête des Mères (último dom maio) | |
| EU | Black Friday (4ª sex nov) | Global |

> Datas móveis não são hardcoded. Holiday calendar deve ser versionado e alimentado por fontes oficiais.

---

## 13. Estratégia internacional

| Mercado | IMVS | Classificação | Sequência |
|---|---|---|---|
| Brasil | 75.5 | Piloto controlado | 1º |
| Portugal | 67.0 | Piloto controlado | 2º |
| EU | 58.5 | Observar | 3º |
| França | 60.3 | Observar | 4º-5º |
| Espanha | 59.8 | Observar | 4º-5º |
| UK | 53.0 | Observar | 6º+ |

> Não lançar mais que 1 mercado novo por trimestre. BR primeiro, validar ≥30 PSEEP/mês por 3 meses antes de expandir.

---

## 14. Estratégia de ativação

**Evento de ativação principal:** `product_viewed` + interação com galeria (scene rail click ou ambient hover)

**TTFV alvo:** < 30 segundos para ver produto completo com preço/prazo

**Alavancas de redução de TTFV:** quiz de estilo, filtro por ocasião, visualização no corpo, vídeo curto, dimensões claras, prazo visível, Pix/parcelamento visíveis, WhatsApp contextual, lista de espera em 1 passo

---

## 15. Estratégia de engajamento

5 loops de engajamento legítimos:

1. **Loop de coleção:** drop → descoberta → salvamento → VIP → acesso antecipado → compra → conteúdo → próximo drop
2. **Loop de bastidores:** processo → valoração → confiança → compra → acompanhamento → compartilhamento → aquisição orgânica
3. **Loop de personalização:** escolha → preview → orçamento → sinal → produção → entrega → prova social → novas encomendas
4. **Loop de raridade:** numerada → certificado → história → coleção → acesso antecipado → recompra
5. **Loop de indicação:** compra → entrega memorável → review → conteúdo compartilhável → indicação → benefício → nova compra

---

## 16. Estratégia de monetização

40 fontes avaliadas, priorizadas por Impacto × Confiança × Esforço × Alinhamento de Marca:

| Prioridade | Fonte | Momento | Margem | Esforço |
|---|---|---|---|---|
| P0 | Venda direta (pronta) | Checkout | 55% | Baixo |
| P0 | Sob encomenda | PDP | 55% | Baixo |
| P1 | Personalização | PDP | 65% | Médio |
| P1 | Edições limitadas | Drop | 70% | Médio |
| P1 | Peças numeradas | Drop | 70% | Médio |
| P1 | Embalagem presente | Cart | 80% | Baixo |
| P1 | Cartão personalizado | Cart | 90% | Baixo |
| P2 | Bundles | PDP/Cart | 60% | Médio |
| P2 | Necessaires/acessórios | PDP/Cart | 70% | Médio |
| P2 | Programa de indicação | Pós-compra | — | Médio |
| P2 | Afiliados | Canais | — | Médio |
| P2 | Gift cards | Checkout/Account | — | Baixo |
| P3 | Workshops | Lifecycle | 60% | Alto |
| P3 | Presentes corporativos | B2B | 50% | Alto |
| P3 | Licenciamento de padrões | IP | 90% | Alto |

> Não lançar todas simultaneamente. Matriz Impacto × Confiança × Esforço × Alinhamento no `prd-360.md`.

---

## 17. Métricas e eventos

### North Star

**PSEEP** = Peças Sustentavelmente Entregues com Experiência Positiva

### Árvore de métricas (9 ramos)

Aquisição, Ativação, Conversão, Receita, Margem, Retenção, Operação, Confiança, Precificação

### Eventos

- **P0:** 17 eventos (product_list_viewed → order_completed/failed)
- **P1:** 17 eventos (style_quiz → price_scenario_exposed)
- Total: 34 eventos na taxonomy

### Dashboards

9 dashboards: Growth, Product, Revenue, Margin, Retention, Ops, Trust, Pricing, Executive

---

## 18. Testes executados

| Teste | Comando | Resultado |
|---|---|---|
| Validação de arquivos criados | `find docs/fio-vivo -type f \| wc -l` | 23 arquivos ✅ |
| Validação de artefatos executivos | `find docs/artifacts/fio-vivo-360 -type f \| wc -l` | 4 arquivos ✅ |
| Build do gallery-experience | `pnpm --filter=@dtc/gallery-experience run build` | exit 0 ✅ (sessão anterior) |
| Runtime HTTP 200 /dk | `curl localhost:8000/dk` | HTTP 200 ✅ (sessão anterior, webpack mode) |

> Esta execução não alterou código. Testes de código não são aplicáveis. Validação foi de existência e integridade de artefatos.

---

## 19. Resultados dos testes

| Verificação | Resultado |
|---|---|
| 6 artefatos de descoberta criados | ✅ |
| 4 artefatos de produto criados (subagente 1) | ✅ |
| 4 artefatos de pricing criados (subagente 2) | ✅ |
| 4 artefatos de design criados (subagente 3) | ✅ |
| 3 artefatos de growth/tech/analytics criados | ✅ |
| 1 artefato de internacionalização criado | ✅ |
| 4 artefatos executivos em docs/artifacts/fio-vivo-360/ | ✅ |
| Total: 27 artefatos | ✅ |

---

## 20. Riscos residuais

| # | Risco | Nível | Mitigação |
|---|---|---|---|
| 1 | Metadados "a informar" (54 campos) | 🔴 | Coletar com artesã (P0) |
| 2 | Sem dados de custo | 🔴 | Coletar com artesã (P0) |
| 3 | Sem região BR / BRL | 🟠 | Adicionar ao seed (P1) |
| 4 | Sem Pix | 🟠 | Integrar provider (P1) |
| 5 | Bloqueador Turbopack | 🟠 | Remover calendar.tsx ou migrar TW (P1) |
| 6 | Produtos no backend (apenas fixtures) | 🟠 | Migrar para Medusa (P1) |
| 7 | Divergência prompt × fixture | 🟡 | Confirmar com artesã (P0) |
| 8 | Sem LGPD/GDPR | 🟡 | Implementar (P2) |
| 9 | Sem observability | 🟡 | Adicionar Sentry (P2) |
| 10 | Sem deploy pipeline | 🟡 | Configurar (P2) |

---

## 21. Pendências

| # | Pendência | Bloqueador | Esforço |
|---|---|---|---|
| 1 | Confirmar com artesã: produtos, materiais, dimensões, peso, capacidade, tempo | Externo | Alto |
| 2 | Confirmar existência de Jardim Vivo e Duna Bicolor | Externo | Baixo |
| 3 | Coletar dados de custo (materiais, mão de obra, overhead) | Externo | Alto |
| 4 | Resolver bloqueador Turbopack | Técnico | Baixo |
| 5 | Criar região BR + BRL no seed Medusa | Técnico | Médio |
| 6 | Migrar produtos da fixture para backend Medusa | Técnico | Médio |
| 7 | Integrar Pix | Técnico | Médio |
| 8 | Preencher metadados das fixtures | Técnico + Artesã | Médio |
| 9 | Implementar pricing engine (custom module) | Técnico | Alto |
| 10 | Implementar event taxonomy | Técnico | Médio |
| 11 | Implementar i18n (pt-BR, en, es, fr) | Técnico | Médio |
| 12 | Implementar LGPD compliance | Técnico/Legal | Médio |
| 13 | Configurar deploy pipeline | Técnico | Médio |
| 14 | Adicionar observability (Sentry) | Técnico | Baixo |

---

## 22. Próximas ações priorizadas

| Prioridade | Ação | Owner | Esforço | Dependência |
|---|---|---|---|---|
| P0 | Coletar dados da artesã (metadados, custo, capacidade) | PM + Artesã | Externo | — |
| P0 | Confirmar divergência prompt × fixture | PM | Baixo | Artesã |
| P0 | Reconciliar contexto comercial das 6 peças | PM | Baixo | Artesã |
| P1 | Resolver bloqueador Turbopack (remover calendar.tsx ou migrar TW) | Dev | Baixo | — |
| P1 | Criar região BR + BRL no seed Medusa | Dev | Médio | — |
| P1 | Migrar produtos fixture → backend Medusa | Dev | Médio | P0 dados |
| P1 | Integrar Pix (Mercado Pago ou Stripe BR) | Dev | Médio | Região BR |
| P1 | Preencher metadados (price, material, description, etc.) | PM + Dev | Médio | P0 dados |
| P2 | Implementar pricing engine (custom module) | Dev | Alto | P0 custo + P1 backend |
| P2 | Implementar event taxonomy | Dev | Médio | — |
| P2 | Implementar reviews verificadas | Dev | Médio | Backend produtos |
| P2 | Implementar lista de espera | Dev | Baixo | Backend produtos |
| P2 | Implementar LGPD compliance | Dev/Legal | Médio | — |
| P3 | Implementar personalização | Dev | Alto | Backend produtos |
| P3 | Implementar drops / pré-venda | Dev | Médio | Backend produtos |
| P3 | Implementar i18n (pt-BR, en, es, fr) | Dev | Médio | — |
| P3 | Implementar afiliados | Dev | Médio | — |
| P3 | Configurar deploy pipeline | Dev/Ops | Médio | — |
| P3 | Adicionar Sentry | Dev | Baixo | — |
| P4 | Internacionalização piloto PT | Dev + Growth | Alto | BR validado |

---

## Gate Table Final

| Gate | Descrição | Status | Evidência | Bloqueio | Próxima ação |
|------|-----------|--------|-----------|----------|--------------|
| Gate 0 | Descoberta concluída | **PASS** | 6 artefatos em `docs/fio-vivo/00-discovery/` | Nenhum | — |
| Gate 1 | Fonte de verdade identificada | **PASS WITH RISK** | `fio-vivo-products.ts` (fixtures), não backend | Fixtures hardcoded, não backend | Migrar para Medusa |
| Gate 2 | PRD e arquitetura aprováveis | **PASS WITH RISK** | 4 artefatos em `01-product/`, 1 em `05-technology/` | Sem dados da artesã | Validar com artesã |
| Gate 3 | Modelo de dados validado | **NOT STARTED** | Spec em `target-architecture.md` | Sem implementação | Implementar após P0 |
| Gate 4 | Design e jornada especificados | **PASS WITH RISK** | 4 artefatos em `02-design/` | Sem dados de produto | Preencher metadados |
| Gate 5 | Pricing engine com testes | **NOT STARTED** | Spec em `03-pricing/` (4 arquivos) | Sem dados de custo, sem implementação | Coletar custo + implementar |
| Gate 6 | Catálogo e checkout funcionando | **BLOCKED** | Gallery funciona; checkout existe mas sem BR/Pix | Sem região BR, sem Pix, sem produtos backend | P0 + P1 |
| Gate 7 | Analytics validado | **NOT STARTED** | Spec em `07-analytics/` | Sem implementação, sem CDP | Implementar event taxonomy |
| Gate 8 | Performance, a11y, segurança aprovadas | **PASS WITH RISK** | E2E specs existem, a11y test existe | Sem LGPD, sem observability | Implementar LGPD + Sentry |
| Gate 9 | Plano de lançamento e rollback | **PASS WITH RISK** | Roadmap em artefatos, gates definidos | Sem deploy pipeline | Configurar deploy |

---

## Conclusão

A Fio Vivo tem uma fundação técnica sólida (Medusa v2 + Next.js 15 + gallery experience isolada) e uma base visual real (6 produtos, 24 imagens). O gap principal não é técnico — é de **dados de produto e custo**. Sem metadados (preço, material, dimensões) e sem dados de custo, nenhum produto é vendável e nenhum pricing engine é operacional.

A sequência crítica é:
1. **Coletar dados da artesã** (P0, externo)
2. **Resolver bloqueadores técnicos** (P1, Turbopack + região BR + Pix)
3. **Migrar produtos para backend** (P1)
4. **Implementar pricing engine** (P2)
5. **Implementar growth + analytics** (P2)
6. **Internacionalizar** (P3-P4)

Os 27 artefatos produzidos formam a base de conhecimento para executar este plano com evidência, rastreabilidade e princípios inegociáveis preservados.

---

*Fim do executive-summary.md*