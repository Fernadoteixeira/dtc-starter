# Estratégia de Produto — Fio Vivo

> Documento de estratégia. Traduz a visão em escolhas concretas: onde competir, como ganhar, em que ordem construir e que métricas confirmam o caminho.

| Campo | Valor |
|---|---|
| **Marca** | Fio Vivo |
| **Documento pai** | product-vision.md |
| **Data** | 05 ago 2026 |
| **Versão** | 1.0 |
| **Status** | Rascunho estratégico |

---

## 1. Resumo Estratégico

Fio Vivo entra no mercado de moda artesanal brasileira com uma proposta incomum: vender crochê autoral com transparência radical de preço e produção. A estratégia não é competir com fast-fashion nem com marcas de luxo — é ocupar um espaço próprio onde **autoria, tempo e honestidade** são o produto, não a bolsa.

A estratégia se desdobra em três movimentos: **fundar** (catálogo vivo + infra BR), **expandir** (lista de espera + personalização + drops) e **profundar** (atelier digital + pós-venda relacional).

---

## 2. Onde Competir

### 2.1 Mercado

| Dimensão | Definição |
|---|---|
| **Categoria** | Bolsas e peças artesanais em crochê |
| **Geografia** | Brasil (lançamento); internacional (fase 2) |
| **Cliente primário** | Mulher 30-55, renda classe A/B, que valoriza autoria e feitura |
| **Canal** | DTC próprio (loja Fio Vivo em Medusa + Next.js) |
| **Faixa de preço** | R$ 250 a R$ 1.490 (hipótese não validada) |

### 2.2 Cenário Competitivo

| Categoria | Jogadores | Posicionamento | Fio Vivo diferencia por |
|---|---|---|---|
| Fast-fashion acessório | Renner, C&A, Zara | Volume, preço baixo, sem autoria | Não compete |
| Marcas DTC de bolsa nacional | Dagny, Santa Lolla, Cravo & Canela | Design próprio, produção escalada | Autoria nominal + crochê artesanal |
| Artesanato em marketplace | Elo7, OLX artesãos | Amplitude, baixa curadoria | Curadoria de marca + experiência digital |
| Marcas de crochê independentes | Ateliers no Instagram | Venda por DM, sem estrutura digital | Infra DTC profissional + transparência |
| Importadas premium | Bottega Veneta (crochê), Loewe | Luxo, preço elevado, sem narrativa BR | Narrativa brasileira + preço acessível relativo |

---

## 3. Como Ganhar

### 3.1 Proposta de Valor

> **Crochê autoral, preço honesto, tempo respeitado.**

A proposta não é "bolsa bonita" — é "bolsa com história, vendida com respeito".

### 3.2 Alavancas Estratégicas

| Alavanca | Descrição | Efeito |
|---|---|---|
| **Transparência de preço** | Comunicar o que compõe o preço (material, tempo, margem) | Confiança, diferenciação vs. markup opaco |
| **Autoria nominal** | Artista na PDP, na embalagem, no pós-venda | Conexão emocional, justificativa de preço |
| **Tempo como qualidade** | "Leva 10 dias" vira selo de feitura, não defeito | Reposiciona espera como valor |
| **Curadoria digital** | 6-15 peças, não 200. Cada peça tem página de processo | Experiência de galeria, não de e-commerce de catálogo |
| **Personalização estrutural** | Cor, dimensão, detalhe configuráveis na PDP | Ticket médio maior + exclusividade real |

### 3.3 Moats (Defensabilidade)

| Moat | Tipo | Maturação |
|---|---|---|
| Marca com narrativa de transparência | Brand | 12-24 meses |
| Relacionamento com artistas | Rede | 6-12 meses |
| Dados de cliente + preferências de personalização | Dados | 12-24 meses |
| Comunidade de clientes e afiliados criadores | Comunidade | 12-18 meses |
| Infraestrutura DTC com Pix + região BR + drops | Plataforma | 3-6 meses |

