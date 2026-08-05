# Governança de Descontos — Fio Vivo

> **Status:** Documento de governança · **Versão:** 1.0.0 · **Data:** 2025-08-05
> **Idioma:** pt-BR
> **Domínio:** `docs/fio-vivo/03-pricing/discount-governance.md`

---

## 1. Propósito

Definir **quando, quanto, como e por quanto tempo** a Fio Vivo concede descontos e incentivos financeiros, respeitando os princípios inegociáveis da estratégia de preços. Este documento é vinculante: qualquer cupom, promoção, frete grátis ou ajuste de Pix deve cumprir as regras abaixo.

**Estratégia de referência:** [`pricing-strategy.md`](./pricing-strategy.md). Especificação técnica do motor: [`pricing-engine-spec.md`](./pricing-engine-spec.md). Exemplos: [`pricing-examples.md`](./pricing-examples.md).

---

## 2. Princípios de Governança

| # | Princípio | Implicação |
|---|----------|------------|
| G1 | **Desconto é custo financeiro, não ferramenta de marketing.** | Todo desconto entra no cálculo como subtração do preço dinâmico e é contabilizado na margem. |
| G2 | **Nunca abaixo do Floor.** | Qualquer combinação de incentivos que leve o líquido abaixo do Preço Mínimo Sustentável é rejeitada. |
| G3 | **Margem alvo é intocável por padrão.** | Cupom que compromete a margem alvo torna-se não acumulável. |
| G4 | **Sem escassez falsa.** | Desconto por "tempo limitado" só é permitido com limite real e comunicado. Sem cronômetros artificiais. |
| G5 | **Sem dark patterns.** | Proibido pré-selecionar opção que adiciona custo, usar "compre agora antes que acabe" sem fundamento, ou criar urgência fabricada. |
| G6 | **Transparência total.** | O cliente vê o preço original, o desconto aplicado e o motivo. Sem descontos escondidos. |
| G7 | **Log obrigatório.** | Toda concessão de desconto é registrada com tipo, valor, beneficiário (canal/cenário, nunca perfil sensível), aprovador e motivo. |
| G8 | **Não discrimina por perfil sensível.** | Descontos podem variar por canal, país, cenário ou programa de fidelidade — nunca por gênero, raça, saúde, religião ou dado protegido. |

---

## 3. Tipos de Incentivo

| Tipo | Natureza | Limite padrão | Contabilização |
|------|----------|---------------|----------------|
| **Pix** | Desconto por meio de pagamento | até −5% do preço bruto | Subtraído do líquido; entra no cálculo de margem. |
| **Cupom** | Desconto por código | variável (ver § 5) | Subtraído do líquido; validado contra margem. |
| **Frete grátis** | Subsídio logístico | custo real do frete | **Tratado como desconto financeiro real.** Entra no total de incentivos. |
| **Cashback** | Crédito futuro | até 5% do pedido | Não reduz preço no checkout; provisionado como passivo. |
| **Bundle** | Desconto por conjunto | até −10% sobre soma | Aplicado sobre o total do bundle, nunca por item isolado. |
| **Programa de fidelidade** | Recompensa recorrente | definido por nível | Regras de nível públicas; nunca discriminam por perfil sensível. |
| **Lote (multi-unidade)** | Desconto por volume | até −15% | Aplicado quando quantidade ≥ limite definido por SKU. |
| **Atacado / B2B** | Desconto por canal | definido por contrato | Contrato formal, preço mínimo = Floor. |
| **Lançamento (Validação)** | Preço de introdução | até o Target do cenário Validação | Não é desconto — é cenário. Aplicado via Price List, não cupom. |
| **Colaboração / parceria** | Desconto institucional | definido por acordo | Acordo registrado; preço mínimo = Floor. |

> **Frete grátis não é "grátis".** Quando a marca cobre o frete, o custo real é subtraído do preço líquido. Se a soma de frete grátis + outros incentivos violar o Floor, a combinação é rejeitada.

---

## 4. Regras de Acumulação

