# 中小企业声明函自动生成系统 - 技术设计

## 数据模型

### 1. 行业和企业类型标准数据

```typescript
// 行业类型枚举
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

// 企业类型枚举
type EnterpriseType = 'medium' | 'small' | 'micro'

// 行业划分标准
interface IndustryStandard {
  id: string
  industryType: IndustryType
  industryName: string
  criteria: {
    medium: Criterion
    small: Criterion
    micro: Criterion
  }
  requiredFields: ('employees' | 'revenue' | 'assets')[]
}

// 划分标准条件
interface Criterion {
  employees?: { min?: number; max?: number }
  revenue?: { min?: number; max?: number }
  assets?: { min?: number; max?: number }
  logic: 'AND' | 'OR' // AND表示所有条件都要满足，OR表示满足其中一个即可
}

// 企业类型计算结果
interface ClassificationResult {
  enterpriseType: EnterpriseType
  criteria: {
    employees?: { value: number; criterion: string }
    revenue?: { value: number; criterion: string }
    assets?: { value: number; criterion: string }
  }
  reasoning: string // 详细的划型依据说明
}
```

### 2. 数据库表设计

```typescript
// 声明函记录表
export const declarations = mysqlTable('declarations', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  projectName: varchar('projectName', { length: 255 }).notNull(),
  targetName: varchar('targetName', { length: 255 }).notNull(),
  industryType: varchar('industryType', { length: 64 }).notNull(),
  enterprises: json('enterprises').$type<EnterpriseInfo[]>().notNull(), // JSON 数组存储多个企业
  content: text('content').notNull(), // 生成的声明函内容
  wordDocUrl: varchar('wordDocUrl', { length: 512 }), // Word 文档 S3 URL
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
})

// 企业信息类型
interface EnterpriseInfo {
  name: string
  industry: string
  employees: number
  revenue: number // 万元
  assets: number // 万元
  enterpriseType: EnterpriseType
  classificationReasoning: string
}
```

## 企业类型计算逻辑

### 核心算法

```typescript
function classifyEnterprise(
  industryType: IndustryType,
  employees: number,
  revenue: number,
  assets: number
): ClassificationResult {
  const standard = getIndustryStandard(industryType)
  
  // 检查是否符合中型企业标准
  if (matchesCriterion(standard.criteria.medium, { employees, revenue, assets })) {
    return {
      enterpriseType: 'medium',
      criteria: buildCriteriaDetails(standard.criteria.medium, { employees, revenue, assets }),
      reasoning: generateReasoning('medium', standard, { employees, revenue, assets })
    }
  }
  
  // 检查是否符合小型企业标准
  if (matchesCriterion(standard.criteria.small, { employees, revenue, assets })) {
    return {
      enterpriseType: 'small',
      criteria: buildCriteriaDetails(standard.criteria.small, { employees, revenue, assets }),
      reasoning: generateReasoning('small', standard, { employees, revenue, assets })
    }
  }
  
  // 默认为微型企业
  return {
    enterpriseType: 'micro',
    criteria: buildCriteriaDetails(standard.criteria.micro, { employees, revenue, assets }),
    reasoning: generateReasoning('micro', standard, { employees, revenue, assets })
  }
}

function matchesCriterion(
  criterion: Criterion,
  values: { employees?: number; revenue?: number; assets?: number }
): boolean {
  const checks = []
  
  if (criterion.employees) {
    const check = (values.employees ?? 0) >= (criterion.employees.min ?? 0) &&
                  (values.employees ?? 0) < (criterion.employees.max ?? Infinity)
    checks.push(check)
  }
  
  if (criterion.revenue) {
    const check = (values.revenue ?? 0) >= (criterion.revenue.min ?? 0) &&
                  (values.revenue ?? 0) < (criterion.revenue.max ?? Infinity)
    checks.push(check)
  }
  
  if (criterion.assets) {
    const check = (values.assets ?? 0) >= (criterion.assets.min ?? 0) &&
                  (values.assets ?? 0) < (criterion.assets.max ?? Infinity)
    checks.push(check)
  }
  
  // 根据逻辑操作符判断
  if (criterion.logic === 'AND') {
    return checks.every(c => c)
  } else {
    return checks.some(c => c)
  }
}
```

## 前端架构

### 表单流程

1. **第一步**：输入项目基本信息
   - 项目名称
   - 标的名称

2. **第二步**：选择所属行业
   - 下拉选择器，包含 15+ 行业

3. **第三步**：动态表单（根据行业显示）
   - 企业名称（必填）
   - 所属行业（自动填充）
   - 从业人员（根据行业可能必填）
   - 营业收入（根据行业可能必填）
   - 资产总额（根据行业可能必填）
   - 支持添加多个企业

4. **第四步**：实时预览
   - 显示企业类型计算结果
   - 显示划型依据
   - 显示生成的声明函内容

5. **第五步**：导出
   - 生成并下载 Word 文档

### 状态管理

使用 React hooks + tRPC 进行状态管理：
- 表单数据状态
- 计算结果状态
- 加载状态
- 错误状态

## 后端架构

### tRPC 路由设计

```typescript
router({
  declaration: router({
    // 获取行业标准列表
    getIndustries: publicProcedure.query(),
    
    // 获取特定行业的划分标准
    getIndustryStandard: publicProcedure.input(z.object({
      industryType: z.string()
    })).query(),
    
    // 计算企业类型
    classifyEnterprise: publicProcedure.input(z.object({
      industryType: z.string(),
      employees: z.number(),
      revenue: z.number(),
      assets: z.number()
    })).query(),
    
    // 生成声明函
    generateDeclaration: protectedProcedure.input(z.object({
      projectName: z.string(),
      targetName: z.string(),
      industryType: z.string(),
      enterprises: z.array(z.object({
        name: z.string(),
        industry: z.string(),
        employees: z.number(),
        revenue: z.number(),
        assets: z.number()
      }))
    })).mutation(),
    
    // 生成 Word 文档
    generateWordDocument: protectedProcedure.input(z.object({
      declarationId: z.number()
    })).mutation(),
    
    // 获取历史记录
    listDeclarations: protectedProcedure.query(),
    
    // 获取单个声明函
    getDeclaration: protectedProcedure.input(z.object({
      id: z.number()
    })).query(),
    
    // 删除声明函
    deleteDeclaration: protectedProcedure.input(z.object({
      id: z.number()
    })).mutation()
  })
})
```

## Word 文档生成

使用 `docx` 库生成标准 Word 文档，包含：
- 标准的声明函格式
- 企业信息列表
- 签章位置
- 日期字段

## 视觉设计方向

- **配色**：优雅的蓝灰色系 + 深蓝色强调色
- **排版**：清晰的层级，充足的留白
- **交互**：流畅的过渡动画，清晰的反馈
- **组件**：使用 shadcn/ui 组件库，保持一致性
