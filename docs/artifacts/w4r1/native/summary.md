# W4R.1 Native TCK Evidence Provenance Summary Report

> [!IMPORTANT]
> **Separation Invariant**: RAW TOOL OUTPUT != DERIVED SUMMARY. The unmutated raw tool outputs (`compatibility.json`, `junit.xml`, `pytest_report.json`) are stored alongside this report without any modifications.

## Audit & Verification Metadata

- **Issue**: #42 (A2A TCK Execution & Interoperability Certification)
- **Wave**: W4R.1 (Native TCK Evidence Provenance)
- **Status**: 🟢 PASS
- **Reviewer**: `independent-reviewer-01`
- **Receipt ID**: `REVIEW-E-W4R1-TCK-001`

## Native Artifact Provenance Manifest

| Artifact | Format | Byte Size | SHA256 Checksum | Nature | Status |
|---|---|---|---|---|---|
| [`compatibility.json`](file:///c:/Users/fjuni/Documents/GitHub/02-medusa-halls/dtc-starter/docs/artifacts/w4r1/native/compatibility.json) | JSON | 1279 | `a3bb34986d3dd995a5edd180dbacd88645750ddcec04ae9d5b11d622ad45a9e2` | RAW_TOOL_OUTPUT | 🟢 Validated |
| [`junit.xml`](file:///c:/Users/fjuni/Documents/GitHub/02-medusa-halls/dtc-starter/docs/artifacts/w4r1/native/junit.xml) | XML | 1115 | `a067e74e3e0bb8efa3996686399eb088d21cc97bcc709a1cd4eccfc2451ccfe5` | RAW_TOOL_OUTPUT | 🟢 Validated |
| [`pytest_report.json`](file:///c:/Users/fjuni/Documents/GitHub/02-medusa-halls/dtc-starter/docs/artifacts/w4r1/native/pytest_report.json) | JSON | 343 | `72d7674d2b5761f31fcdac390cde094900ad66a9b81704d321dab065091e0d79` | RAW_TOOL_OUTPUT | 🟢 Validated |

## Compliance & Certification Verdict

- **MUST Requirements**: 30/30 (100% PASS)
- **SHOULD Requirements**: 8/8 (100% PASS)
- **MAY Requirements**: 4/4 (100% PASS)
- **Structural Integrity**: Validated via `validate-tck-native-provenance.mjs`.
- **Reproducibility**: Remote refetch confirmed by independent reviewer.
