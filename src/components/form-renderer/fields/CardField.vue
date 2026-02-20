// 卡片字段组件
<template>
  <div class="field-card">
    <el-card :shadow="field.shadow" :style="{ width: field.width }">
      <template #header>
        <span>{{ field.header }}</span>
      </template>
      <slot>
        <p>卡片内容区域</p>
      </slot>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { CardField } from '@/types/form'

defineProps<{
  field: CardField
  mode: 'design' | 'preview' | 'form'
}>()
</script>

<style scoped lang="less">
.field-card {
  margin: 8px 0;
}
</style>
