# server 模块文档

[根目录](../CLAUDE.md) > **server**

> 最后更新：2026-01-07 22:21:18

---

## 变更记录 (Changelog)

| 日期 | 变更内容 | 作者 |
|------|---------|------|
| 2026-01-07 22:21:18 | 初始化 server 模块文档 | AI 架构师 |

---

## 模块职责

`server` 模块是项目的后端服务，负责提供 API 接口、处理业务逻辑、管理数据库访问、生成 Word 文档，以及处理用户认证。

---

## 入口与启动

### 主入口文件

**`_core/index.ts`** - 服务器启动入口

```typescript
// 启动流程
1. 创建 Express 应用
2. 配置 body parser (支持 50MB 文件上传)
3. 注册 OAuth 路由 (/api/oauth/callback)
4. 注册 tRPC 路由 (/api/trpc)
5. 开发模式：启动 Vite 开发服务器
6. 生产模式：提供静态文件服务
7. 查找可用端口 (3000-3020)
8. 启动 HTTP 服务器
```

### 启动命令

```bash
# 开发模式（热重载）
pnpm dev

# 生产模式
pnpm build && pnpm start
```

---

## 对外接口

### tRPC 路由 (routers.ts)

#### 认证路由 (auth)

```typescript
auth.me              // 获取当前登录用户
auth.logout          // 用户登出
```

#### 声明函路由 (declaration)

```typescript
declaration.getIndustries          // 获取所有行业列表
declaration.getIndustryStandard    // 获取特定行业标准
declaration.classifyEnterprise     // 计算企业类型
declaration.saveDeclaration        // 保存声明函（需认证）
declaration.listDeclarations       // 获取历史记录（需认证）
declaration.getDeclaration         // 获取单个声明函（需认证）
declaration.deleteDeclaration      // 删除声明函（需认证）
```

#### Word 导出路由 (wordExport)

```typescript
wordExport.generate    // 生成 Word 文档
```

#### 系统路由 (system)

```typescript
system.*              // 系统级操作
```

### OAuth 回调

```
GET /api/oauth/callback    // Manus OAuth 回调端点
```

---

## 关键依赖与配置

### 核心依赖

```json
{
  "express": "^4.21.2",
  "@trpc/server": "^11.6.0",
  "drizzle-orm": "^0.44.5",
  "mysql2": "^3.15.0",
  "cookie": "^1.0.2",
  "jose": "6.1.0",
  "docx": "^9.5.1",
  "@aws-sdk/client-s3": "^3.693.0"
}
```

### 环境变量

| 变量名 | 说明 | 必需 |
|--------|------|------|
| `DATABASE_URL` | MySQL 数据库连接字符串 | 是 |
| `PORT` | 服务器端口（默认 3000） | 否 |
| `NODE_ENV` | 运行环境（development/production） | 否 |
| `MANUS_OAUTH_*` | Manus OAuth 配置 | 是 |

---

## 数据模型

### 用户表 (users)

```typescript
{
  id: number              // 主键
  openId: string          // Manus OAuth ID
  name: string            // 用户名
  email: string           // 邮箱
  loginMethod: string     // 登录方式
  role: 'user' | 'admin'  // 角色
  createdAt: Date         // 创建时间
  updatedAt: Date         // 更新时间
  lastSignedIn: Date      // 最后登录时间
}
```

### 声明函表 (declarations)

```typescript
{
  id: number                        // 主键
  userId: number                    // 用户 ID
  projectName: string               // 项目名称
  targetName: string                // 标的名称
  industryType: string              // 行业类型
  declarationType: 'goods' | 'construction' | 'service'  // 声明函类型
  enterprises: string               // 企业信息 JSON
  content: string                   // 声明函内容
  wordDocUrl: string                // Word 文档 URL
  createdAt: Date                   // 创建时间
  updatedAt: Date                   // 更新时间
}
```

---

## 核心功能

### 数据库操作 (db.ts)

| 函数 | 功能 |
|------|------|
| `getDb()` | 获取数据库实例 |
| `upsertUser()` | 创建或更新用户 |
| `getUserByOpenId()` | 根据 openId 获取用户 |
| `createDeclaration()` | 创建声明函记录 |
| `getDeclarationById()` | 根据 ID 获取声明函 |
| `getUserDeclarations()` | 获取用户的所有声明函 |
| `deleteDeclaration()` | 删除声明函 |
| `updateDeclarationWordUrl()` | 更新 Word 文档 URL |

### Word 文档生成 (word-generator.ts)

```typescript
// 生成声明函 Word 文档
async function generateDeclarationWord(
  projectName: string,
  targetName: string,
  industryType: string,
  enterprises: EnterpriseInfo[]
): Promise<Buffer>
```

