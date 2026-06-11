# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- `update` subcommand: compare local SKILL.md sha vs embedded sha, overwrite if differ
- `status` subcommand: show installed version vs latest package version
- GitHub Actions: run `node --test` on Win / Mac / Linux matrix

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
