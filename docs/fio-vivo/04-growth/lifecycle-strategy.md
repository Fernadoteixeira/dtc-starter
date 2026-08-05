# 04.2 — Lifecycle & Retention Strategy

**Data:** 2026-08-05
**Escopo:** Loops de engajamento, retenção, reativação, frequência

---

## 1. Loops de engajamento

### 1.1 Loop de coleção

```text
Nova coleção anunciada (Instagram/Pinterest)
  → DESCOBERTA: usuária acessa página de coleção
    → SALVAMENTO: usuária salva peça que gostou
      → LISTA VIP: usuária entra em lista para acesso antecipado
        → ACESSO ANTECIPADO: usuária compra antes do público
          → CONTEÚDO DA PEÇA: usuária compartilha/revisa
            → INTERESSE NO PRÓXIMO DROP: notificações de próximo drop
              → (loop reinicia)
```

| Etapa | Evento | Métrica | Owner |
|---|---|---|---|
| Descoberta | `collection_viewed` | Collection views | Growth |
| Salvamento | `product_saved` | Save rate | Product |
| Lista VIP | `waitlist_joined` | VIP join rate | Product |
| Acesso antecipado | `drop_reserved` | Reservation rate | Product |
| Compra | `order_completed` | CVR VIP | Product |
| Conteúdo | `review_submitted` | Review rate | Product |
| Próximo drop | `drop_viewed` | Return rate | Growth |

### 1.2 Loop de bastidores

```text
Processo artesanal publicado (Reel/Stories)
  → VALORIZAÇÃO DO TRABALHO: audiência vê tempo/esforço
    → CONFIANÇA: audiência entende valor do preço
      → COMPRA: audiência converte
        → ACOMPANHAMENTO: compradora recebe updates da sua peça sendo feita
          → COMPARTILHAMENTO: compradora posta/fala sobre
            → AQUISIÇÃO ORGÂNICA: audiência da compradora descobre
              → (loop reinicia)
```

| Etapa | Evento | Métrica | Owner |
|---|---|---|---|
| Publicação | — | Reel views | Growth |
| Valoração | `product_video_played` | Video play rate | Product |
| Compra | `order_completed` | CVR pós-vídeo | Product |
| Acompanhamento | — | Order update open rate | Lifecycle |
| Compartilhamento | `referral_shared` | Share rate | Growth |
| Aquisição orgânica | `product_viewed` (referral) | Organic CVR | Growth |

### 1.3 Loop de personalização

```text
Escolha de cores (PDP ou quiz)
  → PREVIEW: usuária vê preview da combinação
    → ORÇAMENTO: usuária solicita orçamento
      → SINAL: usuária paga sinal para reservar
        → PRODUÇÃO: peça é feita (updates enviados)
          → ENTREGA: peça entregue
            → PROVA SOCIAL: usuária posta/foto
              → NOVAS ENCOMENDAS: audiência vê e encomenda
                → (loop reinicia)
```

| Etapa | Evento | Métrica | Owner |
|---|---|---|---|
| Escolha | `personalization_started` | Personalization start rate | Product |
| Preview | — | Preview completion | Product |
| Orçamento | — | Quote requests | Product |
| Sinal | `drop_reserved` | Deposit rate | Product |
| Produção | — | Production updates sent | Lifecycle |
| Entrega | `order_completed` (custom) | Custom delivery rate | Ops |
| Prova social | `review_submitted` | Custom review rate | Product |
| Novas encomendas | `personalization_started` (referral) | Referral personalization | Growth |

### 1.4 Loop de raridade e colecionismo

```text
Peça numerada anunciada
  → REGISTRO: compradora recebe certificado de autenticidade
    → HISTÓRIA: compradora conhece história da peça/série
      → COLEÇÃO: compradora quer peças da mesma coleção
        → ACESSO ANTECIPADO: compradora entra em VIP para próximas séries
          → RECOMPRA: compradora compra próxima peça numerada
            → (loop reinicia)
```

### 1.5 Loop de indicação

```text
Compra completada
  → ENTREGA MEMORÁVEL: embalagem + certificado + carta
    → PEDIDO DE AVALIAÇÃO: e-mail pós-entrega
      → CONTEÚDO COMPARTILHÁVEL: compradora recebe foto profissional para postar
        → INDICAÇÃO: compradora usa código de amigo
          → BENEFÍCIO CONTROLADO: amiga ganha cupom, compradora ganha crédito
            → NOVA COMPRA: amiga compra
              → (loop reinicia)
```

| Etapa | Evento | Métrica | Owner |
|---|---|---|---|
| Entrega | `order_completed` | Delivery rate | Ops |
| Avaliação | `review_requested` → `review_submitted` | Review conversion | Product |
| Compartilhamento | `referral_shared` | Share rate | Growth |
| Indicação | `referral_converted` | Referral CVR | Growth |
| Nova compra | `order_completed` (referral) | Referral revenue | Growth |

