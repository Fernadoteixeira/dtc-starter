# 00.5 — Risks and Constraints

**Data:** 2026-08-05
**Fonte:** Inspeção direta + evidências BB-04 + sessão anterior

---

## Classificação de risco

- 🔴 **Crítico** — bloqueia progresso imediato
- 🟠 **Alto** — degrada performance ou segurança se não tratado
- 🟡 **Médio** — cria fricção ou débito técnico
- 🟢 **Baixo** — monitorar, não bloqueia

---

## 1. Riscos técnicos

### 1.1 🔴 Bloqueador Turbopack/Tailwind v4

| Atributo | Valor |
|---|---|
| Risco | Dev script `next dev --turbopack -p 8000` quebra por token Tailwind v4 `var(--spacing(8))` em `apps/storefront/src/modules/nos-gallery/components/ui/calendar.tsx:32` |
| Impacto | Storefront não inicia em modo dev padrão; requer workaround `next dev -p 8000` (sem `--turbopack`) |
| Causa raiz | Componente gerado por shadcn/ui ou fonte similar introduziu sintaxe Tailwind v4 em codebase Tailwind v3 |
| Evidência | Sessão anterior BB-04; HTTP 500 com `Parsing CSS source code failed: Unexpected token Function("--spacing")` |
| Mitigação | (a) Remover/substituir `calendar.tsx` se não for usado; (b) Migrar Tailwind para v4 global; (c) Isolar `nos-gallery` como pacote com build próprio |
| Recomendação | **Opção (a)** — verificar se `calendar.tsx` é referenciado em alguma rota Fio Vivo. Se não, remover do path de compilação |

### 1.2 🟠 Fixtures hardcoded no storefront (não backend)

| Atributo | Valor |
|---|---|
| Risco | `GalleryHeroClient` ignora `items` prop e usa `fioVivoProducts` fixtures hardcoded — BB-03 override temporário |
| Impacto | Produtos não são gerenciáveis via admin Medusa; mudanças exigem deploy; sem pricing engine; sem inventory |
| Causa | Override intencional BB-03 para visualizar galeria sem depender de seed backend |
| Mitigação | Migrar produtos para backend Medusa via seed/custom module; adapter já existe (`medusa-adapter.ts`) |

### 1.3 🟠 Metadados "a informar" em 100% das fixtures

| Atributo | Valor |
|---|---|
| Risco | 6 produtos × 9 campos comerciais = 54 campos com valor `"a informar"` (price, description, artist, material, category, year, availability, contextualName, ambientColors) |
| Impacto | Nenhum produto pode ser vendido — sem preço, sem descrição, sem material, sem disponibilidade |
| Mitigação | Reconciliação com fonte externa (artesã), cadastro no backend, preenchimento de fixtures |

### 1.4 🟡 Branch divergência workspace snapshot

| Atributo | Valor |
|---|---|
| Risco | Workspace Hermes indica branch `master`, real é `main` |
| Impacto | Comandos git podem falhar silenciosamente se assumirem branch errada |
| Mitigação | Sempre executar `git branch --show-current` antes de operações git |

### 1.5 🟡 Dual JS/TS no gallery-experience

| Atributo | Valor |
|---|---|
| Risco | `packages/gallery-experience/src/` tem `.js` e `.tsx` lado a lado (ex: `gallery-experience.jsx` e `.tsx`) |
| Impacto | Confusão sobre qual arquivo é fonte; possível import resolution ambíguo |
| Mitigação | Remover `.js`/`.jsx` após confirmar que não há consumers do JS |

### 1.6 🟡 Sem observabilidade

| Atributo | Valor |
|---|---|
| Risco | Sem Sentry, sem logging estruturado, sem APM |
| Impacto | Erros em produção não detectáveis; debug difícil |
| Mitigação | Adicionar Sentry (ou equivalente) no storefront e backend |

### 1.7 🟢 Lockfile grande

| Atributo | Valor |
|---|---|
| Risco | `pnpm-lock.yaml` = 702 KB |
| Impacto | Clone lento; merge conflicts no lockfile |
| Mitigação | Aceitável para monorepo; não hand-editar |

---

## 2. Riscos de produto / negócio

