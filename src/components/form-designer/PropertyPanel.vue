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
          
          <el-form label-position="top" size="small" :model="localField">
            <!-- 标签 -->
            <el-form-item label="标签">
              <el-input 
                v-model="localField.label" 
                placeholder="请输入标签"
                @change="handleFieldChange"
              />
            </el-form-item>
            
            <!-- 字段名 -->
            <el-form-item label="字段名">
              <el-input 
                v-model="localField.name" 
                placeholder="请输入字段名"
                @change="handleFieldChange"
              />
            </el-form-item>
            
            <!-- 占位符 -->
            <el-form-item label="占位符" v-if="showPlaceholder">
              <el-input 
                v-model="localField.placeholder" 
                placeholder="请输入占位符"
                @change="handleFieldChange"
              />
            </el-form-item>
            
            <!-- 必填 -->
            <el-form-item>
              <template #label>
                <span>必填</span>
                <el-switch 
                  v-model="localField.required" 
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
                  v-model="localField.disabled" 
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
                  v-model="localField.hidden" 
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
          
          <el-form label-position="top" size="small" :model="localField">
            <template v-for="prop in specificProps" :key="prop.name">
              <!-- 文本输入 -->
              <el-form-item :label="prop.label" v-if="prop.type === 'text'">
                <el-input 
                  v-model="localField[prop.name]" 
                  :placeholder="prop.placeholder || ''"
                  @change="handleFieldChange"
                />
              </el-form-item>
              
              <!-- 数字输入 -->
              <el-form-item :label="prop.label" v-if="prop.type === 'number'">
                <el-input-number 
                  v-model="localField[prop.name]" 
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
                  v-model="localField[prop.name]"
                  @change="handleFieldChange"
                />
              </el-form-item>
              
              <!-- 下拉选择 -->
              <el-form-item :label="prop.label" v-if="prop.type === 'select'">
                <el-select 
                  v-model="localField[prop.name]" 
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
            v-model="localField.options"
            @change="handleFieldChange"
          />
        </div>
        
        <!-- 样式属性 -->
        <div class="property-group">
          <div class="group-title">
            <el-icon><Brush /></el-icon>
            样式属性
          </div>
          
          <el-form label-position="top" size="small" :model="localField">
            <!-- 宽度 -->
            <el-form-item label="宽度">
              <el-input 
                v-model="localField.width" 
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
import { ref, computed, watch, reactive } from 'vue'
import { Setting, MagicStick, List, Brush, Grid } from '@element-plus/icons-vue'
import { useFormStore } from '@/stores/formStore'
import type { FormField, FieldType } from '@/types/form'
import OptionsEditor from './OptionsEditor.vue'

// Props
const props = defineProps<{
  field: FormField
}>()

// Emits
const emit = defineEmits<{
  (e: 'update', field: FormField): void
}>()

// Store
const formStore = useFormStore()

// 本地字段数据
const localField = ref<FormField>(JSON.parse(JSON.stringify(props.field)))

// 表单布局
const layout = reactive({
  layout: formStore.schema.layout,
  labelPosition: formStore.schema.labelPosition,
  labelWidth: formStore.schema.labelWidth,
  gutter: formStore.schema.gutter
})

// 自定义样式文本
const customStyleText = ref('')

// 字段类型标签
const fieldTypeLabel = computed(() => {
  const labels: Record<FieldType, string> = {
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
    cascader: '级联选择',
    upload: '上传组件',
    rate: '评分',
    slider: '滑块',
    color: '颜色选择',
    'tree-select': '树选择',
    divider: '分割线',
    card: '卡片',
    collapse: '折叠面板'
  }
  return labels[props.field.type] || '未知'
})

// 显示占位符的组件类型
const showPlaceholder = computed(() => {
  return ['input', 'textarea', 'number', 'select', 'date', 'time', 'datetime', 'cascader'].includes(props.field.type)
})

// 显示选项配置的组件类型
const showOptionsConfig = computed(() => {
  return ['select', 'radio', 'checkbox'].includes(props.field.type)
})

// 特有属性配置
const specificProps = computed(() => {
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
  
  return propsConfig[props.field.type] || []
})

// 监听props变化
watch(() => props.field, (newField) => {
  localField.value = JSON.parse(JSON.stringify(newField))
}, { deep: true })

// 字段变化处理
const handleFieldChange = () => {
  emit('update', localField.value)
}

// 自定义样式变化处理
const handleCustomStyleChange = () => {
  try {
    if (customStyleText.value.trim()) {
      localField.value.customStyle = JSON.parse(customStyleText.value)
    } else {
      localField.value.customStyle = {}
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
