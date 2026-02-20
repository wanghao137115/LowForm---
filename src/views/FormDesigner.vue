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
        <el-button-group class="ml-4">
          <el-button 
            :disabled="!formStore.canUndo"
            @click="formStore.undo()"
            title="撤销"
          >
            <el-icon><RefreshLeft /></el-icon>
          </el-button>
          <el-button 
            :disabled="!formStore.canRedo"
            @click="formStore.redo()"
            title="重做"
          >
            <el-icon><RefreshRight /></el-icon>
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
        <el-button type="warning" @click="showStressTestConfig">
          <el-icon><Lightning /></el-icon>
          压力测试
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

    <!-- 压力测试配置对话框 -->
    <el-dialog
      v-model="stressTestConfigVisible"
      title="压力测试配置"
      width="400px"
      destroy-on-close
    >
      <el-form label-position="top">
        <el-form-item label="测试规模">
          <el-radio-group v-model="stressTestConfig.fieldCount">
            <el-radio-button :value="500">500 字段</el-radio-button>
            <el-radio-button :value="1000">1000 字段</el-radio-button>
            <el-radio-button :value="1500">1500 字段</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="测试选项">
          <el-checkbox v-model="stressTestConfig.testUndo">测试撤销操作</el-checkbox>
          <el-checkbox v-model="stressTestConfig.testRedo">测试重做操作</el-checkbox>
        </el-form-item>
      </el-form>
      <div class="stress-test-info">
        <el-alert type="info" :closable="false">
          此操作将清空当前表单并生成指定数量的字段进行性能测试
        </el-alert>
      </div>
      <template #footer>
        <el-button @click="stressTestConfigVisible = false">取消</el-button>
        <el-button type="warning" @click="runStressTest">开始测试</el-button>
      </template>
    </el-dialog>

    <!-- 压力测试结果对话框 -->
    <el-dialog
      v-model="stressTestDialogVisible"
      title="压力测试结果"
      width="550px"
      destroy-on-close
    >
      <div v-if="stressTestResults" class="stress-result">
        <!-- 性能评级 -->
        <div class="performance-grade" :class="'grade-' + stressTestResults.grade">
          <div class="grade-badge">
            <span class="grade-letter">{{ stressTestResults.grade }}</span>
            <span class="grade-label">{{ stressTestResults.gradeLabel }}</span>
          </div>
          <div class="grade-score">
            性能得分: <strong>{{ stressTestResults.score }}</strong> / 100
          </div>
        </div>

        <el-divider />
        
        <el-descriptions :column="1" border size="small">
          <el-descriptions-item label="测试规模">
            {{ stressTestResults.fieldCount }} 个字段
          </el-descriptions-item>
          <el-descriptions-item label="生成行数">
            {{ stressTestResults.rowCount }} 行
          </el-descriptions-item>
          <el-descriptions-item label="添加耗时" :class="{ 'fast': stressTestResults.addRating === 'A', 'slow': stressTestResults.addRating === 'C' }">
            {{ stressTestResults.addDuration }} ms
            <el-tag size="small" :type="getRatingType(stressTestResults.addRating)">
              {{ stressTestResults.addRating }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="添加速度">
            {{ stressTestResults.addOps }} ops/s
          </el-descriptions-item>
          <el-descriptions-item label="撤销耗时">
            {{ stressTestResults.undoDuration }} ms ({{ stressTestResults.undoCount }} 次)
          </el-descriptions-item>
          <el-descriptions-item label="撤销速度">
            {{ stressTestResults.undoOps }} ops/s
          </el-descriptions-item>
          <el-descriptions-item label="重做耗时">
            {{ stressTestResults.redoDuration }} ms
          </el-descriptions-item>
          <el-descriptions-item label="重做速度">
            {{ stressTestResults.redoOps }} ops/s
          </el-descriptions-item>
          <el-descriptions-item label="总耗时">
            {{ stressTestResults.totalDuration }} ms
          </el-descriptions-item>
        </el-descriptions>

        <!-- 性能建议 -->
        <div class="performance-tips">
          <h4>💡 性能建议</h4>
          <ul>
            <li v-for="tip in stressTestResults.tips" :key="tip">{{ tip }}</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="stressTestDialogVisible = false">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Edit, View, Upload, Download, Check, Monitor, Pointer, RefreshLeft, RefreshRight, Lightning
} from '@element-plus/icons-vue'
import ComponentPanel from '@/components/form-designer/ComponentPanel.vue'
import FormCanvas from '@/components/form-designer/FormCanvas.vue'
import PropertyPanel from '@/components/form-designer/PropertyPanel.vue'
// FormPreview 懒加载：使用异步组件延迟加载，提升初始渲染性能
import { defineAsyncComponent } from 'vue'
const FormPreview = defineAsyncComponent(() => 
  import('@/components/form-designer/FormPreview.vue')
)
import { useFormStore } from '@/stores/formStore'
import { exportSchema, importSchema } from '@/utils/drag'
import type { FormField } from '@/types/form'

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

