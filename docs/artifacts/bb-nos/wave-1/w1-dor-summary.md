# Wave W1 — DoR Summary & Execution Authorization

**Wave:** `W1`  
**Unlocked Issues:** `#14` (Copper/Umber/Linen Visual System) & `#21` (Fio Vivo Collection Source)  
**Predecessor:** `Wave W0 (Issue #13) = COMPLETE` 🟢  
**Manifest Status:** `NOS-GALLERY TRANSPLANT MANIFEST FROZEN` 🧊  
**Wave W1 DoR Status:** `PASS` 🟢  

---

## 1. Wave W1 Composition

| Issue ID | Domain | Scope | DoR Status | Next Milestone |
|---|---|---|---|---|
| **#14** | Storefront / Design | Copper/umber/linen visual tokens, scoped CSS under `[data-gallery-experience]` | 🟢 **PASS** | Implementation |
| **#21** | Backend / Commerce | Fio Vivo collection handle query, fail-closed product resolution | 🟢 **PASS** | Implementation |

---

## 2. Execution Discipline

- Parallelism permitted between #14 and #21 as they touch disjoint modules (`@dtc/gallery-experience` vs Medusa store collection queries).
- All changes must strictly follow Tailwind CSS v3 syntax (no Tailwind v4 syntax).
- Zero global CSS leak.
- Zero breaking changes to Medusa config or root layout.
