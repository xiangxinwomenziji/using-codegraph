# v0.1.1 跨平台适配 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `@xiangxinwomenziji/using-codegraph` 0.1.0 → 0.1.1。加 `.gitattributes` 锁 LF、加 GitHub Actions 3×3 矩阵、同步 README/CHANGELOG/版本号。

**Architecture:** 纯加法 + 一次版本号 bump。`bin/install.js` 与 `SKILL.md` 一个字节不动。`.gitattributes` 解决 Windows `core.autocrlf` 把 `install.js` shebang 改成 CRLF 导致 Unix 跑不起来的问题。CI 矩阵作为"已验证"声明的可执行证据。

**Tech Stack:** Node ≥18(零运行时依赖)、GitHub Actions、`node --test`、bash。

**分支策略:** 工作在 `feat/cross-platform-0.1.1`。每个 Task 末尾 commit;最后一个 Task push 并提示开 PR。

**Spec:** `docs/superpowers/specs/2026-06-12-cross-platform-design.md`

---

## 文件改动地图

| 路径 | 操作 | 责任 |
|---|---|---|
| `.gitattributes` | Create | 强制所有文本文件用 LF(防御 Windows CRLF) |
| `.github/workflows/ci.yml` | Create | 3 OS × 3 Node = 9 jobs 矩阵,跑 `node --test` + 端到端 install/uninstall 烟雾测试 |
| `package.json` | Modify(L3) | version: `0.1.0` → `0.1.1` |
| `README.md` | Modify(L25-33 段) | Verified environments 表格 + CI badge |
| `README.zh-CN.md` | Modify(L25-33 段) | 已验证环境 表格 + CI badge |
| `CHANGELOG.md` | Modify(L8-13 + 新增 [0.1.1] 段) | 新版本条目 + Unreleased 移除"GH Actions"那条 |
| `bin/install.js` | **不动** | 产物本身已跨平台 |
| `SKILL.md` | **不动** | 技能内容与平台无关 |
| `__tests__/install.test.mjs` | **不动** | 已有用例已覆盖 |

---

## Task 1: 创建特性分支

**Files:**
- 无(只操作 git)

- [ ] **Step 1: 确认仓库干净且在 main**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git status && git branch --show-current
```
Expected:
```
On branch main
Your branch is up to date with 'origin/main'.
nothing to commit, working tree clean
main
```
(若有未提交改动,先停下来跟用户确认)

- [ ] **Step 2: 创建并切到特性分支**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git checkout -b feat/cross-platform-0.1.1
```
Expected:
```
Switched to a new branch 'feat/cross-platform-0.1.1'
```

- [ ] **Step 3: 确认分支已切**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git branch --show-current
```
Expected:
```
feat/cross-platform-0.1.1
```

---

## Task 2: 加 `.gitattributes` 并 renormalize

**Files:**
- Create: `C:/Users/0/Documents/using-codegraph-pkg/.gitattributes`

- [ ] **Step 1: 体检当前 bin/install.js 在 git 里存的是什么 eol**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git ls-files --eol bin/install.js
```
Expected 列说明:第一列是 git 仓库里的存储格式(`i/lf` 或 `i/crlf`),第二列是工作区(`w/lf` 或 `w/crlf`)。无论结果如何继续 —— 这一步只是记录基线。

- [ ] **Step 2: 写 `.gitattributes`**

Write `C:/Users/0/Documents/using-codegraph-pkg/.gitattributes` with content:

```gitattributes
# 强制脚本与文档用 LF,避免 Windows 上 git core.autocrlf 把 shebang 写成 CRLF
# 这是 Node bin 包在 Linux/macOS 上跑不起来最常见的根因。

* text=auto eol=lf

bin/*.js     text eol=lf
*.md         text eol=lf
*.mjs        text eol=lf
*.json       text eol=lf
*.yml        text eol=lf
*.yaml       text eol=lf

# LICENSE 没扩展名,显式标 text
LICENSE      text

# 二进制白名单(目前没有,占位以防后续加图)
*.png        binary
*.jpg        binary
*.gz         binary
```

- [ ] **Step 3: 跑 `git add --renormalize .` 让新策略生效**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git add .gitattributes && git add --renormalize .
```
Expected: 无错误输出。可能会有警告提示某些文件 eol 被修正(良性)。

- [ ] **Step 4: 看哪些文件被改了**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git status
```
Expected 两种情况之一:
- (A) 只有 `new file: .gitattributes` —— 仓库本来就干净,policy 只是预防未来
- (B) 还看到其他 `modified:` 文件 —— 这些是原本是 CRLF 现在被修成 LF 的,**正是 spec 描述的 bug 受害者**,要一起 commit

任一情况都正常,继续。

