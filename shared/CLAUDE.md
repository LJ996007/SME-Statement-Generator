# shared 模块文档

[根目录](../CLAUDE.md) > **shared**

> 最后更新：2026-01-07 22:21:18

---

## 变更记录 (Changelog)

| 日期 | 变更内容 | 作者 |
|------|---------|------|
| 2026-01-07 22:21:18 | 初始化 shared 模块文档 | AI 架构师 |

---

## 模块职责

`shared` 模块包含前后端共享的代码，包括类型定义、常量、行业标准数据和核心业务逻辑。这些代码在编译时分别被打包到前端和后端，确保两端使用完全相同的类型和逻辑。

---

## 入口与启动

shared 模块不是一个独立的应用，而是作为依赖被 `client` 和 `server` 引用。

### 引用方式

```typescript
// 在前端或后端中引用
import { IndustryType, classifyEnterprise } from '@shared/industry-standards'
import { COOKIE_NAME } from '@shared/const'
```

### TypeScript 路径别名

```json
{
  "@shared/*": ["./shared/*"]
}
```

---

## 对外接口

### 行业标准数据 (industry-standards.ts)

#### 类型定义

```typescript
// 行业类型（15 个行业）
type IndustryType =
  | 'manufacturing'        // 工业
  | 'construction'         // 建筑业
  | 'wholesale'           // 批发业
  | 'retail'              // 零售业
  | 'transportation'      // 交通运输业
  | 'warehousing'         // 仓储业
  | 'postal'              // 邮政业
  | 'accommodation'       // 住宿业
  | 'catering'            // 餐饮业
  | 'information'         // 信息传输业
  | 'software'            // 软件和信息技术服务业
  | 'real_estate'         // 房地产开发经营
  | 'property_management' // 物业管理
  | 'leasing_services'    // 租赁和商务服务业
  | 'other'               // 其他未列明行业

// 企业类型
type EnterpriseType = 'medium' | 'small' | 'micro'

// 划分标准
interface Criterion {
  employees?: { min?: number; max?: number }
  revenue?: { min?: number; max?: number }
  assets?: { min?: number; max?: number }
  logic: 'AND' | 'OR'
}

// 行业标准
interface IndustryStandard {
  id: IndustryType
  name: string
  criteria: {
    medium: Criterion
    small: Criterion
    micro: Criterion
  }
  requiredFields: ('employees' | 'revenue' | 'assets')[]
}

// 分类结果
interface ClassificationResult {
  enterpriseType: EnterpriseType
  criteria: {
    employees?: { value: number; criterion: string; passed: boolean }
    revenue?: { value: number; criterion: string; passed: boolean }
    assets?: { value: number; criterion: string; passed: boolean }
  }
  reasoning: string
}
```

#### 导出函数

```typescript
// 获取行业标准
function getIndustryStandard(industryType: IndustryType): IndustryStandard

// 获取所有行业列表
function getAllIndustries(): Array<{ id: IndustryType; name: string }>

// 分类企业
function classifyEnterprise(
  industryType: IndustryType,
  employees?: number,
  revenue?: number,
  assets?: number
): ClassificationResult
```

### 常量定义 (const.ts)

```typescript
export const COOKIE_NAME = "app_session_id"
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365
export const AXIOS_TIMEOUT_MS = 30_000
export const UNAUTHED_ERR_MSG = 'Please login (10001)'
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)'
```

### 类型定义 (types.ts)

项目中使用的其他共享类型定义。

### 错误处理 (_core/errors.ts)

共享的错误类型和错误处理函数。

---

## 核心功能

### 企业分类算法

```typescript
// 分类逻辑（从大到小检查）
1. 检查是否符合中型企业标准
   └─ 如果符合 → 返回 'medium'
2. 检查是否符合小型企业标准
   └─ 如果符合 → 返回 'small'
3. 默认返回微型企业
   └─ 返回 'micro'
```

### 标准匹配规则

```typescript
// AND 逻辑：所有条件都满足
if (criterion.logic === 'AND') {
  return checks.every(c => c)
}

// OR 逻辑：满足任一条件
if (criterion.logic === 'OR') {
  return checks.some(c => c)
}
```

### 行业标准数据

15 个行业的完整划分标准，每个行业包含：
- 中型企业标准
- 小型企业标准
- 微型企业标准
- 必填字段标识

