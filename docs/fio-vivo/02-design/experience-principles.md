# 02.1 — Princípios de Experiência Fio Vivo

**Data:** 2026-08-05
**Estado:** Vigente
**Aplica-se a:** Storefront Next.js, package `@dtc/gallery-experience`, PDP, catálogo, emails transacionais, conteúdo editorial

---

## 1. Premissa fundamental

Fio Vivo não é uma loja de produtos industrializados. É um atelier digital de crochê autoral, peça única ou pequena escala, onde cada bolsa carrega a mão, o tempo e a decisão de uma artesã. A experiência digital precisa **transmitir essa condição antes de qualquer gesto comercial**. O visitante deve sentir, nos primeiros segundos, que entrou em um espaço curado — não em um catálogo de SKUs.

Os princípios abaixo são a camada de intenção. Eles governam **o quê** comunicar e **como deve sentir** o visitante. A materialização visual está em `design-system-extension.md`; a especificação de página está em `product-page-spec.md`; os wireframes estão em `catalog-wireframes.md`. Quando houver conflito entre um princípio e uma decisão tática, o princípio prevalece.

---

## 2. Os dez princípios

Cada princípio tem: **intenção** (o que queremos que o visitante sinta/saiba), **tradução digital** (como isso aparece na UI), **proibido** (o que quebra o princípio) e **métrica de aderência** (como verificar que está funcionando).

### 2.1 — Autoria

**Intenção:** O visitante precisa saber que por trás de cada peça existe uma pessoa nomeada, com história, escolha estética e técnica. Não é uma fábrica, não é uma white-label, não é um drop-shipper.

**Tradução digital:**
- O nome da artesã aparece em contexto de peça (PDP) e em seção editorial dedicada (home).
- Fotografias de gesto (mãos trabalhando, ambiente de atelier) são de primeiro nível, não decorativas secundárias.
- Assinatura textual ("por Fernanda — atelier Fio Vivo") recorrente, discreta, nunca como logo gigante.

**Proibido:**
- Fotos de stock genéricas de "artesã" em qualquer superfície.
- Copy impessoal ("nossa equipe", "nossos artesãos") quando a escala é uma pessoa.
- Esconder a autoria atrás de uma marca-only sem rosto.

**Métrica de aderência:** Em teste de 5 segundos, ≥ 70% dos visitantes citam "feito à mão por uma pessoa" ao descrever o que viram.

---

### 2.2 — Matéria

**Intenção:** O fio é o protagonista material. O visitante deve quase conseguir sentir a textura do crochê pela tela. Matéria é o que diferencia crochê de tecido plano, de couro, de plástico.

**Tradução digital:**
- Imagem de detalhe (04-detalhe) de cada produto é obrigatória em PDP e tem peso visual equivalente à imagem frontal.
- Zoom de textura em hover/scroll na PDP, não só zoom de produto inteiro.
- Backgrounds e camadas ambient extraem cor dos próprios fios, não de uma paleta decorativa arbitrária.
- Nomes de materiais (fio, composição, origem) tratados como informação de primeira classe, não como ficha técnica escondida.

**Proibido:**
- Imagens com fundo branco puro SaaS para peças artesanais.
- Filtros que achatam textura (desaturação agressiva, blur de "produto").
- Textura fake em background (pattern de crochê em SVG) como substituto de fotografia real de matéria.

**Métrica de aderência:** Tempo de hover/interação com imagem de detalhe ≥ 3s em sessões de engajamento.

---

### 2.3 — Textura

**Intenção:** A interface também tem textura — não só as peças. A tela não pode ser uma planificação lisa de SaaS. Há grain, há camadas, há profundidade. Isso alinha o digital ao tátil do crochê.

**Tradução digital:**
- Grain layer obrigatória no gallery-experience (contrato `nos-gallery-first-fold.yaml`, item `grain_layer: true`).
- Vignette layer obrigatória (idem, `vignette_layer: true`).
- Cards e superfícies usam `backdrop-filter` e bordas hairline — nunca planos sólidos sem profundidade.
- Microinterações de transição usam curvas de easing orgânicas (`cubic-bezier(0.16, 1, 0.3, 1)`, já presente no CSS) — não linear/`ease` genérico.

