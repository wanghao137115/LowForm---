// 折叠面板字段组件
<template>
  <div class="field-collapse">
    <el-collapse :accordion="field.accordion">
      <el-collapse-item 
        v-for="(panel, index) in field.panels" 
        :key="index"
        :title="panel.title"
        :name="panel.name"
      >
        <div>{{ panel.title }} - 折叠面板内容区域</div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import type { CollapseField } from '@/types/form'

defineProps<{
  field: CollapseField
  mode: 'design' | 'preview' | 'form'
}>()
</script>

<style scoped lang="less">
.field-collapse {
  margin: 8px 0;
}
</style>
