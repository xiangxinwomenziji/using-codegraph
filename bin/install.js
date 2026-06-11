#!/usr/bin/env node
import { existsSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(__dirname, '..', 'SKILL.md');
const TARGET_DIR = join(homedir(), '.claude', 'skills', 'using-codegraph');
const TARGET_FILE = join(TARGET_DIR, 'SKILL.md');

const cmd = process.argv[2] || 'install';

switch (cmd) {
  case 'install': {
    mkdirSync(TARGET_DIR, { recursive: true });
    copyFileSync(SRC, TARGET_FILE);
    console.log(`✓ Installed skill to ${TARGET_FILE}`);
    console.log(`  Restart Claude Code to pick it up.`);
    break;
  }
  case 'uninstall': {
    if (existsSync(TARGET_DIR)) {
      rmSync(TARGET_DIR, { recursive: true, force: true });
      console.log(`✓ Removed ${TARGET_DIR}`);
    } else {
      console.log(`Not installed (no ${TARGET_DIR}).`);
    }
    break;
  }
  case '--help':
  case '-h':
  case 'help': {
    console.log(`Usage:
  npx @xiangxinwomenziji/using-codegraph install     # install skill
  npx @xiangxinwomenziji/using-codegraph uninstall   # remove skill
  npx @xiangxinwomenziji/using-codegraph --help      # this help`);
    break;
  }
  default: {
    console.error(`Unknown command: ${cmd}. Run with --help for usage.`);
    process.exit(1);
  }
}
