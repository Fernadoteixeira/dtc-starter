---
name: "cross-package-orchestration"
kind: "orchestration-template"
atomic_skill_count: 0
---

# Cross-package Orchestration Template

## Outcome

Describe the end-to-end user or operational outcome.

## Consumed atomic skills

- `SK-000`
- `SK-000`

## Inputs

- business objective
- actors and authorization context
- data contracts
- reliability and compliance constraints

## Workflow

1. Resolve the journey and measurable outcome.
2. Select the minimum atomic capability set.
3. Define ownership between packages.
4. Specify dataflow and failure recovery.
5. Define integrated acceptance tests.
6. Define observability, rollout and rollback.

## Integration acceptance

- [ ] No duplicated source of truth.
- [ ] Package ownership boundaries are explicit.
- [ ] Authentication, authorization and tenant scope are enforced server-side.
- [ ] Accessibility and reduced-motion behavior are tested.
- [ ] PII-free observability covers the critical path.
- [ ] Rollback is independently executable.
