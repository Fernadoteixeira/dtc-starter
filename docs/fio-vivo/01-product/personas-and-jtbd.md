# Personas e Jobs-to-be-Done — Fio Vivo

> Mapeia as 8 personas da marca Fio Vivo, seus jobs-to-be-done (JTBD), dores, ganhos e requisitos de produto derivados. Serve de base para priorização de features, copy de PDP, arquitetura de informação e estratégia de aquisição.

| Campo | Valor |
|---|---|
| **Marca** | Fio Vivo |
| **Documentos pai** | product-vision.md, product-strategy.md, prd-360.md |
| **Data** | 05 ago 2026 |
| **Versão** | 1.0 |
| **Status** | Rascunho para validação |

---

## 1. Visão Geral

Fio Vivo serve 8 personas distintas, derivadas do mega-prompt de posicionamento da marca. Nem todas são atendidas no lançamento (P1); algumas surgem na expansão (P2) ou no profundar (P3). Este documento mapeia cada persona, seu job principal, dores, ganhos e os requisitos de produto que as atendem.

### 1.1 Matriz de Prioridade por Fase

| Persona | Código | P1 | P2 | P3 |
|---|---|---|---|---|
| Compradora autoral | P-AU | ✅ Primária | ✅ | ✅ |
| Compradora de presente | P-PR | ✅ Secundária | ✅ | ✅ |
| Compradora orientada por moda | P-MO | ✅ Secundária | ✅ |  |
| Colecionadora | P-CO | ✅ Secundária | ✅ | ✅ |
| Cliente de personalização | P-PE |  | ✅ Primária | ✅ |
| Cliente internacional | P-IN |  |  | ✅ Primária |
| Comprador corporativo | P-CR |  | ✅ Secundária | ✅ |
| Criador / afiliado | P-CR-AF |  | ✅ Secundária | ✅ |

---

## 2. Persona 1 — Compradora Autoral (P-AU)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Compradora autoral |
| **Código** | P-AU |
| **Prioridade** | Primária (P1) |
| **Gênero** | Feminino (maioria) |
| **Idade** | 32-50 |
| **Renda** | Classe A/B |
| **Localização** | São Paulo, Rio de Janeiro, Belo Horizonte, Curitiba |

### Descrição

A compradora autoral valoriza a história por trás da peça. Ela não compra uma bolsa — compra o gesto, o tempo, a mão que fez. Ela já consome arte artesanal, visita atelieres, segue artistas no Instagram e tem repertório para distinguir crochê industrial de crochê autoral. Para ela, a transparência de preço não é detalhe — é o motivo da compra.

### Job-to-be-Done

> **"Quando encontro uma peça artesanal que me toca, quero saber quem fez, como fez e por que custa o que custa — para comprar com convicção e sentir que faço parte da história."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Não sabe quem fez a peça | Alta | E-commerce genérico não mostra artista |
| Não entende a composição do preço | Alta | Markup opaco, sem transparência |
| Dúvida sobre autenticidade artesanal | Média | Marketplaces misturam industrial com artesanal |
| Experiência digital impessoal | Média | Loja parece catálogo, não galeria |
| Sem pós-venda relacional | Média | Compra e nunca mais ouve da marca |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Conexão com o artista | Saber nome, história, ver o rosto |
| Transparência de preço | Entender custo + margem |
| Peça com narrativa | Poder contar a história da peça |
| Experiência de galeria | Navegação curada, não catálogo inflado |
| Pós-venda cuidado | Cuidados, reparo, "suas peças" |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| Artista na PDP com link para página | FR-12, FR-91 | P1 |
| Descrição com técnica e inspiração | CR-01 | P1 |
| Página de transparência de preço | CR-04 | P1 |
| Página de artista com bio e foto | FR-90, FR-91 | P1 |
| Experiência de galeria (6 peças, curadoria) | FR-01 | P1 |
| Página de processo (making-of) | CR-11 | P3 |
| Área "suas peças" + cuidados | FR-54 | P3 |
| Guia de cuidados da peça | CR-12 | P1 |

---

## 3. Persona 2 — Compradora de Presente (P-PR)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Compradora de presente |
| **Código** | P-PR |
| **Prioridade** | Secundária (P1) |
| **Gênero** | Misto |
| **Idade** | 28-55 |
| **Renda** | Classe A/B |
| **Localização** | Brasil (urbano) |

