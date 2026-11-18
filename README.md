# Mini Mall

微型电商全栈演示项目，覆盖注册登录、商品浏览、购物车、下单与模拟支付、订单管理，以及后台商品 / 分类 / 订单管理。

> 项目仅用于学习与演示，支付为模拟流程，不接入真实支付渠道。

## 技术栈

| 层 | 技术 | 版本 |
|---|---|---|
| 框架 | Next.js（App Router + Turbopack） | 16.4.6 |
| UI | React / React DOM | 19.3.0 |
| 语言 | TypeScript | 5.9.3 |
| ORM | Prisma / @prisma/client | 5.22.0 |
| 数据库 | SQLite | 文件型 |
| 样式 | Tailwind CSS | 4.3.5 |
| 校验 | Zod | 4.6.7 |
| 密码 | bcryptjs | 3.0.3 |
| 会话 | jose（JWT） | 6.2.17 |

完整依赖与安装记录见 [`DEPENDENCIES.md`](./DEPENDENCIES.md)。

## 环境要求

- Node.js **>= 20.9**（推荐 22 / 24 LTS）
- npm
- Git

Windows PowerShell 下 `npm.ps1` 可能被执行策略拦截，请统一使用 `npm.cmd` / `npx.cmd`。

## 快速开始

```powershell
git clone <仓库地址>
cd mini-mall

npm.cmd install
Copy-Item .env.example .env

# 生成 AUTH_SECRET，把输出填入 .env
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"

npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run dev
```

打开 <http://localhost:3000>。

非 Windows 环境可使用 `npm` / `cp`：

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

### 环境变量

| 变量 | 必填 | 说明 |
|---|---|---|
| `DATABASE_URL` | 是 | SQLite 路径，默认 `file:./dev.db` |
| `AUTH_SECRET` | 是 | JWT 签名密钥，至少 32 字节；不要使用示例值 |
| `COOKIE_SECURE` | 否 | 设为 `true` 时强制 Secure Cookie；生产环境默认开启 |
| `SEED_ADMIN_EMAIL` | 否 | 种子管理员邮箱，默认 `admin@mini.mall` |
| `SEED_ADMIN_PASSWORD` | 否 | 首次创建管理员时的密码；非开发环境必须显式设置 |
| `SEED_ADMIN_RESET_PASSWORD` | 否 | 设为 `true` 时用 `SEED_ADMIN_PASSWORD` 重置已有管理员密码 |

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | `prisma generate` + 生产构建 |
| `npm run start` | 启动生产构建 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript 类型检查 |
| `npm run db:migrate` | 开发环境迁移 |
| `npm run db:seed` | 写入分类、商品与管理员 |
| `npm run db:studio` | Prisma Studio |
| `npm run db:reset` | 重置数据库并重新 seed（会清空数据） |

## 管理员账号

首次执行 seed 且未设置 `SEED_ADMIN_PASSWORD` 时，默认创建：

- 邮箱：`admin@mini.mall`
- 密码：`Admin123456`

登录后访问 `/admin`。**请尽快修改默认密码**；非开发环境必须通过环境变量提供密码，seed 不允许使用默认值。生产环境会拒绝执行 seed。

## 主要功能

- 用户注册 / 登录 / 退出，httpOnly JWT 会话
- 商品列表、搜索、分类筛选、分页、详情
- 购物车增删改、库存校验
- 下单、库存扣减、模拟支付、订单列表 / 详情 / 取消
- 心悦会员字段已预留，折扣逻辑待接入
- 后台：商品 CRUD、分类 CRUD、订单列表与状态流转
- 18 张本地 SVG 商品插画，无需外网

## 目录结构

```text
prisma/                 schema、迁移、seed
public/images/products/ 商品插画
src/app/                页面与 API Route
src/components/         页面组件
src/lib/                auth、db、constants、money 等
src/server/queries/     读查询
src/server/services/    写业务逻辑
src/validators/         Zod Schema
```

## 主要 API

| 路径 | 说明 |
|---|---|
| `GET /api/products` | 商品列表（search / category / page） |
| `GET /api/products/[id]` | 商品详情 |
| `GET /api/categories` | 分类及商品数 |
| `POST /api/auth/register` / `login` / `logout` | 认证 |
| `GET /api/auth/me` | 当前用户 |
| `GET/POST /api/cart`、`PUT/DELETE /api/cart/[id]` | 购物车 |
| `GET/POST /api/orders`、`GET/PUT /api/orders/[id]` | 订单与模拟支付 |
| `POST /api/orders/[id]/cancel` | 取消订单 |
| `/api/admin/**` | 后台商品 / 分类 / 订单接口（需 ADMIN） |

## 说明

- `prisma/dev.db` 与 `.env` 已被 `.gitignore` 忽略；迁移文件需要提交。
- 生产部署请使用 `prisma migrate deploy`，并通过 HTTPS 提供站点。
- 本项目不使用外部图片服务，商品图为仓库内的本地 SVG。
