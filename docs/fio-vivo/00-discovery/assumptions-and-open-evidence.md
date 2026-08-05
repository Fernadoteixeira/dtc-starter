# 00.6 — Assumptions and Open Evidence

**Data:** 2026-08-05
**Fonte:** Inspeção direta + mega-prompt + fixtures + artefatos BB-04

---

## Classificação

- 🟢 **Evidência** — confirmado por inspeção direta do código/config/filesystem
- 🔵 **Inferência** — derivado de evidência, não diretamente confirmado
- 🟡 **Hipótese** — não confirmado, baseado em padrão ou contexto
- 🔴 **Decisão recomendada** — ação sugerida, requer validação
- ⚪ **Aberto** — requer validação externa (artesã, teste, deploy)

---

## 1. Produtos Fio Vivo — reconciliação

### 1.1 Produtos confirmados na fixture (evidência)

| ID | Código | Handle | Título | Imagens | Evidência |
|---|---|---|---|---|---|
| fv-001 | fv-001-espiral-dourada | espiral-dourada | Espiral dourada | 4 PNGs 1254×1254 | 🟢 `fio-vivo-products.ts` + `public/images/fio-vivo/fv-001-*/` |
| fv-002 | fv-002-orbita-negra | orbita-negra | Órbita negra | 4 PNGs 1254×1254 | 🟢 idem |
| fv-003 | fv-003-trama-solar | trama-solar | Trama solar | 4 PNGs 1254×1254 | 🟢 idem |
| fv-004 | fv-004-fio-ancestral | fio-ancestral | Fio ancestral | 4 PNGs 1254×1254 | 🟢 idem |
| fv-005 | fv-005-tranca-ambar | tranca-ambar | Trança âmbar | 4 PNGs 682×1024 | 🟢 idem |
| fv-006 | fv-006-duna-terracota | duna-terracota | Duna terracota | 4 PNGs 682×1024 | 🟢 idem |

### 1.2 Produtos no mega-prompt mas AUSENTES da fixture

| Produto | Status | Ação recomendada |
|---|---|---|
| Duna Terracota — Edição Bicolor | ❌ Inexistente | 🔴 Confirmar com artesã se existe; se sim, criar fixture; se não, remover do escopo |
| Jardim Vivo | ❌ Inexistente | 🔴 Confirmar com artesã se existe; se sim, criar fixture; se não, remover do escopo |

### 1.3 Produtos na fixture mas AUSENTES do mega-prompt

| Produto | Status | Ação recomendada |
|---|---|---|
| Trama solar (fv-003) | ❌ Não mencionado no prompt | 🔴 Confirmar se deve ser comercializada; fixture existe com imagem |
| Fio ancestral (fv-004) | ❌ Não mencionado no prompt | 🔴 Confirmar se deve ser comercializada; fixture existe com imagem |

### 1.4 Metadados comerciais — todos "a informar"

| Campo | Estado | Conta de produtos |
|---|---|---|
| `contextualName` | "a informar" | 6/6 |
| `description` | "a informar" | 6/6 |
| `artist` | "a informar" | 6/6 |
| `material` | "a informar" | 6/6 |
| `category` | "a informar" | 6/6 |
| `year` | "a informar" | 6/6 |
| `price` | "a informar" | 6/6 |
| `availability` | "a informar" | 6/6 |
| `ambientColors` | "a informar" | 6/6 |

> ⚪ **Aberto:** todos os 54 campos requerem validação externa com a artesã. Sem esses dados, nenhum produto pode ser comercializado.

---

## 2. Preços — status de validação

### 2.1 Hipóteses de preço do mega-prompt

| Produto | Validação | Recomendado | Premium | Status |
|---|---|---|---|---|
| Trança Âmbar | R$ 250 | R$ 420 | R$ 590 | 🟡 Hipótese — sem custo real |
| Duna Terracota | R$ 590 | R$ 790 | R$ 1.190 | 🟡 Hipótese |
| Duna Bicolor | R$ 590 | R$ 790 | R$ 1.290 | 🟡 Hipótese — produto não existe |
| Jardim Vivo | R$ 590 | R$ 790 | R$ 1.190 | 🟡 Hipótese — produto não existe |
| Órbita Negra | R$ 590 | R$ 890 | R$ 1.290 | 🟡 Hipótese |
| Espiral Dourada | R$ 690 | R$ 990 | R$ 1.490 | 🟡 Hipótese |

### 2.2 Dados de custo necessários e ausentes

