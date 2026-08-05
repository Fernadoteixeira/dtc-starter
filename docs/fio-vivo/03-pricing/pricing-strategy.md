# Estratégia de Preços — Fio Vivo

> **Status:** Documento estratégico · **Versão:** 1.0.0 · **Data:** 2025-08-05
> **Idioma:** pt-BR
> **Domínio:** `docs/fio-vivo/03-pricing/pricing-strategy.md`

---

## 1. Propósito

Este documento define a **filosofia, os princípios e a arquitetura estratégica** de preços da Fio Vivo, marca de bolsas e peças artesanais em crochê. Ele estabelece:

- os pilares éticos inegociáveis que governam qualquer decisão de preço;
- a composição do **Custo Completo** e a derivação do **Preço Mínimo Sustentável**;
- a **Tríade de Cenários** (Validação · Recomendado · Premium);
- o regime de **Corredores de Preço** (Floor · Target · Ceiling · Stretch);
- os **Multiplicadores de Mercado** que ajustam o preço dinâmico;
- a governança de hipóteses até que dados reais as validem.

Especificações técnicas detalhadas do motor estão em [`pricing-engine-spec.md`](./pricing-engine-spec.md). Exemplos numéricos ponta-a-ponta em [`pricing-examples.md`](./pricing-examples.md). Governança de descontos em [`discount-governance.md`](./discount-governance.md).

---

## 2. Princípios Inegociáveis

Estes princípios são **vinculantes**. Qualquer preço, desconto ou campanha que os viole está automaticamente rejeitado, independentemente do resultado de simulação.

| # | Princípio | Implicação operacional |
|---|-----------|------------------------|
| P1 | **Nunca abaixo do custo econômico total.** | Nenhum preço final (líquido de incentivos) pode ficar abaixo do Custo Completo. O Floor Price é piso absoluto. |
| P2 | **Não usar escassez falsa, cronômetros artificiais ou dark patterns.** | Proibido "última unidade", contagens regressivas fictícias, urgência fabricada. Escassez só quando real e verificável. |
| P3 | **Não copiar cegamente preços concorrentes.** | Pesquisa de mercado informa multiplicadores, nunca substitui o cálculo de custo. |
| P4 | **Não maximizar receita sacrificando confiança.** | Receita é consequência, não objetivo primário. A marca é o ativo de longo prazo. |
| P5 | **Não usar perfil pessoal sensível para discriminar preços.** | Proibido ajustar preço por gênero, raça, orientação, religião, saúde, localização sensível ou qualquer dado protegido. |
| P6 | **Não alterar preço durante checkout sem explicação.** | Qualquer mudança deve ser precedida de comunicação clara e aceitação do cliente. |
| P7 | **Preservar preço por janela após adicionar ao carrinho.** | O preço exibido no momento de adicionar ao carrinho é congelado por uma janela de tempo (ver § 8.4). |

> **Nota sobre P5:** Diferenciação por canal, país ou contexto comercial (B2B, atacado) é permitida. O que é proibido é **discriminação por perfil pessoal sensível** — usar quem a pessoa *é* para cobrar mais ou menos.

---

## 3. Arquitetura de Custo

### 3.1 Custo Completo

O Custo Completo é a base econômica absoluta. Todo preço parte dele.

```
Custo Completo = Materiais
               + Mão de obra
               + Acabamentos
               + Embalagem
               + Perdas
               + Custos indiretos
               + Custo de personalização
               + Subsídio logístico
               + Custo de aquisição alocado
               + Custo esperado de troca/devolução
               + Custo financeiro
```

| Componente | Definição | Observações |
|------------|-----------|------------|
| **Materiais** | Fios, linhas, aviamentos consumidos diretamente na peça | Quantidade × preço unitário. Inclui sobra técnica mínima. |
| **Mão de obra** | Tempo de confecção × valor-hora da artesã | Valor-hora justo, nunca abaixo do piso da categoria. |
| **Acabamentos** | Forro, zíper, botão, argola, etiqueta costurada, embalagem interna | Itens físicos adicionais além do crochê. |
| **Embalagem** | Caixa, papel seda, lacre, carta | Embalagem de envio ao cliente. |
| **Perdas** | Perda técnica estimada (%) sobre materiais | Reflete refilos, erros, retrabalho. |
| **Custos indiretos** | Rateio de energia, ferramentas, depreciação, software, estúdio | Alocado por peça/hora. |
| **Custo de personalização** | Tempo extra de customização (monograma, cor, dimensão) | Zerado quando não há personalização. |
| **Subsídio logístico** | Frete subsidiado pela marca quando aplicável | Custo real do frete coberto parcial ou totalmente. |
| **Custo de aquisição alocado** | CAC rateado por peça (ads, comissões de afiliado, conteúdo) | Alocado por canal/produto. |
| **Custo esperado de troca/devolução** | Probabilidade × custo médio de uma troca/devolução | Histórico ou estimativa conservadora. |
| **Custo financeiro** | Taxas de meio de pagamento, antecipação, parcelamento sem juros | Custo real do dinheiro, não confundir com taxas de marketplace. |

