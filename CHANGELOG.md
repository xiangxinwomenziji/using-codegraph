# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- `update` subcommand: compare local SKILL.md sha vs embedded sha, overwrite if differ
- `status` subcommand: show installed version vs latest package version

## [0.1.1] - 2026-06-12

### Added
- `.gitattributes`: force LF for all shipped text files (`bin/*.js`, `*.md`, `*.mjs`, `*.json`, `*.yml`). Prevents Windows `core.autocrlf` from rewriting the `install.js` shebang to CRLF, which would break execution on Linux/macOS with `bad interpreter: /usr/bin/env node\r`.
- GitHub Actions CI matrix: 3 OS (ubuntu-latest / macos-latest / windows-latest) × 3 Node (18 / 20 / 22) = 9 jobs. Runs `node --test` plus an end-to-end `install`/`uninstall` smoke test that exercises the shebang path. Triggers on every push to `main` and every PR.

### Changed
- README & README.zh-CN "Verified environments" table: macOS / Linux promoted from ⚠️ Documented to ✅ Verified via CI.

## [0.1.0] - 2026-06-11

### Added
- `install` subcommand: copies `SKILL.md` to `~/.claude/skills/using-codegraph/`
- `uninstall` subcommand: removes the target directory
- `--help` / `-h` / `help`: prints usage to stdout
- Bilingual README (`README.md` English + `README.zh-CN.md` 简体中文)
- Automated tests via `node --test` (no third-party dependencies)

### Notes
- macOS / Linux install paths documented; only Windows verified end-to-end on this release.
- `npm publish` deferred: requires `xiangxinwomenziji` organization on npmjs.org (separate one-time setup).
