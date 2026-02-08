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
              <div 
                class="field-preview"
                @dragover.prevent
              >
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

// 悬浮状态：记录当前悬浮在哪个元素上
const dragOverInfo = ref<{
  type: 'row' | 'field'
  rowIndex: number
  colIndex?: number
  position?: 'top' | 'bottom' | 'left' | 'right'
} | null>(null)

// 当前悬浮的行索引（用于行高亮）
const dragOverRowIndex = computed(() => {
  return dragOverInfo.value ? dragOverInfo.value.rowIndex : null
})

// 获取字段样式
const getFieldStyle = (field: FormField) => {
  const span = field.span || 6
  return {
    flex: `0 0 ${(span / 24) * 100}%`,
    maxWidth: `${(span / 24) * 100}%`
  }
}

// 重新计算行的 span
const recalculateRowSpans = (rowIndex: number) => {
  const row = schema.value.fields[rowIndex]
  if (!row || row.length === 0) return
  
  const newCount = row.length
  const newSpan = Math.floor(24 / newCount)
  row.forEach((f, idx) => {
    f.span = idx === newCount - 1 ? 24 - newSpan * (newCount - 1) : newSpan
  })
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
  draggingField.value = { field, fromRowIndex: rowIndex, fromColIndex: colIndex }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    // 设置拖拽数据
    event.dataTransfer.setData('text/plain', field.id)
  }
}

// 字段拖拽结束
const handleFieldDragEnd = () => {
  draggingField.value = null
  dragOverInfo.value = null
}

// 键盘快捷键处理
const handleKeyDown = (event: KeyboardEvent) => {
  // Ctrl+Z 撤销
  if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
    event.preventDefault()
    formStore.undo()
    return
  }
  
  // Ctrl+Y 重做
  if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
    event.preventDefault()
    formStore.redo()
    return
  }
}

// 全局拖拽结束处理
const handleGlobalDragEnd = () => {

  formStore.resetDragState()
  draggingField.value = null
  dragOverInfo.value = null
}

// 行拖拽经过 - 悬浮到行上
const handleRowDragOver = (event: DragEvent, rowIndex: number) => {
  event.preventDefault()

  // 必须设置 dropEffect 才能触发 drop 事件
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  // 如果已经悬浮在字段上，不覆盖 dragOverInfo（防止行事件覆盖字段事件）
  if (dragOverInfo.value?.type === 'field') {
    return
  }

  // 打印悬浮在行上
  console.log(`[悬浮行] 行索引: ${rowIndex}`)

  // 记录悬浮在行上
  dragOverInfo.value = { type: 'row', rowIndex }

}

// 行拖拽离开
const handleRowDragLeave = () => {
  // 不立即清除，因为可能移动到了子元素
}

// 行放置
const handleRowDrop = (event: DragEvent, rowIndex: number) => {
  event.preventDefault()
  // 不阻止冒泡，让事件继续冒泡到画布容器统一处理
  // 这里只更新悬浮状态，实际处理逻辑在画布容器的 handleDrop 中

  // 如果已经悬浮在字段上，不更新为行悬浮（防止行事件覆盖字段事件）
  if (dragOverInfo.value?.type === 'field') {
    return
  }

  // 确保 dragOverInfo 记录的是当前行
  dragOverInfo.value = { type: 'row', rowIndex }
}

