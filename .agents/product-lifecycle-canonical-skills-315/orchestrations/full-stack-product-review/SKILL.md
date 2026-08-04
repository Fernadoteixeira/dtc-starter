---
id: "ORCH-02"
name: "full-stack-product-review"
title: "Full-stack Product Review"
kind: "cross-domain-orchestration"
atomic_skill_count: 0
domains: ["03-product-definition-requirements", "04-solution-architecture-systems", "07-frontend-client-applications", "08-backend-apis-services", "11-quality-testing-validation"]
version: "1.0.0"
---

# Full-stack Product Review

## Outcome

Coordinate multiple canonical capability domains to produce one end-to-end product lifecycle result without duplicating their sources of truth.

## Participating domains

- **Product Definition and Requirements** (`03-product-definition-requirements`)
- **Solution Architecture and Systems Design** (`04-solution-architecture-systems`)
- **Frontend and Client Applications** (`07-frontend-client-applications`)
- **Backend, APIs and Services** (`08-backend-apis-services`)
- **Quality, Testing and Validation** (`11-quality-testing-validation`)

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
orchestration_id: ORCH-02
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
