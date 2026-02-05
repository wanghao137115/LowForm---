// 级联选择字段组件
<template>
  <div class="field-cascader">
    <el-cascader
      :model-value="fieldValue"
      :disabled="mode === 'design' || field.disabled"
      :placeholder="field.placeholder"
      :options="field.options"
      :props="field.props"
      :filterable="field.filterable"
      :clearable="field.clearable"
      style="width: 100%"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CascaderField } from '@/types/form'

const props = defineProps<{
  field: CascaderField
  mode: 'design' | 'preview' | 'form'
  modelValue?: (string | number)[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number)[] | undefined): void
}>()

const fieldValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleChange = (value: (string | number)[] | undefined) => {
  emit('update:modelValue', value)
}
</script>

<style scoped lang="less">
.field-cascader {
  // 样式
}
</style>
