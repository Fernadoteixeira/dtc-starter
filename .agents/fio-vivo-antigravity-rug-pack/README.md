# Fio Vivo Antigravity RUG Pack

Copy `.agents` into the root of `dtc-starter`, then open `/agents` and select `fio-vivo-rug`.

Recommended routing:
- parent orchestrator: Gemini 3.1 Pro High
- CSS spec and visual audit: Pro
- CSS writer: Gemini 3.6 Flash Medium
- Git and build verification: Gemini 3.6 Flash Low

Antigravity agent frontmatter selects `pro`, `flash`, or `inherit`; choose the exact model and reasoning level in the session UI.

## Current BB03-T03 capsule

Authorized write file:
`packages/gallery-experience/src/styles/gallery-experience.css`

Required:
- scoped selectors
- `--dtc-gallery-*` tokens
- warm palette
- three-zone asymmetry
- active/adjacent ratio >= 1.30
- internal scene rail
- grain and vignette
- page vertical scroll preserved
- no module-internal vertical scrollbar

Forbidden:
- globals.css
- TS/TSX changes
- package or lockfiles
- nos-gallery submodule
- CI and Playwright
- commits and pushes

Flow:
A. bb03-css-spec + repo-guardian in parallel
B. bb03-css-implementer as the only writer
C. bb03-css-validator + build-verifier + repo-guardian in parallel
D. built-in browser agent via `/browser`
E. visual-auditor

Maximum two remediation rounds. Never run two writers in one workspace.
