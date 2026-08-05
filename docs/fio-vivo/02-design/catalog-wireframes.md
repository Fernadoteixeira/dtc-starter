# 02.4 — Wireframes de Catálogo Fio Vivo

**Data:** 2026-08-05
**Estado:** Vigente
**Aplica-se a:** Home (20 seções), páginas de coleção, listing de catálogo, busca
**Depende de:** `experience-principles.md`, `design-system-extension.md`, `product-page-spec.md`
**Viewport de referência:** 1600×960 (gallery), 1440×900 (resto), 390×844 (mobile)

---

## 1. Princípios de layout de catálogo

Fio Vivo **não usa grade de produtos igual-width** (contrato `forbidden.equal_width_grid: true`). O catálogo é editorial — mistura escalas, ritmos assimétricos e colunas de respiração. Isto materializa os princípios de **Contemporaneidade** e **Matéria**.

Regras que valem para todos os wireframes abaixo:

1. **Card dominante / cards satélite:** em cada cluster de produtos, um card é maior (≥ 1.30× a largura dos outros, conforme contrato `active_to_neighbor_width_ratio_min`). Os outros orbitam ao redor.
2. **Coluna editorial à esquerda:** toda seção de catálogo abre com uma coluna de 300px com contexto (título, narrativa curta, número de peças). Não é barra lateral de filtro — é contexto editorial.
3. **Imagem de produto é retangular, sem raio:** fotos de peças têm `radius-none`. O raio é dos cards e superfícies, não das fotos.
4. **Estados visíveis:** pronta / sob encomenda / reservada / esgotada como badge, sempre.
5. **Respiração:** `space-section` (96px) entre seções; `space-block` (48px) entre clusters dentro de seção.
6. **Zero SaaS azul** — só tokens `fv-*`.

---

## 2. Home — 20 seções

A home é a maior superficie do catálogo. As 20 seções do mega-prompt são organizadas em 5 grupos de ritmo, alternando densidade alta (clusters de produto) e densidade baixa (editorial, vídeo, captura).

### 2.1 Ordem e agrupamento

```
┌─ GRUPO A — Descoberta ──────────────────────────────────────┐
│  01. Hero (gallery experience)                              │
│  02. Coleção destaque                                       │
└─────────────────────────────────────────────────────────────┘
┌─ GRUPO B — Catálogo vivo ───────────────────────────────────┐
│  03. Peças prontas (envio imediato)                         │
│  04. Sob encomenda                                          │
│  05. Novidades / drops                                      │
└─────────────────────────────────────────────────────────────┘
┌─ GRUPO C — Atelier ─────────────────────────────────────────┐
│  06. Processo artesanal                                     │
│  07. História da artesã                                     │
│  08. Vídeo de produção                                      │
└─────────────────────────────────────────────────────────────┘
┌─ GRUPO D — Prova e social ──────────────────────────────────┐
│  09. Best-sellers                                           │
│  10. Presentes                                              │
│  11. Personalização                                         │
│  12. Avaliações verificadas                                 │
└─────────────────────────────────────────────────────────────┘
┌─ GRUPO E — Conteúdo e conversão ─────────────────────────────┐
│  13. Conteúdo editorial                                     │
│  14. Lista VIP                                              │
│  15. Programa de indicação                                  │
│  16. Instagram curado                                       │
│  17. Garantias                                              │
│  18. FAQ                                                    │
│  19. Captura de preferências                                │
│  20. CTA de descoberta                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Wireframes por seção (desktop 1440px)

### 3.1 01 — Hero (gallery experience)

Wireframe detalhado está no contrato `nos-gallery-first-fold.yaml` e implementado em `@dtc/gallery-experience`. Resumo:

```
1600×960
┌────────────┬─────────────────────────────────────┬──────────┐
│ EDITORIAL  │  ACTIVE CARD          │ ADJACENT │ CONT │          │
│ 300px      │  (centro dominante)   │ (parcial) │(frag)│  CTA    │
│            │  420px wide            │ 320px    │320px │  inferior│
│ Coleção    │  520px tall            │ 480px    │480px │  direita │
│ Nº 01      │                        │          │      │          │
│ Título     │  [scene rail dentro]   │          │      │          │
│ Narrativa  │  ◀ ● ○ ○ ▶             │          │      │          │
│ Contador   │                        │          │      │          │
│ 01/06      │  Caption: fv-001       │          │      │          │
│            │  Espiral dourada       │          │      │          │
│            │  Sob encomenda         │          │      │          │
└────────────┴────────────────────────────────────┴──────────┘
           ▲ navigation dots centralizadas, bottom ▲
