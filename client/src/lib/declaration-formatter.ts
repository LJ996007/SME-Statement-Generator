/**
 * 声明函格式化工具
 * 用于生成带有格式标记的声明函内容
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

/**
 * 生成带有 HTML 标记的格式化声明函
 */
export function generateFormattedDeclaration(
  tendererName: string,
  projectName: string,
  declarationType: DeclarationType,
  targets: Target[]
): string {
  const typeLabel = getTypeLabel(declarationType)
  const title = `中小企业声明函（${typeLabel}）`
  const roleText = getEnterpriseRole(declarationType)

  // 生成标的列表
  let targetsList = ''
  targets.forEach((target, index) => {
    const e = target.enterprise
    targetsList += `<u>${target.targetName}</u>，属于<u>${target.industry}</u>行业；${roleText}为<u>${e.name}</u>，从业人员<u>${e.employees}</u>人，营业收入为<u>${e.revenue}</u>万元，资产总额为<u>${e.assets}</u>万元，属于<u>${getEnterpriseTypeName(e.enterpriseType || 'micro')}</u>；<br /><br />`
  })

  // 生成声明函头部
  let header = ''
  if (declarationType === 'goods') {
    header = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加<u>${tendererName}</u>的<u>${projectName}</u>采购活动，提供的货物全部由符合政策要求的中小企业制造。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  } else if (declarationType === 'construction') {
    header = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加<u>${tendererName}</u>的<u>${projectName}</u>采购活动，工程的施工单位全部为符合政策要求的中小企业。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  } else {
    // service
    header = `本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库〔2020〕46号）的规定，本公司（联合体）参加<u>${tendererName}</u>的<u>${projectName}</u>采购活动，服务全部由符合政策要求的中小企业承接。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：`
  }

  const footer = `以上企业，不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形。<br /><br />本企业对上述声明内容的真实性负责。如有虚假，将依法承担相应责任。<br /><br />企业名称（盖章）：<u style="display: inline-block; width: 200px;"></u><br /><br />日期：<u style="display: inline-block; width: 200px;"></u><br /><br /><small>注：从业人员、营业收入、资产总额填报上一年度数据，无上一年度数据的新成立企业可不填报。</small>`

  return `<div style="text-align: center; margin-bottom: 24px;">
    <h2 style="font-weight: bold; font-size: 20px; margin: 0;">${title}</h2>
  </div>

  <div style="line-height: 1.8; text-align: justify;">
    <p>${header}</p>
    <p style="margin-top: 16px; margin-bottom: 16px;">
      ${targetsList}
    </p>
    <p style="margin-top: 16px;">${footer}</p>
  </div>`
}

/**
 * 获取类型标签
 */
function getTypeLabel(type: DeclarationType): string {
  const labels: Record<DeclarationType, string> = {
    goods: '货物',
    construction: '工程',
    service: '服务'
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
    micro: '微型企业'
  }
  return names[type] || type
}
