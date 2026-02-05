// 表单画布 - 中间拖拽放置区域
<template>
  <div class="form-canvas" ref="canvasRef">
    <!-- 画布头部 -->
    <div class="canvas-header">
      <div class="canvas-title">
        <span class="title-text">{{ schema.name || '未命名表单' }}</span>
        <el-tag size="small" type="info">{{ totalFieldCount }} 个字段</el-tag>
      </div>
      <div class="canvas-actions">
        <el-button size="small" @click="handleClear">
          <el-icon><Delete /></el-icon>
          清空
        </el-button>
      </div>
    </div>
    
    <!-- 画布内容 -->
    <div 
      class="canvas-content"
      :class="{ 'is-empty': fieldRows.length === 0 }"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <!-- 空状态提示 -->
      <div v-if="fieldRows.length === 0" class="empty-tip">
        <el-icon size="48" color="#C0C4CC"><Upload /></el-icon>
        <p>从左侧拖拽组件到此处</p>
        <p class="tip-hint">或者点击组件直接添加</p>
      </div>
      
      <!-- 字段行列表 -->
      <template v-else>
        <div
          v-for="(row, rowIndex) in fieldRows"
          :key="rowIndex"
          class="field-row"
          :class="{ 'is-drag-over': dragOverRowIndex === rowIndex }"
          @dragover="handleRowDragOver($event, rowIndex)"
          @dragleave="handleRowDragLeave"
          @drop="handleRowDrop($event, rowIndex)"
        >
          <!-- 左侧插入指示器 -->
          <div 
            v-if="showInsertIndicator(rowIndex, -1)"
            class="insert-indicator left"
            @dragover.prevent="handleInsertDragOver(rowIndex, -1, 'left')"
            @dragleave="handleInsertDragLeave"
            @drop="handleInsertDrop(rowIndex, -1)"
          >
            <div class="indicator-line"></div>
            <div class="indicator-dot"></div>
          </div>
          
          <!-- 字段列表 -->
          <div class="row-fields">
            <div
              v-for="(field, colIndex) in row"
              :key="field.id"
              class="field-item"
              :class="{ 
                'is-selected': field.id === selectedFieldId,
                'is-hidden': field.hidden,
                'is-dragging': isDraggingField(field.id)
              }"
              :style="getFieldStyle(field)"
              draggable="true"
              @click.stop="handleSelect(field)"
              @dragstart="handleFieldDragStart($event, field, rowIndex, colIndex)"
              @dragend="handleFieldDragEnd"
              @dragover="handleFieldDragOver($event, field, rowIndex, colIndex)"
              @dragleave="handleFieldDragLeave"
              @drop="handleFieldDrop($event, field, rowIndex, colIndex)"
            >
              <!-- 字段操作栏（悬浮显示） -->
              <div class="field-actions" v-if="field.id === selectedFieldId">
                <el-button 
                  size="small" 
                  circle 
                  class="action-btn"
                  title="复制"
                  @click.stop="handleDuplicate(field)"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <el-button 
                  size="small" 
                  circle 
                  type="danger"
                  class="action-btn"
                  title="删除"
                  @click.stop="handleDelete(field)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              
              <!-- 字段预览 -->
              <div class="field-preview">
                <FieldRenderer
                  :field="field"
                  :mode="'design'"
                />
              </div>
              
              <!-- 顶部插入指示器 -->
              <div 
                v-if="showInsertIndicator(rowIndex, colIndex, 'top')"
                class="insert-indicator top"
                @dragover.prevent="handleInsertDragOver(rowIndex, colIndex, 'top')"
                @dragleave="handleInsertDragLeave"
                @drop="handleInsertDrop(rowIndex, colIndex)"
              >
                <div class="indicator-line"></div>
              </div>
              
              <!-- 右侧插入指示器 -->
              <div 
                v-if="showInsertIndicator(rowIndex, colIndex, 'right')"
                class="insert-indicator right"
                @dragover.prevent="handleInsertDragOver(rowIndex, colIndex, 'right')"
                @dragleave="handleInsertDragLeave"
                @drop="handleInsertDrop(rowIndex, colIndex)"
              >
                <div class="indicator-line"></div>
                <div class="indicator-dot"></div>
              </div>
              
              <!-- 底部插入指示器 -->
              <div 
                v-if="showInsertIndicator(rowIndex, colIndex, 'bottom')"
                class="insert-indicator bottom"
                @dragover.prevent="handleInsertDragOver(rowIndex, colIndex, 'bottom')"
                @dragleave="handleInsertDragLeave"
                @drop="handleInsertDrop(rowIndex, colIndex)"
              >
                <div class="indicator-line"></div>
              </div>
            </div>
          </div>
          
          <!-- 右侧插入指示器 -->
          <div 
            v-if="showInsertIndicator(rowIndex, row.length, 'right')"
            class="insert-indicator right"
            @dragover.prevent="handleInsertDragOver(rowIndex, row.length, 'right')"
            @dragleave="handleInsertDragLeave"
            @drop="handleInsertDrop(rowIndex, row.length)"
          >
            <div class="indicator-line"></div>
            <div class="indicator-dot"></div>
          </div>
        </div>
        
        <!-- 底部插入行指示器 -->
        <div 
          v-if="showInsertRowIndicator"
          class="insert-row-indicator"
          @dragover.prevent="handleInsertRowDragOver"
          @drop="handleInsertRowDrop"
        >
          <div class="indicator-line"></div>
          <span class="indicator-text">拖拽到此处添加新行</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Upload, Delete, Rank, CopyDocument, Top, Bottom 
} from '@element-plus/icons-vue'
import { useFormStore } from '@/stores/formStore'
import type { FormField, FieldType } from '@/types/form'