```

Ver `design-system-extension.md` seção 4 para a correção de paleta (bloqueador atual).

---

### 3.2 02 — Coleção destaque

```
┌──────────────────────────────────────────────────────────────────────┐
│  COLEÇÃO DESTAQUE                                                     │
│  ┌──────────┐                                                          │
│  │ EDIT 300 │  ┌─────────────────────┐  ┌──────────┐                  │
│  │          │  │                     │  │          │                   │
│  │ Coleção  │  │   fv-001            │  │  fv-002  │                   │
│  │ Âmbar     │  │   Espiral dourada  │  │  Órbita  │                   │
│  │ 6 peças   │  │   (dominante 1.4×) │  │  negra   │                   │
│  │          │  │                     │  │          │                   │
│  │ "Esta    │  │                     │  │          │                   │
│  │ coleção  │  └─────────────────────┘  └──────────┘                  │
│  │ nasceu   │                              ┌──────────┐                │
│  │ do fio   │  ┌──────────┐                │ fv-003   │                │
│  │ âmbar    │  │ fv-004   │                │ Trama    │                │
│  │..."     │  │ Ancestral│                │ solar    │                │
│  │          │  └──────────┘                └──────────┘                │
│  │ Ver coleção ▶                                                         │
│  └──────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

- Coluna editorial esquerda com narrativa da coleção (2-3 linhas), número de peças, CTA "Ver coleção".
- Cluster 2×2 assimétrico: fv-001 dominante (1.4× largura), outros 3 orbitam.
- Cada card: foto frontal, número+nome, estado badge, preço mono. Sem botão — clique no card abre PDP.
- Fundo `fv-linen-50`.

---

### 3.3 03 — Peças prontas

```
┌──────────────────────────────────────────────────────────────────────┐
│  PEÇAS PRONTAS — envio imediato                                       │
│  ┌──────────┐                                                          │
│  │ EDIT 300 │  ┌────────────┐ ┌──────────┐                            │
│  │          │  │            │ │          │                             │
│  │ 3 peças  │  │ fv-005     │ │ fv-006   │                            │
│  │ prontas  │  │ Trança     │ │ Duna     │                            │
│  │ para     │  │ âmbar      │ │ terracota│                            │
│  │ envio    │  │ ● Pronta   │ │ ● Pronta │                            │
│  │          │  │ 2-5 dias   │ │ 2-5 dias │                            │
│  │ "Pronto  │  │ R$ 380     │ │ R$ 420   │                            │
│  │ não      │  └────────────┘ └──────────┘                            │
│  │ significa│       ┌──────────┐                                      │
│  │ menos    │       │ fv-003   │                                       │
│  │ cuidado.│       │ Trama    │                                       │
│  │ Significa│      │ solar    │                                       │
│  │ hoje."   │      │ ● Pronta │                                       │
│  │          │      └──────────┘                                       │
│  └──────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

- Diferencial: badge `Pronta` + prazo de envio (não de produção) em cada card.
- Layout 3 cards: 2 acima, 1 abaixo deslocado — quebra a grade.
- Coluna editorial com narrativa curta sobre "pronto" vs "encomenda".

---

### 3.4 04 — Sob encomenda

```
┌──────────────────────────────────────────────────────────────────────┐
│  SOB ENCOMENDA — feita para você                                      │
│  ┌──────────┐  ┌───────────────────────────────────────────────────┐  │
│  │ EDIT 300 │  │  fv-001   fv-002   fv-004                        │  │
│  │          │  │ ┌──────┐┌──────┐┌──────┐                        │  │
│  │ 3 peças  │  │ │      ││      ││      │                        │  │
│  │ sob      │  │ │      ││      ││      │                        │  │
│  │ encomenda│  │ └──────┘└──────┘└──────┘                        │  │
│  │          │  │  Encom. Encom. Encom.                            │  │
│  │ "Sob     │  │  7-10d  7-10d  10-14d                            │  │
│  │ encomenda│  │  R$480  R$520 R$560                              │  │
│  │ é feito  │  └───────────────────────────────────────────────────┘  │
│  │ depois. │                                                           │
│  │ É também│  [Explicação do processo — 2 linhas, body-sm]            │
│  │ mais    │                                                           │
│  │ seu."   │                                                           │
│  └──────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