// 压力测试
const stressTestLoading = ref(false)
const stressTestResults = ref<any>(null)
const stressTestDialogVisible = ref(false)
const stressTestConfigVisible = ref(false)
const stressTestConfig = ref({
  fieldCount: 1000,
  testUndo: true,
  testRedo: true
})

// 性能评级计算
const calculatePerformanceGrade = (fieldCount: number, addDuration: number, addOps: number, undoOps: number, redoOps: number) => {
  let score = 100
  const tips: string[] = []
  
  // 根据字段数量评估
  const baseTime = fieldCount * 0.5 // 基础期望时间（ms/字段）
  
  // 添加操作评分
  let addRating = 'A'
  if (addDuration > baseTime * fieldCount * 0.5) {
    score -= 30
    addRating = 'C'
    tips.push('添加字段性能较差，建议减少单行字段数量')
  } else if (addDuration > baseTime * fieldCount * 0.2) {
    score -= 15
    addRating = 'B'
  } else {
    tips.push('✅ 添加字段性能优秀')
  }
  
  // 撤销操作评分
  if (undoOps < 1000) {
    score -= 20
    tips.push('撤销操作较慢，可能是状态管理开销较大')
  } else if (undoOps < 5000) {
    score -= 10
  } else {
    tips.push('✅ 撤销操作性能良好')
  }
  
  // 重做操作评分
  if (redoOps < 1000) {
    score -= 20
    tips.push('重做操作较慢，可能是状态管理开销较大')
  } else if (redoOps < 5000) {
    score -= 10
  } else {
    tips.push('✅ 重做操作性能良好')
  }
  
  // 内存相关建议
  if (fieldCount >= 1000) {
    if (addDuration > 1000) {
      tips.push('💾 大量字段时建议使用虚拟滚动优化渲染性能')
    }
  }
  
  // 限制分数范围
  score = Math.max(0, Math.min(100, score))
  
  // 评级
  let grade: string
  let gradeLabel: string
  
  if (score >= 90) {
    grade = 'A'
    gradeLabel = '卓越'
  } else if (score >= 75) {
    grade = 'B'
    gradeLabel = '优秀'
  } else if (score >= 60) {
    grade = 'C'
    gradeLabel = '一般'
  } else if (score >= 40) {
    grade = 'D'
    gradeLabel = '较差'
  } else {
    grade = 'E'
    gradeLabel = '极差'
  }
  
  return { score, grade, gradeLabel, addRating, tips }
}

const getRatingType = (rating: string) => {
  switch (rating) {
    case 'A': return 'success'
    case 'B': return 'primary'
    case 'C': return 'warning'
    default: return 'info'
  }
}

// 显示测试配置对话框
const showStressTestConfig = () => {
  stressTestConfigVisible.value = true
}

