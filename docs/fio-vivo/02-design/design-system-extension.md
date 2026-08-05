# 02.2 — Extensão do Design System Fio Vivo

**Data:** 2026-08-05
**Estado:** Vigente
**Aplica-se a:** `apps/storefront` (Tailwind 3 + Medusa UI), `packages/gallery-experience` (CSS BEM)
**Depende de:** `apps/storefront/tailwind.config.js`, `packages/gallery-experience/src/styles/gallery-experience.css`
**Contrato visual:** `.agents/contracts/nos-gallery-first-fold.yaml`

---

## 1. Escopo e relacionamento com o sistema existente

O storefront usa **Tailwind 3.0.23** com o preset `@medusajs/ui-preset` e uma camada de cores `grey-*` própria. O package `@dtc/gallery-experience` usa CSS BEM isolado, classes `dtc-gallery__*`, com variáveis CSS locais `--dtc-gallery-*`.

Esta extensão **não substitui** o design system Medusa. Ela o estende com tokens específicos da marca Fio Vivo que vivem ao lado de `medusa/ui-preset`. Onde há conflito de intenção (paleta, raio, tipo), a marca Fio Vivo prevalece em superfícies de marca (home, PDP, catálogo, emails); o preset Medusa prevalece em superfícies de transação pura (admin, checkout de backend, account técnico).

**Camadas alteradas:**
- `theme.extend.colors` — adicionar tokens Fio Vivo.
- `theme.extend.fontFamily` — adicionar display serifada.
- `theme.extend.borderRadius` — adicionar raio orgânico.
- `theme.extend.backgroundImage` — adicionar texturas grain/vignette.
- `packages/gallery-experience/src/styles/gallery-experience.css` — substituir paleta SaaS atual.

---

## 2. Paleta — Copper / Umber / Linen

A paleta é terrosa, mineral, quente. Deriva da matéria (fio de algodão cru, fio âmbar, fio terracota) e da luz natural do atelier, não de um sistema de cor de SaaS. Há três famílias: **Copper** (acento quente, metal), **Umber** (escuros terrosos, profundidade), **Linen** (claros, superfícies).

### 2.1 Tokens — escala completa

| Token | Hex | Uso |
|---|---|---|
| `fv-copper-50` | `#FBF1EA` | Tint mais claro, fundo editorial suave |
| `fv-copper-100` | `#F5DEC9` | Surface hover, badges |
| `fv-copper-200` | `#EBC39C` | Borda hairline em superfícies copper |
| `fv-copper-300` | `#D9A071` | Texto copper sobre Linen |
| `fv-copper-400` | `#C97F4E` | Acento de marca, CTA secundário |
| `fv-copper-500` | `#B8642F` | **Acento primário**, links ativos, CTA principal |
| `fv-copper-600` | `#9C4F22` | CTA hover, estados pressed |
| `fv-copper-700` | `#7A3D1B` | Texto copper sobre fundo escuro |
| `fv-umber-50` | `#F6F1EC` | Fundo neutro quente |
| `fv-umber-100` | `#E8DECF` | Surface card clara |
| `fv-umber-200` | `#C9B49C` | Borda em superfícies Linen |
| `fv-umber-300` | `#A68A6E` | Texto secundário sobre claro |
| `fv-umber-400` | `#7A6450` | Texto primário sobre claro |
| `fv-umber-500` | `#5A4636` | Texto editorial, captions |
| `fv-umber-600` | `#3F3025` | Surface escura, PDP abaixo da dobra |
| `fv-umber-700` | `#2A2018` | **Background gallery** (substitui `#090a0f`) |
| `fv-umber-800` | `#1A130E` | Background de seção escura |
| `fv-umber-900` | `#0F0A07` | Footer, overlay máximo |
| `fv-linen-50` | `#FDFBF7` | **Fundo base** do storefront |
| `fv-linen-100` | `#F7F1E6` | Surface card padrão |
| `fv-linen-200` | `#EDE3D0` | Borda hairline sobre Linen |
| `fv-linen-300` | `#D8C8AC` | Divisória, separador |
| `fv-linen-400` | `#B89F7B` | Texto secundário sobre Linen |
| `fv-linen-500` | `#8C7553` | Texto mute sobre Linen |
| `fv-cream` | `#F2EAD8` | Surface de seção editorial |