// 直接导入组件
import FieldRenderer from '@/components/form-renderer/FieldRenderer.vue'

// Props
const props = defineProps<{
  fields: FormField[][]
  selectedFieldId: string | null
}>()

// Emits
const emit = defineEmits<{
  (e: 'select', field: FormField | null): void
  (e: 'update:fields', fields: FormField[][]): void
  (e: 'drop', event: DragEvent): void
  (e: 'delete', fieldId: string): void
}>()

// Store
const formStore = useFormStore()

// Schema
const schema = computed(() => formStore.schema)

// 字段行数据
const fieldRows = computed(() => schema.value.fields || [])

// 总字段数
const totalFieldCount = computed(() => {
  return fieldRows.value.reduce((sum, row) => sum + row.length, 0)
})

// 拖拽状态
const draggingField = ref<{
  field: FormField
  fromRowIndex: number
  fromColIndex: number
} | null>(null)

const dragOverRowIndex = ref<number | null>(null)
const insertPosition = ref<{
  rowIndex: number
  colIndex: number
  position: 'left' | 'right' | 'top' | 'bottom'
} | null>(null)

// 获取字段样式
const getFieldStyle = (field: FormField) => {
  const span = field.span || 6
  return {
    flex: `0 0 ${(span / 24) * 100}%`,
    maxWidth: `${(span / 24) * 100}%`
  }
}

// 判断字段是否正在拖拽
const isDraggingField = (fieldId: string) => {
  return draggingField.value?.field.id === fieldId
}

// 选择字段
const handleSelect = (field: FormField) => {
  emit('select', field)
}

// 从左侧面板拖拽开始
const handleDragStart = (event: DragEvent, item: any) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('fieldType', item.type)
    event.dataTransfer.setData('dragSource', 'componentPanel')
  }
  formStore.isDragging = true
  formStore.draggedItem = item
}

// 字段拖拽开始
const handleFieldDragStart = (event: DragEvent, field: FormField, rowIndex: number, colIndex: number) => {
  event.stopPropagation()
  draggingField.value = { field, fromRowIndex: rowIndex, fromColIndex: colIndex }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('dragSource', 'canvasField')
    event.dataTransfer.setData('fieldId', field.id)
  }
}

