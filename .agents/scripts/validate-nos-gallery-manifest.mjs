import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const SCRIPT_PATH = fileURLToPath(import.meta.url);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..");
const DEFAULT_MANIFEST_PATH = path.join(
  REPO_ROOT,
  ".agents",
  "contracts",
  "nos-gallery-transplant-manifest.yaml",
);

export const ALLOWED_DISPOSITIONS = Object.freeze([
  "PORT",
  "ADAPT",
  "KEEP_DTC",
  "DEFER",
  "REJECT_WITH_REASON",
]);
const ALLOWED_TARGET_STATES = new Set([
  "existing",
  "replace_existing",
  "reduce_to_facade",
  "host_boundary",
  "planned",
]);
const ALLOWED_NON_SOURCE_KINDS = new Set([
  "host_responsibility",
  "quality_gate",
  "rollout",
  "human_gate",
  "runtime",
  "deferred_candidate",
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function runGit(repositoryPath, args, options = {}) {
  const result = spawnSync("git", ["-C", repositoryPath, ...args], {
    encoding: options.binary ? null : "utf8",
    windowsHide: true,
  });

  if (result.status !== 0) {
    const errorText = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : result.stderr;
    throw new Error(`git ${args.join(" ")} failed: ${errorText.trim()}`);
  }

  return result.stdout;
}

function normalizeRepoPath(value) {
  return value.replaceAll("\\", "/").replace(/^\.\//, "");
}

function sortedUnique(values) {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right));
}

function resolveSourcePath(fromPath, specifier, sourceFiles) {
  if (!specifier.startsWith("@/") && !specifier.startsWith(".")) {
    return null;
  }

  const unresolved = specifier.startsWith("@/")
    ? specifier.slice(2)
    : path.posix.normalize(
        path.posix.join(path.posix.dirname(fromPath), specifier),
      );
  const candidates = [
    unresolved,
    `${unresolved}.ts`,
    `${unresolved}.tsx`,
    `${unresolved}.js`,
    `${unresolved}.jsx`,
    `${unresolved}.css`,
    path.posix.join(unresolved, "index.ts"),
    path.posix.join(unresolved, "index.tsx"),
    path.posix.join(unresolved, "index.js"),
    path.posix.join(unresolved, "index.jsx"),
  ];

  return candidates.find((candidate) => sourceFiles.has(candidate)) ?? null;
}

function extractLocalImportSpecifiers(source) {
  const specifiers = [];
  const patterns = [
    /\bfrom\s+["']([^"']+)["']/g,
    /\bimport\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(source)) !== null) {
      specifiers.push(match[1]);
    }
  }

  return sortedUnique(specifiers);
}

