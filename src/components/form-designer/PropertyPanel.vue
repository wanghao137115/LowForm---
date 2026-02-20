// 属性面板 - 右侧编辑组件属性
<template>
  <div class="property-panel">
    <div class="panel-header">
      <h3>属性编辑</h3>
      <el-tag size="small" type="success">{{ fieldTypeLabel }}</el-tag>
    </div>
    
    <div class="panel-content">
      <el-scrollbar>
        <!-- 基础属性 -->
        <div class="property-group">
          <div class="group-title">
            <el-icon><Setting /></el-icon>
            基础属性
          </div>
          
          <el-form label-position="top" size="small" :model="currentField">
            <!-- 标签 -->
            <el-form-item label="标签">
              <el-input
                v-model="currentField.label"
                placeholder="请输入标签"
                @change="handleFieldChange"
              />
            </el-form-item>

            <!-- 字段名 -->
            <el-form-item label="字段名">
              <el-input
                v-model="currentField.name"
                placeholder="请输入字段名"
                @change="handleFieldChange"
              />
            </el-form-item>

            <!-- 占位符 -->
            <el-form-item label="占位符" v-if="showPlaceholder">
              <el-input
                v-model="currentField.placeholder"
                placeholder="请输入占位符"
                @change="handleFieldChange"
              />
            </el-form-item>

            <!-- 默认值 -->
            <el-form-item label="默认值" v-if="showDefaultValue">
              <!-- 文本输入 -->
              <el-input
                v-if="defaultValueType === 'text'"
                v-model="currentField.defaultValue"
                :placeholder="`请输入默认值`"
                @change="handleFieldChange"
              />
              <!-- 数字输入 -->
              <el-input-number
                v-else-if="defaultValueType === 'number'"
                v-model="currentField.defaultValue"
                style="width: 100%"
                @change="handleFieldChange"
              />
              <!-- 开关 -->
              <el-switch
                v-else-if="defaultValueType === 'boolean'"
                v-model="currentField.defaultValue"
                @change="handleFieldChange"
              />
              <!-- 多选 -->
              <el-select
                v-else-if="defaultValueType === 'array'"
                v-model="currentField.defaultValue"
                multiple
                collapse-tags
                collapse-tags-tooltip
                placeholder="请选择默认值"
                style="width: 100%"
                @change="handleFieldChange"
              >
                <el-option
                  v-for="opt in defaultValueOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>

            <!-- 必填 -->
            <el-form-item>
              <template #label>
                <span>必填</span>
                <el-switch
                  v-model="currentField.required"
                  size="small"
                  @change="handleFieldChange"
                />
              </template>
            </el-form-item>

            <!-- 禁用 -->
            <el-form-item>
              <template #label>
                <span>禁用</span>
                <el-switch
                  v-model="currentField.disabled"
                  size="small"
                  @change="handleFieldChange"
                />
              </template>
            </el-form-item>

            <!-- 隐藏 -->
            <el-form-item>
              <template #label>
                <span>隐藏</span>
                <el-switch
                  v-model="currentField.hidden"
                  size="small"
                  @change="handleFieldChange"
                />
              </template>
            </el-form-item>
          </el-form>
        </div>

        <!-- 特有属性 -->
        <div class="property-group" v-if="specificProps.length > 0">
          <div class="group-title">
            <el-icon><MagicStick /></el-icon>
            特有属性
          </div>

          <el-form label-position="top" size="small" :model="currentField">
            <template v-for="prop in specificProps" :key="prop.name">
              <!-- 文本输入 -->
              <el-form-item :label="prop.label" v-if="prop.type === 'text'">
                <el-input
                  v-model="currentField[prop.name]"
                  :placeholder="prop.placeholder || ''"
                  @change="handleFieldChange"
                />
              </el-form-item>

              <!-- 数字输入 -->
              <el-form-item :label="prop.label" v-if="prop.type === 'number'">
                <el-input-number
                  v-model="currentField[prop.name]"
                  :min="prop.min ?? -Infinity"
                  :max="prop.max ?? Infinity"
                  :step="prop.step || 1"
                  style="width: 100%"
                  @change="handleFieldChange"
                />
              </el-form-item>

              <!-- 开关 -->
              <el-form-item :label="prop.label" v-if="prop.type === 'switch'">
                <el-switch
                  v-model="currentField[prop.name]"
                  @change="handleFieldChange"
                />
              </el-form-item>

              <!-- 下拉选择 -->
              <el-form-item :label="prop.label" v-if="prop.type === 'select'">
                <el-select
                  v-model="currentField[prop.name]"
                  style="width: 100%"
                  @change="handleFieldChange"
                >
                  <el-option
                    v-for="opt in prop.options"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </template>
          </el-form>
        </div>

        <!-- 选项配置 -->
        <div class="property-group" v-if="showOptionsConfig">
          <div class="group-title">
            <el-icon><List /></el-icon>
            选项配置
          </div>

          <OptionsEditor
            v-model="currentField.options"
            @change="handleFieldChange"
          />
        </div>

        <!-- 样式属性 -->
        <div class="property-group">
          <div class="group-title">
            <el-icon><Brush /></el-icon>
            样式属性
          </div>

          <el-form label-position="top" size="small" :model="currentField">
            <!-- 宽度 -->
            <el-form-item label="宽度">
              <el-input
                v-model="currentField.width"
                placeholder="如: 100%, 200px"
                @change="handleFieldChange"
              >
                <template #append>px/%</template>
              </el-input>
            </el-form-item>

            <!-- 自定义样式 -->
            <el-form-item label="自定义样式">
              <el-input
                v-model="customStyleText"
                type="textarea"
                :rows="3"
                placeholder="如: { color: 'red', fontSize: '14px' }"
                @change="handleCustomStyleChange"
              />
            </el-form-item>
          </el-form>
        </div>
        
        <!-- 表单布局 -->
        <div class="property-group">
          <div class="group-title">
            <el-icon><Grid /></el-icon>
            表单布局
          </div>
          
          <el-form label-position="top" size="small">
            <el-form-item label="布局方式">
              <el-select v-model="layout.layout" style="width: 100%">
                <el-option label="水平布局" value="horizontal" />
                <el-option label="垂直布局" value="vertical" />
                <el-option label="行内布局" value="inline" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="标签位置">
              <el-select v-model="layout.labelPosition" style="width: 100%">
                <el-option label="左侧" value="left" />
                <el-option label="右侧" value="right" />
                <el-option label="顶部" value="top" />
              </el-select>
            </el-form-item>
            
            <el-form-item label="标签宽度">
              <el-input-number 
                v-model="layout.labelWidth" 
                :min="0" 
                :max="300"
                style="width: 100%"
              />
            </el-form-item>
            
            <el-form-item label="栅格间隔">
              <el-input-number 
                v-model="layout.gutter" 
                :min="0" 
                :max="100"
                style="width: 100%"
              />
            </el-form-item>
          </el-form>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Setting, MagicStick, List, Brush, Grid } from '@element-plus/icons-vue'
