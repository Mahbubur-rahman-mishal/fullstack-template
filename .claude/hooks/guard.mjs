#!/usr/bin/env node
// PreToolUse guard for Claude Code. Claude Code (not the model) runs this
// before every matching tool call, so the rules below are enforced, not advisory.
//
//   1. Secret env files (.env, .env.prod, ...) may not be read, written or touched
//      from Bash. Templates (.env.example / .sample / .template) are allowed.
//   2. A Flyway migration that already exists on main may not be edited or
//      overwritten: it may have been applied to a real database (ADR 0007).
//
// Exit 0 = allow. Exit 2 = block (stderr is shown to Claude). Exit 1 = internal
// error, reported to the user but non-blocking.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ENV_TEMPLATE = /\.(example|sample|template)$/;
const MIGRATION = /(^|\/)src\/main\/resources\/db\/migration\/[^/]+\.sql$/;
const MAIN_REFS = ['origin/main', 'main'];
// ".env" as a standalone path segment inside a shell command.
const ENV_IN_COMMAND = /(?:^|[\s'"=<>|;&(/])(\.env(?:\.[\w-]+)*)(?=$|[\s'";|&)<>])/g;

export function isSecretEnvFile(filePath) {
  const base = path.basename(filePath.replaceAll('\\', '/'));
  return /^\.env(\..+)?$/.test(base) && !ENV_TEMPLATE.test(base);
}

export function commandTouchesSecretEnv(command) {
  for (const match of command.matchAll(ENV_IN_COMMAND)) {
    if (!ENV_TEMPLATE.test(match[1])) return true;
  }
  return false;
}

function toRepoPath(filePath, projectDir) {
  const rel = path.relative(projectDir, path.resolve(projectDir, filePath)).replaceAll('\\', '/');
  return rel.startsWith('..') ? null : rel;
}

function existsOnMain(repoPath, projectDir) {
  for (const ref of MAIN_REFS) {
    try {
      execFileSync('git', ['cat-file', '-e', `${ref}:${repoPath}`], { cwd: projectDir, stdio: 'ignore' });
      return true;
    } catch {
      // Ref or file missing: try the next ref.
    }
  }
  return false;
}

export function evaluate({ tool_name: tool, tool_input: input = {} }, projectDir) {
  if (tool === 'Bash') {
    return commandTouchesSecretEnv(input.command ?? '')
      ? 'Blocked: this command references a secret .env file. Use .env.example for documentation; real secrets live in GitHub Environments / Secret Manager (ADR 0009).'
      : null;
  }

  const filePath = input.file_path ?? input.notebook_path;
  if (!filePath) return null;

  if (isSecretEnvFile(filePath)) {
    return `Blocked: ${path.basename(filePath)} may contain secrets and is off-limits to agents (ADR 0009). Edit .env.example instead.`;
  }

  if (tool !== 'Read') {
    const repoPath = toRepoPath(filePath, projectDir);
    if (repoPath && MIGRATION.test(repoPath) && existsOnMain(repoPath, projectDir)) {
      return `Blocked: ${repoPath} is already on main and may have been applied to a database. Migrations are immutable: add a new V<next>__<description>.sql instead (ADR 0007).`;
    }
  }
  return null;
}

function main() {
  let payload;
  try {
    payload = JSON.parse(readFileSync(0, 'utf8'));
  } catch (error) {
    console.error(`guard.mjs: could not parse hook input (${error.message}); allowing.`);
    process.exit(1);
  }
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? payload.cwd ?? process.cwd();
  const reason = evaluate(payload, projectDir);
  if (reason) {
    console.error(reason);
    process.exit(2);
  }
  process.exit(0);
}

// Run only when executed directly (not when imported by the tests).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
