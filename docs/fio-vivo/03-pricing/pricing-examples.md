# Exemplos de Pricing — Fio Vivo

> **Status:** Exemplos numéricos · **Versão:** 1.0.0 · **Data:** 2025-08-05
> **Idioma:** pt-BR
> **Domínio:** `docs/fio-vivo/03-pricing/pricing-examples.md`

---

## 1. Propósito

Demonstrar, com números ponta-a-ponta, como o motor de pricing da Fio Vivo aplica as fórmulas da estratégia. Os exemplos são **ilustrativos** — os custos abaixo são hipóteses de trabalho, não custos medidos. Quando dados reais entrarem, os valores serão substituídos e o documento versionado.

**Convenções:**

- Valores em R$, com 2 casas decimais exceto onde indicado.
- Baseline de proporção: taxas 12%, margem alvo 25%, custo 63%.
- Hipóteses de preço da estratégia usadas como Target Price dos cenários.

---

## 2. Exemplo 1 — Trança Âmbar (cenário Recomendado)

### 2.1 Hipótese de custo (não validada)

| Componente | Valor (R$) |
|------------|-----------:|
| Materiais | 95,00 |
| Mão de obra | 70,00 |
| Acabamentos | 18,00 |
| Embalagem | 12,00 |
| Perdas (5% sobre materiais) | 4,75 |
| Custos indiretos | 10,00 |
| Custo de personalização | 0,00 |
| Subsídio logístico | 0,00 |
| Custo de aquisição alocado | 15,00 |
| Custo esperado de troca/devolução | 6,00 |
| Custo financeiro | 4,00 |
| **Custo Completo Total** | **234,75** |

### 2.2 Preço Mínimo Sustentável (Floor)

```
Denominador = 1 - 0,12 - 0,00 - 0,25 = 0,63
Floor = 234,75 / 0,63 = 372,62
```

**Verificação de proporção:** 234,75 / 372,62 = 0,630 ✓ (custo ocupa 63%).

### 2.3 Hipótese de preço (Target por cenário)

| Cenário | Target |
|---------|-------:|
| Validação | R$ 250,00 |
| Recomendado | R$ 420,00 |
| Premium | R$ 590,00 |

> **Atenção:** o Target de Validação (R$ 250) está **abaixo do Floor (R$ 372,62)**. Isso sinaliza que a hipótese de Validação não é sustentável com a hipótese de custo atual. Há três caminhos: (a) revisar custo para baixo, (b) elevar Validação para ≥ Floor, (c) aceitar margem abaixo do alvo apenas em lançamento curto e documentado. Este é um achado importante do exercício — a hipótese precisa ser revisitada antes de publicar.

### 2.4 Corredores (cenário Recomendado)

| Corredor | Valor (R$) | Regra |
|----------|-----------:|------|
| Floor | 372,62 | Custo Completo / 0,63 |
| Target | 420,00 | Hipótese Recomendado |
| Ceiling | 525,00 | Target + 25% (demanda comprovada) |
| Stretch | 588,00 | Target + 40% (experimental, aprovação manual) |

### 2.5 Índice de Demanda (exemplo)

Capacidade disponível no horizonte de 14 dias: **40 unidades**.

| Sinal | Quantidade | Peso | Ponderado |
|-------|----------:|-----:|----------:|
| Pedidos pagos | 18 | 1,00 | 18,00 |
| Reservas com sinal | 6 | 0,80 | 4,80 |
| Checkout iniciado | 10 | 0,35 | 3,50 |
| Conversa qualificada | 20 | 0,20 | 4,00 |
| Lista de espera | 8 | 0,15 | 1,20 |
| Curtidas | — | 0 | 0 |
| Impressões | — | 0 | 0 |
| **Total ponderado** | | | **31,50** |

```
Índice = 31,50 / 40 = 0,7875
Faixa: equilibrada (0,7 – 1,5)
Multiplicador de Demanda: 1,00
```

### 2.6 Multiplicadores aplicados (cenário Recomendado)

