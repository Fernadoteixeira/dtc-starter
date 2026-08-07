# NOS-001 — 00 Executive Outcome

- **Command:** NOS-001 Strategy Capacity Domain — BB-NOS program
- **Date:** 2026-08-07
- **Scope:** Strategy responsibilities for the BB-NOS epic (#12) and its root work item (#13)
- **Sibling artifacts:** [`07-dependency-dag.md`](./07-dependency-dag.md), [`08-wsjf-5bu.md`](./08-wsjf-5bu.md)

## 1. Measurable end-to-end outcome

Translated from #12 (EPIC) and #13 (NOS-001 root):

> **The storefront first fold is a faithful, production-grade transplant of the canonical `nos-gallery` experience, adapted (not redesigned) onto Medusa commerce, and released only after every child gate (#13–#27) is complete and the visual baseline receives explicit human approval (#28).**

Measurable acceptance criteria:

| # | Outcome criterion | Measure / evidence |
|---|---|---|
| O1 | Canonical source frozen | Pinned SHA `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e` verified on the canonical remote and local mirror; transplant manifest `.agents/contracts/nos-gallery-transplant-manifest.yaml` frozen (gate #13) |
| O2 | Visual DNA transplanted | Copper/umber/linen system (#14), grain/vignette/dynamic ambient (#15) render in `packages/gallery-experience` with zero Tailwind v4 syntax |
| O3 | Behavioral parity | ArtworkCard scene state (#16), active-index navigation (#17), wheel+drag engine (#18), parallax + reduced motion (#19), progress/dwell lifecycle (#20) behave per the canonical source, verified against the baseline |
| O4 | Commerce hardened | Medusa adapter hardened and fail-closed for the `fio-vivo` collection (#21); zero fabricated price/currency/stock/metadata fallbacks (#22); localized CTA + gallery analytics active (#23) |
| O5 | Quality gates passed | Responsiveness, keyboard UX, accessibility (#24); visual regression parity vs baseline (#25); first-fold performance budgets enforced (#26) |
| O6 | Operational safety | Rollout / feature-flag / fallback / rollback contract defined (#27) |
| O7 | Release authorization | Release verdict `BB-NOS RELEASE CANDIDATE VALIDATED` recorded only after explicit human visual approval (#28) |

## 2. Strategic invariants (non-negotiable)

Carried verbatim from #12; binding on every child item:

1. **Reuse-first.** Do not replace upstream behavior with approximations when upstream code can be safely ported/adapted.
2. **No runtime dependency** on the standalone `nos-gallery` repository.
3. **Commerce preserved.** Medusa Menu, region routing, Account, Cart, product routing and checkout remain intact.
4. **No fabrication.** No fabricated price, currency, stock, artist, year, image or editorial metadata.
5. **Fail-closed.** `fio-vivo` collection resolution must fail closed, never silently degrade.
6. **Human visual approval** is required before release; it cannot be delegated or inferred.
7. **No merge bypass or auto-merge** without explicit authorization (product approval, Git authorization, and merge authorization are three distinct grants per the Session State Ledger contract).

## 3. Non-goals

- Redesigning or "improving" the canonical nos-gallery experience beyond adaptation to Medusa.
- Touching anything below the first fold or outside `packages/gallery-experience` / `apps/storefront/src/modules/home/gallery-hero` except as required by the hardening lane (#21–#23).
- Introducing new dependencies (Framer Motion, shadcn/ui) — the storefront uses Radix UI primitives and Headless UI.
- Migrating the storefront to Tailwind v4 or otherwise changing the build toolchain.
- Backfilling features the canonical source does not contain (new scenes, new commerce features).
- Modifying the pinned baseline after freeze; upstream changes past `2b6eb78` are out of scope for BB-NOS.

## 4. Canonical source decision — FROZEN

| Field | Value |
|---|---|
| Canonical repository | `Fernadoteixeira/nos-gallery` (explicitly named in #12/#13) |
| Pinned commit | `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e` (short: `2b6eb78`) |
| Lineage/mirror alias | `boldfernando/nos-gallery` — resolves to the **same commit SHA**; hosting alias, not a divergence |
| Local mirror | `apps/storefront/src/modules/nos-gallery` (HEAD == pinned SHA, origin == canonical remote) |
| Evidence | [`docs/artifacts/nos-001-canonical-lineage-preflight.md`](../../nos-001-canonical-lineage-preflight.md) — verdict **PASS**, no `CANONICAL_LINEAGE_CONFLICT` |
| Status | **FROZEN as immutable source truth.** Re-freeze requires a new lineage conflict, destructive risk, or explicit human revocation. |

## 5. Decision rights

| Decision | Right holder | Notes |
|---|---|---|
| Freeze / re-freeze canonical source | Program lead (human), with preflight evidence | Already exercised; frozen |
| Scope changes to the transplant manifest | Program lead (human) | Triggers ledger gate update |
| Waiver of any strategic invariant (Section 2) | Program lead (human) only | Agents may not self-waive |
| Execution sequencing within dependency-feasible order | Executing agent / orchestrator | Must respect the DAG (07-dependency-dag.md) |
| Gate completion sign-off per child issue | Executing agent, with recorded evidence | Logged in Session State Ledger |
| Product approval, Git authorization, merge authorization | Human, each granted **explicitly and separately** | Per Session State Ledger "Authorization categories are distinct" |
| Final release verdict (#28) | Human, explicit visual approval | Hard stop otherwise |

## 6. Stop conditions

Execution halts and escalates to the human program lead on any of:

1. **Canonical lineage conflict** — canonical remote, mirror alias, or local mirror HEAD diverge from the pinned SHA.
2. **Invariant violation detected** — fabricated commercial data, silent (fail-open) collection fallback, or upstream behavior replaced by approximation without reuse-first justification.
3. **Dependency cycle or missing prerequisite** — a child item cannot start because its declared dependencies are incomplete.
4. **Gate regression** — an already-approved gate shows objective regression (reopens that gate only; never reinterpret resolved gates out of generic caution).
5. **Destructive risk** — any action threatening the user's database, the pinned mirror, or existing migrations.
6. **Human revocation** — the most recent explicit human instruction always prevails.

## 7. Key decisions recorded this session

| # | Decision | Basis |
|---|---|---|
| D1 | Canonical source frozen to `Fernadoteixeira/nos-gallery @ 2b6eb78` | Preflight evidence PASS; issues #12/#13 |
| D2 | `boldfernando/nos-gallery` treated as lineage alias, non-blocking | Identical SHA on both remotes (content-addressed identity) |
| D3 | RAW WSJF ≠ execution order; #13 executes first despite rank 2 | #28's dependencies (#25/#26/#27) are not satisfiable yet; see 08-wsjf-5bu.md |
| D4 | Commercial lane (#21→#22→#23) runs in parallel with the visual port lane after #13 | Both depend only on #13; see 07-dependency-dag.md |