### 2.1 🔴 Divergência entre prompt e fixture

| Produto do Mega-Prompt | Existe na fixture? | ID real |
|---|---|---|
| Trança Âmbar | ✅ | fv-005-tranca-ambar |
| Duna Terracota | ✅ | fv-006-duna-terracota |
| Duna Terracota — Edição Bicolor | ❌ | Inexistente |
| Jardim Vivo | ❌ | Inexistente |
| Órbita Negra | ✅ | fv-002-orbita-negra |
| Espiral Dourada | ✅ | fv-001-espiral-dourada |
| **Trama Solar** (não no prompt) | ✅ | fv-003-trama-solar |
| **Fio Ancestral** (não no prompt) | ✅ | fv-004-fio-ancestral |

| Impacto | O mega-prompt lista 6 produtos, mas 2 não existem (Jardim Vivo, Duna Bicolor) e 2 existem mas não estão no prompt (Trama Solar, Fio Ancestral) |
| Mitigação | Reconciliar com artesã; decidir se produtos do prompt devem ser criados ou se fixtures são a fonte de verdade |

### 2.2 🔴 Preços do prompt não validados

| Produto | Validação | Recomendado | Premium |
|---|---|---|---|
| Trança Âmbar | R$ 250 | R$ 420 | R$ 590 |
| Duna Terracota | R$ 590 | R$ 790 | R$ 1.190 |
| Duna Bicolor | R$ 590 | R$ 790 | R$ 1.290 |
| Jardim Vivo | R$ 590 | R$ 790 | R$ 1.190 |
| Órbita Negra | R$ 590 | R$ 890 | R$ 1.290 |
| Espiral Dourada | R$ 690 | R$ 990 | R$ 1.490 |

> **Todos os preços são hipóteses não validadas.** Sem custo real (materiais, mão de obra, overhead), sem margem calculada. Aplicar pricing engine requer dados de custo que não existem.

### 2.3 🟠 Sem região Brasil configurada

| Atributo | Valor |
|---|---|
| Risco | Default region é `dk` (Dinamarca); sem BRL; sem CEP; sem frete BR |
| Impacto | Storefront não serve Brasil corretamente; preços em EUR/USD |
| Mitigação | Adicionar região BR com BRL no seed Medusa; configurar shipping BR |

### 2.4 🟠 Sem pagamentos BR

| Atributo | Valor |
|---|---|
| Risco | Pix, boleto, cartão BR não configurados; apenas Stripe ( internacional) + PayPal + iDeal + Bancontact |
| Impacto | Cliente BR não pode pagar com método preferido |
| Mitigação | Integrar Pix via Stripe BR ou provider nacional (ex: Mercado Pago) |

### 2.5 🟡 Made-to-order sem prazo

| Atributo | Valor |
|---|---|
| Risco | Produtos são artesanais (tempo de produção não trivial) mas não há lead time configurado |
| Impacto | Cliente não sabe prazo; expectativa incorreta; churn pós-compra |
| Mitigação | Adicionar `leadTimeDays` no modelo; exibir prazo na PDP |

### 2.6 🟡 Escassez verdadeira vs. escassez falsa

| Atributo | Valor |
|---|---|
| Risco | Produção artesanal é limitada por capacidade (mão de obra); usar escassez sem comprovação viola princípio #6 |
| Impacto | Perda de confiança se "última peça" for mentira |
| Mitigação | Sistema de capacidade real; lista de espera genuína; peças numeradas reais |

---

## 3. Riscos de segurança / compliance

### 3.1 🟠 Diretórios sensíveis não versionados

| Atributo | Valor |
|---|---|
| Risco | `.mcp-auth/`, `.azure/`, `.docker/`, `.kube/`, `.sigstore/`, `.config/` existem no home |
| Impacto | Se versionados por engano, vazam credenciais |
| Mitigação | `.gitignore` deve cobrir; nunca commitar conteúdo destes |

### 3.2 🟡 Sem LGPD/GDPR

| Atributo | Valor |
|---|---|
| Risco | Sem consent management, sem privacy policy, sem cookie banner |
| Impacto | Não conformidade legal ao operar comercialmente |
| Mitigação | Implementar consent management; privacy policy; cookie banner |