| Combinação | Permitida? | Condição |
|------------|------------|----------|
| Pix + Cupom | Sim, se margem alvo preservada | `validarIncentivos` retorna `acumulavel: true`. |
| Pix + Frete grátis | Sim, se líquido ≥ Floor | Checagem obrigatória. |
| Cupom + Frete grátis | Sim, se líquido ≥ Floor e margem preservada | Checagem obrigatória. |
| Pix + Cupom + Frete grátis | Sim, se líquido ≥ Floor **e** margem ≥ alvo | **Caso mais restrito.** Simular antes de publicar. |
| Dois cupons no mesmo pedido | **Não** | Um cupom por pedido, por padrão. Exceção requer aprovação manual. |
| Cupom sobre item já em promoção (Price List) | **Não** | Preço de Price List já é o aplicado; cupom só sobre preço cheio. |
| Cashback + Pix + Cupom | Sim, se líquido ≥ Floor | Cashback é provisionamento, não reduz líquido. |

### 4.1 Ordem de aplicação

1. Preço Base do Cenário (Price List).
2. Multiplicadores dinâmicos.
3. Incentivos: Pix → Cupom → Frete grátis → Bundle.
4. Validação final: líquido ≥ Floor e margem ≥ alvo (se `acumulavel = true` exigido).

> A ordem importa porque o cupom de percentual aplica-se sobre o bruto pós-multiplicadores, não sobre o Target.

---

## 5. Cupons — Regras Detalhadas

### 5.1 Categorias permitidas

| Categoria | Exemplo | Limite | Duração |
|-----------|---------|--------|---------|
| Lançamento | `LANCAMENTO10` | até 10% | até 30 dias |
| Boas-vindas | `BEMVINDA15` | até 15% | 1ª compra, 7 dias de validade |
| Aniversário marca | `FIO1ANO` | até 20% | janela de campanha real |
| Colaboração | `PARCEIRA10` | até 10% | por acordo |
| Reativação | `VOLTOU10` | até 10% | segmento de inativos, 14 dias |
| Programa fidelidade | `FIEL5` | até 5% | por nível, contínuo |
| Lote | `LOTE15` | até 15% | contínuo, gatilho por quantidade |

### 5.2 Categorias proibidas

| Categoria | Por quê |
|-----------|---------|
| "Última unidade" | Escassez falsa (P2). |
| "Relâmpago 24h" sem fundamento | Urgência fabricada (P2). |
| Discriminação por perfil sensível | Viola P5. |
| Cupom sobre cupom | Exceto aprovação manual explícita. |
| Cupom que derruba abaixo do Floor | Viola P1/G2. |
| Cupom escondido (sem mostrar preço original) | Viola G6. |

### 5.3 Estrutura de cupom

```typescript
interface CupomFioVivo {
  codigo: string
  tipo: 'percentual' | 'valor_fixo' | 'frete_gratis'
  valor: number                 // % ou R$
  cenarioAplicavel: TipoCenario[] // em quais cenários pode aplicar
  skusAplicaveis: string[]       // lista vazia = todos
  canalAplicavel: string[]       // ex.: ['dtc', 'marketplace-x']
  minimoPedido?: number
  quantidadeMaximaUsos?: number
  maximoUsosPorCliente: number   // default 1
  validadeInicio: Date
  validadeFim: Date
  acumulavel: 'nunca' | 'com_pix' | 'com_frete' | 'com_tudo'
  margemMinimaPercent: number    // se margem < isso, cupom não aplica
  aprovador: string
  motivo: string
  ativo: boolean
}
```

### 5.4 Workflow de criação de cupom

1. **Requisição:** canal/parceiro ou equipe de marketing propõe cupom com motivo e público.
2. **Simulação:** motor calcula o pior caso (bruto mínimo esperado − cupom − Pix − frete) e verifica Floor + margem.
3. **Aprovação:**
   - até 10% e sem frete grátis → automática com log;
   - > 10% ou com frete grátis → aprovação manual;
   - > 15% → aprovação manual obrigatória + justificativa de campanha.
4. **Publicação:** cupom criado no Medusa Promotions com `margemMinimaPercent` configurado.
5. **Monitoramento:** taxa de uso, impacto em margem, ROI. Encerra antecipadamente se margem realizada média cair abaixo do alvo.
6. **Auditoria:** todo cupom tem log de criação, usos e encerramento.