| Dado | Status | Necessário para |
|---|---|---|
| Custo materiais | ⚪ Aberto | Cálculo do piso sustentável |
| Horas de mão de obra | ⚪ Aberto | Cálculo do piso sustentável |
| Rate horária | ⚪ Aberto | Cálculo do piso sustentável |
| Custo embalagem | ⚪ Aberto | Cálculo do piso sustentável |
| Custos indiretos | ⚪ Aberto | Cálculo do piso sustentável |
| Taxas comerciais | ⚪ Aberto | Cálculo do piso sustentável |
| Taxa de impostos | ⚪ Aberto | Cálculo do piso sustentável |
| Margem alvo | ⚪ Aberto | Cálculo do piso sustentável |
| Custo de aquisição | ⚪ Aberto | Cálculo do piso sustentável |
| Custo de troca/devolução | ⚪ Aberto | Cálculo do piso sustentável |

> ⚪ **Aberto:** sem estes dados, o pricing engine é teórico. As hipóteses de preço do prompt não podem ser validadas nem refutadas.

---

## 3. Contextos comerciais (inferências)

| Contexto | Status | Evidência |
|---|---|---|
| Duna Terracota tem "Degradê da terra" como contexto | 🟡 Hipótese | Relatório BB-04 menciona, mas fixture tem `contextualName: "a informar"` |
| Órbita negra tem "Crochê de presença" | 🟡 Hipótese | Idem |
| Trama solar tem "Matéria em suspensão" | 🟡 Hipótese | Idem |
| Fio ancestral tem "Volume contemporâneo" | 🟡 Hipótese | Idem |
| Trança âmbar tem "Arquitetura portátil" | 🟡 Hipótese | Idem |
| Espiral dourada tem "Crochê em movimento" | 🟡 Hipótese | Idem |

> 🔵 **Inferência:** os contextos provavelmente foram definidos em iteração anterior (BB-03/BB-04) mas não foram persistidos na fixture. Reconciliar.

---

## 4. Imagens — estado

### 4.1 Evidência confirmada

| Atributo | Valor |
|---|---|
| Total de PNGs | 24 (6 produtos × 4 cenas) |
| Cenas por produto | 01-frente, 02-perfil, 03-gesto, 04-detalhe |
| Resolução fv-001 a fv-004 | 1254×1254 (aspect 1:1) |
| Resolução fv-005, fv-006 | 682×1024 (aspect 2:3) |
| Formato | PNG |
| Path | `apps/storefront/public/images/fio-vivo/fv-00X-*/` |

### 4.2 Lacunas de imagem

| Cena necessária (mega-prompt) | Existe? |
|---|---|
| Frontal | ✅ (01-frente) |
| Traseira | ❌ |
| Lateral | 🟡 (02-perfil é "perfil", não "lateral") |
| Interior | ❌ |
| Uso no corpo | 🟡 (03-gesto pode ser uso no corpo) |
| Vídeo | ❌ |
| 360° | ❌ |

> ⚪ **Aberto:** confirmar com artesã se há fotos adicionais; planejar sessão fotográfica para lacunas.

---

## 5. Backend — estado

### 5.1 Evidência confirmada

| Atributo | Status |
|---|---|
| Medusa v2.18.0 | 🟢 Confirmado em `package.json` |
| PostgreSQL 15 | 🟢 Confirmado em docker-compose |
| Seed genérico europeu | 🟢 Confirmado em `initial-data-seed.ts` |
| Países seed: gb, de, dk, se, fr, es, it | 🟢 Confirmado |
| Moedas: EUR (default), USD | 🟢 Confirmado |
| Sem região BR | 🟢 Confirmado (ausente) |
| Sem produtos Fio Vivo no backend | 🟢 Confirmado (ausente) |
| API custom routes = placeholders | 🟢 Confirmado |

### 5.2 Inferências

| Inferência | Status |
|---|---|
| Backend roda em `localhost:9000` | 🔵 Inferência (medusa develop default) |
| Admin em `localhost:9000/app` | 🔵 Inferência (Medusa v2 default) |
| Publishable API key criada no seed | 🔵 Inferência (seed cria) |

---

## 6. Storefront — estado

### 6.1 Evidência confirmada

| Atributo | Status |
|---|---|
| Next.js 15.5.21 | 🟢 |
| React 19.0.5 | 🟢 |
| Turbopack dev quebra | 🟢 (BB-04 evidência) |
| Webpack mode funciona | 🟢 (BB-04 R1 verified) |
| Gallery Hero funcional | 🟢 (R1 runtime measurements) |
| Default region `dk` | 🟢 (.env.template) |
| Sem i18n conteúdo | 🟢 (apenas locale header) |
| Stripe + PayPal configurados | 🟢 (constants.tsx) |

### 6.2 Inferências

| Inferência | Status |
|---|---|
| Storefront consome Medusa SDK para produtos | 🔵 (config.ts importa SDK) |
| PDP (`/products/[id]`) funciona com produtos Medusa | 🔵 (módulo products existe) |
| Checkout funciona com Stripe | 🔵 (componentes presentes, não testado nesta sessão) |

