# 07.1 — Analytics Architecture & Event Taxonomy

**Data:** 2026-08-05
**Escopo:** Analytics, North Star, métricas, eventos, tracking

---

## 1. North Star Metric

### 1.1 Definição

> **Peças Sustentavelmente Entregues com Experiência Positiva (PSEEP)**

= número de peças Fio Vivo entregues × fator de experiência positiva (NPS ≥ 9 ou avaliação 5★ verificada ou recompra confirmada)

### 1.2 Racional

Esta métrica une:
- **Valor ao cliente:** experiência positiva (NPS, review, recompra)
- **Sustentabilidade artesanal:** peças efetivamente entregues (não só vendidas)
- **Saúde do negócio:** combina volume + qualidade + retenção

### 1.3 Fórmula

```
PSEEP = Σ (peças_entregues × [1 + 0.3 × (NPS_promoter - NPS_detractor)])
```

Onde:
- `peças_entregues`: pedidos com status `fulfilled` + `delivered`
- `NPS_promoter`: % NPS 9-10
- `NPS_detractor`: % NPS 0-6
- Se NPS não coletado: fator = 1.0 (neutro)

### 1.4 Meta inicial

| Período | Meta PSEEP/mês |
|---|---|
| Mês 1-3 | 10 |
| Mês 4-6 | 30 |
| Mês 7-12 | 80 |
| Ano 2 | 200+ |

---

## 2. Árvore de métricas

### 2.1 Aquisição

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| Visitas | Usuários únicos /home | GA4 unique users | GA4 | Diária | 5k/mês | Growth |
| Origem | Distribuição por source | UTM / referer | GA4 | Semanal | — | Growth |
| CAC | Custo de aquisição | Spend / novos clientes | Ads + Medusa | Mensal | R$ 80 | Growth |
| CTR | Click-through rate | Clicks / impressions | GA4 | Diária | 2% | Growth |
| Custo por visita qualificada | Spend / visitas qualificadas | Spend / (visitas com >2 PDP views) | GA4 + Ads | Semanal | R$ 3 | Growth |

### 2.2 Ativação

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| PDP View Rate | % visitantes que veem PDP | PDP views / home views | GA4 | Diária | 20% | Product |
| Save Rate | % que salvam peça | saves / PDP views | GA4 | Diária | 5% | Product |
| Add-to-Cart Rate | % que adicionam ao carrinho | ATC / PDP views | GA4 | Diária | 10% | Product |
| Personalization Start Rate | % que iniciam personalização | personalization_started / PDP views | GA4 | Diária | 8% | Product |
| Waitlist Join Rate | % que entram em lista de espera | waitlist_joined / PDP views (oos) | GA4 | Diária | 15% | Product |
| TTFV | Time to first value | Tempo até interação com galeria | GA4 | Diária | <30s | Product |
| Activation Rate | % que atingem ativação | activated / visitors | GA4 | Semanal | 15% | Product |

### 2.3 Conversão

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| Checkout Start Rate | % que iniciam checkout | checkout_started / carts | GA4 | Diária | 50% | Product |
| Checkout Completion | % que completam checkout | orders / checkout_started | GA4 + Medusa | Diária | 60% | Product |
| Payment Approval | % pagamentos aprovados | approved / attempted | Stripe/Provider | Diária | 90% | Product |
| Conversion Rate | % PDP views que compram | orders / PDP views | GA4 | Diária | 3% | Product |
| Revenue per Session | Receita / sessões | GMV / sessions | GA4 | Diária | R$ 15 | Product |

### 2.4 Receita

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| GMV | Gross merchandise value | Σ order total | Medusa | Diária | R$ 30k/mês | Finance |
| Receita líquida | GMV - taxas - impostos | GMV × (1 - fees - tax) | Medusa + accounting | Mensal | R$ 22k/mês | Finance |
| Ticket médio (AOV) | GMV / orders | GMV / orders | Medusa | Diária | R$ 700 | Product |
| ARPU | Receita / customers ativos | Receita / customers | Medusa | Mensal | R$ 800 | Product |
| Attach Rate | % orders com add-on | orders_with_addon / orders | Medusa | Semanal | 20% | Product |
| Receita de personalização | Σ personalization revenue | Σ personalization fees | Medusa | Mensal | R$ 3k | Product |
| Receita por coleção | GMV por collection | Σ por collection | Medusa | Mensal | — | Product |

### 2.5 Margem

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| Margem bruta | (Receita - COGS) / Receita | (Rev - COGS) / Rev | Accounting | Mensal | 55% | Finance |
| Margem de contribuição | (Rev - variable costs) / Rev | (Rev - var costs) / Rev | Accounting | Mensal | 25% | Finance |
| Custo por peça | COGS / peças | COGS / units | Accounting | Por peça | — | Finance |
| Mão de obra por peça | Labor cost / peças | Labor / units | Accounting | Por peça | — | Finance |
| Desconto efetivo | % desconto real | (list - final) / list | Medusa + promotions | Mensal | <8% | Product |
| Custo de frete subsidiado | Frete grátis concedido | Σ free shipping cost | Medusa | Mensal | <R$ 1k | Finance |