import { useFormStore } from '@/stores/formStore'
import type { FormField, FieldType } from '@/types/form'
import OptionsEditor from './OptionsEditor.vue'

// Props
const props = defineProps<{
  fieldId: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update', field: FormField): void
}>()

// Store
const formStore = useFormStore()

// 自定义样式文本
const customStyleText = ref('')

// 根据 fieldId 获取当前字段
const currentField = computed(() => {
  for (const row of formStore.schema.fields) {
    const field = row.find(f => f.id === props.fieldId)
    if (field) return field
  }
  return null
})

// 字段类型标签
const fieldTypeLabel = computed(() => {
  const field = currentField.value
  if (!field) return ''
  const typeLabels: Record<string, string> = {
    input: '输入框',
    textarea: '文本域',
    number: '数字输入',
    select: '下拉选择',
    radio: '单选框',
    checkbox: '复选框',
    switch: '开关',
    date: '日期选择',
    time: '时间选择',
    datetime: '日期时间',
    color: '颜色选择',
    rate: '评分',
    slider: '滑块',
    divider: '分割线',
    card: '卡片',
    collapse: '折叠面板',
    upload: '上传组件',
    cascader: '级联选择',
    treeSelect: '树选择'
  }
  return typeLabels[field.type] || field.type
})

// 显示占位符的组件类型
const showPlaceholder = computed(() => {
  const field = currentField.value
  if (!field) return false
  return ['input', 'textarea', 'number', 'select', 'date', 'time', 'datetime', 'cascader', 'treeSelect'].includes(field.type)
})

// 显示选项配置的组件类型
const showOptionsConfig = computed(() => {
  const field = currentField.value
  if (!field) return false
  return ['select', 'radio', 'checkbox', 'cascader', 'treeSelect'].includes(field.type)
})

