// 滑块字段组件
<template>
  <div class="field-slider">
    <el-slider
      :model-value="fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :min="field.min"
      :max="field.max"
      :step="field.step"
      :range="field.range"
      :show-stops="field.showStops"
      :vertical="field.vertical"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SliderField } from '@/types/form'

const props = defineProps<{
  field: SliderField
  mode: 'design' | 'preview' | 'form'
  modelValue?: number | number[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | number[]): void
}>()

const fieldValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value: number | number[]) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-slider {
  // 样式
}
</style>
