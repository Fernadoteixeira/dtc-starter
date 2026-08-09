import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evaluateIssue13DoD,
  hashSemanticManifestSubject,
} from "../derive-issue-13-dod.mjs";

function makeEvidence() {
  const manifest = {
    schema_version: 2,
    manifest: {
      status: "FROZEN",
      gate_verdict: "PASS",
      frozen_at: "2026-08-08T23:35:00.000Z",
      runtime_code_changes_since_w0_base: "none",
      reserved_freeze_phrase_permitted: true,
    },
    canonical_source: {
      pinned_commit: "canonical-sha",
      tree_sha: "tree-sha",
      import_closure: ["app/page.tsx"],
      critical_source_hashes: {
        "app/page.tsx": "source-hash",
      },
    },
    target_baseline: {
      head_sha: "target-sha",
    },
    target_architecture: {
      presentation_package: "packages/gallery-experience",
    },
    capabilities: [
      {
        id: "CAP-001",
        disposition: "ADAPT",
      },
    ],
    summary: {
      capabilities_total: 1,
      canonical_import_closure_files: 1,
      canonical_import_closure_covered: 1,
      unknown_capabilities: 0,
    },
    target_legacy_dispositions: [{ path: "legacy.tsx" }],
    target_host_dispositions: [{ path: "host.tsx" }],
    dependency_adaptations: [{ dependency: "react" }],
    issue_dependency_snapshot: {
      issues: {
        "#13": { depends_on: [] },
      },
    },
    issue_ownership: {
      "#13": { depends_on: [] },
    },
    behavioral_contracts: {
      navigation: "preserve",
    },
    medusa_invariants: {
      data: "host",
    },
    legacy_replacement_order: ["replace"],
    residual_gaps: ["none"],
    evidence: {
      CONTRACT_HASHES: {
        ".agents/contracts/session-state-ledger.md": "ledger-hash",
        ".agents/contracts/session-state-ledger.schema.yaml": "schema-hash",
        ".agents/contracts/nos-gallery-first-fold.yaml": "visual-hash",
      },
    },
    freeze: {
      status: "frozen",
      manifest_immutable: true,
      downstream_ready: true,
      github_completion_record_published: true,
    },
  };
  const semanticSubjectSha256 = hashSemanticManifestSubject(manifest);
  const validatorSha256 = "validator-hash";
  const validatorTestsSha256 = "validator-tests-hash";
  const review = {
    verdict: "PASS",
    blocking_findings: 0,
    p0_count: 0,
    p1_count: 0,
    semantic_subject_sha256: semanticSubjectSha256,
  };

  return {
    manifest,
    liveValidation: {
      pass: true,
      p0_count: 0,
      p1_count: 0,
      findings: [],
      computed: {
        closure_total: 1,
        capabilities_total: 1,
      },
    },
    validationReceipt: {
      pass: true,
      p0_count: 0,
      p1_count: 0,
      semantic_subject_sha256: semanticSubjectSha256,
      validator_sha256: validatorSha256,
      validator_tests_sha256: validatorTestsSha256,
      tests: {
        passed: 17,
        failed: 0,
      },
    },
    autoImproveText:
      "AUTO-E2 verdict: PASS FOR ITERATION IMPROVEMENT ONLY; 55/55; P0=0; P1=0",
    independentReview: review,
    repoGuardian: { ...review },
    supersessionText:
      "SUPERSEDED_INVALID_DERIVATION and the reserved phrase stays guarded",
    programState: {
      issue_13: {
        manifest: "FROZEN",
        dod: "PASS",
      },
      git_state: {
        head: "target-sha",
      },
    },
    provenance: {
      canonical_source: {
        pinned_commit: "canonical-sha",
        tree_sha: "tree-sha",
      },
      manifest_contract: {
        semantic_subject_sha256: semanticSubjectSha256,
      },
      gates: {
        manifest: "FROZEN",
        visual_parity: "FAIL_NOT_EXECUTED",
        commercial_truth: "FAIL_NOT_EXECUTED",
      },
    },
    completionRecord: {
      published: true,
      issue: "#13",
      repository: "Fernadoteixeira/dtc-starter",
      comment_id: 1,
      published_at: "2026-08-08T23:30:00.000Z",
      semantic_subject_sha256: semanticSubjectSha256,
      url: "https://github.com/Fernadoteixeira/dtc-starter/issues/13#issuecomment-1",
    },
    completionVerification: {
      remote_verified: true,
      repository: "Fernadoteixeira/dtc-starter",
      issue_number: 13,
      comment_id: 1,
      comment_url: "https://github.com/Fernadoteixeira/dtc-starter/issues/13#issuecomment-1",
      semantic_subject_sha256: semanticSubjectSha256,
      remote_comment_body_sha256: "body-sha256-hash",
      verified_at: "2026-08-08T23:31:00.000Z",
      verification_channel: "github_api_readback",
    },
    semanticSubjectSha256,
    validatorSha256,
    validatorTestsSha256,
    contractHashes: {
      ".agents/contracts/session-state-ledger.md": "ledger-hash",
      ".agents/contracts/session-state-ledger.schema.yaml": "schema-hash",
      ".agents/contracts/nos-gallery-first-fold.yaml": "visual-hash",
    },
    baseEvidenceExists: true,
    externalDriftEvidenceExists: true,
  };
}

