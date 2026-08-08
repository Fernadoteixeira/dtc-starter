# 13 — Dependency DAG (NOS-001, Remediated)

**Issue:** #13 (NOS-001)  
**Protocol:** Canonical Autonomous Execution v4.0  
**Status:** Auto-Improve Iteration 1  
**Hard-scheduling SSOT:** literal `Depends on:` fields in current issue bodies #14–#32

> GO is never inherited. A successor may enter its own DoR only after every hard predecessor has DoD PASS.

## Current hard DAG

```mermaid
graph TD
    I13[#13 Manifest]
    I14[#14 Visual system]
    I15[#15 Ambient]
    I16[#16 ArtworkCard]
    I17[#17 Navigation]
    I18[#18 Drag and wheel]
    I19[#19 Parallax]
    I20[#20 Progress]
    I21[#21 Medusa source]
    I22[#22 Adapter truth]
    I23[#23 CTA and analytics]
    I24[#24 A11y and responsive]
    I25[#25 Visual parity]
    I26[#26 Performance]
    I29[#29 Resilience]
    I30[#30 E2E]
    I31[#31 Observability]
    I32[#32 Security]
    I27[#27 Rollout]
    I28[#28 Human release]

    I13 --> I14
    I13 --> I15
    I13 --> I16
    I13 --> I17
    I13 --> I21
    I14 --> I15
    I14 --> I16
    I14 --> I25
    I16 --> I17
    I16 --> I19
    I16 --> I20
    I16 --> I25
    I16 --> I29
    I17 --> I18
    I17 --> I20
    I17 --> I23
    I17 --> I24
    I17 --> I25
    I17 --> I29
    I18 --> I19
    I18 --> I24
    I18 --> I25
    I18 --> I26
    I18 --> I30
    I19 --> I24
    I19 --> I25
    I19 --> I26
    I19 --> I30
    I15 --> I24
    I15 --> I25
    I21 --> I22
    I21 --> I27
    I21 --> I29
    I21 --> I31
    I22 --> I23
    I22 --> I27
    I22 --> I29
    I22 --> I30
    I22 --> I31
    I22 --> I32
    I23 --> I24
    I23 --> I27
    I23 --> I30
    I23 --> I31
    I23 --> I32
    I20 --> I30
    I20 --> I31
    I20 --> I32
    I24 --> I25
    I24 --> I26
    I24 --> I27
    I24 --> I30
    I24 --> I32
    I29 --> I30
    I29 --> I31
    I29 --> I32
    I30 --> I32
    I31 --> I32
    I25 --> I27
    I26 --> I27
    I30 --> I27
    I31 --> I27
    I32 --> I27
    I25 --> I28
    I26 --> I28
    I29 --> I28
    I30 --> I28
    I31 --> I28
    I32 --> I28
    I27 --> I28
```

## Dependency table

| Issue | Hard predecessors |
|---|---|
| #13 | none |
| #14 | #13 |
| #15 | #13, #14 |
| #16 | #13, #14 |
| #17 | #13, #16 |
| #18 | #17 |
| #19 | #16, #18 |
| #20 | #16, #17 |
| #21 | #13 |
| #22 | #21 |
| #23 | #17, #22 |
| #24 | #15, #17, #18, #19, #23 |
| #25 | #14, #15, #16, #17, #18, #19, #24 |
| #26 | #18, #19, #24 |
| #29 | #16, #17, #21, #22 |
| #30 | #18, #19, #20, #22, #23, #24, #29 |
| #31 | #20, #21, #22, #23, #29 |
| #32 | #20, #22, #23, #24, #29, #30, #31 |
| #27 | #21, #22, #23, #24, #25, #26, #30, #31, #32 |
| #28 | #25, #26, #27, #29, #30, #31, #32, plus open implementation set |

## Canonical waves

The following waves satisfy all explicit hard predecessors. They are sequencing guidance, not inherited GO:

```text
W0   #13 remediation
W1   #14 || #21
W2   #15 || #16 || #22
W3   #17
W4   #18 || #20 || #23
W5   #19
W6   #29
W7   #24 || #31
W8   #25 || #26 || #30
W9   #32
W10  #27
W11  #28
```

## Long release chain

One of the longest hard chains is:

```text
#13 → #14 → #16 → #17 → #18 → #19 → #24 → #30 → #32 → #27 → #28
```

The commerce/resilience chain joins it through:

```text
#13 → #21 → #22 → #29 → #30/#31 → #32 → #27 → #28
```

## Reconciliation findings

1. #27 is rollout governance; security ownership moved to #32.
2. #24 is a specialized a11y/responsive gate, not the universal integration owner.
3. #29–#32 are mandatory runtime, E2E, observability and security gates.
4. #27's text consumes #29 resilience states but does not list #29 in `Depends on:`. No hard edge is invented here; the issue should be clarified before #27 DoR.
5. #28's phrase `all implementation issues under #12` is not a closed dependency set. It must be enumerated before terminal DoR.
6. GitHub native dependency metadata is not populated; the textual `Depends on:` fields remain the current SSOT.

## Gate propagation

- #13 DoR remains PASS; its DoD remains pending until T18–T23 complete.
- #14 and #21 remain blocked from their own DoR until #13 DoD PASS.
- Every later issue requires all listed predecessors to reach DoD PASS.
- #28 always requires an explicit human decision; technical evidence cannot authorize release or merge.