- 3 cards em linha (iguais aqui é aceitável — o ritmo assimétrico vem das outras seções), mas com badge de encomenda e prazo de produção visível.
- Abaixo dos cards: linha de explicação do processo (2 linhas, body-sm, fv-umber-400) — princípio de Transparência.
- Coluna editorial com copy que reenquadra "espera" como parte do valor.

---

### 3.5 05 — Novidades / drops

```
┌──────────────────────────────────────────────────────────────────────┐
│  NOVIDADES / DROPS                                                     │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  EDIT (inline, não coluna): "Próximo drop: agosto"             │  │
│  │  + contador de dias (mono, fv-copper-500)                      │  │
│  │  + 1 imagem teaser (escura, fv-umber-700 fundo, crop dramatico) │  │
│  │  + CTA "Entrar na lista VIP"                                    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Drops anteriores (arquivo):                                   │  │
│  │  Drop 03 — junho · 5 peças · esgotado                          │  │
│  │  Drop 02 — maio · 4 peças · 1 peça disponível                  │  │
│  │  Drop 01 — abril · 6 peças · esgotado                          │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- Drop é tratado como **convite**, não como promoção (princípio de Exclusividade).
- Imagem teaser escura (fv-umber-700) com crop que não revela a peça inteira — tensão.
- Contador de dias em mono, fv-copper-500, sem relógio regressivo agressivo.
- Arquivo de drops anteriores — peças vendidas permanecem visíveis (princípio: peças vendidas não somem).

---

### 3.6 06 — Processo artesanal

```
┌──────────────────────────────────────────────────────────────────────┐
│  PROCESSO ARTESANAL                                                    │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  4 etapas em linha horizontal, cada uma:                       │  │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │  │
│  │  │ 01-Fio  │  │02-Ponto │  │03-Forma│  │04-Acabam│          │  │
│  │  │ [foto]  │  │ [foto]  │  │ [foto]  │  │ [foto]  │          │  │
│  │  │         │  │         │  │         │  │         │          │  │
│  │  │ Escolha │  │ Crochê  │  │ Moldagem│  │ Acabam. │          │  │
│  │  │ do fio  │  │ manual  │  │ sem     │  │ bordas, │          │  │
│  │  │         │  │         │  │ molde   │  │ forro   │          │  │
│  │  │ ~2h     │  │ ~12h    │  │ ~1h     │  │ ~2h     │          │  │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘          │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Narrativa abaixo (body-lg, max-width 65ch):                            │
│  "Cada peça passa por quatro mãos, em quatro tempos. O fio escolhido   │
│  na manhã, o ponto que começa à tarde, a forma que cresce devagar..."  │
└──────────────────────────────────────────────────────────────────────┘
```

- 4 cards em linha com foto de bastidores + tempo em mono.
- Tempo é informação de primeira classe (princípio de Tempo).
- Narrativa abaixo em coluna estreita — legibilidade.

---

### 3.7 07 — História da artesã

```
┌──────────────────────────────────────────────────────────────────────┐
│  HISTÓRIA DA ARTESÃ                                                    │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐    │
│  │                              │  │  [retrato da artesã no        │    │
│  │  "Eu aprendi crochê com a    │  │   atelier, fv-umber-600       │    │
│  │   minha avó, aos 8 anos.     │  │   fundo]                      │    │
│  │   Ela fazia tapetes..."      │  │                               │    │
│  │                              │  │  — Fernanda                    │    │
│  │  [narrativa 4-6 paragrafos,  │  │  atelier Fio Vivo             │    │
│  │   body-lg, max-width 55ch]   │  │                               │    │
│  │                              │  │  [link: ver bastidores ▶]     │    │
│  └─────────────────────────────┘  └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

