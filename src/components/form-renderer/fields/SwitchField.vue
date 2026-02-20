// 开关字段组件
<template>
  <div class="field-switch">
    <el-switch
      :model-value="mode === 'design' ? field.defaultValue : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :active-text="field.activeText"
      :inactive-text="field.inactiveText"
      :active-color="field.activeColor"
      :inactive-color="field.inactiveColor"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SwitchField } from '@/types/form'

const props = defineProps<{
  field: SwitchField
  mode: 'design' | 'preview' | 'form'
  modelValue?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const fieldValue = computed({
  get: () => props.modelValue ?? props.field.activeValue === true,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value: boolean) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-switch {
  // 样式
}
</style>
