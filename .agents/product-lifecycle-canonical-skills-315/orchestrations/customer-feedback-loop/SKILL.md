---
id: "ORCH-17"
name: "customer-feedback-loop"
title: "Customer Feedback Loop"
kind: "cross-domain-orchestration"
atomic_skill_count: 0
domains: ["02-discovery-research-market", "03-product-definition-requirements", "16-growth-experimentation-monetization", "20-support-customer-operations"]
version: "1.0.0"
---

# Customer Feedback Loop

## Outcome

Coordinate multiple canonical capability domains to produce one end-to-end product lifecycle result without duplicating their sources of truth.

## Participating domains

- **Discovery, Research and Market Intelligence** (`02-discovery-research-market`)
- **Product Definition and Requirements** (`03-product-definition-requirements`)
- **Growth, Experimentation and Monetization** (`16-growth-experimentation-monetization`)
- **Support and Customer Operations** (`20-support-customer-operations`)

## Operating sequence

1. Define the end-to-end outcome, actors, boundaries and measurable success.
2. Resolve the authoritative evidence and decisions from each participating domain.
3. Select only the atomic skills required by the risk and scope.
4. Establish cross-domain contracts, owners, dependencies and decision rights.
5. Sequence design, implementation, validation, rollout and operational readiness.
6. Reconcile conflicts using product outcome, safety, reversibility and evidence.
7. Produce an integrated acceptance matrix and traceability map.
8. Define telemetry, review cadence, rollback, learning and retirement conditions.

## Required integrated outputs

- executive outcome and scope;
- selected atomic skill inventory;
- cross-domain dependency graph;
- responsibility and decision-rights matrix;
- integrated roadmap and critical path;
- acceptance, verification and evidence matrix;
- security, privacy, accessibility, reliability and cost review;
- rollout, rollback, operations and learning plan.

## Guardrails

- Do not replace or fork atomic skill artifacts.
- Reference authoritative decisions rather than copying them.
- Escalate unresolved contradictions before implementation.
- Preserve domain ownership while enforcing end-to-end accountability.
- Do not declare readiness until critical evidence is traceable.

## Handoff

```yaml
orchestration_id: ORCH-17
outcome:
scope:
selected_skills: []
domain_owners: {}
decisions: []
dependencies: []
integrated_acceptance: []
verification_evidence: []
risks: []
rollout:
rollback:
operational_owner:
next_review:
```