- Coluna texto 60% + coluna retrato 40%.
- Assinatura em display-sm.
- Princípio de Autoria — o rosto e o nome são centrais.

---

### 3.8 08 — Vídeo de produção

```
┌──────────────────────────────────────────────────────────────────────┐
│  VÍDEO DE PRODUÇÃO                                                     │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │            [player 16:9, poster = 03-gesto]                    │  │
│  │              ▶  "Do fio à forma" — 3:42                         │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Legenda abaixo (body-sm): "Filmado no atelier em São Paulo, 2026."    │
└──────────────────────────────────────────────────────────────────────┘
```

- Player centralizado, max-width 900px.
- Sem autoplay. Poster fixo (não animado).
- Duração visível antes do play.

---

### 3.9 09 — Best-sellers

```
┌──────────────────────────────────────────────────────────────────────┐
│  BEST-SELLERS                                                          │
│  ┌──────────┐  ┌──────────────────┐ ┌──────────┐                       │
│  │ EDIT 300 │  │  fv-003          │ │  fv-001  │                       │
│  │          │  │  Trama solar     │ │  Espiral │                       │
│  │ "As mais │  │  ★ 4,9 (31)      │ │  dourada │                       │
│  │ levadas  │  │  12 levadas      │ │  ★ 4,9   │                       │
│  │  pelo    │  │  este mês        │ │  (23)    │                       │
│  │  público"│  └──────────────────┘ └──────────┘                       │
│  │          │       ┌──────────┐                                      │
│  │          │       │  fv-005  │                                      │
│  │          │       │  Trança  │                                      │
│  │          │       │  âmbar  │                                      │
│  │          │       │  ★ 4,8   │                                      │
│  │          │       └──────────┘                                      │
│  └──────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

- Cards com prova social: avaliação + contagem de levadas.
- Princípio de Confiança.

---

### 3.10 10 — Presentes

```
┌──────────────────────────────────────────────────────────────────────┐
│  PRESENTES                                                              │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ EDIT (centro, não coluna lateral):                              │  │
│  │ "Presentear é entregar algo que alguém escolheu pensar em        │  │
│  │  você. Fio Vivo embala em saco de tecido, tag manuscrita,         │  │
│  │  mensagem digital ou papel."                                    │  │
│  │                                                                  │  │
│  │ 3 cards em linha:                                                │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │  │
│  │  │ Até R$200   │ │ R$200-400   │ │ Acima R$400 │              │  │
│  │  │ [foto peça] │ │ [foto peça] │ │ [foto peça] │              │  │
│  │  │ fv-006      │ │ fv-005      │ │ fv-001      │              │  │
│  │  │ Duna        │ │ Trança     │ │ Espiral     │              │  │
│  │  │ terracota   │ │ âmbar      │ │ dourada     │              │  │
│  │  └─────────────┘ └─────────────┘ └─────────────┘              │  │
│  │                                                                  │  │
│  │  CTA: "Ver todas as peças para presente"                         │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- Faixas de preço, não grade de produto.
- Embalagem descrita no editorial (Humanidade).