### 2.6 Retenção

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| Recompra | % que compram 2ª vez | 2nd orders / 1st orders | Medusa | Trimestral | 15% | Product |
| Tempo até 2ª compra | Dias médios | avg(days between orders) | Medusa | Trimestral | 120d | Product |
| LTV | Lifetime value | avg order × frequency × lifespan | Medusa | Trimestral | R$ 2.5k | Finance |
| Referral Rate | % que indicam | referrals / customers | Medusa + affiliate | Mensal | 10% | Growth |
| Repeat Revenue | % receita de repeat | repeat_rev / total_rev | Medusa | Mensal | 25% | Product |

### 2.7 Operação

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| Capacidade | Peças produzíveis/mês | production capacity | fio-vivo-catalog | Mensal | — | Ops |
| Ocupação | % capacidade vendida | sold / capacity | Medusa + catalog | Mensal | 70% | Ops |
| Lead time | Dias médios produção | avg(production days) | Medusa fulfillment | Mensal | 14d | Ops |
| Atraso | % pedidos atrasados | late / total | Medusa | Mensal | <5% | Ops |
| Retrabalho | % retrabalho | rework / total | Ops tracking | Mensal | <3% | Ops |
| Devolução | % devoluções | returns / orders | Medusa | Mensal | <5% | Product |
| Horas reais vs estimadas | Ratio | actual_hours / estimated | fio-vivo-catalog | Mensal | ±10% | Ops |

### 2.8 Confiança

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| NPS | Net Promoter Score | %promoters - %detractors | Survey | Trimestral | 50 | Product |
| CSAT | Customer Satisfaction | avg(csat score) | Survey | Pós-compra | 4.5/5 | Product |
| CES | Customer Effort Score | avg(ces score) | Survey | Pós-suporte | 4/5 | Product |
| Taxa de disputa | % chargebacks | disputes / orders | Stripe | Mensal | <2% | Finance |
| Taxa de devolução | % returns | returns / orders | Medusa | Mensal | <5% | Product |
| Dúvidas pré-compra | Conversas WhatsApp | WA conversations | WhatsApp | Diária | — | Product |

### 2.9 Precificação

| Métrica | Definição | Fórmula | Fonte | Frequência | Meta M3 | Owner |
|---|---|---|---|---|---|---|
| Price Realization | Preço final / preço listado | final / list | pricing-engine | Mensal | 92% | Product |
| Markdown Rate | % desconto | (list - final) / list | pricing-engine | Mensal | <8% | Product |
| Elasticidade | Δ volume / Δ preço | regression | Experiment | Trimestral | — | Product |
| Conversão por cenário | CVR por validação/recomendado/premium | orders / views per scenario | pricing-engine | Mensal | — | Product |
| Margem por cenário | Margem média por cenário | avg margin per scenario | pricing-engine | Mensal | — | Finance |
| Demanda por capacidade | Índice de demanda | (paid+reservas+consultas) / capacity | pricing-engine | Semanal | 0.7-1.5 | Product |
| Receita perdida por indisponibilidade | GMV perdido por OOS | est lost sales | Medusa + catalog | Mensal | — | Product |

---

## 3. Event Taxonomy

### 3.1 Eventos P0 (implementar primeiro)