### Descrição

A compradora de presente busca algo único e significativo. Ela quer presentear com algo que diga "eu pensei em você" — não uma bolsa qualquer. O valor está na singularidade e na narrativa que ela pode contar ao entregar. Ela precisa de ajuda na escolha (não é especialista) e de uma experiência de unboxing memorável.

### Job-to-be-Done

> **"Quando preciso presentear alguém especial, quero encontrar uma peça que carregue significado e história — para entregar algo que nenhum outro presente reproduz."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Não sabe escolher entre as peças | Alta | Sem repertório de moda/artesanato |
| Receio de errar no gosto | Alta | Presente é aposta emocional |
| Sem opção de embalagem presente | Média | Unboxing é parte do presente |
| Sem prazo de entrega confiável | Alta | Presente tem data |
| Sem carta/mensagem personalizada | Média | Quer incluir recado |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Curadoria que ajuda a escolher | Sugestões por ocasião, estilo, pessoa |
| Embalagem presente opcional | Unboxing memorável |
| Cartão com nome do artista | Reforça o valor do presente |
| Prazo real e confiável | Saber se chega a tempo |
| Política de troca clara | Segurança se errar |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| Sugestão de produtos relacionados | FR-23 | P1 |
| Embalagem presente (opcional) | CR-10 (extender) | P1 |
| Cartão com nome do artista | CR-10 | P1 |
| Prazo de envio real na PDP | CR-06 | P1 |
| Política de troca clara | CR-05 | P1 |
| Filtro por ocasião / estilo | FR-02 (extender) | P2 |
| Recomendação personalizada | (novo) | P2 |

---

## 4. Persona 3 — Compradora Orientada por Moda (P-MO)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Compradora orientada por moda |
| **Código** | P-MO |
| **Prioridade** | Secundária (P1) |
| **Gênero** | Feminino |
| **Idade** | 25-40 |
| **Renda** | Classe B/C alta |
| **Localização** | Capitais e cidades médias |

### Descrição

A compradora orientada por moda segue tendências e quer peças que combinem com seu estilo. Ela descobre Fio Vivo pelo Instagram, por influenciadoras ou por busca estética. O crochê é trending. Ela quer saber se a peça cabe no seu guarda-roupa, combina com o que já tem e se é versátil. Transparência de preço é positiva, mas não é o gatilho principal — o gatilho é a estética.

### Job-to-be-Done

> **"Quando vejo uma peça de crochê que está em alta, quero avaliar se combina com meu estilo e vale o investimento — para comprar algo que vou usar e não me arrepender."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Não consegue imaginar a peça no look | Alta | Só vê foto isolada |
| Dúvida sobre tamanho e proporção | Alta | Bolsa parece maior/menor na foto |
| Sem foto de "gesto" (pessoa usando) | Alta | Não sabe como fica no corpo |
| Sem reviews de quem usa | Média | Quer ver em uso real |
| Preço parece alto sem contexto | Média | Sem transparência, parece caro |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Imagem de gesto (pessoa usando) | Cena de gesto já existe (4 cenas) |
| Reviews com foto em uso | Prova social estética |
| Informação de dimensões claras | Altura × largura × profundidade |
| Sugestão de styling | Como combinar |
| Tendência validada | Selos ou badges de trending |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| Cena de gesto na galeria da PDP | FR-06, FR-15 | P1 |
| Dimensões do produto na PDP | FR-11 (extender) | P1 |
| Reviews com foto | FR-22 | P2 |
| Produtos relacionados (styling) | FR-23 | P1 |
| Conteúdo de styling no Instagram | (marketing) | P1 |

---

## 5. Persona 4 — Colecionadora (P-CO)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Colecionadora |
| **Código** | P-CO |
| **Prioridade** | Secundária (P1) |
| **Gênero** | Feminino (maioria) |
| **Idade** | 40-65 |
| **Renda** | Classe A |
| **Localização** | São Paulo, Rio, Internacional |

### Descrição

A colecionadora já tem peças de atelier, acessórios de design, talvez arte. Ela busca singularidade, edição, peças que tenham valor de coleção. Ela quer saber o ano, se é edição limitada, se o artista tem trajetória. Para ela, drops e edições são atrativos — desde que reais, não fabricados.

### Job-to-be-Done

