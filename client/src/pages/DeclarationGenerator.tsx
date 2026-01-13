import { useState } from 'react'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2, Plus, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { classifyEnterprise } from '@shared/industry-standards'
import type { IndustryType, EnterpriseType } from '@shared/industry-standards'
import { generateDeclarationContent, getDeclarationTypeLabel } from '@/lib/declaration-content'
import { generateFormattedDeclaration } from '@/lib/declaration-formatter'
import { generateAndDownloadWord } from '@/lib/declaration-word'

interface EnterpriseInfo {
  name: string
  employees: number
  revenue: number
  assets: number
  enterpriseType: EnterpriseType
  classificationReasoning: string
}

interface TargetInfo {
  targetName: string
  industry: string
  enterprise: EnterpriseInfo
}

interface FormTarget {
  targetName: string              // 标的名称
  industry: string                // 该标的所属行业
  enterprise: {
    name: string                  // 企业名称
    employees: number | ''        // 从业人员
    revenue: number | ''          // 营业收入（万元）
    assets: number | ''           // 资产总额（万元）
    enterpriseType?: EnterpriseType
    classificationReasoning?: string
  }
}

interface ClassificationState {
  enterpriseType?: EnterpriseType
  criteria?: Record<string, any>
  reasoning?: string
}

export default function DeclarationGenerator() {
  // 基本信息
  const [tendererName, setTendererName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [declarationType, setDeclarationType] = useState<'goods' | 'construction' | 'service'>('goods')
  const [activeTab, setActiveTab] = useState('form')

  // 标的列表（每个标的包含标的名称、行业和企业信息）
  const [targets, setTargets] = useState<FormTarget[]>([
    {
      targetName: '',
      industry: '',
      enterprise: {
        name: '',
        employees: '',
        revenue: '',
        assets: ''
      }
    }
  ])

  // 分类结果（按标的索引存储）
  const [classificationResults, setClassificationResults] = useState<Record<number, ClassificationState>>({})

  // API 调用
  const industriesQuery = trpc.declaration.getIndustries.useQuery()



  const industries = industriesQuery.data || []

  // 处理标的信息变更
  const handleTargetChange = (targetIndex: number, field: keyof FormTarget, value: any) => {
    const newTargets = [...targets]
    newTargets[targetIndex] = { ...newTargets[targetIndex], [field]: value }
    setTargets(newTargets)
  }

  // 处理标的行业变更
  const handleTargetIndustryChange = (targetIndex: number, industryId: string) => {
    const newTargets = [...targets]
    // 存储 industryId 而不是 industry.name，以便 Select 组件正确显示
    newTargets[targetIndex] = {
      ...newTargets[targetIndex],
      industry: industryId
    }
    setTargets(newTargets)

    // 重新计算该标的下企业的分类
    if (newTargets[targetIndex].enterprise.name) {
      recalculateClassification(targetIndex, industryId as IndustryType)
    }
  }

  // 处理企业信息变更
  const handleEnterpriseChange = (targetIndex: number, field: string, value: any) => {
    const newTargets = [...targets]
    newTargets[targetIndex] = {
      ...newTargets[targetIndex],
      enterprise: {
        ...newTargets[targetIndex].enterprise,
        [field]: value
      }
    }
    setTargets(newTargets)

    // 如果改变了数值字段，重新计算分类
    if (['employees', 'revenue', 'assets'].includes(field) && newTargets[targetIndex].industry) {
      recalculateClassification(targetIndex, newTargets[targetIndex].industry as IndustryType)
    }
  }

  // 重新计算企业分类
  const recalculateClassification = (targetIndex: number, industryType: IndustryType) => {
    const target = targets[targetIndex]
    const enterprise = target.enterprise

    if (enterprise.name && enterprise.employees && enterprise.revenue) {
      const result = classifyEnterprise(
        industryType,
        enterprise.employees as number,
        enterprise.revenue as number,
        enterprise.assets as number
      )

      if (result) {
        setClassificationResults(prev => ({
          ...prev,
          [targetIndex]: result
        }))

        // 更新企业类型和分类依据
        setTargets(prev => {
          const newTargets = [...prev]
          newTargets[targetIndex] = {
            ...newTargets[targetIndex],
            enterprise: {
              ...newTargets[targetIndex].enterprise,
              enterpriseType: result.enterpriseType,
              classificationReasoning: result.reasoning
            }
          }
          return newTargets
        })
      }
    }
  }

  // 添加标的
  const handleAddTarget = () => {
    setTargets(prev => [
      ...prev,
      {
        targetName: '',
        industry: '',
        enterprise: {
          name: '',
          employees: '',
          revenue: '',
          assets: ''
        }
      }
    ])
  }

  // 删除标的
  const handleRemoveTarget = (targetIndex: number) => {
    if (targets.length > 1) {
      setTargets(prev => prev.filter((_, i) => i !== targetIndex))
      setClassificationResults(prev => {
        const newResults = { ...prev }
        delete newResults[targetIndex]
        return newResults
      })
    }
  }

  // 生成声明函内容
  const generateDeclarationContentLocal = () => {
    if (!tendererName || !projectName || targets.some(t => !t.targetName || !t.enterprise.name)) {
      return null
    }

    // 将 industryId 转换为 industryName，并构造符合声明函数接口的数据
    const targetsForDeclaration = targets.map(t => {
      const industryObj = industries.find(i => i.id === t.industry)
      return {
        ...t,
        industry: industryObj?.name || t.industry // 使用行业名称
      }
    })

    return generateDeclarationContent(tendererName, projectName, declarationType, targetsForDeclaration)
  }

  // 导出 Word
  const handleExportWord = async () => {
    if (!tendererName || !projectName || targets.some(t => !t.targetName || !t.enterprise.name)) {
      toast.error('请填写完整的项目和标的信息')
      return
    }

    try {
      // 将 industryId 转换为 industryName
      const targetsForExport = targets.map(t => {
        const industryObj = industries.find(i => i.id === t.industry)
        return {
          ...t,
          industry: industryObj?.name || t.industry // 使用行业名称
        }
      })

      toast.loading('正在生成 Word 文档...', { id: 'word-export' })
      await generateAndDownloadWord(tendererName, projectName, declarationType, targetsForExport)
      toast.success('Word 文档已生成并下载！', { id: 'word-export' })
    } catch (error) {
      console.error('Word 导出失败:', error)
      toast.error('Word 文档生成失败，请重试', { id: 'word-export' })
    }
  }

  // 获取企业类型名称
  const getEnterpriseTypeName = (type: EnterpriseType): string => {
    const names: Record<EnterpriseType, string> = {
      large: '大型企业',
      medium: '中型企业',
      small: '小型企业',
      micro: '微型企业'
    }
    return names[type] || type
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">中小企业声明函生成器</h1>
          <p className="text-lg text-slate-600">根据工信部〔2011〕300号标准，自动生成符合财库〔2020〕46号格式的声明函</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="form">生成声明函</TabsTrigger>
            <TabsTrigger value="preview">生成效果预览</TabsTrigger>
          </TabsList>

          {/* 表单标签页 */}
          <TabsContent value="form" className="space-y-6">
            {/* 项目基本信息 */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex flex-col justify-center" style={{padding: '12px 24px'}}>
                <CardTitle className="text-lg font-semibold">第一步：项目基本信息</CardTitle>
                <CardDescription className="text-blue-100 text-sm mt-1">填写采购项目的基本信息</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="tendererName" className="text-slate-700 font-semibold">
                      招标人名称 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="tendererName"
                      placeholder="例如：XX市政府采购中心"
                      value={tendererName}
                      onChange={(e) => setTendererName(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projectName" className="text-slate-700 font-semibold">
                      项目名称 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="projectName"
                      placeholder="例如：2024年政府采购项目"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      className="border-slate-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="declarationType" className="text-slate-700 font-semibold">
                      声明函类型 <span className="text-red-500">*</span>
                    </Label>
                    <Select value={declarationType} onValueChange={(value: any) => setDeclarationType(value)}>
                      <SelectTrigger id="declarationType" className="border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="goods">货物</SelectItem>
                        <SelectItem value="construction">工程</SelectItem>
                        <SelectItem value="service">服务</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 企业信息及标的信息 */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex flex-col justify-center" style={{padding: '12px 24px'}}>
                <CardTitle className="text-lg font-semibold">第二步：企业信息及标的信息</CardTitle>
                <CardDescription className="text-blue-100 text-sm mt-1">填写每个标的及其对应的企业信息</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-6">
                {targets.map((target, targetIndex) => (
                  <div key={targetIndex} className="p-6 border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-colors">
                    {/* 标的标题和删除按钮 */}
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-semibold text-slate-900">标的 {targetIndex + 1}</h4>
                      {targets.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTarget(targetIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {/* 标的名称输入 */}
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-semibold">
                        标的名称 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="例如：包1、办公设备采购"
                        value={target.targetName}
                        onChange={(e) => handleTargetChange(targetIndex, 'targetName', e.target.value)}
                        className="border-slate-200"
                      />
                    </div>

                    {/* 所属行业选择 */}
                    <div className="space-y-2 mt-6">
                      <Label className="text-slate-700 font-semibold">
                        所属行业 <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={target.industry}
                        onValueChange={(value) => handleTargetIndustryChange(targetIndex, value)}
                      >
                        <SelectTrigger className="border-slate-200">
                          <SelectValue placeholder="请选择行业分类" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(industry => (
                            <SelectItem key={industry.id} value={industry.id}>
                              {industry.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* 分隔线 */}
                    <Separator className="my-6" />

                    {/* 重要提示（直接显示） */}
                    <div className="space-y-2">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm font-semibold text-amber-900 mb-2">
                          ⚠️ 重要提示：
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
                          <li>确保填报企业不属于大企业的分支机构，不存在控股股东为大企业的情形，也不存在与大企业的负责人为同一人的情形</li>
                          <li>事业单位、律师事务所等不属于企业范围，不纳入中小企业范围</li>
                        </ol>
                      </div>
                    </div>

                    {/* 企业信息 */}
                    <div className="space-y-4 mt-6">
                      <Label className="text-slate-700 font-semibold">
                        企业信息
                      </Label>

                      {/* 企业名称 */}
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-semibold">
                          企业名称 <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="请输入企业名称"
                          value={target.enterprise.name}
                          onChange={(e) => handleEnterpriseChange(targetIndex, 'name', e.target.value)}
                          className="border-slate-200"
                        />
                      </div>

                      {/* 从业人员、营业收入、资产总额 */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            从业人员 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            placeholder="人数"
                            value={target.enterprise.employees}
                            onChange={(e) => handleEnterpriseChange(targetIndex, 'employees', e.target.value ? parseInt(e.target.value) : '')}
                            className="border-slate-200"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            营业收入 <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="金额"
                              value={target.enterprise.revenue}
                              onChange={(e) => handleEnterpriseChange(targetIndex, 'revenue', e.target.value ? parseInt(e.target.value) : '')}
                              className="border-slate-200"
                            />
                            <span className="text-slate-600 whitespace-nowrap">万元</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-slate-700 font-semibold">
                            资产总额 <span className="text-red-500">*</span>
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              placeholder="金额"
                              value={target.enterprise.assets}
                              onChange={(e) => handleEnterpriseChange(targetIndex, 'assets', e.target.value ? parseInt(e.target.value) : '')}
                              className="border-slate-200"
                            />
                            <span className="text-slate-600 whitespace-nowrap">万元</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 分类结果 */}
                    {classificationResults[targetIndex] && classificationResults[targetIndex].enterpriseType && (
                      <>
                        {classificationResults[targetIndex].enterpriseType === 'large' ? (
                          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-semibold text-red-900 mb-2">
                                  ⚠️ 该企业被识别为大型企业！
                                </p>
                                <p className="text-sm text-red-800 mb-3">{classificationResults[targetIndex].reasoning}</p>

                                {/* 判定标准详情 */}
                                {Object.keys(classificationResults[targetIndex].criteria || {}).length > 0 && (
                                  <div className="mt-3 p-3 bg-white rounded border border-red-200">
                                    <p className="text-xs font-semibold text-red-900 mb-2">判定标准：</p>
                                    {classificationResults[targetIndex].criteria.employees && (
                                      <p className="text-xs text-red-800 mb-1">
                                        从业人员：{classificationResults[targetIndex].criteria.employees.value}人（标准：{classificationResults[targetIndex].criteria.employees.criterion}）
                                      </p>
                                    )}
                                    {classificationResults[targetIndex].criteria.revenue && (
                                      <p className="text-xs text-red-800 mb-1">
                                        营业收入：{classificationResults[targetIndex].criteria.revenue.value}万元（标准：{classificationResults[targetIndex].criteria.revenue.criterion}）
                                      </p>
                                    )}
                                    {classificationResults[targetIndex].criteria.assets && (
                                      <p className="text-xs text-red-800 mb-0">
                                        资产总额：{classificationResults[targetIndex].criteria.assets.value}万元（标准：{classificationResults[targetIndex].criteria.assets.criterion}）
                                      </p>
                                    )}
                                  </div>
                                )}

                                <p className="text-xs text-red-700 mt-2">
                                  根据工信部标准，该企业规模超过中小企业上限，不符合《政府采购促进中小企业发展管理办法》的中小企业认定条件。
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="font-semibold text-green-900 mb-2">
                                  企业类型：{getEnterpriseTypeName(classificationResults[targetIndex].enterpriseType as EnterpriseType)}
                                </p>
                                <p className="text-sm text-green-800 mb-3">{classificationResults[targetIndex].reasoning}</p>

                                {/* 判定标准详情 */}
                                {Object.keys(classificationResults[targetIndex].criteria || {}).length > 0 && (
                                  <div className="mt-3 p-3 bg-white rounded border border-green-200">
                                    <p className="text-xs font-semibold text-green-900 mb-2">判定标准：</p>
                                    {classificationResults[targetIndex].criteria.employees && (
                                      <p className="text-xs text-green-800 mb-1">
                                        从业人员：{classificationResults[targetIndex].criteria.employees.value}人（标准：{classificationResults[targetIndex].criteria.employees.criterion}）
                                      </p>
                                    )}
                                    {classificationResults[targetIndex].criteria.revenue && (
                                      <p className="text-xs text-green-800 mb-1">
                                        营业收入：{classificationResults[targetIndex].criteria.revenue.value}万元（标准：{classificationResults[targetIndex].criteria.revenue.criterion}）
                                      </p>
                                    )}
                                    {classificationResults[targetIndex].criteria.assets && (
                                      <p className="text-xs text-green-800 mb-0">
                                        资产总额：{classificationResults[targetIndex].criteria.assets.value}万元（标准：{classificationResults[targetIndex].criteria.assets.criterion}）
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {/* 添加标的按钮 */}
                <Button
                  onClick={handleAddTarget}
                  variant="outline"
                  className="w-full border-dashed border-2 border-blue-300 hover:bg-blue-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  添加标的
                </Button>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex gap-4 justify-end">
              <Button
                onClick={() => setActiveTab('preview')}
                disabled={!tendererName || !projectName || targets.some(t => !t.targetName || !t.enterprise.name)}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                效果预览
              </Button>
              <Button
                onClick={handleExportWord}
                disabled={!tendererName || !projectName || targets.some(t => !t.targetName || !t.enterprise.name)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                导出 Word
              </Button>
            </div>
          </TabsContent>

          {/* 预览标签页 */}
          <TabsContent value="preview">
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg flex flex-col justify-center" style={{padding: '12px 24px'}}>
                <CardTitle className="text-lg font-semibold">声明函预览</CardTitle>
                <CardDescription className="text-blue-100 text-sm mt-1">生成的声明函内容</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {generateDeclarationContentLocal() ? (
                  <div className="bg-white p-8 border border-slate-200 rounded-lg font-serif text-sm leading-relaxed text-slate-900" dangerouslySetInnerHTML={{
                    __html: (() => {
                      // 将 industryId 转换为 industryName 用于预览
                      const targetsForPreview = targets.map(t => {
                        const industryObj = industries.find(i => i.id === t.industry)
                        return {
                          ...t,
                          industry: industryObj?.name || t.industry // 使用行业名称
                        }
                      })
                      return generateFormattedDeclaration(tendererName, projectName, declarationType, targetsForPreview)
                    })()
                  }} />
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>请先填写完整的项目和标的信息</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function getEnterpriseTypeName(type: EnterpriseType | undefined): string {
  if (!type) return '未分类'
  const names: Record<EnterpriseType, string> = {
    large: '大型企业',
    medium: '中型企业',
    small: '小型企业',
    micro: '微型企业'
  }
  return names[type]
}
