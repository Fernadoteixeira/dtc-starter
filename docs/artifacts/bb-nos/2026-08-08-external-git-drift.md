# BB-NOS W0 — external Git baseline transition

Observed: `2026-08-08T20:02:52.824-03:00`

## Event

While semantic W0 validation was running, `main` and `origin/main` changed from:

`45ef2606512a5a26f0fee2a377ffda823423fce9`

to:

`38246f64e82b37670edf84d386b55b866fb425bf`

The reflog records the transition at `2026-08-08T19:40:14-03:00` with subject `Rebuild NOS Gallery transplant manifest for iteration 0` and Git author/committer `boldfernando <62515521+Fernadoteixeira@users.noreply.github.com>`.

This Codex session did not execute `git add`, `git commit`, `git push`, PR, merge, reset, checkout, rebase or any other Git mutation.

## Files incorporated by the external commit

- `.agents/contracts/nos-gallery-transplant-manifest.yaml`
- `apps/storefront/src/app/[countryCode]/(main)/products/[handle]/page.tsx`
- `docs/artifacts/bb-nos/2026-08-08-w0-base-e.md`
- `docs/artifacts/bb-nos/nos-001/2026-08-08-w0-supersession.md`
- `docs/artifacts/bb-nos/program-state.json`
- `docs/artifacts/bb-nos/program-state.md`
- `docs/artifacts/bb-nos/session-state-2026-08-08-w0.yaml`

## Preservation verification

The PDP bytes after the commit hash to:

`2a03a9d4854ca7277e6ae77102ed217bba93cc6bc8df7bd4b1d6a79a5c6e5dbf`

This is identical to BASE-E. The raw Git diff from the previous HEAD to the external commit for the PDP hashes to:

`d4ffe8059fbad8ef7916ab1f403c0bb7948678af66b9782c2cf834d6dd5ee48c`

The external commit changed no other runtime file. The remaining Iteration 1 manifest, validator and task-register edits stay unstaged in the working tree.

## Gate consequence

The previous target-HEAD assertion correctly failed closed. W0 is now explicitly reconciled to `38246f64e82b37670edf84d386b55b866fb425bf`; Git authorization remains forbidden and runtime W1 remains blocked until W0 DoD.
