# 适配 Linux 与 macOS — v0.1.1 设计

**日期**: 2026-06-12
**目标版本**: 0.1.0 → 0.1.1 (patch)
**作者**: brainstorming session

## 目标

让 `@xiangxinwomenziji/using-codegraph` v0.1.1 在 Linux、macOS、Windows 三平台都有**可执行证据**支撑"已验证"声明,并修补一处 Windows 上 git CRLF 转换会让脚本在 Unix 上无法执行的潜在 bug。

## 非目标 (YAGNI)

- 不修改 `bin/install.js` 与 `SKILL.md` 一个字节(产物本身已用跨平台 Node API)
- 不重命名 `bin` 字段或改目录结构(与跨平台无关,会扩散为 minor release)
- 不发布 `npm publish`(0.1.0 已声明 publish 是手动步骤,本次沿用)
- 不加 lint / coverage(0.1.x 暂不需要)
- 不本地真机验证 macOS/Linux(以 CI 三平台矩阵全绿为验证标准)

## 架构(改动地图)

```
using-codegraph-pkg/
├── .gitattributes                  [NEW]  强制 LF
├── .github/
│   └── workflows/
│       └── ci.yml                  [NEW]  3 OS × 3 Node = 9 jobs
├── bin/install.js                  不动
├── __tests__/install.test.mjs      不动
├── SKILL.md                        不动
├── package.json                    bump 0.1.0 → 0.1.1
├── README.md                       验证表 ⚠️ → ✅ via CI; 加 CI badge
├── README.zh-CN.md                 同上
└── CHANGELOG.md                    新增 [0.1.1] 段
```

**核心原则**:不动产物本身,只加"周边材料"。CI 一次绿灯 = 端到端验证 0.1.0 产物在三平台无 bug。

## 组件 1:`.gitattributes`

### 内容

```gitattributes
# 强制脚本与文档用 LF,避免 Windows 上 git core.autocrlf 把 shebang 写成 CRLF
* text=auto eol=lf

bin/*.js     text eol=lf
*.md         text eol=lf
*.mjs        text eol=lf
*.json       text eol=lf
*.yml        text eol=lf

LICENSE      text
```

### 根因

Windows 上 `git config core.autocrlf=true`(常见默认)会让 `git checkout` 后的 `install.js` 第一行变成 `#!/usr/bin/env node\r\n`。该文件被 npm 装到 Linux/macOS 用户的 `node_modules/.bin/` 时,bash 把整个 shebang(连同 `\r`)当解释器路径,报:

```
bad interpreter: /usr/bin/env node\r: no such file or directory
```

这是 Node 包跨平台 #1 杀手,Windows 本地测试时永远不复现。

### 不处理的相邻问题

| 候选 | 判定 | 理由 |
|---|---|---|
| `bin/install.js` 可执行位 | 不动 | npm 安装时自动 `chmod +x` bin 字段指向的文件 |
| `tmpdir()` 在 macOS 返回长路径 | 不动 | `mkdtempSync` 已正确处理,Node 已跨平台 |
| `process.env.HOME` 在 Windows 没有 | 已处理 | 测试用 `HOME` + `USERPROFILE` 双写 |
| `bin` 字段名与 `npx` 调用约定 | 不动 | 单 bin 包 npx 不查名字,且与跨平台无关 |
| `package.json` engines | 保留 `>=18` | 与 CI Node 下限对齐 |

