# Visão do Produto — Fio Vivo

> Documento de visão de produto. Define o norte estratégico, a ambição de longo prazo e os princípios inegociáveis que orientam todas as decisões de produto da marca Fio Vivo.

| Campo | Valor |
|---|---|
| **Marca** | Fio Vivo |
| **Categoria** | Bolsas e peças artesanais em crochê |
| **Estágio** | Pré-lançamento (fixture com 6 produtos; metadados comerciais pendentes) |
| **Plataforma** | Medusa v2 (backend) + Next.js 15 (storefront) — monorepo DTC |
| **Moeda-alvo** | BRL (a configurar) |
| **Mercado-alvo** | Brasil (região e moeda inexistentes no backend atual) |
| **Data** | 05 ago 2026 |
| **Versão** | 1.0 |
| **Status** | Rascunho estratégico |

---

## 1. Resumo Executivo

Fio Vivo é uma marca de bolsas e peças artesanais em crochê que parte de uma premissa simples: cada fio carrega a intenção de quem o fez. A visão de produto é construir uma casa digital que respeite o tempo do artesanato, comunique a autoria de cada peça e venda com transparência radical — sem escassez fabricada, sem dark patterns, sem desrespeito ao custo de produção.

O produto digital (loja, PDP, fluxo de compra) deve ser tão cuidadoso quanto o produto físico (a peça crochê). A tecnologia existe para revelar a história, não para manipular a decisão.

---

## 2. Declaração de Visão

> **Toda peça tem um fio. Todo fio tem uma mão. Toda mão tem uma história. A tecnologia serve para revelar essa história — nunca para ocultar o preço, acelerar a compra ou fabricar urgência.**

### 2.1 Pilares da Visão

| Pilar | Descrição |
|---|---|
| **Autoria visível** | Cada peça carrega o nome de quem a fez, o tempo que levou, o material usado. A autoria não é um selo opcional — é estrutural. |
| **Transparência de custo** | O cliente sabe o que paga: material, tempo, margem. Sem markup misterioso, sem "preço promocional" que nunca foi real. |
| **Tempo respeitado** | A produção artesanal tem ritmo. O produto digital comunica esse ritmo com honestidade — lista de espera quando necessário, prazos reais, nunca "estoque limitado" inventado. |
| **Beleza funcional** | A interface é parte da experiência estética da marca. A galeria não é apenas funcional — é a vitrine. |

---

## 3. Princípios Inegociáveis

Estes princípios são guardiões de identidade. Nenhuma decisão de produto, feature ou experimento pode violá-los.

| # | Princípio | O que significa na prática |
|---|---|---|
| 1 | **Não usar escassez falsa** | Nunca exibir "restam X unidades" se a limitação for inventada. A escassez real (capacidade de produção) é comunicada como tal — não camuflada. |
| 2 | **Não vender abaixo do custo** | O preço mínimo de qualquer peça é o custo de material + tempo + margem mínima saudável. Promoções não cruzam essa linha. |
| 3 | **Não usar dark patterns** | Sem countdown timers falsos, sem "compraram agora" fabricado, sem upsell agressivo no checkout, sem opt-in pré-selecionado, sem confirm-shaming. |
| 4 | **Autoria é estrutural** | O artista aparece na PDP, no checkout, no pós-venda. Não é um bônus narrativo — é um campo obrigatório do produto. |
| 5 | **Tempo é real** | Prazos de produção e entrega são comunicados com honestidade. Se uma peça leva 10 dias, diz-se 10 dias — não "envio em 24h". |

---

## 4. Estado Atual (Snapshot de Descoberta)

### 4.1 Catálogo (Fixture)

| ID | Nome | Imagens | Metadados comerciais |
|---|---|---|---|
| fv-001 | Espiral Dourada | 4 PNG (frente, perfil, gesto, detalhe) | Todos "a informar" |
| fv-002 | Órbita Negra | 4 PNG | Todos "a informar" |
| fv-003 | Trama Solar | 4 PNG | Todos "a informar" |
| fv-004 | Fio Ancestral | 4 PNG | Todos "a informar" |
| fv-005 | Trança Âmbar | 4 PNG | Todos "a informar" |
| fv-006 | Duna Terracota | 4 PNG | Todos "a informar" |

**Total:** 6 produtos, 24 imagens PNG (4 cenas por produto: frente, perfil, gesto, detalhe).

### 4.2 Lacunas Críticas

| Área | Estado | Ação necessária |
|---|---|---|
| **Preço** | "a informar" em todos os produtos | Definir pricing; configurar BRL |
| **Descrição** | "a informar" em todos | Escrever copy de cada peça |
| **Artista** | "a informar" em todos | Atribuir autoria |
| **Material** | "a informar" em todos | Especificar composição |
| **Categoria** | "a informar" em todos | Criar taxonomia |
| **Disponibilidade** | "a informar" em todos | Definir modelo (estoque × lista de espera) |
| **Região/Moeda** | Sem região BR, sem BRL no backend | Criar região BR com BRL |
| **Pagamentos** | Stripe, PayPal, iDeal, Bancontact — sem Pix | Integrar Pix |
| **Pricing engine** | Inexistente | Avaliar necessidade |
| **Personalização** | Inexistente | Priorizar no roadmap |
| **Lista de espera** | Inexistente | Priorizar no roadmap |
| **Drops** | Inexistentes | Priorizar no roadmap |
| **Reviews** | Inexistentes | Avaliar timing |
| **Afiliados** | Inexistentes | Avaliar timing |

