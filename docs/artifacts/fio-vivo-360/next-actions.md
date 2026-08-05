# 10.4 — Next Actions

**Data:** 2026-08-05
**Sessão:** Fio Vivo 360º Mega Prompt

---

## Priorização

Todas as ações estão priorizadas por:
1. **P0** — Crítico, bloqueia progresso
2. **P1** — Alto, destrava implementação
3. **P2** — Médio, habilita crescimento
4. **P3** — Baixo, optimiza
5. **P4** — Futuro, após validação

---

## P0 — Crítico (bloqueia progresso)

| # | Ação | Tipo | Owner | Esforço | Dependência | Gate |
|---|---|---|---|---|---|---|
| 1 | Coletar dados da artesã: materiais, dimensões, peso, capacidade mensal, tempo de produção por peça | Externo | PM + Artesã | Alto | — | G2, G4, G5 |
| 2 | Confirmar existência de Jardim Vivo e Duna Bicolor (não estão na fixture nem nas imagens) | Externo | PM | Baixo | Artesã | G1 |
| 3 | Confirmar que Trama Solar e Fio Ancestral são produtos comerciais (têm imagem mas não estão no mega-prompt) | Externo | PM | Baixo | Artesã | G1 |
| 4 | Coletar dados de custo: materiais, mão de obra (horas × rate), embalagem, custos indiretos, taxas, impostos | Externo | PM + Artesã | Alto | — | G5 |
| 5 | Reconciliar contextos comerciais das 6 peças (BB-04 menciona contextos não persistidos na fixture) | PM | PM | Baixo | Artesã | G1 |

> ⚠️ **Todas as P0 são externas** — dependem da artesã. Sem estes dados, nenhum gate de implementação avança.

---

## P1 — Alto (destrava implementação)

