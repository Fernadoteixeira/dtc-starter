#!/usr/bin/env node
/**
 * Validator for a future .ua/knowledge-graph.json (Understand-Anything).
 *
 * Read-only. Never writes, creates, or modifies any file. Stays inert when
 * the target graph file does not exist yet — it just reports that clearly
 * and exits.
 *
 * Does not assume Understand-Anything's exact schema. It first runs a
 * tolerant discovery pass over the JSON looking for one array-of-objects
 * that looks like a node collection (consistent id field) and one that
 * looks like an edge collection (consistent source/target-style field
 * pair). If it cannot confidently identify exactly one of each, it reports
 * UNSUPPORTED_SCHEMA and stops rather than guessing a mapping.
 *
 * Usage:
 *   node scripts/validate-ua-graph.mjs [path] [--json]
 *
 * Defaults to .ua/knowledge-graph.json (resolved against the current
 * working directory) when no path is given.
 *
 * Exit codes:
 *   0 = approved (PASS or WARN-only)
 *   1 = validation failure (file was read and parsed, content has FAIL-level findings)
 *   2 = usage, read, or environment error (bad args, missing file, unreadable file, invalid JSON)
 */

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';

// ── Known noise / never-index patterns (defense-in-depth alongside git check-ignore) ──
const SUSPECT_SEGMENTS = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'coverage',
  'playwright-report', 'test-results', '__pycache__', '.venv', 'vendor',
]);
const SUSPECT_EXACT_RELATIVE = new Set([
  '.ua/intermediate', '.ua/diff-overlay.json',
]);

const ID_FIELD_CANDIDATES = ['id', 'nodeId', 'uid', '_id', 'key'];
const EDGE_PAIR_CANDIDATES = [
  ['source', 'target'],
  ['from', 'to'],
  ['src', 'dst'],
  ['sourceId', 'targetId'],
  ['fromId', 'toId'],
  ['start', 'end'],
];
const PATH_FIELD_PATTERN = /^(path|filePath|file|filepath|location|relPath|relativePath)$/i;

