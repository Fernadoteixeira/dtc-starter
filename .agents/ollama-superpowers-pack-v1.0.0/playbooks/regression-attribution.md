# Regression attribution

1. Preserve current Git status, diff and stash list.
2. Do not `stash pop` before inspecting the patch.
3. Reproduce with a clean cache and an unchanged baseline.
4. Compare bundlers or execution paths only after the baseline is known.
5. Locate the invalid token in source and generated output.
6. Build a matrix: baseline/changed × warm/cold cache × bundler.
7. Call a defect pre-existing only when the clean baseline reproduces it.