| Multiplicador | Valor | Justificativa |
|--------------|------:|---------------|
| Mercado | 1,00 | Em validação de posicionamento |
| Demanda | 1,00 | Índice 0,79 (equilibrada) |
| Capacidade | 1,00 | Capacidade adequada |
| Complexidade | 1,05 | Trança média complexidade |
| Personalização | 1,00 | Sem personalização |
| Sazonal | 1,00 | Fora de pico sazonal |
| Urgência Real | 1,00 | Sem urgência declarada |
| Canal | 1,05 | Marketplace (taxa de canal) |
| Internacional | 1,00 | Doméstico |

### 2.7 Cálculo do Preço Dinâmico

```
Base efetivo = max(372,62 ; 420,00) = 420,00
Bruto = 420,00 × 1,00 × 1,00 × 1,00 × 1,05 × 1,00 × 1,00 × 1,00 × 1,05 × 1,00
       = 420,00 × 1,05 × 1,05
       = 420,00 × 1,1025
       = 463,05
Incentivos = 0 (sem cupom/Pix/frete grátis neste exemplo)
Líquido = 463,05
```

**Checagens:**
- Líquido (463,05) ≥ Floor (372,62) ✓
- Líquido (463,05) ≤ Ceiling (525,00) ✓ → aprovado automático
- Dentro do corredor ✓

### 2.8 Com Pix (−5%)

```
Incentivo Pix = 5% × 463,05 = 23,15
Líquido com Pix = 463,05 - 23,15 = 439,90
```

**Validação de margem:**
```
Margem realizada = 1 - 234,75 / 439,90 = 1 - 0,5336 = 0,4664 (46,64%)
Margem alvo = 25% → 46,64% > 25% → Pix acumulável ✓
```

---

## 3. Exemplo 2 — Duna Terracota (cenário Premium)

### 3.1 Hipótese de custo (não validada)

| Componente | Valor (R$) |
|------------|-----------:|
| Materiais | 210,00 |
| Mão de obra | 160,00 |
| Acabamentos | 35,00 |
| Embalagem | 18,00 |
| Perdas (5%) | 10,50 |
| Custos indiretos | 22,00 |
| Custo de personalização | 0,00 |
| Subsídio logístico | 0,00 |
| Custo de aquisição alocado | 30,00 |
| Custo esperado de troca/devolução | 12,00 |
| Custo financeiro | 8,00 |
| **Custo Completo Total** | **505,50** |

### 3.2 Preço Mínimo Sustentável

```
Floor = 505,50 / 0,63 = 802,38
```

### 3.3 Hipótese de preço (Target)

| Cenário | Target |
|---------|-------:|
| Validação | R$ 590,00 |
| Recomendado | R$ 790,00 |
| Premium | R$ 1.190,00 |

> **Atenção:** Validação (R$ 590) < Floor (R$ 802,38). Mesma observação do Exemplo 1 — a hipótese de Validação não é sustentável. A Recomendado (R$ 790) também está ligeiramente abaixo do Floor (R$ 802,38). Sinalização clara de que as hipóteses de custo ou de preço precisam de revisão antes da publicação.

### 3.4 Corredores (cenário Premium)

| Corredor | Valor (R$) | Regra |
|----------|-----------:|------|
| Floor | 802,38 | Custo / 0,63 |
| Target | 1.190,00 | Hipótese Premium |
| Ceiling | 1.487,50 | Target + 25% |
| Stretch | 1.666,00 | Target + 40% |

### 3.5 Índice de Demanda — forte tração

Capacidade disponível (14 dias): **12 unidades**.

| Sinal | Quantidade | Peso | Ponderado |
|-------|----------:|-----:|----------:|
| Pedidos pagos | 9 | 1,00 | 9,00 |
| Reservas com sinal | 4 | 0,80 | 3,20 |
| Checkout iniciado | 8 | 0,35 | 2,80 |
| Conversa qualificada | 15 | 0,20 | 3,00 |
| Lista de espera | 6 | 0,15 | 0,90 |
| **Total ponderado** | | | **18,90** |

```
Índice = 18,90 / 12 = 1,575
Faixa: pressão (> 1,5)
```

Verificação de tração: 9 pedidos pagos / 12 capacidade = 75% vendido em 14 dias → **forte tração** confirmada.

**Multiplicador de Demanda: 1,25** (máximo automático com log).

### 3.6 Multiplicadores aplicados (cenário Premium)