// 表单布局 - 直接响应 store
const layout = computed({
  get: () => ({
    layout: formStore.schema.layout,
    labelPosition: formStore.schema.labelPosition,
    labelWidth: formStore.schema.labelWidth,
    gutter: formStore.schema.gutter
  }),
  set: (val) => {
    formStore.updateSchemaInfo(val)
  }
})

// 监听布局变化
watch(() => formStore.schema, (newSchema) => {
  layout.value = {
    layout: newSchema.layout,
    labelPosition: newSchema.labelPosition,
    labelWidth: newSchema.labelWidth,
    gutter: newSchema.gutter
  }
}, { deep: true })

// 初始化自定义样式文本
watch(() => currentField.value?.customStyle, (style) => {
  customStyleText.value = style ? JSON.stringify(style, null, 2) : ''
}, { immediate: true })

// 显示默认值的组件类型
const showDefaultValue = computed(() => {
  const field = currentField.value
  if (!field) return false
  return ['input', 'textarea', 'number', 'select', 'radio', 'checkbox', 'switch', 'date', 'time', 'datetime', 'color', 'rate'].includes(field.type)
})

// 默认值类型
const defaultValueType = computed(() => {
  const field = currentField.value
  if (!field) return 'text'
  switch (field.type) {
    case 'number':
      return 'number'
    case 'switch':
      return 'boolean'
    case 'select':
    case 'checkbox':
      return 'array'
    default:
      return 'text'
  }
})

// 默认值选项（用于多选类型）
const defaultValueOptions = computed(() => {
  const field = currentField.value
  if (!field || !['select', 'radio', 'checkbox'].includes(field.type)) return []
  return (field as any).options || []
})

