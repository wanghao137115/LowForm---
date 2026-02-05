// 字段渲染器 - 根据类型动态渲染字段组件
<template>
  <div 
    class="field-renderer"
    :style="fieldStyle"
  >
    <!-- 标签 -->
    <label v-if="showLabel" class="field-label">
      {{ field.label }}
      <span v-if="field.required" class="required-mark">*</span>
    </label>
    
    <!-- 组件容器 -->
    <div class="field-content">
      <component 
        :is="currentComponent"
        :field="field"
        :mode="mode"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FormField, FieldType } from '@/types/form'

// 直接导入所有字段组件
import InputField from './fields/InputField.vue'
import TextareaField from './fields/TextareaField.vue'
import NumberField from './fields/NumberField.vue'
import SelectField from './fields/SelectField.vue'
import RadioField from './fields/RadioField.vue'
import CheckboxField from './fields/CheckboxField.vue'
import SwitchField from './fields/SwitchField.vue'
import DateField from './fields/DateField.vue'
import TimeField from './fields/TimeField.vue'
import DatetimeField from './fields/DatetimeField.vue'
import CascaderField from './fields/CascaderField.vue'
import UploadField from './fields/UploadField.vue'
import RateField from './fields/RateField.vue'
import SliderField from './fields/SliderField.vue'
import ColorField from './fields/ColorField.vue'
import DividerField from './fields/DividerField.vue'
import CardField from './fields/CardField.vue'
import CollapseField from './fields/CollapseField.vue'

// Props
const props = defineProps<{
  field: FormField
  mode: 'design' | 'preview'
}>()

// 计算属性
const showLabel = computed(() => {
  return !['divider', 'card', 'collapse'].includes(props.field.type)
})

const fieldStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.field.width) {
    style.width = props.field.width as string
  }
  
  if (props.field.customStyle) {
    Object.assign(style, props.field.customStyle)
  }
  
  return style
})

// 组件映射
const componentMap: Record<string, any> = {
  input: InputField,
  textarea: TextareaField,
  number: NumberField,
  select: SelectField,
  radio: RadioField,
  checkbox: CheckboxField,
  switch: SwitchField,
  date: DateField,
  time: TimeField,
  datetime: DatetimeField,
  cascader: CascaderField,
  upload: UploadField,
  rate: RateField,
  slider: SliderField,
  color: ColorField,
  'tree-select': SelectField,
  divider: DividerField,
  card: CardField,
  collapse: CollapseField
}

// 当前显示的组件
const currentComponent = computed(() => {
  return componentMap[props.field.type] || InputField
})
</script>

<style scoped lang="less">
.field-renderer {
  display: flex;
  flex-direction: column;
  
  .field-label {
    display: flex;
    align-items: center;
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    margin-bottom: 8px;
    
    .required-mark {
      color: #F56C6C;
      margin-left: 4px;
    }
  }
  
  .field-content {
    flex: 1;
  }
}
</style>
