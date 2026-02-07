// 时间选择字段组件
<template>
  <div class="field-time">
    <el-time-picker
      :model-value="mode === 'design' ? field.defaultValue : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :placeholder="field.placeholder"
      :format="field.format"
      :value-format="field.valueFormat"
      :clearable="field.clearable"
      style="width: 100%"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DateTimeField } from '@/types/form'

const props = defineProps<{
  field: DateTimeField
  mode: 'design' | 'preview' | 'form'
  modelValue?: string | Date
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | Date | undefined): void
}>()

const fieldValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value: string | Date | undefined) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-time {
  // 样式
}
</style>