---

## 6. Frete Grátis

### 6.1 Quando é permitido

| Situação | Regra |
|----------|-------|
| Campanha institucional | Custo do frete alocado como incentivo; líquido ≥ Floor. |
| Programa de fidelidade | Definido por nível; custo provisionado. |
| Acima de valor de pedido | Gatilho por valor; simular margem antes de publicar. |
| Subsídio logístico do SKU | Já embutido no Custo Completo; não conta como desconto novamente. |

### 6.2 Quando é proibido

- Quando o custo do frete + outros incentivos derrubam o líquido abaixo do Floor.
- Quando mascarado como "grátis" mas embutido no preço (dark pattern).
- Quando condicionado a dado sensível do cliente.

### 6.3 Contabilização

```typescript
interface FreteGratisIncentivo {
  custoReal: number              // R$ do frete coberto
  sku: string
  cenario: TipoCenario
  canal: string
  aprovador: string
  log: LogPreco                  // entra no log de incentivos
}
```

---

## 7. Pix — Regras

| Regra | Valor |
|-------|-------|
| Desconto máximo | 5% do preço bruto pós-multiplicadores |
| Aplicação | Automática, sempre que cliente escolhe Pix |
| Acumulação | Com cupom e/ou frete grátis, se líquido ≥ Floor e margem ≥ alvo |
| Comunicação | Exibida como "desconto Pix" no checkout, com valor transparente |
| Log | Registrado em `LogPreco.incentivos.pix` |

> **Justificativa do limite de 5%:** o Pix reduz custo financeiro (meio de pagamento) — o desconto reflete parte dessa economia repassada ao cliente. Não é desconto de marketing.

---

## 8. Lote / Atacado / B2B

### 8.1 Lote (multi-unidade)

| Parâmetro | Regra |
|-----------|-------|
| Limite mínimo | Definido por SKU (ex.: 3 unidades) |
| Desconto máximo | −15% sobre o bruto |
| Combinação | Pode acumular com Pix, se líquido ≥ Floor |
| Aprovação | Automática com log |

### 8.2 Atacado / B2B

| Parâmetro | Regra |
|-----------|-------|
| Contrato | Formal, com volume mínimo e prazo |
| Preço mínimo | Floor Price (nunca abaixo) |
| Multiplicador de canal | Aplicado conforme cenário B2B |
| Personalização | Permitida, com custo alocado |
| Cupons B2B | Definidos em contrato, não no Promotions público |
| Log | Toda fatura e desconto registrados |

---

## 9. Programa de Fidelidade

### 9.1 Princípios

- Níveis públicos e critérios transparentes.
- Recompensas baseadas em comportamento comercial (compras, indicações), **nunca em perfil sensível**.
- Preço mínimo em qualquer nível = Floor.

### 9.2 Estrutura (exemplo)

| Nível | Critério | Benefício |
|-------|----------|-----------|
| Fio | 1ª compra | Cupom boas-vindas 15% (1 uso, 7 dias) |
| Trama | 3 compras | Cashback 3% + frete grátis em pedidos ≥ R$ 300 |
| Nó | 10 compras | Cashback 5% + acesso antecipado a lançamentos |
| Artifício | 20 compras + indicação | Cashback 5% + edição limitada com prioridade |

> Cashback é provisionamento, não desconto de checkout. Não reduz o líquido — portanto nunca viola o Floor diretamente. Ainda assim, o custo é contabilizado no Custo Esperado de Troca/Devolução ou em conta de passivo.

---

## 10. Janelas e Limites Temporais

| Tipo de incentivo | Duração máxima | Renovação |
|------------------|----------------|-----------|
| Cupom de lançamento | 30 dias | Não renova automaticamente |
| Cupom boas-vindas | 7 dias de validade após emissão | Por cliente, 1 vez |
| Cupom de campanha | Janela de campanha real (máx 21 dias) | Requer nova aprovação |
| Frete grátis por valor | Contínuo se margem saudável | Revisão trimestral |
| Pix | Contínuo | Revisão trimestral |
| Lote | Contínuo | Revisão semestral |
| Atacado | Por contrato | Por contrato |

