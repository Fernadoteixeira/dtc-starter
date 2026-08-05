# Especificação do Motor de Pricing — Fio Vivo

> **Status:** Especificação técnica · **Versão:** 1.0.0 · **Data:** 2025-08-05
> **Idioma:** pt-BR
> **Domínio:** `docs/fio-vivo/03-pricing/pricing-engine-spec.md`

---

## 1. Propósito

Este documento especifica o **motor de pricing** da Fio Vivo: estruturas de dados, fluxos, endpoints, integração com Medusa v2, invariantes e contratos de validação. É a referência de implementação — a estratégia está em [`pricing-strategy.md`](./pricing-strategy.md) e exemplos em [`pricing-examples.md`](./pricing-examples.md).

**Princípio arquitetural:** priorizar extensão do Medusa v2 (Price Lists, Regions, Currencies, Promotions, Custom Fields, Subscribers) sobre build paralelo. Construção paralela só quando a primitiva nativa não cobre o caso.

---

## 2. Modelo de Dados

### 2.1 Entidade: `FioSkuPricing`

Metadados econômicos e de cenário por SKU. Estende `ProductVariant` via custom fields ou módulo dedicado.

```typescript
interface FioSkuPricing {
  sku: string                       // identificador do SKU
  custoCompleto: CustoCompleto      // detalhamento econômico (ver 2.2)
  cenarioPrecoBase: CenarioPreco    // preço base por cenário (ver 2.3)
  corredores: Corredores            // floor/target/ceiling/stretch por cenário
  multiplicadoresPadrao: Multiplicadores // padrões aplicáveis ao SKU
  personalizacaoConfig: PersonalizacaoConfig | null
  capacidade: Capacidade            // capacidade produtiva (ver 2.5)
  indiceDemandaCache: IndiceDemanda | null // último cálculo
  janelaCarrinhoMin: number          // janela de congelamento (default 60)
  ativo: boolean
  atualizadoEm: Date
}
```

### 2.2 Entidade: `CustoCompleto`

```typescript
interface CustoCompleto {
  materiais: number          // R$
  maoDeObra: number          // R$ (tempo × valor-hora)
  acabamentos: number        // R$
  embalagem: number          // R$
  perdas: number             // R$ (% sobre materiais)
  custosIndiretos: number    // R$ (rateio)
  custoPersonalizacao: number // R$ (0 se não aplicável)
  subsidioLogistico: number  // R$ (frete subsidiado)
  custoAquisicaoAlocado: number // R$ (CAC rateado)
  custoEsperadoTroca: number // R$ (probabilidade × custo médio)
  custoFinanceiro: number    // R$ (meio de pagamento)
  total: number              // soma dos componentes
  baseline: BaselineProporcao // proporções de referência
  atualizadoEm: Date
}

interface BaselineProporcao {
  taxasPercent: number        // ex.: 0.12
  impostosPercent: number      // ex.: 0.00 (simplificado)
  margemAlvoPercent: number   // ex.: 0.25
  custoPercent: number         // 1 - taxas - impostos - margem (ex.: 0.63)
}
```

### 2.3 Entidade: `CenarioPreco`

```typescript
type TipoCenario = 'validacao' | 'recomendado' | 'premium'

interface CenarioPreco {
  tipo: TipoCenario
  precoBase: number            // Preço Base do Cenário (R$)
  validoAte: Date | null        // null = vigente
  observacao: string            // justificativa (ex.: "lançamento")
}
```

### 2.4 Entidade: `Corredores`

```typescript
interface Corredores {
  floor: number                // Preço Mínimo Sustentável
  target: number               // preço recomendado do cenário
  ceiling: number               // teto sem aprovação
  stretch: number               // experimental, com aprovação
  cenario: TipoCenario
}
```

### 2.5 Entidade: `Capacidade`

```typescript
interface Capacidade {
  horizonDays: number           // horizonte de cálculo (ex.: 14)
  unidadesDisponiveis: number    // capacidade real de produção
  atualizadoEm: Date
}
```

### 2.6 Entidade: `IndiceDemanda`

