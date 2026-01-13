/**
 * 声明函生成逻辑
 */

import { EnterpriseInfo } from '../drizzle/schema'

/**
 * 生成声明函内容
 */
export function generateDeclarationContent(
  tendererName: string,
  projectName: string,
  industryType: string,
  enterprises: EnterpriseInfo[]
): string {
  const enterprisesList = enterprises
    .map((e, index) => {
      return `${index + 1}. ${e.name}，属于${e.industry}；承建（承接）企业为${e.name}，从业人员${e.employees}人，营业收入为${e.revenue}万元，资产总额为${e.assets}万元，属于${getEnterpriseTypeName(e.enterpriseType)}；`
    })
    .join('\n')

  const content = `中小企业声明函

本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库﹝2020﹞46号）的规定，本公司（联合体）参加${tendererName}的${projectName}采购活动，提供的货物/工程/服务全部由符合政策要求的中小企业承接。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：

${enterprisesList}

以上企业，不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形。

本企业对上述声明内容的真实性负责。如有虚假，将依法承担相应责任。

企业名称（盖章）：
日期：`

  return content
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

/**
 * 生成 Word 文档 XML 内容
 */
export function generateWordDocumentXml(
  projectName: string,
  targetName: string,
  industryType: string,
  enterprises: EnterpriseInfo[]
): string {
  const enterprisesList = enterprises
    .map((e, index) => {
      return `<w:p>
        <w:pPr>
          <w:pStyle w:val="Normal"/>
          <w:ind w:left="720" w:hanging="0"/>
          <w:spacing w:line="360" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="宋体"/>
            <w:sz w:val="22"/>
          </w:rPr>
          <w:t>${index + 1}. ${e.name}，属于${e.industry}；承建（承接）企业为${e.name}，从业人员${e.employees}人，营业收入为${e.revenue}万元，资产总额为${e.assets}万元，属于${getEnterpriseTypeName(e.enterpriseType)}；</w:t>
        </w:r>
      </w:p>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
            xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
            xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
            xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    <w:p>
      <w:pPr>
        <w:pStyle w:val="Heading1"/>
        <w:jc w:val="center"/>
        <w:spacing w:line="360" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="宋体"/>
          <w:b/>
          <w:sz w:val="28"/>
        </w:rPr>
        <w:t>中小企业声明函</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="宋体"/>
          <w:sz w:val="22"/>
        </w:rPr>
        <w:t>本公司（联合体）郑重声明，根据《政府采购促进中小企业发展管理办法》（财库﹝2020﹞46号）的规定，本公司（联合体）参加${projectName}的${targetName}采购活动，提供的货物/工程/服务全部由符合政策要求的中小企业承接。相关企业（含联合体中的中小企业、签订分包意向协议的中小企业）的具体情况如下：</w:t>
      </w:r>
    </w:p>
    
    ${enterprisesList}
    
    <w:p>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="宋体"/>
          <w:sz w:val="22"/>
        </w:rPr>
        <w:t>以上企业，不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形。</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="宋体"/>
          <w:sz w:val="22"/>
        </w:rPr>
        <w:t>本企业对上述声明内容的真实性负责。如有虚假，将依法承担相应责任。</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="宋体"/>
          <w:sz w:val="22"/>
        </w:rPr>
        <w:t>企业名称（盖章）：_________________________</w:t>
      </w:r>
    </w:p>
    
    <w:p>
      <w:pPr>
        <w:spacing w:line="360" w:lineRule="auto"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="宋体"/>
          <w:sz w:val="22"/>
        </w:rPr>
        <w:t>日期：_________________________</w:t>
      </w:r>
    </w:p>
  </w:body>
</w:document>`
}