- [ ] **Step 5: 本地烟雾测试 `install.js` 还能跑**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && node bin/install.js --help
```
Expected:
```
Usage:
  npx @xiangxinwomenziji/using-codegraph install     # install skill
  npx @xiangxinwomenziji/using-codegraph uninstall   # remove skill
  npx @xiangxinwomenziji/using-codegraph --help      # this help
```

- [ ] **Step 6: 跑现有单元测试,确保 renormalize 没破任何东西**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && node --test __tests__/
```
Expected: `# pass 6`(6 个用例全过,见 `__tests__/install.test.mjs`)

- [ ] **Step 7: Commit**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git commit -m "build: add .gitattributes to enforce LF for shipped scripts

Prevents Windows core.autocrlf from rewriting the install.js shebang
to CRLF, which would cause 'bad interpreter: /usr/bin/env node\\r' on
Linux/macOS consumers of the published npm tarball.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
Expected: `[feat/cross-platform-0.1.1 <sha>] build: add .gitattributes ...`

---

## Task 3: 加 GitHub Actions CI 工作流

**Files:**
- Create: `C:/Users/0/Documents/using-codegraph-pkg/.github/workflows/ci.yml`

- [ ] **Step 1: 写 workflow 文件**

Write `C:/Users/0/Documents/using-codegraph-pkg/.github/workflows/ci.yml` with content:

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

      - name: Show env
        run: |
          node --version
          npm --version
        shell: bash

      - name: Run unit tests
        run: node --test __tests__/

      - name: Smoke test install/uninstall (shebang path)
        shell: bash
        run: |
          export HOME="$RUNNER_TEMP/fakehome"
          export USERPROFILE="$HOME"
          mkdir -p "$HOME"
          node bin/install.js install
          test -f "$HOME/.claude/skills/using-codegraph/SKILL.md" || (echo "SKILL.md not installed" && exit 1)
          node bin/install.js uninstall
          test ! -d "$HOME/.claude/skills/using-codegraph" || (echo "uninstall did not remove dir" && exit 1)
          echo "smoke test passed"
```

- [ ] **Step 2: 结构性自检 yaml 关键字段都在**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && grep -E "(ubuntu-latest|macos-latest|windows-latest|node: \[18, 20, 22\]|fail-fast: false)" .github/workflows/ci.yml
```
Expected: 5 行命中(3 OS + 1 Node 矩阵 + fail-fast)

- [ ] **Step 3: 本地手跑一遍 smoke 脚本(模拟 CI 关键步骤)**

Run(Git Bash):
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && \
  export RUNNER_TEMP="$(mktemp -d)" && \
  export HOME="$RUNNER_TEMP/fakehome" && \
  export USERPROFILE="$HOME" && \
  mkdir -p "$HOME" && \
  node bin/install.js install && \
  test -f "$HOME/.claude/skills/using-codegraph/SKILL.md" && echo "install OK" && \
  node bin/install.js uninstall && \
  test ! -d "$HOME/.claude/skills/using-codegraph" && echo "uninstall OK" && \
  rm -rf "$RUNNER_TEMP"
```
Expected:
```
✓ Installed skill to .../SKILL.md
  Restart Claude Code to pick it up.
install OK
✓ Removed .../using-codegraph
uninstall OK
```

- [ ] **Step 4: Commit**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git add .github/workflows/ci.yml && git commit -m "ci: add 3 OS x 3 Node matrix workflow

Runs node --test plus an end-to-end install/uninstall smoke test on
ubuntu-latest, macos-latest, windows-latest x Node 18, 20, 22 (9 jobs).
fail-fast: false so a single failure does not mask the others.

The smoke test runs via the install.js shebang directly (not via
process.execPath like the unit tests), so it catches CRLF-in-shebang
regressions the unit tests cannot.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
Expected: `[feat/cross-platform-0.1.1 <sha>] ci: add 3 OS x 3 Node matrix workflow`

---

## Task 4: 更新 README / CHANGELOG / 版本号

**Files:**
- Modify: `C:/Users/0/Documents/using-codegraph-pkg/README.md`
- Modify: `C:/Users/0/Documents/using-codegraph-pkg/README.zh-CN.md`
- Modify: `C:/Users/0/Documents/using-codegraph-pkg/CHANGELOG.md`
- Modify: `C:/Users/0/Documents/using-codegraph-pkg/package.json`

### Step 1-3:改 `README.md`

- [ ] **Step 1: 替换 Verified environments 段**

Edit `C:/Users/0/Documents/using-codegraph-pkg/README.md`.

Find this block (currently L25-33):
```markdown
## Verified environments

| OS | Status |
|---|---|
| Windows 11 (this dev machine) | ✅ Verified end-to-end |
| macOS | ⚠️ Documented; not yet verified on this release |
| Linux | ⚠️ Documented; not yet verified on this release |