// 字段拖拽结束
const handleFieldDragEnd = () => {
  draggingField.value = null
  dragOverRowIndex.value = null
  insertPosition.value = null
  formStore.setDragPreview(null)
}

// 全局拖拽结束处理
const handleGlobalDragEnd = () => {
  // 重置所有拖拽状态
  formStore.resetDragState()
  draggingField.value = null
  dragOverRowIndex.value = null
  insertPosition.value = null
}

// 行拖拽经过
const handleRowDragOver = (event: DragEvent, rowIndex: number) => {
  event.preventDefault()
  // 从组件面板拖拽进入表单区域
  if (formStore.isDraggingFromPanel) {
    formStore.setDraggingOverForm(true)
  }
  dragOverRowIndex.value = rowIndex
}

// 行拖拽离开
const handleRowDragLeave = () => {
  // 从组件面板拖拽离开表单区域
  if (formStore.isDraggingFromPanel) {
    formStore.setDraggingOverForm(false)
  }
  // 不立即清除 dragOverRowIndex，让子元素有机会处理
}

// 行放置
const handleRowDrop = (event: DragEvent, rowIndex: number) => {
  event.preventDefault()
  event.stopPropagation()
  
  // 只处理从组件面板拖拽到表单区域的情况
  if (formStore.isDraggingFromPanel && formStore.isDraggingOverForm) {
    const fieldType = event.dataTransfer?.getData('fieldType')
    if (fieldType) {
      formStore.addField(fieldType as FieldType, undefined, rowIndex)
    }
  }
  
  // 重置拖拽状态
  formStore.setDraggingFromPanel(false)
  formStore.setDraggingOverForm(false)
  dragOverRowIndex.value = null
}

// 字段拖拽经过
const handleFieldDragOver = (event: DragEvent, field: FormField, rowIndex: number, colIndex: number) => {
  event.preventDefault()
  
  // 如果是从组件面板拖拽过来的，让事件冒泡到行元素处理
  if (formStore.isDraggingFromPanel) {
    return
  }
  
  if (!draggingField.value) return
  
  // 计算拖拽位置
  const position = calculateInsertPosition(event, field)
  insertPosition.value = { rowIndex, colIndex, position }
  formStore.setDragPreview({ rowIndex, colIndex, position })
}

// 计算插入位置
const calculateInsertPosition = (event: DragEvent, field: FormField): 'left' | 'right' | 'top' | 'bottom' => {
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const width = rect.width
  const height = rect.height
  
  // 计算中心点
  const centerX = width / 2
  const centerY = height / 2
  
  // 判断位置
  const isTop = y < centerY * 0.5
  const isBottom = y > centerY * 1.5
  const isLeft = x < centerX * 0.5
  const isRight = x > centerX * 1.5
  
  if (isTop) return 'top'
  if (isBottom) return 'bottom'
  if (isLeft) return 'left'
  if (isRight) return 'right'
  return 'right'
}

// 字段拖拽离开
const handleFieldDragLeave = () => {
  // 不立即清除，让插入指示器处理
}

