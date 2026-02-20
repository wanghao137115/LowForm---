// 组件面板 - 左侧可拖拽的组件列表
<template>
  <div class="component-panel">
    <div class="panel-header">
      <h3>组件库</h3>
      <el-input
        v-model="searchText"
        placeholder="搜索组件..."
        prefix-icon="Search"
        size="small"
        clearable
      />
    </div>
    
    <div class="panel-content">
      <!-- 基础字段 -->
      <div class="component-category">
        <div class="category-title">
          <el-icon><Box /></el-icon>
          基础字段
        </div>
        <div class="component-list">
          <div
            v-for="item in filteredComponents('basic')"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @click="handleClick(item)"
          >
            <div class="item-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <span class="item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 增强字段 -->
      <div class="component-category">
        <div class="category-title">
          <el-icon><Grid /></el-icon>
          增强字段
        </div>
        <div class="component-list">
          <div
            v-for="item in filteredComponents('enhanced')"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @click="handleClick(item)"
          >
            <div class="item-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <span class="item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
      
      <!-- 布局组件 -->
      <div class="component-category">
        <div class="category-title">
          <el-icon><Menu /></el-icon>
          布局组件
        </div>
        <div class="component-list">
          <div
            v-for="item in filteredComponents('layout')"
            :key="item.type"
            class="component-item"
            draggable="true"
            @dragstart="handleDragStart($event, item)"
            @click="handleClick(item)"
          >
            <div class="item-icon">
              <el-icon><component :is="item.icon" /></el-icon>
            </div>
            <span class="item-label">{{ item.label }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Box, Grid, Menu } from '@element-plus/icons-vue'
import { useFormStore } from '@/stores/formStore'
import type { FieldType, ComponentPanelItem } from '@/types/form'

// 组件面板配置 - 使用Element Plus实际存在的图标
const componentPanelItems: ComponentPanelItem[] = [
  // 基础字段
  { type: 'input', icon: 'Edit', label: '输入框', category: 'basic', defaultProps: { type: 'text' } },
  { type: 'textarea', icon: 'Edit', label: '文本域', category: 'basic', defaultProps: { rows: 3 } },
  { type: 'number', icon: 'Edit', label: '数字输入', category: 'basic', defaultProps: { step: 1 } },
  { type: 'select', icon: 'List', label: '下拉选择', category: 'basic', defaultProps: { placeholder: '请选择' } },
  { type: 'radio', icon: 'List', label: '单选框', category: 'basic', defaultProps: {} },
  { type: 'checkbox', icon: 'List', label: '复选框', category: 'basic', defaultProps: {} },
  { type: 'switch', icon: 'Switch', label: '开关', category: 'basic', defaultProps: {} },
  
  // 增强字段
  { type: 'date', icon: 'Calendar', label: '日期选择', category: 'enhanced', defaultProps: { type: 'date', format: 'YYYY-MM-DD' } },
  { type: 'time', icon: 'Clock', label: '时间选择', category: 'enhanced', defaultProps: { type: 'time', format: 'HH:mm:ss' } },
  { type: 'datetime', icon: 'Clock', label: '日期时间', category: 'enhanced', defaultProps: { type: 'datetime', format: 'YYYY-MM-DD HH:mm:ss' } },
  { type: 'cascader', icon: 'Connection', label: '级联选择', category: 'enhanced', defaultProps: { placeholder: '请选择' } },
  { type: 'upload', icon: 'Upload', label: '上传组件', category: 'enhanced', defaultProps: { action: '#', limit: 5 } },
  { type: 'rate', icon: 'Star', label: '评分', category: 'enhanced', defaultProps: { max: 5 } },
  { type: 'slider', icon: 'Switch', label: '滑块', category: 'enhanced', defaultProps: { min: 0, max: 100 } },
  { type: 'color', icon: 'Brush', label: '颜色选择', category: 'enhanced', defaultProps: { showAlpha: false } },
  { type: 'tree-select', icon: 'Grid', label: '树选择', category: 'enhanced', defaultProps: {} },
  
  // 布局组件
  { type: 'divider', icon: 'Menu', label: '分割线', category: 'layout', defaultProps: { content: '' } },
  { type: 'card', icon: 'Box', label: '卡片', category: 'layout', defaultProps: { header: '卡片标题', shadow: 'always' } },
  { type: 'collapse', icon: 'Menu', label: '折叠面板', category: 'layout', defaultProps: { accordion: false, panels: [] } }
]

// 搜索文本
const searchText = ref('')

// 获取表单Store
const formStore = useFormStore()

// 按分类过滤组件
const filteredComponents = (category: string): ComponentPanelItem[] => {
  let items = componentPanelItems.filter(item => item.category === category)
  
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    items = items.filter(item => item.label.toLowerCase().includes(keyword))
  }
  
  return items
}

// 拖拽开始
const handleDragStart = (event: DragEvent, item: ComponentPanelItem) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('fieldType', item.type)
    event.dataTransfer.setData('dragSource', 'componentPanel')
  }
  
  // 通知Store开始拖拽
  formStore.isDragging = true
  formStore.draggedItem = item
  formStore.setDraggingFromPanel(true)
}

// 点击添加组件
const handleClick = (item: ComponentPanelItem) => {
  formStore.addField(item.type as FieldType)
}

// 暴露事件
const emit = defineEmits<{
  (e: 'dragstart', event: DragEvent, fieldType: string): void
}>()
</script>

<style scoped lang="less">
.component-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
    
    h3 {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 12px 0;
    }
  }
  
  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
  }
  
  .component-category {
    margin-bottom: 20px;
    
    .category-title {
      display: flex;
      align-items: center;
      font-size: 12px;
      font-weight: 600;
      color: #909399;
      margin-bottom: 8px;
      padding-left: 4px;
      
      .el-icon {
        margin-right: 4px;
        font-size: 14px;
        color: #409eff;
      }
    }
    
    .component-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    
    .component-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px 8px;
      background: #f5f7fa;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      cursor: grab;
      transition: all 0.2s;
      
      &:hover {
        background: #ecf5ff;
        border-color: #409eff;
        transform: translateY(-2px);
        box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
      }
      
      &:active {
        cursor: grabbing;
      }
      
      .item-icon {
        font-size: 20px;
        color: #409eff;
        margin-bottom: 6px;
        
        .el-icon {
          font-size: 20px;
        }
      }
      
      .item-label {
        font-size: 12px;
        color: #606266;
      }
    }
  }
}
</style>
