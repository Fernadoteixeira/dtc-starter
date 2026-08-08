# ADR-EF-01 — Ledger Context Resolution Options

**Status:** DECISION REQUIRED  
**Trigger:** EF-01 `PASS: EXPECTED_FAIL_CLOSED`  
**Decision owner:** human program lead

## Context

`@architect:nos` correctly resolves `software-architect`, four core skills, three orchestrations and `nos_gallery_first_fold`, but it does not route `session_state_ledger`. EF-01 proved the worker is blocked rather than receiving an inferred contract.

## Option A — Direct ledger contract on `@architect:nos`

```text
@architect:nos
  contracts:
    - nos_gallery_first_fold
    - session_state_ledger
```

### Benefits

- Minimal registry-only patch.
- Existing route/load/validator semantics already support it.
- Lowest implementation and verification cost.
- Corrected Architect Chain can run immediately after one authorized change.
- No context-inheritance ambiguity.

### Costs and risks

- Architecture worker loads session governance directly.
- Blurs the desired separation between governance orchestration and architecture reasoning.
- Repeats ledger context across shortcuts that may later be delegated by the orchestrator.
- Creates pressure to add governance contracts to every governed specialist.

### Evidence impact

- One additional `CONTRACT-LOAD-E` on the architect load bundle.
- No new receipt category or validator behavior.

## Option B — Validated delegated execution context

```text
@orchestrate:nos
  loads session_state_ledger
  emits validated delegation context
  delegates @architect:nos
  architect consumes the validated context receipt
```

### Benefits

- Preserves responsibility boundaries:
  - orchestrator owns authorization, ledger and gates;
  - architect owns architecture and dependency reasoning.
- Centralizes governance context instead of repeating it across specialists.
- Makes delegation lineage explicit and reusable for later BB-NOS workers.
- Better long-term fit for governed multi-agent execution.

### Costs and risks

- Current fabric has no validated context-inheritance receipt.
- Requires a new receipt/validation contract, likely including:
  - parent route and invocation identity;
  - delegated task hash;
  - inherited contract receipt references;
  - parent/child session linkage;
  - immutable authorization scope;
  - prevention of transitive or stale inheritance.
- Reopens the currently frozen fabric design.
- Requires new negative tamper tests and independent audit before Architect Chain execution.
- Higher implementation and host-proof cost.

### Evidence impact

A new category such as `DELEGATION-CONTEXT-E` would be required. Treating parent contract receipts as child loads without an explicit validated linkage would recreate the inference flaw proven by EF-01.

## Decision matrix

| Criterion | Option A | Option B |
|---|---:|---:|
| Minimal change | Strong | Weak |
| Uses current validator unchanged | Yes | No |
| Preserves role separation | Partial | Strong |
| Immediate Architect Chain recovery | Strong | Weak |
| Long-term multi-agent governance | Partial | Strong |
| New attack surface | Low | Medium/high |
| New tamper tests required | Minimal | Significant |
| Reopens frozen fabric design | No | Yes |

## Engineering assessment

- **Short-term delivery/risk optimum:** Option A.
- **Long-term governance architecture optimum:** Option B, only if delegated context becomes a first-class, validated receipt rather than implicit inheritance.

No option is selected by this artifact. The most recent explicit human decision must authorize the chosen path before `ARCH-EF-01` begins.