---

## 2. Frequência natural de uso

| Momento | Frequência natural | Canal ideal |
|---|---|---|
| Descoberta de novos produtos | Mensal (drops) | Instagram, e-mail |
| Browse de coleções | Semanal a quinzenal | Instagram, site |
| Avaliação de peça específica | Por intenção de compra | Site, WhatsApp |
| Acompanhamento de encomenda | Durante produção | WhatsApp, e-mail |
| Pós-compra (review) | Pós-entrega (+15d) | E-mail, WhatsApp |
| Recompra | Trimestral a semestral | E-mail, Instagram |
| Reativação | Se inativo 60d+ | E-mail, WhatsApp |

---

## 3. Lifecycle flows

### 3.1 Fluxos de reativação

| Trigger | Ação | Canal | Frequência máx | Supressão |
|---|---|---|---|---|
| Produto visualizado, sem add-to-cart (1d) | E-mail: "Ainda interessada?" + prova social | E-mail | 1× | Se comprou |
| Carrinho abandonado (4h) | E-mail: lembrete + foto | E-mail | 1× | Se comprou |
| Carrinho abandonado (24h) | WhatsApp: lembrete + ajuda | WhatsApp | 1× | Se comprou |
| Checkout abandonado (1h) | E-mail: "Alguma dúvida?" | E-mail | 1× | Se comprou |
| Lista de espera (produto disponível) | E-mail: "Disponível!" + CTA | E-mail + WhatsApp | 1× por produto | Sempre |
| Novo drop | E-mail: VIP access | E-mail | 1× por drop | Se unsubscribed |
| Aniversário de compra (365d) | E-mail: "Faz 1 ano..." + recompra | E-mail | 1× | Se inativo >180d |
| Data de presente (Dia das Mães) | E-mail: gift guide | E-mail | 2× por campanha | Se unsubscribed |
| Cliente inativo 60d | E-mail: "Novidades" + drop | E-mail | 1× | Se unsubscribed |
| Cliente inativo 90d | WhatsApp: "Sentimos sua falta" + cupom controlado | WhatsApp | 1× | Se unsubscribed |
| Pós-entrega (+15d) | E-mail: pedido de review + foto | E-mail | 1× | Se já review |
| Reposição de capacidade | E-mail: "Nova peça disponível" | E-mail | 1× por produto | Se unsubscribed |
| Personalização não concluída (7d) | E-mail: "Continue sua peça" | E-mail | 1× | Se completou |

### 3.2 Sinais de risco de churn

| Sinal | Threshold | Ação preventiva |
|---|---|---|
| Visitas sem add-to-cart | 5+ visitas, 0 ATC | Quiz de estilo + WhatsApp |
| Add-to-cart sem checkout | 3+ ATC, 0 checkout | E-mail com FAQ + prova social |
| Checkout sem pagamento | 2+ checkout, 0 pagamento | WhatsApp: "Posso ajudar?" |
| Cliente ativo parou de abrir e-mail | Open rate < 10% por 60d | Reengagement: "Ainda queremos você" |
| Avaliação negativa | Review ≤ 2★ | Contato humano imediato |
| Disputa aberta | Chargeback | Análise + resolução + processo |

### 3.3 Segmentação por comportamento

| Segmento | Critério | Ação |
|---|---|---|
| VIP | 2+ compras ou lista VIP ativa | Acesso antecipado, conteúdo exclusivo |
| New customer | 1ª compra | Onboarding pós-compra, review request |
| Repeat | 2+ compras | Programa de indicação, cross-sell |
| At risk | Inativo 60-90d | Reativação controlada |
| Churned | Inativo 90d+ | Reativação agressiva (cupom) |
| Browser | Visitas sem compra | Quiz, captura de email |
| High intent | 3+ PDP views sem compra | WhatsApp: assistência |
| Waitlist | Em lista de espera | Notificação de disponibilidade |

---

## 4. Regras de pressão comercial

| Regra | Limite |
|---|---|
| E-mail marketing | Máx 2/semana por segmento |
| E-mail transacional | Sem limite (comportamental) |
| WhatsApp marketing | Máx 1/semana com consentimento |
| WhatsApp transacional | Sem limite (pedido, suporte) |
| Push (se app) | Máx 2/semana |
| Supressão global | Se unsubscribe, parar tudo |
| Frequência por segmento | VIP: +1 extra; At risk: -1; Churned: 1×/mês |
| Cooldown pós-compra | 7d sem marketing pós-1ª compra |

---

*Fim do lifecycle-strategy.md*