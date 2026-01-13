/**
 * Word 文档生成服务
 */

import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import type { EnterpriseInfo } from '../drizzle/schema'

interface TargetInfo {
  targetName: string
  industry: string
  enterprise: EnterpriseInfo
}

/**
 * 创建带格式的段落
 */
function createFormattedParagraph(text: string, options?: any) {
  return new Paragraph({
    text: text,
    ...options
  })
}

/**
 * 生成声明函 Word 文档
 */
export async function generateDeclarationWord(
  tendererName: string,
  projectName: string,
  declarationType: 'goods' | 'construction' | 'service',
  targets: TargetInfo[]
): Promise<Buffer> {
  const roleText = getEnterpriseRole(declarationType)

  const targetParagraphs = targets.map((target, index) => {
    const e = target.enterprise
    const text = `标的${index + 1}：${target.targetName}，属于${target.industry}行业；${roleText}为${e.name}，从业人员${e.employees}人，营业收入为${e.revenue}万元，资产总额为${e.assets}万元，属于${getEnterpriseTypeName(e.enterpriseType)}；`
    return new Paragraph({
      text: text,
      spacing: {
        line: 360,
        lineRule: 'auto'
      },
      indent: {
        left: 720
      }
    })
  })

  const doc = new Document({
    sections: [
      {
        children: [
          // 标题
          new Paragraph({
            text: '中小企业声明函',
            alignment: AlignmentType.CENTER,
            spacing: {
              line: 360,
              lineRule: 'auto',
              after: 200
            }
          }),

          // 正文开头
          new Paragraph({
            text: `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加${tendererName}的${projectName}采购活动，提供的货物/工程/服务全部由符合政策要求的中小企业承接。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`,
            spacing: {
              line: 360,
              lineRule: 'auto',
              after: 200
            }
          }),

          // 标的列表
          ...targetParagraphs,

          // 空行
          new Paragraph({
            text: '',
            spacing: {
              line: 360,
              lineRule: 'auto'
            }
          }),

          // 声明内容 1
          new Paragraph({
            text: '以上企业，不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形。',
            spacing: {
              line: 360,
              lineRule: 'auto',
              after: 200
            }
          }),

          // 声明内容 2
          new Paragraph({
            text: '本企业对上述声明内容的真实性负责。如有虚假，将依法承担相应责任。',
            spacing: {
              line: 360,
              lineRule: 'auto',
              after: 400
            }
          }),

          // 签章位置 1
          new Paragraph({
            text: '企业名称（盖章）：_________________________',
            spacing: {
              line: 360,
              lineRule: 'auto',
              after: 200
            }
          }),

          // 签章位置 2
          new Paragraph({
            text: '日期：_________________________',
            spacing: {
              line: 360,
              lineRule: 'auto'
            }
          })
        ]
      }
    ]
  })

  const buffer = await Packer.toBuffer(doc)
  return buffer
}

/**
 * 获取企业角色文本
 */
function getEnterpriseRole(type: 'goods' | 'construction' | 'service'): string {
  if (type === 'goods') {
    return '制造商'
  } else if (type === 'construction') {
    return '承建企业'
  } else {
    return '承接企业'
  }
}

/**
 * 获取企业类型名称
 */
function getEnterpriseTypeName(type: 'large' | 'medium' | 'small' | 'micro'): string {
  const names: Record<string, string> = {
    large: '大型企业',
    medium: '中型企业',
    small: '小型企业',
    micro: '微型企业'
  }
  return names[type] || type
}