// 字段拖拽经过 - 悬浮到字段上，计算具体位置
const handleFieldDragOver = (event: DragEvent, field: FormField, rowIndex: number, colIndex: number) => {
  event.preventDefault()

  // 必须设置 dropEffect 才能触发 drop 事件
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }

  // 如果是自己拖自己，跳过
  if (draggingField.value?.field.id === field.id) return
  
  // 计算相对于字段的位置
  // 使用 currentTarget 获取绑定事件的元素（.field-item），确保获取的是正确的元素边界
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  const width = rect.width
  const height = rect.height
  
  const centerX = width / 2
  const centerY = height / 2
  
  let position: 'top' | 'bottom' | 'left' | 'right' = 'right'
  
  // 扩大 left 判断范围：左侧 35% 区域判定为 left
  if (y < centerY * 0.35) {
    position = 'top'
  } else if (y > centerY * 1.65) {
    position = 'bottom'
  } else if (x < centerX) {
    position = 'left'
  } else {
    position = 'right'
  }
  
  // 打印被悬浮块的二维坐标和位置
  console.log(`[悬浮表单块] 坐标: [${rowIndex}, ${colIndex}], 位置: ${position}`)
  
  // 记录悬浮在字段上
  dragOverInfo.value = { type: 'field', rowIndex, colIndex, position }
}

// 字段拖拽离开
const handleFieldDragLeave = () => {
  // 不立即清除
}

// 字段放置
const handleFieldDrop = (event: DragEvent, field: FormField, rowIndex: number, colIndex: number) => {
  event.preventDefault()
  // 阻止冒泡，避免触发 handleRowDrop 和 handleDrop
  event.stopPropagation()

  // 如果是从组件面板拖拽过来的，处理添加到指定位置
  // 优先判断这个，因为可能是 handleGlobalDrop 先清空了 draggingField.value
  if (formStore.isDraggingFromPanel) {
    const fieldType = event.dataTransfer?.getData('fieldType')

    if (fieldType) {
      // 根据悬浮位置计算插入位置
      const info = dragOverInfo.value
      let targetRowIndex = rowIndex
      let targetColIndex = colIndex
      console.log(dragOverInfo.value)
      if (info?.position) {
        switch (info.position) {
          case 'top':
            if (rowIndex > 0) {
              targetRowIndex = rowIndex - 1
              targetColIndex = schema.value.fields[targetRowIndex]?.length || 0
            } else {
              targetColIndex = 0
            }
            break
          case 'bottom':
            targetRowIndex = rowIndex
            targetColIndex = schema.value.fields[rowIndex]?.length || 0
            break
          case 'left':
            targetColIndex = colIndex
            break
          case 'right':
            targetColIndex = colIndex + 1
            break
        }
      }

      console.log('从组件面板添加:', targetRowIndex, targetColIndex)
      const newField = formStore.addField(fieldType as FieldType, undefined, targetRowIndex, targetColIndex)
      // 确保选中刚添加的字段
      formStore.selectField(newField.id)
    }
    // 重置状态
    formStore.setDraggingFromPanel(false)
    formStore.setDraggingOverForm(false)
    draggingField.value = null
    dragOverInfo.value = null
    return
  }

  // 检查是否正在拖拽表单内字段
  if (!draggingField.value) {
    return
  }

  // 检查是否是自己拖自己
  if (draggingField.value.field.id === field.id) {
    return
  }

  const { fromRowIndex, fromColIndex } = draggingField.value

  // 根据悬浮状态计算目标位置
  let targetRowIndex = rowIndex
  let targetColIndex = colIndex

  const info = dragOverInfo.value
  if (info?.type === 'field' && info.position) {
    switch (info.position) {
      case 'top':
        if (rowIndex > 0) {
          targetRowIndex = rowIndex - 1
          targetColIndex = schema.value.fields[targetRowIndex].length
        }
        break
      case 'bottom':
        targetRowIndex = rowIndex
        targetColIndex = schema.value.fields[rowIndex].length
        break
      case 'left':
        targetRowIndex = rowIndex
        targetColIndex = colIndex
        break
      case 'right':
        targetRowIndex = rowIndex
        targetColIndex = colIndex + 1
        break
    }
  }

  // 执行移动
  formStore.moveField(fromRowIndex, fromColIndex, targetRowIndex, targetColIndex)

  // 重置状态
  draggingField.value = null
  dragOverInfo.value = null
}

// 显示插入指示器
const showInsertIndicator = (rowIndex: number, colIndex: number, position?: string) => {
  const info = dragOverInfo.value
  if (!info || info.type !== 'field') return false
  if (info.rowIndex !== rowIndex) return false
  
  if (position) {
    return info.colIndex === colIndex && info.position === position
  }
  return info.colIndex === colIndex
}