---

### 3.11 11 — Personalização

```
┌──────────────────────────────────────────────────────────────────────┐
│  PERSONALIZAÇÃO                                                         │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐    │
│  │                              │  │  3 opções em lista vertical: │    │
│  │  [foto de peça personalizada,│  │  ┌────────────────────────┐ │    │
│  │   fv-001 com cor diferente] │  │  │ Cor do fio               │ │    │
│  │                              │  │  │ +R$40 · +5 dias          │ │    │
│  │  "Você pode pedir uma peça   │  │  │ 8 cores disponíveis      │ │    │
│  │   com a cor do seu gosto,   │  │  └────────────────────────┘ │    │
│  │   monograma, ou ajuste de   │  │  ┌────────────────────────┐ │    │
│  │   alça. Não é customização   │  │  │ Monograma (3 letras)    │ │    │
│  │   industrial — é crochê      │  │  │ +R$60 · +3 dias          │ │    │
│  │   feito para você."         │  │  └────────────────────────┘ │    │
│  │                              │  │  ┌────────────────────────┐ │    │
│  │                              │  │  │ Alça ajustável          │ │    │
│  │                              │  │  │ +R$0 · +0 dias          │ │    │
│  │                              │  │  └────────────────────────┘ │    │
│  │                              │  │                              │    │
│  │                              │  │  [CTA: Começar personalização]│   │
│  └─────────────────────────────┘  └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

- Imagem esquerda + lista direita.
- Cada opção com preço e acréscimo de prazo explícito (Transparência).

---

### 3.12 12 — Avaliações verificadas

```
┌──────────────────────────────────────────────────────────────────────┐
│  AVALIAÇÕES VERIFICADAS                                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  ★ 4,9  (display-xl, fv-copper-500)    89 avaliações verificadas │  │
│  │  ███████████████████░░  5★ · 78                                    │  │
│  │  ████░░░░░░░░░░░░░░░░░  4★ · 8                                     │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░  3★ · 2                                     │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░  2★ · 0                                     │  │
│  │  ░░░░░░░░░░░░░░░░░░░░░  1★ · 1                                     │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  3 cards em linha (destaque):                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │
│  │ ★★★★★        │ │ ★★★★★        │ │ ★★★★★        │                   │
│  │ "Peça linda, │ │ "O crochê é  │ │ "Presenteei e│                   │
│  │  acabamento  │ │  impecável."│ │  foi amor."  │                   │
│  │  impecável." │ │              │ │              │                   │
│  │ — Ana P.     │ │ — Carla M.   │ │ — Júlia S.   │                   │
│  │ ✓ verificada │ │ ✓ verificada │ │ ✓ verificada │                   │
│  │ fv-001 · 12/06│ │ fv-003 · 05/06│ │ fv-005 · 28/05│                   │
│  └──────────────┘ └──────────────┘ └──────────────┘                   │
│                                                                         │
│  [CTA: Ver todas as avaliações ▶]                                      │
└──────────────────────────────────────────────────────────────────────┘
```

- Distribuição visual em barras.
- Cards com texto curto, nome, selo de verificação, peça e data.
- Princípio de Confiança.

---

### 3.13 13 — Conteúdo editorial

```
┌──────────────────────────────────────────────────────────────────────┐
│  CONTEÚDO EDITORIAL                                                     │
│  ┌─────────────────────────────┐  ┌──────────────────────────────┐    │
│  │ [imagem editorial ampla]    │  │  "Por que crochê não é       │    │
│  │                              │  │  artesanato nostálgico"      │    │
│  │                              │  │  — ensaio de Fernanda        │    │
│  │                              │  │                              │    │
│  │                              │  │  "Cinco fios que mudaram    │    │
│  │                              │  │  meu jeito de fazer"         │    │
│  │                              │  │  — diário de atelier         │    │
│  │                              │  │                              │    │
│  │                              │  │  "Como cuidar de uma peça  │    │
│  │                              │  │  de crochê"                  │    │
│  │                              │  │  — guia prático              │    │
│  └─────────────────────────────┘  └──────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

