// 数字输入字段组件
<template>
  <div class="field-number">
    <el-input-number
      :model-value="mode === 'design' ? field.defaultValue : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :min="field.min"
      :max="field.max"
      :step="field.step"
      :precision="field.precision"
      :controls="field.controls"
      style="width: 100%"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NumberField } from '@/types/form'

const props = defineProps<{
  field: NumberField
  mode: 'design' | 'preview' | 'form'
  modelValue?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void
}>()

const fieldValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value: number) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-number {
  // 样式
}
</style>
