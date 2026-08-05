# 02.3 — Especificação da Página de Produto (PDP) Fio Vivo

**Data:** 2026-08-05
**Estado:** Vigente
**Aplica-se a:** `apps/storefront/src/app/[countryCode]/products/[id]/page.tsx` e módulos em `apps/storefront/src/modules/products/`
**Depende de:** `experience-principles.md`, `design-system-extension.md`
**Viewport de referência:** 1440×900 (desktop), 390×844 (mobile)

---

## 1. Objetivo

Especificar a PDP (Product Detail Page) de Fio Vivo de ponta a ponta: acima da dobra (conversão imediata), abaixo da dobra (aprofundamento e provas), estados, dados, copy, e mapeamento para a arquitetura Medusa + Next.js existente.

A PDP é a superficie de maior densidade de decisão de compra. Ela precisa comunicar ** Autoria, Matéria, Tempo, Transparência e Qualidade** sem que o visitante precise scrollar — e oferecer **Bastidores, Construção e Provas** para quem quer garantir.

---

## 2. Produto de referência

Para tornar a especificação concreta, usamos `fv-001 Espiral dourada` como produto de referência. Os outros 5 seguem o mesmo molde.

| Campo | Valor |
|---|---|
| ID | `fv-001` |
| Handle | `espiral-dourada` |
| Nome | Espiral dourada |
| Microdescrição | Bolsa ombro de crochê espiralado em fio âmbar natural |
| Imagens | 4: `01-frente` (1254×1254), `02-perfil` (1254×1254), `03-gesto` (1254×1254), `04-detalhe` (1254×1254) |
| Material | Fio 100% algodão natural, tingimento vegetal âmbar |
| Dimensões | 28 × 22 × 10 cm |
| Capacidade | 4 L (celular, carteira, chaves, óculos, bálsamo) |
| Peso | 320 g |
| Disponibilidade | Sob encomenda |
| Prazo de produção | 7 a 10 dias úteis após confirmação do pagamento |
| Preço | R$ 480 |
| Pix | R$ 456 (5% off) |
| Parcelamento | 6× R$ 80 sem juros |
| Personalização | Troca de cor do fio (+R$ 40, +5 dias), Monograma (+R$ 60, +3 dias) |
| Garantia | 90 dias contra defeito de confecção |

---

## 3. Acima da dobra — zona de decisão

Altura alvo: 100svh (desktop), first fold completo sem scroll.

### 3.1 Layout desktop (1440px)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Header Medusa — menu / account / cart]                          ◇  │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────┐  ┌────────────────────────────────┐ │
│  │                            │  │  fv-001                          │ │
│  │                            │  │  Espiral dourada                 │ │
│  │     Imagem frontal          │  │  Bolsa ombro de crochê          │ │
│  │     01-frente               │  │  espiralado em fio âmbar        │ │
│  │     (hero, ~55% largura)    │  │                                │ │
│  │                            │  │  ● Sob encomenda                │ │
│  │                            │  │  Prazo: 7–10 dias úteis          │ │
│  │                            │  │                                │ │
│  │  ◀ 01 ● ○ ○ 04 ▶           │  │  R$ 480                         │ │
│  │  (mini-rail 4 thumbs,      │  │  ou Pix R$ 456                 │ │
│  │   dentro da área de img)   │  │  ou 6× R$ 80 sem juros          │ │
│  └────────────────────────────┘  │                                │ │
│                                   │  Variante: ○ Cor natural        │ │
│                                   │             ● Cor âmbar          │ │
│                                   │             ○ Personalizar (+)   │ │
│                                   │                                │ │
│                                   │  ┌──────────────────────────┐  │ │
│                                   │  │  Levar esta peça    ▶ │  │ │
│                                   │  └──────────────────────────┘  │ │
│                                   │  ┌──────────────────────────┐  │ │
│                                   │  │ + Lista de espera        │  │ │
│                                   │  └──────────────────────────┘  │ │
│                                   │                                │ │
│                                   │  ✓ Garantia 90 dias            │ │
│                                   │  ✓ Envio nacional tracked      │ │
│                                   │  ✓ Pix 5% off                  │ │
│                                   │  ★ 4,9 (23 avaliações)         │ │
│  └────────────────────────────────┘                                │ │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 Layout mobile (390px)

