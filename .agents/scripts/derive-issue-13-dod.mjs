import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadJsonCompatibleYaml,
  validateManifestAgainstRepositories,
} from "./validate-nos-gallery-manifest.mjs";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..");
const ISSUE_DIR = path.join(
  REPO_ROOT,
  "docs",
  "artifacts",
  "bb-nos",
  "nos-001",
);

const DEFAULT_PATHS = Object.freeze({
  manifest: path.join(
    REPO_ROOT,
    ".agents",
    "contracts",
    "nos-gallery-transplant-manifest.yaml",
  ),
  validationReceipt: path.join(
    ISSUE_DIR,
    "w0-iteration-2-semantic-validation.json",
  ),
  autoImprove: path.join(
    ISSUE_DIR,
    "agent-self-critique",
    "2026-08-08-iteration-2-auto-e.md",
  ),
  independentReview: path.join(
    ISSUE_DIR,
    "reviews",
    "2026-08-08-review-e2.json",
  ),
  repoGuardian: path.join(
    ISSUE_DIR,
    "reviews",
    "2026-08-08-repo-guardian-e2.json",
  ),
  supersession: path.join(ISSUE_DIR, "2026-08-08-w0-supersession.md"),
  baseEvidence: path.join(
    REPO_ROOT,
    "docs",
    "artifacts",
    "bb-nos",
    "2026-08-08-w0-base-e.md",
  ),
  externalDrift: path.join(
    REPO_ROOT,
    "docs",
    "artifacts",
    "bb-nos",
    "2026-08-08-external-git-drift.md",
  ),
  programState: path.join(
    REPO_ROOT,
    "docs",
    "artifacts",
    "bb-nos",
    "program-state.json",
  ),
  provenance: path.join(
    REPO_ROOT,
    "docs",
    "artifacts",
    "nos-gallery-provenance-manifest.json",
  ),
  completionRecord: path.join(
    ISSUE_DIR,
    "github",
    "issue-13-completion-record.json",
  ),
  completionVerification: path.join(
    ISSUE_DIR,
    "github",
    "issue-13-completion-verification.json",
  ),
  validator: path.join(
    REPO_ROOT,
    ".agents",
    "scripts",
    "validate-nos-gallery-manifest.mjs",
  ),
  validatorTests: path.join(
    REPO_ROOT,
    ".agents",
    "scripts",
    "__tests__",
    "validate-nos-gallery-manifest.test.mjs",
  ),
  sessionContract: path.join(
    REPO_ROOT,
    ".agents",
    "contracts",
    "session-state-ledger.md",
  ),
  sessionSchema: path.join(
    REPO_ROOT,
    ".agents",
    "contracts",
    "session-state-ledger.schema.yaml",
  ),
  visualContract: path.join(
    REPO_ROOT,
    ".agents",
    "contracts",
    "nos-gallery-first-fold.yaml",
  ),
});

