import { describe, expect, it } from 'vitest'
import { generateFormattedDeclaration } from './declaration-formatter'

describe('Declaration Formatter', () => {
  const mockEnterprises = [
    {
      name: '测试企业1',
      industry: '信息传输业',
      employees: 50,
      revenue: 1000,
      assets: 2000,
      enterpriseType: 'small'
    }
  ]

  describe('generateFormattedDeclaration', () => {
    it('should generate HTML with centered and bold title for goods', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(html).toContain('<h2 style="font-weight: bold')
      expect(html).toContain('中小企业声明函（货物）')
      expect(html).toContain('text-align: center')
    })

    it('should add underlines to fillable information', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(html).toContain('<u>2024年政府采购项目</u>')
      expect(html).toContain('<u>办公设备采购</u>')
      expect(html).toContain('<u>测试企业1</u>')
      expect(html).toContain('<u>信息传输业</u>')
      expect(html).toContain('<u>50</u>')
      expect(html).toContain('<u>1000</u>')
      expect(html).toContain('<u>2000</u>')
    })

    it('should include signature line with underline', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(html).toContain('企业名称（盖章）')
      expect(html).toContain('日期')
      expect(html).toContain('display: inline-block')
    })

    it('should include footer note for new enterprises', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(html).toContain('注：从业人员、营业收入、资产总额填报上一年度数据')
      expect(html).toContain('新成立企业可不填报')
    })

    it('should format construction declaration correctly', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公楼装修',
        'construction',
        mockEnterprises
      )

      expect(html).toContain('中小企业声明函（工程）')
      expect(html).toContain('承建企业为')
    })

    it('should format service declaration correctly', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '信息系统维护服务',
        'service',
        mockEnterprises
      )

      expect(html).toContain('中小企业声明函（服务）')
      expect(html).toContain('承接企业为')
    })

    it('should use br tags for line breaks', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(html).toContain('<br />')
    })

    it('should include all required legal statements', () => {
      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        mockEnterprises
      )

      expect(html).toContain('以上企业，不属于大企业的分支机构')
      expect(html).toContain('本企业对上述声明内容的真实性负责')
      expect(html).toContain('如有虚假，将依法承担相应责任')
    })

    it('should handle multiple enterprises', () => {
      const multiEnterprises = [
        {
          name: '企业1',
          industry: '信息传输业',
          employees: 50,
          revenue: 1000,
          assets: 2000,
          enterpriseType: 'small'
        },
        {
          name: '企业2',
          industry: '软件服务业',
          employees: 30,
          revenue: 500,
          assets: 1000,
          enterpriseType: 'micro'
        }
      ]

      const html = generateFormattedDeclaration(
        '2024年政府采购项目',
        '办公设备采购',
        'goods',
        multiEnterprises
      )

      expect(html).toContain('1. <u>企业1</u>')
      expect(html).toContain('2. <u>企业2</u>')
    })
  })
})