```
┌──────────────────────────┐
│  [Header — menu / cart]  │
├──────────────────────────┤
│                          │
│  Imagem frontal          │
│  01-frente (full width)  │
│                          │
│  ● ○ ○ ○  (dots)          │
├──────────────────────────┤
│  fv-001                   │
│  Espiral dourada          │
│  Bolsa ombro de crochê... │
│                          │
│  ● Sob encomenda         │
│  Prazo: 7–10 dias úteis  │
│                          │
│  R$ 480                   │
│  Pix R$ 456 · 6× R$ 80   │
│                          │
│  Cor: ○ natural ● âmbar │
│                          │
│  [Levar esta peça    ▶]  │
│  [+ Lista de espera]     │
│                          │
│  ✓ Garantia 90 dias      │
│  ✓ Envio tracked         │
│  ★ 4,9 (23)              │
└──────────────────────────┘
```

### 3.3 Elementos — especificação campo a campo

#### 3.3.1 Galeria de imagem (esquerda, desktop)

- Imagem frontal `01-frente` é a default, ocupa ~55% da largura da coluna.
- Mini-rail de 4 thumbnails **dentro** da área de imagem (não abaixo, não fora), posicionado bottom-left, estilo gallery hero.
- Thumbnails: 56×56px (mantém dimensão do scene rail da gallery), `radius-organica`, borda hairline, ativo tem borda `fv-copper-500`.
- Interação: clique troca imagem principal; swipe horizontal em mobile.
- Zoom em hover (desktop): `transform: scale(1.4)` sobre a imagem, cursor zoom-in, área de zoom segue o cursor.
- Sem zoom em mobile (princípio: não simular desktop em touch).

#### 3.3.2 Bloco de informação (direita, desktop)

Ordem vertical, top-aligned, `max-width: 440px`:

1. **Número de peça** — `fv-001`, `label` mono, `fv-umber-300`.
2. **Nome** — `Espiral dourada`, `display-md`, `fv-umber-700`.
3. **Microdescrição** — `Bolsa ombro de crochê espiralado em fio âmbar natural`, `body`, `fv-umber-500`.
4. **Estado + prazo** — linha composta:
   - Badge `Sob encomenda` (`fv-status-badge--encomenda`).
   - Texto `Prazo: 7–10 dias úteis após pagamento`, `body-sm`, `fv-umber-400`.
5. **Preço** — bloco `fv-price`:
   - `R$ 480` — `price`, `fv-umber-700`.
   - `ou Pix R$ 456` — `fv-price__pix`, `fv-copper-600`.
   - `ou 6× R$ 80 sem juros` — `fv-price__parcelamento`, `fv-linen-500`.
6. **Seleção de variante** — radio cards, não dropdown:
   - `Cor natural` (default, imagem swatch do fio).
   - `Cor âmbar` (imagem swatch do fio).
   - `Personalizar cor (+R$ 40, +5 dias)` — abre inline de personalização.
7. **Personalização (condicional)** — se "Personalizar" selecionado:
   - Campo de texto `Monograma (até 3 letras)` (+R$ 60, +3 dias).
   - Seletor de cor do fio (swatches das cores disponíveis).
   - Resumo de acréscimo e prazo atualizado em tempo real.
8. **CTA primário** — `Levar esta peça`, `fv-cta-primary`, full-width da coluna.
   - Se sob encomenda: copy = `Encomendar esta peça`.
   - Se pronta: copy = `Levar esta peça`.
   - Se esgotada: copy = `Entrar na lista de espera`, estilo `fv-cta-secondary`.
9. **CTA secundário** — `+ Lista de espera` (se sob encomenda) ou `Adicionar ao presente` (se pronta), `fv-cta-secondary`.
10. **Provas de confiança** — lista vertical, `body-sm`, ícone `fv-copper-500`:
    - `✓ Garantia 90 dias contra defeito de confecção`
    - `✓ Envio nacional com rastreio`
    - `✓ 5% de desconto no Pix`
    - `★ 4,9 (23 avaliações verificadas)` — link âncora para seção de avaliações abaixo.

### 3.4 Estados do CTA

| Estado do produto | Copy do CTA primário | Estilo | Ação |
|---|---|---|---|
| Pronta entrega | `Levar esta peça` | `fv-cta-primary` | Adiciona ao carrinho |
| Sob encomenda | `Encomendar esta peça` | `fv-cta-primary` | Inicia fluxo de encomenda (cart + meta `made_to_order: true`) |
| Esgotada | `Entrar na lista de espera` | `fv-cta-secondary` | Abre formulário inline de lista de espera |
| Reservada | `Ver peças similares` | `fv-cta-secondary` | Link para coleção com filtro de estado |