// ── Secret-shaped patterns. Findings report type/field/position only — never the matched value. ──
const SECRET_PATTERNS = [
  { code: 'PRIVATE_KEY_BLOCK', re: /-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----/ },
  { code: 'AWS_ACCESS_KEY_ID', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { code: 'JWT_LIKE_TOKEN', re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/ },
  { code: 'BEARER_TOKEN', re: /\bBearer\s+[A-Za-z0-9\-_.=]{20,}\b/ },
  { code: 'SUSPICIOUS_KEY_ASSIGNMENT', re: /\b(?:api[_-]?key|secret|token|password|passwd|access[_-]?key|client[_-]?secret|private[_-]?key)\b\s*[:=]\s*['"][^'"\s]{8,}['"]/i },
  { code: 'DOTENV_STYLE_LINE', re: /^[A-Z][A-Z0-9_]{3,}=\S{4,}$/m },
];

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

// ── Tolerant schema discovery ────────────────────────────────────────────
function findArraysOfObjects(root, maxDepth) {
  const found = [];
  (function walk(node, keyPath, depth) {
    if (depth > maxDepth) return;
    if (Array.isArray(node)) {
      const objItems = node.filter(isPlainObject);
      if (node.length > 0 && objItems.length / node.length >= 0.9) {
        found.push({ keyPath, value: node });
      }
      return;
    }
    if (isPlainObject(node)) {
      for (const [k, v] of Object.entries(node)) walk(v, [...keyPath, k], depth + 1);
    }
  })(root, [], 0);
  return found;
}

function detectConsistentField(items, fieldNames, sampleSize = 50) {
  const sample = items.slice(0, sampleSize);
  if (sample.length === 0) return null;
  for (const name of fieldNames) {
    const hits = sample.filter((o) => typeof o[name] === 'string' && o[name].length > 0).length;
    if (hits / sample.length >= 0.8) return name;
  }
  return null;
}

function detectEdgePair(items, sampleSize = 50) {
  const sample = items.slice(0, sampleSize);
  if (sample.length === 0) return null;
  for (const [a, b] of EDGE_PAIR_CANDIDATES) {
    const hits = sample.filter((o) => typeof o[a] === 'string' && typeof o[b] === 'string').length;
    if (hits / sample.length >= 0.8) return [a, b];
  }
  return null;
}

function detectPathField(items, sampleSize = 50) {
  const sample = items.slice(0, sampleSize);
  const keys = new Set();
  sample.forEach((o) => Object.keys(o).forEach((k) => keys.add(k)));
  for (const k of keys) {
    if (PATH_FIELD_PATTERN.test(k)) {
      const hits = sample.filter((o) => typeof o[k] === 'string' && o[k].length > 0).length;
      if (hits / sample.length >= 0.5) return k;
    }
  }
  return null;
}

function detectSchema(root) {
  const candidates = findArraysOfObjects(root, 2);
  const nodeCandidates = [];
  const edgeCandidates = [];
  for (const c of candidates) {
    const edgePair = detectEdgePair(c.value);
    if (edgePair) {
      edgeCandidates.push({ ...c, sourceField: edgePair[0], targetField: edgePair[1] });
      continue;
    }
    const idField = detectConsistentField(c.value, ID_FIELD_CANDIDATES);
    if (idField) nodeCandidates.push({ ...c, idField });
  }
  if (nodeCandidates.length !== 1 || edgeCandidates.length !== 1) {
    return { ok: false, nodeCandidates, edgeCandidates };
  }
  const nodes = nodeCandidates[0];
  const edges = edgeCandidates[0];
  const pathField = detectPathField(nodes.value);
  return { ok: true, nodes, edges, pathField };
}

// ── Checks ────────────────────────────────────────────────────────────────
/**
 * A node id counts as missing when it is absent, null, or a string that is
 * empty once trimmed. A numeric 0 is a legitimate id and must not be
 * treated as missing.
 */
function isMissingId(id) {
  if (id === undefined || id === null) return true;
  if (typeof id === 'string' && id.trim() === '') return true;
  return false;
}

function checkNodeIds(schema, findings) {
  const { value: nodes, idField } = schema.nodes;
  const seen = new Map();
  nodes.forEach((n, idx) => {
    const id = n[idField];
    if (isMissingId(id)) {
      // Reported by structural position: the id is precisely what is
      // missing, so there is no usable node identifier to name it by.
      findings.push({
        level: 'FAIL',
        code: 'MISSING_NODE_ID',
        nodeIndex: idx,
        field: idField,
        message: `Node at index ${idx} has no usable value in the detected id field "${idField}".`,
      });
      return;
    }
    if (!seen.has(id)) seen.set(id, []);
    seen.get(id).push(idx);
  });
  for (const [id, idxs] of seen) {
    if (idxs.length > 1) {
      findings.push({
        level: 'FAIL',
        code: 'DUPLICATE_NODE_ID',
        message: `ID "${id}" appears ${idxs.length} times (indices: ${idxs.join(', ')}).`,
      });
    }
  }
}

function checkOrphanEdges(schema, findings) {
  const { value: nodes, idField } = schema.nodes;
  const { value: edges, sourceField, targetField } = schema.edges;
  const idSet = new Set(nodes.map((n) => n[idField]));
  edges.forEach((e, idx) => {
    const s = e[sourceField];
    const t = e[targetField];
    if (!idSet.has(s)) {
      findings.push({ level: 'FAIL', code: 'ORPHAN_EDGE_SOURCE', edgeIndex: idx, message: `Edge[${idx}].${sourceField} = "${s}" does not match any node id.` });
    }
    if (!idSet.has(t)) {
      findings.push({ level: 'FAIL', code: 'ORPHAN_EDGE_TARGET', edgeIndex: idx, message: `Edge[${idx}].${targetField} = "${t}" does not match any node id.` });
    }
  });
}

function isAbsoluteLike(p) {
  return /^([A-Za-z]:[\\/]|\\\\|\/)/.test(p);
}

function matchesSuspectPattern(relPath) {
  const norm = relPath.replace(/\\/g, '/');
  const segments = norm.split('/').filter(Boolean);
  for (const seg of segments) {
    if (SUSPECT_SEGMENTS.has(seg)) return `segment:${seg}`;
    if (/^\.env(\..+)?$/.test(seg)) return `segment:${seg}`;
  }
  if (norm === '.ua/intermediate' || norm.startsWith('.ua/intermediate/')) return 'exact:.ua/intermediate';
  if (norm === '.ua/diff-overlay.json') return 'exact:.ua/diff-overlay.json';
  return null;
}

function isGitIgnored(repoRoot, relPath) {
  const r = spawnSync('git', ['check-ignore', '--quiet', relPath], { cwd: repoRoot });
  if (r.error) return { ok: false, ignored: false, error: r.error.message };
  if (r.status === 0) return { ok: true, ignored: true };
  if (r.status === 1) return { ok: true, ignored: false };
  return { ok: false, ignored: false, error: `git check-ignore exited with status ${r.status}` };
}

function checkPaths(schema, repoRoot, findings) {
  const { value: nodes, idField } = schema.nodes;
  const pathField = schema.pathField;
  let missingCount = 0;
  for (const [idx, n] of nodes.entries()) {
    const id = n[idField];
    const p = n[pathField];
    if (typeof p !== 'string' || p.length === 0) {
      missingCount++;
      continue;
    }
    if (isAbsoluteLike(p)) {
      findings.push({ level: 'FAIL', code: 'UNEXPECTED_ABSOLUTE_PATH', nodeId: id, nodeIndex: idx, field: pathField, path: p, message: 'Path looks absolute rather than repo-relative.' });
      continue;
    }
    const suspect = matchesSuspectPattern(p);
    if (suspect) {
      findings.push({ level: 'FAIL', code: 'PATH_MATCHES_SUSPECT_PATTERN', nodeId: id, nodeIndex: idx, field: pathField, path: p, message: `Matches a known noise/never-index pattern (${suspect}).` });
    }
    const ignoreResult = isGitIgnored(repoRoot, p);
    if (ignoreResult.ok && ignoreResult.ignored) {
      findings.push({ level: 'FAIL', code: 'PATH_IS_GIT_IGNORED', nodeId: id, nodeIndex: idx, field: pathField, path: p, message: 'git check-ignore matched this path.' });
    } else if (!ignoreResult.ok) {
      findings.push({ level: 'WARN', code: 'GIT_CHECK_IGNORE_UNAVAILABLE', nodeId: id, nodeIndex: idx, field: pathField, path: p, message: ignoreResult.error || 'Could not run git check-ignore for this path.' });
    }
    const abs = path.resolve(repoRoot, p);
    if (!existsSync(abs)) {
      findings.push({ level: 'FAIL', code: 'PATH_NOT_FOUND', nodeId: id, nodeIndex: idx, field: pathField, path: p, message: 'Declared path does not exist in the repository.' });
    }
  }
  if (missingCount > 0) {
    findings.push({ level: 'WARN', code: 'NODES_MISSING_PATH_VALUE', message: `${missingCount} node(s) had no value in the detected path field "${pathField}".` });
  }
}

function scanForSecrets(root, findings) {
  (function walk(node, keyPath) {
    if (typeof node === 'string') {
      for (const { code, re } of SECRET_PATTERNS) {
        const m = re.exec(node);
        if (m) {
          findings.push({
            level: 'FAIL',
            code: 'POSSIBLE_SECRET',
            secretType: code,
            field: keyPath.join('.'),
            position: m.index,
            message: `Pattern "${code}" matched in field "${keyPath.join('.')}" at offset ${m.index}. Value withheld.`,
          });
        }
      }
      return;
    }
    if (Array.isArray(node)) {
      node.forEach((v, i) => walk(v, [...keyPath, i]));
      return;
    }
    if (isPlainObject(node)) {
      for (const [k, v] of Object.entries(node)) walk(v, [...keyPath, k]);
    }
  })(root, []);
}

// ── Repo root + I/O ──────────────────────────────────────────────────────
function getRepoRoot() {
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (r.status === 0 && r.stdout) return r.stdout.trim();
  return process.cwd();
}

function printHuman(result) {
  const lines = [];
  lines.push('Understand-Anything graph validator');
  lines.push(`Target: ${result.meta?.targetPath ?? '(unknown)'}`);
  if (result.reason) lines.push(`Reason: ${result.reason}`);
  lines.push('');
  if (result.findings.length === 0) {
    lines.push('No findings.');
  } else {
    for (const f of result.findings) {
      const loc =
        f.nodeId !== undefined ? ` (node ${f.nodeId})`
          : f.nodeIndex !== undefined ? ` (node #${f.nodeIndex})`
            : f.edgeIndex !== undefined ? ` (edge #${f.edgeIndex})`
              : '';
      lines.push(`[${f.level}] ${f.code}${loc} — ${f.message}`);
    }
  }
  lines.push('');
  lines.push(result.summary);
  lines.push('');
  lines.push(`Outcome: ${result.outcome}`);
  process.stdout.write(lines.join('\n') + '\n');
}

function emit(jsonMode, result) {
  if (jsonMode) {
    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } else {
    printHuman(result);
  }
  process.exitCode = result.exitCode;
}

function usageError(message) {
  process.stdout.write(`Usage: node scripts/validate-ua-graph.mjs [path] [--json]\nError: ${message}\n`);
  process.exitCode = 2;
}

function main() {
  const args = process.argv.slice(2);
  let jsonMode = false;
  let inputPathArg = null;
  for (const a of args) {
    if (a === '--json') jsonMode = true;
    else if (a.startsWith('--')) return usageError(`Unknown flag: ${a}`);
    else if (inputPathArg === null) inputPathArg = a;
    else return usageError(`Unexpected extra argument: ${a}`);
  }

  const targetPath = inputPathArg || '.ua/knowledge-graph.json';
  const resolvedInput = path.resolve(process.cwd(), targetPath);
  const repoRoot = getRepoRoot();

  if (!existsSync(resolvedInput)) {
    return emit(jsonMode, {
      outcome: 'FAIL',
      exitCode: 2,
      reason: 'FILE_NOT_FOUND',
      summary: `Graph file not found: ${resolvedInput}`,
      findings: [],
      meta: { targetPath: resolvedInput, repoRoot },
    });
  }

  let raw;
  try {
    raw = readFileSync(resolvedInput, 'utf8');
  } catch (e) {
    return emit(jsonMode, {
      outcome: 'FAIL',
      exitCode: 2,
      reason: 'READ_ERROR',
      summary: `Could not read file: ${e.message}`,
      findings: [],
      meta: { targetPath: resolvedInput, repoRoot },
    });
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    return emit(jsonMode, {
      outcome: 'FAIL',
      exitCode: 2,
      reason: 'INVALID_JSON',
      summary: `JSON parse error: ${e.message}`,
      findings: [],
      meta: { targetPath: resolvedInput, repoRoot },
    });
  }

  const schema = detectSchema(data);
  if (!schema.ok) {
    return emit(jsonMode, {
      outcome: 'FAIL',
      exitCode: 1,
      reason: 'UNSUPPORTED_SCHEMA',
      summary: 'Could not confidently identify exactly one node collection and one edge collection. Refusing to guess a mapping.',
      findings: [
        {
          level: 'FAIL',
          code: 'UNSUPPORTED_SCHEMA',
          message: `node candidates: ${schema.nodeCandidates.length}, edge candidates: ${schema.edgeCandidates.length}`,
        },
      ],
      meta: {
        targetPath: resolvedInput,
        repoRoot,
        nodeCandidateKeyPaths: schema.nodeCandidates.map((c) => c.keyPath.join('.') || '(root)'),
        edgeCandidateKeyPaths: schema.edgeCandidates.map((c) => c.keyPath.join('.') || '(root)'),
      },
    });
  }

  const findings = [];
  scanForSecrets(data, findings);
  checkNodeIds(schema, findings);
  checkOrphanEdges(schema, findings);
  if (schema.pathField) {
    checkPaths(schema, repoRoot, findings);
  } else {
    findings.push({ level: 'WARN', code: 'NO_PATH_FIELD_DETECTED', message: 'No path-like field detected on node objects; skipping path existence/ignore checks.' });
  }

  const hasFail = findings.some((f) => f.level === 'FAIL');
  const hasWarn = findings.some((f) => f.level === 'WARN');
  const outcome = hasFail ? 'FAIL' : hasWarn ? 'WARN' : 'PASS';

  return emit(jsonMode, {
    outcome,
    exitCode: hasFail ? 1 : 0,
    reason: null,
    summary: `${outcome}: ${findings.length} finding(s) — ${schema.nodes.value.length} node(s), ${schema.edges.value.length} edge(s) checked.`,
    findings,
    meta: {
      targetPath: resolvedInput,
      repoRoot,
      nodesKeyPath: schema.nodes.keyPath.join('.') || '(root)',
      edgesKeyPath: schema.edges.keyPath.join('.') || '(root)',
      idField: schema.nodes.idField,
      sourceField: schema.edges.sourceField,
      targetField: schema.edges.targetField,
      pathField: schema.pathField,
    },
  });
}

main();