> **"Quando encontro uma peça que pode virar coleção, quero saber sua origem, edição e trajetória do artista — para adquirir algo que tem valor além do uso."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Sem informação de edição/ano | Alta | Não sabe se é peça única ou série |
| Sem trajetória do artista | Alta | Não avalia valor de coleção |
| Sem drops com data | Média | Não há anticipation |
| Sem certificado | Média | Quer documento que ateste |
| Sem acesso antecipado | Média | Quer prioridade como colecionadora |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Ano de criação na PDP | Campo `year` preenchido |
| Edição limitada real | Drop com produção limitada |
| Página de artista com trajetória | Bio + portfólio |
| Certificado de autenticidade | Documento físico ou digital |
| Acesso antecipado a drops | Lista VIP de colecionadora |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| Campo `year` na PDP | FR-72 (extender) | P1 |
| Módulo de drops | FR-80 | P2 |
| Página de artista com trajetória | FR-91 (extender) | P1 |
| Certificado de autenticidade | (novo) | P2 |
| Lista VIP / acesso antecipado | (novo) | P2 |
| Edição numerada (se aplicável) | (novo) | P2 |

---

## 6. Persona 5 — Cliente de Personalização (P-PE)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Cliente de personalização |
| **Código** | P-PE |
| **Prioridade** | Primária (P2) |
| **Gênero** | Feminino (maioria) |
| **Idade** | 30-50 |
| **Renda** | Classe A/B |
| **Localização** | Brasil (urbano) |

### Descrição

A cliente de personalização quer uma peça que seja só dela. Ela está disposta a pagar mais e esperar mais por algo único. Para ela, o configurador na PDP é o coração da experiência. Ela quer escolher cor, dimensão e detalhes — e ver o preço se ajustar em tempo real. Sem personalização, ela vai para outro atelier.

### Job-to-be-Done

> **"Quando quero uma peça que seja única, quero configurar cor, tamanho e detalhes com o artista — para ter algo que ninguém mais tem."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Sem opção de personalização | Alta | PDP atual não tem configurador |
| Sem preview de cor | Alta | Não vê o resultado |
| Sem ajuste de preço transparente | Alta | Não sabe quanto custa customizar |
| Sem prazo de produção personalizado | Média | Não sabe quanto leva |
| Sem comunicação direta com artista | Média | Quer validar viabilidade |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Configurador de cor na PDP | Seletor com preview |
| Configurador de dimensão | Seletor com ajuste de preço |
| Campo de observação | Detalhe customizado |
| Preço atualizado em tempo real | Pricing engine |
| Prazo de produção personalizado | Mostra tempo extra |
| Comunicação com artista | Canal de validação |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| Personalização de cor | FR-19 | P2 |
| Personalização de dimensão | FR-20 | P2 |
| Personalização de detalhe | FR-21 | P2 |
| Pricing engine | FR-78 | P2 |
| Prazo de produção customizado | (novo) | P2 |
| Comunicação artista-cliente | FR-93 (extender) | P3 |

---

## 7. Persona 6 — Cliente Internacional (P-IN)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Cliente internacional |
| **Código** | P-IN |
| **Prioridade** | Primária (P3) |
| **Gênero** | Misto |
| **Idade** | 30-60 |
| **Renda** | Classe A (internacional) |
| **Localização** | EUA, Europa, Japão |

### Descrição

O cliente internacional descobre Fio Vivo por indicação, Instagram ou imprensa. Ele quer comprar peça brasileira autoral com frete internacional. Para ele, o site precisa ter versão em inglês, preço em USD/EUR, e frete internacional claro. Sem isso, ele desiste ou usa intermediário.

### Job-to-be-Done

> **"Quando descubro uma marca artesanal brasileira, quero comprar com confiança em meu idioma e moeda — para receber a peça sem surpresas de frete ou alfândega."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Site só em português | Alta | Barreira idioma |
| Preço só em BRL | Alta | Não sabe quanto é em USD |
| Sem frete internacional | Alta | Não sabe se entrega |
| Sem info de alfândega | Média | Receio de taxa extra |
| Sem suporte em inglês | Média | Dúvidas sem canal |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Site em inglês (i18n) | NFR-10 |
| Preço em USD/EUR | Multi-moeda |
| Frete internacional | Integração DHL/FedEx |
| Política de alfândega clara | Documento |
| Suporte em inglês | Email/chat |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| i18n (en-US) | NFR-10 | P3 |
| Multi-moeda (USD/EUR) | (novo) | P3 |
| Frete internacional | (novo) | P3 |
| Política de alfândega | CR-05 (extender) | P3 |
| Suporte em inglês | (novo) | P3 |