---

## 4. Abaixo da dobra — zona de profundidade

Estrutura em seções verticais, ritmo `space-section` entre elas. Cada seção tem um `id` para âncora.

### 4.1 Ordem das seções

1. `#galeria-360` — Galeria 360° / todas as 4 imagens em sequência
2. `#video` — Vídeo de produção (se existir)
3. `#historia` — História da peça
4. `#materiais` — Materiais e origem
5. `#construcao` — Construção e técnica
6. `#dimensoes` — Dimensões e capacidade
7. `#interior` — Interior da bolsa
8. `#cuidados` — Cuidados e conservação
9. `#prazo` — Prazo detalhado
10. `#avaliacoes` — Avaliações verificadas
11. `#relacionados` — Peças relacionadas
12. `#complete-look` — Complete o look
13. `#presente` — Presentear esta peça
14. `#lista-espera` — Lista de espera (se aplicável)
15. `#colecao` — Mesma coleção
16. `#bastidores` — Bastidores da produção

### 4.2 Especificação por seção

#### 4.2.1 Galeria 360° (`#galeria-360`)

- As 4 imagens em grid 2×2 (desktop) ou stack vertical (mobile).
- Cada imagem com legenda: `Frente`, `Perfil`, `Gesto`, `Detalhe`.
- Imagem de gesto (`03-gesto`) com contexto de escala (mão, corpo, referência).
- Imagem de detalhe (`04-detalhe`) com zoom interativo em hover.
- Fundo: `fv-linen-50`.

> **Nota técnica:** se houver 360° real (set de fotos orbitais), substituir o grid por viewer orbital. Para o lançamento, 4 imagens fixas são o mínimo viável.

#### 4.2.2 Vídeo (`#video`)

- Condicional: só renderiza se o produto tem vídeo associado (meta `video_url`).
- Player com poster frame = `03-gesto` (imagem de gesto).
- Sem autoplay. Sem som default (com botão de ativar).
- Duração visível antes do play.

#### 4.2.3 História da peça (`#historia`)

- Layout: coluna editorial 2/3 largura + imagem 1/3.
- Copy em primeira pessoa: "Esta peça nasceu de..." — narrativa da artesã sobre a decisão estética e técnica.
- Imagem: `04-detalhe` ou foto de bastidores (se existir).
- Comprimento: 2 a 4 parágrafos. `body-lg`, `max-width: 65ch`.
- Assinatura: "— Fernanda, atelier Fio Vivo" em `display-sm`.

#### 4.2.4 Materiais (`#materiais`)

Tabela de materiais:

| Material | Composição | Origem |
|---|---|---|
| Fio | 100% algodão natural | Fornecedor local (São Paulo) |
| Tingimento | Vegetal, corante âmbar | Atelier, lotes pequenos |
| Forro | Algodão cru sem tingimento | Fornecedor local |
| Ferragens | Niquel livre de chumbo | Importado (Itália) |

- Fundo `fv-linen-100`, borda hairline `fv-linen-200`.
- Labels em `label` uppercase; valores em `body`.

#### 4.2.5 Construção (`#construcao`)

- Imagem `04-detalhe` em destaque, com anotações (overlay SVG) apontando: ponto espiral, reforço de alça, acabamento da borda.
- Texto: técnica do ponto (espiralado contínuo sem costura), tempo de construção (ex: "12 horas de crochê"), tipo de agulha usada.
- Princípio: **Qualidade** — mostrar a engenharia, não afirmar "alta qualidade".

#### 4.2.6 Dimensões (`#dimensoes`)

- Bloco técnico, `font-mono` para números:
  - `28 × 22 × 10 cm`
  - `4 L de capacidade`
  - `320 g`
  - `Alça: 60 cm ajustável`
- Diagrama SVG silhueta da bolsa com cotas (não foto).
- Comparação de escala: "Cabe celular até 16cm, carteira, chaves, óculos, bálsamo".

#### 4.2.7 Interior (`#interior`)

- Foto do interior (se existir) ou ilustração.
- Descrição: bolso interno, tipo de forro, cor do forro.
- Se sem forro: dizer explicitamente ("sem forro — crochê aparente no interior").