// 字段放置
const handleFieldDrop = (event: DragEvent, field: FormField, rowIndex: number, colIndex: number) => {
  event.preventDefault()
  
  // 如果是从组件面板拖拽过来的，不处理，让行元素处理
  if (formStore.isDraggingFromPanel) {
    return
  }
  
  event.stopPropagation()
  
  if (!draggingField.value) return
  
  const { field: draggedField, fromRowIndex, fromColIndex } = draggingField.value
  
  // 计算目标位置
  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const width = rect.width
  const height = rect.height
  
  const centerX = width / 2
  const centerY = height / 2
  
  let targetRowIndex = rowIndex
  let targetColIndex = colIndex
  
  // 判断放置方向
  if (y < centerY * 0.5) {
    // 顶部 - 插入到上一行末尾或当前行当前位置
    targetRowIndex = rowIndex
    targetColIndex = colIndex
  } else if (y > centerY * 1.5) {
    // 底部 - 插入到当前行末尾
    targetRowIndex = rowIndex
    targetColIndex = colIndex + 1
  } else if (x < centerX * 0.5) {
    // 左侧
    targetRowIndex = rowIndex
    targetColIndex = colIndex
  } else {
    // 右侧
    targetRowIndex = rowIndex
    targetColIndex = colIndex + 1
  }
  
  // 移动字段
  if (fromRowIndex === targetRowIndex) {
    // 同一行内移动
    if (fromColIndex < targetColIndex) {
      targetColIndex-- // 移除元素后索引会偏移
    }
    formStore.moveField(fromRowIndex, fromColIndex, targetRowIndex, targetColIndex)
  } else {
    // 跨行移动
    formStore.moveField(fromRowIndex, fromColIndex, targetRowIndex, targetColIndex)
  }
  
  draggingField.value = null
  insertPosition.value = null
  formStore.setDragPreview(null)
}

// 显示插入指示器
const showInsertIndicator = (rowIndex: number, colIndex: number, position?: string) => {
  if (!insertPosition.value) return false
  if (insertPosition.value.rowIndex !== rowIndex) return false
  
  if (position) {
    return insertPosition.value.colIndex === colIndex && insertPosition.value.position === position
  }
  return insertPosition.value.colIndex === colIndex
}

// 插入指示器拖拽经过
const handleInsertDragOver = (rowIndex: number, colIndex: number, position: 'left' | 'right' | 'top' | 'bottom') => {
  insertPosition.value = { rowIndex, colIndex, position }
}

// 插入指示器拖拽离开
const handleInsertDragLeave = () => {
  // 延迟清除，让用户有时间放置
}

// 插入指示器放置
const handleInsertDrop = (rowIndex: number, colIndex: number) => {
  if (!draggingField.value) return
  
  const { field, fromRowIndex, fromColIndex } = draggingField.value
  
  // 移动字段
  formStore.moveField(fromRowIndex, fromColIndex, rowIndex, colIndex)
  
  draggingField.value = null
  insertPosition.value = null
  formStore.setDragPreview(null)
}

// 显示插入行指示器
const showInsertRowIndicator = computed(() => {
  return dragOverRowIndex.value !== null && fieldRows.value.length > 0
})

// 插入行拖拽经过
const handleInsertRowDragOver = () => {
  // 可以添加视觉反馈
}

// 插入行放置
const handleInsertRowDrop = () => {
  if (!draggingField.value) return
  
  const { field, fromRowIndex, fromColIndex } = draggingField.value
  
  // 移动到新行（当前行数）
  formStore.moveField(fromRowIndex, fromColIndex, fieldRows.value.length, 0)
  
  draggingField.value = null
  dragOverRowIndex.value = null
  formStore.setDragPreview(null)
}

// 拖拽经过
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

// 拖拽离开
const handleDragLeave = () => {
  // 可以添加视觉反馈
}

// 放置处理
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  
  const fieldType = event.dataTransfer?.getData('fieldType')
  const dragSource = event.dataTransfer?.getData('dragSource')
  
  if (dragSource === 'componentPanel' && fieldType) {
    formStore.addField(fieldType as FieldType)
  }
  
  emit('drop', event)
}

// 复制字段
const handleDuplicate = (field: FormField) => {
  formStore.duplicateField(field.id)
}