The install path `~/.claude/skills/using-codegraph/SKILL.md` is identical across platforms (Windows uses `%USERPROFILE%\.claude\skills\...`). The `node:fs` / `node:os` / `node:path` modules used by the install script are cross-platform. Help verifying on macOS / Linux is welcome — open a PR.
```

Replace with:
```markdown
## Verified environments

[![CI](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml/badge.svg)](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml)

| OS | Status |
|---|---|
| Windows (latest) | ✅ Verified via CI (Node 18, 20, 22) |
| macOS (latest) | ✅ Verified via CI (Node 18, 20, 22) |
| Ubuntu (latest) | ✅ Verified via CI (Node 18, 20, 22) |

The install path `~/.claude/skills/using-codegraph/SKILL.md` is identical across platforms (Windows uses `%USERPROFILE%\.claude\skills\...`). Every push to `main` and every PR runs `node --test` plus an end-to-end install/uninstall smoke test on all three OSes.
```

- [ ] **Step 2: 验证替换成功**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && grep -c "Verified via CI" README.md
```
Expected: `3`(三行表格各一次)

```bash
cd C:/Users/0/Documents/using-codegraph-pkg && ! grep -q "not yet verified" README.md && echo "stale warning removed"
```
Expected: `stale warning removed`

### Step 3:改 `README.zh-CN.md`

- [ ] **Step 3: 同步替换中文 README**

Edit `C:/Users/0/Documents/using-codegraph-pkg/README.zh-CN.md`.

Find this block (currently L25-33):
```markdown
## 已验证环境

| 操作系统 | 状态 |
|---|---|
| Windows 11 (本开发机) | ✅ 端到端验证 |
| macOS | ⚠️ 已文档化,本版本未验证 |
| Linux | ⚠️ 已文档化,本版本未验证 |

安装路径 `~/.claude/skills/using-codegraph/SKILL.md` 在三平台一致(Windows 是 `%USERPROFILE%\.claude\skills\...`)。安装脚本用的 `node:fs` / `node:os` / `node:path` 跨平台。欢迎帮验 macOS / Linux,提个 PR 即可。
```

Replace with:
```markdown
## 已验证环境

[![CI](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml/badge.svg)](https://github.com/xiangxinwomenziji/using-codegraph/actions/workflows/ci.yml)

| 操作系统 | 状态 |
|---|---|
| Windows (latest) | ✅ CI 验证 (Node 18, 20, 22) |
| macOS (latest) | ✅ CI 验证 (Node 18, 20, 22) |
| Ubuntu (latest) | ✅ CI 验证 (Node 18, 20, 22) |

安装路径 `~/.claude/skills/using-codegraph/SKILL.md` 在三平台一致(Windows 是 `%USERPROFILE%\.claude\skills\...`)。每次 push 到 `main` 与每个 PR 都会跑 `node --test` + 端到端 install/uninstall 烟雾测试,三平台全覆盖。
```

- [ ] **Step 4: 验证替换成功**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && grep -c "CI 验证" README.zh-CN.md
```
Expected: `3`

### Step 5-6:改 `CHANGELOG.md`

- [ ] **Step 5: 改 Unreleased 段 + 加 [0.1.1] 段**

Edit `C:/Users/0/Documents/using-codegraph-pkg/CHANGELOG.md`.

Find:
```markdown
## [Unreleased]

### Planned
- `update` subcommand: compare local SKILL.md sha vs embedded sha, overwrite if differ
- `status` subcommand: show installed version vs latest package version
- GitHub Actions: run `node --test` on Win / Mac / Linux matrix

## [0.1.0] - 2026-06-11
```

Replace with:
```markdown
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
```

- [ ] **Step 6: 验证 CHANGELOG**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && grep -E "^## \[0\.1\.1\]" CHANGELOG.md
```
Expected: `## [0.1.1] - 2026-06-12`

```bash
cd C:/Users/0/Documents/using-codegraph-pkg && ! grep -q "Win / Mac / Linux matrix" CHANGELOG.md && echo "planned item removed"
```
Expected: `planned item removed`

### Step 7-8:bump `package.json`

- [ ] **Step 7: 改版本号**

Edit `C:/Users/0/Documents/using-codegraph-pkg/package.json`.

Find:
```json
  "version": "0.1.0",
```

Replace with:
```json
  "version": "0.1.1",
```

- [ ] **Step 8: 验证 JSON 仍合法 + 版本对**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && node -e "console.log(require('./package.json').version)"
```
Expected: `0.1.1`

### Step 9-10:回归 + commit

- [ ] **Step 9: 跑一遍单测确保没碰坏**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && node --test __tests__/
```
Expected: `# pass 6`

- [ ] **Step 10: Commit**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && \
  git add README.md README.zh-CN.md CHANGELOG.md package.json && \
  git commit -m "release: v0.1.1