| Multiplicador | Valor | Justificativa |
|--------------|------:|---------------|
| Mercado | 1,10 | Posicionamento premium validado em pesquisa |
| Demanda | 1,25 | Índice 1,575 + forte tração |
| Capacidade | 1,10 | Capacidade apertada (12 unidades) |
| Complexidade | 1,20 | Acabamento superior |
| Personalização | 1,15 | Personalização leve aplicada |
| Sazonal | 1,00 | — |
| Urgência Real | 1,00 | — |
| Canal | 1,00 | Direto (DTC) |
| Internacional | 1,00 | Doméstico |

### 3.7 Cálculo

```
Base efetivo = max(802,38 ; 1.190,00) = 1.190,00
Bruto = 1.190,00 × 1,10 × 1,25 × 1,10 × 1,20 × 1,15
       = 1.190,00 × 2,64975
       = 3.153,20
```

**Checagem de corredor:**
```
Líquido (sem incentivos) = 3.153,20
Stretch = 1.666,00
3.153,20 > 1.666,00 → excede Stretch
```

> **Resultado:** o cálculo bruto excede o Stretch. O motor **rejeita** com erro de invariante (I3). Há três caminhos legítimos:
> 1. Reduzir multiplicadores (ex.: Mercado de 1,10 para 1,00).
> 2. Revisar a hipótese de custo/corredor.
> 3. Submeter a aprovação manual com justificativa de edição limitada — mas ainda assim o motor não permite ultrapassar o Stretch sem revisão dos corredores.

**Lição:** multiplicadores empilhados no Premium podem estourar o teto. O motor protege a marca rejeitando automaticamente. Revisar antes de publicar.

### 3.8 Cenário ajustado (Multiplicador de Mercado 1,00)

| Multiplicador | Valor |
|--------------|------:|
| Mercado | 1,00 |
| Demanda | 1,25 |
| Capacidade | 1,10 |
| Complexidade | 1,20 |
| Personalização | 1,15 |

```
Bruto = 1.190,00 × 1,00 × 1,25 × 1,10 × 1,20 × 1,15
       = 1.190,00 × 1,87875
       = 2.235,71
```

Ainda acima do Stretch (1.666,00) → ainda rejeitado.

### 3.9 Cenário ajustado (sem Capacidade e Personalização)

| Multiplicador | Valor |
|--------------|------:|
| Mercado | 1,00 |
| Demanda | 1,20 | (reduzido de 1,25 para 1,20)
| Capacidade | 1,00 |
| Complexidade | 1,15 |
| Personalizacao | 1,00 |

```
Bruto = 1.190,00 × 1,00 × 1,20 × 1,00 × 1,15 × 1,00
       = 1.190,00 × 1,38
       = 1.642,20
```

**Checagens:**
- ≥ Floor (802,38) ✓
- ≤ Ceiling (1.487,50)? 1.642,20 > 1.487,50 → acima do Ceiling, exige aprovação manual.
- ≤ Stretch (1.666,00) ✓

> **Resultado:** exige aprovação manual, dentro do Stretch. Aprovação registrada em log. Preço final: **R$ 1.642,20**.

---

## 4. Exemplo 3 — Espiral Dourada (cenário Validação, com Pix + cupom + frete grátis)

### 4.1 Hipótese de custo (não validada)

| Componente | Valor (R$) |
|------------|-----------:|
| Materiais | 180,00 |
| Mão de obra | 140,00 |
| Acabamentos | 28,00 |
| Embalagem | 16,00 |
| Perdas (5%) | 9,00 |
| Custos indiretos | 18,00 |
| Custo de personalização | 0,00 |
| Subsídio logístico | 0,00 |
| Custo de aquisição alocado | 25,00 |
| Custo esperado de troca/devolução | 10,00 |
| Custo financeiro | 7,00 |
| **Custo Completo Total** | **433,00** |

### 4.2 Floor

```
Floor = 433,00 / 0,63 = 687,30
```

### 4.3 Hipótese de preço

| Cenário | Target |
|---------|-------:|
| Validação | R$ 690,00 |
| Recomendado | R$ 990,00 |
| Premium | R$ 1.490,00 |

> Validação (R$ 690) ≈ Floor (R$ 687,30) — apenas 0,4% acima. Margem mínima. Apropriado para lançamento curto, mas sem folga para incentivos.

### 4.4 Corredores (cenário Validação)

