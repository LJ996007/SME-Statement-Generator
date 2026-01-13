# client 模块文档

[根目录](../CLAUDE.md) > **client**

> 最后更新：2026-01-07 22:21:18

---

## 变更记录 (Changelog)

| 日期 | 变更内容 | 作者 |
|------|---------|------|
| 2026-01-07 22:21:18 | 初始化 client 模块文档 | AI 架构师 |

---

## 模块职责

`client` 模块是项目的前端应用，负责提供用户界面、处理用户交互、调用后端 API，并实时展示声明函的生成结果。

---

## 入口与启动

### 主入口文件

- **`src/main.tsx`** - 应用启动入口
  - 创建 tRPC 客户端
  - 配置 React Query
  - 设置未授权重定向逻辑
  - 渲染根组件

- **`src/App.tsx`** - 根组件
  - 配置路由 (使用 wouter)
  - 配置主题提供者
  - 配置错误边界

### 路由配置

```typescript
// 路由定义
/                      -> Home (首页)
/generator             -> DeclarationGenerator (声明函生成器)
/404                   -> NotFound (404 页面)
```

---

## 对外接口

### 页面组件

| 组件 | 路径 | 职责 |
|------|------|------|
| `Home` | `src/pages/Home.tsx` | 首页，展示项目介绍和入口 |
| `DeclarationGenerator` | `src/pages/DeclarationGenerator.tsx` | 声明函生成主页面 |
| `NotFound` | `src/pages/NotFound.tsx` | 404 页面 |
| `ComponentShowcase` | `src/pages/ComponentShowcase.tsx` | UI 组件展示 |

### 核心组件

| 组件 | 路径 | 职责 |
|------|------|------|
| `DashboardLayout` | `src/components/DashboardLayout.tsx` | 仪表盘布局 |
| `AIChatBox` | `src/components/AIChatBox.tsx` | AI 聊天框 |
| `ManusDialog` | `src/components/ManusDialog.tsx` | Manus 对话框 |
| `Map` | `src/components/Map.tsx` | 地图组件 |
| `ErrorBoundary` | `src/components/ErrorBoundary.tsx` | 错误边界 |

### UI 组件库

位于 `src/components/ui/`，基于 shadcn/ui 构建，包含：

- 表单组件：`Input`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Textarea`
- 布局组件：`Card`, `Separator`, `Accordion`, `Tabs`, `Collapsible`
- 反馈组件：`Alert`, `Dialog`, `Popover`, `Sheet`, `Sonner` (toast)
- 导航组件：`Breadcrumb`, `NavigationMenu`, `Menubar`, `Pagination`
- 数据展示：`Table`, `Badge`, `Avatar`, `Progress`, `Skeleton`
- 其他：`Button`, `Label`, `Calendar`, `Chart`, `Carousel`

---

## 关键依赖与配置

### 核心依赖

```json
{
  "react": "^19.2.1",
  "react-dom": "^19.2.1",
  "@tanstack/react-query": "^5.90.2",
  "@trpc/client": "^11.6.0",
  "@trpc/react-query": "^11.6.0",
  "wouter": "^3.3.5",
  "react-hook-form": "^7.64.0",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.1.12",
  "framer-motion": "^12.23.22"
}
```

### UI 依赖

```json
{
  "@radix-ui/*": "各种 Radix UI 组件",
  "tailwindcss": "^4.1.14",
  "lucide-react": "^0.453.0",
  "sonner": "^2.0.7",
  "class-variance-authority": "^0.7.1",
  "tailwind-merge": "^3.3.1"
}
```

### 路径别名

```typescript
{
  "@/*": ["./client/src/*"],
  "@shared/*": ["./shared/*"]
}
```

---

## 数据模型

### tRPC API 调用

```typescript
// 声明函相关 API
trpc.declaration.getIndustries.useQuery()           // 获取所有行业
trpc.declaration.getIndustryStandard.useQuery()      // 获取行业标准
trpc.declaration.classifyEnterprise.useQuery()       // 分类企业
trpc.declaration.saveDeclaration.useMutation()       // 保存声明函
trpc.declaration.listDeclarations.useQuery()         // 获取历史记录
trpc.declaration.getDeclaration.useQuery()           // 获取单个声明函
trpc.declaration.deleteDeclaration.useMutation()     // 删除声明函