> **Dívida técnica a corrigir:** as variáveis `--dtc-gallery-bg-primary: #090a0f` e `--dtc-gallery-accent: #38bdf8` (sky-400) no CSS atual **violam** o contrato `copper_umber_linen_palette: true`. Ver seção 4 para o diff de substituição.

### 2.2 Semântica de uso

| Contexto | Fundo | Texto | Acento |
|---|---|---|---|
| Gallery hero (first fold) | `fv-umber-700` → `fv-umber-800` gradient | `fv-linen-50` | `fv-copper-500` |
| PDP acima da dobra | `fv-linen-50` | `fv-umber-700` | `fv-copper-500` |
| PDP abaixo da dobra | `fv-umber-600` (seções de bastidores) | `fv-linen-100` | `fv-copper-400` |
| Catálogo / cards | `fv-linen-50` | `fv-umber-500` | `fv-copper-500` |
| CTA primário | `fv-copper-500` fundo | `fv-linen-50` texto | — |
| CTA secundário | transparente, borda `fv-copper-500` | `fv-copper-600` | — |
| Estados de erro/alerta | `fv-linen-50` | `fv-copper-700` | `fv-copper-600` |

---

## 3. Tipografia

O storefront atual usa **Inter** (sans) como única família. Fio Vivo introduz uma **display serifada** para títulos editoriais, mantendo Inter para corpo, UI e dados. O contraste serif+sans é parte do princípio de **Contemporaneidade**.

### 3.1 Famílias

| Token | Família | Uso |
|---|---|---|
| `font-display` | `"Fraunces", "Cormorant Garamond", Georgia, serif` | Títulos editoriais, nome de peça, nome de coleção, hero copy |
| `font-sans` (mantido) | `"Inter", -apple-system, ..., sans-serif` | Corpo, UI, dados, microcopy, botões |
| `font-mono` (novo) | `"JetBrains Mono", "IBM Plex Mono", monospace` | Preços, números de peça, dimensões técnicas |

**Fraunces** é a escolha preferida — variable font com eixos de optical size e softness que dialogam com a curva do crochê. Fallback: Cormorant Garamond. Se nenhuma for carregável, Georgia.

### 3.2 Escala

| Token | Família | Peso | Tamanho | Line-height | Letter-spacing | Uso |
|---|---|---|---|---|---|---|
| `display-xl` | display | 500 | 4rem (64px) | 1.05 | -0.02em | Hero home, título de coleção |
| `display-lg` | display | 500 | 3rem (48px) | 1.1 | -0.02em | Título de seção editorial |
| `display-md` | display | 500 | 2.25rem (36px) | 1.15 | -0.01em | Nome de peça na PDP |
| `display-sm` | display | 500 | 1.5rem (24px) | 1.2 | -0.01em | Subtítulo, bloco editorial |
| `body-lg` | sans | 400 | 1.125rem (18px) | 1.6 | 0 | Narrativa, descrição longa |
| `body` | sans | 400 | 1rem (16px) | 1.5 | 0 | Corpo padrão |
| `body-sm` | sans | 400 | 0.875rem (14px) | 1.5 | 0 | Caption, microcopy |
| `label` | sans | 600 | 0.75rem (12px) | 1.4 | 0.08em uppercase | Etiquetas, metadados |
| `price` | mono | 500 | 1.5rem (24px) | 1 | tabular-nums | Preço PDP |
| `price-sm` | mono | 500 | 1rem (16px) | 1 | tabular-nums | Preço em cards |

### 3.3 Regras de uso

- **Display** nunca aparece em corpo de texto, só em títulos. Não usar display para botões ou UI.
- **Mono** é para números de peça (`fv-001`), dimensões (`28 × 22 × 10 cm`), preço. Nunca para copy.
- **Label uppercase** com `letter-spacing: 0.08em` para metadados (número de coleção, disponibilidade, material).
- Número de peça sempre em mono: `fv-001 Espiral dourada` (código em mono, nome em display).
- Contraste mínimo WCAG AA: texto sobre `fv-linen-50` usa `fv-umber-700` (ratio ~9:1); texto sobre `fv-umber-700` usa `fv-linen-50` (ratio ~10:1).