| Corredor | Valor (R$) |
|----------|-----------:|
| Floor | 687,30 |
| Target | 690,00 |
| Ceiling | 862,50 (Target + 25%) |
| Stretch | 966,00 (Target + 40%) |

### 4.5 Multiplicadores aplicados (cenário Validação, lançamento)

| Multiplicador | Valor | Justificativa |
|--------------|------:|---------------|
| Mercado | 1,00 | Posicionamento em teste |
| Demanda | 1,00 | Sem histórico (lançamento) |
| Capacidade | 1,00 | Capacidade normal |
| Complexidade | 1,10 | Espiral complexidade média-alta |
| Personalização | 1,00 | — |
| Sazonal | 1,00 | — |
| Urgência Real | 1,00 | — |
| Canal | 1,05 | Marketplace |
| Internacional | 1,00 | — |

### 4.6 Cálculo bruto

```
Base efetivo = max(687,30 ; 690,00) = 690,00
Bruto = 690,00 × 1,00 × 1,00 × 1,00 × 1,10 × 1,00 × 1,00 × 1,00 × 1,05 × 1,00
       = 690,00 × 1,155
       = 796,95
```

### 4.7 Aplicação de incentivos combinados

| Incentivo | Valor (R$) |
|-----------|-----------:|
| Pix (5% × 796,95) | 39,85 |
| Cupom "LANÇAMENTO10" (10%) | 79,70 |
| Frete grátis (custo real) | 35,00 |
| **Total de incentivos** | **154,55** |

```
Líquido = 796,95 - 154,55 = 642,40
```

**Checagem crítica:**
```
Floor = 687,30
Líquido = 642,40
642,40 < 687,30 → INVIÁVEL
```

> **Resultado:** a combinação de incentivos derruba o preço abaixo do Floor. O motor **rejeita** a combinação.

### 4.8 Revisão — incentivos reduzidos

| Incentivo | Valor (R$) | Observação |
|-----------|-----------:|------------|
| Pix (5%) | 39,85 | Mantido |
| Cupom "LANÇAMENTO10" | 0,00 | Removido — compromete margem |
| Frete grátis | 0,00 | Removido |
| **Total** | **39,85** | |

```
Líquido = 796,95 - 39,85 = 757,10
Margem realizada = 1 - 433,00 / 757,10 = 1 - 0,5719 = 0,4281 (42,81%)
> margem alvo 25% → acumulável ✓
≥ Floor ✓
≤ Ceiling ✓
```

> **Resultado:** só o Pix é aplicável. Cupom e frete grátis não acumulam sem comprometer a sustentabilidade. Preço final: **R$ 757,10**.

---

## 5. Exemplo 4 — Órbita Negra (cenário Recomendado, demanda equilibrada)

### 5.1 Hipótese de custo (não validada)

| Componente | Valor (R$) |
|------------|-----------:|
| Materiais | 165,00 |
| Mão de obra | 130,00 |
| Acabamentos | 30,00 |
| Embalagem | 15,00 |
| Perdas (5%) | 8,25 |
| Custos indiretos | 16,00 |
| Custo de personalização | 0,00 |
| Subsídio logístico | 0,00 |
| Custo de aquisição alocado | 22,00 |
| Custo esperado de troca/devolução | 9,00 |
| Custo financeiro | 6,00 |
| **Custo Completo Total** | **401,25** |

### 5.2 Floor

```
Floor = 401,25 / 0,63 = 637,30
```

### 5.3 Hipótese de preço

| Cenário | Target |
|---------|-------:|
| Validação | R$ 590,00 |
| Recomendado | R$ 890,00 |
| Premium | R$ 1.290,00 |

> Validação (R$ 590) < Floor (R$ 637,30). Recomendado (R$ 890) > Floor ✓.

### 5.4 Corredores (cenário Recomendado)

| Corredor | Valor (R$) |
|----------|-----------:|
| Floor | 637,30 |
| Target | 890,00 |
| Ceiling | 1.112,50 |
| Stretch | 1.246,00 |

### 5.5 Índice de Demanda — equilibrado

Capacidade: 20 unidades.

