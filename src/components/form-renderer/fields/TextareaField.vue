// 文本域字段组件
<template>
  <div class="field-textarea">
    <el-input
      :model-value="mode === 'design' ? field.defaultValue || field.placeholder : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :placeholder="field.placeholder"
      :rows="field.rows"
      :maxlength="field.maxlength"
      :show-word-limit="field.showWordLimit"
      type="textarea"
      @update:model-value="handleInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InputField } from '@/types/form'

const props = defineProps<{
  field: InputField
  mode: 'design' | 'preview' | 'form'
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const fieldValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleInput = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-textarea {
  // 样式
}
</style>