> **Regra de ouro:** se um componente não pode ser medido, usa-se estimativa conservadora (pessimista) e revisa-se a cada ciclo. Nunca se omite um componente por falta de dado — sempre se estima.

### 3.2 Preço Mínimo Sustentável

O Preço Mínimo Sustentável (Floor Price econômico) é o preço que cobre o Custo Completo e ainda deixa margem de contribuição alvo.

```
Preço Mínimo Sustentável = Custo Completo / (1 - Taxas - Impostos - Margem de Contribuição Alvo)
```

**Validação obrigatória:**

```
Taxas + Impostos + Margem de Contribuição Alvo < 1
```

Se a soma for ≥ 1, o cálculo é inválido — sinal de que os custos ou a margem estão mal estimados.

**Baseline de proporção (ponto de partida, revisar com dados):**

| Componente | % do preço | Observação |
|------------|-------------|------------|
| Taxas comerciais + perdas + descontos esperados | 12% | Mercadoplaces, meio de pagamento, perda esperada. |
| Margem de contribuição alvo | 25% | Margem mínima para reinvestimento e resiliência. |
| **Restante para custo** | **63%** | Custo Completo deve caber aqui. |

> **Implicação:** se Custo Completo > 63% do preço final, o preço está abaixo do sustentável. Há duas alavancas — reduzir custo ou subir preço — nunca reduzir margem abaixo do alvo.

---

## 4. Tríade de Cenários

Cada SKU opera em três cenários simultâneos. O cenário determina o **Preço Base** que alimenta o cálculo dinâmico.

| Cenário | Quando usar | Posicionamento | Caráter |
|---------|-------------|----------------|--------|
| **Validação** | Primeiras unidades, lançamento, teste de mercado | Preço de introdução. Cobre custo completo + margem mínima. | Temporário, intencionalmente baixo dentro do sustentável. |
| **Recomendado** | Padrão de operação contínua | Preço de equilíbrio entre custo, margem alvo e percepção de valor. | Cenário principal de listing. |
| **Premium** | Acabamento superior, personalização, edição limitada, coleção assinada | Preço que captura valor diferenciado. | Reservado para peças com atributos verificáveis de premium. |

> **Cenário não é desconto.** Validação não é promoção — é preço de introdução dentro do sustentável. Premium não é inflação — é preço que reflete atributos verificáveis.

### 4.1 Hipóteses de preço (não validadas)

As hipóteses abaixo **não são preços oficiais**. São pontos de partida para validação, sujeitos a refinação quando os dados de custo reais entrarem.

| SKU | Validação | Recomendado | Premium | Status |
|-----|-----------|-------------|---------|--------|
| Trança Âmbar | R$ 250 | R$ 420 | R$ 590 | Hipótese — aguarda dados de custo |
| Duna Terracota | R$ 590 | R$ 790 | R$ 1.190 | Hipótese — aguarda dados de custo |
| Espiral Dourada | R$ 690 | R$ 990 | R$ 1.490 | Hipótese — aguarda dados de custo |
| Órbita Negra | R$ 590 | R$ 890 | R$ 1.290 | Hipótese — aguarda dados de custo |
| Trama Solar | — | — | — | Sem hipótese — requer dados de custo |
| Fio Ancestral | — | — | — | Sem hipótese — requer dados de custo |

> **Workflow de validação:** coletar custo real → calcular Custo Completo → calcular Preço Mínimo Sustentável → comparar com hipótese → ajustar hipótese ou custo → publicar preço validado em `pricing-examples.md`.

---

## 5. Corredores de Preço

Para cada SKU em cada cenário, definem-se quatro corredores que limitam o preço dinâmico.

