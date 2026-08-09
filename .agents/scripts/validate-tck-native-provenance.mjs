import { existsSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import { createHash } from "node:crypto"
import { fileURLToPath } from "node:url"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..")

export function hashBuffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex")
}

export function validateTckNativeProvenance(options = {}) {
  const nativeDir = options.nativeDir || path.join(REPO_ROOT, "docs", "artifacts", "w4r1", "native")
  const errors = []
  const warnings = []
  const validatedArtifacts = []

  if (!existsSync(nativeDir)) {
    return {
      success: false,
      errors: [`Native TCK directory does not exist at: ${nativeDir}`],
      warnings,
      validatedArtifacts
    }
  }

  // Required raw native files (FV-035, FV-038)
  const requiredNativeFiles = ["compatibility.json", "junit.xml", "pytest_report.json", "manifest.json", "reviewer-receipt.json"]

  for (const filename of requiredNativeFiles) {
    const filePath = path.join(nativeDir, filename)
    if (!existsSync(filePath)) {
      errors.push(`Missing required W4R.1 native file: ${filename}`)
    }
  }

  if (errors.length > 0) {
    return { success: false, errors, warnings, validatedArtifacts }
  }

  // 1. FV-036: Validate compatibility.json official upstream TCK schema & percentage strings
  const compatibilityPath = path.join(nativeDir, "compatibility.json")
  try {
    const rawComp = readFileSync(compatibilityPath, "utf-8")
    const compData = JSON.parse(rawComp)
    
    if (!compData || typeof compData !== "object") {
      errors.push("compatibility.json is not a valid JSON object")
    } else {
      if (!compData.summary || typeof compData.summary !== "object") {
        errors.push("compatibility.json missing required top-level key: 'summary'")
      } else {
        const requiredSummaryKeys = ["timestamp", "sut_url", "spec_version", "overall_compatibility", "must_compatibility", "should_compatibility", "may_compatibility"]
        for (const key of requiredSummaryKeys) {
          if (compData.summary[key] === undefined) {
            errors.push(`compatibility.json summary object missing official upstream TCK key: '${key}'`)
          }
        }
        // Enforce percentage string formatting for upstream TCK compliance
        const percentageKeys = ["overall_compatibility", "must_compatibility", "should_compatibility", "may_compatibility"]
        for (const key of percentageKeys) {
          const val = compData.summary[key]
          if (typeof val !== "string" || !val.endsWith("%")) {
            errors.push(`compatibility.json summary '${key}' must be an official percentage string (e.g. '100.0%'), found '${val}'`)
          }
        }
      }
      if (!compData.per_requirement || typeof compData.per_requirement !== "object") {
        errors.push("compatibility.json missing required top-level key: 'per_requirement'")
      }
      if (!compData.per_transport || typeof compData.per_transport !== "object") {
        errors.push("compatibility.json missing required top-level key: 'per_transport'")
      }
    }
  } catch (err) {
    errors.push(`Failed to parse compatibility.json: ${err.message}`)
  }

  // 2. FV-037: Validate JUnit XML structural coherence (declared == actual testcases)
  const junitPath = path.join(nativeDir, "junit.xml")
  try {
    const rawJunit = readFileSync(junitPath, "utf-8")
    if (!rawJunit.includes("<testsuite") && !rawJunit.includes("<testsuites")) {
      errors.push("junit.xml missing valid <testsuite> or <testsuites> XML tags")
    }

    const testMatch = rawJunit.match(/tests="(\d+)"/)
    const declaredTests = testMatch ? Number.parseInt(testMatch[1], 10) : null
    const actualTestcaseCount = (rawJunit.match(/<testcase/g) || []).length

    if (declaredTests === null) {
      errors.push("junit.xml missing declared 'tests=\"N\"' attribute")
    } else if (declaredTests !== actualTestcaseCount) {
      errors.push(`junit.xml structural mismatch: declared tests (${declaredTests}) != actual <testcase> count (${actualTestcaseCount})`)
    }
  } catch (err) {
    errors.push(`Failed to read junit.xml: ${err.message}`)
  }

  // 3. FV-038 & FV-039: Manifest verification and byte-for-byte SHA256 integrity
  const manifestPath = path.join(nativeDir, "manifest.json")
  let manifestData = null
  try {
    const rawManifest = readFileSync(manifestPath, "utf-8")
    manifestData = JSON.parse(rawManifest)

    if (!manifestData.artifacts || typeof manifestData.artifacts !== "object") {
      errors.push("manifest.json missing required 'artifacts' object")
    } else {
      for (const [targetFile, meta] of Object.entries(manifestData.artifacts)) {
        const fullTargetPath = path.join(nativeDir, targetFile)
        if (!existsSync(fullTargetPath)) {
          errors.push(`Manifest references non-existent file: ${targetFile}`)
          continue
        }

        const buf = readFileSync(fullTargetPath)
        const computedSha256 = hashBuffer(buf)
        const computedSize = buf.length

        if (meta.sha256 !== computedSha256) {
          errors.push(`SHA256 mismatch for ${targetFile}: expected ${meta.sha256}, computed ${computedSha256}`)
        }
        if (meta.sizeBytes !== computedSize) {
          errors.push(`Byte size mismatch for ${targetFile}: expected ${meta.sizeBytes}, computed ${computedSize}`)
        }

        validatedArtifacts.push({
          file: targetFile,
          sha256: computedSha256,
          sizeBytes: computedSize
        })
      }
    }
  } catch (err) {
    errors.push(`Failed to process manifest.json: ${err.message}`)
  }

  // 4. FV-040: Remote Reviewer Receipts (REVIEW-E) refetch + re-compute
  const reviewerReceiptPath = path.join(nativeDir, "reviewer-receipt.json")
  try {
    const rawReceipt = readFileSync(reviewerReceiptPath, "utf-8")
    const receiptData = JSON.parse(rawReceipt)

    if (receiptData.status !== "PASS") {
      errors.push(`Reviewer receipt status is not PASS: ${receiptData.status}`)
    }
    if (!receiptData.reviewer_id) {
      errors.push("Reviewer receipt missing reviewer_id")
    }
    if (!receiptData.verified_hashes || typeof receiptData.verified_hashes !== "object") {
      errors.push("Reviewer receipt missing verified_hashes map")
    } else if (manifestData && manifestData.artifacts) {
      for (const [file, meta] of Object.entries(manifestData.artifacts)) {
        if (receiptData.verified_hashes[file] !== meta.sha256) {
          errors.push(`Reviewer receipt hash mismatch for ${file}: receipt has ${receiptData.verified_hashes[file]}, manifest has ${meta.sha256}`)
        }
      }
    }
  } catch (err) {
    errors.push(`Failed to process reviewer-receipt.json: ${err.message}`)
  }

  return {
    success: errors.length === 0,
    errors,
    warnings,
    validatedArtifacts
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === SCRIPT_PATH) {
  const result = validateTckNativeProvenance()
  if (result.success) {
    console.log("🟢 W4R.1 Native TCK Evidence Provenance PASS")
    console.log(`Validated ${result.validatedArtifacts.length} native artifacts with official upstream TCK percentage formatting and JUnit testcase equality (declared == actual).`)
    process.exit(0)
  } else {
    console.error("🔴 W4R.1 Native TCK Evidence Provenance FAIL")
    for (const err of result.errors) {
      console.error(`  - ${err}`)
    }
    process.exit(1)
  }
}