| Sinal | Quantidade | Peso | Ponderado |
|-------|----------:|-----:|----------:|
| Pedidos pagos | 8 | 1,00 | 8,00 |
| Reservas com sinal | 3 | 0,80 | 2,40 |
| Checkout iniciado | 6 | 0,35 | 2,10 |
| Conversa qualificada | 12 | 0,20 | 2,40 |
| Lista de espera | 4 | 0,15 | 0,60 |
| **Total ponderado** | | | **15,50** |

```
Índice = 15,50 / 20 = 0,775 → equilibrada
Multiplicador de Demanda: 1,00
```

### 5.6 Multiplicadores

| Multiplicador | Valor |
|--------------|------:|
| Mercado | 1,00 |
| Demanda | 1,00 |
| Capacidade | 1,00 |
| Complexidade | 1,15 |
| Personalização | 1,00 |
| Sazonal | 1,00 |
| Urgência Real | 1,00 |
| Canal | 1,00 |
| Internacional | 1,00 |

### 5.7 Cálculo

```
Base efetivo = max(637,30 ; 890,00) = 890,00
Bruto = 890,00 × 1,00 × 1,00 × 1,00 × 1,15 × 1,00 × 1,00 × 1,00 × 1,00 × 1,00
       = 890,00 × 1,15
       = 1.023,50
Incentivos = 0
Líquido = 1.023,50
```

**Checagens:**
- ≥ Floor (637,30) ✓
- ≤ Ceiling (1.112,50) ✓ → automático
- Preço final: **R$ 1.023,50**

> Note que mesmo o cenário "Recomendado" com apenas um multiplicador não-trivial (Complexidade 1,15) ficou acima do Target (R$ 890). Isso é esperado — o Target é referência, o dinâmico responde ao contexto.

---

## 6. Resumo comparativo

| SKU | Cenário | Custo | Floor | Target | Bruto | Incentivos | Líquido | Status |
|-----|---------|------:|------:|-------:|------:|-----------:|--------:|--------|
| Trança Âmbar | Recomendado | 234,75 | 372,62 | 420,00 | 463,05 | 0 | 463,05 | Aprovado automático |
| Trança Âmbar | Recomendado + Pix | 234,75 | 372,62 | 420,00 | 463,05 | 23,15 | 439,90 | Aprovado, margem 46,6% |
| Duna Terracota | Premium (multiplicadores altos) | 505,50 | 802,38 | 1.190,00 | 3.153,20 | 0 | 3.153,20 | **Rejeitado (excede Stretch)** |
| Duna Terracota | Premium (ajustado) | 505,50 | 802,38 | 1.190,00 | 1.642,20 | 0 | 1.642,20 | Aprovação manual (dentro do Stretch) |
| Espiral Dourada | Validação + Pix + cupom + frete | 433,00 | 687,30 | 690,00 | 796,95 | 154,55 | 642,40 | **Rejeitado (abaixo do Floor)** |
| Espiral Dourada | Validação + Pix apenas | 433,00 | 687,30 | 690,00 | 796,95 | 39,85 | 757,10 | Aprovado, margem 42,8% |
| Órbita Negra | Recomendado | 401,25 | 637,30 | 890,00 | 1.023,50 | 0 | 1.023,50 | Aprovado automático |

---

## 7. Achados e recomendações

1. **Hipóteses de Validação costumam ficar abaixo do Floor.** Antes de publicar, cada SKU deve ter seu Custo Completo medido e o Validação recalibrado para ≥ Floor, ou a janela de lançamento documentada com margem abaixo do alvo.
2. **Empilhamento de multiplicadores no Premium estoura o Stretch.** O motor protege rejeitando. Revisar multiplicadores antes de forçar aprovação manual.
3. **Combinações de incentivos podem violar o Floor.** Sempre simular o líquido antes de publicar cupom + Pix + frete grátis juntos.
4. **Trama Solar e Fio Ancestral** seguem sem hipótese — necessitam dados de custo antes de qualquer preço.
5. **O motor funciona como guardião:** mesmo com hipóteses otimistas, os invariantes impedem preços inviáveis. Isso é por design.

---

## 8. Referências

- [`pricing-strategy.md`](./pricing-strategy.md) — estratégia e fórmulas.
- [`pricing-engine-spec.md`](./pricing-engine-spec.md) — especificação técnica.
- [`discount-governance.md`](./discount-governance.md) — governança de incentivos.