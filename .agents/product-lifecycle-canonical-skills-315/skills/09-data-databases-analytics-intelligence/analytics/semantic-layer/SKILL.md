---
id: "PLC-141"
name: "semantic-layer"
title: "Semantic Layer"
kind: "atomic-capability"
domain: "09-data-databases-analytics-intelligence"
domain_title: "Data, Databases, Analytics and Intelligence"
capability_pack: "analytics"
capability_pack_title: "Analytics"
technology_agnostic: true
language_agnostic: true
industry_agnostic: true
lifecycle_modes: ["discover", "model", "design", "implement", "validate", "govern", "operate"]
maturity: "canonical"
version: "1.0.0"
tags: ["analytics", "data", "databases", "layer", "semantic"]
---

# Semantic Layer

## Canonical outcome

Produce a defensible, executable and measurable approach to **semantic layer** within the broader capability of **analytics**, independent of industry, technology stack, programming language or delivery method.

## Capability context

Defines trustworthy metrics and decision-oriented analytical products.

This skill owns the decision and execution contract for **semantic layer**. It may audit an existing state, design a target state, guide implementation, verify results, govern ongoing operation or support controlled evolution.

## Invoke when

- The product lifecycle requires a material decision about **semantic layer**.
- Existing evidence is fragmented, implicit or not mapped to measurable outcomes.
- Multiple teams or systems need a shared contract for this capability.
- A review must distinguish availability, intention, implementation, validation and production readiness.

## Do not invoke when

- The request is only a naming, formatting or administrative task.
- The capability is incidental and already governed by a stronger end-to-end orchestration.
- No decision, artifact, control, implementation or verification outcome is required.

## Supported modes

- `discover`
- `model`
- `design`
- `implement`
- `validate`
- `govern`
- `operate`

A mode changes the depth and outputs, but never removes the evidence, guardrail or ownership requirements.

## Required inputs

- business or product objective
- actors, users and stakeholders
- current-state evidence
- constraints, policies and dependencies
- target outcomes and success measures
- known risks, assumptions and unresolved decisions

## Optional inputs

- existing architecture, process or design artifacts
- telemetry, research, financial or operational data
- regulatory, contractual or regional requirements
- release, migration or retirement constraints

## Required outputs

- Semantic Layer decision brief
- current-state findings and evidence
- target-state design or operating model
- prioritized actions with owners and sequencing
- acceptance criteria and verification plan
- risks, assumptions, trade-offs and rollback considerations

Expected artifact families for this domain include: data model, pipeline contract, metric definition, governance policy.

## Operating workflow

1. Frame the exact decision or outcome governed by semantic layer.
2. Establish scope, actors, boundaries, constraints and non-goals.
3. Collect and classify evidence as fact, signal, inference or assumption.
4. Model the current state and identify gaps, risks and leverage points.
5. Generate viable options, including the minimum effective option.
6. Compare options against outcomes, constraints, cost, risk and reversibility.
7. Define the selected target state, contracts, owners and dependencies.
8. Specify implementation or operating steps with acceptance evidence.
9. Define instrumentation, review cadence, rollback and learning loops.

## Decision rules

- Prefer evidence-backed and reversible decisions when uncertainty is material.
- Optimize the end-to-end product outcome, not a local component metric.
- Make exclusions, assumptions and confidence levels visible.
- Use the smallest mechanism that satisfies the required outcome and controls.
- Escalate unresolved safety, legal, security or irreversibility risks before execution.

## Domain guardrails

- Define ownership and source of truth.
- Protect sensitive data.
- Do not optimize metrics without semantic agreement.

## Definition of Ready

- [ ] The decision or outcome is stated in one unambiguous sentence.
- [ ] Scope, actors and system or process boundaries are identified.
- [ ] Required evidence and authoritative sources are available or explicitly missing.
- [ ] Constraints, non-goals and decision owners are recorded.
- [ ] Success measures and material risks are defined.

## Definition of Done

- [ ] The current and target states are documented.
- [ ] The selected approach is justified against at least one viable alternative.
- [ ] Inputs, outputs, responsibilities and dependencies are explicit.
- [ ] Success, failure, empty, degraded and recovery paths are addressed where relevant.
- [ ] Acceptance criteria are measurable and mapped to evidence.
- [ ] Security, privacy, accessibility, reliability and compliance are assessed or marked not applicable with rationale.
- [ ] Telemetry, review cadence, rollout and rollback are defined.
- [ ] A named owner accepts the resulting artifact or operational control.

## Verification and evidence

At least one relevant item from every applicable class is required:

- **Evidence class:** source evidence or reproducible observation
- **Evidence class:** decision record with rationale and alternatives
- **Evidence class:** implementation, process or policy artifact
- **Evidence class:** test, review, simulation or operational validation
- **Evidence class:** metric, log, trace, audit record or explicit measurement plan

Verification must demonstrate the product or operational outcome, not merely the existence of an artifact.

## Metrics

Use a minimal metric set tied to decisions. Candidate measures for this domain:

- data quality
- freshness
- lineage coverage
- decision adoption

Every metric must define owner, formula, source, segmentation, cadence, threshold and decision triggered.

## Failure modes and anti-patterns

- Treating installed tooling, documentation or intention as implemented capability.
- Producing recommendations without owners, acceptance criteria or sequencing.
- Optimizing a local metric while degrading the end-to-end outcome.
- Ignoring degraded, duplicate, timeout, rollback or transition states.
- Claiming certainty beyond the available evidence.

## Canonical maturity model

1. `IDENTIFIED`: the capability and owner are named.
2. `DEFINED`: scope, outcome and contract exist.
3. `DESIGNED`: target state and trade-offs are approved.
4. `IMPLEMENTED`: the capability operates in a real workflow.
5. `VERIFIED`: proportional evidence confirms behavior and controls.
6. `OBSERVED`: production or operational signals are actionable.
7. `GOVERNED`: ownership, review, change and retirement are controlled.
8. `OPTIMIZED`: measured learning improves value, cost, risk or experience.

## Handoff contract

```yaml
skill_id: PLC-141
skill: semantic-layer
mode: assess | design | implement | verify | operate | optimize | retire
decision:
status: proposed | approved | rejected | deferred | superseded
scope:
non_goals: []
evidence:
  facts: []
  signals: []
  inferences: []
  assumptions: []
artifacts: []
acceptance_criteria: []
verification_evidence: []
metrics: []
risks: []
dependencies: []
owners: []
rollout:
rollback:
open_questions: []
next_actions: []
```

## Composition guidance

- Consume upstream discovery, strategy, requirements or architecture evidence as applicable.
- Publish explicit contracts to downstream design, engineering, quality, operations and governance skills.
- Do not duplicate another skill's source of truth. Reference it and own only this capability's decisions.
- Escalate to a cross-domain orchestration when three or more domains must be coordinated to achieve one outcome.

## Reusable execution prompt

```text
Act as the accountable owner for Semantic Layer.

Objective:
[State the product or operational outcome.]

Context:
[Provide users, systems, constraints, evidence and current state.]

Execute:
1. Frame scope, non-goals and material decisions.
2. Separate facts, signals, inferences and assumptions.
3. Audit the current state against the canonical capability.
4. Design viable target-state options and compare trade-offs.
5. Select the minimum effective approach.
6. Produce executable actions, owners, dependencies and acceptance criteria.
7. Define verification, observability, rollout, rollback and review cadence.

Return:
- executive decision;
- evidence and confidence;
- current-state gaps;
- target-state design;
- prioritized action plan;
- acceptance and verification matrix;
- risks and unresolved questions.
```
