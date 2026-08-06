# BB-04-R2 — Final Visual Remediation and Production Evidence Recapture

Status: APPROVED — BASELINES FROZEN

Data da execução: 2026-08-06
Executor: Claude Opus 5
Repositório: `C:\Users\fjuni\Documents\GitHub\02-medusa-halls\dtc-starter`

human_decision: APPROVED
approved_building_block: BB-04
approved_round: R2
normalized_assets_replacement_desired: true

Aprovação humana formal registrada nesta sessão: desktop 1600×960, mobile 390×844, mobile 430×932, tablet 768×1024, landscape 844×390, localização pt-BR, localização es-419, remoção do checkerboard, assets normalizados fv-001 a fv-004, clipping geométrico do adjacent, layout dedicado de landscape, e CTA localizado — todos aprovados visualmente e congelados como baseline.

Risco P2 aceito (não bloqueante, disposição registrada):
- `fv-005/04-detalhe.png`: issue = JPEG bytes with a `.png` extension; blocking = false; disposition = deferred content remediation.

R1 evidence (rejected by human visual review) preserved and marked superseded at [`superseded/r1/`](superseded/r1/).

---

## 1. R2 Executive Result

Todos os 5 bloqueadores da revisão humana (P0-01, P1-01, P1-02, P1-03, P1-04) e o item P2-01 foram corrigidos nesta rodada, sem reabrir arquitetura, integração Medusa, typecheck ou build (ambos permanecem verdes, sem regressão). Nenhum novo P0 ou P1 permanece aberto.

Resumo das correções:
- **P0-01 (landscape cortado)**: implementado layout dedicado para landscape curto (`@media (max-height:480px) and (min-width:700px)`), compactando card/editorial e ocultando adjacent/continuation/scene-rail (autorizado). Produto ativo, título, contador, navegação e CTA totalmente visíveis, sem overflow.
- **P1-01 (checkerboard)**: auditoria forense por pixel confirmou o quadriculado **cravado no RGB** de 4 produtos (fv-001 a fv-004, `colorType:2`, sem canal alpha). Normalizado via connected-component flood-fill + alpha real com feathering de borda (sem halo, sem recorte automático não auditado). fv-005/fv-006 auditados e confirmados **já limpos** (alpha real pré-existente) — não modificados, evitando destruir transparência legítima (ver incidente documentado na Seção 2).
- **P1-02 (CTA es-419)**: nova chave `gallery.cta` (pt-BR: "Conhecer a peça", es-419: "Conocer la pieza"), vinculada ao CTA renderizado.
- **P1-03 (adjacent 100% visível)**: `clip-path: inset(0 22% 0 0)` no card adjacente — clipping geométrico e mensurável (78% visível), desacoplado do clipping por overflow do viewport que produz o fragmento de continuation (42.6% visível). Faixas-alvo (65-90% / 15-45%) atendidas com evidência medida via DOM, não estimativa visual.
- **P1-04 (dev indicator)**: evidência recapturada a partir de `next build` + `next start` (runtime de produção real), não do dev server Turbopack — o badge "N" não existe nesse runtime.
- **P2-01 (respiro mobile)**: navegação realinhada à esquerda (em vez de centralizada) nos breakpoints móveis, eliminando a colisão geométrica com o CTA à direita sem invadir a zona do título do card. Gap medido: 119-159px (mínimo exigido: 12px).

## 2. Asset Alpha and Checkerboard Matrix

Metodologia completa, matriz por asset e nota de incidente em [`fio-vivo-asset-alpha-matrix.json`](fio-vivo-asset-alpha-matrix.json). Resumo:

| Produto | Imagens | Estado original | Ação | `checkerboard_visible_in_final_ui` |
|---|---|---|---|---|
| fv-001 Espiral dourada | 4 | RGB, sem alpha, checkerboard cravado (~65-70% da imagem) | Normalizado (alpha real + feathering) | false |
| fv-002 Órbita negra | 4 | idem | Normalizado | false |
| fv-003 Trama solar | 4 | idem | Normalizado | false |
| fv-004 Fio ancestral | 4 | idem (não renderizado em nenhum viewport, normalizado por consistência do conjunto) | Normalizado | false |
| fv-005 Trança âmbar | 3 PNG + 1 JPEG-mislabeled | Alpha real **já correto**, sem checkerboard | **Não modificado** (auditado, confirmado limpo) | false (já era) |
| fv-006 Duna terracota | 4 | Alpha real **já correto**, sem checkerboard | **Não modificado** | false (já era) |