test("passes only when every local, external and freeze criterion passes", () => {
  const result = evaluateIssue13DoD(makeEvidence());

  assert.equal(result.dod_pass, true);
  assert.equal(result.go_decision, "GO");
  assert.equal(result.total_criteria, 13);
  assert.equal(result.failed_criteria, 0);
  assert.deepEqual(result.risk_profile, { p0_count: 0, p1_count: 0 });
});

test("fails closed when live semantic validation reports a P0", () => {
  const evidence = makeEvidence();
  evidence.liveValidation.pass = false;
  evidence.liveValidation.p0_count = 1;
  evidence.liveValidation.findings = [{ severity: "P0", code: "ghost" }];

  const result = evaluateIssue13DoD(evidence);

  assert.equal(result.dod_pass, false);
  assert.equal(result.go_decision, "NO-GO");
  assert.equal(result.risk_profile.p0_count, 1);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-01").status,
    "FAIL",
  );
});

test("rejects a stale semantic regression receipt", () => {
  const evidence = makeEvidence();
  evidence.validationReceipt.validator_sha256 = "stale-validator";

  const result = evaluateIssue13DoD(evidence);

  assert.equal(
    result.criteria.find((item) => item.id === "DOD-02").status,
    "FAIL",
  );
  assert.equal(result.dod_pass, false);
});

test("rejects a review bound to a different semantic subject", () => {
  const evidence = makeEvidence();
  evidence.independentReview.semantic_subject_sha256 = "stale-subject";

  const result = evaluateIssue13DoD(evidence);

  assert.equal(
    result.criteria.find((item) => item.id === "DOD-09").status,
    "FAIL",
  );
  assert.equal(result.local_technical_pass, false);
});

