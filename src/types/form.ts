// 表单字段类型定义
export type FieldType = 
  | 'input'
  | 'textarea'
  | 'number'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'cascader'
  | 'upload'
  | 'rate'
  | 'slider'
  | 'color'
  | 'tree-select'
  | 'divider'
  | 'card'
  | 'collapse'

// 字段基础属性
export interface BaseField {
  id: string
  type: FieldType
  label: string
  name: string
  placeholder?: string
  defaultValue?: string | number | boolean | string[] | number[]
  required?: boolean
  disabled?: boolean
  hidden?: boolean
  width?: string | number
  height?: string | number
  customClass?: string
  customStyle?: Record<string, string>
  // 栅格布局属性
  span?: number      // 占位格数，1-24，默认6（4个占满一行）
  offset?: number    // 左侧偏移格数
  pull?: number      // 左侧偏移格数（向左）
  push?: number      // 右侧偏移格数（向右）
}

// 输入类组件属性
export interface InputField extends BaseField {
  type: 'input' | 'textarea'
  maxlength?: number
  minlength?: number
  showWordLimit?: boolean
  clearable?: boolean
  prefixIcon?: string
  suffixIcon?: string
  rows?: number
}

// 数字输入属性
export interface NumberField extends BaseField {
  type: 'number'
  min?: number
  max?: number
  step?: number
  precision?: number
  controls?: boolean
}

// 选择类组件属性
export interface SelectField extends BaseField {
  type: 'select' | 'radio' | 'checkbox' | 'tree-select'
  options: OptionItem[]
  multiple?: boolean
  filterable?: boolean
  allowCreate?: boolean
  remote?: boolean
  remoteMethod?: string
  optionsUrl?: string
}

// 选项项
export interface OptionItem {
  label: string
  value: string | number
  disabled?: boolean
  children?: OptionItem[]
}

// 开关属性
export interface SwitchField extends BaseField {
  type: 'switch'
  activeText?: string
  inactiveText?: string
  activeColor?: string
  inactiveColor?: string
  activeValue?: string | number
  inactiveValue?: string | number
}

// 日期时间类属性
export interface DateTimeField extends BaseField {
  type: 'date' | 'time' | 'datetime'
  format?: string
  valueFormat?: string
  startPlaceholder?: string
  endPlaceholder?: string
  defaultTime?: string[]
  pickerOptions?: Record<string, any>
}

// 级联选择器属性
export interface CascaderField extends BaseField {
  type: 'cascader'
  options: OptionItem[]
  props?: Record<string, any>
  filterable?: boolean
  clearable?: boolean
}

// 上传组件属性
export interface UploadField extends BaseField {
  type: 'upload'
  action: string
  accept?: string
  limit?: number
  fileList?: any[]
  listType?: 'text' | 'picture' | 'picture-card'
  autoUpload?: boolean
  multiple?: boolean
  drag?: boolean
  headers?: Record<string, string>
}

// 评分组件属性
export interface RateField extends BaseField {
  type: 'rate'
  max?: number
  allowHalf?: boolean
  colors?: string[]
  voidColor?: string
  disabledVoidColor?: string
  showText?: boolean
  showScore?: boolean
}

// 滑块组件属性
export interface SliderField extends BaseField {
  type: 'slider'
  min?: number
  max?: number
  step?: number
  range?: boolean
  showStops?: boolean
  vertical?: boolean
  height?: number
}

// 颜色选择器属性
export interface ColorField extends BaseField {
  type: 'color'
  showAlpha?: boolean
  colorFormat?: 'hex' | 'rgb' | 'hsl'
}

// 分割线属性
export interface DividerField extends BaseField {
  type: 'divider'
  content?: string
  contentPosition?: 'left' | 'center' | 'right'
  borderType?: 'solid' | 'dashed' | 'dotted'
}

// 卡片属性
export interface CardField extends BaseField {
  type: 'card'
  header?: string
  shadow?: 'always' | 'hover' | 'never'
  bodyStyle?: Record<string, string>
}

// 折叠面板属性
export interface CollapseField extends BaseField {
  type: 'collapse'
  accordion?: boolean
  panels: CollapsePanel[]
}

export interface CollapsePanel {
  name: string
  title: string
  fields: FormField[]
}

// 联合类型
export type FormField = 
  | InputField 
  | NumberField 
  | SelectField 
  | SwitchField 
  | DateTimeField 
  | CascaderField 
  | UploadField 
  | RateField 
  | SliderField 
  | ColorField 
  | DividerField 
  | CardField 
  | CollapseField

// 表单Schema
export interface FormSchema {
  id: string
  name: string
  description?: string
  fields: FormField[][]  // 二维数组，每行是一个字段数组
  layout?: 'horizontal' | 'vertical' | 'inline'
  labelWidth?: string | number
  labelPosition?: 'left' | 'right' | 'top'
  gutter?: number
  customStyle?: Record<string, string>
  customClass?: string
}

// 组件面板配置
export interface ComponentPanelItem {
  type: FieldType
  icon: string
  label: string
  category: string
  defaultProps: Partial<FormField>
}

// 表单验证规则
export interface FormValidationRule {
  required?: boolean
  message?: string
  trigger?: 'blur' | 'change' | ['blur', 'change']
  type?: 'string' | 'number' | 'boolean' | 'array' | 'date' | 'email' | 'url'
  min?: number
  max?: number
  pattern?: RegExp
  validator?: (rule: any, value: any, callback: any) => void
}

// 拖拽状态
export interface DragState {
  isDragging: boolean
  draggedItem: ComponentPanelItem | null
  dropTarget: string | null
}

// 组件注册表
export interface ComponentRegistry {
  [key: string]: {
    name: string
    component: any
    defaultProps?: Record<string, any>
  }
}