// 删除字段
const handleDelete = (field: FormField) => {
  ElMessageBox.confirm(
    `确定要删除"${field.label}"吗？`,
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    formStore.deleteField(field.id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

// 清空表单
const handleClear = () => {
  if (totalFieldCount.value === 0) return
  
  ElMessageBox.confirm(
    '确定要清空所有字段吗？此操作不可恢复。',
    '清空确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    formStore.clearForm()
    ElMessage.success('清空成功')
  }).catch(() => {})
}

// 组件挂载
onMounted(() => {
  // 添加全局拖拽结束监听，处理拖拽到窗口外的情况
  document.addEventListener('dragend', handleGlobalDragEnd)
})

onUnmounted(() => {
  // 移除全局拖拽结束监听
  document.removeEventListener('dragend', handleGlobalDragEnd)
  // 同时重置所有拖拽状态
  formStore.resetDragState()
})
</script>

<style scoped lang="less">
.form-canvas {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  .canvas-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e4e7ed;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .canvas-title {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .title-text {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    
    .canvas-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .canvas-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    
    &.is-empty {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .empty-tip {
      text-align: center;
      color: #909399;
      
      p {
        margin: 12px 0 0;
        font-size: 14px;
      }
      
      .tip-hint {
        font-size: 12px;
        color: #C0C4CC;
      }
    }
  }
  
  .field-row {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;
    padding: 8px;
    border: 1px dashed transparent;
    border-radius: 4px;
    transition: all 0.2s;
    position: relative;
    
    &:hover {
      border-color: #dcdfe6;
    }
    
    &.is-drag-over {
      border-color: #409eff;
      background: rgba(64, 158, 255, 0.05);
    }
    
    .row-fields {
      display: flex;
      width: 100%;
      flex-wrap: wrap;
      margin-left: -8px;
      margin-right: -8px;
    }
    
    .field-item {
      flex: 0 0 25%;
      max-width: 25%;
      padding: 8px;
      position: relative;

      &.is-selected {
        background: rgba(64, 158, 255, 0.1);
        border-radius: 4px;
        border: 2px solid #409eff;
        
        .field-actions {
          opacity: 1;
        }
      }
      
      &.is-hidden {
        opacity: 0.5;
      }
      
      &.is-dragging {
        opacity: 0.5;
        background: #f5f7fa;
      }
      
      &:hover {
        background: rgba(64, 158, 255, 0.05);
        border-radius: 4px;
      }
      
      .field-actions {
        position: absolute;
        top: -12px;
        right: 8px;
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.2s;
        z-index: 10;
        
        .action-btn {
          transform: scale(0.85);
        }
      }
      
      .field-preview {
        background: #f5f7fa;
        border: 1px solid #e4e7ed;
        border-radius: 4px;
        padding: 12px;
        min-height: 50px;
      }
    }
    
    // 插入指示器
    .insert-indicator {
      position: absolute;
      z-index: 20;
      
      &.left {
        left: -4px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        
        .indicator-line {
          width: 4px;
          height: 40px;
          background: #409eff;
          border-radius: 2px;
        }
        
        .indicator-dot {
          width: 8px;
          height: 8px;
          background: #409eff;
          border-radius: 50%;
          margin-left: -6px;
        }
      }
      
      &.right {
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        display: flex;
        align-items: center;
        
        .indicator-line {
          width: 4px;
          height: 40px;
          background: #409eff;
          border-radius: 2px;
        }
        
        .indicator-dot {
          width: 8px;
          height: 8px;
          background: #409eff;
          border-radius: 50%;
          margin-left: -6px;
        }
      }
      
      &.top {
        top: -2px;
        left: 50%;
        transform: translateX(-50%);
        
        .indicator-line {
          width: 60%;
          height: 3px;
          background: #409eff;
          border-radius: 2px;
        }
      }
      
      &.bottom {
        bottom: -2px;
        left: 50%;
        transform: translateX(-50%);
        
        .indicator-line {
          width: 60%;
          height: 3px;
          background: #409eff;
          border-radius: 2px;
        }
      }
    }
  }
  
  .insert-row-indicator {
    margin-top: 8px;
    padding: 16px;
    border: 2px dashed #409eff;
    border-radius: 4px;
    text-align: center;
    background: rgba(64, 158, 255, 0.05);
    
    .indicator-line {
      height: 3px;
      background: linear-gradient(90deg, transparent, #409eff, transparent);
      border-radius: 2px;
      margin-bottom: 8px;
    }
    
    .indicator-text {
      color: #409eff;
      font-size: 12px;
    }
  }
}
</style>