#### 4.2.8 Cuidados (`#cuidados`)

Lista de cuidados, `body`, ícones `fv-copper-500`:
- Lavar à mão em água fria, sabão neutro.
- Secar à sombra, sobre superfície plana.
- Não torcer.
- Guardar em saco de tecido (incluído).
- Retoque de cor: voltar ao atelier (gratuito nos 90 dias de garantia).

#### 4.2.9 Prazo (`#prazo`)

- Detalhamento do prazo:
  - Produção: 7–10 dias úteis (se sob encomenda).
  - Personalização: +5 dias (cor), +3 dias (monograma).
  - Envio: 2–5 dias úteis nacional, 10–20 internacional.
  - Total estimado: 12–18 dias úteis até a porta.
- Tabela com linhas de etapa e colunas de prazo.

#### 4.2.10 Avaliações (`#avaliacoes`)

- Resumo: `★ 4,9` em `display-lg`, `(23 avaliações verificadas)`.
- Distribuição em barras (5★ a 1★) com contagem.
- Lista de reviews, cada um com:
  - Nome + iniciais em avatar (não foto real, se não houver).
  - Data.
  - Tamanho/body (se aplicável).
  - Verificação: `✓ Compra verificada` selo `fv-copper-500`.
  - Texto.
  - Fotos (se enviadas, máx 4, thumbnail clicável para lightbox).
- Paginação ou "ver mais" (não carregar tudo de uma vez).
- Filtro: por estrela, por data.

#### 4.2.11 Relacionados (`#relacionados`)

- 3 a 4 peças da mesma categoria ou coleção, **não** grade simétrica — usar layout assimétrico do catalog (ver `catalog-wireframes.md`).
- Card de catálogo conforme `design-system-extension.md` seção 7.1.

#### 4.2.12 Complete o look (`#complete-look`)

- Sugestões de composição: peça atual + 1 ou 2 acessórios compatíveis (se Fio Vivo tiver; se não, omitir a seção).
- Layout: peça atual fixa à esquerda, sugestões à direita, "adicionar conjunto" com preço somado.

#### 4.2.13 Presente (`#presente`)

- CTA `Presentear esta peça` — abre modal com:
  - Mensagem personalizada (campo de texto, até 200 chars).
  - Data de envio agendada.
  - Embalagem presente (saco de tecido + tag manuscrita).
  - Acréscimo de R$ 25 (embalagem) + R$ 0 (mensagem digital).
- Princípio: **Humanidade** — embalagem é real, mensagem é real, não é checkbox genérico.

#### 4.2.14 Lista de espera (`#lista-espera`)

- Só exibe se produto está esgotado ou sob encomenda com fila.
- Formulário inline: nome, email,WhatsApp (opcional).
- Copy: "Esta peça pode ser refeita em lote limitado. Entre na lista — aviso quando abrir."
- Posição aproximada na fila (se backend suportar): "Você estaria na posição ~4".

#### 4.2.15 Mesma coleção (`#colecao`)

- Link para a coleção da peça, com thumbnail da coleção e contagem de peças.
- Se a peça não tem coleção, omitir.

#### 4.2.16 Bastidores (`#bastidores`)

- Galeria de 3 a 6 fotos de bastidores: atelier, mãos, fios, processo.
- Copy curto sobre cada foto.
- Fundo `fv-umber-600`, texto `fv-linen-100` — contraste visual com o resto da página (que é claro).
- Princípio: **Autoria** + **Transparência** — mostrar que existe gente, tempo e lugar por trás.

---

## 5. Mapeamento para arquitetura Medusa + Next.js

### 5.1 Rota

`apps/storefront/src/app/[countryCode]/products/[id]/page.tsx` — server component. Busca produto via `sdk.store.product.retrieve(id)`, passa para `ProductTemplate`.

### 5.2 Componentes (em `src/modules/products/`)