| Corredor | Definição | Papel |
|----------|----------|------|
| **Floor Price** | Preço Mínimo Sustentável (custo + margem alvo). | Piso absoluto. Nunca abaixo. |
| **Target Price** | Preço recomendado do cenário (Validação / Recomendado / Premium). | Referência central de comunicação. |
| **Ceiling Price** | Preço premium máximo do cenário. | Teto para variações de mercado sem aprovação. |
| **Stretch Price** | Preço experimental, acima do Ceiling, em janela controlada. | Experimentação pontual com aprovação manual. |

### 5.1 Regras de ajuste dentro dos corredores

| Situação | Ajuste máximo | Aprovação |
|----------|---------------|-----------|
| Ajuste normal (flutuação de mercado) | ±10% sobre Target | Automática |
| Venda em lote (multi-unidade) | +15% sobre Target | Automática |
| Demanda comprovada (Índice de Demanda > 1.5 por ≥ 14 dias) | +25% sobre Target | Automática com log |
| Acima de +25% sobre Target | — | **Aprovação manual obrigatória** |
| Desconto Pix | até −5% | Automática |
| Cupom | não acumulável se comprometer margem alvo | Automática com checagem |
| Frete grátis | tratado como desconto financeiro real | Sempre contabilizado no cálculo |

> **Incentivos nunca empurram abaixo do Floor.** Toda combinação de incentivos (Pix + cupom + frete grátis) é simulada antes de publicada. Se o líquido fica abaixo do Floor, o sistema rejeita.

---

## 6. Multiplicadores de Mercado

O Preço Dinâmico é o Preço Base do cenário ajustado por uma cadeia de multiplicadores. Cada multiplicador é uma alavanca legítima — **nunca arbitrária**: tem fonte, faixa e justificativa.

| Multiplicador | O que ajusta | Faixa típica | Fonte |
|---------------|--------------|--------------|-------|
| **Mercado** | Posicionamento vs. referências de categoria | 0,90 – 1,20 | Pesquisa de concorrência (informação, não cópia) |
| **Demanda** | Tensão de demanda real (Índice de Demanda) | 0,95 – 1,25 | Sinais comerciais ponderados |
| **Capacidade** | Disponibilidade de capacidade produtiva | 0,95 – 1,15 | Agenda de produção |
| **Complexidade** | Complexidade técnica da peça | 1,00 – 1,30 | Ficha técnica |
| **Personalização** | Personalização aplicada | 1,00 – 1,40 | Configurador |
| **Sazonal** | Sazonalidade legítima (datas reais, calendário) | 0,95 – 1,15 | Calendário comercial |
| **Urgência Real** | Urgência real verificável (prazo curto do cliente) | 1,00 – 1,10 | Solicitação explícita |
| **Canal** | Custo de canal (marketplace vs. direto) | 0,95 – 1,15 | Estrutura de taxas |
| **Internacional** | Custo e risco de exportação | 1,00 – 1,35 | Moeda, impostos, logística |

> **Urgência Real ≠ urgência fabricada (proibida por P2).** Urgência Real é quando o cliente declara prazo explícito e verificável (presente, evento). O multiplicador reflete custo real de acelerar produção — nunca um gatilho de pressão.

### 6.1 Fórmula do Preço Dinâmico

```
Preço Dinâmico = max(Preço Mínimo Sustentável, Preço Base do Cenário)
               × Multiplicador de Mercado
               × Multiplicador de Demanda
               × Multiplicador de Capacidade
               × Multiplicador de Complexidade
               × Multiplicador de Personalização
               × Multiplicador Sazonal
               × Multiplicador de Urgência Real
               × Multiplicador de Canal
               × Multiplicador Internacional
               − Incentivos Permitidos
```

**Invariantes:**

1. O resultado nunca pode ser menor que o Floor Price.
2. O resultado nunca pode ultrapassar o Stretch Price sem aprovação manual.
3. Incentivos são subtraídos após a multiplicação — nunca antes.
4. Cada multiplicador deve ter log de justificativa.

### 6.2 Índice de Demanda

O Índice de Demanda alimenta o Multiplicador de Demanda. É uma medida **de sinais comerciais reais, ponderada por intenção**, sobre a capacidade disponível.

```
Índice de Demanda = (Pedidos pagos
                   + Reservas qualificadas ponderadas
                   + Consultas comerciais qualificadas ponderadas)
                   / Capacidade disponível
```

**Ponderação por sinal:**