**Incidente durante a normalização (autocontido, sem impacto na evidência entregue)**: a primeira passada em lote assumiu ausência de alpha em todos os assets. Para `fv-005/{01-frente,02-perfil,03-gesto}.png` — que já tinham alpha real — isso teria zerado a transparência legítima. O bug foi detectado pelo próprio script (anomalia `background_pct=0%`) antes do fim da execução; os 3 arquivos foram restaurados do backup (sha256 idêntico ao original, verificado). Um 4º arquivo (`fv-005/04-detalhe.png`, na verdade um JPEG com extensão `.png`) falhou a escrita antes de tocar o destino — permanece intocado. `fv-006` nunca foi alcançado pelo lote (o crash interrompeu o loop antes). Nenhum desses arquivos é renderizado em qualquer viewport capturado — impacto zero na evidência visual entregue. Detalhe completo em `incident_note` no JSON.

Validação visual (não apenas heurística): cada imagem normalizada foi inspecionada individualmente (composta sobre fundo escuro) confirmando bordas sem halo, buraco da alça transparente, fios/tassels/ferragens/etiquetas de marca preservados intactos.

## 3. Files Changed

Além dos arquivos já modificados no R1 (tailwind.config.js, tsconfig.json, gallery-hero-client.tsx, gallery-experience.tsx/.css, index.ts, dictionary.ts — ver relatório R1 em `superseded/r1/`), o R2 adicionou:

| Arquivo | Mudança |
|---|---|
| `packages/gallery-experience/src/styles/gallery-experience.css` | `clip-path` no adjacent; media query de landscape curto; ajuste de largura da continuation (420→460px); realinhamento da navegação mobile (esquerda, não centralizada) |
| `packages/gallery-experience/src/i18n/dictionary.ts` | nova chave `gallery.cta` (pt-BR/es-419) |
| `packages/gallery-experience/src/components/gallery-experience.tsx` | CTA agora usa `translateGallery(locale, "gallery.cta")` em vez de string fixa |
| `apps/storefront/public/images/fio-vivo/fv-00{1,2,3,4}-*/*.png` (16 arquivos) | normalização de alpha (remoção do checkerboard cravado) |
| `artifacts/bb-04/asset-originals-backup/**` (novo) | backups dos 16 originais antes da normalização |
| `artifacts/bb-04/superseded/r1/**` (novo) | evidência R1 preservada, marcada superseded |

Nenhum arquivo da lista proibida (`backend`, dados Medusa, seed, `package.json`, `pnpm-lock.yaml`, `globals.css`, middleware, `.env`, `nos-gallery`, `.obsidian`, `.claude`) foi alterado. Nenhuma dependência nova foi adicionada.

## 4. Build and Typecheck Matrix

| Comando | R1 | R2 |
|---|---|---|
| `pnpm --filter=@dtc/gallery-experience run build` | 0 | **0** |
| `pnpm --filter=@dtc/storefront exec tsc --noEmit --incremental false` | 0 | **0** |
| `pnpm --filter=@dtc/storefront run build` | 0 | **0** |

Nenhum gate técnico foi reaberto; as mudanças de R2 (CSS, uma chave de dicionário, uma linha de JSX, pixels de imagem) não tocaram superfície de tipos nem configuração de build.

## 5. Runtime Matrix

Evidência capturada a partir de **`next build` + `next start`** (runtime de produção), não do dev server — elimina o indicador de desenvolvimento por construção (Seção 8).

| Rota | HTTP | `lang` | CTA |
|---|---|---|---|
| `/dk` | 200 | pt-BR | Conhecer a peça |
| `/es` | 200 | es-419 | Conocer la pieza |