---

## 4. Correção da paleta do gallery-experience (bloqueador)

### 4.1 Estado atual — violações

`packages/gallery-experience/src/styles/gallery-experience.css` linhas 5-11:

```css
--dtc-gallery-bg-primary: #090a0f;              /* ❌ azul-preto SaaS */
--dtc-gallery-bg-surface: rgba(15, 23, 42, 0.65); /* ❌ slate-900 SaaS */
--dtc-gallery-text-primary: #f8fafc;            /* ❌ slate-50 — usar fv-linen-50 */
--dtc-gallery-text-muted: #94a3b8;             /* ❌ slate-400 — usar fv-umber-300 */
--dtc-gallery-accent: #38bdf8;                  /* ❌ sky-400 — SaaS azul */
--dtc-gallery-accent-glow: rgba(56, 189, 248, 0.25); /* ❌ glow azul */
--dtc-gallery-border: rgba(255, 255, 255, 0.12); /* aceitável, mas melhor fv-linen-200 com alpha */
```

E na linha 43 (ambient layer):
```css
radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.12), transparent 60%); /* ❌ violeta SaaS */
```

### 4.2 Estado alvo — substituição

```css
.dtc-gallery,
[data-gallery-experience] {
  --dtc-gallery-bg-primary: #2A2018;            /* fv-umber-700 */
  --dtc-gallery-bg-surface: rgba(63, 48, 37, 0.65); /* fv-umber-600 com alpha */
  --dtc-gallery-text-primary: #FDFBF7;          /* fv-linen-50 */
  --dtc-gallery-text-muted: #A68A6E;            /* fv-umber-300 */
  --dtc-gallery-accent: #B8642F;                /* fv-copper-500 */
  --dtc-gallery-accent-glow: rgba(184, 100, 47, 0.25); /* copper glow */
  --dtc-gallery-border: rgba(237, 227, 208, 0.14); /* fv-linen-200 com alpha */
  --dtc-gallery-radius: 1.25rem;
  --dtc-gallery-font: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
```

Ambient layer (linha 43):
```css
background:
  radial-gradient(circle at 50% 30%, rgba(184, 100, 47, 0.15), transparent 70%),
  radial-gradient(circle at 80% 70%, rgba(122, 61, 27, 0.18), transparent 60%); /* copper + umber, sem violeta */
```

CTA (linhas 272-273):
```css
background: var(--dtc-gallery-accent); /* agora copper-500 */
color: #FDFBF7;                         /* fv-linen-50, não slate-900 */
```

> Esta substituição é **pré-requisito** do gate visual humano (`gate.human_visual_approval_required: true`). Sem ela, a primeira dobra reprova.

---

## 5. Texturas e camadas (grain + vignette + ambient)

O contrato exige três camadas não-opacas sobre o background base. São parte do princípio de **Textura**. Nenhuma é decorativa — todas respondem a conteúdo.

### 5.1 Grain

Camada de ruído sutil que evita a planificação SaaS. Implementação:

```css
.dtc-gallery__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  opacity: 0.04;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>");
}
```

- Opacidade fixa `0.04` — não configurar por produto.
- `mix-blend-mode: overlay` para integrar ao background sem lavar a cor.
- Tile de 200×200 inline SVG — sem asset externo, sem request.
- Aplica-se em `.dtc-gallery` e em qualquer seção editorial de fundo `fv-umber-*`.

### 5.2 Vignette

Escurecimento suave das bordas para dirigir atenção ao centro e dar profundidade:

```css
.dtc-gallery__vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(15, 10, 7, 0.45) 100%);
}
```

- Centro transparente até 55%, bordas a `fv-umber-900` com alpha 0.45.
- Não usar em superfícies claras (`fv-linen-*`) — vignette é para fundos escuros.

### 5.3 Ambient

