// 颜色选择字段组件
<template>
  <div class="field-color">
    <el-color-picker
      :model-value="mode === 'design' ? field.defaultValue : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :show-alpha="field.showAlpha"
      :color-format="field.colorFormat"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ColorField } from '@/types/form'

const props = defineProps<{
  field: ColorField
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

const handleChange = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-color {
  // 样式
}
</style>