### 3.3 🟡 `.env.local` existe (não vazio)

| Atributo | Valor |
|---|---|
| Risco | `.env.local` no storefront e `.env` no backend existem com valores |
| Impacto | Se commitados, vazam publishable key, secrets |
| Mitigação | Confirmar que `.gitignore` cobre; valores não exibidos neste relatório |

---

## 4. Riscos operacionais

### 4.1 🟠 Sem deploy pipeline

| Atributo | Valor |
|---|---|
| Risco | CI apenas valida (lint + test), não deploya |
| Impacto | Deploy manual; risco de erro humano |
| Mitigação | Adicionar deploy pipeline (Vercel para storefront, Medusa Cloud ou container para backend) |

### 4.2 🟡 Infra local não é produção

| Atributo | Valor |
|---|---|
| Risco | docker-compose é dev-only (Traefik local, Adminer exposto, Mailpit) |
| Impacto | Não usar em produção |
| Mitigação | Configurar infra prod separada (Vercel + Medusa Cloud + managed Postgres) |

### 4.3 🟡 Sem backup strategy

| Atributo | Valor |
|---|---|
| Risco | Sem backup automatizado de DB |
| Impacto | Perda de dados em falha |
| Mitigação | Backup automatizado (Medusa Cloud ou pg_dump cron) |

---

## 5. Constraints (restrições confirmadas)

| # | Constraint | Origem |
|---|---|---|
| 1 | Node >=20 | `package.json` engines |
| 2 | pnpm 10.11.1 | `packageManager` |
| 3 | PostgreSQL 15 | docker-compose |
| 4 | Medusa v2.18.0 | `package.json` backend |
| 5 | Next.js 15.5.21 | `package.json` storefront |
| 6 | React 19.0.5 | `package.json` storefront |
| 7 | Tailwind 3.0.23 (declarado) | `package.json` storefront devDeps |
| 8 | ESLint @medusajs/eslint-plugin recommended | `eslint.config.ts` |
| 9 | No semicolons, double quotes, 2-space indent | AGENTS.md |
| 10 | Files kebab-case, Types PascalCase, DB snake_case | AGENTS.md |
| 11 | Business logic em workflows, não em routes | AGENTS.md |
| 12 | Não editar migrations existentes | AGENTS.md |
| 13 | Não hand-edit lockfile | AGENTS.md |
| 14 | Não silenciar regras @medusajs/* ESLint | AGENTS.md |
| 15 | Backend routing file-based | AGENTS.md |
| 16 | `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` obrigatório | AGENTS.md + README |
| 17 | Turbopack dev quebra com Tailwind v4 | Evidência BB-04 |
| 18 | Produção artesanal (capacidade limitada) | Contexto de negócio |
| 19 | Sem dark patterns, sem escassez falsa | Princípio #6 |
| 20 | Preço nunca abaixo do custo econômico total | Princípio #10 |

---

## 6. Matriz de risco resumida

| # | Risco | Nível | Bloqueia? | Esforço mitigação |
|---|---|---|---|---|
| 1 | Turbopack/Tailwind v4 | 🔴 | Sim (dev) | Baixo |
| 2 | Fixtures hardcoded | 🟠 | Não (mas impede escala) | Médio |
| 3 | Metadados "a informar" | 🔴 | Sim (comércio) | Médio (requer dados da artesã) |
| 4 | Divergência prompt × fixture | 🔴 | Sim (confusão) | Baixo (decidir fonte de verdade) |
| 5 | Preços não validados | 🔴 | Sim (comércio) | Alto (requer dados de custo) |
| 6 | Sem região BR | 🟠 | Parcial | Médio |
| 7 | Sem Pix | 🟠 | Parcial | Médio |
| 8 | Sem deploy pipeline | 🟠 | Não | Médio |
| 9 | Sem LGPD/GDPR | 🟡 | Não (ainda) | Médio |
| 10 | Sem observability | 🟡 | Não | Baixo |
| 11 | Dual JS/TS | 🟡 | Não | Baixo |
| 12 | Branch divergência | 🟡 | Não | Baixo |

---

*Fim do risks-and-constraints.md*