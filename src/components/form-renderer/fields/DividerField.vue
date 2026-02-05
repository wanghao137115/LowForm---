// 分割线字段组件
<template>
  <div class="field-divider">
    <el-divider :content-position="field.contentPosition">
      {{ field.content }}
    </el-divider>
  </div>
</template>

<script setup lang="ts">
import type { DividerField } from '@/types/form'

const props = defineProps<{
  field: DividerField
  mode: 'design' | 'preview' | 'form'
}>()
</script>

<style scoped lang="less">
.field-divider {
  margin: 16px 0;
}
</style>