**Proibido:**
- Fundos flat de cor sólida cobrindo o first fold.
- Cantos perfeitamente retos em todos os elementos (quebra a curva do fio).
- Uso de `rounded-pill` (9999px) em todos os botões/cards — proibido pelo contrato; reserve pílula apenas para CTAs primários.

**Métrica de aderência:** Inspeção visual confirma grain+vignette ativos; Playwright baseline sem regressão além de `max_diff_pixel_ratio: 0.05`.

---

### 2.4 — Tempo

**Intenção:** Crochê leva tempo. Uma bolsa não sai de uma esteita em 2 minutos. O visitante precisa entender que o tempo de produção é parte do valor — não um defeito a esconder.

**Tradução digital:**
- Prazo de produção sempre visível na PDP acima da dobra, ao lado do preço.
- Diferença clara entre "peça pronta" (pronta para envio) e "sob encomenda" (produção após pedido) em catálogo e PDP.
- Seção de processo artesanal na home comunica horas/dias por peça, não vagamente.
- Lista de espera e drops tratam o tempo como escassez legítima, não como "fora de estoque".

**Proibido:**
- Esconder prazo até o checkout.
- Tratar sob-encomenda como erro de inventário ("produto indisponível").
- Prometer "pronta entrega" para peças que ainda serão feitas.

**Métrica de aderência:** ≥ 90% das PDPs exibem prazo de produção acima da dobra.

---

### 2.5 — Exclusividade

**Intenção:** Pequena escala = poucas peças, às vezes únicas. O visitante precisa sentir que está vendo algo que não está em todo lugar. Escassez real, não fabricada.

**Tradução digital:**
- Edição numerada ou contagem de unidades quando aplicável ("01 de 03", "última peça").
- Lista VIP e drops recebem tratamento gráfico de convite, não de promoção.
- Peças já reservadas/vendidas permanecem visíveis como registro (não escondidas), com estado claro.

**Proibido:**
- Falsos contadores de urgência ("5 pessoas vendo agora", relógio regressivo genérico).
- Estoque inflado artificialmente para parecer abundante.
- Esconder peças vendidas — quebra a narrativa de continuidade do atelier.

**Métrica de aderência:** Nenhum padrão de dark pattern de escassez em auditoria; peças vendidas visíveis com selo de estado.

---

### 2.6 — Confiança

**Intenção:** Comprar artesanato online de uma marca pequena exige confiança. O visitante precisa de provas concretas — não de slogans de "qualidade".

**Tradução digital:**
- Avaliações verificadas (comprovante de compra) em PDP, não reviews anônimas sem contexto.
- Garantias explícitas: o que cobre, por quanto tempo, como acionar.
- Política de envio, troca e devolução acessível a um clique de qualquer superfície comercial.
- Fotos reais de clientes (UGC curado) quando existirem — não só fotos de estúdio.

**Proibido:**
- Selo genérico de "compra segura" sem conteúdo por trás.
- Reviews sem moderação ou verificação visíveis como "prova".
- Esconder o "quem somos" atrás de um link no rodapé.

**Métrica de aderência:** PDP tem ≥ 1 prova de confiança visível acima da dobra (prazo, garantia, ou avaliação verificada resumida).

---

### 2.7 — Transparência

**Intenção:** Preço, material, processo, prazo, origem — tudo legível, nada oculto. A transparência é a marca de quem não tem nada a esconder.

**Tradução digital:**
- Preço com Pix e parcelamento lado a lado, sem "ver parcelamento no checkout".
- Composição do fio e origem do material como informação de primeira classe.
- Bastidores (processo) visíveis como seção, não como afterthought de rodapé.
- Lista de espera pública com posição aproximada quando aplicável.

**Proibido:**
- "A partir de" sem mostrar o a partir de quê.
- Esconder que peça sob encomenda tem produção pós-pagamento.
- Material descrito só em ficha técnica profunda, nunca em superficie comercial.

**Métrica de aderência:** Toda PDP tem preço, prazo, material e origem acessíveis sem scroll abaixo da dobra.

---

### 2.8 — Humanidade

