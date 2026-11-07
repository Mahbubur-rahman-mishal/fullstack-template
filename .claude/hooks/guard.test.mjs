// Run with: pnpm test:hooks   (node --test .claude/hooks/)
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { commandTouchesSecretEnv, evaluate, isSecretEnvFile } from './guard.mjs';

const GUARD = path.join(path.dirname(fileURLToPath(import.meta.url)), 'guard.mjs');

describe('secret env files', () => {
  test('blocks real env files', () => {
    for (const f of ['.env', 'backend/.env', '.env.local', '.env.production', 'C:\\repo\\.env.staging']) {
      assert.equal(isSecretEnvFile(f), true, f);
    }
  });

  test('allows templates and look-alikes', () => {
    for (const f of ['.env.example', 'frontend/.env.sample', '.env.template', 'env.ts', 'dotenv.md', '.envrc.md']) {
      assert.equal(isSecretEnvFile(f), false, f);
    }
  });

  test('bash commands referencing .env are blocked', () => {
    for (const c of ['cat .env', 'source backend/.env', 'cp .env.prod /tmp', 'grep KEY "./.env"']) {
      assert.equal(commandTouchesSecretEnv(c), true, c);
    }
  });

  test('bash commands without secret env files pass', () => {
    for (const c of ['cp .env.example /tmp/env-template', 'node -e "process.env.HOME"', 'pnpm install', 'ls dotenv']) {
      assert.equal(commandTouchesSecretEnv(c), false, c);
    }
  });
});

describe('flyway migrations', () => {
  let repo;
  const migration = 'backend/src/main/resources/db/migration/V1__init.sql';
  const git = (...args) => execFileSync('git', args, { cwd: repo, stdio: 'ignore' });

  before(() => {
    repo = mkdtempSync(path.join(tmpdir(), 'guard-'));
    git('init', '-q', '-b', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'test');
    mkdirSync(path.join(repo, path.dirname(migration)), { recursive: true });
    writeFileSync(path.join(repo, migration), 'create table t (id int);\n');
    git('add', '.');
    git('commit', '-q', '-m', 'init');
  });

  after(() => rmSync(repo, { recursive: true, force: true }));

  test('editing a migration already on main is blocked', () => {
    const reason = evaluate({ tool_name: 'Edit', tool_input: { file_path: path.join(repo, migration) } }, repo);
    assert.match(reason, /immutable/);
  });

  test('overwriting it with Write is blocked', () => {
    assert.ok(evaluate({ tool_name: 'Write', tool_input: { file_path: migration } }, repo));
  });

  test('reading it is allowed', () => {
    assert.equal(evaluate({ tool_name: 'Read', tool_input: { file_path: migration } }, repo), null);
  });

  test('creating a new migration is allowed', () => {
    const next = 'backend/src/main/resources/db/migration/V2__add_column.sql';
    assert.equal(evaluate({ tool_name: 'Write', tool_input: { file_path: next } }, repo), null);
  });
});

describe('hook process contract', () => {
  const run = (payload) => spawnSync(process.execPath, [GUARD], { input: JSON.stringify(payload), encoding: 'utf8' });

  test('exits 2 with a reason on stderr when blocking', () => {
    const result = run({ tool_name: 'Read', tool_input: { file_path: '.env' } });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /secrets/);
  });

  test('exits 0 when allowing', () => {
    assert.equal(run({ tool_name: 'Read', tool_input: { file_path: 'README.md' } }).status, 0);
  });
});