// 特有属性配置
const specificProps = computed(() => {
  const field = currentField.value
  if (!field) return []

  const propsConfig: Record<FieldType, Array<{ name: string; label: string; type: string; options?: any[]; min?: number; max?: number; step?: number; placeholder?: string }>> = {
    input: [
      { name: 'maxlength', label: '最大长度', type: 'number', min: 0, max: 5000 },
      { name: 'showWordLimit', label: '显示字数统计', type: 'switch' },
      { name: 'clearable', label: '可清空', type: 'switch' }
    ],
    textarea: [
      { name: 'rows', label: '行数', type: 'number', min: 1, max: 20 },
      { name: 'maxlength', label: '最大长度', type: 'number', min: 0, max: 5000 },
      { name: 'showWordLimit', label: '显示字数统计', type: 'switch' }
    ],
    number: [
      { name: 'min', label: '最小值', type: 'number' },
      { name: 'max', label: '最大值', type: 'number' },
      { name: 'step', label: '步长', type: 'number', step: 0.1 },
      { name: 'precision', label: '精度', type: 'number', min: 0, max: 20 },
      { name: 'controls', label: '显示控制按钮', type: 'switch' }
    ],
    select: [
      { name: 'multiple', label: '多选', type: 'switch' },
      { name: 'filterable', label: '可搜索', type: 'switch' },
      { name: 'allowCreate', label: '允许创建', type: 'switch' },
      { name: 'clearable', label: '可清空', type: 'switch' }
    ],
    radio: [],
    checkbox: [],
    switch: [
      { name: 'activeText', label: '开启文字', type: 'text' },
      { name: 'inactiveText', label: '关闭文字', type: 'text' },
      { name: 'activeColor', label: '开启颜色', type: 'text', placeholder: '#409EFF' },
      { name: 'inactiveColor', label: '关闭颜色', type: 'text', placeholder: '#C0CCDA' }
    ],
    date: [
      { name: 'type', label: '类型', type: 'select', options: [
        { label: '日期', value: 'date' },
        { label: '周', value: 'week' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' }
      ]},
      { name: 'format', label: '显示格式', type: 'text', placeholder: 'YYYY-MM-DD' },
      { name: 'valueFormat', label: '值格式', type: 'text', placeholder: 'YYYY-MM-DD' },
      { name: 'clearable', label: '可清空', type: 'switch' }
    ],
    time: [
      { name: 'format', label: '显示格式', type: 'text', placeholder: 'HH:mm:ss' },
      { name: 'valueFormat', label: '值格式', type: 'text', placeholder: 'HH:mm:ss' },
      { name: 'clearable', label: '可清空', type: 'switch' }
    ],
    datetime: [
      { name: 'format', label: '显示格式', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
      { name: 'valueFormat', label: '值格式', type: 'text', placeholder: 'YYYY-MM-DD HH:mm:ss' },
      { name: 'clearable', label: '可清空', type: 'switch' }
    ],
    cascader: [
      { name: 'clearable', label: '可清空', type: 'switch' },
      { name: 'filterable', label: '可搜索', type: 'switch' }
    ],
    upload: [
      { name: 'action', label: '上传地址', type: 'text' },
      { name: 'accept', label: '接受文件类型', type: 'text', placeholder: 'image/*' },
      { name: 'limit', label: '最大数量', type: 'number', min: 1, max: 100 },
      { name: 'multiple', label: '多选', type: 'switch' },
      { name: 'autoUpload', label: '自动上传', type: 'switch' },
      { name: 'drag', label: '拖拽上传', type: 'switch' },
      { name: 'listType', label: '列表类型', type: 'select', options: [
        { label: '文本', value: 'text' },
        { label: '图片', value: 'picture' },
        { label: '图片卡片', value: 'picture-card' }
      ]}
    ],
    rate: [
      { name: 'max', label: '最大分值', type: 'number', min: 1, max: 10 },
      { name: 'allowHalf', label: '允许半星', type: 'switch' },
      { name: 'showText', label: '显示文字', type: 'switch' },
      { name: 'showScore', label: '显示分数', type: 'switch' }
    ],
    slider: [
      { name: 'min', label: '最小值', type: 'number' },
      { name: 'max', label: '最大值', type: 'number' },
      { name: 'step', label: '步长', type: 'number', min: 1 },
      { name: 'range', label: '范围选择', type: 'switch' },
      { name: 'showStops', label: '显示间断点', type: 'switch' },
      { name: 'vertical', label: '垂直方向', type: 'switch' }
    ],
    color: [
      { name: 'showAlpha', label: '显示透明度', type: 'switch' },
      { name: 'colorFormat', label: '颜色格式', type: 'select', options: [
        { label: 'HEX', value: 'hex' },
        { label: 'RGB', value: 'rgb' },
        { label: 'HSL', value: 'hsl' }
      ]}
    ],
    'tree-select': [
      { name: 'multiple', label: '多选', type: 'switch' },
      { name: 'filterable', label: '可搜索', type: 'switch' },
      { name: 'clearable', label: '可清空', type: 'switch' }
    ],
    divider: [
      { name: 'content', label: '内容', type: 'text' },
      { name: 'contentPosition', label: '位置', type: 'select', options: [
        { label: '左侧', value: 'left' },
        { label: '中间', value: 'center' },
        { label: '右侧', value: 'right' }
      ]},
      { name: 'borderType', label: '线条类型', type: 'select', options: [
        { label: '实线', value: 'solid' },
        { label: '虚线', value: 'dashed' },
        { label: '点线', value: 'dotted' }
      ]}
    ],
    card: [
      { name: 'header', label: '标题', type: 'text' },
      { name: 'shadow', label: '阴影', type: 'select', options: [
        { label: '总是', value: 'always' },
        { label: '悬浮', value: 'hover' },
        { label: '从不', value: 'never' }
      ]}
    ],
    collapse: [
      { name: 'accordion', label: '手风琴模式', type: 'switch' }
    ]
  }

  return propsConfig[field.type] || []
})

// 字段变化处理 - 直接更新到 store
const handleFieldChange = () => {
  if (currentField.value) {
    formStore.updateField(currentField.value)
  }
}

// 自定义样式变化处理
const handleCustomStyleChange = () => {
  try {
    if (customStyleText.value.trim()) {
      currentField.value!.customStyle = JSON.parse(customStyleText.value)
    } else {
      currentField.value!.customStyle = {}
    }
    handleFieldChange()
  } catch (e) {
    // JSON解析失败，忽略
  }
}
</script>

<style scoped lang="less">
.property-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
  }
  
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  
  .property-group {
    margin-bottom: 24px;
    
    .group-title {
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #ebeef5;
      
      .el-icon {
        margin-right: 6px;
        font-size: 14px;
        color: #409eff;
      }
    }
    
    .el-form {
      .el-form-item {
        margin-bottom: 12px;
        
        :deep(.el-form-item__label) {
          font-size: 12px;
          color: #606266;
          line-height: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          
          span {
            flex: 1;
          }
        }
      }
    }
  }
}
</style>
