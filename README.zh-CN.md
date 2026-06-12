# using-codegraph

一个 [Claude Code](https://claude.ai/code) 技能,强制 AI agent **优先使用 codegraph** 探索代码。读取或搜索代码前,先调 `codegraph_*` MCP 工具,而不是直接用 `Read` / `Grep` / `Glob`。

🇺🇸 [English](README.md)

## 安装

```bash
npx @xiangxinwomenziji/using-codegraph install
```

需要先在 Claude Code 里跑 [codegraph MCP](https://github.com/colbymchenry/codegraph)。本包只是个轻量壳,把 `SKILL.md` 放到你的本地 skills 目录里。

## 它做什么

这个技能是给 AI agent 的一条纪律规则。当你(用户)让 agent 搜索、读取、新增、修改代码时,agent 会被引导先调 `codegraph_explore` / `codegraph_search` / `codegraph_callers` / `codegraph_impact`,再考虑 `Read` 或 `Grep`。测试中,一个典型的"跨 4 个文件找引用"问题,从 4 次 Read + 1 次 Grep 降到 **1 次 `codegraph_explore`**,且 agent 拿到的信息完全一致。

## 使用方法

装完重启 Claude Code(让 agent 加载新技能),然后正常让它写代码即可。技能描述会自动触发,不需要特殊调用。

比如问"usePermission 在哪定义,调用了谁?"——agent 现在会先调 `codegraph_explore("usePermission")`,而不是 `Read src/hooks/use-permission.ts`。

## 已验证环境

[![CI](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml/badge.svg)](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml)

| 操作系统 | 状态 |
|---|---|
| Windows (latest) | ✅ CI 验证 (Node 18, 20, 22) |
| macOS (latest) | ✅ CI 验证 (Node 18, 20, 22) |
| Ubuntu (latest) | ✅ CI 验证 (Node 18, 20, 22) |

安装路径 `~/.claude/skills/using-codegraph/SKILL.md` 在三平台一致(Windows 是 `%USERPROFILE%\.claude\skills\...`)。每次 push 到 `main` 与每个 PR 都会跑 `node --test` + 端到端 install/uninstall 烟雾测试,三平台全覆盖。

## 卸载

```bash
npx @xiangxinwomenziji/using-codegraph uninstall
```

只删目标目录,不动其它。重启 Claude Code 让 agent 忘掉这个技能。

## 发布

本包只发包源码,`npm publish` 不在自动构建里——需要手动准备:

1. 在 npmjs.org 注册 `xiangxinwomenziji` 这个 handle 的账号(没有就建一个)
2. 在 npmjs.org 上创建 `xiangxinwomenziji` 组织(scoped 包必须有组织)
3. 配置 2FA(新账号默认开;要么关掉,要么设 `NPM_CONFIG_OTP` 环境变量)

然后:

```bash
npm login --registry=https://registry.npmjs.org/
npm publish --access public
```

## 许可证

MIT — 见 [LICENSE](LICENSE)。

## 相关

- [colbymchenry/codegraph](https://github.com/colbymchenry/codegraph) — codegraph MCP 服务(MIT)
