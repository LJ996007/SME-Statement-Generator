/**
 * 中小企业划型标准规定（工信部联企业〔2011〕300号）
 * 行业分类和划分标准数据
 */

export type IndustryType =
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

export type EnterpriseType = 'large' | 'medium' | 'small' | 'micro'

export interface Criterion {
  employees?: { min?: number; max?: number }
  revenue?: { min?: number; max?: number }
  assets?: { min?: number; max?: number }
  logic: 'AND' | 'OR'
}

export interface IndustryStandard {
  id: IndustryType
  name: string
  criteria: {
    medium: Criterion
    small: Criterion
    micro: Criterion
  }
  requiredFields: ('employees' | 'revenue' | 'assets')[]
}

export interface ClassificationResult {
  enterpriseType: EnterpriseType
  criteria: {
    employees?: { value: number; criterion: string; passed: boolean }
    revenue?: { value: number; criterion: string; passed: boolean }
    assets?: { value: number; criterion: string; passed: boolean }
  }
  reasoning: string
}

/**
 * 行业标准数据库
 */
export const INDUSTRY_STANDARDS: Record<IndustryType, IndustryStandard> = {
  manufacturing: {
    id: 'manufacturing',
    name: '工业',
    criteria: {
      medium: {
        employees: { min: 300, max: 1000 },
        revenue: { min: 2000, max: 40000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 20, max: 300 },
        revenue: { min: 300, max: 2000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 20 },
        revenue: { max: 300 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  construction: {
    id: 'construction',
    name: '建筑业',
    criteria: {
      medium: {
        revenue: { min: 6000, max: 80000 },
        assets: { min: 5000, max: 80000 },
        logic: 'AND'
      },
      small: {
        revenue: { min: 300, max: 6000 },
        assets: { min: 300, max: 5000 },
        logic: 'AND'
      },
      micro: {
        revenue: { max: 300 },
        assets: { max: 300 },
        logic: 'OR'
      }
    },
    requiredFields: ['revenue', 'assets']
  },
  wholesale: {
    id: 'wholesale',
    name: '批发业',
    criteria: {
      medium: {
        employees: { min: 20, max: 200 },
        revenue: { min: 5000, max: 40000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 5, max: 20 },
        revenue: { min: 1000, max: 5000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 5 },
        revenue: { max: 1000 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  retail: {
    id: 'retail',
    name: '零售业',
    criteria: {
      medium: {
        employees: { min: 50, max: 300 },
        revenue: { min: 500, max: 20000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 10, max: 50 },
        revenue: { min: 100, max: 500 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 10 },
        revenue: { max: 100 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  transportation: {
    id: 'transportation',
    name: '交通运输业',
    criteria: {
      medium: {
        employees: { min: 300, max: 1000 },
        revenue: { min: 3000, max: 30000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 20, max: 300 },
        revenue: { min: 200, max: 3000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 20 },
        revenue: { max: 200 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  warehousing: {
    id: 'warehousing',
    name: '仓储业',
    criteria: {
      medium: {
        employees: { min: 100, max: 200 },
        revenue: { min: 1000, max: 30000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 20, max: 100 },
        revenue: { min: 100, max: 1000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 20 },
        revenue: { max: 100 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  postal: {
    id: 'postal',
    name: '邮政业',
    criteria: {
      medium: {
        employees: { min: 300, max: 1000 },
        revenue: { min: 2000, max: 30000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 20, max: 300 },
        revenue: { min: 100, max: 2000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 20 },
        revenue: { max: 100 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  accommodation: {
    id: 'accommodation',
    name: '住宿业',
    criteria: {
      medium: {
        employees: { min: 100, max: 300 },
        revenue: { min: 2000, max: 10000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 10, max: 100 },
        revenue: { min: 100, max: 2000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 10 },
        revenue: { max: 100 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  catering: {
    id: 'catering',
    name: '餐饮业',
    criteria: {
      medium: {
        employees: { min: 100, max: 300 },
        revenue: { min: 2000, max: 10000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 10, max: 100 },
        revenue: { min: 100, max: 2000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 10 },
        revenue: { max: 100 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  information: {
    id: 'information',
    name: '信息传输业',
    criteria: {
      medium: {
        employees: { min: 100, max: 2000 },
        revenue: { min: 1000, max: 100000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 10, max: 100 },
        revenue: { min: 100, max: 1000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 10 },
        revenue: { max: 100 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  software: {
    id: 'software',
    name: '软件和信息技术服务业',
    criteria: {
      medium: {
        employees: { min: 100, max: 300 },
        revenue: { min: 1000, max: 10000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 10, max: 100 },
        revenue: { min: 50, max: 1000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 10 },
        revenue: { max: 50 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  real_estate: {
    id: 'real_estate',
    name: '房地产开发经营',
    criteria: {
      medium: {
        revenue: { min: 1000, max: 200000 },
        assets: { min: 5000, max: 10000 },
        logic: 'AND'
      },
      small: {
        revenue: { min: 100, max: 1000 },
        assets: { min: 2000, max: 5000 },
        logic: 'AND'
      },
      micro: {
        revenue: { max: 100 },
        assets: { max: 2000 },
        logic: 'OR'
      }
    },
    requiredFields: ['revenue', 'assets']
  },
  property_management: {
    id: 'property_management',
    name: '物业管理',
    criteria: {
      medium: {
        employees: { min: 300, max: 1000 },
        revenue: { min: 1000, max: 5000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 100, max: 300 },
        revenue: { min: 500, max: 1000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 100 },
        revenue: { max: 500 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'revenue']
  },
  leasing_services: {
    id: 'leasing_services',
    name: '租赁和商务服务业',
    criteria: {
      medium: {
        employees: { min: 100, max: 300 },
        assets: { min: 8000, max: 120000 },
        logic: 'AND'
      },
      small: {
        employees: { min: 10, max: 100 },
        assets: { min: 100, max: 8000 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 10 },
        assets: { max: 100 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees', 'assets']
  },
  other: {
    id: 'other',
    name: '其他未列明行业',
    criteria: {
      medium: {
        employees: { min: 100, max: 300 },
        logic: 'AND'
      },
      small: {
        employees: { min: 10, max: 100 },
        logic: 'AND'
      },
      micro: {
        employees: { max: 10 },
        logic: 'OR'
      }
    },
    requiredFields: ['employees']
  }
}

/**
 * 获取行业标准
 */
export function getIndustryStandard(industryType: IndustryType): IndustryStandard {
  return INDUSTRY_STANDARDS[industryType]
}

/**
 * 获取所有行业列表
 */
export function getAllIndustries(): Array<{ id: IndustryType; name: string }> {
  return Object.values(INDUSTRY_STANDARDS).map(s => ({ id: s.id, name: s.name }))
}

/**
 * 检查是否符合标准
 */
function matchesCriterion(
  criterion: Criterion,
  values: { employees?: number; revenue?: number; assets?: number }
): boolean {
  const checks: boolean[] = []

  if (criterion.employees !== undefined) {
    const emp = values.employees ?? 0
    const check =
      (criterion.employees.min === undefined || emp >= criterion.employees.min) &&
      (criterion.employees.max === undefined || emp < criterion.employees.max)
    checks.push(check)
  }

  if (criterion.revenue !== undefined) {
    const rev = values.revenue ?? 0
    const check =
      (criterion.revenue.min === undefined || rev >= criterion.revenue.min) &&
      (criterion.revenue.max === undefined || rev < criterion.revenue.max)
    checks.push(check)
  }

  if (criterion.assets !== undefined) {
    const ast = values.assets ?? 0
    const check =
      (criterion.assets.min === undefined || ast >= criterion.assets.min) &&
      (criterion.assets.max === undefined || ast < criterion.assets.max)
    checks.push(check)
  }

  if (checks.length === 0) return false

  if (criterion.logic === 'AND') {
    return checks.every(c => c)
  } else {
    return checks.some(c => c)
  }
}

/**
 * 构建标准详情
 */
function buildCriteriaDetails(
  criterion: Criterion,
  values: { employees?: number; revenue?: number; assets?: number }
): ClassificationResult['criteria'] {
  const result: ClassificationResult['criteria'] = {}

  if (criterion.employees !== undefined) {
    const emp = values.employees ?? 0
    const min = criterion.employees.min ?? 0
    const max = criterion.employees.max ?? Infinity
    result.employees = {
      value: emp,
      criterion: `${min}${max === Infinity ? '及以上' : `至${max}`}人`,
      passed: emp >= min && emp < max
    }
  }

  if (criterion.revenue !== undefined) {
    const rev = values.revenue ?? 0
    const min = criterion.revenue.min ?? 0
    const max = criterion.revenue.max ?? Infinity
    result.revenue = {
      value: rev,
      criterion: `${min}${max === Infinity ? '及以上' : `至${max}`}万元`,
      passed: rev >= min && rev < max
    }
  }

  if (criterion.assets !== undefined) {
    const ast = values.assets ?? 0
    const min = criterion.assets.min ?? 0
    const max = criterion.assets.max ?? Infinity
    result.assets = {
      value: ast,
      criterion: `${min}${max === Infinity ? '及以上' : `至${max}`}万元`,
      passed: ast >= min && ast < max
    }
  }

  return result
}

/**
 * 构建大型企业标准详情
 * 大型企业标准：超过中型企业上限
 */
function buildLargeEnterpriseCriteriaDetails(
  mediumCriterion: Criterion,
  values: { employees?: number; revenue?: number; assets?: number }
): ClassificationResult['criteria'] {
  const result: ClassificationResult['criteria'] = {}

  if (mediumCriterion.employees !== undefined && mediumCriterion.employees.max !== undefined) {
    const emp = values.employees ?? 0
    const max = mediumCriterion.employees.max
    result.employees = {
      value: emp,
      criterion: `超过${max}人`,
      passed: emp >= max
    }
  }

  if (mediumCriterion.revenue !== undefined && mediumCriterion.revenue.max !== undefined) {
    const rev = values.revenue ?? 0
    const max = mediumCriterion.revenue.max
    result.revenue = {
      value: rev,
      criterion: `超过${max}万元`,
      passed: rev >= max
    }
  }

  if (mediumCriterion.assets !== undefined && mediumCriterion.assets.max !== undefined) {
    const ast = values.assets ?? 0
    const max = mediumCriterion.assets.max
    result.assets = {
      value: ast,
      criterion: `超过${max}万元`,
      passed: ast >= max
    }
  }

  return result
}

/**
 * 生成划型依据说明
 */
function generateReasoning(
  enterpriseType: EnterpriseType,
  standard: IndustryStandard,
  values: { employees?: number; revenue?: number; assets?: number }
): string {
  const typeNames: Record<EnterpriseType, string> = {
    large: '大型企业',
    medium: '中型企业',
    small: '小型企业',
    micro: '微型企业'
  }

  // 大型企业的特殊处理
  if (enterpriseType === 'large') {
    const parts: string[] = []
    const mediumCriterion = standard.criteria.medium

    if (mediumCriterion.employees !== undefined && mediumCriterion.employees.max !== undefined) {
      const emp = values.employees ?? 0
      if (emp >= mediumCriterion.employees.max) {
        parts.push(`从业人员${emp}人（超过中型企业标准${mediumCriterion.employees.max}人）`)
      }
    }

    if (mediumCriterion.revenue !== undefined && mediumCriterion.revenue.max !== undefined) {
      const rev = values.revenue ?? 0
      if (rev >= mediumCriterion.revenue.max) {
        parts.push(`营业收入${rev}万元（超过中型企业标准${mediumCriterion.revenue.max}万元）`)
      }
    }

    if (mediumCriterion.assets !== undefined && mediumCriterion.assets.max !== undefined) {
      const ast = values.assets ?? 0
      if (ast >= mediumCriterion.assets.max) {
        parts.push(`资产总额${ast}万元（超过中型企业标准${mediumCriterion.assets.max}万元）`)
      }
    }

    if (parts.length === 0) {
      return `根据工信部联企业〔2011〕300号标准，该企业属于大型企业，超过中型企业标准上限`
    }

    return `根据工信部联企业〔2011〕300号标准，该企业属于大型企业，${parts.join('；')}，超过中型企业标准上限`
  }

  // 中小微企业标准说明
  const criterion = standard.criteria[enterpriseType]
  const parts: string[] = []

  if (criterion.employees !== undefined) {
    const emp = values.employees ?? 0
    const min = criterion.employees.min ?? 0
    const max = criterion.employees.max ?? Infinity
    parts.push(`从业人员${emp}人（标准：${min}${max === Infinity ? '及以上' : `至${max}`}人）`)
  }

  if (criterion.revenue !== undefined) {
    const rev = values.revenue ?? 0
    const min = criterion.revenue.min ?? 0
    const max = criterion.revenue.max ?? Infinity
    parts.push(`营业收入${rev}万元（标准：${min}${max === Infinity ? '及以上' : `至${max}`}万元）`)
  }

  if (criterion.assets !== undefined) {
    const ast = values.assets ?? 0
    const min = criterion.assets.min ?? 0
    const max = criterion.assets.max ?? Infinity
    parts.push(`资产总额${ast}万元（标准：${min}${max === Infinity ? '及以上' : `至${max}`}万元）`)
  }

  const logicText = criterion.logic === 'AND' ? '同时满足' : '满足其中任一'
  return `根据工信部联企业〔2011〕300号标准，该企业属于${typeNames[enterpriseType]}，${logicText}以下条件：${parts.join('；')}`
}

/**
 * 检查是否超过中型企业标准（即为大型企业）
 */
function exceedsMediumStandard(
  criterion: Criterion,
  values: { employees?: number; revenue?: number; assets?: number }
): boolean {
  const checks: boolean[] = []

  if (criterion.employees !== undefined && criterion.employees.max !== undefined) {
    const emp = values.employees ?? 0
    checks.push(emp >= criterion.employees.max)
  }

  if (criterion.revenue !== undefined && criterion.revenue.max !== undefined) {
    const rev = values.revenue ?? 0
    checks.push(rev >= criterion.revenue.max)
  }

  if (criterion.assets !== undefined && criterion.assets.max !== undefined) {
    const ast = values.assets ?? 0
    checks.push(ast >= criterion.assets.max)
  }

  // 如果有上限标准，至少有一个指标超过上限才算大型企业
  if (checks.length === 0) return false
  return checks.some(c => c)
}

/**
 * 分类企业
 */
export function classifyEnterprise(
  industryType: IndustryType,
  employees?: number,
  revenue?: number,
  assets?: number
): ClassificationResult {
  const standard = getIndustryStandard(industryType)
  const values = { employees, revenue, assets }

  // 首先检查是否超过中型企业标准（即属于大型企业）
  if (exceedsMediumStandard(standard.criteria.medium, values)) {
    return {
      enterpriseType: 'large',
      criteria: buildLargeEnterpriseCriteriaDetails(standard.criteria.medium, values),
      reasoning: generateReasoning('large', standard, values)
    }
  }

  // 检查是否符合中型企业标准
  if (matchesCriterion(standard.criteria.medium, values)) {
    return {
      enterpriseType: 'medium',
      criteria: buildCriteriaDetails(standard.criteria.medium, values),
      reasoning: generateReasoning('medium', standard, values)
    }
  }

  // 检查是否符合小型企业标准
  if (matchesCriterion(standard.criteria.small, values)) {
    return {
      enterpriseType: 'small',
      criteria: buildCriteriaDetails(standard.criteria.small, values),
      reasoning: generateReasoning('small', standard, values)
    }
  }

  // 默认为微型企业
  return {
    enterpriseType: 'micro',
    criteria: buildCriteriaDetails(standard.criteria.micro, values),
    reasoning: generateReasoning('micro', standard, values)
  }
}