test("keeps local PASS separate from missing GitHub authorization", () => {
  const evidence = makeEvidence();
  evidence.completionRecord = null;
  evidence.manifest.freeze = {
    status: "iteration_1_validation_pending",
    manifest_immutable: false,
    downstream_ready: false,
    github_completion_record_published: false,
  };
  evidence.manifest.manifest = {
    ...evidence.manifest.manifest,
    status: "iteration_1_semantic_validation_pending",
    gate_verdict: "REMEDIATION_REVIEW_PENDING",
    frozen_at: null,
    reserved_freeze_phrase_permitted: false,
  };
  evidence.semanticSubjectSha256 = hashSemanticManifestSubject(
    evidence.manifest,
  );
  evidence.validationReceipt.semantic_subject_sha256 =
    evidence.semanticSubjectSha256;
  evidence.independentReview.semantic_subject_sha256 =
    evidence.semanticSubjectSha256;
  evidence.repoGuardian.semantic_subject_sha256 =
    evidence.semanticSubjectSha256;
  evidence.provenance.manifest_contract.semantic_subject_sha256 =
    evidence.semanticSubjectSha256;
  evidence.programState.issue_13 = {
    manifest: "NOT_FROZEN",
    dod: "NOT_PASSED",
  };
  evidence.provenance.gates.manifest = "NOT_FROZEN";

  const result = evaluateIssue13DoD(evidence);

  assert.equal(result.local_technical_pass, true);
  assert.equal(result.external_completion_pass, false);
  assert.equal(result.dod_pass, false);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("does not accept an early freeze before publication", () => {
  const evidence = makeEvidence();
  evidence.completionRecord = null;

  const result = evaluateIssue13DoD(evidence);

  assert.equal(
    result.criteria.find((item) => item.id === "DOD-13").status,
    "FAIL",
  );
  assert.equal(result.freeze_eligible, false);
});

test("rejects completion record with nonnumeric anchor URL", () => {
  const evidence = makeEvidence();
  evidence.completionRecord.url =
    "https://github.com/Fernadoteixeira/dtc-starter/issues/13#issuecomment-bb-nos-w0-freeze";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record with arbitrary github.com URL", () => {
  const evidence = makeEvidence();
  evidence.completionRecord.url = "https://github.com/some/other/path";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record with numeric URL but missing comment_id", () => {
  const evidence = makeEvidence();
  delete evidence.completionRecord.comment_id;

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record with comment_id and URL mismatch", () => {
  const evidence = makeEvidence();
  evidence.completionRecord.comment_id = 999;
  evidence.completionRecord.url =
    "https://github.com/Fernadoteixeira/dtc-starter/issues/13#issuecomment-123";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record with wrong issue number", () => {
  const evidence = makeEvidence();
  evidence.completionRecord.issue = "#14";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record with wrong repository", () => {
  const evidence = makeEvidence();
  evidence.completionRecord.repository = "other/repo";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record with wrong semantic hash", () => {
  const evidence = makeEvidence();
  evidence.completionRecord.semantic_subject_sha256 = "wrong-hash";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record when remote completionVerification is missing", () => {
  const evidence = makeEvidence();
  evidence.completionVerification = null;

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record when completionVerification remote_verified is false", () => {
  const evidence = makeEvidence();
  evidence.completionVerification.remote_verified = false;

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record when completionVerification comment_id mismatches", () => {
  const evidence = makeEvidence();
  evidence.completionVerification.comment_id = 999;

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects completion record when completionVerification comment_url mismatches", () => {
  const evidence = makeEvidence();
  evidence.completionVerification.comment_url =
    "https://github.com/Fernadoteixeira/dtc-starter/issues/13#issuecomment-999";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-12").status,
    "FAIL",
  );
});

test("rejects freeze when frozen_at is equal to published_at", () => {
  const evidence = makeEvidence();
  evidence.manifest.manifest.frozen_at = "2026-08-08T23:30:00.000Z";
  evidence.completionRecord.published_at = "2026-08-08T23:30:00.000Z";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-13").status,
    "FAIL",
  );
});

test("rejects freeze when frozen_at is earlier than published_at", () => {
  const evidence = makeEvidence();
  evidence.manifest.manifest.frozen_at = "2026-08-08T23:25:00.000Z";
  evidence.completionRecord.published_at = "2026-08-08T23:30:00.000Z";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-13").status,
    "FAIL",
  );
});

test("passes freeze when frozen_at is strictly greater than published_at", () => {
  const evidence = makeEvidence();
  evidence.manifest.manifest.frozen_at = "2026-08-08T23:35:00.000Z";
  evidence.completionRecord.published_at = "2026-08-08T23:30:00.000Z";

  const result = evaluateIssue13DoD(evidence);
  assert.equal(
    result.criteria.find((item) => item.id === "DOD-13").status,
    "PASS",
  );
});



