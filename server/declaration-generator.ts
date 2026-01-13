/**
 * 声明函生成逻辑
 * 支持三种格式：货物、工程、服务
 */

import type { EnterpriseInfo } from '../drizzle/schema'

export type DeclarationType = 'goods' | 'construction' | 'service'

interface TargetInfo {
  targetName: string
  industry: string
  enterprise: EnterpriseInfo
}

interface DeclarationParams {
  tendererName: string
  projectName: string
  targets: TargetInfo[]
  declarationType: DeclarationType
}

/**
 * 生成声明函内容
 */
export function generateDeclarationContent(params: DeclarationParams): string {
  const { tendererName, projectName, targets, declarationType } = params

  const header = generateHeader(declarationType, tendererName, projectName)
  const targetList = generateTargetList(targets, declarationType)
  const footer = generateFooter()

  return `${header}\n\n${targetList}\n\n${footer}`
}

/**
 * 生成声明函头部
 */
function generateHeader(type: DeclarationType, tendererName: string, projectName: string): string {
  const baseText = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加${tendererName}的${projectName}采购活动`

  if (type === 'goods') {
    return `${baseText}，提供的货物全部由符合政策要求的中小企业制造。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  } else if (type === 'construction') {
    return `${baseText}，工程的施工单位全部为符合政策要求的中小企业。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  } else {
    // service
    return `${baseText}，服务全部由符合政策要求的中小企业承接。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  }
}

/**
 * 生成标的列表
 */
function generateTargetList(targets: TargetInfo[], type: DeclarationType): string {
  const roleText = getRoleText(type)

  return targets
    .map((target, index) => {
      const e = target.enterprise
      const enterpriseTypeText = getEnterpriseTypeName(e.enterpriseType)

      return `标的${index + 1}：${target.targetName}，属于${target.industry}行业；${roleText}为${e.name}，从业人员${e.employees}人，营业收入为${e.revenue}万元，资产总额为${e.assets}万元，属于${enterpriseTypeText}；`
    })
    .join('\n\n')
}

/**
 * 获取企业角色文本
 */
function getRoleText(type: DeclarationType): string {
  if (type === 'goods') {
    return '制造商'
  } else if (type === 'construction') {
    return '承建企业'
  } else {
    return '承接企业'
  }
}

/**
 * 生成声明函页脚
 */
function generateFooter(): string {
  return `以上企业，不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形。

本企业对上述声明内容的真实性负责。如有虚假，将依法承担相应责任。

企业名称（盖章）：_________________________

日期：_________________________

注：从业人员、营业收入、资产总额填报上一年度数据，无上一年度数据的新成立企业可不填报。`
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