// 认证相关 API
trpc.auth.me.useQuery()                              // 获取当前用户
trpc.auth.logout.useMutation()                       // 登出
```

### 表单数据结构

```typescript
// 企业信息
interface FormEnterprise {
  name: string                    // 企业名称
  industry: string                // 所属行业
  employees: number | ''          // 从业人员
  revenue: number | ''            // 营业收入（万元）
  assets: number | ''             // 资产总额（万元）
  enterpriseType?: EnterpriseType // 企业类型
  classificationReasoning?: string // 分类依据
}

// 分类结果
interface ClassificationState {
  enterpriseType?: EnterpriseType
  criteria?: Record<string, any>
  reasoning?: string
}
```

---

## 核心功能

### 声明函生成器 (DeclarationGenerator)

主要功能流程：

1. **填写项目基本信息**
   - 项目名称
   - 标的名称
   - 声明函类型（货物/工程/服务）

2. **选择所属行业**
   - 从 15 个行业标准中选择
   - 显示该行业的划分标准

3. **填写企业信息**
   - 支持添加多个企业
   - 实时计算企业类型
   - 显示分类依据

4. **生成和预览**
   - 实时生成声明函内容
   - HTML 格式预览
   - 支持保存到数据库

5. **导出 Word**
   - 生成标准格式 Word 文档
   - 支持下载

### 工具函数

| 文件 | 功能 |
|------|------|
| `lib/declaration-content.ts` | 生成声明函文本内容 |
| `lib/declaration-formatter.ts` | 格式化声明函为 HTML |
| `lib/utils.ts` | 通用工具函数 |
| `lib/trpc.ts` | tRPC 客户端配置 |

### 自定义 Hooks

| Hook | 功能 |
|------|------|
| `hooks/useComposition.ts` | 组合式 API |
| `hooks/useMobile.tsx` | 移动端检测 |
| `hooks/usePersistFn.ts` | 持久化函数引用 |
| `_core/hooks/useAuth.ts` | 认证状态管理 |

---

## 测试与质量

### 测试文件

| 文件 | 测试内容 |
|------|---------|
| `src/lib/declaration-content.test.ts` | 声明函内容生成逻辑 |
| `src/lib/declaration-formatter.test.ts` | 声明函格式化逻辑 |

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定测试文件
pnpm test declaration-content.test.ts
```

---

## 常见问题 (FAQ)

### Q1: 如何添加新的 UI 组件？

使用 shadcn/ui CLI：

```bash
npx shadcn-ui@latest add [component-name]
```

### Q2: 如何修改主题颜色？

编辑 `src/index.css` 中的 CSS 变量：

```css
:root {
  --background: ...;
  --foreground: ...;
  --primary: ...;
  /* ... */
}
```

### Q3: 如何添加新的路由？

在 `App.tsx` 的 `Router` 组件中添加：

```typescript
<Route path="/new-route" component={NewComponent} />
```

### Q4: tRPC 调用失败如何处理？

tRPC 客户端已配置全局错误处理：

- 未授权错误：自动重定向到登录页
- 其他错误：在控制台输出错误日志

---

## 相关文件清单

### 核心文件

```
client/
├── index.html              # HTML 入口
├── src/
│   ├── main.tsx            # 应用启动入口
│   ├── App.tsx             # 根组件
│   ├── index.css           # 全局样式
│   ├── const.ts            # 常量定义
│   ├── components/         # 组件目录
│   │   ├── ui/             # UI 组件库（50+ 组件）
│   │   ├── DashboardLayout.tsx
│   │   ├── AIChatBox.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   ├── pages/              # 页面组件
│   │   ├── Home.tsx
│   │   ├── DeclarationGenerator.tsx
│   │   └── NotFound.tsx
│   ├── lib/                # 工具库
│   │   ├── trpc.ts
│   │   ├── declaration-content.ts
│   │   ├── declaration-formatter.ts
│   │   └── utils.ts
│   ├── hooks/              # 自定义 Hooks
│   ├── contexts/           # React Context
│   └── _core/              # 核心功能
└── public/                 # 静态资源
    └── .gitkeep
```

---

## 技术亮点

1. **类型安全**：端到端类型安全，tRPC 自动生成类型
2. **现代化 UI**：shadcn/ui + Tailwind CSS 4.x
3. **响应式设计**：移动端和桌面端自适应
4. **实时计算**：企业类型实时计算和显示
5. **错误处理**：全局错误边界和错误处理

---

## 待优化事项

1. **性能优化**
   - 代码分割和懒加载
   - 减少初始包大小
   - 优化大列表渲染

2. **用户体验**
   - 添加加载骨架屏
   - 优化表单验证提示
   - 添加操作引导

3. **测试覆盖**
   - 增加组件单元测试
   - 添加 E2E 测试

---

*本文档由 AI 架构师自动生成。*