Já existe como `.dtc-gallery__ambient`. A única mudança é a paleta (seção 4.2). Quando um produto tem `ambientColors` definidos, a camada usa esses tons em vez do default copper+umber — isto conecta o background à matéria da peça ativa.

---

## 6. Raio e borda

O contrato proíbe `rounded-pill` em tudo. Há uma hierarquia deliberada de raio.

| Token | Valor | Uso |
|---|---|---|
| `radius-none` | 0 | Imagens de produto, divisórias |
| `radius-soft` | 2px | Inputs pequenos, chips |
| `radius-base` | 4px | Botões de UI, tags |
| `radius-organica` | `8px` | Cards de catálogo, badges |
| `radius-card` | `16px` | Cards de gallery, blocos editoriais |
| `radius-galeria` | `1.25rem (20px)` | Card ativo da gallery (mantém `--dtc-gallery-radius`) |
| `radius-pill` | 9999px | **Apenas CTA primário** e avatares |

Regras:
- Imagem de produto: `radius-none`. A foto é retangular; o cantos arredondados nela são clichê de e-commerce.
- Card de gallery: `radius-galeria` (mantém o atual `1.25rem`).
- Card de catálogo fora da gallery: `radius-card` (16px).
- CTA primário: `radius-pill`. CTA secundário: `radius-base` com borda.
- Nunca aplicar `radius-pill` a cards, imagens, ou blocos editoriais — é a violação mais comum.

Bordas hairline:
- Sobre escuro (`fv-umber-700`): `1px solid rgba(237, 227, 208, 0.14)` (linen-200 alpha).
- Sobre claro (`fv-linen-50`): `1px solid rgba(216, 200, 172, 0.5)` (linen-300).
- Nunca borda preta sólida `#000`.

---

## 7. Componentes Fio Vivo — especificação visual

### 7.1 Card de catálogo (não-gallery)

```
┌──────────────────────────────────┐
│  [imagem 01-frente, ratio 1:1]   │  radius-none, overflow hidden
│  • estado (pronta/encomenda)     │  badge fv-copper-500 bg, linen-50 text, label
│                                  │  posição: top-left, sobre a imagem
├──────────────────────────────────┤
│  fv-001                          │  mono, label, fv-umber-300
│  Espiral dourada                 │  display-md, fv-umber-700
│  Fio natural · 28×22×10 cm       │  body-sm, fv-umber-400
│  R$ 480  · ou Pix R$ 456         │  price + price-sm, fv-umber-700 + fv-copper-600
└──────────────────────────────────┘
```

- Fundo: `fv-linen-100`
- Padding: 1.25rem
- Gap interno: 0.5rem
- Hover: elevação `box-shadow: 0 12px 24px rgba(63, 48, 37, 0.12)`, sem scale.
- Estado badge: `fv-copper-500` fundo, `fv-linen-50` texto, `label` tipo, posicionado top-left absoluto sobre imagem.

### 7.2 CTA primário

```css
.fv-cta-primary {
  background: #B8642F;            /* fv-copper-500 */
  color: #FDFBF7;                 /* fv-linen-50 */
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  padding: 0.75rem 2rem;
  border-radius: 9999px;          /* radius-pill — única superfície pill */
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.2s ease,
              box-shadow 0.2s ease;
}
.fv-cta-primary:hover {
  background: #9C4F22;            /* fv-copper-600 */
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(184, 100, 47, 0.3);
}
.fv-cta-primary:active {
  transform: translateY(0);
}
.fv-cta-primary:disabled {
  background: #C9B49C;            /* fv-umber-200 */
  color: #7A6450;                 /* fv-umber-400 */
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
```

Copy: verbo em primeira pessoa — "Levar esta peça", "Encomendar", "Entrar na lista", "Conhecer a peça". Nunca "Comprar agora" (princípio de Humanidade).

### 7.3 CTA secundário

```css
.fv-cta-secondary {
  background: transparent;
  color: #9C4F22;                 /* fv-copper-600 */
  border: 1px solid #C97F4E;      /* fv-copper-400 */
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.625rem 1.75rem;
  border-radius: 4px;              /* radius-base — NÃO pill */
}
```

### 7.4 Badge de estado

