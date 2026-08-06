import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(__dirname, 'validate-ua-graph.mjs');
const FIXTURES = path.join(__dirname, '__fixtures__', 'ua-graph');
const REPO_ROOT = path.resolve(__dirname, '..');

function run(args) {
  const r = spawnSync('node', [SCRIPT, ...args], { cwd: REPO_ROOT, encoding: 'utf8' });
  let json = null;
  try {
    json = JSON.parse(r.stdout);
  } catch {
    // some paths (usage errors) are intentionally plain text; tests that need
    // structured output always pass --json and assert accordingly.
  }
  return { status: r.status, stdout: r.stdout, stderr: r.stderr, json };
}

function codes(findings) {
  return findings.map((f) => f.code);
}

test('inert when the default target file does not exist', () => {
  // dtc-starter has no .ua/knowledge-graph.json today — this is the real default-path case.
  const r = run(['--json']);
  assert.equal(r.status, 2);
  assert.equal(r.json.outcome, 'FAIL');
  assert.equal(r.json.reason, 'FILE_NOT_FOUND');
});

test('missing fixture path also reports FILE_NOT_FOUND, exit 2', () => {
  const r = run([path.join(FIXTURES, 'does-not-exist.json'), '--json']);
  assert.equal(r.status, 2);
  assert.equal(r.json.reason, 'FILE_NOT_FOUND');
});

test('minimal valid graph passes', () => {
  const r = run([path.join(FIXTURES, 'minimal-valid.json'), '--json']);
  assert.equal(r.status, 0);
  assert.equal(r.json.outcome, 'PASS');
  assert.equal(r.json.findings.length, 0);
  assert.equal(r.json.meta.idField, 'id');
  assert.deepEqual([r.json.meta.sourceField, r.json.meta.targetField], ['source', 'target']);
  assert.equal(r.json.meta.pathField, 'path');
});

test('invalid JSON reports INVALID_JSON, exit 2', () => {
  const r = run([path.join(FIXTURES, 'invalid-json.json'), '--json']);
  assert.equal(r.status, 2);
  assert.equal(r.json.reason, 'INVALID_JSON');
});

test('duplicate node id fails', () => {
  const r = run([path.join(FIXTURES, 'duplicate-id.json'), '--json']);
  assert.equal(r.status, 1);
  assert.equal(r.json.outcome, 'FAIL');
  assert.ok(codes(r.json.findings).includes('DUPLICATE_NODE_ID'));
});

test('orphan edge fails', () => {
  const r = run([path.join(FIXTURES, 'orphan-edge.json'), '--json']);
  assert.equal(r.status, 1);
  assert.ok(codes(r.json.findings).includes('ORPHAN_EDGE_TARGET'));
});

test('nonexistent declared path fails', () => {
  const r = run([path.join(FIXTURES, 'missing-path.json'), '--json']);
  assert.equal(r.status, 1);
  assert.ok(codes(r.json.findings).includes('PATH_NOT_FOUND'));
});

test('sparse missing node ids fail without being masked as PASS or UNSUPPORTED_SCHEMA', () => {
  // 42 nodes, 3 with an unusable id (absent / null / whitespace-only). Id
  // coverage stays above the 80% schema-detection threshold on purpose —
  // this is the regression that previously slipped through as PASS.
  const r = run([path.join(FIXTURES, 'missing-node-id.json'), '--json']);
  assert.equal(r.status, 1);
  assert.equal(r.json.outcome, 'FAIL');
  assert.notEqual(r.json.reason, 'UNSUPPORTED_SCHEMA', 'must fail on the id gap itself, not on schema detection');

  const missing = r.json.findings.filter((f) => f.code === 'MISSING_NODE_ID');
  assert.equal(missing.length, 3);
  assert.deepEqual(missing.map((f) => f.nodeIndex).sort((a, b) => a - b), [39, 40, 41]);
  // The finding is located structurally — there is no id to name it by.
  missing.forEach((f) => assert.equal(typeof f.nodeIndex, 'number'));

  // Node #38 carries the numeric id 0, which is legitimate and must survive.
  assert.ok(!missing.some((f) => f.nodeIndex === 38), 'numeric 0 must not be treated as a missing id');
  assert.ok(!r.json.findings.some((f) => f.code === 'DUPLICATE_NODE_ID'));
});

test('suspect path is caught by the static list even when git does not ignore it', () => {
  // playwright-report/ exists in this repo and is NOT covered by .gitignore,
  // so this exercises the static defense layer on its own.
  const r = run([path.join(FIXTURES, 'suspect-path-not-ignored.json'), '--json']);
  assert.equal(r.status, 1);
  const found = codes(r.json.findings);
  assert.ok(found.includes('PATH_MATCHES_SUSPECT_PATTERN'));
  assert.ok(!found.includes('PATH_IS_GIT_IGNORED'), 'git check-ignore must not be what caught this');
});

test('git-ignored declared path fails', () => {
  const r = run([path.join(FIXTURES, 'ignored-path.json'), '--json']);
  assert.equal(r.status, 1);
  const found = codes(r.json.findings);
  // node_modules/** is a real, current .gitignore rule in this repo — both
  // detectors (git check-ignore and the static suspect-segment list) should fire.
  assert.ok(found.includes('PATH_IS_GIT_IGNORED') || found.includes('PATH_MATCHES_SUSPECT_PATTERN'));
});

test('secret-shaped content fails and never echoes the matched value', () => {
  const r = run([path.join(FIXTURES, 'secret-content.json'), '--json']);
  assert.equal(r.status, 1);
  assert.ok(codes(r.json.findings).includes('POSSIBLE_SECRET'));
  assert.ok(!r.stdout.includes('AKIAFAKEFAKEFAKE1234'), 'raw secret value must not appear in output');
  const finding = r.json.findings.find((f) => f.code === 'POSSIBLE_SECRET');
  assert.equal(finding.secretType, 'AWS_ACCESS_KEY_ID');
  assert.equal(typeof finding.position, 'number');
});

test('unrecognizable schema reports UNSUPPORTED_SCHEMA and does not guess', () => {
  const r = run([path.join(FIXTURES, 'unsupported-schema.json'), '--json']);
  assert.equal(r.status, 1);
  assert.equal(r.json.reason, 'UNSUPPORTED_SCHEMA');
});

test('unknown flag is a usage error, exit 2', () => {
  const r = run(['--nope']);
  assert.equal(r.status, 2);
  assert.match(r.stdout, /Unknown flag/);
});