---

## 8. Persona 7 — Comprador Corporativo (P-CR)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Comprador corporativo |
| **Código** | P-CR |
| **Prioridade** | Secundária (P2) |
| **Gênero** | Misto |
| **Idade** | 30-55 |
| **Renda** | N/A (B2B) |
| **Localização** | Brasil |

### Descrição

O comprador corporativo busca presentes corporativos, brindes de evento ou peças para clientes VIP. Ele precisa de NF, prazo, volume (10-50 peças) e talvez personalização corporativa (cor da empresa, logo em tag). Ele não quer passar pelo checkout de consumidor — quer canal de atendimento dedicado.

### Job-to-be-Done

> **"Quando preciso presentear clientes ou equipe, quero encomendar peças artesanais com volume, nota fiscal e prazo garantido — para entregar algo memorável sem fricção administrativa."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Sem canal B2B | Alta | Checkout de consumidor não serve |
| Sem volume com produção garantida | Alta | Não sabe se atende 30 peças |
| Sem NF eletrônica | Alta | Precisa para contabilidade |
| Sem personalização corporativa | Média | Quer tag com logo |
| Sem prazo garantido | Alta | Evento tem data |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Canal de atendimento B2B | Formulário/email dedicado |
| Cotação por volume | Tabela por quantidade |
| NF eletrônica | Integração fiscal |
| Personalização de tag | Logo/branding |
| Prazo contratual | Acordo de produção |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| Formulário B2B | (novo) | P2 |
| Cotação por volume | (novo) | P2 |
| NF eletrônica | (novo) | P2 |
| Personalização de tag | FR-21 (extender) | P2 |
| Prazo contratual | (novo) | P2 |

---

## 9. Persona 8 — Criador / Afiliado (P-CR-AF)

### Perfil

| Campo | Valor |
|---|---|
| **Nome** | Criador / afiliado |
| **Código** | P-CR-AF |
| **Prioridade** | Secundária (P2) |
| **Gênero** | Misto |
| **Idade** | 22-40 |
| **Renda** | Variável |
| **Localização** | Brasil (principal) |

### Descrição

O criador é influenciador, content creator ou micro-influencer que quer partnership com Fio Vivo. Ele quer link de afiliado, comissão por venda, material de conteúdo (fotos, briefing) e acesso antecipado a drops. Para ele, a transparência da marca é ativo — ele se afilia porque concorda com os princípios.

### Job-to-be-Done

> **"Quando encontro uma marca que respeito, quero me afiliar com rastreio e comissão — para monetizar meu conteúdo sem trair minha audiência."**

### Dores

| Dor | Intensidade | Contexto |
|---|---|---|
| Sem programa de afiliados | Alta | Não há estrutura |
| Sem rastreio de vendas | Alta | Não sabe se converteu |
| Sem material de conteúdo | Média | Precisa de assets |
| Sem comissão transparente | Média | Não sabe quanto ganha |
| Sem acesso antecipado a drops | Média | Quer criar anticipation |

### Ganhos Esperados

| Ganho | Descrição |
|---|---|
| Programa de afiliados | Estrutura com rastreio |
| Link personalizado | Por criador |
| Dashboard de comissões | Visualizar vendas |
| Material de conteúdo | Fotos, briefing, código |
| Acesso antecipado | Drops com preview |

### Requisitos de Produto Derivados

| Requisito | ID | Fase |
|---|---|---|
| Módulo de afiliados | FR-82 | P2 |
| Dashboard de afiliado | ADM-10 (extender) | P2 |
| Link de afiliado rastreável | (novo) | P2 |
| Material de conteúdo (press kit) | (novo) | P2 |
| Acesso antecipado a drops | FR-80 (extender) | P2 |

---

## 10. Matriz Consolidada: Persona × Requisito