**Intenção:** O tom é de pessoa para pessoa. Uma artesã falando com quem vai usar a peça. Não é corporativo, não é robótico, não é "experience" de luxury brand fria.

**Tradução digital:**
- Copy em primeira pessoa do singular ou do atelier ("eu faço", "no atelier", "cada ponto"), não "a Fio Vivo oferece".
- Microcopy de estados (carrinho, checkout, email) com voz humana, não templates SaaS.
- Tratamento de erros e estados vazios com generosidade, não com mensagens de sistema hostis.
- Instagram curado mostra a artesã e o cotidiano, não só produto final.

**Proibido:**
- Copy em terceira pessoa impessoal ("os produtos são confeccionados").
- Jargão de luxury fashion ("peça de afirmação", "design atemporal").
- CTAs genéricos ("Comprar agora") sem contexto — preferir "Levar esta peça", "Encomendar", "Entrar na lista".

**Métrica de aderência:** Auditoria de copy: zero ocorrências de linguagem corporativa impessoal em superfícies comerciais.

---

### 2.9 — Qualidade

**Intenção:** Qualidade não é slogan — é demonstrada em detalhes visíveis. A construção, o acabamento, o interior, a capacidade, o peso. O visitante precisa ver a engenharia do crochê.

**Tradução digital:**
- Seção de construção na PDP (pontos, técnica, reforços) com imagem de detalhe.
- Dimensões e capacidade tratadas como especificação real, não como detalhe.
- Interior da bolsa fotografado (quando aplicável), não só exterior.
- Comparações de escala (moeda, mão, referência do corpo) em imagens de gesto.

**Proibido:**
- "Alta qualidade" como claim sem evidência visual.
- Dimensões ausentes ou só em ficha técnica.
- Fotos só de exterior — omitir interior/forro/construção.

**Métrica de aderência:** Toda PDP tem ≥ 1 imagem de construção/detalhe + dimensões + capacidade listadas.

---

### 2.10 — Contemporaneidade

**Intenção:** Crochê não é artesanato folclórico de prateleira de souvenir. É linguagem estética contemporânea. A interface precisa estar no tempo presente, não em nostalgia de "handmade".

**Tradução digital:**
- Layout editorial moderno (3 zonas assimétricas, coluna editorial), não grade de catálogo de artesanato.
- Tipografia com contraste de escala (serifada display + sans-serif corpo), não uma fonte só.
- Direção de arte fotográfica contemporânea (luz natural, fundo de matéria, gesto humano), não fundo de tecido estampado.
- Paleta Copper/Umber/Linen — terrosa, quente, mineral — não paleta pastel "artesanal".

**Proibido:**
- Paleta SaaS azul/violeta (contrato proíbe `generic_saas_blue_palette`).
- Tipografia script/handwritten como "visual de artesanato".
- Layout de grade simétrica de 4 cards iguais (contrato proíbe `equal_width_product_grid`).

**Métrica de aderência:** Inspeção visual confirma ausência de clichês de "handmade pastel"; paleta em conformidade com `design-system-extension.md`.

---

## 3. Matriz de princípio → superfície