// 执行压力测试
const runStressTest = async () => {
  stressTestConfigVisible.value = false
  const { fieldCount, testUndo, testRedo } = stressTestConfig.value
  
  try {
    stressTestLoading.value = true
    
    // 清空当前表单
    formStore.clearForm()
    
    const fieldTypes: ('input' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'switch' | 'date' | 'number')[] = 
      ['input', 'textarea', 'select', 'radio', 'checkbox', 'switch', 'date', 'number']
    
    // 开始计时
    const startTime = performance.now()
    
    // 批量添加字段
    for (let i = 0; i < fieldCount; i++) {
      const fieldType = fieldTypes[i % fieldTypes.length]
      formStore.addField(fieldType, { label: `测试字段${i}` })
    }
    
    const addDuration = performance.now() - startTime
    const fieldsCount = formStore.schema.fields.flat().length
    const rowsCount = formStore.schema.fields.length
    
    let undoCount = 0
    let undoDuration = 0
    let undoOps = 0
    let redoDuration = 0
    let redoOps = 0
    
    // 测试撤销操作
    if (testUndo) {
      const undoStartTime = performance.now()
      undoCount = Math.min(100, fieldsCount)
      for (let i = 0; i < undoCount; i++) {
        formStore.undo()
      }
      undoDuration = performance.now() - undoStartTime
      undoOps = undoCount > 0 ? Math.round(undoCount / (undoDuration / 1000)) : 0
    }
    
    // 测试重做操作
    if (testRedo) {
      const redoStartTime = performance.now()
      for (let i = 0; i < undoCount; i++) {
        formStore.redo()
      }
      redoDuration = performance.now() - redoStartTime
      redoOps = undoCount > 0 ? Math.round(undoCount / (redoDuration / 1000)) : 0
    }
    
    const totalDuration = performance.now() - startTime
    
    const addOps = Math.round(fieldCount / (addDuration / 1000))
    
    // 计算性能评级
    const { score, grade, gradeLabel, addRating, tips } = calculatePerformanceGrade(
      fieldCount, addDuration, addOps, undoOps, redoOps
    )
    
    // 显示结果
    stressTestResults.value = {
      fieldCount: fieldsCount,
      rowCount: rowsCount,
      addDuration: addDuration.toFixed(2),
      addOps: addOps.toLocaleString(),
      addRating,
      undoCount,
      undoDuration: undoDuration.toFixed(2),
      undoOps: undoOps.toLocaleString(),
      redoDuration: redoDuration.toFixed(2),
      redoOps: redoOps.toLocaleString(),
      totalDuration: totalDuration.toFixed(2),
      score,
      grade,
      gradeLabel,
      tips
    }
    
    ElMessage.success('压力测试完成！')
    stressTestDialogVisible.value = true
  } catch (error) {
    ElMessage.error('压力测试失败')
  } finally {
    stressTestLoading.value = false
  }
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
      .ml-4 {
        margin-left: 16px;
      }
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

.stress-result {
  .el-descriptions {
    font-size: 14px;
  }
  
  .el-descriptions-item__label {
    font-weight: 600;
    width: 120px;
  }
  
  .fast {
    color: #67c23a;
    font-weight: 600;
  }
  
  .slow {
    color: #f56c6c;
    font-weight: 600;
  }
}

.stress-test-info {
  margin-top: 16px;
}

// 性能评级样式
.performance-grade {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  
  &.grade-A {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
    color: white;
  }
  
  &.grade-B {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
    color: white;
  }
  
  &.grade-C {
    background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
    color: white;
  }
  
  &.grade-D {
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
    color: white;
  }
  
  &.grade-E {
    background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
    color: white;
  }
  
  .grade-badge {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    
    .grade-letter {
      font-size: 48px;
      font-weight: bold;
      width: 60px;
      height: 60px;
      line-height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
    }
    
    .grade-label {
      font-size: 24px;
      font-weight: 600;
    }
  }
  
  .grade-score {
    margin-top: 12px;
    font-size: 16px;
    
    strong {
      font-size: 20px;
    }
  }
}

.performance-tips {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #303133;
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: 13px;
      color: #606266;
      line-height: 1.8;
    }
  }
}
</style>