// 插入指示器拖拽经过
const handleInsertDragOver = (rowIndex: number, colIndex: number, position: 'left' | 'right' | 'top' | 'bottom') => {
  dragOverInfo.value = { type: 'field', rowIndex, colIndex, position }
}

// 插入指示器拖拽离开
const handleInsertDragLeave = () => {
  // 延迟清除
}

// 插入指示器放置
const handleInsertDrop = (rowIndex: number, colIndex: number) => {
  // 阻止冒泡
  // 注意：这里不能直接访问 event，所以通过事件委托不会触发到这里
  // 但为了安全，如果将来有其他事件冒泡到这里，至少检查状态
  if (!draggingField.value) return
  
  const { fromRowIndex, fromColIndex } = draggingField.value
  
  // 移动字段
  formStore.moveField(fromRowIndex, fromColIndex, rowIndex, colIndex)
  
  draggingField.value = null
  dragOverInfo.value = null
}

// 显示插入行指示器
const showInsertRowIndicator = computed(() => {
  return dragOverInfo.value?.type === 'row' && fieldRows.value.length > 0
})

// 插入行拖拽经过
const handleInsertRowDragOver = () => {
  // 记录悬浮在新行位置
  dragOverInfo.value = { type: 'row', rowIndex: fieldRows.value.length }
}

// 插入行放置
const handleInsertRowDrop = () => {
  if (!draggingField.value) return
  
  const { fromRowIndex, fromColIndex } = draggingField.value
  const targetRowIndex = fieldRows.value.length
  
  // 移动到新行
  formStore.moveField(fromRowIndex, fromColIndex, targetRowIndex, 0)
  
  draggingField.value = null
  dragOverInfo.value = null
}

// 拖拽经过
const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  if (event.dataTransfer) {
    // 根据拖拽来源设置不同的 dropEffect
    if (draggingField.value) {
      event.dataTransfer.dropEffect = 'move'
    } else {
      event.dataTransfer.dropEffect = 'copy'
    }
  }

}

// 拖拽离开
const handleDragLeave = () => {

}