### 4.3 Storefront Atual

- Gallery-hero funcional com fixtures hardcoded (override BB-03).
- PDP, checkout, cart, account modules existem mas não têm dados Fio Vivo.
- Backend seed é genérico europeu (EUR/USD; países gb/de/dk/se/fr/es/it).

---

## 5. Visão de Longo Prazo (3 horizontes)

### Horizonte 1 — Fundação (0-3 meses)

Transformar a fixture em catálogo vivo: preços definidos, descrições escritas, artista atribuído, BRL configurado, Pix integrado, região BR criada. A loja abre com 6 peças vendáveis de verdade.

**Entregas de produto digital:**
- PDP com galeria de 4 cenas (frente, perfil, gesto, detalhe)
- Checkout com Pix + cartão
- Região BR com BRL e frete real
- Página de artista (1 página por artista, linkada na PDP)

### Horizonte 2 — Expansão (3-12 meses)

Lista de espera para peças esgotadas, drops programados, personalização (cor, tamanho, detalhe), reviews de clientes, programa de afiliados para criadores. Catálogo cresce para 12-15 peças.

**Entregas de produto digital:**
- Módulo de lista de espera (waitlist) — escassez real, comunicada honestamente
- Módulo de drops (lote com data, não "restam 2 unidades")
- Configurador de personalização na PDP
- Reviews com foto do cliente
- Programa de afiliados com rastreio

### Horizonte 3 — Casa Digital (12-24 meses)

Atelier digital: cada peça tem sua página de processo (fotos do making-of, tempo de produção, fios usados), clientes retornam para ver "sua" peça ao longo do tempo, encomenda direta com o artista via plataforma.

**Entregas de produto digital:**
- Página de processo por peça (making-of)
- Área do cliente com "suas peças" (histórico + cuidado + reparo)
- Encomenda direta artista-cliente (com curadoria da marca)
- Internacionalização (cliente internacional persona ativa)

---

## 6. Diferenciação Competitiva

Fio Vivo não compete em preço nem em velocidade. Compete em **transparência, autoria e tempo respeitado**.

| Dimensão | Mercado fast-fashion | Marca DTC típica | Fio Vivo |
|---|---|---|---|
| Preço | Mais baixo possível | "Acessível premium" | Custo + margem saudável, comunicado |
| Escassez | Fabricada ("restam 2") | Limitada real | Real, comunicada como produção |
| Autoria | Invisível | "Nossa designer" | Artista nominal, linkado |
| Tempo | "Entrega em 24h" | "Envio rápido" | "Produção leva X dias" |
| Personalização | Não oferece | Limitada | Estrutural (cor, dimensão, detalhe) |
| Pós-venda | Nenhum | Troca padrão | Cuidado + reparo + "suas peças" |

---

## 7. Indicadores de Sucesso da Visão

A visão se realiza quando estes indicadores são verdadeiros — não quando features são lançadas.

| Indicador | Meta de visão |
|---|---|
| **Cliente sabe o nome do artista** | > 80% dos pós-compra mencionam o artista em review ou depoimento |
| **Recompra** | > 25% dos clientes compram segunda peça em 12 meses |
| **Lista de espera preenchida** | Peças esgotadas geram waitlist orgânica sem prompt |
| **Zero dark patterns** | Auditoria trimestral confirma ausência de dark patterns |
| **Preço acima do custo** | 100% das transações respeitam o piso de custo |
| **NPS** | > 60 |

---

## 8. Riscos e Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Capacidade de produção desconhecida | Não saber se a demanda pode ser atendida | Mapear capacidade mensal antes de abrir vendas |
| Preços não validados | Margem insuficiente ou preço repulsivo | Testar hipóteses de preço com pesquisa e cohort inicial |
| Sem Pix | Abandono de checkout no BR | Integrar Pix antes do lançamento |
| Fixtures hardcoded no storefront | Manutenção frágil, divergência com backend | Migrar para dados do backend após configuração |
| Sem taxonomia | Busca e filtros não funcionam | Definir categorias antes do lançamento |

---

## 9. Glossário

| Termo | Definição |
|---|---|
| **Fixture** | Dados de exemplo hardcoded no storefront para simular produtos |
| **PDP** | Product Detail Page — página de detalhe do produto |
| **Drop** | Lote de peças lançado em data específica, com produção limitada real |
| **Lista de espera** | Waitlist para peças esgotadas, sem escassez fabricada |
| **Dark pattern** | Prática de UI que manipula o usuário contra seu interesse |
| **BB-03** | Override de fixture no gallery-hero do storefront atual |

---

*Documento vivo. Revisar a cada ciclo de planejamento de produto.*