| Superfície | Autoria | Matéria | Textura | Tempo | Exclusiv. | Confiança | Transp. | Human. | Qualid. | Contemp. |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Gallery hero (first fold) | ● | ● | ● | ○ | ○ | ○ | ○ | ○ | — | ● |
| Home — coleção destaque | ● | ● | ● | ○ | ● | ○ | ● | ● | — | ● |
| Home — peças prontas | ○ | ● | ● | ● | ● | ○ | ● | ○ | ○ | ○ |
| Home — sob encomenda | ● | ● | ○ | ● | ● | ○ | ● | ● | ○ | ○ |
| Home — processo artesanal | ● | ● | ● | ● | — | ○ | ● | ● | ● | ○ |
| Home — história da artesã | ● | ○ | ○ | ○ | ○ | ● | ● | ● | — | ○ |
| Home — vídeo produção | ● | ● | ● | ● | — | ○ | ● | ● | ● | ○ |
| Home — best-sellers | ○ | ● | ○ | ○ | ○ | ● | ○ | ○ | ● | ○ |
| Home — presentes | ○ | ○ | ○ | ○ | ○ | ● | ● | ● | ○ | ○ |
| Home — personalização | ○ | ● | ○ | ● | ● | ○ | ● | ● | ○ | ○ |
| Home — avaliações verificadas | ○ | ○ | — | ○ | ○ | ● | ● | ● | ○ | ○ |
| Home — conteúdo editorial | ● | ○ | ○ | ○ | ○ | ○ | ● | ● | ○ | ● |
| Home — lista VIP | ○ | — | — | ○ | ● | ○ | ● | ● | — | ● |
| Home — programa indicação | ○ | — | — | — | ○ | ● | ● | ● | — | ○ |
| Home — Instagram curado | ● | ○ | ○ | ○ | ○ | ○ | ● | ● | ○ | ● |
| Home — garantias | ○ | — | — | ○ | ○ | ● | ● | ● | ● | ○ |
| Home — FAQ | ○ | ○ | — | ● | ○ | ● | ● | ● | ○ | ○ |
| Home — captura preferências | ○ | — | — | — | ○ | ○ | ● | ● | — | ○ |
| Home — CTA descoberta | ○ | ○ | ○ | ○ | ● | ○ | ○ | ● | — | ● |
| PDP — acima da dobra | ○ | ● | ● | ● | ● | ● | ● | ● | ○ | ● |
| PDP — abaixo da dobra | ● | ● | ● | ● | ● | ● | ● | ● | ● | ○ |

Legenda: ● aplicação direta e obrigatória · ○ aplicação indireta/desejada · — não se aplica

---

## 4. Princípios versus o código atual — dívida identificada

O CSS de `gallery-experience.css` **não está alinhado** com a paleta Copper/Umber/Linen do contrato. As variáveis atuais:

```css
--dtc-gallery-bg-primary: #090a0f;     /* azul-preto SaaS */
--dtc-gallery-accent: #38bdf8;         /* sky-400 Tailwind — SaaS azul */
--dtc-gallery-accent-glow: rgba(56, 189, 248, 0.25);
/* ambient layer ainda injeta rgba(168, 85, 247, ...) — violeta SaaS */
```

Isso viola o princípio de **Contemporaneidade** (proibição de paleta SaaS azul) e o item `copper_umber_linen_palette: true` do contrato. A correção está especificada em `design-system-extension.md`, seção 4 (tokens de cor) — substituir as variáveis `--dtc-gallery-*` pelos tokens Fio Vivo antes de qualquer novo desenvolvimento visual.

Esta dívida é um **bloqueador de aprovação visual** (`gate.human_visual_approval_required: true`). Sem a correção da paleta, o gate visual não passa.

---

## 5. Princípios não-negociáveis em primeira dobra

O first fold (gallery hero) é a peça de maior densidade de princípios. Estes são **não-negociáveis** nesta superficie:

1. **Matéria** — imagem frontal real do produto dominante, não ilustração.
2. **Textura** — grain layer + vignette layer + backdrop-filter ativos.
3. **Contemporaneidade** — layout 3 zonas assimétricas, paleta Copper/Umber/Linen, coluna editorial esquerda.
4. **Autoria** — coluna editorial cita o atelier, não só o nome da coleção.
5. **Tempo** — estado de disponibilidade (pronta/encomenda) legível no caption do card ativo.

Qualquer proposta que remova um destes cinco precisa ser uma decisão de produto documentada, não uma regressão silenciosa.

---

## 6. Como usar este documento

- **Design:** toda decisão visual deve poder ser rastreada a um princípio. Se uma proposta não se conecta a nenhum dos dez, ela pertence a outro produto.
- **Engenharia:** ao revisar um PR, se a mudança viola um princípio, o PR não merge. O contrato visual `.agents/contracts/nos-gallery-first-fold.yaml` é o enforcement mecânico; este documento é o enforcement de intenção.
- **Conteúdo:** todo copy passa pela lente de **Humanidade** e **Transparência** antes de publicar.
- **QA:** a métrica de aderência de cada princípio é o critério de aceitação visual, não "está bonito".

---

*Fim de experience-principles.md*