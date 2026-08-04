---
name: "pressed-toggle"
title: "Pressed Toggle"
capability_id: "SK-096"
domain: "04-radix-ui"
package: "@radix-ui/react-toggle"
package_version: "1.1.1"
kind: "atomic-package-capability"
incorporation_assumption: "none"
status: "canonical"
version: "1.0.0"
---

# Pressed Toggle

## Purpose

Design, implement, review and troubleshoot **Pressed Toggle** using `@radix-ui/react-toggle` as a canonical capability, without assuming prior incorporation into the target repository.

## Use this skill when

- A requirement explicitly involves **Pressed Toggle**.
- A design or implementation decision depends on `@radix-ui/react-toggle`.
- You need to distinguish package availability from real product incorporation.
- You are auditing an existing implementation against the package's canonical capability.

## Do not use this skill when

- The task only asks whether `@radix-ui/react-toggle` is installed.
- Another skill owns the end-to-end orchestration and this capability is not a material decision point.
- The requested outcome can be met with a simpler native platform primitive and no package-specific behavior is required.

## Inputs

- interaction purpose
- controlled/uncontrolled state
- keyboard behavior
- accessible labels and content

## Outputs

- component composition
- state model
- keyboard/focus contract
- accessibility test cases

## Workflow

1. Clarify the desired outcome for pressed toggle and identify the user-visible or operational result.
2. Inspect the relevant `@radix-ui/react-toggle` contracts, runtime boundaries and surrounding architecture.
3. List success, empty, loading, invalid, timeout, duplicate, interrupted and recovery states that apply.
4. Choose the smallest canonical implementation that preserves accessibility, security and maintainability.
5. Define typed inputs, outputs, state transitions and failure semantics.
6. Specify proportional unit, integration, browser or end-to-end validation.
7. Record rollout, rollback, ownership and observability requirements before declaring completion.

## Guardrails

- Preserve keyboard navigation, focus management and semantic labeling.
- Do not remove accessibility attributes supplied by the primitive.
- Test controlled, uncontrolled, disabled, open and recovery states.

## Acceptance criteria

- [ ] The solution demonstrably provides pressed toggle, not only a wrapper or installed dependency.
- [ ] Inputs, outputs and state transitions are explicit and type-safe where applicable.
- [ ] Keyboard, responsive, reduced-motion and assistive-technology behavior are addressed when relevant.
- [ ] Security, privacy, tenant and data-boundary risks are either controlled or explicitly marked not applicable.
- [ ] Tests cover the highest-risk success and failure paths.
- [ ] Operational signals exclude sensitive payloads and have an identified owner.
- [ ] The capability can be traced from requirement to implementation evidence and acceptance result.

## Verification focus

- keyboard
- focus
- screen-reader semantics
- controlled and uncontrolled modes

## Evidence required

At least one item from each applicable group:

- **Implementation:** route, component, module, schema, configuration or executable policy.
- **Connection:** consumer, user journey, server operation, API or deployment path.
- **Validation:** automated test, reproducible manual check or static contract.
- **Operations:** log, metric, trace, alert, runbook or explicit not-applicable decision.
- **Governance:** owner, rollout plan, rollback plan and known limitations.

## Canonical maturity states

1. `AVAILABLE`: package exposes the capability.
2. `SCAFFOLDED`: wrapper or placeholder exists.
3. `IMPORTED`: application code imports the package.
4. `CONNECTED`: capability participates in a real journey or operation.
5. `TESTED`: proportional automated verification exists.
6. `OBSERVED`: production signal exists.
7. `PRODUCTION_GRADE`: security, operations, rollback and ownership are complete.

## Out of scope

- Assuming that installation equals implementation.
- Treating a generated UI wrapper as production readiness.
- Claiming accessibility, security or performance without direct evidence.
- Expanding into unrelated capabilities from the same package.

## Handoff contract

When this skill is consumed by a cross-package orchestration, return:

```yaml
capability_id: SK-096
package: @radix-ui/react-toggle
decision: adopted | rejected | deferred | replaced
implementation_evidence: []
test_evidence: []
operational_evidence: []
risks: []
next_actions: []
```