| Componente | Seção | Novo? |
|---|---|---|
| `ProductHero` (galeria + info acima da dobra) | 3 | Estende o existente |
| `ProductGallery` (mini-rail + zoom) | 3.3.1 | Estende |
| `ProductActions` (variant + CTA + preço) | 3.3.2 (5-9) | Estende |
| `ProductTrust` (provas de confiança) | 3.3.2 (10) | **Novo** |
| `ProductGallery360` | 4.2.1 | **Novo** |
| `ProductVideo` | 4.2.2 | **Novo** |
| `ProductStory` | 4.2.3 | **Novo** |
| `ProductMaterials` | 4.2.4 | **Novo** |
| `ProductConstruction` | 4.2.5 | **Novo** |
| `ProductDimensions` | 4.2.6 | **Novo** |
| `ProductInterior` | 4.2.7 | **Novo** |
| `ProductCare` | 4.2.8 | **Novo** |
| `ProductLeadTime` | 4.2.9 | **Novo** |
| `ProductReviews` | 4.2.10 | **Novo** (Medusa não tem nativo) |
| `ProductRelated` | 4.2.11 | Estende o existente |
| `ProductCompleteLook` | 4.2.12 | **Novo** |
| `ProductGift` | 4.2.13 | **Novo** |
| `ProductWaitlist` | 4.2.14 | **Novo** |
| `ProductCollection` | 4.2.15 | Estende |
| `ProductBackstage` | 4.2.16 | **Novo** |

### 5.3 Dados Medusa — campos necessários

Mapeamento de seção PDP → campo Medusa. Itens marcados **❌ inexistente** precisam de custom module ou metadata.

| Campo PDP | Origem Medusa | Estado |
|---|---|---|
| ID, handle, título | `product.id`, `.handle`, `.title` | ✅ |
| Microdescrição | `product.subtitle` ou `metadata.subtitle` | ✅ |
| Imagens (4) | `product.images[]` | ✅ |
| Preço | `product.variants[].prices[]` (calculated_price) | ✅ |
| Disponibilidade | `product.variants[].inventory_quantity` + `metadata.availability` | ⚠️ metadata nova |
| Prazo de produção | `metadata.lead_time_days` | ❌ inexistente |
| Material | `metadata.materials` | ❌ inexistente |
| Dimensões | `metadata.dimensions` | ❌ inexistente |
| Capacidade | `metadata.capacity` | ❌ inexistente |
| Personalização | Product options + custom module | ❌ inexistente |
| Garantia | `metadata.warranty` | ❌ inexistente |
| História da peça | `metadata.story` ou `product.description` | ⚠️ usar description |
| Vídeo | `metadata.video_url` | ❌ inexistente |
| Avaliações | Custom module (reviews) | ❌ inexistente |
| Lista de espera | Custom module (waitlist) | ❌ inexistente |
| Bastidores | `metadata.backstage_images` | ❌ inexistente |
| Complete o look | Product relations | ❌ inexistente |
| Mesma coleção | `product.collection_id` | ✅ |

**Conclusão:** a PDP completa exige **4 custom modules** no backend (reviews, waitlist, gift-options, personalization) + **extensão de metadata** com 8 campos. Ver `01-product/` para detalhamento do modelo de dados.

### 5.4 Região e moeda

A PDP é servida sob `[countryCode]/products/[id]`. Para Fio Vivo:

- Região: **Brasil** (BRL) como default — **❌ inexistente no seed atual** (só regiões EU).
- Outras regiões: US (USD), EU (EUR) — segunda fase.
- Pix e parcelamento: **não nativos do Medusa** — precisam de custom pricing logic ou metadata display (o preço pode ser o mesmo, a apresentação de Pix/parcelamento é camada de UI sobre `calculated_price`).

### 5.5 SEO e dados estruturados

- `<title>`: `Espiral dourada — Fio Vivo | Bolsa de crochê sob encomenda`
- `meta description`: microdescrição + material + prazo.
- JSON-LD `Product`: `name`, `image` (4), `description`, `offers` (preço, disponibilidade, SKU), `brand` (Fio Vivo), `aggregateRating` (se reviews).
- Breadcrumbs: `Home / Coleção / Espiral dourada`.
- `og:image`: `01-frente` em alta resolução.

---

## 6. Interações e estados

### 6.1 Seleção de variante

- Radio cards, não dropdown. Cada opção é clicável, mostra swatch de cor quando aplicável.
- Ao trocar variante: preço, prazo e disponibilidade atualizam sem reload (fetch client-side do `calculated_price` da variante).
- Se variante esgotada: radio card fica disabled, mostra `Esgotada` em `body-sm`.

### 6.2 Personalização

- Fluxo inline, não modal.
- Acréscimo de preço e prazo atualiza o bloco de preço em tempo real.
- Validação: monograma máx 3 letras, só alfanumérico, sem acento.
- Botão "Aplicar personalização" antes de habilitar o CTA primário (evita compra acidental com personalização não confirmada).