生成的 Word 文档包含：
- 标题："中小企业声明函"
- 正文：项目信息和标准声明
- 企业列表：详细企业信息
- 声明条款：法律效力声明
- 签章位置：企业盖章和日期

### 认证与授权

**OAuth 流程** (`_core/oauth.ts`)：
1. 用户点击登录
2. 重定向到 Manus OAuth
3. 用户授权后回调
4. 创建或更新用户记录
5. 设置会话 Cookie

**会话管理** (`_core/cookies.ts`)：
- Cookie 名称：`app_session_id`
- 有效期：1 年
- 安全配置：httpOnly, secure, sameSite

**权限控制** (`_core/trpc.ts`)：
- `publicProcedure` - 公开接口
- `protectedProcedure` - 需要认证

---

## 核心模块

### _core 目录

| 文件 | 功能 |
|------|------|
| `index.ts` | 服务器启动入口 |
| `context.ts` | tRPC 上下文创建 |
| `trpc.ts` | tRPC 路由配置 |
| `env.ts` | 环境变量管理 |
| `cookies.ts` | Cookie 管理 |
| `oauth.ts` | OAuth 认证流程 |
| `systemRouter.ts` | 系统路由 |
| `vite.ts` | Vite 开发服务器集成 |

### 其他核心文件

| 文件 | 功能 |
|------|------|
| `routers.ts` | tRPC 路由聚合 |
| `db.ts` | 数据库操作 |
| `word-generator.ts` | Word 文档生成 |
| `word-export-router.ts` | Word 导出路由 |

---

## 测试与质量

### 测试文件

| 文件 | 测试内容 |
|------|---------|
| `auth.logout.test.ts` | 登出流程测试 |
| `classification.test.ts` | 企业分类测试 |

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test classification.test.ts

# 监听模式
pnpm test --watch
```

---

## 常见问题 (FAQ)

### Q1: 如何添加新的 API 路由？

在 `routers.ts` 中添加：

```typescript
export const appRouter = router({
  // 新路由
  newRoute: router({
    action: publicProcedure
      .input(z.object({ ... }))
      .query(async ({ input }) => {
        // 业务逻辑
      })
  })
})
```

### Q2: 如何修改数据库表结构？

1. 编辑 `drizzle/schema.ts`
2. 运行 `pnpm db:push` 生成迁移
3. 更新 `db.ts` 中的操作函数

### Q3: 如何添加认证保护？

使用 `protectedProcedure` 替代 `publicProcedure`：

```typescript
protectedProcedure
  .input(z.object({ ... }))
  .mutation(async ({ ctx, input }) => {
    // ctx.user 可用
  })
```

### Q4: Word 文档如何自定义格式？

编辑 `word-generator.ts` 中的 `Document` 配置：

```typescript
const doc = new Document({
  sections: [{
    children: [
      // 自定义段落和格式
    ]
  }]
})
```

---

## 相关文件清单

```
server/
├── _core/                      # 核心功能模块
│   ├── index.ts                # 服务器启动入口
│   ├── context.ts              # tRPC 上下文
│   ├── trpc.ts                 # tRPC 配置
│   ├── env.ts                  # 环境变量
│   ├── cookies.ts              # Cookie 管理
│   ├── oauth.ts                # OAuth 认证
│   ├── systemRouter.ts         # 系统路由
│   ├── vite.ts                 # Vite 集成
│   ├── llm.ts                  # LLM 服务
│   ├── imageGeneration.ts      # 图片生成
│   ├── map.ts                  # 地图服务
│   ├── notification.ts         # 通知服务
│   ├── voiceTranscription.ts   # 语音转录
│   ├── sdk.ts                  # SDK 配置
│   ├── dataApi.ts              # 数据 API
│   └── types/                  # 类型定义
│       ├── cookie.d.ts
│       └── manusTypes.ts
├── routers.ts                  # tRPC 路由定义
├── db.ts                       # 数据库操作
├── word-generator.ts           # Word 文档生成
├── word-export-router.ts       # Word 导出路由
├── declaration-generator.ts    # 声明函生成器
├── declaration.ts              # 声明函工具
├── storage.ts                  # 存储服务
├── auth.logout.test.ts         # 登出测试
└── classification.test.ts      # 分类测试
```

---

## 技术亮点

1. **类型安全**：tRPC 端到端类型安全
2. **模块化设计**：清晰的目录结构
3. **OAuth 集成**：完整的认证流程
4. **文档生成**：自动生成 Word 文档
5. **错误处理**：统一的错误处理机制
6. **开发体验**：热重载支持

---

## 待优化事项

1. **性能优化**
   - 数据库连接池优化
   - 查询结果缓存
   - API 响应压缩

2. **安全加固**
   - 请求频率限制
   - 输入验证增强
   - SQL 注入防护

3. **功能扩展**
   - 批量导出
   - 模板管理
   - 权限细化

---

*本文档由 AI 架构师自动生成。*
