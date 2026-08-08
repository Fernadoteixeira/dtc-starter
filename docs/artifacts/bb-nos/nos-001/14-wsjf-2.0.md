# 14 — WSJF 2.0 Prioritization (NOS-001)

**Issue:** #13 (NOS-001)
**Protocol:** Canonical Autonomous Execution v4.0

> Weighted Shortest Job First prioritization for child issues #14–#28.

---

## 1. WSJF Formula

```
WSJF = Cost of Delay / Job Size
Cost of Delay = Business Value + Time Criticality + Risk Reduction
```

---

## 2. Scoring Matrix

| Issue | Business Value (1-10) | Time Criticality (1-10) | Risk Reduction (1-10) | CoD (sum) | Job Size (1-13) | WSJF | Rank |
|---|---|---|---|---|---|---|---|
| #13 | 10 | 10 | 10 | 30 | 3 | 10.00 | 1 |
| #14 | 9 | 9 | 8 | 26 | 5 | 5.20 | 2 |
| #16 | 8 | 7 | 7 | 22 | 5 | 4.40 | 3 |
| #21 | 8 | 6 | 9 | 23 | 5 | 4.60 | 3 |
| #15 | 7 | 6 | 9 | 22 | 4 | 5.50 | 2 |
| #23 | 6 | 5 | 7 | 18 | 4 | 4.50 | 3 |
| #18 | 5 | 4 | 6 | 15 | 4 | 3.75 | 4 |
| #17 | 5 | 3 | 5 | 13 | 3 | 4.33 | 3 |
| #19 | 4 | 3 | 4 | 11 | 3 | 3.67 | 4 |
| #20 | 4 | 3 | 5 | 12 | 4 | 3.00 | 5 |
| #22 | 3 | 2 | 3 | 8 | 2 | 4.00 | 3 |
| #24 | 7 | 8 | 10 | 25 | 5 | 5.00 | 2 |
| #25 | 5 | 5 | 8 | 18 | 3 | 6.00 | 2 |
| #26 | 4 | 4 | 7 | 15 | 3 | 5.00 | 2 |
| #27 | 3 | 3 | 9 | 15 | 3 | 5.00 | 2 |
| #28 | 10 | 10 | 10 | 30 | 1 | 30.00 | 1* |

> *#28 has high WSJF but is terminal — it cannot start until all others are done.

---

## 3. Execution Priority (DAG-Constrained)

| Priority | Issue | Can Start When |
|---|---|---|
| 1 | #13 (NOS-001) | NOW (DoR PASS) |
| 2 | #14 (Navigation) | #13 DoD PASS |
| 3 | #21 (Commerce) | #13 DoD PASS (parallel with #14) |
| 4 | #15 (Accessibility) | #14 DoD PASS |
| 5 | #16 (Scene Discovery) | #14 DoD PASS (parallel with #15) |
| 6 | #17 (Parallax) | #15 + #16 DoD PASS |
| 7 | #18 (Progress) | #14 + #16 DoD PASS |
| 8 | #19 (Save/Share) | #14 DoD PASS (parallel with #18) |
| 9 | #20 (Details/SEO) | #14 + #16 DoD PASS (parallel with #19) |
| 10 | #22 (Inquiry) | #14 + #21 DoD PASS |
| 11 | #23 (Analytics) | #14 + #16 + #18 + #19 DoD PASS |
| 12 | #24 (Integration) | #15 + #17 + #18 + #19 + #20 + #21 + #22 + #23 DoD PASS |
| 13 | #25 (Visual Reg) | #24 DoD PASS (parallel with #26, #27) |
| 14 | #26 (Performance) | #24 DoD PASS (parallel with #25, #27) |
| 15 | #27 (Security) | #24 DoD PASS (parallel with #25, #26) |
| 16 | #28 (Release) | #24 + #25 + #26 + #27 DoD PASS + human approval |

---

## 4. Rationale

- **#13 is rank 1**: Without the manifest, nothing else can proceed. All issues depend on it.
- **#14 and #21 are rank 2-3**: They are the two independent lanes that fork from #13. Both are on critical paths.
- **#15 is high priority**: Accessibility is a contract requirement (nos-gallery-first-fold.yaml) and a legal/ethical imperative.
- **#24 is high WSJF**: Integration testing de-risks the entire transplant. Cannot start until all implementation issues are done.
- **#28 is terminal**: Highest WSJF but physically cannot start until everything else is done.

---

**End of artifact 14.**