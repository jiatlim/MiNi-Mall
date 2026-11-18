# Mini Mall 安装与依赖记录

> 本文档记录本项目**新增**的软件与依赖。项目开始前已存在的环境单独列出，不计入安装记录。
> 每次执行步骤后追加；版本以 `npm.cmd ls --depth=0` 的实际输出为准。
> 不记录任何密钥值，`AUTH_SECRET` 仅标记为“已生成”。

- 项目：Mini Mall
- 初始记录：2026-11-17
- 工作目录：`D:\delete\pj1`
- 包管理器：npm（Windows PowerShell 下统一使用 `npm.cmd` / `npx.cmd`）

## 1. 环境基线（项目开始前已存在，非本项目安装）

| 项目 | 版本 | 备注 |
|---|---|---|
| OS | Windows (win32) | 已有 |
| Node.js | v24.17.0 | 已有 |
| npm | 11.13.0 | 已有；PowerShell 执行策略禁止 `npm.ps1`，统一用 `npm.cmd` |
| npx | 11.13.0 | 已有 |
| Git | 2.47.0.windows.1 | 已有 |
| PowerShell | 5.1.26100.9711 | 已有 |

## 2. 本项目安装记录

### P0 — 创建项目（2026-11-17）

| 包 | 版本 | 类型 | 用途 | 来源 |
|---|---|---|---|---|
| next | 16.4.6 | production | Web 框架（App Router、Turbopack） | create-next-app |
| react | 19.3.0 | production | UI 运行时 | create-next-app |
| react-dom | 19.3.0 | production | DOM 渲染 | create-next-app |
| @prisma/client | 5.22.0 | production | Prisma ORM 客户端 | 手动安装 |
| bcryptjs | 3.0.3 | production | 密码哈希 | 手动安装 |
| jose | 6.2.17 | production | JWT 会话签名/校验 | 手动安装 |
| zod | 4.6.7 | production | 请求与表单校验 | 手动安装 |
| @tailwindcss/turbopack | 4.3.5 | dev | Tailwind 4 的 Turbopack 加载器 | create-next-app（由 4.3.3 升级） |
| tailwindcss | 4.3.5 | dev | 原子化 CSS | create-next-app（由 4.3.3 升级） |
| @types/node | 20.19.43 | dev | Node 类型声明 | create-next-app |
| @types/react | 19.3.0 | dev | React 类型声明 | create-next-app |
| @types/react-dom | 19.3.0 | dev | React DOM 类型声明 | create-next-app |
| eslint | 9.39.4 | dev | 代码检查 | create-next-app |
| eslint-config-next | 16.4.6 | dev | Next.js ESLint 规则 | create-next-app |
| prisma | 5.22.0 | dev | Prisma CLI（generate/migrate/studio） | 手动安装 |
| tsx | 4.23.15 | dev | 运行 `prisma/seed.ts` | 手动安装 |
| typescript | 5.9.3 | dev | TypeScript 编译器 | create-next-app（锁定到 5.9.x） |

### 安装命令

```powershell
npx.cmd create-next-app@16.4.6 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

npm.cmd install @prisma/client@5.22.0 zod@4.6.7 bcryptjs@3.0.3 jose@6.2.17

npm.cmd install -D prisma@5.22.0 typescript@5.9 tsx@4 tailwindcss@4.3.5 @tailwindcss/turbopack@4.3.5

npm.cmd install --package-lock-only --ignore-scripts
npm.cmd prune --ignore-scripts
```

### 依赖策略

- 直接依赖全部锁定为精确版本（`package.json` 中不带 `^` / `~`），`package-lock.json` 锁定整棵依赖树。
- 未执行任何全局安装（`npm install -g`）。
- 额外的 UI/表单依赖（如 `lucide-react`、`clsx`、`tailwind-merge`、`react-hook-form`）留到对应阶段再装，并在此追加。

## 3. 通过 npx 使用但未全局安装

| 工具 | 版本 | 用途 | 备注 |
|---|---|---|---|
| create-next-app | 16.4.6 | 初始化项目骨架 | 由 npx 临时下载 |
| prisma | 5.22.0 | `validate` / `generate` / 后续 migrate | 项目 devDependency |
| superpowers-zh | 1.9.1 | 为 OpenCode 安装 21 个中文工作流 skills | 安装到 `.opencode/skills/`，非 npm 项目依赖；命令：`npx.cmd --yes superpowers-zh@1.9.1 --tool opencode` |

## 4. 版本变更记录

| 日期 | 包 | 原版本 | 新版本 | 原因 |
|---|---|---|---|---|
| 2026-11-17 | tailwindcss | 4.3.3 | 4.3.5 | 对齐锁定的 4.x 最新补丁 |
| 2026-11-17 | @tailwindcss/turbopack | 4.3.3 | 4.3.5 | 与 tailwindcss 保持一致 |
| 2026-11-17 | typescript | ^5（浮动） | 5.9.3（精确） | 避免 Prisma 5 与 TS 6 的兼容风险 |
| 2026-11-17 | 全部直接依赖 | `^x.y.z` | 精确版本 | 保证可复现安装 |

## 5. 已知问题与处理

| 问题 | 现象 | 处理 |
|---|---|---|
| `prisma init` 在 Node 24 下崩溃 | `(0, CSe.isError) is not a function` | 手动创建 `prisma/schema.prisma` 与 `.env`；`prisma -v`、`validate`、`generate` 均正常 |
| Prisma 5.22 未官方支持 Node 24 | 可能出现过时警告 | 当前 `validate` 正常；后续 migrate 若失败，再降 Node 22 LTS 或升级 Prisma |
| PowerShell 禁止 `npm.ps1` | 直接运行 `npm` 报执行策略错误 | 统一使用 `npm.cmd` / `npx.cmd` |
| 空 schema 下 `prisma generate` 失败 | “You don't have any models defined” | 已恢复 `build: prisma generate && next build` 与 `postinstall`；当前 schema 已包含模型 |
| `import "server-only"` | `npm ls server-only` 为空 | 由 Next.js 内部别名提供，无需单独安装 |
| `.env` 被 `.gitignore` 忽略 | `.env.example` 也会被忽略 | 已在 `.gitignore` 增加 `!.env.example` |

## 6. 校验结果（当前，2026-11-18）

| 检查 | 命令 | 结果 |
|---|---|---|
| 依赖树 | `npm.cmd ls --depth=0` | 通过，无 extraneous 包 |
| Prisma schema | `npx.cmd prisma validate` | 通过（schema is valid） |
| 数据库迁移 | `npx.cmd prisma migrate status` | 已是最新 |
| TypeScript | `npm.cmd run typecheck` | 通过，exit 0 |
| ESLint | `npm.cmd run lint` | 通过，exit 0 |
| 生产构建 | `npm.cmd run build` | 通过 |
| 开发服务器 | `npm.cmd run dev` + `GET http://localhost:3000` | HTTP 200 |

## 7. 后续阶段依赖变更

- 购物车、订单、后台管理、商品插画、审查修复阶段均未新增 npm 依赖。
- `server-only` 由 Next.js 内部别名提供，未加入 `package.json`。
- 商品插画为仓库内本地 SVG，不依赖外部图片服务。
- 新增依赖时必须同步更新本文件与 `package-lock.json`。

## 8. 安装文档

- 克隆、环境变量、迁移、seed 与启动步骤见 [`README.md`](./README.md)。
- 管理员默认账号与 Seed 行为也在 README 中说明。
