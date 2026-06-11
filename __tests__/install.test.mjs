import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, existsSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..', '..');
const INSTALL_JS = join(__dirname, 'bin', 'install.js');
const SKILL_MD  = join(__dirname, 'SKILL.md');

function makeTmpHome() {
  return mkdtempSync(join(tmpdir(), 'ucg-test-'));
}

function run(cmd, env = {}) {
  // Override HOME + USERPROFILE so homedir() in the subprocess resolves to our temp dir.
  const fullEnv = { ...process.env, ...env };
  return spawnSync(process.execPath, [INSTALL_JS, cmd], {
    env: fullEnv,
    encoding: 'utf8',
  });
}

test('install: writes SKILL.md to target dir', () => {
  const home = makeTmpHome();
  try {
    const r = run('install', { HOME: home, USERPROFILE: home });
    assert.equal(r.status, 0, `expected exit 0, got ${r.status}. stderr: ${r.stderr}`);
    const target = join(home, '.claude', 'skills', 'using-codegraph', 'SKILL.md');
    assert.ok(existsSync(target), `expected ${target} to exist`);
    const installed = readFileSync(target, 'utf8');
    const pkgSource = readFileSync(SKILL_MD, 'utf8');
    assert.equal(installed, pkgSource, 'installed SKILL.md must match package SKILL.md byte-for-byte');
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('install: idempotent (re-run does not error)', () => {
  const home = makeTmpHome();
  try {
    const r1 = run('install', { HOME: home, USERPROFILE: home });
    const r2 = run('install', { HOME: home, USERPROFILE: home });
    assert.equal(r1.status, 0);
    assert.equal(r2.status, 0, `re-install should exit 0, got ${r2.status}. stderr: ${r2.stderr}`);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('uninstall: removes target dir', () => {
  const home = makeTmpHome();
  try {
    run('install', { HOME: home, USERPROFILE: home });
    const targetDir = join(home, '.claude', 'skills', 'using-codegraph');
    assert.ok(existsSync(targetDir));
    const r = run('uninstall', { HOME: home, USERPROFILE: home });
    assert.equal(r.status, 0, `uninstall should exit 0, got ${r.status}. stderr: ${r.stderr}`);
    assert.ok(!existsSync(targetDir), 'target dir should be removed');
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('uninstall: idempotent on empty', () => {
  const home = makeTmpHome();
  try {
    const r = run('uninstall', { HOME: home, USERPROFILE: home });
    assert.equal(r.status, 0, 'uninstall on empty should exit 0');
    assert.match(r.stdout, /Not installed/i);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('unknown subcommand: exits 1 with stderr', () => {
  const home = makeTmpHome();
  try {
    const r = run('banana', { HOME: home, USERPROFILE: home });
    assert.equal(r.status, 1, `unknown subcommand should exit 1, got ${r.status}`);
    assert.match(r.stderr, /Unknown command/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});

test('--help: exits 0 with usage on stdout', () => {
  const home = makeTmpHome();
  try {
    const r = run('--help', { HOME: home, USERPROFILE: home });
    assert.equal(r.status, 0);
    assert.match(r.stdout, /install/);
    assert.match(r.stdout, /uninstall/);
  } finally {
    rmSync(home, { recursive: true, force: true });
  }
});