| Sinal | Peso | Justificativa |
|-------|------|---------------|
| Pedido pago | 1,00 | Compromisso financeiro total. |
| Reserva com sinal | 0,80 | Compromisso financeiro parcial. |
| Checkout iniciado | 0,35 | Intenção forte, ainda não convertida. |
| Conversa qualificada | 0,20 | Intenção declarada, sem compromisso. |
| Lista de espera | 0,15 | Interesse explícito, sem ação. |
| Curtida | 0 | Não indica intenção comercial. |
| Impressão | 0 | Métrica de alcance, não de demanda. |

**Faixas de leitura:**

| Índice | Leitura | Ação sugerida |
|--------|---------|---------------|
| < 0,7 | Baixa demanda | Multiplicador ≤ 1,00. Investigar posicionamento. |
| 0,7 – 1,5 | Equilibrada | Multiplicador 1,00. Manter preço. |
| > 1,5 | Pressão | Multiplicador até 1,25 com log. |
| > 70% vendido em 14 dias | Forte tração | Multiplicador 1,25, revisar capacidade. |

> **Capacidade disponível** é a capacidade real de produção no horizonte considerado. Se a capacidade sobe (mais artesãs, mais turnos), o índice cai naturalmente — o que é correto.

---

## 7. Integração com Medusa v2

A Fio Vivo roda em Medusa v2 + Next.js 15. O motor de pricing deve **priorizar extensão sobre build paralelo**.

| Camada Medusa v2 | Uso |
|------------------|-----|
| **Price Lists** | Cenários (Validação, Recomendado, Premium) como price lists distintos por SKU. |
| **Regions** | Multiplicador Internacional e impostos por região. |
| **Currencies** | Conversão e arredondamento por moeda. |
| **Promotions** | Cupons, Pix, frete grátis — sempre vinculados à governança de descontos. |
| **Custom fields / modules** | Custo Completo, multiplicadores, Índice de Demanda, logs de aprovação. |
| **Subscribers / workflows** | Recálculo de Índice de Demanda, validação de Floor, congelamento de preço no carrinho. |

> **Princípio de extensão:** antes de criar um serviço paralelo, verificar se Price Lists, Regions, Currencies ou Promotions já resolvem. Construir paralelo só quando a funcionalidade nativa não cobre o caso (ex.: congelamento de preço por janela de carrinho, cálculo dinâmico de Índice de Demanda).

---

## 8. Janelas, Logs e Governança

### 8.1 Janela de preço no carrinho

Após adicionar ao carrinho, o preço exibido é **congelado por uma janela de tempo** (configurável, sugestão inicial: 60 minutos). Dentro da janela, mesmo que o motor recalcule, o cliente vê o preço que viu ao adicionar.

Expirada a janela, o sistema reavalia e comunica claramente qualquer mudança (P6).

### 8.2 Log de justificativa

Toda mudança de preço registra:

- timestamp;
- SKU;
- cenário;
- preço anterior e novo;
- cada multiplicador com valor e justificativa;
- Índice de Demanda no momento;
- aprovador (automático ou humano).

### 8.3 Aprovação manual

Acima de +25% sobre Target, ou ao usar Stretch Price, a mudança requer aprovação humana registrada. Sem aprovação, o sistema mantém o último preço válido.

### 8.4 Revisão cíclica

- Hipóteses de preço revisadas a cada ciclo de dados de custo.
- Multiplicadores recalibrados mensalmente.
- Baseline de proporção (12/25/63) revisado trimestralmente com dados reais.

---

## 9. Glossário

| Termo | Definição |
|------|-----------|
| **Custo Completo** | Soma de todos os componentes econômicos da peça. |
| **Preço Mínimo Sustentável** | Preço que cobre Custo Completo + margem alvo. Piso absoluto. |
| **Floor Price** | Sinônimo operacional de Preço Mínimo Sustentável. |
| **Target Price** | Preço recomendado do cenário. |
| **Ceiling Price** | Teto sem aprovação. |
| **Stretch Price** | Experimental, acima do Ceiling, com aprovação. |
| **Índice de Demanda** | Sinais comerciais ponderados sobre capacidade. |
| **Multiplicador** | Fator de ajuste do Preço Base, com fonte e faixa. |
| **Incentivo** | Cupom, Pix, frete grátis — descontos controlados. |

---

## 10. Referências

- [`pricing-engine-spec.md`](./pricing-engine-spec.md) — especificação técnica do motor.
- [`pricing-examples.md`](./pricing-examples.md) — exemplos numéricos ponta-a-ponta.
- [`discount-governance.md`](./discount-governance.md) — governança de descontos e incentivos.
- Documento de marca Fio Vivo (contexto de posicionamento).
- Documentação Medusa v2: Price Lists, Regions, Currencies, Promotions.