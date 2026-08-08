import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  loadJsonCompatibleYaml,
  validateManifestStructure,
} from "../validate-nos-gallery-manifest.mjs";

const TEST_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(TEST_PATH), "..", "..", "..");
const MANIFEST_PATH = path.join(
  REPO_ROOT,
  ".agents",
  "contracts",
  "nos-gallery-transplant-manifest.yaml",
);

function loadManifest() {
  return loadJsonCompatibleYaml(MANIFEST_PATH);
}

function findingCodes(result) {
  return result.findings.map((finding) => finding.code);
}

test("the current Iteration 2 manifest is structurally self-consistent", () => {
  const manifest = loadManifest();
  const result = validateManifestStructure(manifest, {
    actualClosure: manifest.canonical_source.import_closure,
    targetRepo: REPO_ROOT,
  });

  assert.equal(result.pass, true);
  assert.deepEqual(result.findings, []);
  assert.equal(result.computed.capabilities_total, 33);
  assert.equal(result.computed.closure_total, 55);
});

test("fails closed when a source path is not in the pinned closure", () => {
  const manifest = loadManifest();
  const actualClosure = [...manifest.canonical_source.import_closure];
  manifest.canonical_source.import_closure.push("components/ghost.tsx");
  manifest.canonical_source.critical_source_hashes["components/ghost.tsx"] =
    "0".repeat(64);
  manifest.canonical_source.closure_coverage["components/ghost.tsx"] =
    "CAP-004";

  const result = validateManifestStructure(manifest, { actualClosure });

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("canonical_closure_drift"));
});

test("fails closed when disposition totals are hand-edited", () => {
  const manifest = loadManifest();
  manifest.summary.capabilities_by_disposition.ADAPT += 1;

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("disposition_count_mismatch"));
});

test("fails closed on a duplicate capability id", () => {
  const manifest = loadManifest();
  manifest.capabilities[1].id = manifest.capabilities[0].id;

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("capability_id"));
});

test("fails closed on an unowned defer", () => {
  const manifest = loadManifest();
  const deferred = manifest.capabilities.find(
    (capability) => capability.disposition === "DEFER",
  );
  delete deferred.future_owner;

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("unowned_defer"));
});

test("fails closed when issue dependencies drift", () => {
  const manifest = loadManifest();
  manifest.issue_ownership["#23"].depends_on = ["#22"];

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("dag_edge_mismatch"));
});

test("fails closed when a closure hash is missing", () => {
  const manifest = loadManifest();
  delete manifest.canonical_source.critical_source_hashes["app/page.tsx"];

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("closure_hash_coverage_mismatch"));
});

test("fails closed when a capability invents an owner", () => {
  const manifest = loadManifest();
  manifest.capabilities[0].issue_owner = ["#999"];

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("unknown_capability_owner"));
});

test("treats P1 semantic findings as a failed gate", () => {
  const manifest = loadManifest();
  const adapted = manifest.capabilities.find(
    (capability) => capability.disposition === "ADAPT",
  );
  adapted.intentional_deviation = null;

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("missing_intentional_deviation"));
});

test("fails closed when a capability owner edge is one-sided", () => {
  const manifest = loadManifest();
  const capability = manifest.capabilities.find(
    (item) => item.issue_owner?.[0] !== "UNASSIGNED",
  );
  const owner = capability.issue_owner[0];
  manifest.issue_ownership[owner].owns = manifest.issue_ownership[
    owner
  ].owns.filter((ownedId) => ownedId !== capability.id);

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("ownership_edge_mismatch"));
});

test("fails closed on a dangling issue ownership token", () => {
  const manifest = loadManifest();
  manifest.issue_ownership["#21"].owns.push("UNKNOWN-WORK-ITEM");

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("dangling_ownership_token"));
});

test("fails closed when a defer references an unregistered future owner", () => {
  const manifest = loadManifest();
  const deferred = manifest.capabilities.find(
    (capability) => capability.disposition === "DEFER",
  );
  deferred.future_owner = "UNREGISTERED-CANDIDATE";

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("unknown_future_owner"));
});

test("fails closed when matching dependency snapshots contain a cycle", () => {
  const manifest = loadManifest();
  manifest.issue_dependency_snapshot.issues["#14"].depends_on = ["#15"];
  manifest.issue_ownership["#14"].depends_on = ["#15"];

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("dag_cycle"));
});

test("fails closed when a planned target already exists", () => {
  const manifest = loadManifest();
  const capability = manifest.capabilities.find((item) =>
    item.targets?.some((target) => target.state === "planned"),
  );
  const target = capability.targets.find((item) => item.state === "planned");
  target.path = "package.json";

  const result = validateManifestStructure(manifest, {
    targetRepo: REPO_ROOT,
  });

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("planned_target_exists"));
});

test("fails closed when two capabilities claim the same target without a shared contract", () => {
  const manifest = loadManifest();
  const planned = manifest.capabilities.filter((item) =>
    item.targets?.some((target) => target.state === "planned"),
  );
  const firstTarget = planned[0].targets.find(
    (target) => target.state === "planned",
  );
  const secondTarget = planned[1].targets.find(
    (target) => target.state === "planned",
  );
  secondTarget.path = firstTarget.path;

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("target_ownership_conflict"));
});

test("fails closed when a capability target hash is stale", () => {
  const manifest = loadManifest();
  const capability = manifest.capabilities.find((item) =>
    item.targets?.some((target) => target.sha256),
  );
  capability.targets.find((target) => target.sha256).sha256 = "0".repeat(64);

  const result = validateManifestStructure(manifest, {
    targetRepo: REPO_ROOT,
  });

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("capability_target_hash"));
});

test("fails closed when typed canonical behavior values drift", () => {
  const manifest = loadManifest();
  manifest.behavioral_contracts.canonical_values.slider.wheel_scroll_threshold = 121;

  const result = validateManifestStructure(manifest);

  assert.equal(result.pass, false);
  assert.ok(findingCodes(result).includes("canonical_behavior_values"));
});
