# 04.1 — GTM Strategy

**Data:** 2026-08-05
**Escopo:** Go-to-Market Fio Vivo — descoberta, ativação, conversão, recompra, indicação

---

## 1. Diagnóstico estratégico

### 1.1 Onde a Fio Vivo está hoje

| Dimensão | Estado | Evidência |
|---|---|---|
| Produto físico | ✅ 6 peças com 4 imagens cada | `public/images/fio-vivo/` |
| Metadados comerciais | ❌ 100% "a informar" | `fio-vivo-products.ts` |
| Storefront | 🟡 Gallery hero funcional; PDP existe; checkout existe | BB-04 R1 verified |
| Backend | ❌ Sem produtos Fio Vivo, sem região BR | `initial-data-seed.ts` |
| Pagamentos | ❌ Sem Pix | `constants.tsx` |
| Audiência | ❌ Zero construída | Sem analytics, sem CRM |
| Prova social | ❌ Inexistente | — |
| Marca | 🟡 Nomes autorais + contexto visual Copper/Umber/Linen | Contrato nos-gallery |

### 1.2 Premissas estratégicas

| # | Premissa | Tipo |
|---|---|---|
| 1 | Fio Vivo é marca autoral de crochê premium | Hipótese (nomes autorais corroboram) |
| 2 | Produção é limitada por capacidade artesanal | Hipótese (não confirmada) |
| 3 | Há demanda por peças autorais brasileiras | Hipótese |
| 4 | Cliente paga por exclusividade e história | Hipótese |
| 5 | Instagram é canal primário de descoberta | Inferência (artesanato visual) |
| 6 | Prova social é crítica para conversão | Inferência (ticket alto, marca desconhecida) |

---

## 2. Posicionamento

### 2.1 Statement de posicionamento

> **Fio Vivo é crochê autoral contemporâneo.** Cada peça é uma escultura têxtil única, feita à mão em pequena escala, com materiais escolhidos e tempo de produção declarados. Não é moda rápida, não é acessório genérico — é objeto de design com história, numerado quando a edição é limitada.

### 2.2 Diferenciais competitivos

| Diferencial | Evidência | Como comunicar |
|---|---|---|
| Autoria | Nomes autorais (Espiral dourada, Órbita negra) | Assinatura da artesã na peça e no conteúdo |
| Pequena escala | Produção artesanal limitada | Capacidade declarada, lista de espera genuína |
| Transparência | Materiais, dimensões, tempo de produção | Tabela técnica na PDP, não marketing vago |
| Exclusividade | Peças numeradas quando aplicável | Certificado da peça |
| Processo visível | Bastidores da produção | Vídeo, foto de processo, storytelling |
| Made-to-order | Sob encomenda com prazo real | Prazo visível acima da dobra |

### 2.3 Categoria competitiva

Fio Vivo não compete com bolsas fast-fashion. Categorias de referência:
- **Craft design premium** (cerâmica, tecelagem autoral, marcenaria)
- **Moda autoral brasileira** (marcas como Osklen, Farm no segmento de design, não de volume)
- **Objeto de coleção** (edições limitadas, peças numeradas)

> **Não competir em preço.** Competir em autoria, tempo e exclusividade.

---

## 3. Canais de aquisição (priorizados)

| Canal | Prioridade | Esforço | Impacto esperado | Hipótese |
|---|---|---|---|---|
| **Instagram** | P0 | Médio | Alto | Descoberta visual primária para artesanato |
| **Pinterest** | P0 | Médio | Alto | Busca intencional por bolsas artesanais, looks |
| **WhatsApp** | P0 | Baixo | Alto | Canal de confiança BR, atendimento, fechamento |
| **SEO** | P1 | Alto | Médio (longo prazo) | "bolsa crochê artesanal", "bolsa feita à mão" |
| **E-mail** | P1 | Médio | Médio | Lifecycle, lista VIP, drops |
| **TikTok** | P1 | Médio | Alto se viralizar | Vídeo de processo tem alto potencial |
| **Google Shopping** | P2 | Médio | Médio | Intent alto, mas ticket alto pode limitar CTR |
| **Influenciadores** | P2 | Médio | Alto se alinhados | Selecione criadores de moda autoral |
| **Afiliados** | P2 | Baixo | Médio | Programa de indicação controlado |
| **Eventos/Pop-ups** | P3 | Alto | Médio | Experiência física para colecionadoras |
| **Marketplaces** | P3 | Médio | Baixo | Dilui margem e exclusividade; só seletivos |
| **B2B** | P3 | Alto | Médio | Presentes corporativos em pequenos lotes |

### 3.1 Estratégia por canal