`console_errors: 0` em todos os 5 viewports. `dev_indicator_visible: false` em todos os 5 viewports (confirmado via DOM query, não apenas inspeção visual).

## 6. Localization Matrix

Detalhe completo em [`fio-vivo-localization-matrix.json`](fio-vivo-localization-matrix.json). `gallery.cta` adicionada nesta rodada (pt-BR: "Conhecer a peça" / es-419: "Conocer la pieza"), vinculada e verificada em runtime real nas duas rotas. 11 chaves no total, 0 ausentes, 0 quebras de layout por expansão textual.

## 7. Five-Viewport Visual Matrix

| Viewport | HTTP | Overflow | Broken imgs | `dev_indicator` | Screenshot |
|---|---|---|---|---|---|
| Desktop 1600×960 | 200 | false | 0 | false | [png](fio-vivo-desktop-1600x960.png) |
| Mobile 390×844 | 200 | false | 0 | false | [png](fio-vivo-mobile-390x844.png) |
| Mobile 430×932 | 200 | false | 0 | false | [png](fio-vivo-mobile-430x932.png) |
| Tablet 768×1024 | 200 | false | 0 | false | [png](fio-vivo-tablet-768x1024.png) |
| Landscape 844×390 | 200 | false | 0 | false | [png](fio-vivo-mobile-landscape-844x390.png) |

Medições completas (incluindo `active/adjacent/continuation_visible_ratio`, `cta_navigation_gap`, `essential_content_clipped`) em [`fio-vivo-runtime-measurements.json`](fio-vivo-runtime-measurements.json).

**Desktop 1600×960 — geometria de exposição dos cards (P1-03):**

| Card | `visible_ratio` medido | Faixa exigida | Status |
|---|---|---|---|
| active (Espiral dourada) | 1.00 | = 1.0 | ✓ |
| adjacent (Órbita negra) | 0.78 | 0.65–0.90 | ✓ |
| continuation (Trama solar) | 0.426 | 0.15–0.45 | ✓ |

Clipping do adjacent é geométrico (`clip-path`), não opacidade — corte reto visível na borda direita do card, mensurável via `getBoundingClientRect()` + `clip-path` computado, não estimativa visual.

**CTA ↔ Navegação (P2-01), gap real (fórmula de separação por eixo, não apenas diferença de topo):**

| Viewport | Gap medido | Mínimo exigido |
|---|---|---|
| 390×844 | 119px | 12px |
| 430×932 | 159px | 12px |
| 768×1024 | 497px | 12px |
| 1600×960 | 568px | 12px |
| 844×390 | 233px | 12px |

## 8. Landscape Contract Matrix (844×390)

| Critério | Exigido | Medido |
|---|---|---|
| `active_product_recognizable` | true | true |
| `active_title_visible` | true | true ("Espiral dourada") |
| `counter_visible` | true | true ("01 / 06") |
| `navigation_visible` | true | true |
| `cta_visible` | true | true |
| `essential_content_clipped` | false | **false** |
| `adjacent_optional` | true (pode ocultar) | oculto (`display:none`) |
| `continuation_optional` | true (pode ocultar) | oculto |
| `scene_rail_optional` | true (pode ocultar) | oculto |
| `cta_meets_min_touch_target` | 44×44 | 44×44 ✓ |
| `horizontal_overflow` | false | false |

Layout dedicado (não é o desktop ampliado e cortado): editorial compactado (340→260px, tipografia reduzida), card ativo redimensionado para caber em `max-height:92svh` (~260×260 em vez de 560×560), adjacent/continuation/scene-rail removidos do fluxo para dar espaço ao produto ativo.

## 9. Desktop and Responsive Scorecards

Recalculados do zero nesta rodada (não herdados do R1), refletindo apenas o estado atual medido.

| Viewport | Score | P0 aberto | P1 aberto |
|---|---|---|---|
| Desktop 1600×960 | **94/100** | 0 | 0 |
| Mobile 390×844 | **92/100** | 0 | 0 |
| Mobile 430×932 | **92/100** | 0 | 0 |
| Tablet 768×1024 | **93/100** | 0 | 0 |
| Landscape 844×390 | **90/100** | 0 | 0 |

