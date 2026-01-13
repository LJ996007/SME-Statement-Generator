/**
 * 声明函 Word 文档生成工具
 * 使用 docx 库生成标准格式的 Word 文档
 */

import {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  UnderlineType,
  HeadingLevel,
  PageMargin,
  convertInchesToTwip,
  BorderStyle,
  WidthType,
  Table,
  TableRow,
  TableCell,
  VerticalAlign,
  ShadingType,
  Packer,
} from 'docx'
import { saveAs } from 'file-saver'

export type DeclarationType = 'goods' | 'construction' | 'service'

interface Target {
  targetName: string
  industry: string
  enterprise: {
    name: string
    employees: number | string
    revenue: number | string
    assets: number | string
    enterpriseType?: string
  }
}

/**
 * 生成 Word 文档并触发下载
 */
export async function generateAndDownloadWord(
  tendererName: string,
  projectName: string,
  declarationType: DeclarationType,
  targets: Target[]
): Promise<void> {
  try {
    const doc = generateWordDocument(tendererName, projectName, declarationType, targets)
    const blob = await Packer.toBlob(doc)
    const fileName = `中小企业声明函（${getTypeLabel(declarationType)}）-${Date.now()}.docx`
    saveAs(blob, fileName)
  } catch (error) {
    console.error('Word 文档生成失败:', error)
    throw new Error('Word 文档生成失败，请重试')
  }
}

/**
 * 生成 Word 文档对象
 */
function generateWordDocument(
  tendererName: string,
  projectName: string,
  declarationType: DeclarationType,
  targets: Target[]
): Document {
  const typeLabel = getTypeLabel(declarationType)
  const title = `中小企业声明函（${typeLabel}）`

  // 生成声明函头部段落
  const headerParagraphs = generateHeaderParagraphs(tendererName, projectName, declarationType)

  // 生成标的列表段落
  const targetParagraphs = generateTargetParagraphs(targets, declarationType)

  // 生成落款段落
  const footerParagraphs = generateFooterParagraphs()

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: [
          // 标题
          new Paragraph({
            children: [
              new TextRun({
                text: title,
                bold: true,
                size: 32, // 16pt
                font: 'SimSun', // 宋体
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 200,
              after: 400,
            },
          }),

          // 空行
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          }),

          // 声明函头部
          ...headerParagraphs,

          // 空行
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          }),

          // 标的列表
          ...targetParagraphs,

          // 空行
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          }),

          // 落款
          ...footerParagraphs,
        ],
      },
    ],
  })
}

/**
 * 生成声明函头部段落
 */
function generateHeaderParagraphs(
  tendererName: string,
  projectName: string,
  declarationType: DeclarationType
): Paragraph[] {
  let content = ''

  if (declarationType === 'goods') {
    content = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加`
  } else if (declarationType === 'construction') {
    content = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加`
  } else {
    content = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加`
  }

  return [
    new Paragraph({
      children: [
        new TextRun({
          text: content,
          size: 24,
          font: 'FangSong_GB2312', // 仿宋
        }),
        new TextRun({
          text: tendererName,
          underline: {},
          size: 24,
          font: 'FangSong_GB2312',
        }),
        new TextRun({
          text: '的',
          size: 24,
          font: 'FangSong_GB2312',
        }),
        new TextRun({
          text: projectName,
          underline: {},
          size: 24,
          font: 'FangSong_GB2312',
        }),
        new TextRun({
          text: getMiddleText(declarationType),
          size: 24,
          font: 'FangSong_GB2312',
        }),
      ],
      spacing: {
        line: 360,
        after: 200,
      },
    }),
  ]
}

/**
 * 获取声明函中部文本
 */
function getMiddleText(declarationType: DeclarationType): string {
  if (declarationType === 'goods') {
    return '采购活动，提供的货物全部由符合政策要求的中小企业制造。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：'
  } else if (declarationType === 'construction') {
    return '采购活动，工程的施工单位全部为符合政策要求的中小企业。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：'
  } else {
    return '采购活动，服务全部由符合政策要求的中小企业承接。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：'
  }
}

/**
 * 生成标的列表段落
 */
function generateTargetParagraphs(
  targets: Target[],
  declarationType: DeclarationType
): Paragraph[] {
  const paragraphs: Paragraph[] = []
  const roleText = getEnterpriseRole(declarationType)

  targets.forEach((target, index) => {
    const e = target.enterprise

    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: target.targetName,
            underline: {},
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '，属于',
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: target.industry,
            underline: {},
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '行业；',
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: roleText,
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '为',
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: e.name,
            underline: {},
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '，从业人员',
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: String(e.employees),
            underline: {},
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '人，营业收入为',
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: `${e.revenue}`,
            underline: {},
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '万元，资产总额为',
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: `${e.assets}`,
            underline: {},
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '万元，属于',
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: getEnterpriseTypeName(e.enterpriseType || 'micro'),
            underline: {},
            size: 24,
            font: 'FangSong_GB2312',
          }),
          new TextRun({
            text: '；',
            size: 24,
            font: 'FangSong_GB2312',
          }),
        ],
        spacing: {
          line: 360,
          after: 200,
        },
      })
    )
  })

  return paragraphs
}

/**
 * 获取企业角色文本
 */
function getEnterpriseRole(declarationType: DeclarationType): string {
  if (declarationType === 'goods') {
    return '制造商'
  } else if (declarationType === 'construction') {
    return '承建企业'
  } else {
    return '承接企业'
  }
}

/**
 * 生成落款段落
 */
function generateFooterParagraphs(): Paragraph[] {
  return [
    new Paragraph({
      children: [
        new TextRun({
          text: '以上企业，不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形。',
          size: 24,
          font: 'FangSong_GB2312',
        }),
      ],
      spacing: {
        line: 360,
        after: 200,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '本企业对上述声明内容的真实性负责。如有虚假，将依法承担相应责任。',
          size: 24,
          font: 'FangSong_GB2312',
        }),
      ],
      spacing: {
        line: 360,
        after: 400,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '企业名称（盖章）：',
          size: 24,
          font: 'FangSong_GB2312',
        }),
      ],
      spacing: {
        line: 360,
        after: 200,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '日期：',
          size: 24,
          font: 'FangSong_GB2312',
        }),
      ],
      spacing: {
        line: 360,
        after: 400,
      },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: '注：从业人员、营业收入、资产总额填报上一年度数据，无上一年度数据的新成立企业可不填报。',
          size: 20,
          color: '666666',
          font: 'FangSong_GB2312',
        }),
      ],
      spacing: {
        line: 360,
      },
    }),
  ]
}

/**
 * 获取类型标签
 */
function getTypeLabel(type: DeclarationType): string {
  const labels: Record<DeclarationType, string> = {
    goods: '货物',
    construction: '工程',
    service: '服务',
  }
  return labels[type]
}

/**
 * 获取企业类型名称
 */
function getEnterpriseTypeName(type: string): string {
  const names: Record<string, string> = {
    large: '大型企业',
    medium: '中型企业',
    small: '小型企业',
    micro: '微型企业',
  }
  return names[type] || type
}
