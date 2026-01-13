/**
 * 声明函内容生成工具
 */

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

export function getDeclarationTypeLabel(type: DeclarationType): string {
  const labels: Record<DeclarationType, string> = {
    goods: '货物',
    construction: '工程',
    service: '服务'
  }
  return labels[type]
}

export function getEnterpriseTypeName(type: string): string {
  const names: Record<string, string> = {
    large: '大型企业',
    medium: '中型企业',
    small: '小型企业',
    micro: '微型企业'
  }
  return names[type] || type
}

// 获取企业角色文本
function getEnterpriseRole(type: DeclarationType): string {
  if (type === 'goods') {
    return '制造商'
  } else if (type === 'construction') {
    return '承建企业'
  } else {
    return '承接企业'
  }
}

export function generateDeclarationContent(
  tendererName: string,
  projectName: string,
  declarationType: DeclarationType,
  targets: Target[]
): string {
  const roleText = getEnterpriseRole(declarationType)

  // 生成标的列表
  let targetsList = ''
  targets.forEach((target, targetIndex) => {
    const e = target.enterprise
    targetsList += `${target.targetName}，属于${target.industry}行业；${roleText}为${e.name}，从业人员${e.employees}人，营业收入为${e.revenue}万元，资产总额为${e.assets}万元，属于${getEnterpriseTypeName(e.enterpriseType || 'micro')}；\n\n`
  })

  // 生成声明函头部
  let header = ''
  if (declarationType === 'goods') {
    header = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加${tendererName}的${projectName}采购活动，提供的货物全部由符合政策要求的中小企业制造。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  } else if (declarationType === 'construction') {
    header = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加${tendererName}的${projectName}采购活动，工程的施工单位全部为符合政策要求的中小企业。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  } else {
    // service
    header = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加${tendererName}的${projectName}采购活动，服务全部由符合政策要求的中小企业承接。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  }

  const footer = `以上企业，不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形。

本企业对上述声明内容的真实性负责。如有虚假，将依法承担相应责任。

企业名称（盖章）：_________________________
日期：_________________________

注：从业人员、营业收入、资产总额填报上一年度数据，无上一年度数据的新成立企业可不填报。`

  return `中小企业声明函（${getDeclarationTypeLabel(declarationType)}）

${header}

${targetsList}
${footer}`
}