---

## 4. Tese de Pricing (Hipótese — Não Validada)

> **⚠️ Os preços abaixo são hipóteses de trabalho, não decisões comerciais. Devem ser validados por pesquisa e cohort inicial antes da publicação.**

| Produto | Preço entry | Preço padrão | Preço premium |
|---|---|---|---|
| Trança Âmbar | R$ 250 | R$ 420 | R$ 590 |
| Duna Terracota | R$ 590 | R$ 790 | R$ 1.190 |
| Espiral Dourada | R$ 690 | R$ 990 | R$ 1.490 |
| Órbita Negra | R$ 590 | R$ 890 | R$ 1.290 |

**Premissas da tese:**
- Preço entry = custo + margem mínima (atrair primeira compra)
- Preço padrão = preço de mercado-alvo (posicionamento)
- Preço premium = edição especial / personalização / tamanho maior
- Nenhum preço pode ser inferior ao custo de produção (princípio inegociável #2)

**Validação necessária:**
1. Cálculo de custo real por peça (material + tempo + overhead)
2. Pesquisa de disposição a pagar com persona-alvo
3. Cohort inicial com preço de lançamento
4. Análise de elasticidade após 90 dias

---

## 5. Sequência Estratégica (Roadmap de Alto Nível)

### Fase 0 — Pré-lançamento (semanas 1-4)

| # | Iniciativa | Dependência | Risco |
|---|---|---|---|
| 0.1 | Mapear capacidade de produção mensal | Nenhuma | Alto — sem isso não há pricing nem lista de espera |
| 0.2 | Calcular custo real por peça | 0.1 | Alto — sem isso não há piso de preço |
| 0.3 | Validar hipóteses de preço | 0.2 | Médio |
| 0.4 | Escrever descrições e atribuir artista | Nenhuma | Baixo |
| 0.5 | Definir taxonomia (categorias, materiais) | Nenhuma | Baixo |

### Fase 1 — Lançamento (semanas 5-8)

| # | Iniciativa | Dependência | Risco |
|---|---|---|---|
| 1.1 | Criar região BR com BRL no backend | Nenhuma | Médio |
| 1.2 | Integrar Pix como método de pagamento | 1.1 | Médio |
| 1.3 | Configurar frete real para BR | 1.1 | Médio |
| 1.4 | Migrar fixtures para dados do backend | 1.1 | Baixo |
| 1.5 | Lançar 6 produtos com metadados completos | 0.4, 1.4 | Baixo |
| 1.6 | Página de artista (1 por artista) | 0.4 | Baixo |

### Fase 2 — Expansão (meses 3-6)

| # | Iniciativa | Dependência | Risco |
|---|---|---|---|
| 2.1 | Lista de espera para peças esgotadas | 1.5 | Médio |
| 2.2 | Drops programados (lote com data) | 0.1 | Médio |
| 2.3 | Personalização na PDP (cor, dimensão) | 1.5 | Alto |
| 2.4 | Reviews com foto | 1.5 | Baixo |
| 2.5 | Programa de afiliados (criadores) | 1.5 | Médio |

### Fase 3 — Profundar (meses 6-12)

| # | Iniciativa | Dependência | Risco |
|---|---|---|---|
| 3.1 | Página de processo (making-of por peça) | 1.5 | Médio |
| 3.2 | Área do cliente ("suas peças" + cuidado) | 1.5 | Médio |
| 3.3 | Encomenda direta artista-cliente | 2.3 | Alto |
| 3.4 | Internacionalização (i18n + moeda) | 1.2 | Alto |

---

## 6. Decisões Estratégicas Tomadas

| Decisão | Racional | Implicação |
|---|---|---|
| **DTC próprio, não marketplace** | Controle de marca, dados, experiência | Investimento em infra própria |
| **BRL primeiro, internacional depois** | Mercado principal é BR; Pix é crítico | Fase 3 para i18n |
| **6 produtos no lançamento** | Curadoria sobre volume; capacidade limitada | Catálogo pequeno, experiência rica |
| **Personalização é fase 2, não fase 1** | Sem pricing validado, personalização agrava risco | Fase 1 foca em vender o que existe |
| **Lista de espera > estoque fictício** | Princípio #1: não usar escassez falsa | Demanda modelo de waitlist |
| **Drops > promoção** | Princípio #3: não usar dark patterns | Comunica lote real, não "última chance" |

---

## 7. Trade-offs Explícitos

| Escolha | Sacrificamos | Ganhamos |
|---|---|---|
| Transparência de custo | Margem potencialmente menor | Confiança e diferenciação |
| 6 produtos (curadoria) | Receita de catálogo amplo | Experiência de galeria |
| Tempo real comunicado | Conversão imediata menor | Recompra e NPS maiores |
| Sem dark patterns | Conversão de pressão | Integridade de marca |
| Personalização na fase 2 | Receita imediata menor | Validação de preço antes de customizar |

---

## 8. Métricas de Sucesso Estratégico

| Métrica | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|
| **Receita mensal** | Break-even operacional | 3× break-even | 5× break-even |
| **Conversão (visitante → compra)** | 1-2% | 2-3% | 3-5% |
| **Ticket médio** | R$ 600 | R$ 800 (com personalização) | R$ 1.000 |
| **Recompra (12 meses)** | — | 15% | 25% |
| **Lista de espera (peças esgotadas)** | — | 50+ inscritos por peça | 100+ |
| **NPS** | 50 | 60 | 70 |
| **Custo de aquisição (CAC)** | < R$ 150 | < R$ 120 | < R$ 100 |
| **Margem sobre custo** | > 40% | > 45% | > 50% |

---

## 9. Riscos Estratégicos

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Capacidade de produção < demanda | Alta | Alto | Lista de espera; drops; comunicação honesta |
| Preço inviável (custo > hipótese) | Média | Alto | Calcular custo antes de publicar; ajustar hipótese |
| Pix não integrado no lançamento | Baixa | Alto | Priorizar integração na fase 1 |
| Cliente não percebe autoria como valor | Média | Médio | PDP com narrativa de artista; embalagem com nome |
| Storefront divergente do backend | Média | Médio | Migrar fixtures antes do lançamento |
| Concorrência copia narrativa de transparência | Baixa | Baixo | Moat de marca e comunidade |

---

## 10. Não-Estratégia (O Que Não Faremos)

Deixar explícito o que está fora do escopo é parte da estratégia.

| Não faremos | Por quê |
|---|---|
| Vender em marketplace (Mercado Livre, Elo7) | Dilui controle de marca e experiência |
| Oferecer desconto de primeira compra abaixo do custo | Viola princípio #2 |
| Usar countdown timer | Viola princípio #3 |
| Exibir "restam X unidades" sem estoque real | Viola princípio #1 |
| Lançar sem Pix no BR | Abandono de checkout |
| Escalar catálogo antes de validar pricing | Risco de margem negativa |
| Personalização antes de validar demanda | Complexidade sem validação |
| Drop sem lote real | Viola princípio #1 |

---

## 11. Dependências Críticas

| Dependência | Dono | Bloqueia |
|---|---|---|
| Capacidade de produção mensal | Atelier / produção | Pricing, drops, lista de espera |
| Custo real por peça | Atelier / financeiro | Piso de preço, margem |
| Integração Pix | Backend / dev | Lançamento |
| Região BR + BRL | Backend / dev | Lançamento |
| Descrições e artista | Conteúdo / marca | PDP completa |
| Taxonomia | Produto | Busca, filtros, navegação |

---

*Documento vivo. Revisar a cada ciclo de planejamento de produto. Próxima revisão: após validação de hipóteses de preço.*