| # | Ação | Tipo | Owner | Esforço | Dependência | Gate |
|---|---|---|---|---|---|---|
| 6 | Resolver bloqueador Turbopack: remover `calendar.tsx` se não for usado, ou migrar Tailwind para v4, ou isolar nos-gallery | Dev | Dev | Baixo | Verificar uso de calendar.tsx | G8 |
| 7 | Criar região BR com BRL no seed Medusa (`initial-data-seed.ts` ou novo migration script) | Dev | Dev | Médio | — | G6 |
| 8 | Migrar produtos Fio Vivo da fixture para backend Medusa (usar `createProductsWorkflow`) | Dev | Dev | Médio | P0 #1 (metadados) | G1, G6 |
| 9 | Integrar Pix como método de pagamento (Stripe BR ou Mercado Pago) | Dev | Dev | Médio | Região BR (#7) | G6 |
| 10 | Preencher 54 campos "a informar" nas fixtures (ou preferencialmente no backend) | PM + Dev | PM + Dev | Médio | P0 #1, #4 | G1, G4 |
| 11 | Remover override BB-03 em `GalleryHeroClient` (usar adapter Medusa em vez de fixtures hardcoded) | Dev | Dev | Baixo | #8 (produtos no backend) | G6 |
| 12 | Configurar `NEXT_PUBLIC_DEFAULT_REGION=br` no `.env.local` | Dev | Dev | Baixo | #7 (região BR) | G6 |

---

## P2 — Médio (habilita crescimento)

| # | Ação | Tipo | Owner | Esforço | Dependência | Gate |
|---|---|---|---|---|---|---|
| 13 | Implementar pricing engine (custom module Medusa `apps/backend/src/modules/pricing-engine/`) | Dev | Dev | Alto | P0 #4 (custo) | G5 |
| 14 | Escrever testes unitários para pricing engine (piso, taxas inválidas, multiplicadores, limites, Pix, cupom, corredores) | Dev | Dev | Médio | #13 | G5 |
| 15 | Implementar event taxonomy P0 (17 eventos: product_list_viewed → order_completed/failed) | Dev | Dev | Médio | — | G7 |
| 16 | Implementar reviews verificadas (módulo custom + widget na PDP) | Dev | Dev | Médio | #8 (produtos backend) | G4 |
| 17 | Implementar lista de espera (módulo custom + form inline na PDP) | Dev | Dev | Baixo | #8 | G4 |
| 18 | Implementar LGPD compliance (consent management, privacy policy, cookie banner) | Dev/Legal | Dev/Legal | Médio | — | G8 |
| 19 | Adicionar Sentry (error tracking) no storefront e backend | Dev | Dev | Baixo | — | G8 |
| 20 | Migrar analytics de GA4 gtag para PostHog (product analytics) | Dev | Dev | Médio | #15 | G7 |
| 21 | Configurar staging environment (Vercel preview + Medusa Cloud staging) | Dev/Ops | Dev/Ops | Médio | — | G9 |
| 22 | Implementar programa de indicação (módulo + flow pós-compra) | Dev | Dev | Médio | #8 | — |
| 23 | Implementar gift option (embalagem presente + cartão personalizado no cart) | Dev | Dev | Médio | #8 | G6 |
| 24 | Implementar bundles (bolsa + nécessaire + chaveiro) | Dev | Dev | Médio | #8 | — |
| 25 | Configurar deploy pipeline (Vercel + Medusa Cloud) | Dev/Ops | Dev/Ops | Médio | #21 | G9 |

---

## P3 — Baixo (optimiza)

| # | Ação | Tipo | Owner | Esforço | Dependência | Gate |
|---|---|---|---|---|---|---|
| 26 | Implementar personalização (color picker, alça, acabamento) | Dev | Dev | Alto | #8, #13 | G3 |
| 27 | Implementar drops / pré-venda / reserva com sinal | Dev | Dev | Médio | #8 | G3 |
| 28 | Implementar i18n completo (pt-BR, en-US, es-ES, fr-FR) | Dev | Dev | Médio | — | — |
| 29 | Implementar afiliados (comissão, cookie 30d, cupom único) | Dev | Dev | Médio | #8 | — |
| 30 | Implementar WhatsApp Business API (atendimento, catálogo, notificações) | Dev | Dev | Médio | — | — |
| 31 | Configurar Google Shopping feed | Dev | Dev | Baixo | #8 | — |
| 32 | Configurar Pinterest Tag | Dev | Dev | Baixo | — | — |
| 33 | Implementar SEO estruturado (schema.org Product, breadcrumbs, sitemap) | Dev | Dev | Médio | #8 | — |
| 34 | Implementar content engine (editorial, blog, guias de cuidado) | Content + Dev | Content | Médio | — | — |
| 35 | Implementar search/recommendations (Medusa search + custom logic) | Dev | Dev | Médio | #8 | — |

---

## P4 — Futuro (após validação)

| # | Ação | Tipo | Owner | Esforço | Dependência | Gate |
|---|---|---|---|---|---|---|
| 36 | Internacionalização piloto Portugal (IMVS 67.0) | Dev + Growth | Dev + Growth | Alto | BR validado (≥30 PSEEP/mês × 3m) | G-INT |
| 37 | Internacionalização EU (IMVS 58.5) | Dev + Growth | Dev + Growth | Alto | PT validado | G-INT |
| 38 | Presentes corporativos B2B | Dev + Sales | Dev + Sales | Alto | #8 | — |
| 39 | Workshops (online ou presencial) | Content | Content | Alto | Audiência | — |
| 40 | Licenciamento de padrões (IP) | Legal + PM | Legal + PM | Alto | Marca estabelecida | — |
| 41 | Clube de acesso antecipado (assinatura) | Dev + PM | Dev + PM | Médio | #27 (drops) | — |
| 42 | Certificado de autenticidade (peças numeradas) | Dev + Ops | Dev + Ops | Médio | #27 | — |

---

## Sequência recomendada (primeiros 30 dias)

```text
Dia 1-3:   P0 #1-5 (coletar dados da artesã, reconciliar catálogo)
Dia 4-7:   P1 #6 (resolver Turbopack) + P1 #7 (região BR)
Dia 8-15:  P1 #8 (migrar produtos backend) + P1 #10 (preencher metadados)
Dia 16-20: P1 #9 (integrar Pix) + P1 #11 (remover BB-03 override)
Dia 21-25: P1 #12 (default region br) + P2 #15 (event taxonomy P0)
Dia 26-30: P2 #17 (lista de espera) + P2 #18 (LGPD) + testes
```

---

## Critério de aceitação para próxima execução

| Critério | Como verificar |
|---|---|
| Dados da artesã coletados | 6 produtos × 9 campos preenchidos (não "a informar") |
| Custo por peça calculado | Custo Completo + Piso Sustentável para cada produto |
| Região BR criada | `medusa db:migrate` + seed com BR/BRL |
| Produtos no backend | `GET /store/products?country_code=br` retorna 6 Fio Vivo |
| Pix integrado | Checkout BR mostra opção Pix |
| Bloqueador Turbopack resolvido | `next dev --turbopack` inicia sem erro CSS |
| BB-03 override removido | `GalleryHeroClient` usa `items` prop, não fixtures |
| Event taxonomy P0 implementado | 17 eventos rastreados em GA4/PostHog |

---

*Fim do next-actions.md*