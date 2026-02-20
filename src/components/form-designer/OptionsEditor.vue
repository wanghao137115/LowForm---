// 选项编辑器 - 编辑select/radio/checkbox的选项
<template>
  <div class="options-editor">
    <div class="options-header">
      <span class="options-count">{{ modelValue.length }} 个选项</span>
      <el-button size="small" type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加选项
      </el-button>
    </div>

    <div class="options-list">
      <div
        v-for="(option, index) in modelValue"
        :key="index"
        class="option-item"
      >
        <el-input
          v-model="option.label"
          placeholder="标签"
          size="small"
          @change="handleChange"
        />
        <el-input
          v-model="option.value"
          placeholder="值"
          size="small"
          class="option-value"
          @change="handleChange"
        />
        <el-checkbox
          v-model="option.disabled"
          size="small"
          title="禁用"
          @change="handleChange"
        />
        <el-button
          size="small"
          type="danger"
          circle
          @click="handleDelete(index)"
        >
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <div v-if="modelValue.length === 0" class="empty-tip">
      <el-empty description="暂无选项" :image-size="60" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import type { OptionItem } from '@/types/form'

// Props
const props = defineProps<{
  modelValue: OptionItem[]
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', options: OptionItem[]): void
  (e: 'change', options: OptionItem[]): void
}>()

// 直接使用 props.modelValue，不创建本地副本
// 添加选项
const handleAdd = () => {
  const value = String(props.modelValue.length + 1)
  const newOption: OptionItem = {
    label: `选项${value}`,
    value: value,
    disabled: false
  }
  const newOptions = [...props.modelValue, newOption]
  emit('update:modelValue', newOptions)
  emit('change', newOptions)
}

// 删除选项
const handleDelete = (index: number) => {
  const newOptions = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newOptions)
  emit('change', newOptions)
}

// 选项变化 - 当直接修改选项属性时触发
const handleChange = () => {
  emit('update:modelValue', props.modelValue)
  emit('change', props.modelValue)
}
</script>

<style scoped lang="less">
.options-editor {
  .options-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
    
    .options-count {
      font-size: 12px;
      color: #909399;
    }
  }
  
  .options-list {
    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      
      .option-value {
        width: 80px;
      }
    }
  }
  
  .empty-tip {
    padding: 20px 0;
  }
}
</style>
