# NOS-001 — 01 DoR Drift Check

> **HISTORICAL_DOR_SNAPSHOT:** this PASS belongs to the earlier `34306f1` snapshot. Current target baseline and drift evidence are `main@38246f64...` in `../2026-08-08-w0-base-e.md` and `../2026-08-08-external-git-drift.md`. This file is not a current DoD, GO or freeze input.

- **Date:** 2026-08-08
- **Agent:** RUG orchestrator (direct execution, subagents unavailable)
- **DoR publication:** [issue #13 comment 5223283282](https://github.com/Fernadoteixeira/dtc-starter/issues/13#issuecomment-5223283282)
- **DoR verdict:** PASS (13/13 items, 0 UNVERIFIED)

## 1. Git state verification

| Field | Value |
|---|---|
| HEAD commit | `34306f194a8548d0d0ca3ef01953d89a34503755` (short: `34306f1`) |
| Branch | `main` |
| Dirty surfaces | `apps/storefront/src/modules/nos-gallery` (submodule pointer, 0 content changes) |
| Target surfaces dirty | NO — `packages/gallery-experience/**`, `apps/storefront/src/modules/home/gallery-hero/**`, `apps/storefront/src/app/[countryCode]/(main)/page.tsx` all clean |

## 2. GitHub issue #13 state

| Field | Value |
|---|---|
| New comments since DoR | 0 |
| Issue state | Open |
| Labels | Unchanged |
| DoR comment present | YES (comment 5223283282, published 2026-08-07) |

## 3. Canonical source drift

| Field | Value |
|---|---|
| Pinned SHA | `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e` |
| `Fernadoteixeira/nos-gallery` HEAD | `2b6eb78` (unchanged) |
| `boldfernando/nos-gallery` HEAD | `2b6eb78` (unchanged) |
| Local subproject HEAD | `2b6eb78` (unchanged, dirty only in AGENTS.md + .turbo/) |

## 4. Drift verdict

**NO_MATERIAL_DRIFT**

No git state change, no issue state change, no canonical source change, no target surface mutation since the DoR was published. The DoR PASS verdict remains valid. Proceeding to deep analysis.

## 5. New finding since DoR

During deep code analysis, one correction to the AGENTS.md knowledge base was identified:

- **DISC-E3:** AGENTS.md states "No Framer Motion or shadcn/ui are installed — the storefront uses Radix UI primitives and Headless UI directly." This is CORRECT for the storefront. However, `packages/gallery-experience/package.json` lists `framer-motion: 12.42.2` as a direct dependency (not peer). This means code placed inside the gallery-experience package CAN use framer-motion, but code in `apps/storefront/` cannot without adding the dependency. Additionally, `lucide-react`, `sonner`, and `@vercel/analytics` are NOT available anywhere in the workspace. This is a critical constraint for the transplant manifest — the upstream's direct imports of these packages must be resolved through PORT (add to appropriate package.json), ADAPT (replace with equivalent), or DEFER (implement in a later child issue).
