# NOS-001 Canonical Lineage Preflight — Evidence

- **Date:** 2026-08-07T14:42-03:00
- **Task:** Verify pinned SHA `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e` against both nos-gallery repositories.
- **Verdict:** PASS — no lineage conflict. SHA frozen as immutable source truth.

## Repositories checked

| Repo | Role | `refs/heads/main` | Resolves pinned SHA |
|---|---|---|---|
| `Fernadoteixeira/nos-gallery` | **Canonical** (explicitly named in issues #12/#13) | `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e` | yes (HEAD == main) |
| `boldfernando/nos-gallery` | Lineage/mirror alias (referenced in `nos-gallery-first-fold.yaml`) | `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e` | yes (HEAD == main) |

Both remotes advertise the **same commit SHA** for `main`/`HEAD`. Because Git is
content-addressed, an identical SHA guarantees the identical commit object and
tree — the two repos resolve to the same source truth.

## Commit object (verified locally)

```
commit 2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e
tree   ab05069f81f3763a108b55e1e49ff3845cc15267
parent 4c353741a508a9e7434e3a2ff865b4dea33a82f1
author/committer: boldfernando <222008630+boldfernando@users.noreply.github.com> 1785873403 -0300
subject: feat: initialize product-lifecycle-canonical-skills-315 agent with domain-specific skills, schemas, and orchestrations
```

## Local mirror

- Path: `apps/storefront/src/modules/nos-gallery` (nested git repo, exists)
- `HEAD` = `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e`, `origin` = `https://github.com/Fernadoteixeira/nos-gallery.git`
- Working tree exceptions (out of transplant scope, per frozen manifest): modified `AGENTS.md`, untracked `.turbo/`

## Commands run

```powershell
git ls-remote https://github.com/Fernadoteixeira/nos-gallery.git
# -> 2b6eb782... HEAD ; 2b6eb782... refs/heads/main
git ls-remote https://github.com/boldfernando/nos-gallery.git
# -> 2b6eb782... HEAD ; 2b6eb782... refs/heads/main
git -C apps/storefront/src/modules/nos-gallery rev-parse HEAD
# -> 2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e
git -C apps/storefront/src/modules/nos-gallery cat-file commit 2b6eb782...
# -> tree ab05069f81f3763a108b55e1e49ff3845cc15267 (verified above)
```

## Resolution

1. Pinned SHA `2b6eb782c5df5e78ed63fc4ad58d66487f2a7f6e` **verified on both remotes** and against the local mirror — frozen as immutable source truth.
2. **`Fernadoteixeira/nos-gallery` designated canonical** (matches issue #12/#13 and the frozen manifest `.agents/contracts/nos-gallery-transplant-manifest.yaml`).
3. **`boldfernando/nos-gallery` recorded as lineage/mirror alias** — the visual contract's `reference.source` citation resolves to the same commit/tree; the org-name difference is a hosting alias, not a divergence.
4. **No `CANONICAL_LINEAGE_CONFLICT`** — commits are identical, so no stop condition triggered.