#### Instagram (P0)
- Perfis: @fiovivo (marca) + conteúdo de bastidores
- Formatos: Reels de processo (alto shareability), carrossel de produto, Stories de dia-a-dia
- Frequência: 5×/semana
- KPI: alcance → saves → DMs → link clicks → PDP views
- Hipótese: Reels de processo geram 3× mais saves que carrossel de produto

#### Pinterest (P0)
- Boards: "Bolsas artesanais", "Crochê contemporâneo", "Looks com crochê"
- Pins: cada peça com link direto para PDP
- Frequência: 3 pins/semana + re-pin
- KPI: impressions → saves → click-throughs
- Hipótese: Pinterest tem ciclo longo mas traz tráfego qualificado de alta intenção

#### WhatsApp (P0)
- Número de negócios + catálogo WhatsApp Business
- Uso: atendimento, encomendas, dúvidas de prazo, fechamento
- Lista de transmissão: drops, novidades (com consentimento)
- KPI: conversas iniciadas → pedidos fechados via WhatsApp
- Hipótese: 30% das vendas de ticket alto fecham no WhatsApp

---

## 4. Funil de aquisição

```text
Awareness (Instagram/Pinterest/TikTok)
  → Discovery (site visit /home)
    → Collection view (/collections)
      → Product view (/products/[handle])
        → Gallery interaction (scene rail, ambient)
          → Dimension/prazo check
            → Add to cart
              → Checkout start
                → Payment
                  → Post-purchase
                    → Review request
                      → Referral
```

### 4.1 Métricas por etapa (baseline = zero; metas iniciais)

| Etapa | Evento | Métrica | Meta M1 | Meta M3 |
|---|---|---|---|---|
| Awareness | — | Alcance Instagram | 10k/mês | 50k/mês |
| Discovery | `product_list_viewed` | Visitas /home | 1k/mês | 5k/mês |
| Collection | `collection_viewed` | Collection views | 300/mês | 1.5k/mês |
| Product | `product_viewed` | PDP views | 200/mês | 1k/mês |
| Gallery | `product_media_viewed` | Scene interactions | 100/mês | 500/mês |
| Dimensions | `product_dimensions_viewed` | Dimension checks | 80/mês | 400/mês |
| Cart | `product_added_to_cart` | Add-to-cart rate | 8% PDP views | 12% |
| Checkout | `checkout_started` | Checkout start rate | 50% carts | 60% |
| Payment | `order_completed` | Conversion rate | 1.5% PDP views | 3% |
| Review | `review_submitted` | Review rate | 20% compradores | 35% |
| Referral | `referral_shared` | Referral rate | 5% compradores | 10% |

---

## 5. Estratégia de ativação

### 5.1 Evento de ativação principal

**Definição:** `product_viewed` + interação com galeria (scene rail click ou ambient hover)

> Racional: demonstra intenção real — não só bounce. Usuário que vê produto e interage com a galeria está em modo de avaliação, não de curioso passivo.

### 5.2 Time to First Value (TTFV)

| Caminho | TTFV alvo |
|---|---|
| Visitante → ver produto completo com preço/prazo | < 30 segundos |
| Visitante → salvar peça | < 2 minutos |
| Visitante → iniciar checkout | < 5 minutos |
| Visitante → falar no WhatsApp | < 3 minutos |

### 5.3 Redução de TTFV

| Alavanca | Implementação |
|---|---|
| Quiz de estilo | 3 perguntas → recomendação de peça (reduz paralisia) |
| Filtro por ocasião | "Presente", "Para mim", "Colecionar" |
| Filtro por faixa de preço | Confronta com realidade orçamentária cedo |
| Visualização no corpo | 03-gesto como hero secundário |
| Vídeo curto | 15s de processo na PDP |
| Dimensões claras | Tabela visual com objeto de referência |
| Prazo visível | Acima da dobra, não em FAQ |
| Pix e parcelamento visíveis | Badge na PDP |
| Atendimento contextual | WhatsApp flutuante na PDP |
| Lista de espera em 1 passo | Email + consentimento, sem formulário longo |

### 5.4 Onboarding progressivo

| Etapa | Dado coletado | Quando |
|---|---|---|
| Visitante anônimo | Nada | — |
| Visualizou 2+ produtos | Preferência de estilo (inferida) | Implícito |
| Iniciou checkout | Email | Checkout |
| Comprou | Nome, telefone, endereço | Checkout |
| Pós-compra | Avaliação, foto | Email +15d |
| 2ª compra | Gosto por coleção | Implícito |
| Lista VIP | Consentimento de drops | Checkbox |

---

## 6. Estratégia de conteúdo

### 6.1 Pilares de conteúdo

