import { describe, expect, it } from 'vitest'
import {
  generateDeclarationContent,
  getDeclarationTypeLabel,
  getEnterpriseTypeName
} from './declaration-content'

describe('Declaration Content Generation', () => {
  const mockEnterprises = [
    {
      name: '测试企业1',
      industry: '信息传输业',
      employees: 50,
      revenue: 1000,
      assets: 2000,
      enterpriseType: 'small'
    },
    {
      name: '测试企业2',
      industry: '软件和信息技术服务业',
      employees: 30,
      revenue: 500,
      assets: 1000,
      enterpriseType: 'micro'
    }
  ]

  describe('getDeclarationTypeLabel', () => {
    it('should return correct label for goods', () => {
      expect(getDeclarationTypeLabel('goods')).toBe('货物')
    })

    it('should return correct label for construction', () => {
      expect(getDeclarationTypeLabel('construction')).toBe('工程')
    })

    it('should return correct label for service', () => {
      expect(getDeclarationTypeLabel('service')).toBe('服务')
    })
  })

  describe('getEnterpriseTypeName', () => {
    it('should return correct name for medium', () => {
      expect(getEnterpriseTypeName('medium')).toBe('中型企业')
    })

    it('should return correct name for small', () => {
      expect(getEnterpriseTypeName('small')).toBe('小型企业')
    })

    it('should return correct name for micro', () => {
      expect(getEnterpriseTypeName('micro')).toBe('微型企业')
    })

    it('should return original type if not found', () => {
      expect(getEnterpriseTypeName('unknown')).toBe('unknown')
    })
  })

  describe('generateDeclarationContent', () => {
    it('should generate goods declaration with correct format', () => {
      const content = generateDeclarationContent(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(content).toContain('中小企业声明函（货物）')
      expect(content).toContain('提供的货物全部由符合政策要求的中小企业制造')
      expect(content).toContain('测试企业1')
      expect(content).toContain('制造商为')
      expect(content).toContain('小型企业')
      expect(content).toContain('微型企业')
    })

    it('should generate construction declaration with correct format', () => {
      const content = generateDeclarationContent(
        '2024年政府采购项目',
        '办公楼装修',
        'construction',
        mockEnterprises
      )

      expect(content).toContain('中小企业声明函（工程）')
      expect(content).toContain('工程的施工单位全部为符合政策要求的中小企业')
      expect(content).toContain('承建企业为')
    })

    it('should generate service declaration with correct format', () => {
      const content = generateDeclarationContent(
        '2024年政府采购项目',
        '信息系统维护服务',
        'service',
        mockEnterprises
      )

      expect(content).toContain('中小企业声明函（服务）')
      expect(content).toContain('服务全部由符合政策要求的中小企业承接')
      expect(content).toContain('承接企业为')
    })

    it('should include all required sections', () => {
      const content = generateDeclarationContent(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(content).toContain('以上企业，不属于大企业的分支机构')
      expect(content).toContain('本企业对上述声明内容的真实性负责')
      expect(content).toContain('企业名称（盖章）')
      expect(content).toContain('日期')
      expect(content).toContain('注：从业人员、营业收入、资产总额填报上一年度数据')
    })

    it('should include all enterprises in the list', () => {
      const content = generateDeclarationContent(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(content).toContain('1. 测试企业1')
      expect(content).toContain('2. 测试企业2')
      expect(content).toContain('从业人员50人')
      expect(content).toContain('从业人员30人')
      expect(content).toContain('营业收入为1000万元')
      expect(content).toContain('营业收入为500万元')
    })

    it('should handle single enterprise', () => {
      const singleEnterprise = [mockEnterprises[0]]
      const content = generateDeclarationContent(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        singleEnterprise
      )

      expect(content).toContain('1. 测试企业1')
      expect(content).not.toContain('2.')
    })

    it('should include project and target names in header', () => {
      const content = generateDeclarationContent(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(content).toContain('2024年政府采购项目')
      expect(content).toContain('办公设备采购')
    })
  })
})