- Imagem editorial grande + lista de artigos com link.
- Títulos em display-sm, descrição em body-sm.
- Princípio de Autoria + Contemporaneidade.

---

### 3.14 14 — Lista VIP

```
┌──────────────────────────────────────────────────────────────────────┐
│  LISTA VIP                                                             │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  fv-umber-700 fundo · grain layer ativo · texto fv-linen-50     │  │
│  │                                                                │  │
│  │           "Você antes de todo mundo"                          │  │
│  │           (display-lg, centrado)                              │  │
│  │                                                                │  │
│  │           "A lista VIP recebe aviso 24h antes de cada drop,   │  │
│  │            acesso a peças exclusivas e desconto de primeira   │  │
│  │            compra."  (body, max-width 55ch, centrado)         │  │
│  │                                                                │  │
│  │           ┌─────────────────────────────────┐                │  │
│  │           │ email                            │                │  │
│  │           └─────────────────────────────────┘                │  │
│  │           ┌─────────────────────────────────┐                │  │
│  │           │ Entrar na lista VIP          ▶ │                │  │
│  │           └─────────────────────────────────┘                │  │
│  │                                                                │  │
│  │           "Sem spam. Apenas quando algo importante acontecer."│  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- Fundo escuro (fv-umber-700) com grain — único bloco escuro fora a gallery e os bastidores.
- Tratamento de convite, não de promoção (Exclusividade).
- Sem incentivo de urgência fake.

---

### 3.15 15 — Programa de indicação

```
┌──────────────────────────────────────────────────────────────────────┐
│  PROGRAMA DE INDICAÇÃO                                                  │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  Indique Fio Vivo para alguém que vai amar.                     │  │
│  │  Você ganha R$ 40 na próxima peça. Ela ganha R$ 40 na primeira.  │  │
│  │                                                                  │  │
│  │  [link único para compartilhar] [copiar link] [WhatsApp]        │  │
│  │                                                                  │  │
│  │  3 indicações feitas · 1 convertida                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- Bloco simples, inline, fundo fv-cream.
- Mostra progresso do usuário (se logado).

---

### 3.16 16 — Instagram curado

```
┌──────────────────────────────────────────────────────────────────────┐
│  INSTAGRAM CURADO                                                       │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐                            │
│  │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │                            │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘                            │
│                                                                         │
│  @fiovivo · curado pela artesã                                           │
│  [Seguir no Instagram ▶]                                                │
└──────────────────────────────────────────────────────────────────────┘
```

- 6 posts em linha, quadrados, sem raio (radius-none).
- Mostra atelier, processo, peças em uso — não só produto final (Humanidade).

---

### 3.17 17 — Garantias

```
┌──────────────────────────────────────────────────────────────────────┐
│  GARANTIAS                                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ ✓ 90 dias   │ │ ✓ Envio     │ │ ✓ Retoque   │ │ ✓ Troca     │      │
│  │ contra      │ │ nacional    │ │ gratuito    │ │ 7 dias se   │      │
│  │ defeito de  │ │ rastreado   │ │ nos 90 dias │ │ não amar    │      │
│  │ confecção   │ │             │ │             │ │             │      │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘      │
└──────────────────────────────────────────────────────────────────────┘
```

- 4 cards iguais aqui é aceitável — são ícones, não produtos. Contrato proíbe grade igual-width de **produtos**, não de ícones.
- Princípio de Confiança + Transparência.

---

### 3.18 18 — FAQ

