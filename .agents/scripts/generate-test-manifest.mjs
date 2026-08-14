import { createHash } from "node:crypto"
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const SCRIPT_PATH = fileURLToPath(import.meta.url)
export const REPO_ROOT = path.resolve(path.dirname(SCRIPT_PATH), "..", "..")
const DEFAULT_OUTPUT_PATH = path.join(
  REPO_ROOT,
  ".agents",
  "artifacts",
  "test-discovery-manifest.json",
)

export const DISCOVERY_RULES = Object.freeze([
  {
    id: "agent-node-test",
    runner: "node:test",
    command: "node --test .agents/scripts/__tests__/*.test.mjs",
    matches: (file) =>
      /^\.agents\/scripts\/__tests__\/[^/]+\.test\.mjs$/.test(file),
  },
  {
    id: "repository-node-test",
    runner: "node:test",
    command: "node --test scripts/*.test.mjs",
    matches: (file) => /^scripts\/[^/]+\.test\.mjs$/.test(file),
  },
  {
    id: "backend-unit",
    runner: "jest",
    command: "pnpm --dir apps/backend run test:unit",
    matches: (file) =>
      /^apps\/backend\/src\/.*\/__tests__\/.*\.unit\.spec\.[cm]?[jt]sx?$/.test(
        file,
      ),
  },
  {
    id: "backend-integration-http",
    runner: "jest",
    command: "pnpm --dir apps/backend run test:integration:http",
    matches: (file) =>
      /^apps\/backend\/integration-tests\/http\/.*\.spec\.[cm]?[jt]sx?$/.test(
        file,
      ),
  },
  {
    id: "backend-integration-modules",
    runner: "jest",
    command: "pnpm --dir apps/backend run test:integration:modules",
    matches: (file) =>
      /^apps\/backend\/src\/modules\/.*\/__tests__\/.*\.(?:spec|test)\.[cm]?[jt]sx?$/.test(
        file,
      ),
  },
  {
    id: "storefront-unit",
    runner: "jest",
    command: "pnpm --dir apps/storefront run test:unit",
    matches: (file) =>
      /^apps\/storefront\/src\/.*\/__tests__\/.*\.unit\.spec\.[jt]s$/.test(
        file,
      ),
  },
  {
    id: "playwright-e2e",
    runner: "playwright",
    command: "pnpm run test:e2e",
    matches: (file) => /^e2e\/.*\.spec\.[cm]?[jt]sx?$/.test(file),
  },
])

const CONFIG_FILES = Object.freeze([
  "package.json",
  "pnpm-workspace.yaml",
  "turbo.json",
  "playwright.config.ts",
  "apps/backend/jest.config.js",
  "apps/backend/package.json",
  "apps/storefront/jest.config.js",
  "apps/storefront/package.json",
  ".github/workflows/ci.yml",
  ".github/workflows/e2e-ci.yml",
  ".github/workflows/regression-attestation.yml",
])

function runGit(repoRoot, args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: options.encoding ?? "utf8",
    windowsHide: true,
  })
  if (result.error || result.status !== 0) {
    const detail = result.error?.message || String(result.stderr || "").trim()
    throw new Error(`git ${args.join(" ")} failed${detail ? `: ${detail}` : ""}`)
  }
  return result.stdout
}

function toPosix(value) {
  return value.split(path.sep).join("/")
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex")
}

function canonicalJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort((left, right) => left.localeCompare(right))
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`
  }
  return JSON.stringify(value)
}

function hashFile(repoRoot, relativePath) {
  const absolutePath = path.join(repoRoot, relativePath)
  if (!existsSync(absolutePath)) return null
  return sha256(readFileSync(absolutePath))
}

function countStaticDeclarations(content) {
  const matches = content.match(
    /(?:^|[^\w$.])(?:test|it)(?:\.(?:only|skip|todo|concurrent))?\s*\(/gm,
  )
  return matches?.length ?? 0
}

export function discoverTrackedTests({ repoRoot = REPO_ROOT, trackedFiles } = {}) {
  const files = trackedFiles
    ? [...trackedFiles]
    : String(runGit(repoRoot, ["ls-files", "-z"])).split("\0").filter(Boolean)

  const normalizedFiles = files.map(toPosix).sort((left, right) =>
    left.localeCompare(right),
  )
  const discovered = []

  for (const file of normalizedFiles) {
    const rule = DISCOVERY_RULES.find((candidate) => candidate.matches(file))
    if (!rule) continue
    const absolutePath = path.join(repoRoot, ...file.split("/"))
    const content = existsSync(absolutePath)
      ? readFileSync(absolutePath, "utf8")
      : ""
    discovered.push({
      path: file,
      suite: rule.id,
      runner: rule.runner,
      command: rule.command,
      sha256: existsSync(absolutePath) ? sha256(readFileSync(absolutePath)) : null,
      static_test_declarations: countStaticDeclarations(content),
    })
  }

  return discovered
}

export function hashDiscoverySubject(tests) {
  return sha256(
    canonicalJson(
      tests.map(({ path: filePath, suite, runner, sha256: fileSha256 }) => ({
        path: filePath,
        suite,
        runner,
        sha256: fileSha256,
      })),
    ),
  )
}

export function validateExecutionReport(
  report,
  discoverySubjectSha256,
  knownSuiteIds = DISCOVERY_RULES.map((rule) => rule.id),
) {
  const validShape =
    report?.kind === "canonical-test-execution-report" &&
    report.version === "1.0.0" &&
    report.status === "PASS" &&
    Number.isInteger(report.summary?.executed_test_cases) &&
    Number.isInteger(report.summary?.passed_test_cases) &&
    report.summary.executed_test_cases === report.summary.passed_test_cases &&
    Array.isArray(report.scope?.suite_ids) &&
    report.scope.suite_ids.length > 0 &&
    new Set(report.scope.suite_ids).size === report.scope.suite_ids.length &&
    report.scope.suite_ids.every((suiteId) => knownSuiteIds.includes(suiteId))
  if (!validShape) {
    return { accepted: false, reason: "INVALID_REPORT" }
  }
  if (report.discovery_subject_sha256 !== discoverySubjectSha256) {
    return { accepted: false, reason: "STALE_SUBJECT" }
  }
  return { accepted: true, reason: "SUBJECT_MATCHED" }
}

function loadExecutionReports(repoRoot, discoverySubjectSha256) {
  const artifactsDir = path.join(repoRoot, ".agents", "artifacts")
  if (!existsSync(artifactsDir)) return []
  const reportPaths = readdirSync(artifactsDir)
    .filter((name) => /^test-execution-[a-z0-9-]+\.json$/.test(name))
    .sort()
    .map((name) => path.join(artifactsDir, name))
  const claimedSuites = new Set()

  return reportPaths.map((reportPath) => {
    try {
      const report = JSON.parse(readFileSync(reportPath, "utf8"))
      const validation = validateExecutionReport(
        report,
        discoverySubjectSha256,
      )
      if (validation.accepted) {
        const overlap = report.scope.suite_ids.find((suiteId) =>
          claimedSuites.has(suiteId),
        )
        if (overlap) {
          return {
            path: toPosix(path.relative(repoRoot, reportPath)),
            accepted: false,
            reason: "DUPLICATE_SUITE_EVIDENCE",
            report,
          }
        }
        report.scope.suite_ids.forEach((suiteId) => claimedSuites.add(suiteId))
      }
      return {
        path: toPosix(path.relative(repoRoot, reportPath)),
        ...validation,
        report,
      }
    } catch (error) {
      return {
        path: toPosix(path.relative(repoRoot, reportPath)),
        accepted: false,
        reason: "UNPARSEABLE_REPORT",
        error: error.message,
      }
    }
  })
}

export function buildTestManifest({
  repoRoot = REPO_ROOT,
  trackedFiles,
  generatedAt = new Date().toISOString(),
  gitSha,
  dirty,
} = {}) {
  const tests = discoverTrackedTests({ repoRoot, trackedFiles })
  const discoverySubjectSha256 = hashDiscoverySubject(tests)
  const executionReports = loadExecutionReports(
    repoRoot,
    discoverySubjectSha256,
  )
  const acceptedReports = executionReports.filter((report) => report.accepted)
  const executedSuiteIds = new Set(
    acceptedReports.flatMap((entry) => entry.report.scope.suite_ids),
  )
  const runtimeSummary = acceptedReports.reduce(
    (summary, entry) => ({
      discovered_test_cases:
        summary.discovered_test_cases +
        entry.report.summary.discovered_test_cases,
      executed_test_cases:
        summary.executed_test_cases + entry.report.summary.executed_test_cases,
      passed_test_cases:
        summary.passed_test_cases + entry.report.summary.passed_test_cases,
    }),
    {
      discovered_test_cases: 0,
      executed_test_cases: 0,
      passed_test_cases: 0,
    },
  )
  const resolvedGitSha =
    gitSha ?? String(runGit(repoRoot, ["rev-parse", "HEAD"])).trim()
  const resolvedDirty =
    dirty ?? String(runGit(repoRoot, ["status", "--porcelain"])).trim().length > 0

  const suites = DISCOVERY_RULES.map((rule) => {
    const files = tests.filter((test) => test.suite === rule.id)
    return {
      id: rule.id,
      runner: rule.runner,
      command: rule.command,
      discovered_files: files.length,
      static_test_declarations: files.reduce(
        (total, file) => total + file.static_test_declarations,
        0,
      ),
      execution: {
        status: executedSuiteIds.has(rule.id)
          ? "PASS_FROM_ACCEPTED_REPORT"
          : "NOT_EXECUTED_BY_DISCOVERY",
        discovered_test_cases: null,
        executed_test_cases: null,
        passed_test_cases: null,
      },
    }
  }).filter((suite) => suite.discovered_files > 0)

  return {
    kind: "canonical-test-discovery-manifest",
    version: "2.0.0",
    generated_at: generatedAt,
    issue_reference: "#51",
    source: {
      git_sha: resolvedGitSha,
      worktree_dirty: resolvedDirty,
      checkout_clean_before_execution:
        process.env.ATTESTATION_CLEAN_CHECKOUT === "true",
      tracked_file_source: "git ls-files -z",
      discovery_subject_sha256: discoverySubjectSha256,
      remote_context: process.env.GITHUB_ACTIONS === "true"
        ? {
            provider: "github-actions",
            repository: process.env.GITHUB_REPOSITORY ?? null,
            workflow: process.env.GITHUB_WORKFLOW ?? null,
            run_id: process.env.GITHUB_RUN_ID ?? null,
            run_attempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
            ref: process.env.GITHUB_REF ?? null,
            sha: process.env.ATTESTATION_SHA ?? process.env.GITHUB_SHA ?? null,
          }
        : null,
    },
    reconciliation_verdict:
      acceptedReports.length > 0
        ? "DISCOVERY_COMPLETE_PARTIAL_EXECUTION_REMOTE_REVIEW_PENDING"
        : "DISCOVERY_COMPLETE_EXECUTION_AND_REMOTE_REVIEW_PENDING",
    counting_contract: {
      discovered_files: "Exact tracked files matched by an explicit suite rule.",
      static_test_declarations:
        "Advisory lexical count of test()/it() declarations; not an execution count.",
      runtime_counts:
        "Remain null until imported from runner-native machine-readable reports.",
    },
    summary: {
      suite_count: suites.length,
      discovered_test_files: tests.length,
      static_test_declarations: tests.reduce(
        (total, file) => total + file.static_test_declarations,
        0,
      ),
      discovered_test_cases:
        acceptedReports.length > 0 ? runtimeSummary.discovered_test_cases : null,
      executed_test_cases:
        acceptedReports.length > 0 ? runtimeSummary.executed_test_cases : null,
      passed_test_cases:
        acceptedReports.length > 0 ? runtimeSummary.passed_test_cases : null,
      executed_suite_count: suites.filter(
        (suite) => suite.execution.status === "PASS_FROM_ACCEPTED_REPORT",
      ).length,
      pending_suite_count: suites.filter(
        (suite) => suite.execution.status === "NOT_EXECUTED_BY_DISCOVERY",
      ).length,
      local_execution_complete:
        suites.length > 0 &&
        suites.every(
          (suite) => suite.execution.status === "PASS_FROM_ACCEPTED_REPORT",
        ),
      remotely_reproducible: false,
    },
    inclusion_rules: DISCOVERY_RULES.map(({ id, runner, command }) => ({
      id,
      runner,
      command,
    })),
    configuration: CONFIG_FILES.map((file) => ({
      path: file,
      sha256: hashFile(repoRoot, file),
      present: existsSync(path.join(repoRoot, file)),
    })),
    suites,
    discovered_files: tests,
    execution_reports: executionReports,
    remote_ci_attestation: {
      status: "ABSENT",
      evidence: null,
      issue_51_closure_status: "NO_GO_PENDING_REMOTE_REVIEW_E",
    },
  }
}

export function writeTestManifest(
  manifest,
  outputPath = DEFAULT_OUTPUT_PATH,
) {
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8")
  return outputPath
}

export function generateTestManifest(options = {}) {
  const manifest = buildTestManifest(options)
  if (options.write !== false) {
    writeTestManifest(manifest, options.outputPath ?? DEFAULT_OUTPUT_PATH)
  }
  return manifest
}

function main() {
  const manifest = generateTestManifest()
  console.log(`[PASS] Test discovery manifest generated at ${DEFAULT_OUTPUT_PATH}`)
  console.log(`  Git SHA: ${manifest.source.git_sha}`)
  console.log(`  Worktree dirty: ${manifest.source.worktree_dirty}`)
  console.log(`  Suites: ${manifest.summary.suite_count}`)
  console.log(`  Test files: ${manifest.summary.discovered_test_files}`)
  console.log(
    `  Runtime counts: ${manifest.summary.executed_test_cases ?? "PENDING"}/${manifest.summary.passed_test_cases ?? "PENDING"}`,
  )
  console.log(
    `  Suite coverage: ${manifest.summary.executed_suite_count}/${manifest.summary.suite_count}`,
  )
  console.log(`  Issue #51: ${manifest.remote_ci_attestation.issue_51_closure_status}`)
}

if (path.resolve(process.argv[1] ?? "") === SCRIPT_PATH) {
  main()
}