> **Proibido:** cronômetro regressivo artificial sem correspondência real. Se a campanha termina em 7 dias, o cronômetro é legítimo. Se o cronômetro reinicia a cada visita, é dark pattern (P2).

---

## 11. Aprovações

### 11.1 Matriz de aprovação

| Cenário | Aprovação |
|---------|-----------|
| Pix (≤ 5%) | Automática |
| Cupom ≤ 10%, sem frete grátis | Automática com log |
| Cupom > 10% ou com frete grátis | Manual |
| Cupom > 15% | Manual + justificativa de campanha |
| Frete grátis isolado | Automática se líquido ≥ Floor |
| Frete grátis + cupom | Manual |
| Bundle > 10% | Manual |
| Atacado / B2B | Manual (contrato) |
| Colaboração | Manual (acordo) |
| Reajuste > 25% sobre Target (preço, não desconto) | Manual (ver estratégia § 5.1) |

### 11.2 Log de aprovação

Toda aprovação manual registra:

- timestamp;
- tipo de incentivo;
- valor;
- SKU(s) e cenário;
- canal;
- margem projetada;
- aprovador (id);
- justificativa;
- validade.

### 11.3 Revogação

Um incentivo pode ser revogado antecipadamente se:

- margem realizada média cair abaixo do alvo;
- uso real superar o esperado em 200%;
- houver evidência de abuso (ex.: múltiplas contas, fraude);
- o contexto comercial mudar (ex.: custo subiu, Floor recalculado).

Revogação é comunicada transparentemente: "Esta campanha foi encerrada antes do previsto. Veja o motivo."

---

## 12. Integração com Medusa v2

| Camada | Uso |
|--------|-----|
| **Promotions** | Cupons, Pix (como promoção de meio de pagamento), frete grátis, bundles. |
| **Custom fields em Promotion** | `margemMinimaPercent`, `acumulavel`, `cenarioAplicavel`, `canalAplicavel`. |
| **Price Lists** | Cenários (Validação/Recomendado/Premium) — não confundir com cupom. |
| **Regions** | Frete grátis por região, moeda, impostos. |
| **Subscribers** | Validação de Floor ao criar Promotion; log de uso; revogação automática. |
| **Workflows** | Simulação de pior caso antes de publicar cupom. |

> **Princípio:** usar Promotions nativo do Medusa sempre que possível. Customização só para `margemMinimaPercent`, validação de Floor, e regras de acumulação não nativas.

---

## 13. Telemetria de Descontos

Métricas mínimas:

- `fio.desconto.cupom.usos` (counter por cupom)
- `fio.desconto.pix.usos` (counter)
- `fio.desconto.frete_gratis.usos` (counter)
- `fio.desconto.margem_media_realizada` (gauge por campanha)
- `fio.desconto.revogado` (counter)
- `fio.desconto.floor_violado_rejeitado` (counter)
- `fio.desconto.aprovacao_manual` (counter)

---

## 14. Anti-padrões (proibidos)

| Anti-padrão | Por quê |
|-------------|---------|
| "Faltam apenas 2 unidades!" sem estoque real verificável | Escassez falsa (P2). |
| Cronômetro que reinicia a cada visita | Urgência fabricada (P2). |
| Cupom "exclusivo para você" baseado em perfil sensível | Discriminação (P5). |
| Frete grátis com preço inflado para compensar | Dark pattern (G5/G6). |
| Cupom que derruba abaixo do Floor | Viola P1/G2. |
| Dois cupons sobrepostos sem aprovação | Viola § 4. |
| Esconder preço original ao aplicar desconto | Viola G6. |
| Cupom "por tempo limitado" sem limite real | Viola P2/G4. |

---

## 15. Referências

- [`pricing-strategy.md`](./pricing-strategy.md) — estratégia e fórmulas.
- [`pricing-engine-spec.md`](./pricing-engine-spec.md) — especificação técnica do motor.
- [`pricing-examples.md`](./pricing-examples.md) — exemplos numéricos com incentivos.
- Documentação Medusa v2: Promotions, Price Lists, Regions, Subscribers.