```css
.fv-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 4px;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 0.6875rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.fv-status-badge--pronta {
  background: #B8642F;              /* copper-500 */
  color: #FDFBF7;                  /* linen-50 */
}
.fv-status-badge--encomenda {
  background: transparent;
  color: #7A3D1B;                 /* copper-700 */
  border: 1px solid #C97F4E;      /* copper-400 */
}
.fv-status-badge--reservada {
  background: #A68A6E;             /* umber-300 */
  color: #FDFBF7;
}
.fv-status-badge--esgotada {
  background: transparent;
  color: #8C7553;                 /* linen-500 */
  border: 1px solid #D8C8AC;     /* linen-300 */
}
```

### 7.5 Preço

```css
.fv-price {
  font-family: "JetBrains Mono", monospace;
  font-feature-settings: "tnum";
  font-weight: 500;
  color: #2A2018;                  /* umber-700 */
}
.fv-price__pix {
  color: #9C4F22;                 /* copper-600 */
  font-size: 0.875rem;
}
.fv-price__parcelamento {
  color: #8C7553;                 /* linen-500 */
  font-size: 0.8125rem;
  font-weight: 400;
}
```

Estrutura HTML:
```html
<div class="fv-price">
  <span class="fv-price__valor">R$ 480</span>
  <span class="fv-price__pix">ou Pix R$ 456</span>
  <span class="fv-price__parcelamento">ou 6× R$ 80 sem juros</span>
</div>
```

### 7.6 Input / select de variante

```css
.fv-input {
  background: #FDFBF7;            /* linen-50 */
  border: 1px solid #D8C8AC;     /* linen-300 */
  border-radius: 4px;             /* radius-base */
  color: #3F3025;                 /* umber-600 */
  font-family: "Inter", sans-serif;
  padding: 0.625rem 0.875rem;
  transition: border-color 0.2s ease;
}
.fv-input:focus {
  outline: none;
  border-color: #B8642F;         /* copper-500 */
  box-shadow: 0 0 0 3px rgba(184, 100, 47, 0.15);
}
```

---

## 8. Espaçamento e ritmo

Escalas (mantêm alinhamento com Tailwind existente, sobrescrevendo onde fio-vivo pede):

| Token | Valor | Uso |
|---|---|---|
| `space-section` | 6rem (96px) desktop / 4rem mobile | Entre seções da home |
| `space-block` | 3rem (48px) | Entre blocos dentro de seção |
| `space-element` | 1.5rem (24px) | Entre elementos de um bloco |
| `space-tight` | 0.75rem (12px) | Entre label e valor, caption e título |
| `gallery-padding` | 1.5rem (24px) | Padding interno da gallery (mantém atual) |

Coluna editorial (gallery): `width: 300px`, `flex: 0 0 300px`, `padding: 2rem 1.5rem` — mantém o atual.

Largura máxima de conteúdo editorial: `max-width: 65ch` para narrativa longa (princípio de legibilidade); `max-width: 280px` para caption de gallery (mantém o atual).

---

## 9. Breakpoints

Mantém os do `tailwind.config.js`:

| Nome | Min-width | Uso Fio Vivo |
|---|---|---|
| `2xsmall` | 320px | Mobile mínimo |
| `xsmall` | 512px | Mobile grande |
| `small` | 1024px | Tablet / desktop pequeno — gallery vira coluna única |
| `medium` | 1280px | Desktop padrão |
| `large` | 1440px | Desktop amplo |
| `xlarge` | 1680px | Viewport de referência do contrato |
| `2xlarge` | 1920px | Max content |

**Viewport de referência do contrato:** 1600×960. Toda medição do gallery-experience é feita neste viewport.

---

## 10. Motion

| Evento | Duração | Easing | Propriedade |
|---|---|---|---|
| Card ativo hover (imagem) | 600ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `transform: scale(1.05)` (mantém atual) |
| Card → ativo (promoção) | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `transform`, `opacity`, `border-color`, `box-shadow` (mantém atual) |
| Ambient layer (troca de peça) | 1s | `ease-in-out` | `background` (mantém atual) |
| CTA hover | 200ms | `ease` | `transform: translateY(-2px)`, `box-shadow` |
| Badge appear | 300ms | `ease-out` | `opacity`, `transform: translateY(-4px)` |
| Modal/overlay open | 250ms | `cubic-bezier(0.16, 1, 0.3, 1)` | `opacity`, `transform: scale(0.96)` |