```
┌──────────────────────────────────────────────────────────────────────┐
│  PERGUNTAS FREQUENTES                                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  ▸ Qual a diferença entre peça pronta e sob encomenda?          │  │
│  │  ▸ Quanto tempo leva uma peça sob encomenda?                    │  │
│  │  ▸ Posso personalizar a cor?                                    │  │
│  │  ▸ Como funciona a garantia?                                    │  │
│  │  ▸ Vocês enviam para fora do Brasil?                           │  │
│  │  ▸ Como cuido da minha peça?                                    │  │
│  │  ▸ Posso trocar ou devolver?                                   │  │
│  │  ▸ O que é a lista VIP?                                        │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  Não achou? [Falar com o atelier ▶]                                     │
└──────────────────────────────────────────────────────────────────────┘
```

- Accordion vertical, sem coluna lateral.
- Respostas em body, max-width 65ch.
- CTA de fallback humano no final (Humanidade).

---

### 3.19 19 — Captura de preferências

```
┌──────────────────────────────────────────────────────────────────────┐
│  CAPTURA DE PREFERÊNCIAS                                                │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  "Para te mostrar o que importa, conta o que você busca:"        │  │
│  │                                                                  │  │
│  │  □ Bolsas para o dia a dia                                       │  │
│  │  □ Bolsas para ocasião                                           │  │
│  │  □ Acessórios                                                     │  │
│  │  □ Peças exclusivas / drops                                      │  │
│  │                                                                  │  │
│  │  Faixa de preço: R$200─────●─────────R$800                        │  │
│  │                                                                  │  │
│  │  email [_______________]  [Salvar preferências]                   │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- Não é lista VIP — é mais gentil, captura interesse para personalizar a home futura.
- Slider de preço em fv-copper-500.

---

### 3.20 20 — CTA de descoberta

```
┌──────────────────────────────────────────────────────────────────────┐
│  CTA DE DESCOBERTA                                                      │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │  fv-umber-800 fundo · grain · vignette                          │  │
│  │                                                                  │  │
│  │            "Cada peça tem uma história"                         │  │
│  │            (display-xl, fv-linen-50, centrado)                  │  │
│  │                                                                  │  │
│  │            "Descubra a coleção Fio Vivo"                        │  │
│  │            (display-sm, fv-copper-400)                          │  │
│  │                                                                  │  │
│  │            [Ver todas as peças ▶]                                │  │
│  │            (fv-cta-primary, centrado)                            │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- Fechamento da home, fundo escuro com texturas (Textura + Contemporaneidade).
- Última impressão antes do rodapé.

---

## 4. Página de coleção (listing)

```
1440×900
┌──────────────────────────────────────────────────────────────────────┐
│  [Header]                                                              │
├──────────────────────────────────────────────────────────────────────┤
│  COLEÇÃO ÂMBAR                                                          │
│  ┌────────────┐                                                          │
│  │ EDIT 300px │  ┌─────────────────────────────────────────────┐       │
│  │            │  │  [filtro: estado ▾] [ordem ▾]                │       │
│  │ Coleção     │  └─────────────────────────────────────────────┘       │
│  │ Âmbar       │                                                          │
│  │ 6 peças     │  ┌──────────────────┐  ┌──────────┐                    │
│  │             │  │  fv-001          │  │  fv-002  │                     │
│  │ "Fios       │  │  Espiral dourada│  │  Órbita  │                     │
│  │  âmbar,     │  │  ● Encomenda    │  │  ● Pronta│                     │
│  │  tingimento │  │  R$ 480          │  │  R$ 520  │                     │
│  │  vegetal."  │  └──────────────────┘  └──────────┘                    │
│  │             │       ┌──────────┐         ┌──────────┐                │
│  │             │       │  fv-003 │         │  fv-004  │                │
│  │             │       │  Trama  │         │  Ancestral│               │
│  │             │       └──────────┘         └──────────┘                │
│  │             │  ┌──────────┐                                          │
│  │             │  │  fv-005 │                                           │
│  │             │  │  Trança│                                           │
│  │             │  └──────────┘                                          │
│  │             │  [fv-006 abaixo, deslocado]                            │
│  └────────────┘                                                          │
└──────────────────────────────────────────────────────────────────────┘
```