export function collectCanonicalImportClosure({
  canonicalRepo,
  pinnedCommit,
  entrypoints,
}) {
  const treeOutput = runGit(canonicalRepo, [
    "ls-tree",
    "-r",
    "--name-only",
    pinnedCommit,
  ]);
  const sourceFiles = new Set(
    treeOutput
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
  const queue = [...entrypoints];
  const visited = new Set();

  while (queue.length > 0) {
    const currentPath = normalizeRepoPath(queue.shift());
    if (visited.has(currentPath)) {
      continue;
    }
    if (!sourceFiles.has(currentPath)) {
      throw new Error(
        `Canonical entrypoint or import does not exist: ${currentPath}`,
      );
    }

    visited.add(currentPath);
    const blob = runGit(
      canonicalRepo,
      ["cat-file", "blob", `${pinnedCommit}:${currentPath}`],
      { binary: true },
    );
    const source = blob.toString("utf8");

    for (const specifier of extractLocalImportSpecifiers(source)) {
      const resolved = resolveSourcePath(currentPath, specifier, sourceFiles);
      if (resolved && !visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  return sortedUnique([...visited]);
}

export function loadJsonCompatibleYaml(manifestPath = DEFAULT_MANIFEST_PATH) {
  const source = readFileSync(manifestPath, "utf8");
  try {
    return JSON.parse(source);
  } catch (error) {
    throw new Error(
      `${manifestPath} must remain JSON-compatible YAML for dependency-free semantic validation: ${error.message}`,
    );
  }
}

function pushFinding(findings, severity, code, message, details = undefined) {
  findings.push({ severity, code, message, ...(details ? { details } : {}) });
}

function countDispositions(capabilities) {
  const counts = Object.fromEntries(
    ALLOWED_DISPOSITIONS.map((disposition) => [disposition, 0]),
  );
  for (const capability of capabilities) {
    if (Object.hasOwn(counts, capability.disposition)) {
      counts[capability.disposition] += 1;
    }
  }
  return counts;
}

function hasDependencyCycle(issueGraph) {
  const visiting = new Set();
  const visited = new Set();

  function visit(issue) {
    if (visiting.has(issue)) return true;
    if (visited.has(issue)) return false;
    visiting.add(issue);
    for (const predecessor of issueGraph[issue]?.depends_on ?? []) {
      if (Object.hasOwn(issueGraph, predecessor) && visit(predecessor)) {
        return true;
      }
    }
    visiting.delete(issue);
    visited.add(issue);
    return false;
  }

  return Object.keys(issueGraph).some(visit);
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

const EXPECTED_CANONICAL_VALUES = Object.freeze({
  layout: { card_step_mobile_px: 340, card_step_desktop_px: 564 },
  slider: {
    drag_resistance: 0.4,
    swipe_viewport_threshold_ratio: 0.08,
    velocity_threshold_px_per_ms: 0.3,
    wheel_resistance: 0.3,
    wheel_scroll_threshold: 120,
    wheel_reset_delay_ms: 150,
    momentum_easing: 0.1,
    animation_timeout_ms: 800,
  },
  motion: {
    scene_duration_s: 0.52,
    card_duration_s: 0.55,
    ambience_duration_s: 0.8,
    control_duration_s: 0.28,
    scene_ease: [0.22, 1, 0.36, 1],
    gallery_ease: [0.32, 0.72, 0, 1],
    pointer_spring: { stiffness: 180, damping: 28, mass: 0.75 },
    scene_dead_band_ratio: 0.08,
    scene_discovery_delay_ms: 650,
  },
  effects: {
    parallax_x_px: 10,
    parallax_y_px: 8,
    rotate_x_deg: 4,
    rotate_y_deg: 5,
  },
  source: "lib/constants.ts at canonical pinned commit",
});

export function validateManifestStructure(manifest, options = {}) {
  const findings = [];
  const capabilities = Array.isArray(manifest.capabilities)
    ? manifest.capabilities
    : [];
  const capabilityIds = new Set();

  if (manifest.schema_version !== 2) {
    pushFinding(findings, "P0", "schema_version", "schema_version must be 2");
  }
  if (!manifest.manifest || manifest.manifest.iteration < 2) {
    pushFinding(
      findings,
      "P0",
      "manifest_iteration",
      "Iteration 2 or later is required",
    );
  }
  if (capabilities.length === 0) {
    pushFinding(
      findings,
      "P0",
      "capabilities_empty",
      "Capability matrix is empty",
    );
  }

  const targetRowsByPath = new Map();
  for (const capability of capabilities) {
    if (!capability.id || capabilityIds.has(capability.id)) {
      pushFinding(
        findings,
        "P0",
        "capability_id",
        `Capability id is missing or duplicated: ${capability.id ?? "<missing>"}`,
      );
    } else {
      capabilityIds.add(capability.id);
    }

    if (!ALLOWED_DISPOSITIONS.includes(capability.disposition)) {
      pushFinding(
        findings,
        "P0",
        "invalid_disposition",
        `${capability.id ?? "<missing>"} has invalid disposition ${capability.disposition}`,
      );
    }
    if (!capability.issue_owner) {
      pushFinding(
        findings,
        "P1",
        "missing_owner",
        `${capability.id ?? "<missing>"} has no issue_owner`,
      );
    }
    if (!capability.adaptation_reason) {
      pushFinding(
        findings,
        "P1",
        "missing_rationale",
        `${capability.id ?? "<missing>"} has no adaptation_reason`,
      );
    }
    if (!Array.isArray(capability.behavior_preserved)) {
      pushFinding(
        findings,
        "P1",
        "missing_behavior_contract",
        `${capability.id ?? "<missing>"} has no behavior_preserved list`,
      );
    }
    if (
      capability.disposition === "DEFER" &&
      (!capability.future_owner || !capability.future_target)
    ) {
      pushFinding(
        findings,
        "P0",
        "unowned_defer",
        `${capability.id ?? "<missing>"} defers work without future_owner and future_target`,
      );
    }
  }

  const computedCounts = countDispositions(capabilities);
  const declaredCounts = manifest.summary?.capabilities_by_disposition ?? {};
  const declaredTotal = manifest.summary?.capabilities_total;

  if (declaredTotal !== capabilities.length) {
    pushFinding(
      findings,
      "P0",
      "capability_total_mismatch",
      `Declared ${declaredTotal}; computed ${capabilities.length}`,
    );
  }
  for (const disposition of ALLOWED_DISPOSITIONS) {
    if (declaredCounts[disposition] !== computedCounts[disposition]) {
      pushFinding(
        findings,
        "P0",
        "disposition_count_mismatch",
        `${disposition}: declared ${declaredCounts[disposition]}; computed ${computedCounts[disposition]}`,
      );
    }
  }

  const dagSnapshot = manifest.issue_dependency_snapshot?.issues ?? {};
  const issueOwnership = manifest.issue_ownership ?? {};
  const nonSourceWorkItems = issueOwnership._non_source_work_items ?? {};
  const ownership = Object.fromEntries(
    Object.entries(issueOwnership).filter(([issue]) => /^#\d+$/.test(issue)),
  );
  const dagIssues = Object.keys(dagSnapshot).sort();
  const ownershipIssues = Object.keys(ownership).sort();
  if (JSON.stringify(dagIssues) !== JSON.stringify(ownershipIssues)) {
    pushFinding(
      findings,
      "P0",
      "dag_issue_set_mismatch",
      "Issue ownership and dependency snapshot cover different issue sets",
      { dagIssues, ownershipIssues },
    );
  }
  for (const issue of dagIssues) {
    const expected = sortedUnique(dagSnapshot[issue].depends_on ?? []);
    const actual = sortedUnique(ownership[issue]?.depends_on ?? []);
    if (JSON.stringify(expected) !== JSON.stringify(actual)) {
      pushFinding(
        findings,
        "P0",
        "dag_edge_mismatch",
        `${issue} dependency edges differ`,
        { expected, actual },
      );
    }
  }
  if (hasDependencyCycle(dagSnapshot)) {
    pushFinding(
      findings,
      "P0",
      "dag_cycle",
      "Issue dependency snapshot contains a directed cycle",
    );
  }

  for (const [workItemId, workItem] of Object.entries(nonSourceWorkItems)) {
    if (
      !workItem ||
      !ALLOWED_NON_SOURCE_KINDS.has(workItem.kind) ||
      (workItem.issue_owner !== "UNASSIGNED" &&
        !dagIssues.includes(workItem.issue_owner))
    ) {
      pushFinding(
        findings,
        "P0",
        "invalid_non_source_work_item",
        `Non-source work item ${workItemId} has an invalid kind or issue_owner`,
      );
    }
  }

  const declaredClosure = sortedUnique(
    manifest.canonical_source?.import_closure ?? [],
  );
  const hashedClosure = Object.keys(
    manifest.canonical_source?.critical_source_hashes ?? {},
  ).sort();
  if (JSON.stringify(declaredClosure) !== JSON.stringify(hashedClosure)) {
    pushFinding(
      findings,
      "P0",
      "closure_hash_coverage_mismatch",
      "Every import-closure file must have exactly one raw Git blob hash",
    );
  }
  const closureCoverage = manifest.canonical_source?.closure_coverage ?? {};
  const coveragePaths = Object.keys(closureCoverage).sort();
  if (JSON.stringify(declaredClosure) !== JSON.stringify(coveragePaths)) {
    pushFinding(
      findings,
      "P0",
      "closure_coverage_mismatch",
      "Every import-closure file must have exactly one coverage classification",
    );
  }
  for (const [sourcePath, coverageId] of Object.entries(closureCoverage)) {
    const isCapability = capabilityIds.has(coverageId);
    const isExclusion = Boolean(manifest.scope_exclusions?.[coverageId]);
    if (!isCapability && !isExclusion) {
      pushFinding(
        findings,
        "P0",
        "unknown_closure_coverage",
        `${sourcePath} references unknown coverage id ${coverageId}`,
      );
    }
  }
  for (const capability of capabilities) {
    for (const sourcePath of capability.source_paths ?? []) {
      if (closureCoverage[sourcePath] !== capability.id) {
        pushFinding(
          findings,
          "P0",
          "capability_source_coverage_mismatch",
          `${capability.id} does not own its declared source path ${sourcePath}`,
        );
      }
    }
    for (const target of capability.targets ?? []) {
      if (!target.path || !ALLOWED_TARGET_STATES.has(target.state)) {
        pushFinding(
          findings,
          "P0",
          "invalid_target_state",
          `${capability.id} has an invalid target path/state`,
        );
      }
      const targetRows = targetRowsByPath.get(target.path) ?? [];
      targetRows.push({ capability, target });
      targetRowsByPath.set(target.path, targetRows);
    }
    const owners = Array.isArray(capability.issue_owner)
      ? capability.issue_owner
      : [capability.issue_owner];
    for (const owner of owners) {
      if (owner === "UNASSIGNED" && capability.disposition === "DEFER") {
        continue;
      }
      if (!dagIssues.includes(owner)) {
        pushFinding(
          findings,
          "P0",
          "unknown_capability_owner",
          `${capability.id} references an owner absent from the live issue snapshot: ${owner}`,
        );
      } else if (!ownership[owner]?.owns?.includes(capability.id)) {
        pushFinding(
          findings,
          "P0",
          "ownership_edge_mismatch",
          `${capability.id} declares ${owner}, but ${owner}.owns does not include it`,
        );
      }
    }
    if (
      capability.disposition === "DEFER" &&
      !Object.hasOwn(nonSourceWorkItems, capability.future_owner)
    ) {
      pushFinding(
        findings,
        "P0",
        "unknown_future_owner",
        `${capability.id} future_owner ${capability.future_owner} is absent from the non-source work-item registry`,
      );
    }
    if (
      capability.disposition !== "PORT" &&
      !capability.intentional_deviation
    ) {
      pushFinding(
        findings,
        "P1",
        "missing_intentional_deviation",
        `${capability.id} has no explicit intentional_deviation`,
      );
    }
  }

  for (const [issue, entry] of Object.entries(ownership)) {
    for (const ownedId of entry.owns ?? []) {
      if (capabilityIds.has(ownedId)) {
        const capability = capabilities.find((item) => item.id === ownedId);
        const capabilityOwners = Array.isArray(capability.issue_owner)
          ? capability.issue_owner
          : [capability.issue_owner];
        if (!capabilityOwners.includes(issue)) {
          pushFinding(
            findings,
            "P0",
            "ownership_edge_mismatch",
            `${issue}.owns includes ${ownedId}, but the capability does not declare ${issue}`,
          );
        }
      } else if (Object.hasOwn(nonSourceWorkItems, ownedId)) {
        if (nonSourceWorkItems[ownedId].issue_owner !== issue) {
          pushFinding(
            findings,
            "P0",
            "non_source_owner_mismatch",
            `${issue}.owns includes ${ownedId}, but the registry assigns it to ${nonSourceWorkItems[ownedId].issue_owner}`,
          );
        }
      } else {
        pushFinding(
          findings,
          "P0",
          "dangling_ownership_token",
          `${issue}.owns references unknown id ${ownedId}`,
        );
      }
    }
  }

  for (const [targetPath, targetRows] of targetRowsByPath) {
    if (targetRows.length < 2) continue;
    const sharedContracts = new Set(
      targetRows
        .map(({ target }) => target.shared_target_contract)
        .filter(Boolean),
    );
    const states = new Set(targetRows.map(({ target }) => target.state));
    const dispositions = new Set(
      targetRows.map(({ capability }) => capability.disposition),
    );
    if (
      sharedContracts.size !== 1 ||
      targetRows.some(({ target }) => !target.shared_target_contract) ||
      states.size !== 1 ||
      dispositions.size !== 1
    ) {
      pushFinding(
        findings,
        "P0",
        "target_ownership_conflict",
        `Target ${targetPath} is shared without one explicit, state/disposition-compatible contract`,
      );
    }
  }

  if (
    canonicalJson(manifest.behavioral_contracts?.canonical_values) !==
    canonicalJson(EXPECTED_CANONICAL_VALUES)
  ) {
    pushFinding(
      findings,
      "P0",
      "canonical_behavior_values",
      "Typed canonical behavior values differ from the pinned lib/constants.ts contract",
    );
  }

  if (options.targetRepo) {
    for (const [targetPath, targetRows] of targetRowsByPath) {
      const absoluteTarget = path.join(options.targetRepo, targetPath);
      for (const { capability, target } of targetRows) {
        if (target.state === "planned" && existsSync(absoluteTarget)) {
          pushFinding(
            findings,
            "P0",
            "planned_target_exists",
            `${capability.id} target marked planned already exists: ${targetPath}`,
          );
        }
        if (
          [
            "existing",
            "replace_existing",
            "reduce_to_facade",
            "host_boundary",
          ].includes(target.state) &&
          !existsSync(absoluteTarget)
        ) {
          pushFinding(
            findings,
            "P0",
            "missing_existing_target",
            `${capability.id} target marked ${target.state} does not exist: ${targetPath}`,
          );
        }
        if (target.sha256 && existsSync(absoluteTarget)) {
          const actualHash = sha256(readFileSync(absoluteTarget));
          if (actualHash !== target.sha256) {
            pushFinding(
              findings,
              "P0",
              "capability_target_hash",
              `${capability.id} target hash differs: ${targetPath}`,
              { expected: target.sha256, actual: actualHash },
            );
          }
        }
      }
    }
  }

  if (options.actualClosure) {
    const actualClosure = sortedUnique(options.actualClosure);
    if (JSON.stringify(actualClosure) !== JSON.stringify(declaredClosure)) {
      pushFinding(
        findings,
        "P0",
        "canonical_closure_drift",
        "Declared canonical import closure differs from the pinned Git tree",
        {
          missingFromManifest: actualClosure.filter(
            (sourcePath) => !declaredClosure.includes(sourcePath),
          ),
          absentFromCanonical: declaredClosure.filter(
            (sourcePath) => !actualClosure.includes(sourcePath),
          ),
        },
      );
    }
  }

  return {
    pass: findings.length === 0,
    findings,
    computed: {
      capabilities_total: capabilities.length,
      capabilities_by_disposition: computedCounts,
      closure_total: declaredClosure.length,
      issue_nodes_total: dagIssues.length,
      non_source_work_items_total: Object.keys(nonSourceWorkItems).length,
      capability_target_rows_total: [...targetRowsByPath.values()].reduce(
        (total, rows) => total + rows.length,
        0,
      ),
    },
  };
}

export function validateManifestAgainstRepositories({
  manifest,
  targetRepo = REPO_ROOT,
  canonicalRepo = manifest.canonical_source?.local_checkout,
}) {
  const canonical = manifest.canonical_source;
  const findings = [];
  const canonicalHead = runGit(canonicalRepo, ["rev-parse", "HEAD"]).trim();
  const canonicalOrigin = runGit(canonicalRepo, [
    "rev-parse",
    "origin/main",
  ]).trim();
  const canonicalTree = runGit(canonicalRepo, [
    "rev-parse",
    `${canonical.pinned_commit}^{tree}`,
  ]).trim();
  const targetHead = runGit(targetRepo, ["rev-parse", "HEAD"]).trim();
  const targetBranch = runGit(targetRepo, ["branch", "--show-current"]).trim();
  let canonicalRemote = null;
  let targetRemote = null;
  try {
    canonicalRemote = runGit(canonicalRepo, [
      "ls-remote",
      "origin",
      "refs/heads/main",
    ])
      .trim()
      .split(/\s+/)[0];
  } catch (error) {
    pushFinding(findings, "P0", "canonical_remote_unavailable", error.message);
  }
  try {
    targetRemote = runGit(targetRepo, [
      "ls-remote",
      "origin",
      "refs/heads/main",
    ])
      .trim()
      .split(/\s+/)[0];
  } catch (error) {
    pushFinding(findings, "P0", "target_remote_unavailable", error.message);
  }

  if (canonicalHead !== canonical.pinned_commit) {
    pushFinding(findings, "P0", "canonical_head", "Canonical HEAD drifted");
  }
  if (canonicalOrigin !== canonical.pinned_commit) {
    pushFinding(
      findings,
      "P0",
      "canonical_origin",
      "Canonical origin/main drifted",
    );
  }
  if (canonicalRemote !== canonical.pinned_commit) {
    pushFinding(
      findings,
      "P0",
      "canonical_remote",
      "Canonical remote main differs from the pinned commit",
    );
  }
  if (canonicalTree !== canonical.tree_sha) {
    pushFinding(findings, "P0", "canonical_tree", "Canonical tree SHA differs");
  }
  if (targetHead !== manifest.target_baseline.head_sha) {
    pushFinding(
      findings,
      "P0",
      "target_head",
      "Target HEAD differs from W0 BASE-E",
    );
  }
  if (targetRemote !== manifest.target_baseline.head_sha) {
    pushFinding(
      findings,
      "P0",
      "target_remote",
      "Target remote main differs from W0 BASE-E",
    );
  }
  if (targetBranch !== manifest.target_baseline.branch) {
    pushFinding(
      findings,
      "P0",
      "target_branch",
      "Target branch differs from W0 BASE-E",
    );
  }

  const closure = collectCanonicalImportClosure({
    canonicalRepo,
    pinnedCommit: canonical.pinned_commit,
    entrypoints: canonical.closure_entrypoints,
  });
  const structure = validateManifestStructure(manifest, {
    actualClosure: closure,
    targetRepo,
  });
  findings.push(...structure.findings);

  for (const [sourcePath, expectedHash] of Object.entries(
    canonical.critical_source_hashes ?? {},
  )) {
    let blob;
    try {
      blob = runGit(
        canonicalRepo,
        ["cat-file", "blob", `${canonical.pinned_commit}:${sourcePath}`],
        { binary: true },
      );
    } catch (error) {
      pushFinding(findings, "P0", "missing_source", error.message);
      continue;
    }
    const actualHash = sha256(blob);
    if (actualHash !== expectedHash) {
      pushFinding(findings, "P0", "source_hash", `${sourcePath} hash differs`, {
        expectedHash,
        actualHash,
      });
    }
  }

  const hashedSources = new Set(
    Object.keys(canonical.critical_source_hashes ?? {}),
  );
  for (const capability of manifest.capabilities ?? []) {
    for (const sourcePath of capability.source_paths ?? []) {
      if (
        ["PORT", "ADAPT"].includes(capability.disposition) &&
        !hashedSources.has(sourcePath)
      ) {
        pushFinding(
          findings,
          "P0",
          "unhashed_transplant_source",
          `${capability.id} ${sourcePath} lacks a raw blob hash`,
        );
      }
    }
  }

  for (const target of manifest.target_legacy_dispositions ?? []) {
    if (!existsSync(path.join(targetRepo, target.path))) {
      pushFinding(
        findings,
        "P0",
        "missing_legacy_target",
        `Legacy target does not exist: ${target.path}`,
      );
    }
    if (target.sha256 && existsSync(path.join(targetRepo, target.path))) {
      const actualHash = sha256(
        readFileSync(path.join(targetRepo, target.path)),
      );
      if (actualHash !== target.sha256) {
        pushFinding(
          findings,
          "P0",
          "legacy_target_hash",
          `Legacy target hash differs: ${target.path}`,
          { expected: target.sha256, actual: actualHash },
        );
      }
    }
  }
  for (const target of manifest.target_host_dispositions ?? []) {
    if (!existsSync(path.join(targetRepo, target.path))) {
      pushFinding(
        findings,
        "P0",
        "missing_host_target",
        `Host target does not exist: ${target.path}`,
      );
    }
  }

  const dirtyLines = runGit(targetRepo, ["status", "--porcelain=v1", "-uall"])
    .split(/\r?\n/)
    .filter(Boolean);
  const dirtyPaths = dirtyLines.map((line) => normalizeRepoPath(line.slice(3)));
  const allowedW0Prefixes =
    manifest.target_baseline.w0_allowed_dirty_prefixes ?? [];
  const preexistingPath = manifest.target_baseline.preexisting_dirty_path;
  for (const dirtyPath of dirtyPaths) {
    if (
      dirtyPath !== preexistingPath &&
      !allowedW0Prefixes.some((prefix) => dirtyPath.startsWith(prefix))
    ) {
      pushFinding(
        findings,
        "P0",
        "runtime_write_set",
        `Unexpected W0 dirty path: ${dirtyPath}`,
      );
    }
  }

  const preexistingAbsolute = path.join(targetRepo, preexistingPath);
  const preexistingHash = sha256(readFileSync(preexistingAbsolute));
  if (preexistingHash !== manifest.target_baseline.preexisting_dirty_sha256) {
    pushFinding(
      findings,
      "P0",
      "preexisting_dirty_file_changed",
      "The authorized PDP diff changed during W0",
      {
        expected: manifest.target_baseline.preexisting_dirty_sha256,
        actual: preexistingHash,
      },
    );
  }
  if (manifest.target_baseline.preexisting_change_state === "dirty") {
    const preexistingPatch = runGit(
      targetRepo,
      ["diff", "--", preexistingPath],
      {
        binary: true,
      },
    );
    const preexistingPatchHash = sha256(preexistingPatch);
    if (
      preexistingPatchHash !==
      manifest.target_baseline.historical_dirty_patch_sha256
    ) {
      pushFinding(
        findings,
        "P0",
        "preexisting_dirty_patch_changed",
        "The authorized PDP patch changed during W0",
        {
          expected: manifest.target_baseline.historical_dirty_patch_sha256,
          actual: preexistingPatchHash,
        },
      );
    }
  } else if (
    manifest.target_baseline.preexisting_change_state ===
    "committed_externally_during_w0"
  ) {
    const committedPatch = runGit(
      targetRepo,
      [
        "diff",
        `${manifest.target_baseline.previous_head_sha}..${manifest.target_baseline.head_sha}`,
        "--",
        preexistingPath,
      ],
      { binary: true },
    );
    const committedPatchHash = sha256(committedPatch);
    if (
      committedPatchHash !==
      manifest.target_baseline.external_commit_patch_sha256_raw_git
    ) {
      pushFinding(
        findings,
        "P0",
        "external_pdp_commit_changed",
        "The externally committed PDP patch differs from the observed W0 transition",
        {
          expected:
            manifest.target_baseline.external_commit_patch_sha256_raw_git,
          actual: committedPatchHash,
        },
      );
    }
    const externalCommitPaths = runGit(targetRepo, [
      "diff",
      "--name-only",
      `${manifest.target_baseline.previous_head_sha}..${manifest.target_baseline.head_sha}`,
    ])
      .split(/\r?\n/)
      .map((item) => normalizeRepoPath(item.trim()))
      .filter(Boolean);
    for (const changedPath of externalCommitPaths) {
      if (
        changedPath !== preexistingPath &&
        !allowedW0Prefixes.some((prefix) => changedPath.startsWith(prefix))
      ) {
        pushFinding(
          findings,
          "P0",
          "external_commit_runtime_scope",
          `External W0 commit changed an unexpected runtime path: ${changedPath}`,
        );
      }
    }
  } else {
    pushFinding(
      findings,
      "P0",
      "unknown_preexisting_change_state",
      `Unknown preexisting_change_state: ${manifest.target_baseline.preexisting_change_state}`,
    );
  }

  return {
    schema_version: 1,
    kind: "nos-gallery-manifest-semantic-validation",
    generated_at: new Date().toISOString(),
    pass: findings.length === 0,
    p0_count: findings.filter((finding) => finding.severity === "P0").length,
    p1_count: findings.filter((finding) => finding.severity === "P1").length,
    findings,
    computed: {
      ...structure.computed,
      canonical_head: canonicalHead,
      canonical_origin_main: canonicalOrigin,
      canonical_remote_main: canonicalRemote,
      canonical_tree: canonicalTree,
      target_head: targetHead,
      target_remote_main: targetRemote,
      target_branch: targetBranch,
      dirty_paths: dirtyPaths,
    },
  };
}

function parseArguments(argv) {
  const argumentsMap = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument.startsWith("--")) {
      const next = argv[index + 1];
      if (next && !next.startsWith("--")) {
        argumentsMap.set(argument, next);
        index += 1;
      } else {
        argumentsMap.set(argument, true);
      }
    }
  }
  return argumentsMap;
}

if (
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  try {
    const args = parseArguments(process.argv.slice(2));
    const manifestPath = args.get("--manifest") || DEFAULT_MANIFEST_PATH;
    const manifest = loadJsonCompatibleYaml(manifestPath);
    if (args.has("--print-closure")) {
      const closure = collectCanonicalImportClosure({
        canonicalRepo:
          args.get("--canonical-repo") ||
          manifest.canonical_source.local_checkout,
        pinnedCommit: manifest.canonical_source.pinned_commit,
        entrypoints: manifest.canonical_source.closure_entrypoints,
      });
      process.stdout.write(`${JSON.stringify(closure, null, 2)}\n`);
    } else {
      const result = validateManifestAgainstRepositories({
        manifest,
        targetRepo: args.get("--target-repo") || REPO_ROOT,
        canonicalRepo:
          args.get("--canonical-repo") ||
          manifest.canonical_source.local_checkout,
      });
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      if (!result.pass) {
        process.exitCode = 1;
      }
    }
  } catch (error) {
    process.stderr.write(`${error.stack ?? error.message}\n`);
    process.exitCode = 1;
  }
}
