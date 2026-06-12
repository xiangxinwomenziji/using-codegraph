# using-codegraph

A [Claude Code](https://claude.ai/code) skill that enforces **codegraph-first** code exploration. Always reach for `codegraph_*` MCP tools before falling back to `Read` / `Grep` / `Glob`.

🇨🇳 [中文版](README.zh-CN.md)

## Install

```bash
npx @xiangxinwomenziji/using-codegraph install
```

Requires [codegraph MCP](https://github.com/colbymchenry/codegraph) already running in your Claude Code instance. The package itself is a thin wrapper that drops `SKILL.md` into your local skills directory.

## What it does

The skill is a discipline rule for AI agents. When you (the human) ask the agent to search, read, add, or modify code, the agent is steered to use `codegraph_explore` / `codegraph_search` / `codegraph_callers` / `codegraph_impact` before reaching for `Read` or `Grep`. In testing, a typical 4-file cross-reference question dropped from 4 Read calls + 1 Grep call to **1 `codegraph_explore` call**, with the agent receiving identical information.

## Usage

After install, restart Claude Code (so it picks up the new skill) and ask it to do anything involving code. The skill description triggers automatically — no special invocation needed.

For example, ask "where is `usePermission` defined and what does it call?" — the agent should now call `codegraph_explore("usePermission")` first, not `Read src/hooks/use-permission.ts`.

## Verified environments

[![CI](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml/badge.svg)](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml)

| OS | Status |
|---|---|
| Windows (latest) | ✅ Verified via CI (Node 18, 20, 22) |
| macOS (latest) | ✅ Verified via CI (Node 18, 20, 22) |
| Ubuntu (latest) | ✅ Verified via CI (Node 18, 20, 22) |

The install path `~/.claude/skills/using-codegraph/SKILL.md` is identical across platforms (Windows uses `%USERPROFILE%\.claude\skills\...`). Every push to `main` and every PR runs `node --test` plus an end-to-end install/uninstall smoke test on all three OSes.

## Uninstall

```bash
npx @xiangxinwomenziji/using-codegraph uninstall
```

The target directory is removed; nothing else is touched. Restart Claude Code to drop the skill from the agent's toolbelt.

## Publishing

This v0.1.0 release ships the package source. The `npm publish` step is **not** included in the build — it requires manual setup:

1. An npmjs.org account under the `xiangxinwomenziji` handle (create one if needed)
2. The `xiangxinwomenziji` organization created on npmjs.org (scoped packages require this)
3. 2FA configured (now default for new npm accounts; either disable for publish or set `NPM_CONFIG_OTP` env var)

Then:

```bash
npm login --registry=https://registry.npmjs.org/
npm publish --access public
```

## License

MIT — see [LICENSE](LICENSE).

## Related

- [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) — the codegraph MCP server (MIT)