| Requisito | P-AU | P-PR | P-MO | P-CO | P-PE | P-IN | P-CR | P-AF |
|---|---|---|---|---|---|---|---|---|
| Artista na PDP (FR-12) | ✅ | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ |
| Galeria de 4 cenas (FR-15) | ✅ |  | ✅ |  |  | ✅ |  |  |
| Transparência de preço (CR-04) | ✅ |  | ✅ |  | ✅ |  |  | ✅ |
| Lista de espera (FR-18) | ✅ |  |  | ✅ |  |  |  |  |
| Personalização (FR-19/20) |  |  |  |  | ✅ |  | ✅ |  |
| Drops (FR-80) |  |  |  | ✅ |  |  |  | ✅ |
| Reviews (FR-22) | ✅ | ✅ | ✅ |  |  |  |  |  |
| Afiliados (FR-82) |  |  |  |  |  |  |  | ✅ |
| Página de artista (FR-91) | ✅ | ✅ |  | ✅ | ✅ | ✅ | ✅ | ✅ |
| Página de processo (CR-11) | ✅ |  |  | ✅ | ✅ | ✅ |  | ✅ |
| i18n (NFR-10) |  |  |  | ✅ |  | ✅ |  |  |
| "Suas peças" (FR-54) | ✅ |  |  | ✅ | ✅ |  |  |  |
| Embalagem presente (CR-10) |  | ✅ |  |  | ✅ | ✅ | ✅ |  |
| Canal B2B |  |  |  |  |  |  | ✅ |  |
| Certificado (P-CO) |  |  |  | ✅ |  | ✅ |  |  |

---

## 11. Insights para Produto

### 11.1 P1 — O que atende mais personas

| Requisito P1 | Personas atendidas | Prioridade derivada |
|---|---|---|
| Artista na PDP + página de artista | 7 de 8 | Must absoluta |
| Galeria de 4 cenas (já existe nas fixtures) | 4 de 8 | Must |
| Transparência de preço | 4 de 8 | Must |
| Prazo de envio real | 3 de 8 | Must |
| Política de troca clara | 2 de 8 | Must |

### 11.2 P2 — O que desbloqueia personas novas

| Requisito P2 | Personas desbloqueadas |
|---|---|
| Personalização | P-PE, P-CR |
| Drops | P-CO, P-AF |
| Afiliados | P-AF |
| Lista de espera | P-AU, P-CO |
| Reviews | P-AU, P-PR, P-MO |
| Canal B2B | P-CR |

### 11.3 P3 — Profundar relacionamento

| Requisito P3 | Personas atendidas |
|---|---|
| i18n + multi-moeda | P-IN, P-CO |
| Página de processo | P-AU, P-CO, P-PE, P-IN |
| "Suas peças" + cuidado | P-AU, P-CO, P-PE |
| Encomenda direta artista | P-PE, P-AU |

---

## 12. Princípios Inegociáveis × Personas

| Princípio | Persona mais sensível | Por quê |
|---|---|---|
| Não usar escassez falsa | P-AU, P-CO | Detectam e perdem confiança |
| Não vender abaixo do custo | P-AU | Valoriza transparência; preço abaixo do custo gera desconfiança |
| Não usar dark patterns | P-AU, P-AF | Rejeitam manipulação; afiliado não quer trair audiência |
| Autoria estrutural | P-AU, P-CO, P-PE | É o motivo da compra |
| Tempo é real | P-PR, P-CR | Prazo é crítico para presente e corporativo |

---

## 13. Copy de PDP por Persona (Orientação)

| Persona | Tom de copy na PDP | Foco |
|---|---|---|
| P-AU | Narrativa de artista + transparência de preço | "Feita por [artista], em [X] dias, com [material]. O preço cobre material, tempo e margem." |
| P-PR | Singularidade + embalagem | "Uma peça que ninguém mais terá. Embalagem presente disponível." |
| P-MO | Estética + dimensões + styling | "Versátil, combina com [looks]. Dimensões: [A×L×P]." |
| P-CO | Edição + ano + trajetória | "Peça de [ano]. Edição limitada de [N]. Artista: [bio]." |
| P-PE | Configurador + prazo | "Personalize cor, tamanho e detalhe. Produção: [X] dias." |
| P-IN | Idioma + moeda + frete | "Ships internationally. Price in USD/EUR." |
| P-CR | Volume + NF + prazo | "Encomenda corporativa. NF eletrônica. Prazo contratual." |
| P-AF | Princípios + rastreio | "Afunde-se com rastreio e comissão transparente." |

---

*Documento vivo. Validar personas com pesquisa de campo e cohort inicial. Ajustar JTBDs após primeiras 50 vendas.*