- Coluna editorial fixa à esquerda com sticky scroll.
- Filtros inline no topo da área de listagem (não na coluna editorial).
- Cluster assimétrico: 4 peças em 2×2 com um card maior, depois 2 peças em linha com deslocamento.
- Sem paginação tradicional — "carregar mais" no scroll infinito.

---

## 5. Mobile (390px) — adaptações

Em mobile, todas as colunas editoriais 300px viram um bloco superior compacto (não coluna lateral). Clusters viram stack vertical. Cards ocupam 100% largura.

### 5.1 Cluster mobile padrão

```
┌──────────────────────────┐
│ EDITORIAL (top block)    │
│ Título                   │
│ 2 linhas de narrativa    │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ fv-001 dominante     │ │
│ │ [imagem 1:1]         │ │
│ │ nome + estado + preço│ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ fv-002              │ │
│ └──────────────────────┘ │
└──────────────────────────┘
```

### 5.2 Gallery mobile

A gallery já tem breakpoint em 768px (ver CSS atual): vira coluna única, cards reduzem para 260-300px. Coluna editorial vira header de bloco. Mantém scene rail dentro do card ativo.

---

## 6. Estados de card — tabela visual

| Estado | Badge | Opacidade card | CTA no card | Comportamento |
|---|---|---|---|---|
| Pronta | `Pronta` (copper-500 sólido) | 1.0 | — | Clique abre PDP |
| Sob encomenda | `Sob encomenda` (copper-400 borda) | 1.0 | — | Clique abre PDP |
| Reservada | `Reservada` (umber-300 sólido) | 0.7 | — | Clique abre PDP com aviso |
| Esgotada | `Esgotada` (linen-500 borda) | 0.5 | `Lista de espera` | Clique abre PDP em modo esgotada |
| Drop futuro | `Drop agosto` (copper-500 borda tracejada) | 1.0 | `Entrar na lista VIP` | Clique abre lista VIP |

---

## 7. Densidade e ritmo — regra de alternância

A home não é monotônica. A cada 2-3 seções de produto, há 1 seção editorial/vídeo/captura de baixa densidade. Isto evita a fadiga do catálogo e mantém o ritmo de atelier:

```
Densidade alta: 01, 02, 03, 04, 05, 09, 10, 11, 16
Densidade baixa: 06, 07, 08, 12, 13, 14, 15, 17, 18, 19, 20
```

Padrão: A-A-A-B-A-A-A-B-A-B-B-B-B (onde A=alta, B=baixa). Isto é intencional — não reordenar sem documentar a decisão.

---

## 8. Checklist de aderência do catálogo

- [ ] Nenhuma grade de produtos igual-width 4×N.
- [ ] Coluna editorial 300px em seções de destaque (01, 02, 03, 04, 09, 10, 11).
- [ ] Card dominante ≥ 1.30× largura dos satélites em clusters de destaque.
- [ ] Imagens de produto com `radius-none`.
- [ ] Estado badge em todo card de produto.
- [ ] Preço em `font-mono` em todo card.
- [ ] Fundo escuro (fv-umber-700/800) apenas em: gallery hero, lista VIP, CTA final.
- [ ] Grain layer ativo nos 3 blocos escuros acima.
- [ ] Seções de baixa densidade interlecionadas com as de alta.
- [ ] Mobile: sem coluna lateral sticky; editorial vira bloco topo; cards full-width.
- [ ] Nenhum contador de urgência fake, nenhum relógio regressivo.
- [ ] Peças esgotadas/reservadas visíveis (não escondidas).

---

*Fim de catalog-wireframes.md*