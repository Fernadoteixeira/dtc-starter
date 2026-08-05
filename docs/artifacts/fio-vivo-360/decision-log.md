# 10.2 — Decision Log

**Data:** 2026-08-05
**Sessão:** Fio Vivo 360º Mega Prompt

---

## Formato

Cada decisão registra: ID, data, decisão, rationale, alternativas consideradas, reversibilidade, impacto, status.

---

## D-001 — Adotar fixture como fonte de verdade provisória

| Campo | Valor |
|---|---|
| Data | 2026-08-05 |
| Decisão | Adotar `fio-vivo-products.ts` (6 peças) como fonte de verdade provisória do catálogo |
| Rationale | 6 produtos com 24 imagens reais; mega-prompt lista 2 produtos inexistentes (Jardim Vivo, Duna Bicolor); fixture tem 2 produtos não no prompt (Trama Solar, Fio Ancestral) |
| Alternativas | (a) Adotar prompt como fonte — rejeitado: 2 produtos não têm imagem nem fixture; (b) Aguardar artesã — rejeitado: trava progresso |
| Reversibilidade | Reversível — migrar para backend Medusa quando dados disponíveis |
| Impacto | Alto — define escopo de catálogo |
| Status | ✅ Decidida |

## D-002 — Priorizar Brasil como mercado base

| Campo | Valor |
|---|---|
| Decisão | BR é mercado base, primeiro a lançar |
| Rationale | IMVS 75.5 (mais alto); idioma nativo; sem custo cambial; sem complexidade import/export; LGPD menos complexa que GDPR |
| Alternativas | (a) US primeiro — rejeitado: IMVS 58.5, sem suporte EN, frete caro; (b) Multilançamento — rejeitado: viola princípio "não lançar todos simultaneamente" |
| Reversibilidade | Reversível |
| Impacto | Alto — define sequência de go-to-market |
| Status | ✅ Decidida |

## D-003 — Sequenciar internacional: BR → PT → US → FR/ES → UK

| Campo | Valor |
|---|---|
| Decisão | Sequência de expansão internacional baseada em IMVS |
| Rationale | BR (75.5) → PT (67.0, idioma compartilhado, UE) → US (58.5, volume mas complexo) → FR (60.3) / ES (59.8) → UK (53.0, Brexit) |
| Alternativas | (a) BR → US (volume) — rejeitado: complexidade logística/regulatória US; (b) BR → FR (fait main) — rejeitado: sem suporte FR nativo |
| Reversibilidade | Reversível |
| Impacto | Alto — define roadmap internacional |
| Status | ✅ Decidida |

## D-004 — Extender Medusa v2 sobre build paralelo

| Campo | Valor |
|---|---|
| Decisão | Usar price lists, regions, currencies, promotions nativos do Medusa v2; criar módulos custom apenas para o que não é nativo |
| Rationale | Medusa v2.18 tem price lists (cenários), regions (BR/US/EU), currencies (BRL/USD/EUR), promotions (cupom, Pix); construir paralelo duplica entidades e maintenance |
| Alternativas | (a) Pricing engine standalone — rejeitado: sem acesso a context Medusa; (b) Storefront-only — rejeitado: inseguro (client-side) |
| Reversibilidade | Reversível |
| Impacto | Alto — define arquitetura técnica |
| Status | ✅ Decidida |

## D-005 — Pricing engine como custom module Medusa

| Campo | Valor |
|---|---|
| Decisão | Implementar pricing engine como custom module em `apps/backend/src/modules/pricing-engine/` |
| Rationale | Integrado ao Medusa, accessa workflows, module links, DB; usa context Medusa (region, currency, customer) |
| Alternativas | (a) API route standalone — rejeitado: sem context; (b) Edge function — rejeitado: sem DB |
| Reversibilidade | Reversível |
| Impacto | Alto — define implementação de pricing |
| Status | ✅ Decidida |

## D-006 — North Star = PSEEP

| Campo | Valor |
|---|---|
| Decisão | North Star Metric = Peças Sustentavelmente Entregues com Experiência Positiva |
| Rationale | Une valor ao cliente (experiência positiva) + sustentabilidade artesanal (peças entregues) + saúde do negócio (volume + qualidade + retenção) |
| Alternativas | (a) GMV — rejeitado: não captura qualidade; (b) NPS — rejeitado: não captura volume; (c) Receita — rejeitado: não captura sustentabilidade artesanal |
| Reversibilidade | Reversível |
| Impacto | Alto — alinha toda organização |
| Status | ✅ Decidida |

## D-007 — Evento de ativação = product_viewed + gallery interaction

| Campo | Valor |
|---|---|
| Decisão | Ativação principal = `product_viewed` + interação com galeria (scene rail click ou ambient hover) |
| Rationale | Demonstra intenção real, não bounce passivo; usuário que vê produto e interage está em modo de avaliação |
| Alternativas | (a) Add-to-cart — rejeitado: muito fundil, perde早期 signal; (b) Checkout start — rejeitado: ainda mais fundil |
| Reversibilidade | Reversível |
| Impacto | Médio — define métrica de ativação |
| Status | ✅ Decidida |