### 6.3 CTA primário → carrinho

- Adiciona ao cart via `sdk.store.cart.addItem`.
- Para sob encomenda: adiciona com `metadata.made_to_order = true` (precisa de custom cart line metadata — **❌ inexistente**, ver `01-product/`).
- Feedback: toast `Peça adicionada — sob encomenda, produção inicia após pagamento` (não genérico "added to cart").
- Drawer de cart abre mostrando a peça, o prazo e o total.

### 6.4 Lista de espera

- Formulário inline no lugar do CTA quando esgotada.
- Submete para custom endpoint `/store/waitlist` (**❌ inexistente**).
- Feedback: `Você está na posição ~4. Avisaremos por email quando abrir.`

### 6.5 Erros

- Falha de rede ao buscar produto: tela com `fv-umber-600` fundo, copy `Não consegui carregar esta peça agora. Tentar novamente.` + botão.
- Produto inexistente: 404 branded com copy `Esta peça não está mais no atelier. Ver outras peças.` + link para catálogo.
- Variante sem preço: `Preço sob consulta — entre na lista de espera` em vez de R$ 0.

---

## 7. Copy — guia por elemento

| Elemento | Copy padrão | Alternativa por estado |
|---|---|---|
| CTA primário (pronta) | `Levar esta peça` | — |
| CTA primário (encomenda) | `Encomendar esta peça` | — |
| CTA primário (esgotada) | — | `Entrar na lista de espera` (secundário) |
| CTA secundário | `+ Lista de espera` / `Adicionar ao presente` | — |
| Toast de carrinho (pronta) | `Peça adicionada ao carrinho` | — |
| Toast de carrinho (encomenda) | `Encomenda registrada — produção inicia após pagamento` | — |
| Estado badge (pronta) | `Pronta para envio` | — |
| Estado badge (encomenda) | `Sob encomenda` | — |
| Estado badge (reservada) | `Reservada` | — |
| Estado badge (esgotada) | `Esgotada` | — |
| Erro de variante | `Esta opção está esgotada` | — |
| Lista de espera sucesso | `Anotado. Avisaremos quando esta peça abrir.` | — |
| Garantia linha | `Garantia 90 dias contra defeito de confecção` | — |

**Proibido:** "Comprar agora", "Adicionar ao carrinho" (genérico), "Produto indisponível" (hostil), "Em estoque" (industrial).

---

## 8. Performance

- LCP: imagem frontal `01-frente`. Prioridade `fetchpriority="high"`, `loading="eager"`. As 3 outras imagens: `loading="lazy"`.
- Imagens responsivas: `srcset` com variantes 400, 800, 1254px (para fv-001 a fv-004) ou 340, 682 (para fv-005, fv-006).
- Font display: `Fraunces` com `font-display: swap`; `Inter` já com swap (padrão Medusa).
- JavaScript: seção abaixo da dobra é client-loaded (`next/dynamic` com `ssr: false` para reviews, waitlist, video, backstage) — reduz bundle inicial.
- CLS: galeria tem aspect-ratio fixo (`aspect-square` desktop, `aspect-[4/5]` mobile) para evitar shift.

---

## 9. Checklist de aceitação PDP

- [ ] Imagem frontal `01-frente` é LCP, com `fetchpriority="high"`.
- [ ] Mini-rail de 4 thumbs dentro da área de imagem.
- [ ] Nome em `font-display`, número de peça em `font-mono`.
- [ ] Estado badge + prazo visíveis sem scroll.
- [ ] Preço com Pix e parcelamento visíveis sem scroll.
- [ ] CTA primário com copy condicional ao estado.
- [ ] Personalização inline, não modal (quando aplicável).
- [ ] Provas de confiança (garantia, envio, Pix, avaliações) visíveis sem scroll.
- [ ] 16 seções abaixo da dobra implementadas ou omitidas conscientemente.
- [ ] Seção de bastidores com fundo `fv-umber-600` (contraste com resto claro).
- [ ] Avaliações com selo `✓ Compra verificada`.
- [ ] JSON-LD `Product` presente.
- [ ] Estados de erro com copy humana.
- [ ] Mobile: galeria full-width, info em stack, CTA sticky bottom ao scroll.
- [ ] Sem copy SaaS ("Comprar agora", "Adicionar ao carrinho").

---

*Fim de product-page-spec.md*