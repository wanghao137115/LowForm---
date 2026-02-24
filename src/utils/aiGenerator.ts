// AI 表单生成工具
import { aiConfig } from '@/config/ai'
import type { FormField, FormSchema } from '@/types/form'

interface GenerateResponse {
  success: boolean
  schema: FormSchema
  message: string
  fields: FormField[]  // 添加 fields 字段方便调试
}

// 解析 AI 返回的 JSON
const parseAIResponse = (content: string): FormField[] => {
  try {
    // 尝试提取 JSON 部分
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      // 处理不同的返回格式
      if (Array.isArray(data.fields)) {
        return data.fields
      }
      if (Array.isArray(data)) {
        return data
      }
    }
    return []
  } catch (e) {
    console.error('解析 AI 响应失败:', e)
    return []
  }
}

// 生成唯一 ID
const generateId = (): string => {
  return `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 确保字段有必要的属性
const normalizeField = (field: any): FormField => {
  const baseField: any = {
    id: field.id || generateId(),
    type: field.type || 'input',
    label: field.label || '未命名字段',
    name: field.name || field.label?.toLowerCase().replace(/\s+/g, '_') || 'field',
    span: field.span || 12,
    required: field.required || false,
  }

  // 根据类型添加特定属性
  if (['select', 'radio', 'checkbox'].includes(field.type)) {
    // 处理 options 可能是字符串数组或对象数组
    const options = field.options || []
    baseField.options = options.map((opt: string | any) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt }
      }
      return {
        label: opt.label || opt.name || opt.value,
        value: opt.value || opt.id || opt.label
      }
    })
    // 确保至少有默认选项
    if (baseField.options.length === 0) {
      baseField.options = [
        { label: '选项1', value: 'option1' },
        { label: '选项2', value: 'option2' }
      ]
    }
  }

  // 处理 input 类型的特殊属性
  if (field.type === 'input') {
    baseField.props = {}
    if (field.props?.email) baseField.props.email = true
    if (field.props?.phone) baseField.props.phone = true
  }

  return baseField as FormField
}

// 调用智谱 AI 生成表单
export const generateFormByAI = async (prompt: string): Promise<GenerateResponse> => {
  if (!aiConfig.apiKey) {
    return {
      success: false,
      schema: { id: '', name: '', fields: [] },
      message: '未配置 API Key',
      fields: []
    }
  }

  const systemPrompt = `你是一个低代码表单生成专家。根据用户描述，生成 JSON 格式的表单配置。

支持的字段类型：
- input: 单行文本
- textarea: 多行文本  
- number: 数字输入
- select: 下拉选择
- radio: 单选
- checkbox: 复选
- date: 日期
- datetime: 日期时间
- switch: 开关
- slider: 滑块
- rate: 评分
- upload: 文件上传

JSON 结构要求（只返回 JSON，不要其他内容）：
{
  "fields": [
    {
      "type": "字段类型",
      "id": "field_xxx",
      "label": "字段名称",
      "name": "字段标识",
      "required": true或false,
      "span": 24或12或8或6,
      "options": ["选项1", "选项2"] // select/radio/checkbox 时需要
    }
  ]
}

请根据用户需求生成合适的表单字段，span 值可以是 24(占满一行)、12(一半)、8(1/3)、6(1/4)。`

  try {
    const response = await fetch(aiConfig.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aiConfig.apiKey}`
      },
      body: JSON.stringify({
        model: aiConfig.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    })

    const data = await response.json()

    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content
      const fields = parseAIResponse(content).map(normalizeField)

      if (fields.length > 0) {
        // 将一维数组转换为二维数组（每行最多24格）
        const rows: FormField[][] = []
        let currentRow: FormField[] = []
        let currentSpan = 0

        fields.forEach(field => {
          const span = field.span || 12
          if (currentSpan + span > 24) {
            if (currentRow.length > 0) {
              rows.push(currentRow)
            }
            currentRow = [field]
            currentSpan = span
          } else {
            currentRow.push(field)
            currentSpan += span
          }
        })

        if (currentRow.length > 0) {
          rows.push(currentRow)
        }

        return {
          success: true,
          schema: {
            id: `form_${Date.now()}`,
            name: 'AI 生成表单',
            fields: rows
          },
          message: `成功生成 ${fields.length} 个字段`,
          fields
        }
      }
    }

    // 如果 API 返回了错误
    if (data.error) {
      return {
        success: false,
        schema: { id: '', name: '', fields: [] },
        message: `API 错误: ${data.error.message}`,
        fields: []
      }
    }

    return {
      success: false,
      schema: { id: '', name: '', fields: [] },
      message: 'AI 未能生成有效的表单配置，请尝试更详细的描述',
      fields: []
    }
  } catch (error) {
    console.error('AI 生成失败:', error)
    return {
      success: false,
      schema: { id: '', name: '', fields: [] },
      message: '网络错误，请检查网络连接后重试',
      fields: []
    }
  }
}

// 预设模板提示词
export interface TemplatePrompt {
  label: string
  prompt: string
}

export const templatePrompts: TemplatePrompt[] = [
  { 
    label: '用户注册', 
    prompt: '创建一个用户注册表单，包含用户名、密码、确认密码、手机号、邮箱' 
  },
  { 
    label: '员工登记', 
    prompt: '创建员工信息登记表，包含姓名、性别、手机号、邮箱、部门、职位、入职日期' 
  },
  { 
    label: '调查问卷', 
    prompt: '创建客户满意度调查问卷，包含姓名、联系方式、满意度评分、是否推荐、改进建议' 
  },
  { 
    label: '订单申请', 
    prompt: '创建订单申请表，包含客户姓名、联系电话、收货地址、商品选择、数量、备注' 
  },
  { 
    label: '会议预约', 
    prompt: '创建会议室预约表，包含预约人、部门、会议主题、开始时间、结束时间、参会人数' 
  }
]
