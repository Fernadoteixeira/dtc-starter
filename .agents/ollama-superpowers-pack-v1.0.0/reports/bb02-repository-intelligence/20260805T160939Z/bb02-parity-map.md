# BB02 — Repository Intelligence — Parity Map

## Verdict: BB02_LOCAL_PREFLIGHT=GREEN

## Source: nos-gallery (Fio Vivo isolado)
- Path: `apps/storefront/src/modules/nos-gallery`
- Framework: Next.js 15 + Tailwind v4 + Framer Motion + shadcn/ui
- Fonts: Geist, Geist Mono, Playfair Display
- Palette: terrosa (#1b1814, #c88f68, #ede3d2)
- Components: 8 (slider, card, dialog, ambient, progress, state, inquiry, dots)
- Hooks: 10 (dwell, color extraction, progress, drag, navigation, wheel, etc)
- Data: 6 artworks completas (artist, story, dimensions, availability)

## Destination: dtc-starter storefront
- Path: `apps/storefront`
- Framework: Next.js 15 + Tailwind v3 + Medusa commerce
- Fonts: Inter apenas
- Palette: azul-marinho (#090a0f, #38bdf8)
- Components: 2 (gallery-experience estático, gallery-hero-client)
- Data: 6 produtos fixture básicos (title, image, scenes apenas)

## Parity Map (15 layers)

| # | Layer | Source | Destination | Action | Priority |
|---|---|---|---|---|---|
| 1 | Header | Escuro editorial | Branco Medusa | substituir | P0 |
| 2 | Composição | Palco full viewport | Grid e-commerce | substituir | P0 |
| 3 | Conteúdo | Bolsas + artista + narrativa | Produtos demo | substituir | P0 |
| 4 | Card ativo | Parallax 3D editorial | Card sem parallax | adaptar | P1 |
| 5 | Card adjacente | Continuação revelada | Produto em sequência | adaptar | P1 |
| 6 | Tipografia | Playfair + Geist + Mono | Inter | adicionar | P1 |
| 7 | Fundo | Terroso + color extraction | Azul-marinho | substituir | P1 |
| 8 | Controles | Miniaturas + progresso | Dots simples | substituir | P1 |
| 9 | Modal detalhe | Ficha curatorial dividida | N/A | criar | P0 |
| 10 | Dados | 6 obras completas | 6 produtos básicos | enriquecer | P0 |
| 11 | Movimento | Framer Motion + transições | CSS transition | adicionar | P1 |
| 12 | Responsividade | Composta por viewport | Breakpoint 768px | adaptar | P1 |
| 13 | Inquiry | Modal de consulta | N/A | criar | P2 |
| 14 | Progresso | Achievements + dwell | N/A | criar | P2 |
| 15 | Color extraction | Hook dinâmico | N/A | criar | P2 |

## Paridade Atual Estimada

| Dimensão | Score |
|---|---|
| Infraestrutura da galeria | 55% |
| Mecânica de navegação | 45% |
| Identidade Fio Vivo | 15% |
| Composição editorial | 20% |
| Conteúdo real | 10% |
| **Paridade total** | **25-30%** |

## BB03 Implementation Waves (10)

1. Design Foundation — tokens, fontes, paleta terrosa
2. Fio Vivo Shell e Header — header escuro editorial
3. Editorial Stage — palco assimétrico full viewport
4. Product/Artwork Data Adapter — enriquecer fixture
5. Navigation and Scene States — drag, wheel, keyboard, discovery
6. Artwork Detail Modal — ficha curatorial dividida
7. Motion and Transitions — Framer Motion, parallax 3D
8. Responsive Composition — mobile, tablet, desktop
9. Medusa Commerce Bridge — catálogo, preços, checkout
10. Cleanup and Isolation — remover demo, isolar nos-gallery

## Forecast

| Marco | Paridade esperada |
|---|---|
| Atual | 25-30% |
| BB02 GREEN | 30% |
| BB03 Wave 4 | 55-65% |
| BB03 completo | 80-90% |
| BB04 GREEN | 90-95% |
| BB05 GREEN | 95%+ |
| BB08 GREEN | 95%+ certificado |
