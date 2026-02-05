// 上传组件字段
<template>
  <div class="field-upload">
    <el-upload
      :action="field.action"
      :accept="field.accept"
      :limit="field.limit"
      :list-type="field.listType"
      :auto-upload="field.autoUpload"
      :multiple="field.multiple"
      :drag="field.drag"
      :disabled="mode === 'design' || field.disabled"
      style="width: 100%"
    >
      <el-icon><Upload /></el-icon>
      <div class="el-upload__text">
        {{ mode === 'design' ? '拖拽或点击上传文件' : '将文件拖到此处，或点击上传' }}
      </div>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { Upload } from '@element-plus/icons-vue'
import type { UploadField } from '@/types/form'

const props = defineProps<{
  field: UploadField
  mode: 'design' | 'preview' | 'form'
}>()
</script>

<style scoped lang="less">
.field-upload {
  // 样式
}
</style>
