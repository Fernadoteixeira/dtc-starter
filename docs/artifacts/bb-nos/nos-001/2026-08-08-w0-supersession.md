# NOS-001 W0 supersession record

Date: `2026-08-08`

This record preserves the historical evidence while invalidating conclusions that are not supported by the current canonical source or target checkout. It does not rewrite Git history.

## Superseded conclusions

| Historical artifact or claim | Current status | Evidence-backed reason |
|---|---|---|
| `t21/13-cross-agent-review.md` semantic PASS | `SUPERSEDED_FALSE_NEGATIVE` | The review missed five nonexistent canonical paths, inconsistent counts and a stale target inventory. |
| `t22` and `t22-r1` DoD PASS | `SUPERSEDED_INVALID_DERIVATION` | The derivation used existence checks, hardcoded `DOD-13 = PASS`, hardcoded zero P0/P1 counts and did not execute semantic source validation. |
| `t23` and `t23-r1` completion records | `SUPERSEDED_PREMATURE` | Their inputs were invalid and the required final GitHub completion record was not published. |
| `program-state` release candidate and frozen manifest | `SUPERSEDED_PREMATURE` | The live issue remained open with DoD not passed and the current contract itself remained mutable. |
| `95/95` as canonical parity | `HISTORICAL_TARGET_EVIDENCE_ONLY` | The suite exercised the parallel `GalleryExperience` implementation; it did not compare a faithful canonical transplant. |

## Canonical inventory defects invalidated

The previous `06-source-target-manifest.json` referenced files absent from `Fernadoteixeira/nos-gallery@2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e`:

1. `components/gallery.tsx`
2. `components/gallery-navigation-dots.tsx`
3. `hooks/use-slide-observer.ts`
4. `hooks/use-touch-swipe.ts`
5. `lib/artwork-availability.ts`

Its arrays contained 63 entries, its declared class counts summed to 67 and its declared total was 72. None of those totals may be reused as current truth.

## Historical runtime contamination

Commit `697e5e865b4e6a5652839ac528b728d3946d227c`, described as documentation/evidence work, also changed:

`packages/gallery-experience/src/styles/gallery-experience.css` — `35` insertions and `11` deletions.

Therefore the historical claim that Issue #13 made zero runtime mutations is false. The current remediation establishes a new W0 baseline and validates its own write-set without pretending the earlier mutation did not occur.

## Current recovery rule

The following sequence is mandatory:

1. rebuild the manifest from raw blobs at the pinned SHA;
2. classify real canonical capabilities only;
3. record current target duplicates as replacements, not missing features;
4. run semantic, fail-closed validation;
5. perform measurable self-critique/AUTO-E;
6. obtain an independent semantic REVIEW-E;
7. derive DoD from the executed evidence;
8. keep any GitHub publication requirement separate from local technical validation.

Until these steps pass, the reserved phrase `NOS-GALLERY TRANSPLANT MANIFEST FROZEN` is forbidden.