// 统一的 drop 处理逻辑
const processDrop = (event: DragEvent): boolean => {
  const fieldType = event.dataTransfer?.getData('fieldType')
  const dragSource = event.dataTransfer?.getData('dragSource')
  
  // 处理从组件面板拖拽新字段的情况
  if (dragSource === 'componentPanel' && fieldType) {
    const info = dragOverInfo.value
    
    if (info) {
      if (info.type === 'row') {
        // 悬浮在某一行上，添加到该行末尾
        formStore.addField(fieldType as FieldType, undefined, info.rowIndex)
      } else if (info.type === 'field' && info.position) {
        // 悬浮在某个字段上，根据方位计算插入位置
        const { rowIndex, colIndex, position } = info
        
        switch (position) {
          case 'top':
            // 插入到上一行末尾
            if (rowIndex > 0) {
              formStore.addField(fieldType as FieldType, undefined, rowIndex - 1)
            } else {
              // 第一行顶部，插入到当前行开头
              formStore.addField(fieldType as FieldType, undefined, rowIndex, 0)
            }
            break
          case 'bottom':
            // 插入到当前行末尾
            formStore.addField(fieldType as FieldType, undefined, rowIndex)
            break
          case 'left':
            // 插入到当前字段前面
            formStore.addField(fieldType as FieldType, undefined, rowIndex, colIndex)
            break
          case 'right':
            // 插入到当前字段后面
            formStore.addField(fieldType as FieldType, undefined, rowIndex, colIndex + 1)
            break
        }
      }
    } else {
      // 没有悬浮信息，默认添加到第一行
      formStore.addField(fieldType as FieldType)
    }
    
    formStore.setDraggingFromPanel(false)
    formStore.setDraggingOverForm(false)
    return true
  }
  
  // 处理表单内字段拖拽移动的情况
  if (draggingField.value) {
    const { fromRowIndex, fromColIndex } = draggingField.value
    
    // 根据悬浮状态计算目标位置
    let targetRowIndex = fromRowIndex
    let targetColIndex = fromColIndex
    const info = dragOverInfo.value
    
    if (!info) {
      // 没有悬浮信息，兜底：移动到最后一行末尾
      targetRowIndex = fieldRows.value.length > 0 ? fieldRows.value.length - 1 : 0
      targetColIndex = schema.value.fields[targetRowIndex]?.length || 0
    } else if (info.type === 'row') {
      // 悬浮在某一行上：移动到该行末尾
      targetRowIndex = info.rowIndex
      targetColIndex = schema.value.fields[targetRowIndex]?.length || 0
    } else if (info.type === 'field' && info.position) {
      // 悬浮在某个字段上，根据方位计算
      targetRowIndex = info.rowIndex
      targetColIndex = info.colIndex ?? 0
      
      switch (info.position) {
        case 'top':
          // 插入到上一行末尾
          if (info.rowIndex > 0) {
            targetRowIndex = info.rowIndex - 1
            targetColIndex = schema.value.fields[targetRowIndex]?.length || 0
          }
          break
        case 'bottom':
          // 插入到当前行末尾
          targetRowIndex = info.rowIndex
          targetColIndex = schema.value.fields[targetRowIndex]?.length || 0
          break
        case 'left':
          // 插入到当前字段前面
          targetRowIndex = info.rowIndex
          targetColIndex = info.colIndex ?? 0
          break
        case 'right':
          // 插入到当前字段后面
          targetRowIndex = info.rowIndex
          targetColIndex = (info.colIndex ?? 0) + 1
          break
      }
    }

    // 执行移动
    if (fromRowIndex !== targetRowIndex || fromColIndex !== targetColIndex) {
      formStore.moveField(fromRowIndex, fromColIndex, targetRowIndex, targetColIndex)
    }
    
    // 重置状态
    draggingField.value = null
    dragOverInfo.value = null
    return true
  }
  
  return false
}

// 放置处理
const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  const handled = processDrop(event)
  // 不阻止冒泡，让 handleGlobalDrop 也能触发（用于调试和后备处理）
  // 但 handleGlobalDrop 会检查状态，避免重复处理
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

// 全局拖拽放置处理（后备方案 - 当画布容器没有处理时触发）
const handleGlobalDrop = (event: DragEvent) => {
  // 检查是否在画布区域内
  const canvasContent = document.querySelector('.canvas-content')
  if (!canvasContent?.contains(event.target as Node)) {
    draggingField.value = null
    dragOverInfo.value = null
    formStore.resetDragState()
    return
  }

  // 如果事件已经在画布容器处理过了（draggingField 已被清空），这里就不重复处理

  // 只有在画布容器没有处理的情况下才处理（比如事件被其他元素拦截了）
  if (draggingField.value || formStore.isDraggingFromPanel) {
    event.preventDefault()
    const handled = processDrop(event)
    if (handled) {
      formStore.resetDragState()
    }
  }
}

// 组件挂载
onMounted(() => {
  // 添加全局拖拽结束监听，处理拖拽到窗口外的情况
  document.addEventListener('dragend', handleGlobalDragEnd)
  // 添加全局 drop 监听器作为后备
  document.addEventListener('drop', handleGlobalDrop)
  // 添加键盘快捷键监听
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 移除全局拖拽结束监听
  document.removeEventListener('dragend', handleGlobalDragEnd)
  // 移除全局 drop 监听器
  document.removeEventListener('drop', handleGlobalDrop)
  // 移除键盘快捷键监听
  document.removeEventListener('keydown', handleKeyDown)
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
        pointer-events: auto;
      }

      // 确保 FieldRenderer 内部的元素可以接收拖拽事件
      :deep(.field-renderer) {
        pointer-events: auto;
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
