# Test Results

## pytest
- Platform: win32, Python 3.11.9, pytest 9.1.1
- Tests collected: 12
- Tests passed: 12
- Tests failed: 0
- Duration: 0.07s

### Test breakdown
- test_context.py::test_priority — PASSED
- test_router.py::test_default_local — PASSED
- test_router.py::test_schema_local — PASSED
- test_router.py::test_long_cloud — PASSED
- test_router.py::test_secret_local — PASSED
- test_router.py::test_vision — PASSED
- test_safety.py::test_inside — PASSED
- test_safety.py::test_escape — PASSED
- test_safety.py::test_allowlist — PASSED
- test_safety.py::test_deny — PASSED
- test_tools.py::test_json — PASSED
- test_tools.py::test_calc — PASSED

## Routing Matrix
- Cases: 16
- Passed: 16
- Failed: 0

## Doctor
- Verdict: GREEN
- Python: PASS
- Ollama CLI: PASS
- Ollama API: PASS
- Local model: PASS (gpt-oss:20b)
- Cloud model: PASS (glm-5.2:cloud)

## Capability Probes
- Local (gpt-oss:20b): 4/4 PASS
- Cloud (glm-5.2:cloud): 2/2 PASS