```typescript
interface IndiceDemanda {
  sku: string
  horizonteDays: number
  pedidosPagos: number
  reservasPonderadas: number    // soma de reservas × peso
  consultasPonderadas: number   // soma de consultas × peso
  capacidadeDisponivel: number
  indice: number                // (pedidos + reservas + consultas) / capacidade
  faixa: 'baixa' | 'equilibrada' | 'pressao' | 'forte_tracao'
  calculadoEm: Date
}

// Tabela de pesos (constante de domínio)
const PESOS_SINAIS = {
  pedido_pago: 1.00,
  reserva_sinal: 0.80,
  checkout_iniciado: 0.35,
  conversa_qualificada: 0.20,
  lista_espera: 0.15,
  curtida: 0,
  impressao: 0,
} as const
```

### 2.7 Entidade: `Multiplicadores`

```typescript
interface Multiplicadores {
  mercado: number          // 0.90 – 1.20
  demanda: number           // 0.95 – 1.25 (deriva do Índice)
  capacidade: number        // 0.95 – 1.15
  complexidade: number      // 1.00 – 1.30
  personalizacao: number    // 1.00 – 1.40
  sazonal: number           // 0.95 – 1.15
  urgenciaReal: number      // 1.00 – 1.10
  canal: number             // 0.95 – 1.15
  internacional: number      // 1.00 – 1.35
  justificativas: Record<MultiplicadorChave, string>
}

type MultiplicadorChave =
  | 'mercado' | 'demanda' | 'capacidade' | 'complexidade'
  | 'personalizacao' | 'sazonal' | 'urgenciaReal' | 'canal' | 'internacional'
```

### 2.8 Entidade: `IncentivosPermitidos`

```typescript
interface IncentivosPermitidos {
  pix: number                // desconto Pix (R$)
  cupom: number              // desconto cupom (R$)
  freteGratis: number        // valor financeiro do frete coberto (R$)
  total: number              // soma
  acumulavel: boolean        // false se compromete margem alvo
}
```

### 2.9 Entidade: `LogPreco`

```typescript
interface LogPreco {
  id: string
  timestamp: Date
  sku: string
  cenario: TipoCenario
  precoAnterior: number
  precoNovo: number
  precoBase: number
  custoCompletoTotal: number
  floor: number
  ceiling: number
  stretch: number
  multiplicadores: Multiplicadores
  indiceDemanda: IndiceDemanda | null
  incentivos: IncentivosPermitidos
  aprovador: 'auto' | string  // id do humano
  motivo: string
}
```

---

## 3. Algoritmo Central

### 3.1 Cálculo do Preço Mínimo Sustentável

```typescript
function calcularPrecoMinimoSustentavel(custo: CustoCompleto): number {
  const { taxasPercent, impostosPercent, margemAlvoPercent } = custo.baseline

  // Invariante: Taxas + Impostos + Margem < 1
  const soma = taxasPercent + impostosPercent + margemAlvoPercent
  if (soma >= 1) {
    throw new Error(
      `Configuração inválida: taxas + impostos + margem = ${soma} (deve ser < 1)`
    )
  }

  const denominador = 1 - soma
  return round2(custo.total / denominador)
}
```

### 3.2 Cálculo do Índice de Demanda

```typescript
function calcularIndiceDemanda(
  pedidosPagos: number,
  reservasPonderadas: number,   // já pré-ponderadas
  consultasPonderadas: number,  // já pré-ponderadas
  capacidadeDisponivel: number
): IndiceDemanda {
  if (capacidadeDisponivel <= 0) {
    throw new Error('Capacidade disponível deve ser > 0')
  }

  const indice =
    (pedidosPagos + reservasPonderadas + consultasPonderadas) /
    capacidadeDisponivel

  const faixa = classificarFaixa(indice)

  return {
    indice: round4(indice),
    faixa,
    // ...demais campos
  }
}

function classificarFaixa(indice: number): IndiceDemanda['faixa'] {
  if (indice < 0.7) return 'baixa'
  if (indice <= 1.5) return 'equilibrada'
  // pressao se > 1.5; forte_tracao requer flag adicional de 70% vendido em 14d
  return 'pressao'
}
```

### 3.3 Cálculo do Preço Dinâmico

