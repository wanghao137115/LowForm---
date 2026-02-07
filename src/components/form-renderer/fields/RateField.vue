// 评分字段组件
<template>
  <div class="field-rate">
    <el-rate
      :model-value="mode === 'design' ? field.defaultValue : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :max="field.max"
      :allow-half="field.allowHalf"
      :show-text="field.showText"
      :show-score="field.showScore"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RateField } from '@/types/form'

const props = defineProps<{
  field: RateField
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
.field-rate {
  // 样式
}
</style>
