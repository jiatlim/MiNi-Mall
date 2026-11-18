<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Mini Mall 项目协作说明

## 1. 项目定位

微型电商全栈单体项目，覆盖完整交易闭环：注册登录、商品浏览（列表/详情/搜索/分类）、购物车、下单与模拟支付、订单管理、后台（商品/分类/订单）管理，以及心悦会员等级折扣。

## 2. 技术栈（已锁定，不要擅自升级）

- Next.js 16.4.6（App Router + Turbopack）
- React 19.3.0 / TypeScript 5.9.3
- Prisma 5.22.0 + SQLite（`prisma/dev.db`）
- Tailwind CSS 4.3.5（`@tailwindcss/turbopack`）
- Zod 4.6.7、bcryptjs 3.0.3、jose 6.2.17
- 完整清单、安装命令与校验结果见 `DEPENDENCIES.md`

## 3. 常用命令（Windows PowerShell 5.1）

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run db:studio
npm.cmd run db:reset
```

不要使用 `npm` / `npx`（`npm.ps1` 被执行策略拦截），统一用 `npm.cmd` / `npx.cmd`。

## 4. 架构约定

- 读取：Server Component 直接调用 `src/server/queries/*`，不额外造 REST API。
- 写入：统一 Server Action（`src/server/actions/*`），入参先过 Zod，返回统一的 `ActionResult`。
- 例外：公开商品 API、购物车/订单 API、后台管理 API 属于显式需求，放在 `src/app/api/**`，写逻辑复用 `src/server/services/*`；页面读取仍走 `src/server/queries/*`。
- 数据库：`src/lib/db.ts` 导出 Prisma 单例，禁止在组件内 `new PrismaClient()`。
- 金额：数据库与计算一律用整数“分”（`*Cents`），仅展示层格式化。
- 状态：商品/订单状态用字符串常量，集中在 `src/lib/constants.ts`（SQLite 不支持 enum）。
- 会员：等级阈值与折扣率集中在 `src/lib/membership.ts`，禁止散落魔法数字。
- 权限：`src/proxy.ts` 只做跳转；每个 Server Action / Query 内部必须再次校验登录与角色。
- 安全：价格、库存、折扣、订单归属一律服务端计算与校验，不信任客户端提交的金额或 ID。

## 5. Next.js 16 注意

- `params` / `searchParams` / `cookies()` / `headers()` 均为异步，必须 `await`。
- 路由拦截使用 `src/proxy.ts`（Next.js 16 起取代 `middleware.ts`）。
- `next.config.ts` 保持 `cacheComponents: false`；数据变更后用 `revalidatePath` 失效。
- 修改 Next.js 相关代码前，先读 `node_modules/next/dist/docs/` 中对应文档。

## 6. 目录规划

- `src/app/(shop)`：首页、商品、分类、购物车、结算、订单、会员中心
- `src/app/(auth)`：登录、注册
- `src/app/admin`：后台看板、商品、分类、订单
- `src/server/actions`、`src/server/queries`：写操作与读查询
- `src/validators`：Zod Schema
- `src/lib`：db、auth、session、membership、money、constants、utils
- `src/components`：ui、product、cart、order、admin、member
- `prisma/schema.prisma`、`prisma/seed.ts`

## 7. 实施顺序

- P0 脚手架与依赖（已完成）
- P1 数据模型与迁移 + seed
- P2 认证与权限
- P3 商品浏览（列表/详情/搜索/分类/分页）
- P4 购物车
- P5 下单 / 模拟支付 / 会员折扣
- P6 后台管理
- P7 打磨与文档
- P8 全量校验

每完成一步先汇报结果，等待确认后再进入下一步。

## 8. 依赖与文档

- 任何新增/升级依赖都必须同步更新 `DEPENDENCIES.md`（版本、用途、命令、日期）。
- 不执行全局安装，不擅自更换锁定版本。
- 已安装中文 skills：`.opencode/skills/`（superpowers-zh 1.9.1，21 个）。
