// 下拉选择字段组件
<template>
  <div class="field-select">
    <el-select
      :model-value="fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :placeholder="field.placeholder"
      :multiple="field.multiple"
      :filterable="field.filterable"
      :clearable="field.clearable"
      style="width: 100%"
      @update:model-value="handleChange"
    >
      <el-option
        v-for="opt in field.options"
        :key="opt.value"
        :label="opt.label"
        :value="opt.value"
        :disabled="opt.disabled"
      />
    </el-select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SelectField } from '@/types/form'

const props = defineProps<{
  field: SelectField
  mode: 'design' | 'preview' | 'form'
  modelValue?: string | number | (string | number)[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | (string | number)[]): void
}>()

const fieldValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value: string | number | (string | number)[]) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-select {
  // 样式
}
</style>
