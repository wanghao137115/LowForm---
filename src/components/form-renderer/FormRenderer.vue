// 表单渲染器 - 完整表单渲染
<template>
  <div class="form-renderer">
    <el-form
      ref="formRef"
      :model="modelValue"
      :rules="rules"
      :label-position="schema.labelPosition"
      :label-width="schema.labelWidth + 'px'"
      :gutter="schema.gutter"
      :class="[`form-layout-${schema.layout}`]"
      :style="formStyle"
    >
      <!-- 遍历渲染所有行 -->
      <template v-for="(row, rowIndex) in fieldRows" :key="rowIndex">
        <el-row :gutter="schema.gutter">
          <!-- 遍历渲染行内的字段 -->
          <template v-for="field in row" :key="field.id">
            <el-col :span="field.span || 6">
              <!-- 分割线 -->
              <el-form-item 
                v-if="field.type === 'divider'"
                :label="field.content"
                :label-width="field.content ? undefined : '0'"
              >
                <el-divider :content-position="field.contentPosition">
                  {{ field.content }}
                </el-divider>
              </el-form-item>
              
              <!-- 卡片 -->
              <el-form-item 
                v-else-if="field.type === 'card'"
                :label-width="0"
              >
                <el-card :shadow="field.shadow" :style="{ width: field.width }">
                  <template #header>
                    <span>{{ field.header }}</span>
                  </template>
                  <slot :name="`card-${field.id}`">
                    <p>卡片内容区域</p>
                  </slot>
                </el-card>
              </el-form-item>
              
              <!-- 折叠面板 -->
              <el-form-item 
                v-else-if="field.type === 'collapse'"
                :label-width="0"
              >
                <el-collapse :accordion="field.accordion">
                  <el-collapse-item 
                    v-for="(panel, index) in field.panels" 
                    :key="index"
                    :title="panel.title"
                    :name="panel.name"
                  >
                    <div>{{ panel.title }} - 折叠面板内容区域</div>
                  </el-collapse-item>
                </el-collapse>
              </el-form-item>
              
              <!-- 普通字段 -->
              <el-form-item 
                v-else
                :label="field.label"
                :prop="field.name"
                :required="field.required"
              >
                <!-- 动态组件渲染 -->
                <component
                  :is="getFieldComponent(field.type)"
                  :field="field"
                  :model-value="modelValue[field.name]"
                  :mode="mode"
                  @update:model-value="handleFieldValueChange(field.name, $event)"
                />
              </el-form-item>
            </el-col>
          </template>
        </el-row>
      </template>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { FormSchema, FieldType } from '@/types/form'

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

// Props
const props = withDefaults(defineProps<{
  schema: FormSchema
  model: Record<string, any>
  mode?: 'design' | 'preview' | 'form'
}>(), {
  mode: 'form'
})

// Emits
const emit = defineEmits<{
  (e: 'update:model', value: Record<string, any>): void
  (e: 'submit', value: Record<string, any>): void
  (e: 'validate', isValid: boolean): void
}>()

// 表单引用
const formRef = ref()

// 表单数据
const modelValue = computed({
  get: () => props.model,
  set: (value) => emit('update:model', value)
})

// 字段行数据（扁平化用于验证规则）
const flatFields = computed(() => {
  return props.schema.fields.flat().filter(field => !field.hidden)
})

// 字段行数据（用于渲染）
const fieldRows = computed(() => {
  return props.schema.fields
})

// 表单验证规则
const rules = computed(() => {
  const ruleMap: Record<string, any[]> = {}
  
  flatFields.value.forEach(field => {
    if (field.required) {
      ruleMap[field.name] = [
        { 
          required: true, 
          message: `请${['select', 'radio', 'checkbox', 'switch'].includes(field.type) ? '选择' : '输入'}${field.label}`,
          trigger: ['select', 'radio-group', 'checkbox-group', 'switch'].includes(field.type) ? 'change' : 'blur'
        }
      ]
    }
  })
  
  return ruleMap
})

// 表单样式
const formStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.schema.customStyle) {
    Object.assign(style, props.schema.customStyle)
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
  'tree-select': SelectField
}

// 根据类型获取对应组件
const getFieldComponent = (type: FieldType) => {
  return componentMap[type] || InputField
}

// 字段值变化处理
const handleFieldValueChange = (fieldName: string, value: any) => {
  modelValue.value[fieldName] = value
}

// 表单验证
const validate = (): Promise<boolean> => {
  return formRef.value?.validate() || Promise.resolve(false)
}

// 重置表单
const resetFields = () => {
  formRef.value?.resetFields()
}

// 清理验证
const clearValidate = () => {
  formRef.value?.clearValidate()
}

// 暴露方法
defineExpose({
  validate,
  resetFields,
  clearValidate
})

// 监听schema变化，初始化字段
watch(() => props.schema.fields, () => {
  // 初始化缺失的字段值
  flatFields.value.forEach(field => {
    if (!(field.name in modelValue.value)) {
      if (field.type === 'checkbox') {
        modelValue.value[field.name] = []
      } else if (field.type === 'slider' && (field as any).range) {
        modelValue.value[field.name] = [(field as any).min || 0, (field as any).max || 100]
      } else {
        modelValue.value[field.name] = undefined
      }
    }
  })
}, { immediate: true, deep: true })
</script>

<style scoped lang="less">
.form-renderer {
  .el-form {
    &.form-layout-horizontal {
      .el-form-item {
        display: inline-flex;
        margin-right: 16px;
        margin-bottom: 18px;
      }
    }
    
    &.form-layout-inline {
      .el-form-item {
        display: inline-flex;
        margin-right: 16px;
        margin-bottom: 0;
      }
    }
  }
}
</style>