**Proibido:** animações lineares em transições de produto (quebra a organicidade do crochê); spinners de loading genéricos sem relação com a marca (preferir skeleton com `fv-linen-200`).

---

## 11. Tailwind config — diff proposto

```js
// apps/storefront/tailwind.config.js — adicionar a theme.extend
theme: {
  extend: {
    colors: {
      // ... grey-* existente mantido ...
      fv: {
        copper: {
          50: "#FBF1EA",
          100: "#F5DEC9",
          200: "#EBC39C",
          300: "#D9A071",
          400: "#C97F4E",
          500: "#B8642F",
          600: "#9C4F22",
          700: "#7A3D1B",
        },
        umber: {
          50: "#F6F1EC",
          100: "#E8DECF",
          200: "#C9B49C",
          300: "#A68A6E",
          400: "#7A6450",
          500: "#5A4636",
          600: "#3F3025",
          700: "#2A2018",
          800: "#1A130E",
          900: "#0F0A07",
        },
        linen: {
          50: "#FDFBF7",
          100: "#F7F1E6",
          200: "#EDE3D0",
          300: "#D8C8AC",
          400: "#B89F7B",
          500: "#8C7553",
        },
        cream: "#F2EAD8",
      },
    },
    fontFamily: {
      sans: ["Inter", "-apple-system", /* ...mantido... */],
      display: ["Fraunces", "Cormorant Garamond", "Georgia", "serif"],
      mono: ["JetBrains Mono", "IBM Plex Mono", "monospace"],
    },
    borderRadius: {
      // ... existente mantido ...
      organica: "8px",
      card: "16px",
      galeria: "1.25rem",
    },
  },
}
```

Uso em JSX: `<h1 className="font-display text-display-lg text-fv-umber-700">`, `<span className="font-mono text-price text-fv-copper-600">R$ 480</span>`.

---

## 12. Acessibilidade — mínimo de marca

- Contraste WCAG AA em todos os pares texto/fundo (verificados na seção 3.3).
- Focus visible: `box-shadow: 0 0 0 3px rgba(184, 100, 47, 0.25)` em qualquer elemento focável — nunca `outline: none` sem substituto.
- Imagens de produto: `alt` descritivo sempre ("Bolsa de crochê Espiral dourada, vista frontal, fio âmbar sobre fundo linen"), não genérico ("product image").
- Navegação por teclado da gallery: setas ← → trocam peça ativa; o foco fica scope dentro da gallery, não global (contrato proíbe `global_keyboard_listener_without_focus_scope`).
- Redução de movimento: `@media (prefers-reduced-motion: reduce)` desabilita `scale` de hover e transições > 200ms.
- Touch target mínimo 44×44px em qualquer controle mobile.

---

## 13. Checklist de aderência ao contrato

Antes de qualquer merge que toque superfície visual de marca:

- [ ] Paleta usa apenas tokens `fv-*` — nenhum hex SaaS azul/violeta.
- [ ] Grain layer presente em fundos `fv-umber-*`.
- [ ] Vignette layer presente no gallery hero.
- [ ] `rounded-pill` só em CTA primário e avatares.
- [ ] Imagens de produto com `radius-none`.
- [ ] Font display só em títulos; font sans em corpo; font mono em números.
- [ ] Layout da gallery mantém 3 zonas assimétricas, ratio active→adjacent ≥ 1.30.
- [ ] Coluna editorial esquerda presente e com largura 300px.
- [ ] Scene thumbnail rail **dentro** do active card (contrato proíbe fora).
- [ ] Navegação inferior centralizada, CTA inferior direita.
- [ ] Header Medusa (menu/account/cart) preservado, não duplicado.
- [ ] Variáveis `--dtc-gallery-*` atualizadas conforme seção 4.2.

---

*Fim de design-system-extension.md*