## 组件 2:GitHub Actions CI 矩阵

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    name: ${{ matrix.os }} / Node ${{ matrix.node }}
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        os:   [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20, 22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - name: Run tests
        run: node --test __tests__/
      - name: Smoke test install/uninstall
        shell: bash
        run: |
          export HOME="$RUNNER_TEMP/fakehome"
          export USERPROFILE="$HOME"
          mkdir -p "$HOME"
          node bin/install.js install
          test -f "$HOME/.claude/skills/using-codegraph/SKILL.md"
          node bin/install.js uninstall
          test ! -d "$HOME/.claude/skills/using-codegraph"
```

### 关键设计点

1. **`fail-fast: false`** — 一个组合失败不中断其他 8 个,便于一次拿到完整跨平台报告
2. **不跑 `npm install`** — 零依赖包,直接 `node --test` 省 30s/job
3. **Smoke test 用 bash** — `shell: bash` 在 windows-latest 上走 Git Bash;单元测试用 `spawnSync` 走子进程,Smoke 直接走 shebang,后者才能暴露 CRLF bug
4. **`HOME` 隔离** — 用 `$RUNNER_TEMP/fakehome`,不污染 cache
5. **不发布 npm** — CI 只做 PR 验证,publish 仍手动

### 运行时预期

9 jobs × (~1s 单测 + ~2s smoke + ~1min setup) ≈ 2-3 分钟全绿。

## 组件 3:文档同步

### README.md `Verified environments` 段

```markdown
## Verified environments

[![CI](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml/badge.svg)](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml)

| OS | Status |
|---|---|
| Windows 11 / Server | ✅ Verified via CI (Node 18, 20, 22) |
| macOS (latest) | ✅ Verified via CI (Node 18, 20, 22) |
| Ubuntu (latest) | ✅ Verified via CI (Node 18, 20, 22) |

The install path `~/.claude/skills/using-codegraph/SKILL.md` is identical across platforms (Windows uses `%USERPROFILE%\.claude\skills\...`). Every push to `main` and every PR runs `node --test` plus an end-to-end install/uninstall smoke test on all three OSes.
```

### README.zh-CN.md `已验证环境` 段

```markdown
## 已验证环境

[![CI](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml/badge.svg)](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml)

| 操作系统 | 状态 |
|---|---|
| Windows 11 / Server | ✅ CI 验证 (Node 18, 20, 22) |
| macOS (latest) | ✅ CI 验证 (Node 18, 20, 22) |
| Ubuntu (latest) | ✅ CI 验证 (Node 18, 20, 22) |

每次 push 到 `main` 与每个 PR 都跑 `node --test` + 端到端 install/uninstall 烟雾测试,三平台全覆盖。
```

### CHANGELOG.md 新段

```markdown
## [0.1.1] - 2026-06-12

### Added
- `.gitattributes`: force LF for all text files (prevents Windows CRLF from corrupting the install.js shebang on Linux/macOS).
- GitHub Actions CI matrix: 3 OS (Ubuntu / macOS / Windows) × 3 Node (18 / 20 / 22) = 9 jobs. Runs `node --test` + install/uninstall smoke test on every push and PR.

### Changed
- README "Verified environments" table: macOS / Linux promoted from ⚠️ documented to ✅ verified via CI.
```

Unreleased 段保留 `update` / `status` subcommand 计划;从中删除 "GitHub Actions: run `node --test` on Win / Mac / Linux matrix"(已完成)。

### CI badge URL

Badge URL 用 `github.com/xiangxinwomenziji/using-codegraph` —— 跟 `package.json` 的 `repository.url` 一致。若仓库未推到 GitHub,badge 显示 "no status" 灰条,不破坏排版,推送后自动亮起。

## 组件 4:`package.json` 版本号

```diff
- "version": "0.1.0",
+ "version": "0.1.1",
```

仅此一处改动。`engines` / `bin` / `files` 维持不变。

## 数据流(install / uninstall 不变,只补 CI 链路)

```
开发者 push
  ↓
GitHub Actions 触发 ci.yml
  ↓ (9 并行 jobs)
checkout (LF 文件,.gitattributes 生效)
  ↓
setup-node
  ↓
node --test __tests__/install.test.mjs    ← 已有逻辑
  ↓
bash smoke: node bin/install.js install   ← 新增,直接走 shebang
  ↓
assert SKILL.md 落地 + 卸载干净
```

## 错误处理

CI 失败的处理:

- **某个 OS×Node 组合失败** → `fail-fast: false` 保证其他 jobs 跑完,从 jobs 视图直接看到哪类故障(CRLF / 路径 / Node 版本特性)
- **Smoke test 失败但单测通过** → 多半是 shebang/可执行位问题,看 `node bin/install.js install` 的报错
- **单测失败但 Smoke 通过** → 测试本身的环境假设问题(HOME/USERPROFILE 之类)
- **全部失败** → 检查 setup-node 是否正确装上对应版本

## 测试策略

本次不新增单元测试,理由:
1. `install.test.mjs` 已覆盖 install / uninstall / 幂等 / 未知命令 / `--help` 六种核心路径
2. 新加的"价值"在跨平台执行,不在新增逻辑
3. Smoke test 在 CI 里跑实际 shebang,补足单元测试用 `spawnSync(process.execPath, ...)` 绕开 shebang 这一盲点

## 风险与回滚

| 风险 | 概率 | 缓解 |
|---|---|---|
| `.gitattributes` 引起本仓库其他文件行尾被 git renormalize | 低 | `* text=auto eol=lf` 是声明而非强制重写;commit 后跑 `git add --renormalize .` 显式检查 |
| CI badge URL 与未来真实 GitHub 仓库不符 | 极低 | URL 已与 `package.json` `repository.url` 对齐 |
| Node 22 在 macOS-latest 上 setup-node 拉镜像慢 | 低 | actions/setup-node@v4 内置缓存,首次后秒级 |
| 用户已克隆过仓库,本地文件仍是 CRLF | 中 | 不影响下游 npm 用户(npm 发布前会重新打包);开发者跑 `git add --renormalize .` 修本地 |

**回滚路径**:`git revert <merge-commit>` —— 所有改动是纯加文件 + bump 版本,无破坏性。

## 实现顺序(留给 writing-plans skill 细化)

1. 创建 `.gitattributes`,跑 `git add --renormalize .` 看本地是否有 CRLF 需要重写
2. 创建 `.github/workflows/ci.yml`
3. 同步改 README.md / README.zh-CN.md / CHANGELOG.md
4. bump `package.json` version
5. 提交、推送、看 GitHub Actions 三平台 9 jobs 全绿
6. tag `v0.1.1`(可选,本 PR 不涉及 npm publish)
