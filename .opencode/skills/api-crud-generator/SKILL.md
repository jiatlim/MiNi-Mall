---
name: CRUD 生成器（Server Actions）
description: "按项目约定，根据 Prisma 模型生成管理后台 CRUD：查询函数、Zod 校验、Server Actions 与管理页面。当用户要求为某个模型生成增删改查或后台管理页面时使用。"
version: "1.1"
license: MIT
metadata:
  triggers:
    - 生成 CRUD
    - 生成管理页面
    - 生成 Server Action
---

# CRUD 生成器（Server Actions）

## 适用范围

本项目不使用 REST API：读取走 Server Component + `src/server/queries`，写入走 Server Action + Zod。
生成前先阅读 `AGENTS.md` 和相邻的同类实现，保持命名、返回结构与错误处理一致。

## 功能说明

根据指定 Prisma 模型生成：

1. 查询函数：列表（搜索/分页）与详情
2. Zod Schema：创建与更新
3. Server Actions：创建、更新、删除
4. 管理页面：列表、新建、编辑
5. 表单组件（客户端，使用 `useActionState`）

## 执行步骤

### 第 1 步：确认信息

询问用户：

- 模型名称（如 Product、Category）
- 页面路由（如 `/admin/products`）
- 列表是否需要搜索/分页
- 哪些字段可创建/编辑，哪些只读（如 `id`、`createdAt`）

### 第 2 步：生成查询

文件：`src/server/queries/<resource>.ts`

- `get<Resource>List({ q, page, pageSize })`：供 Server Component 直接调用
- `get<Resource>ById(id)`
- 入口先做权限校验（`requireAdmin()` 或项目约定的等价函数）
- 从 `@/lib/db` 导入 Prisma 单例，禁止 `new PrismaClient()`
- 搜索使用 Prisma `contains`；SQLite 不支持 `mode: "insensitive"`
- 不返回密码等敏感字段

### 第 3 步：生成校验

文件：`src/validators/<resource>.ts`

- `create<Resource>Schema`
- `update<Resource>Schema`
- 金额一律用整数分（`*Cents`），不要用浮点
- 字符串 `trim`、长度、必填/可选与数据库约束一致

### 第 4 步：生成 Server Actions

文件：`src/server/actions/<resource>.ts`

- `create<Resource>`、`update<Resource>`、`delete<Resource>`
- 每个 Action 第一步做权限校验
- 入参先 `safeParse`，失败返回 `{ ok: false, fieldErrors }`
- 成功调用 `revalidatePath("<页面路由>")`，必要时 `redirect`
- 返回统一的 `ActionResult`
- 不信任客户端提交的 `id`、价格、状态等敏感字段

### 第 5 步：生成管理页面

- `src/app/admin/<resource>/page.tsx`：列表（RSC，`await searchParams`）
- `src/app/admin/<resource>/new/page.tsx`：新建
- `src/app/admin/<resource>/[id]/edit/page.tsx`：编辑（`await params`）
- 表单组件放 `src/components/admin/<resource>-form.tsx`，`"use client"` + `useActionState`
- 列表包含：字段表格、搜索框、分页、“新增/编辑/删除”按钮
- 删除使用带确认的客户端组件，或表单 + Server Action
- 使用 Tailwind CSS，UI 文案使用中文

### 第 6 步：验证

- 列出生成/修改的文件
- 模型有变更时提醒执行 `npx.cmd prisma generate` 与迁移
- 运行 `npm.cmd run typecheck`、`npm.cmd run lint`、`npm.cmd run build`
- 给出后台路径与测试步骤

## 注意事项

- 禁止生成 `src/app/api/**/route.ts`，除非用户明确要求 REST
- Next.js 16：`params` / `searchParams` / `cookies()` 必须 `await`
- 权限必须在每个 Action / Query 内校验，不能只靠页面或 `proxy.ts`
- 所有 UI 文案使用中文；注释使用中文，且只在必要时添加
- 金额用分；状态使用 `src/lib/constants.ts` 中的字符串常量
