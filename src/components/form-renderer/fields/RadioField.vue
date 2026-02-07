// 单选框字段组件
<template>
  <div class="field-radio">
    <el-radio-group
      :model-value="mode === 'design' ? field.defaultValue : fieldValue"
      :disabled="mode === 'design' || field.disabled"
      @update:model-value="handleChange"
    >
      <el-radio
        v-for="opt in field.options"
        :key="opt.value"
        :label="opt.value"
        :disabled="opt.disabled"
      >
        {{ opt.label }}
      </el-radio>
    </el-radio-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SelectField } from '@/types/form'

const props = defineProps<{
  field: SelectField
  mode: 'design' | 'preview' | 'form'
  modelValue?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const fieldValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value: string | number) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-radio {
  // 样式
}
</style>
