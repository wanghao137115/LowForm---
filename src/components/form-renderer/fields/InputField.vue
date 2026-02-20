// 输入框字段组件
<template>
  <div class="field-input" :class="{ 'design-mode': mode === 'design' }">
    <el-input
      :model-value="mode === 'design' ? field.defaultValue || field.placeholder : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :placeholder="field.placeholder"
      :maxlength="field.maxlength"
      :show-word-limit="field.showWordLimit"
      :clearable="field.clearable"
      @update:model-value="handleInput"
    >
      <template v-if="field.prefixIcon" #prefix>
        <el-icon><component :is="field.prefixIcon" /></el-icon>
      </template>
      <template v-if="field.suffixIcon" #suffix>
        <el-icon><component :is="field.suffixIcon" /></el-icon>
      </template>
    </el-input>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { InputField } from '@/types/form'

const props = defineProps<{
  field: InputField
  mode: 'design' | 'preview' | 'form'
  modelValue?: any
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
.field-input {
  &.design-mode {
    .el-input {
      .el-input__inner {
        color: #909399;
        border-style: dashed;
      }
    }
  }
}
</style>