const SEMANTIC_SUBJECT_FIELDS = Object.freeze([
  "canonical_source",
  "target_baseline",
  "target_architecture",
  "capabilities",
  "summary",
  "target_legacy_dispositions",
  "target_host_dispositions",
  "dependency_adaptations",
  "issue_dependency_snapshot",
  "issue_ownership",
  "behavioral_contracts",
  "medusa_invariants",
  "legacy_replacement_order",
  "residual_gaps",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort((left, right) => left.localeCompare(right))
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

export function hashSemanticManifestSubject(manifest) {
  const subject = {};
  for (const field of SEMANTIC_SUBJECT_FIELDS) {
    subject[field] = manifest[field];
  }
  return sha256(JSON.stringify(canonicalize(subject)));
}

function hashFile(filePath) {
  return sha256(readFileSync(filePath));
}

function readJsonIfPresent(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function readTextIfPresent(filePath) {
  return existsSync(filePath) ? readFileSync(filePath, "utf8") : "";
}

function criterion(id, criterionName, passed, evidenceRefs, reason) {
  return {
    id,
    criterion: criterionName,
    status: passed ? "PASS" : "FAIL",
    blocking: true,
    evidence_refs: evidenceRefs,
    verification_method: "Semantic, hash-bound evidence evaluation",
    reason,
  };
}

function hasNonEmptyCollection(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return Boolean(
    value && typeof value === "object" && Object.keys(value).length > 0,
  );
}

function isPassVerdict(value) {
  return ["PASS", "PASS_WITH_NON_BLOCKING_FINDINGS"].includes(value);
}

function reviewPasses(review, subjectHash) {
  return Boolean(
    review &&
    isPassVerdict(review.verdict) &&
    review.blocking_findings === 0 &&
    review.p0_count === 0 &&
    review.p1_count === 0 &&
    review.semantic_subject_sha256 === subjectHash,
  );
}

function contractHashesPass(manifest, currentHashes) {
  const declared = manifest.evidence?.CONTRACT_HASHES ?? {};
  return Object.entries(currentHashes).every(
    ([contractPath, currentHash]) => declared[contractPath] === currentHash,
  );
}

function currentPointersAgree(manifest, programState, provenance) {
  if (!programState || !provenance) {
    return false;
  }

  const manifestFrozen = manifest.freeze?.manifest_immutable === true;
  const expectedManifestState = manifestFrozen ? "FROZEN" : "NOT_FROZEN";
  const expectedDodState = manifestFrozen ? "PASS" : "NOT_PASSED";
  const provenanceSource = provenance.canonical_source ?? {};

  return Boolean(
    programState.issue_13?.manifest === expectedManifestState &&
    programState.issue_13?.dod === expectedDodState &&
    Boolean(programState.git_state?.head) &&
    provenanceSource.pinned_commit ===
      manifest.canonical_source?.pinned_commit &&
    provenanceSource.tree_sha === manifest.canonical_source?.tree_sha &&
    provenance.manifest_contract?.semantic_subject_sha256 ===
      hashSemanticManifestSubject(manifest) &&
    provenance.gates?.manifest === expectedManifestState &&
    provenance.gates?.visual_parity !== "GO" &&
    provenance.gates?.commercial_truth !== "GO",
  );
}

export function evaluateIssue13DoD(evidence) {
  const {
    manifest,
    liveValidation,
    validationReceipt,
    autoImproveText,
    independentReview,
    repoGuardian,
    supersessionText,
    programState,
    provenance,
    completionRecord,
    completionVerification,
    semanticSubjectSha256,
    validatorSha256,
    validatorTestsSha256,
    contractHashes,
    baseEvidenceExists,
    externalDriftEvidenceExists,
  } = evidence;

  const summary = manifest.summary ?? {};
  const canonical = manifest.canonical_source ?? {};
  const capabilities = manifest.capabilities ?? [];
  const declaredSourceHashes = Object.keys(
    canonical.critical_source_hashes ?? {},
  );
  const closure = canonical.import_closure ?? [];

  const semanticPass = Boolean(
    liveValidation?.pass &&
    liveValidation.p0_count === 0 &&
    liveValidation.p1_count === 0 &&
    liveValidation.computed?.closure_total === closure.length &&
    liveValidation.computed?.capabilities_total === capabilities.length,
  );
  const sourceTargetPass = Boolean(
    closure.length > 0 &&
    closure.length === declaredSourceHashes.length &&
    summary.canonical_import_closure_files === closure.length &&
    summary.canonical_import_closure_covered === closure.length &&
    summary.capabilities_total === capabilities.length &&
    summary.unknown_capabilities === 0 &&
    Array.isArray(manifest.target_legacy_dispositions) &&
    manifest.target_legacy_dispositions.length > 0 &&
    Array.isArray(manifest.target_host_dispositions) &&
    manifest.target_host_dispositions.length > 0,
  );
  const receiptPass = Boolean(
    validationReceipt?.pass &&
    validationReceipt.p0_count === 0 &&
    validationReceipt.p1_count === 0 &&
    validationReceipt.tests?.failed === 0 &&
    validationReceipt.tests?.passed >= 17 &&
    validationReceipt.semantic_subject_sha256 === semanticSubjectSha256 &&
    validationReceipt.validator_sha256 === validatorSha256 &&
    validationReceipt.validator_tests_sha256 === validatorTestsSha256,
  );
  const issueSet = Object.keys(
    manifest.issue_dependency_snapshot?.issues ?? {},
  ).sort();
  const ownershipSet = Object.keys(manifest.issue_ownership ?? {})
    .filter((key) => key.startsWith("#"))
    .sort();
  const dagPass = Boolean(
    issueSet.length > 0 &&
    JSON.stringify(issueSet) === JSON.stringify(ownershipSet) &&
    semanticPass,
  );
  const contractsPass = Boolean(
    contractHashesPass(manifest, contractHashes) &&
    hasNonEmptyCollection(manifest.behavioral_contracts) &&
    hasNonEmptyCollection(manifest.medusa_invariants) &&
    Array.isArray(manifest.legacy_replacement_order) &&
    manifest.legacy_replacement_order.length > 0,
  );
  const writeSetPass = Boolean(
    semanticPass &&
    manifest.manifest?.runtime_code_changes_since_w0_base === "none" &&
    baseEvidenceExists &&
    externalDriftEvidenceExists &&
    !liveValidation.findings?.some(
      (finding) => finding.code === "runtime_write_set",
    ),
  );
  const supersessionPass = Boolean(
    supersessionText.includes("SUPERSEDED_INVALID_DERIVATION") &&
    supersessionText.includes("reserved phrase") &&
    currentPointersAgree(manifest, programState, provenance),
  );
  const autoImprovePass = Boolean(
    autoImproveText.includes("AUTO-E2 verdict") &&
    autoImproveText.includes("PASS FOR ITERATION IMPROVEMENT ONLY") &&
    autoImproveText.includes("55/55") &&
    autoImproveText.includes("P0=0") &&
    autoImproveText.includes("P1=0"),
  );
  const independentReviewPass = reviewPasses(
    independentReview,
    semanticSubjectSha256,
  );
  const repoGuardianPass = reviewPasses(repoGuardian, semanticSubjectSha256);

  const riskCounts = {
    p0_count:
      (liveValidation?.p0_count ?? 1) +
      (independentReview?.p0_count ?? (independentReview ? 1 : 0)) +
      (repoGuardian?.p0_count ?? (repoGuardian ? 1 : 0)),
    p1_count:
      (liveValidation?.p1_count ?? 1) +
      (independentReview?.p1_count ?? (independentReview ? 1 : 0)) +
      (repoGuardian?.p1_count ?? (repoGuardian ? 1 : 0)),
  };
  const zeroBlockingRisk = Boolean(
    riskCounts.p0_count === 0 &&
    riskCounts.p1_count === 0 &&
    semanticPass &&
    independentReviewPass &&
    repoGuardianPass,
  );
  const completionPublished = Boolean(
    completionRecord?.published === true &&
      completionRecord.issue === "#13" &&
      completionRecord.repository === "Fernadoteixeira/dtc-starter" &&
      typeof completionRecord.comment_id === "number" &&
      completionRecord.comment_id > 0 &&
      typeof completionRecord.published_at === "string" &&
      completionRecord.published_at.length > 0 &&
      completionRecord.semantic_subject_sha256 === semanticSubjectSha256 &&
      typeof completionRecord.url === "string" &&
      completionRecord.url ===
        `https://github.com/Fernadoteixeira/dtc-starter/issues/13#issuecomment-${completionRecord.comment_id}` &&
      completionVerification?.remote_verified === true &&
      completionVerification.repository === "Fernadoteixeira/dtc-starter" &&
      completionVerification.issue_number === 13 &&
      completionVerification.comment_id === completionRecord.comment_id &&
      completionVerification.comment_url === completionRecord.url &&
      completionVerification.semantic_subject_sha256 === semanticSubjectSha256 &&
      typeof completionRecord.expected_comment_body_sha256 === "string" &&
      completionRecord.expected_comment_body_sha256.length > 0 &&
      typeof completionVerification.remote_comment_body_sha256 === "string" &&
      completionVerification.remote_comment_body_sha256.length > 0 &&
      completionVerification.remote_comment_body_sha256 ===
        completionRecord.expected_comment_body_sha256,
  );

  const criteria = [
    criterion(
      "DOD-01",
      "semantic_manifest_valid",
      semanticPass,
      [
        ".agents/contracts/nos-gallery-transplant-manifest.yaml",
        ".agents/scripts/validate-nos-gallery-manifest.mjs",
      ],
      semanticPass
        ? "Live semantic validation passed with zero P0/P1 findings"
        : "Live semantic validation is missing, stale or has P0/P1 findings",
    ),
    criterion(
      "DOD-02",
      "semantic_regression_tests_valid",
      receiptPass,
      [
        ".agents/scripts/__tests__/validate-nos-gallery-manifest.test.mjs",
        "docs/artifacts/bb-nos/nos-001/w0-iteration-2-semantic-validation.json",
      ],
      receiptPass
        ? "Executed positive and fail-closed tests are bound to current validator and semantic subject hashes"
        : "Semantic regression tests receipt is missing, stale or failed",
    ),
    criterion(
      "DOD-03",
      "source_target_ownership_complete",
      sourceTargetPass,
      [".agents/contracts/nos-gallery-transplant-manifest.yaml"],
      sourceTargetPass
        ? "55/55 canonical closure files are hashed and classified; target legacy and host matrices are explicit"
        : "Canonical import closure files or capability classifications are incomplete or contain unknown entries",
    ),
    criterion(
      "DOD-04",
      "issue_dependency_snapshot_reconciled",
      dagPass,
      [".agents/contracts/nos-gallery-transplant-manifest.yaml"],
      dagPass
        ? "19/19 issue nodes have matching ownership and dependency sets"
        : "Issue dependency graph snapshot is missing or inconsistent with ownership",
    ),
    criterion(
      "DOD-05",
      "contracts_behaviors_and_rollback_valid",
      contractsPass,
      [
        ".agents/contracts/session-state-ledger.md",
        ".agents/contracts/session-state-ledger.schema.yaml",
        ".agents/contracts/nos-gallery-first-fold.yaml",
        ".agents/contracts/nos-gallery-transplant-manifest.yaml",
      ],
      contractsPass
        ? "Contract hashes, behavioral invariants and replacement/rollback order are current"
        : "Contract hashes or behavioral/medusa invariants are stale or incomplete",
    ),
    criterion(
      "DOD-06",
      "w0_runtime_write_set_confined",
      writeSetPass,
      [
        "docs/artifacts/bb-nos/2026-08-08-w0-base-e.md",
        "docs/artifacts/bb-nos/2026-08-08-external-git-drift.md",
      ],
      writeSetPass
        ? "W0 changes are confined to governance evidence; external HEAD drift and PDP bytes are reconciled"
        : "W0 write set modified runtime code outside allowed baseline evidence",
    ),
    criterion(
      "DOD-07",
      "supersession_and_current_pointers_consistent",
      supersessionPass,
      [
        "docs/artifacts/bb-nos/nos-001/2026-08-08-w0-supersession.md",
        "docs/artifacts/bb-nos/program-state.json",
        "docs/artifacts/nos-gallery-provenance-manifest.json",
      ],
      supersessionPass
        ? "Historical false PASS/FROZEN claims are superseded and current pointers agree"
        : "Historical or current state pointers remain contradictory",
    ),
    criterion(
      "DOD-08",
      "auto_e_valid",
      autoImprovePass,
      [
        "docs/artifacts/bb-nos/nos-001/agent-self-critique/2026-08-08-iteration-2-auto-e.md",
      ],
      autoImprovePass
        ? "AUTO-E2 records measurable Iteration 1 to Iteration 2 improvement and retained residual risks"
        : "AUTO-E2 receipt is missing or does not record required 55/55 P0=0 P1=0 improvement",
    ),
    criterion(
      "DOD-09",
      "independent_review_e_valid",
      independentReviewPass,
      ["docs/artifacts/bb-nos/nos-001/reviews/2026-08-08-review-e2.json"],
      independentReviewPass
        ? "Independent REVIEW-E2 passed with zero P0/P1 findings on the current semantic subject"
        : "Independent REVIEW-E2 receipt is missing, stale or has open P0/P1 findings",
    ),
    criterion(
      "DOD-10",
      "repo_guardian_valid",
      repoGuardianPass,
      [
        "docs/artifacts/bb-nos/nos-001/reviews/2026-08-08-repo-guardian-e2.json",
      ],
      repoGuardianPass
        ? "REPO-GUARDIAN-E2 passed with zero P0/P1 findings on the current semantic subject"
        : "REPO-GUARDIAN-E2 receipt is missing, stale or has open P0/P1 findings",
    ),
    criterion(
      "DOD-11",
      "zero_open_p0_p1",
      zeroBlockingRisk,
      [
        "docs/artifacts/bb-nos/nos-001/w0-iteration-2-semantic-validation.json",
        "docs/artifacts/bb-nos/nos-001/reviews/",
      ],
      zeroBlockingRisk
        ? "Live validator and both independent reviews report zero P0/P1 findings"
        : `Derived risk counts are P0=${riskCounts.p0_count}, P1=${riskCounts.p1_count}`,
    ),
    criterion(
      "DOD-12",
      "github_completion_record_published",
      completionPublished,
      [
        "docs/artifacts/bb-nos/nos-001/github/issue-13-completion-record.json",
        "GitHub issue #13",
      ],
      completionPublished
        ? "Hash-bound completion record was published to GitHub issue #13 and remotely verified via read-back"
        : "GitHub completion record is not published, lacks remote read-back verification, or is not bound to current semantic subject",
    ),
  ];

  const localTechnicalPass = criteria
    .filter((item) => item.id !== "DOD-12")
    .every((item) => item.status === "PASS");
  const freezeTimestampValid = Boolean(
    manifest.manifest?.frozen_at &&
      completionRecord?.published_at &&
      new Date(manifest.manifest.frozen_at).getTime() >
        new Date(completionRecord.published_at).getTime(),
  );
  const freezeStatePass = Boolean(
    localTechnicalPass &&
      completionPublished &&
      freezeTimestampValid &&
      manifest.freeze?.status === "frozen" &&
      manifest.freeze?.manifest_immutable === true &&
      manifest.freeze?.downstream_ready === true &&
      manifest.freeze?.github_completion_record_published === true &&
      manifest.manifest?.status === "FROZEN" &&
      manifest.manifest?.gate_verdict === "PASS" &&
      manifest.manifest?.reserved_freeze_phrase_permitted === true &&
      typeof manifest.manifest?.frozen_at === "string",
  );
  criteria.push(
    criterion(
      "DOD-13",
      "manifest_freeze_transition_complete",
      freezeStatePass,
      [
        ".agents/contracts/nos-gallery-transplant-manifest.yaml",
        "docs/artifacts/bb-nos/program-state.json",
      ],
      freezeStatePass
        ? "Manifest freeze was applied only after all local and GitHub prerequisites passed"
        : "Manifest remains correctly unfrozen until every prerequisite, including GitHub publication, passes",
    ),
  );

  const dodPass = criteria.every((item) => item.status === "PASS");

  return {
    schema_version: 2,
    kind: "canonical-issue-13-dod-derived-evidence",
    task_id: "NOS-001-GOV-06",
    issue_id: "#13",
    generated_at: new Date().toISOString(),
    semantic_subject_sha256: semanticSubjectSha256,
    local_technical_pass: localTechnicalPass,
    external_completion_pass: completionPublished,
    freeze_eligible:
      localTechnicalPass && completionPublished && !freezeStatePass,
    dod_pass: dodPass,
    go_decision: dodPass ? "GO" : "NO-GO",
    total_criteria: criteria.length,
    passed_criteria: criteria.filter((item) => item.status === "PASS").length,
    failed_criteria: criteria.filter((item) => item.status === "FAIL").length,
    risk_profile: riskCounts,
    criteria,
    trust_profile: {
      evaluation_mode: "live_semantic_and_hash_bound_evidence",
      risk_counts_derived: true,
      missing_external_evidence_fails_closed: true,
      reserved_freeze_phrase_permitted:
        manifest.manifest?.reserved_freeze_phrase_permitted === true,
    },
  };
}

export function deriveIssue13DoD(options = {}) {
  const paths = { ...DEFAULT_PATHS, ...(options.paths ?? {}) };
  const manifest = options.manifest ?? loadJsonCompatibleYaml(paths.manifest);
  const semanticSubjectSha256 = hashSemanticManifestSubject(manifest);
  const liveValidation =
    options.liveValidation ??
    validateManifestAgainstRepositories({
      manifest,
      targetRepo: REPO_ROOT,
      canonicalRepo: manifest.canonical_source.local_checkout,
    });

  return evaluateIssue13DoD({
    manifest,
    liveValidation,
    validationReceipt:
      options.validationReceipt ?? readJsonIfPresent(paths.validationReceipt),
    autoImproveText:
      options.autoImproveText ?? readTextIfPresent(paths.autoImprove),
    independentReview:
      options.independentReview ?? readJsonIfPresent(paths.independentReview),
    repoGuardian: options.repoGuardian ?? readJsonIfPresent(paths.repoGuardian),
    supersessionText:
      options.supersessionText ?? readTextIfPresent(paths.supersession),
    programState: options.programState ?? readJsonIfPresent(paths.programState),
    provenance: options.provenance ?? readJsonIfPresent(paths.provenance),
    completionRecord:
      options.completionRecord ?? readJsonIfPresent(paths.completionRecord),
    completionVerification:
      options.completionVerification ??
      readJsonIfPresent(paths.completionVerification),
    semanticSubjectSha256,
    validatorSha256: hashFile(paths.validator),
    validatorTestsSha256: hashFile(paths.validatorTests),
    contractHashes: {
      ".agents/contracts/session-state-ledger.md": hashFile(
        paths.sessionContract,
      ),
      ".agents/contracts/session-state-ledger.schema.yaml": hashFile(
        paths.sessionSchema,
      ),
      ".agents/contracts/nos-gallery-first-fold.yaml": hashFile(
        paths.visualContract,
      ),
    },
    baseEvidenceExists: existsSync(paths.baseEvidence),
    externalDriftEvidenceExists: existsSync(paths.externalDrift),
  });
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  try {
    const result = deriveIssue13DoD();
    const output = `${JSON.stringify(result, null, 2)}\n`;
    if (result.dod_pass) {
      process.stdout.write(output);
    } else {
      process.stderr.write(output);
      process.exitCode = 1;
    }
  } catch (error) {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
