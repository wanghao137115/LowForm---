// 表单设计器主页面
<template>
  <div class="form-designer">
    <!-- 顶部工具栏 -->
    <div class="designer-header">
      <div class="header-left">
        <h1>LowForm</h1>
        <span class="version">v1.0.0</span>
      </div>
      <div class="header-center">
        <el-button-group>
          <el-button 
            type="primary" 
            :class="{ active: currentMode === 'design' }"
            @click="currentMode = 'design'"
          >
            <el-icon><Edit /></el-icon>
            设计模式
          </el-button>
          <el-button 
            :type="currentMode === 'preview' ? 'primary' : 'default'"
            @click="currentMode = 'preview'"
          >
            <el-icon><View /></el-icon>
            预览模式
          </el-button>
        </el-button-group>
      </div>
      <div class="header-right">
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon>
          导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出JSON
        </el-button>
        <el-button type="primary" @click="handleSave">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
        <el-button type="success" @click="handlePreview">
          <el-icon><Monitor /></el-icon>
          预览表单
        </el-button>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="designer-body">
      <!-- 左侧组件面板 -->
      <div class="component-panel" :style="{ width: panelWidth.left + 'px' }">
        <ComponentPanel @dragstart="handleDragStart" />
      </div>

      <!-- 左侧面板调整手柄 -->
      <div 
        class="resize-handle horizontal"
        @mousedown="startResize('left', $event)"
      ></div>

      <!-- 中间画布区域 -->
      <div class="canvas-area" ref="canvasArea">
        <FormCanvas 
          :fields="formStore.schema.fields"
          :selected-field-id="formStore.selectedFieldId"
          @select="handleSelectField"
          @update:fields="handleUpdateFields"
          @delete="handleDeleteField"
        />
      </div>

      <!-- 右侧面板调整手柄 -->
      <div 
        class="resize-handle horizontal"
        @mousedown="startResize('right', $event)"
      ></div>

      <!-- 右侧属性面板 -->
      <div class="property-panel" :style="{ width: panelWidth.right + 'px' }">
        <PropertyPanel
          v-if="formStore.selectedField"
          :fieldId="formStore.selectedField.id"
        />
        <div v-else class="no-selection">
          <el-empty description="请选择一个组件">
            <template #image>
              <el-icon size="64" color="#909399"><Pointer /></el-icon>
            </template>
          </el-empty>
        </div>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input 
      ref="fileInput"
      type="file" 
      accept=".json"
      style="display: none"
      @change="handleFileChange"
    />

    <!-- 预览对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="表单预览"
      width="70%"
      destroy-on-close
    >
      <FormPreview :schema="formStore.schema" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, View, Upload, Download, Check, Monitor, Pointer 
} from '@element-plus/icons-vue'
import ComponentPanel from '@/components/form-designer/ComponentPanel.vue'
import FormCanvas from '@/components/form-designer/FormCanvas.vue'
import PropertyPanel from '@/components/form-designer/PropertyPanel.vue'
import FormPreview from '@/components/form-designer/FormPreview.vue'
import { useFormStore } from '@/stores/formStore'
import { exportSchema, importSchema } from '@/utils/drag'
import type { FormField } from '@/types/form'

const router = useRouter()
const formStore = useFormStore()

// 响应式状态
const currentMode = ref<'design' | 'preview'>('design')
const previewVisible = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const canvasArea = ref<HTMLElement | null>(null)

const panelWidth = reactive({
  left: 280,
  right: 320
})

// 拖拽调整面板宽度
let resizing = false
let resizeTarget: 'left' | 'right' | null = null
let startX = 0
let startWidth = 0

const startResize = (target: 'left' | 'right', event: MouseEvent) => {
  resizing = true
  resizeTarget = target
  startX = event.clientX
  startWidth = panelWidth[target]
  
  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

const handleResize = (event: MouseEvent) => {
  if (!resizing || !resizeTarget) return
  
  const deltaX = event.clientX - startX
  
  if (resizeTarget === 'left') {
    panelWidth.left = Math.max(200, Math.min(400, startWidth + deltaX))
  } else {
    panelWidth.right = Math.max(250, Math.min(500, startWidth - deltaX))
  }
}

const stopResize = () => {
  resizing = false
  resizeTarget = null
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 拖拽开始
const handleDragStart = (event: DragEvent, fieldType: string) => {
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('fieldType', fieldType)
  }
}

// 选择字段
const handleSelectField = (field: FormField | null) => {
  formStore.selectField(field?.id || null)
}

// 更新字段列表
const handleUpdateFields = (fields: FormField[][]) => {
  formStore.updateFields(fields)
}

// 删除字段
const handleDeleteField = (fieldId: string) => {
  formStore.deleteField(fieldId)
}

// 导入
const handleImport = () => {
  fileInput.value?.click()
}

// 文件变化
const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  try {
    const schema = await importSchema(file)
    formStore.loadSchema(schema)
    ElMessage.success('导入成功')
  } catch (error) {
    ElMessage.error('导入失败：' + (error as Error).message)
  }
  
  target.value = ''
}

// 导出
const handleExport = () => {
  const schema = formStore.schema
  exportSchema(schema, `form-schema-${Date.now()}`)
  ElMessage.success('导出成功')
}

// 保存
const handleSave = async () => {
  try {
    // 这里可以调用API保存到后端
    const schema = formStore.schema
    localStorage.setItem('form-schema', JSON.stringify(schema))
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

// 预览
const handlePreview = () => {
  previewVisible.value = true
}

// 生命周期
onMounted(() => {
  // 尝试从本地存储恢复
  const savedSchema = localStorage.getItem('form-schema')
  if (savedSchema) {
    try {
      const schema = JSON.parse(savedSchema)
      formStore.loadSchema(schema)
    } catch (e) {
      console.error('恢复保存的表单失败')
    }
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})
</script>

<style scoped lang="less">
.form-designer {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  
  .designer-header {
    height: 56px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 100;
    
    .header-left {
      display: flex;
      align-items: center;
      
      h1 {
        font-size: 20px;
        font-weight: 600;
        color: #fff;
        margin: 0;
      }
      
      .version {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        margin-left: 8px;
        padding: 2px 8px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10px;
      }
    }
    
    .header-center {
      .el-button-group .el-button {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        &.active {
          background: #fff;
          color: #667eea;
        }
      }
    }
    
    .header-right {
      display: flex;
      gap: 12px;
      
      .el-button {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.3);
        color: #fff;
        
        &:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      }
    }
  }
  
  .designer-body {
    flex: 1;
    display: flex;
    overflow: hidden;
    
    .component-panel,
    .property-panel {
      background: #fff;
      overflow-y: auto;
      flex-shrink: 0;
    }
    
    .component-panel {
      border-right: 1px solid #e4e7ed;
    }
    
    .property-panel {
      border-left: 1px solid #e4e7ed;
    }
    
    .canvas-area {
      flex: 1;
      overflow: auto;
      padding: 20px;
      background: #e8ecf1;
    }
    
    .resize-handle {
      width: 4px;
      cursor: col-resize;
      background: transparent;
      transition: background 0.2s;
      
      &:hover {
        background: #667eea;
      }
    }
    
    .no-selection {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