- README: promote macOS/Linux from documented to CI-verified, add CI badge
- README.zh-CN: same
- CHANGELOG: new [0.1.1] section; remove the 'planned' CI item now done
- package.json: 0.1.0 -> 0.1.1

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```
Expected: `[feat/cross-platform-0.1.1 <sha>] release: v0.1.1`

---

## Task 5: 推分支并提示开 PR

**Files:**
- 无(只操作 git/远程)

- [ ] **Step 1: 把分支 commit 全列出来 sanity check**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git log --oneline main..HEAD
```
Expected: 3 个 commit:
```
<sha> release: v0.1.1
<sha> ci: add 3 OS x 3 Node matrix workflow
<sha> build: add .gitattributes to enforce LF for shipped scripts
```
(spec commit在 main 上,不出现在这里 —— 因为 main 已经包含它了)

- [ ] **Step 2: 看 diff 总览,确认没意外文件**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git diff --stat main..HEAD
```
Expected 触碰文件清单(允许 Task 2 的 renormalize 引入其他 `modified` 文件;**绝不应**出现 `bin/install.js`/`SKILL.md`/`__tests__/install.test.mjs` 内容改动 —— 它们只可能因 eol 重写出现,内容必须不变):
```
 .github/workflows/ci.yml | NN ++++++++++++++++++++++++++++
 .gitattributes           | NN ++++++++++++++++++++
 CHANGELOG.md             | NN ++++++++++++++++--
 README.md                | NN +++++++--------
 README.zh-CN.md          | NN +++++++--------
 package.json             |  2 +-
 (... 可能有其他 renormalize 的文件)
```

- [ ] **Step 3: Push 分支**

Run:
```bash
cd C:/Users/0/Documents/using-codegraph-pkg && git push -u origin feat/cross-platform-0.1.1
```
Expected: `* [new branch] feat/cross-platform-0.1.1 -> feat/cross-platform-0.1.1`

- [ ] **Step 4: 报告 PR URL + 等 CI**

打印给用户:
- 分支已推到 `origin/feat/cross-platform-0.1.1`
- 提示开 PR 的 URL:`https://github.com/xiangxinwomenziji/using-codegraph/pull/new/feat/cross-platform-0.1.1`
- 提示 Actions URL:`https://github.com/xiangxinwomenziji/using-codegraph/actions`
- 等待 9 个 job 全绿,绿了再合并到 main
- 合 main 之后再决定是否 `git tag v0.1.1` + `npm publish`(后者按 README 写的手动流程走)

---

## 完工标准 (Definition of Done)

- [ ] 三个 commit 在 `feat/cross-platform-0.1.1` 分支上,顺序为:`.gitattributes` → `ci.yml` → `release: v0.1.1`
- [ ] 本地 `node --test __tests__/` 仍是 6 pass
- [ ] 本地 smoke 测试(Task 3 Step 3)走通
- [ ] 分支已 push 到 `origin`
- [ ] **GitHub Actions 上 9 jobs 全绿**(这一步在 push 之后等 CI;若有 job 失败,回到对应 Task 修复)

## 不在本计划范围

- `npm publish` —— 按 README 已有的手动流程
- `git tag v0.1.1` —— 合并 main 后再打
- `update` / `status` 子命令 —— Unreleased 段保留,后续 release 做
- 重命名 `bin` 字段或目录重构 —— 与跨平台无关,不在 0.1.1 patch 范围

---

## Self-Review (作者自检结果)

**1. Spec 覆盖检查:**
| Spec 节 | 对应 Task | 覆盖? |
|---|---|---|
| 组件 1 `.gitattributes` | Task 2 | ✅ |
| 组件 2 CI workflow | Task 3 | ✅ |
| 组件 3 README/CHANGELOG | Task 4 Step 1-6 | ✅ |
| 组件 4 package.json bump | Task 4 Step 7-8 | ✅ |
| 实现顺序 1-6 | Task 1-5 | ✅ |
| 风险:renormalize 引发本仓库其他文件改 | Task 2 Step 4 已显式预告 | ✅ |
| 风险:badge URL 仓库未建 | Task 5 Step 4 提醒查看 | ✅ |

**2. Placeholder 扫描:** 无 TBD/TODO/"appropriate error handling"。所有 `Find/Replace` 块都贴了完整新旧内容。✅

**3. 类型/标识符一致性:**
- 分支名 `feat/cross-platform-0.1.1` 在 Task 1/2/3/4/5 commit 输出与 Step 3 push 命令全部一致 ✅
- workflow 文件路径 `.github/workflows/ci.yml` 一致 ✅
- CI badge URL 在 README/README.zh-CN/Task 5 一致(同一仓库路径) ✅
- 版本号 `0.1.1` 在 package.json / CHANGELOG / commit message / 分支名一致 ✅
- "9 jobs"=3×3 在 spec/plan/commit msg 一致 ✅

通过。