```typescript
function calcularPrecoDinamico(input: {
  precoMinimoSustentavel: number
  precoBaseCenario: number
  multiplicadores: Multiplicadores
  incentivos: IncentivosPermitidos
  corredores: Corredores
  aprovadorManualDisponivel: boolean
}): ResultadoPreco {
  const {
    precoMinimoSustentavel,
    precoBaseCenario,
    multiplicadores: m,
    incentivos,
    corredores,
    aprovadorManualDisponivel,
  } = input

  // 1. Preço base efetivo = max(Floor, Base do Cenário)
  const baseEfetivo = Math.max(precoMinimoSustentavel, precoBaseCenario)

  // 2. Aplicar multiplicadores
  const bruto = baseEfetivo
    * m.mercado
    * m.demanda
    * m.capacidade
    * m.complexidade
    * m.personalizacao
    * m.sazonal
    * m.urgenciaReal
    * m.canal
    * m.internacional

  // 3. Subtrair incentivos permitidos
  const liquido = bruto - incentivos.total

  // 4. Invariantes
  if (liquido < corredores.floor) {
    throw new Error(
      `Invariante violado: preço líquido (${liquido}) < Floor (${corredores.floor})`
    )
  }

  // 5. Teto sem aprovação
  let precoFinal = liquido
  let aprovador: 'auto' | string = 'auto'

  if (liquido > corredores.ceiling && !aprovadorManualDisponivel) {
    // clampa ao ceiling sem aprovação
    precoFinal = corredores.ceiling
  } else if (liquido > corredores.ceiling && aprovadorManualDisponivel) {
    if (liquido > corredores.stretch) {
      // nunca acima do stretch, mesmo com aprovação — rejeitar
      throw new Error(
        `Invariante violado: preço (${liquido}) > Stretch (${corredores.stretch})`
      )
    }
    aprovador = 'manual-aprovado'
  }

  return {
    precoBaseEfetivo: baseEfetivo,
    bruto,
    incentivos,
    liquido,
    precoFinal,
    aprovador,
    dentroCorredor: precoFinal >= corredores.floor && precoFinal <= corredores.ceiling,
  }
}
```

### 3.4 Validação de incentivos combinados

```typescript
function validarIncentivos(
  incentivos: IncentivosPermitidos,
  precoBruto: number,
  custoCompleto: number,
  margemAlvoPercent: number
): IncentivosPermitidos {
  const liquido = precoBruto - incentivos.total
  const margemRealizada = 1 - custoCompleto / liquido

  // Incentivos não podem derrubar abaixo do custo (invariante P1)
  if (liquido < custoCompleto) {
    throw new Error('Incentivos levam preço abaixo do Custo Completo')
  }

  // Cupom não acumulável se comprometer margem alvo
  const acumulavel = margemRealizada >= margemAlvoPercent
  return { ...incentivos, acumulavel }
}
```

---

## 4. Regras de Ajuste

Implementação das regras de corredor da estratégia.

| Regra | Implementação |
|------|---------------|
| Ajuste normal ±10% | `Math.abs(m.mercado * m.demanda * m.capacidade - 1) <= 0.10` |
| Lote +15% | contexto `lote: true` → aplica multiplicador de canal/capacidade |
| Demanda comprovada +25% | `indice.faixa === 'pressao'` por ≥ 14 dias → `m.demanda <= 1.25` |
| > +25% | exige `aprovadorManualDisponivel = true` |
| Pix até 5% | `incentivos.pix <= 0.05 * precoBruto` |
| Cupom não acumulável se comprometer margem | `validarIncentivos` retorna `acumulavel: false` |
| Frete grátis = desconto financeiro | `incentivos.freteGratis` entra no `total` |

---

## 5. Janela de Congelamento de Carrinho

### 5.1 Modelo

```typescript
interface CarrinhoComPreco {
  cartId: string
  sku: string
  precoCongelado: number       // preço exibido ao adicionar
  congeladoEm: Date
  expiraEm: Date                // congeladoEm + janelaCarrinhoMin
  cenario: TipoCenario
  multiplicadoresSnapshot: Multiplicadores
}
```

### 5.2 Fluxo

1. Ao adicionar ao carrinho, o sistema calcula o Preço Dinâmico atual e o armazena como `precoCongelado`.
2. Durante a janela, qualquer exibição do carrinho usa `precoCongelado` — mesmo se o motor recalcular.
3. Expirada a janela, o sistema reavalia e, se houver mudança, comunica ao cliente (P6):
   > "O preço foi atualizado para R$ X. O preço anterior (R$ Y) era válido até [data/hora]."
4. O cliente pode aceitar o novo preço ou remover o item.

### 5.3 Implementação no Medusa v2

