import { describe, it, expect } from 'vitest'
import { classifyEnterprise, getIndustryStandard, getAllIndustries } from '../shared/industry-standards'

describe('企业类型分类逻辑', () => {
  describe('工业行业', () => {
    it('应该正确识别中型企业', () => {
      const result = classifyEnterprise('manufacturing', 500, 5000, 10000)
      expect(result.enterpriseType).toBe('medium')
      expect(result.reasoning).toContain('中型企业')
    })

    it('应该正确识别小型企业', () => {
      const result = classifyEnterprise('manufacturing', 50, 500, 1000)
      expect(result.enterpriseType).toBe('small')
      expect(result.reasoning).toContain('小型企业')
    })

    it('应该正确识别微型企业', () => {
      const result = classifyEnterprise('manufacturing', 5, 100, 200)
      expect(result.enterpriseType).toBe('micro')
      expect(result.reasoning).toContain('微型企业')
    })

    it('应该在从业人员不足时识别为微型企业', () => {
      const result = classifyEnterprise('manufacturing', 15, 5000, 10000)
      expect(result.enterpriseType).toBe('micro')
    })
  })

  describe('零售业行业', () => {
    it('应该正确识别中型企业', () => {
      const result = classifyEnterprise('retail', 100, 1000, 5000)
      expect(result.enterpriseType).toBe('medium')
    })

    it('应该正确识别小型企业', () => {
      const result = classifyEnterprise('retail', 20, 200, 1000)
      expect(result.enterpriseType).toBe('small')
    })

    it('应该在营业收入不足时识别为微型企业', () => {
      const result = classifyEnterprise('retail', 50, 50, 1000)
      expect(result.enterpriseType).toBe('micro')
    })
  })

  describe('建筑业行业', () => {
    it('应该正确识别中型企业（基于营业收入和资产）', () => {
      const result = classifyEnterprise('construction', 0, 10000, 6000)
      expect(result.enterpriseType).toBe('medium')
    })

    it('应该正确识别小型企业', () => {
      const result = classifyEnterprise('construction', 0, 1000, 1000)
      expect(result.enterpriseType).toBe('small')
    })

    it('应该在资产总额不足时识别为微型企业', () => {
      const result = classifyEnterprise('construction', 0, 5000, 200)
      expect(result.enterpriseType).toBe('micro')
    })
  })

  describe('其他行业', () => {
    it('应该正确识别其他未列明行业的中型企业', () => {
      const result = classifyEnterprise('other', 150, 0, 0)
      expect(result.enterpriseType).toBe('medium')
    })

    it('应该正确识别其他未列明行业的小型企业', () => {
      const result = classifyEnterprise('other', 50, 0, 0)
      expect(result.enterpriseType).toBe('small')
    })

    it('应该正确识别其他未列明行业的微型企业', () => {
      const result = classifyEnterprise('other', 5, 0, 0)
      expect(result.enterpriseType).toBe('micro')
    })
  })

  describe('行业标准数据', () => {
    it('应该返回所有行业列表', () => {
      const industries = getAllIndustries()
      expect(industries.length).toBeGreaterThanOrEqual(15)
      expect(industries.some(i => i.id === 'manufacturing')).toBe(true)
      expect(industries.some(i => i.id === 'retail')).toBe(true)
    })

    it('应该正确返回特定行业的标准', () => {
      const standard = getIndustryStandard('manufacturing')
      expect(standard).toBeDefined()
      expect(standard.criteria.medium).toBeDefined()
      expect(standard.criteria.small).toBeDefined()
      expect(standard.criteria.micro).toBeDefined()
    })

    it('应该包含正确的划分标准', () => {
      const standard = getIndustryStandard('manufacturing')
      expect(standard.criteria.medium.employees?.min).toBe(300)
      expect(standard.criteria.medium.employees?.max).toBe(1000)
      expect(standard.criteria.medium.revenue?.min).toBe(2000)
      expect(standard.criteria.medium.revenue?.max).toBe(40000)
    })
  })

  describe('分类结果详情', () => {
    it('应该包含详细的分类依据', () => {
      const result = classifyEnterprise('manufacturing', 500, 5000, 10000)
      expect(result.criteria).toBeDefined()
      expect(result.criteria.employees).toBeDefined()
      expect(result.criteria.revenue).toBeDefined()
      expect(result.reasoning).toContain('从业人员')
      expect(result.reasoning).toContain('营业收入')
    })

    it('应该正确标记满足的条件', () => {
      const result = classifyEnterprise('manufacturing', 500, 5000, 10000)
      expect(result.criteria.employees?.passed).toBe(true)
      expect(result.criteria.revenue?.passed).toBe(true)
    })

    it('应该包含工信部标准的引用', () => {
      const result = classifyEnterprise('manufacturing', 500, 5000, 10000)
      expect(result.reasoning).toContain('工信部联企业〔2011〕300号')
    })
  })

  describe('边界值测试', () => {
    it('应该正确处理恰好在中型企业下限的情况', () => {
      const result = classifyEnterprise('manufacturing', 300, 2000, 10000)
      expect(result.enterpriseType).toBe('medium')
    })

    it('应该正确处理恰好在中型企业上限的情况', () => {
      const result = classifyEnterprise('manufacturing', 999, 39999, 10000)
      expect(result.enterpriseType).toBe('medium')
    })

    it('应该正确处理超过中型企业上限的情况（大型企业）', () => {
      const result = classifyEnterprise('manufacturing', 1000, 40000, 10000)
      expect(result.enterpriseType).toBe('large')
      expect(result.reasoning).toContain('大型企业')
    })

    it('应该正确处理零值', () => {
      const result = classifyEnterprise('manufacturing', 0, 0, 0)
      expect(result.enterpriseType).toBe('micro')
    })
  })

  describe('大型企业识别', () => {
    it('应该正确识别工业行业的大型企业（从业人员超过上限）', () => {
      const result = classifyEnterprise('manufacturing', 1000, 5000, 10000)
      expect(result.enterpriseType).toBe('large')
      expect(result.reasoning).toContain('大型企业')
    })

    it('应该正确识别工业行业的大型企业（营业收入超过上限）', () => {
      const result = classifyEnterprise('manufacturing', 500, 40000, 10000)
      expect(result.enterpriseType).toBe('large')
      expect(result.reasoning).toContain('大型企业')
    })

    it('应该正确识别其他行业的大型企业（从业人员超过上限）', () => {
      const result = classifyEnterprise('other', 300, 0, 0)
      expect(result.enterpriseType).toBe('large')
      expect(result.reasoning).toContain('大型企业')
    })

    it('应该正确识别建筑业的大型企业（营业收入超过上限）', () => {
      const result = classifyEnterprise('construction', 0, 80000, 5000)
      expect(result.enterpriseType).toBe('large')
      expect(result.reasoning).toContain('大型企业')
    })

    it('应该正确识别建筑业的大型企业（资产总额超过上限）', () => {
      const result = classifyEnterprise('construction', 0, 5000, 80000)
      expect(result.enterpriseType).toBe('large')
      expect(result.reasoning).toContain('大型企业')
    })
  })
})