## D-008 — Não usar escassez falsa

| Campo | Valor |
|---|---|
| Decisão | Escassez apenas quando comprovada por capacidade produtiva real |
| Rationale | Princípio #6 inegociável do mega-prompt; produção artesanal é naturalmente limitada — escassez real existe sem precisar inventar |
| Alternativas | Nenhuma (princípio) |
| Reversibilidade | Irreversível (princípio) |
| Impacto | Alto — define postura de marca |
| Status | ✅ Decidida (princípio) |

## D-009 — Preço nunca abaixo do piso sustentável

| Campo | Valor |
|---|---|
| Decisão | Preço mínimo = Custo Completo / (1 − Taxas − Impostos − Margem Alvo); nunca vender abaixo, salvo ação administrativa classificada |
| Rationale | Princípio #10 inegociável; garantir sustentabilidade econômica |
| Alternativas | Nenhuma (princípio) |
| Reversibilidade | Irreversível (princípio) |
| Impacto | Alto — define governance de pricing |
| Status | ✅ Decidida (princípio) |

## D-010 — Resolver bloqueador Turbopack antes de escalar dev

| Campo | Valor |
|---|---|
| Decisão | Remover ou isolar `calendar.tsx` (Tailwind v4) antes de escalar desenvolvimento |
| Rationale | Dev script default (`next dev --turbopack`) quebra; workaround (webpack mode) funciona mas não é DX ideal |
| Alternativas | (a) Migrar Tailwind para v4 global — rejeitado por ora: esforço alto, risco médio; (b) Isolar nos-gallery como pacote — viável mas mais complexo |
| Reversibilidade | Reversível |
| Impacto | Médio — DX |
| Status | ✅ Decidida |

## D-011 — Não alterar código nesta execução

| Campo | Valor |
|---|---|
| Decisão | Esta execução produz apenas documentação estratégica; nenhum arquivo de código é alterado |
| Rationale | Mega-prompt exige descoberta antes de alterar; sem dados da artesã, implementação seria prematura |
| Alternativas | (a) Implementar pricing engine sem dados de custo — rejeitado: seria teórico não operacional |
| Reversibilidade | Reversível |
| Impacto | Baixo (não altera código) |
| Status | ✅ Decidida |

## D-012 — Artefatos em docs/fio-vivo/ e docs/artifacts/fio-vivo-360/

| Campo | Valor |
|---|---|
| Decisão | Artefatos estratégicos em `docs/fio-vivo/{00-09}/`; artefatos executivos em `docs/artifacts/fio-vivo-360/` |
| Rationale | Separação clara: docs/fio-vivo = conhecimento; docs/artifacts = entregáveis executivos rastreáveis (alinhado com padrão BB-04) |
| Alternativas | (a) Tudo em docs/fio-vivo/ — rejeitado: artefatos executivos merecem destaque; (b) Tudo em docs/artifacts/ — rejeitado: mistura níveis |
| Reversibilidade | Reversível |
| Impacto | Baixo — organização |
| Status | ✅ Decidida |

## D-013 — Três subagentes em paralelo para artefatos pesados

| Campo | Valor |
|---|---|
| Decisão | Despachar 3 subagentes em paralelo para produto, pricing e design |
| Rationale | 12 artefatos independentes; paralelismo reduz tempo; cada subagent tem contexto isolado |
| Alternativas | (a) Sequencial — rejeitado: mais lento; (b) Um subagent para tudo — rejeitado: contexto overflow |
| Reversibilidade | Reversível |
| Impacto | Baixo — processo |
| Status | ✅ Decidida |

## D-014 — Hipóteses de preço marcadas como não validadas

| Campo | Valor |
|---|---|
| Decisão | Todas as hipóteses de preço do mega-prompt marcadas como "hipótese — sem custo real" |
| Rationale | Sem dados de custo (materiais, mão de obra, overhead), qualquer preço é aposta; exemplo demonstra que com custos hipotéticos, piso pode exceder "recomendado" |
| Alternativas | (a) Adotar preços do prompt como meta — rejeitado: sem validação; (b) Calcular piso com custos hipotéticos — feito como exemplo, mas marcado |
| Reversibilidade | Reversível |
| Impacto | Alto — define postura de pricing |
| Status | ✅ Decidida |

## D-015 — Presentation locale separado de commercial region

| Campo | Valor |
|---|---|
| Decisão | Implementar presentation locale (idioma UI) independente de commercial region (moeda, frete, imposto) |
| Rationale | Usuário em /us pode querer pt-BR (locale) mas comprar em USD (region); mega-prompt exige separação; preferência do usuário registrada |
| Alternativas | (a) Locale = region — rejeitado: força idioma por país |
| Reversibilidade | Reversível |
| Impacto | Médio — define i18n |
| Status | ✅ Decidida |

---

*Fim do decision-log.md*