- **Custom field** em `LineItem`: `preco_congelado`, `expira_em`.
- **Subscriber** em `cart.updated` e `order.placed`: limpa congelamento ao finalizar.
- **Workflow step** no checkout: valida janela; se expirada, recalcula e notifica.

---

## 6. Endpoints / Workflows

### 6.1 Cálculo sob demanda

```
POST /fio-vivo/pricing/calcular
Body: {
  sku: string
  cenario: TipoCenario
  contexto: {
    canal: string
    regiao: string
    moeda: string
    personalizacao?: PersonalizacaoConfig
    lote?: { quantidade: number }
    urgenciaReal?: { prazo: string; verificavel: boolean }
  }
}
Response: ResultadoPreco + LogPreco
```

### 6.2 Recálculo de Índice de Demanda

```
POST /fio-vivo/pricing/indice-demanda
Body: { sku: string; horizonteDays: number }
Response: IndiceDemanda
```

### 6.3 Aprovação manual

```
POST /fio-vivo/pricing/aprovar
Body: { logId: string; aprovadorId: string }
Response: LogPreco (atualizado com aprovador)
```

### 6.4 Recalibração de corredores

```
POST /fio-vivo/pricing/corredores/recalibrar
Body: { sku: string }
Response: Corredores
```

---

## 7. Subscribers / Eventos

| Evento Medusa | Ação Fio Vivo |
|---------------|---------------|
| `product-variant.created` | Inicializar `FioSkuPricing` com custo zero e hipóteses. |
| `product-variant.updated` | Revalidar Custo Completo e corredores. |
| `cart.created` / `cart.updated` | Manter congelamento; recalcular se expirado. |
| `order.placed` | Atualizar Índice de Demanda; registrar venda para tração. |
| `promotion.created` | Validar contra Floor Price e margem alvo. |

---

## 8. Invariantes e Checagens

| # | Invariante | Checagem |
|---|-----------|----------|
| I1 | `Taxas + Impostos + Margem < 1` | `calcularPrecoMinimoSustentavel` lança erro se falhar. |
| I2 | Preço final ≥ Floor Price | `calcularPrecoDinamico` lança erro se falhar. |
| I3 | Preço final ≤ Stretch | `calcularPrecoDinamico` lança erro se exceder. |
| I4 | Cada multiplicador dentro da faixa | `validarMultiplicadores` rejeita fora da faixa. |
| I5 | Urgência Real só se verificável | `m.urgenciaReal > 1` exige `contexto.urgenciaReal.verificavel = true`. |
| I6 | Cupom não acumula se compromete margem | `validarIncentivos` retorna `acumulavel: false`. |
| I7 | Congelamento respeitado | Carrinho usa `precoCongelado` dentro da janela. |
| I8 | Log de justificativa sempre gerado | Toda mudança cria `LogPreco`. |
| I9 | Sem discriminação por perfil sensível | Proibido ler campos sensíveis no cálculo (P5). |
| I10 | Sem dark patterns | Proibido gerar urgência fabricada (P2). |

---

## 9. Persistência

- **Tabela `fio_sku_pricing`**: metadados por SKU.
- **Tabela `fio_custo_completo`**: custo detalhado (relação 1:N com histórico).
- **Tabela `fio_indice_demanda`**: cache do índice (snapshots).
- **Tabela `fio_log_preco`**: log imutável de mudanças.
- **Tabela `fio_carrinho_preco`**: congelamento de carrinho.

Migrações via Medusa CLI. Custom fields complementares em `ProductVariant`, `LineItem` e `Promotion`.

---

## 10. Telemetria

Métricas mínimas recomendadas:

- `fio.pricing.calculo.total` (counter)
- `fio.pricing.calculo.erro` (counter, por invariante)
- `fio.pricing.indice_demanda` (gauge por SKU)
- `fio.pricing.corredor.violado` (counter)
- `fio.pricing.aprovacao.manual` (counter)
- `fio.pricing.janela.expirada` (counter)

---

## 11. Referências

- [`pricing-strategy.md`](./pricing-strategy.md) — estratégia e fórmulas.
- [`pricing-examples.md`](./pricing-examples.md) — exemplos ponta-a-ponta.
- [`discount-governance.md`](./discount-governance.md) — governança de incentivos.
- Documentação Medusa v2: Price Lists, Regions, Currencies, Promotions, Workflows, Subscribers.