---

## 7. Assumptions sobre o negócio Fio Vivo

| # | Assumption | Tipo | Validação necessária |
|---|---|---|---|
| 1 | Fio Vivo é marca de bolsas e peças em crochê | 🟡 Hipótese | Confirmar com artesã |
| 2 | Produção é artesanal, limitada | 🟡 Hipótese | Confirmar capacidade mensal |
| 3 | Marca tem forte componente autoral | 🔵 Inferência | Nomes das peças são autorais |
| 4 | Há potencial DTC, made-to-order, personalização | 🟡 Hipótese | Validar com artesã |
| 5 | Artesã é a proprietária/criadora | 🟡 Hipótese | Confirmar |
| 6 | Peças têm materiais específicos (fio, cor, textura) | 🟡 Hipótese | `material: "a informar"` |
| 7 | Peças têm dimensões físicas | 🟡 Hipótese | Não medido |
| 8 | Peças têm peso | 🟡 Hipótese | Não medido |
| 9 | Há capacidade produtiva mensal | 🟡 Hipótese | Não informado |
| 10 | Há tempo de produção por peça | 🟡 Hipótese | Não informado |
| 11 | Marca quer vender online | 🔵 Inferência | Repositório existe com gallery |
| 12 | Marca quer internacionalizar | 🟡 Hipótese | Mega-prompt sugere |
| 13 | Preços sugeridos são viáveis | 🟡 Hipótese | Sem dados de custo |

---

## 8. Decisões recomendadas (pendentes de validação)

| # | Decisão | Rationale | Risco se ignorada |
|---|---|---|---|
| 1 | Adotar fixture como fonte de verdade provisória | 6 produtos com imagem; prompt tem 2 inexistentes | Trabalho em produtos que não existem |
| 2 | Confirmar com artesã: Jardim Vivo e Duna Bicolor existem? | Não estão na fixture nem nas imagens | Prometer produtos inexistentes |
| 3 | Confirmar com artesã: Trama Solar e Fio Ancestral são comerciais? | Têm imagem mas não estão no prompt | Sub-utilizar catálogo |
| 4 | Criar região BR com BRL no seed Medusa | Default é `dk` (Dinamarca) | Storefront não serve Brasil |
| 5 | Integrar Pix como método de pagamento | Sem Pix, cliente BR não converte | Baixa conversão BR |
| 6 | Migrar produtos da fixture para backend Medusa | Fixtures hardcoded não escalam | Sem pricing, inventory, admin |
| 7 | Preencher 54 campos "a informar" | Sem dados, nenhum produto é vendável | Comércio impossível |
| 8 | Coletar dados de custo por peça | Pricing engine requer custo | Preços inválidos |
| 9 | Resolver bloqueador Turbopack | Dev script default quebra | DX degradada |
| 10 | Adicionar LGPD compliance | Operação comercial no BR | Risco legal |

---

## 9. Itens que NÃO devem ser alterados

| Item | Razão |
|---|---|
| `AGENTS.md` convenções | Autoridade do repo |
| `pnpm-lock.yaml` | Regra do repo |
| `.env`, `.env.local` | Segurança |
| Migrations existentes | Regra do repo |
| `medusa-config.ts` estrutura | Funciona |
| `packages/gallery-experience/src/components/gallery-experience.tsx` | Funciona (BB-04 R1 verified) |
| `.agents/contracts/nos-gallery-first-fold.yaml` | Contrato visual ativo |
| `docker-compose.yml` (sem necessidade) | Infra dev funciona |
| Imagens existentes em `public/images/fio-vivo/` | Assets |
| `eslint.config.ts` regras @medusajs/* | Regra do repo |

---

## 10. Próximos passos de validação prioritários

| Prioridade | Ação | Responsável | Esforço |
|---|---|---|---|
| P0 | Confirmar com artesã: produtos, materiais, dimensões, peso, capacidade, tempo | Artesã + PM | Externo |
| P0 | Confirmar existência de Jardim Vivo e Duna Bicolor | Artesã | Externo |
| P0 | Coletar dados de custo (materiais, mão de obra, overhead) | Artesã + PM | Externo |
| P1 | Resolver bloqueador Turbopack | Dev | Baixo |
| P1 | Criar região BR + BRL no seed | Dev | Médio |
| P1 | Migrar produtos para backend Medusa | Dev | Médio |
| P2 | Integrar Pix | Dev | Médio |
| P2 | Preencher metadados das fixtures | PM + Artesã | Médio |
| P3 | Implementar pricing engine | Dev | Alto |
| P3 | Implementar event taxonomy | Dev | Médio |

---

*Fim do assumptions-and-open-evidence.md*