| Pilar | Formato | Frequência | Objetivo |
|---|---|---|---|
| Produto | Carrossel, foto editorial | 3×/semana | Descoberta |
| Processo | Reels, behind-the-scenes | 2×/semana | Confiança |
| Artesã | Storytelling, entrevista | 1×/semana | Conexão |
| Matéria | Close-up textura, fio | 1×/semana | Qualidade |
| Tempo | Timelapse produção | 1×/mês | Valor |
| Uso no corpo | Foto de estilo | 2×/semana | Desejo |
| Cuidados | Guia, carrossel | 1×/mês | Retenção |
| Presentes | Gift guide | Sazonal | Aquisição |
| Drops | Teaser + reveal | Por drop | Escassez legítima |
| Clientes | UGC, repost | 2×/mês | Prova social |

### 6.2 SEO

| Tipo | Exemplo | Volume esperado |
|---|---|---|
| Produto | "bolsa crochê artesanal" | Baixo-médio |
| Categoria | "bolsa feita à mão" | Médio |
| Long-tail | "bolsa crochê terracota" | Baixo, alta intenção |
| Marca | "fio vivo bolsas" | Zero → cresce |
| Educativo | "como cuidar de bolsa de crochê" | Baixo, qualifica audiência |

> Priorizar long-tail de alta intenção sobre volume genérico.

---

## 7. Campanhas sazonais

| Período | Campanha | Oferta | Produto |
|---|---|---|---|
| Fev | Valentine's BR | Presente + embalagem | Qualquer |
| Mar | Dia das Mães BR | Drop especial + lista VIP antecipada | Premium |
| Jun | Dia dos Namorados BR | Presente + cartão personalizado | Qualquer |
| Ago | Dia dos Pais BR | Peças mais estruturadas | Selecionadas |
| Out | Black Friday | Conditions controladas (não guerra de desconto) | Todos |
| Nov | Natal BR | Embalagem presente + prazo realçado | Todos |
| Dez | Réveillon | Drop de ano novo | Premium |

> **Regra:** nenhuma campanha usa cronômetro artificial ou escassez falsa. Ofertas sazonais refletem capacidade produtiva real.

---

## 8. Creator/Affiliate program

| Elemento | Especificação |
|---|---|
| Estrutura | Afiliado com comissão fixa (não MLP) |
| Comissão | 8-12% (configurável por afiliado) |
| Cookie | 30 dias |
| Atribuição | Last-click + código de cupom único |
| Requisito | Aprovação manual; alinhamento de marca |
| Payout | Mensal via Pix/transferência |
| Kit | 3 peças para conteúdo + guidelines de marca |
| Métrica | GMV atribuído, CTR, conteúdo gerado |
| Guardrail | Não usar "última peça" se não for verdade |

---

## 9. Experimentation backlog (priorizado)

| # | Hipótese | Segmento | Mudança | Métrica primária | Esforço | ICE |
|---|---|---|---|---|---|---|
| 1 | Preço/prazo acima da dobra aumenta add-to-cart | PDP | Mover preço+prazo para above-fold | Add-to-cart rate | Baixo | 9.0 |
| 2 | Vídeo de processo na PDP aumenta TTFV | PDP | Adicionar 15s vídeo | TTFV | Baixo | 8.5 |
| 3 | Quiz de estilo reduz bounce | Home | Quiz 3 perguntas | Scroll depth | Médio | 7.5 |
| 4 | WhatsApp flutuante aumenta conversão | PDP | Botão WA flutuante | Checkout start | Baixo | 8.0 |
| 5 | Prova social (avaliação verificada) eleva confiança | PDP | Review widget | Conversion rate | Médio | 8.0 |
| 6 | Lista VIP com acesso antecipado gera drops | Email | Landing page VIP | Waitlist join | Baixo | 7.0 |
| 7 | Parcelamento visível reduz drop-off | PDP | Badge parcelamento | Add-to-cart | Baixo | 7.5 |
| 8 | Personalização inicia com cor | PDP | Color picker | Personalization start | Médio | 7.0 |
| 9 | Frete grátis acima de R$ X aumenta AOV | Cart | Threshold | AOV | Médio | 6.5 |
| 10 | Bundle (bolsa + nécessaire) eleva attach | PDP | Bundle offer | Attach rate | Médio | 6.0 |

---

## 10. Guardrails

| Guardrail | Limite |
|---|---|
| Desconto promocional acumulado | Limitado pela margem |
| Pix discount | Máx 5% |
| Cupom acumulável | Não se comprometer margem |
| Frequência email | Máx 2/semana por segmento |
| Frequência WhatsApp | Máx 1/semana com consentimento |
| Pressão comercial | Supressão se unsubscribe > 2% |
| Desconto below floor | Proibido salvo ação administrativa classificada |

---

*Fim do gtm-strategy.md*