| Event name | Description | Trigger | Required properties | Optional | PII | Destination | Retention | Owner | Validation |
|---|---|---|---|---|---|---|---|---|---|
| `product_list_viewed` | Lista de produtos visualizada | Collection page load | collection_id, product_ids[], index | — | Não | GA4 | 14m | Analytics | Verificar list view |
| `product_viewed` | PDP visualizada | PDP load | product_id, handle, price, availability | variant_id, scenario | Não | GA4 | 14m | Analytics | Verificar PDP load |
| `product_media_viewed` | Imagem da galeria visualizada | Scene rail click | product_id, scene_id, index | — | Não | GA4 | 14m | Product | Verificar scene click |
| `product_video_played` | Vídeo de produto tocado | Video play | product_id, video_id | duration | Não | GA4 | 14m | Product | Verificar video play |
| `product_dimensions_viewed` | Dimensões visualizadas | Dimensions tab/accordion | product_id | — | Não | GA4 | 14m | Product | Verificar tab open |
| `product_saved` | Peça salva | Save button | product_id | collection | Não | GA4 + CDP | 24m | Product | Verificar save |
| `collection_viewed` | Coleção visualizada | Collection page | collection_id, product_ids[] | — | Não | GA4 | 14m | Analytics | Verificar collection |
| `product_added_to_cart` | Adicionado ao carrinho | Add to cart | product_id, variant_id, quantity, price | scenario | Não | GA4 + Medusa | 24m | Product | Verificar cart update |
| `product_removed_from_cart` | Removido do carrinho | Remove from cart | product_id, variant_id, quantity | — | Não | GA4 | 14m | Product | Verificar cart update |
| `cart_viewed` | Carrinho visualizado | Cart page | cart_id, line_items[] | — | Não | GA4 | 14m | Product | Verificar cart view |
| `checkout_started` | Checkout iniciado | Checkout page load | cart_id, total, items_count | coupon_code | Não | GA4 | 24m | Product | Verificar checkout load |
| `shipping_calculated` | Frete calculado | Shipping calc | cart_id, shipping_method, cost | country | Não | GA4 | 14m | Product | Verificar shipping |
| `payment_method_selected` | Método de pagamento selecionado | Payment select | cart_id, payment_method | — | Não | GA4 | 14m | Product | Verificar payment select |
| `coupon_applied` | Cupom aplicado | Coupon apply | coupon_code, cart_id, discount | — | Não | GA4 + Medusa | 24m | Product | Verificar coupon |
| `coupon_rejected` | Cupom rejeitado | Coupon reject | coupon_code, cart_id, reason | — | Não | GA4 | 14m | Product | Verificar reject |
| `order_completed` | Pedido completado | Order success | order_id, total, payment_method, items[] | coupon, scenario | Não | GA4 + Medusa | 36m | Product | Verificar order |
| `order_failed` | Pedido falhou | Payment failure | cart_id, payment_method, reason | — | Não | GA4 | 14m | Product | Verificar failure |

### 3.2 Eventos P1

| Event name | Trigger | Required | Owner |
|---|---|---|---|
| `style_quiz_started` | Quiz início | — | Product |
| `style_quiz_completed` | Quiz fim | result, recommendations[] | Product |
| `personalization_started` | Personalização início | product_id | Product |
| `personalization_completed` | Personalização fim | product_id, options[], price_delta | Product |
| `waitlist_joined` | Lista de espera | product_id, email | Product |
| `availability_alert_requested` | Alerta de disponibilidade | product_id, email | Product |
| `review_requested` | Pedido de review enviado | order_id, product_id | Product |
| `review_submitted` | Review enviada | product_id, rating, verified | Product |
| `referral_shared` | Indicação compartilhada | referral_code, channel | Growth |
| `referral_converted` | Indicação converteu | referral_code, order_id | Growth |
| `drop_viewed` | Drop visualizado | drop_id, product_ids[] | Product |
| `drop_reserved` | Drop reservado | drop_id, product_id, deposit | Product |
| `gift_option_added` | Opção de presente adicionada | cart_id, gift_type | Product |
| `bundle_added` | Bundle adicionado | bundle_id, items[] | Product |
| `international_shipping_viewed` | Frete internacional visto | cart_id, country | Product |
| `currency_changed` | Moeda alterada | from, to | Product |
| `price_scenario_exposed` | Cenário de preço exibido | product_id, scenario | Product |

### 3.3 PII classification

| Event | PII? | Campos sensíveis |
|---|---|---|
| product_viewed | Não | — |
| waitlist_joined | Sim | email |
| review_submitted | Não (se anonymous) | — |
| referral_shared | Não (referral code, não email) | — |
| order_completed | Não (order_id, não PII) | — |

> Para eventos com PII (email), usar hashing ou storage no CDP com consentimento.

---

## 4. Dashboards

| Dashboard | Métricas-chave | Owner | Frequência review |
|---|---|---|---|
| Growth | Visitas, CAC, CTR, Activation Rate, Conversion | Growth | Semanal |
| Product | PDP views, ATC, CVR, TTFV, AOV | Product | Diária |
| Revenue | GMV, Receita líquida, AOV, ARPU, Attach | Finance | Diária |
| Margin | Margem bruta, contribuição, desconto efetivo | Finance | Mensal |
| Retention | Recompra, LTV, Referral, Repeat Revenue | Product | Trimestral |
| Ops | Capacidade, ocupação, lead time, atraso | Ops | Semanal |
| Trust | NPS, CSAT, disputa, devolução | Product | Trimestral |
| Pricing | Realization, markdown, demanda, cenários | Product | Mensal |
| Executive | North Star, GMV, Margem, NPS | CPO | Mensal |

---

## 5. Alertas

| Alerta | Condição | Canal | Owner |
|---|---|---|---|
| CVR caiu | CVR < 1% por 3 dias | Slack/email | Product |
| Payment failure spike | failure rate > 15% | Slack | Product |
| Lead time acima | lead_time > 21 dias | Email | Ops |
| Stock out | inventory = 0 para produto ativo | Email | Ops |
| Demanda muito alta | demand_index > 2.0 | Email | Product |
| Margem negativa | contribution_margin < 0 | Slack/email | Finance |
| NPS detractor | NPS < 30 | Email | Product |

---

*Fim do analytics-architecture.md*