示例（工业）：
```typescript
{
  id: 'manufacturing',
  name: '工业',
  criteria: {
    medium: {
      employees: { min: 300, max: 1000 },
      revenue: { min: 2000, max: 40000 },
      logic: 'AND'  // 同时满足
    },
    small: {
      employees: { min: 20, max: 300 },
      revenue: { min: 300, max: 2000 },
      logic: 'AND'
    },
    micro: {
      employees: { max: 20 },
      revenue: { max: 300 },
      logic: 'OR'  // 满足任一
    }
  },
  requiredFields: ['employees', 'revenue']
}
```

---

## 关键依赖

无外部依赖，纯 TypeScript 实现。

---

## 测试与质量

### 测试覆盖

企业分类逻辑在以下位置进行测试：
- `server/classification.test.ts` - 后端测试
- 前端实时计算验证

### 测试示例

```typescript
// 工业企业分类测试
classifyEnterprise('manufacturing', 500, 5000, 10000)
// 返回：{ enterpriseType: 'medium', ... }

classifyEnterprise('manufacturing', 100, 500, 1000)
// 返回：{ enterpriseType: 'small', ... }

classifyEnterprise('manufacturing', 10, 100, 200)
// 返回：{ enterpriseType: 'micro', ... }
```

---

## 常见问题 (FAQ)

### Q1: 如何添加新行业？

在 `industry-standards.ts` 的 `INDUSTRY_STANDARDS` 中添加：

```typescript
export const INDUSTRY_STANDARDS: Record<IndustryType, IndustryStandard> = {
  // ... 现有行业
  newIndustry: {
    id: 'newIndustry',
    name: '新行业名称',
    criteria: {
      medium: { /* 标准 */ },
      small: { /* 标准 */ },
      micro: { /* 标准 */ }
    },
    requiredFields: ['employees', 'revenue']
  }
}
```

### Q2: 如何修改划分标准？

直接修改对应行业的 `criteria` 对象。

### Q3: 为什么有些行业用 AND 逻辑，有些用 OR 逻辑？

- **AND 逻辑**：中型、小型企业通常需要同时满足多个条件
- **OR 逻辑**：微型企业通常只需满足任一条件即可

### Q4: 如何确保前后端使用相同的逻辑？

通过 `shared` 模块共享代码，TypeScript 编译时会分别打包到前后端，确保逻辑完全一致。

---

## 相关文件清单

```
shared/
├── const.ts                  # 共享常量
├── types.ts                  # 共享类型定义
├── industry-standards.ts     # 行业标准数据（核心）
└── _core/
    └── errors.ts             # 共享错误处理
```

---

## 技术亮点

1. **代码复用**：前后端共享相同的业务逻辑
2. **类型安全**：统一的类型定义，避免不一致
3. **数据驱动**：行业标准数据化，易于维护
4. **算法清晰**：明确的分类规则和依据生成
5. **标准合规**：完全符合工信部〔2011〕300号标准

---

## 行业标准数据完整性

### 已实现的 15 个行业

| 行业代码 | 行业名称 | 必填字段 |
|---------|---------|---------|
| `manufacturing` | 工业 | employees, revenue |
| `construction` | 建筑业 | revenue, assets |
| `wholesale` | 批发业 | employees, revenue |
| `retail` | 零售业 | employees, revenue |
| `transportation` | 交通运输业 | employees, revenue |
| `warehousing` | 仓储业 | employees, revenue |
| `postal` | 邮政业 | employees, revenue |
| `accommodation` | 住宿业 | employees, revenue |
| `catering` | 餐饮业 | employees, revenue |
| `information` | 信息传输业 | employees, revenue |
| `software` | 软件和信息技术服务业 | employees, revenue |
| `real_estate` | 房地产开发经营 | revenue, assets |
| `property_management` | 物业管理 | employees, revenue |
| `leasing_services` | 租赁和商务服务业 | employees, assets |
| `other` | 其他未列明行业 | employees |

---

## 待优化事项

1. **数据验证**
   - 添加行业标准的验证测试
   - 覆盖边界情况测试

2. **性能优化**
   - 考虑将标准数据预编译
   - 优化分类算法性能

3. **功能扩展**
   - 支持自定义行业标准
   - 导出标准数据为 JSON

---

*本文档由 AI 架构师自动生成。*