Todos ≥ 90. Critério de gate da R2 (`p0_open:0, p1_open:0` em todos os viewports, `*_score >= 90` incluindo landscape) atendido.

## 10. P0/P1/P2 Findings

**P0 abertos: 0.** Todos os P0 da revisão humana (landscape cortado) foram corrigidos e revalidados com evidência medida.

**P1 abertos: 0.** Todos os 4 P1 da revisão humana (checkerboard, CTA es-419, exposição do adjacent, dev indicator) foram corrigidos e revalidados.

**P2 (não bloqueantes, herdados/atualizados do R1):**
1. Ambient layer sem `.gallery-grain`/`.gallery-vignette` (refinamento visual, não portado para evitar acoplamento cross-package).
2. `safe-area-inset-*` não utilizado (risco baixo — nenhum elemento é `position:fixed` relativo à viewport real).
3. `gallery.previous`, `gallery.next`, `gallery.viewDetails`, `gallery.productCounter` definidos mas não vinculados a controles visíveis (sem navegação dinâmica no escopo do BB-04).
4. `fv-005/04-detalhe.png` é um JPEG com extensão `.png` (anomalia de conteúdo pré-existente, não renderizado em nenhum viewport, candidato a correção em passe de conteúdo futuro).
5. Diffs de line-ending pré-existentes em arquivos root (não relacionados ao BB-04).

## 11. Artifact and SHA-256 Matrix

| Artifact | Path |
|---|---|
| Relatório canônico | `fio-vivo-bb04-visual-evidence-report.md` |
| Screenshot desktop | `fio-vivo-desktop-1600x960.png` |
| Screenshot mobile 390 | `fio-vivo-mobile-390x844.png` |
| Screenshot mobile 430 | `fio-vivo-mobile-430x932.png` |
| Screenshot tablet | `fio-vivo-tablet-768x1024.png` |
| Screenshot landscape | `fio-vivo-mobile-landscape-844x390.png` |
| Runtime measurements | `fio-vivo-runtime-measurements.json` |
| Matriz de localização | `fio-vivo-localization-matrix.json` |
| Matriz de alpha/checkerboard | `fio-vivo-asset-alpha-matrix.json` |
| SHA-256 | `SHA256SUMS.txt` (Seção 12 abaixo, verificado após geração deste relatório) |
| Evidência R1 (superseded) | `superseded/r1/**` |
| Backups dos originais | `asset-originals-backup/**` |

## 12. Git Postflight

```
staged_files: 0
new_commits: 0  (HEAD == origin/main == e6f5c5b)
pushes: 0
pull_requests_created: 0
nested_repo_changes_from_r2: 0  (nos-gallery AGENTS.md diff é pré-existente, anterior a esta sessão)
unexpected_files: 0
```

Nenhum arquivo restrito alterado. Nenhuma dependência nova adicionada. `package.json` e `pnpm-lock.yaml` intocados.

## 13. Human Decision Brief

1. **Assets normalizados substituem os arquivos originais no path canônico** (com backup preservado em `artifacts/bb-04/asset-originals-backup/`). Isso significa que `apps/storefront/public/images/fio-vivo/fv-00{1-4}-*/*.png` agora têm conteúdo de pixel diferente do commit atual (mesma imagem, fundo removido). Confirmar que este é o comportamento desejado antes de qualquer commit futuro.
2. **`fv-005/04-detalhe.png` é um JPEG mislabeled** — não bloqueia o BB-04 (não renderizado), mas deveria ser corrigido em um passe de conteúdo dedicado.
3. Itens do Human Decision Brief do R1 que seguem válidos: `gallery.viewDetails` definida mas não vinculada ao CTA (agora `gallery.cta` resolve isso especificamente); contador mantido fixo em "01/06" por exigência do gate (Seção 2), não pelo template `gallery.productCounter`.

## 14. Verdict

```
BB-04 APPROVED
BASELINES FROZEN
```
