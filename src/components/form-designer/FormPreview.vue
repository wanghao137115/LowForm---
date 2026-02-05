// 表单预览组件
<template>
  <div class="form-preview">
    <div class="preview-header">
      <h4>{{ schema.name || '表单预览' }}</h4>
      <p v-if="schema.description" class="description">{{ schema.description }}</p>
    </div>
    
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-position="schema.labelPosition"
      :label-width="schema.labelWidth + 'px'"
      :gutter="schema.gutter"
      :class="[`form-layout-${schema.layout}`]"
    >
      <template v-for="field in schema.fields" :key="field.id">
        <!-- 隐藏字段不渲染 -->
        <template v-if="!field.hidden">
          <!-- 布局组件 - 分割线 -->
          <el-form-item 
            v-if="field.type === 'divider'"
            :label="field.content"
            :label-width="field.content ? undefined : '0'"
            :style="{ borderType: field.borderType }"
          >
            <el-divider :content-position="field.contentPosition">
              {{ field.content }}
            </el-divider>
          </el-form-item>
          
          <!-- 布局组件 - 卡片 -->
          <el-form-item 
            v-else-if="field.type === 'card'"
            :label-width="0"
          >
            <el-card :shadow="field.shadow" :style="{ width: field.width }">
              <template #header>
                <span>{{ field.header }}</span>
              </template>
              <p>卡片内容区域</p>
            </el-card>
          </el-form-item>
          
          <!-- 布局组件 - 折叠面板 -->
          <el-form-item 
            v-else-if="field.type === 'collapse'"
            :label-width="0"
          >
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
          </el-form-item>
          
          <!-- 普通字段 -->
          <el-form-item 
            v-else
            :label="field.label"
            :prop="field.name"
            :required="field.required"
            :style="{ width: field.width }"
          >
            <!-- 输入框 -->
            <el-input
              v-if="field.type === 'input'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :maxlength="field.maxlength"
              :show-word-limit="field.showWordLimit"
              :clearable="field.clearable"
            />
            
            <!-- 文本域 -->
            <el-input
              v-else-if="field.type === 'textarea'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :rows="field.rows"
              :maxlength="field.maxlength"
              :show-word-limit="field.showWordLimit"
              type="textarea"
            />
            
            <!-- 数字输入 -->
            <el-input-number
              v-else-if="field.type === 'number'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :precision="field.precision"
              :controls="field.controls"
              style="width: 100%"
            />
            
            <!-- 下拉选择 -->
            <el-select
              v-else-if="field.type === 'select'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :multiple="field.multiple"
              :filterable="field.filterable"
              :clearable="field.clearable"
              style="width: 100%"
            >
              <el-option
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
                :disabled="opt.disabled"
              />
            </el-select>
            
            <!-- 单选框 -->
            <el-radio-group
              v-else-if="field.type === 'radio'"
              v-model="formData[field.name]"
              :disabled="field.disabled"
            >
              <el-radio
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </el-radio>
            </el-radio-group>
            
            <!-- 复选框 -->
            <el-checkbox-group
              v-else-if="field.type === 'checkbox'"
              v-model="formData[field.name]"
              :disabled="field.disabled"
            >
              <el-checkbox
                v-for="opt in field.options"
                :key="opt.value"
                :label="opt.value"
                :disabled="opt.disabled"
              >
                {{ opt.label }}
              </el-checkbox>
            </el-checkbox-group>
            
            <!-- 开关 -->
            <el-switch
              v-else-if="field.type === 'switch'"
              v-model="formData[field.name]"
              :disabled="field.disabled"
              :active-text="field.activeText"
              :inactive-text="field.inactiveText"
              :active-color="field.activeColor"
              :inactive-color="field.inactiveColor"
            />
            
            <!-- 日期选择 -->
            <el-date-picker
              v-else-if="field.type === 'date'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :type="field.type"
              :format="field.format"
              :value-format="field.valueFormat"
              :clearable="field.clearable"
              style="width: 100%"
            />
            
            <!-- 时间选择 -->
            <el-time-picker
              v-else-if="field.type === 'time'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :format="field.format"
              :value-format="field.valueFormat"
              :clearable="field.clearable"
              style="width: 100%"
            />
            
            <!-- 日期时间选择 -->
            <el-date-picker
              v-else-if="field.type === 'datetime'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              type="datetime"
              :format="field.format"
              :value-format="field.valueFormat"
              :clearable="field.clearable"
              style="width: 100%"
            />
            
            <!-- 级联选择 -->
            <el-cascader
              v-else-if="field.type === 'cascader'"
              v-model="formData[field.name]"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :options="field.options"
              :props="field.props"
              :filterable="field.filterable"
              :clearable="field.clearable"
              style="width: 100%"
            />
            
            <!-- 上传组件 -->
            <el-upload
              v-else-if="field.type === 'upload'"
              :action="field.action"
              :accept="field.accept"
              :limit="field.limit"
              :list-type="field.listType"
              :auto-upload="field.autoUpload"
              :multiple="field.multiple"
              :drag="field.drag"
              :disabled="field.disabled"
              style="width: 100%"
            >
              <el-icon><Upload /></el-icon>
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
            
            <!-- 评分 -->
            <el-rate
              v-else-if="field.type === 'rate'"
              v-model="formData[field.name]"
              :max="field.max"
              :disabled="field.disabled"
              :allow-half="field.allowHalf"
              :show-text="field.showText"
              :show-score="field.showScore"
            />
            
            <!-- 滑块 -->
            <el-slider
              v-else-if="field.type === 'slider'"
              v-model="formData[field.name]"
              :min="field.min"
              :max="field.max"
              :step="field.step"
              :range="field.range"
              :show-stops="field.showStops"
              :vertical="field.vertical"
              :disabled="field.disabled"
            />
            
            <!-- 颜色选择 -->
            <el-color-picker
              v-else-if="field.type === 'color'"
              v-model="formData[field.name]"
              :show-alpha="field.showAlpha"
              :color-format="field.colorFormat"
              :disabled="field.disabled"
            />
            
            <!-- 树选择 -->
            <el-tree-select
              v-else-if="field.type === 'tree-select'"
              v-model="formData[field.name]"
              :data="field.options"
              :multiple="field.multiple"
              :filterable="field.filterable"
              :clearable="field.clearable"
              :disabled="field.disabled"
              style="width: 100%"
            />
          </el-form-item>
        </template>
      </template>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { Upload } from '@element-plus/icons-vue'
import type { FormSchema, FormField } from '@/types/form'
import { ElMessage } from 'element-plus'

// Props
const props = defineProps<{
  schema: FormSchema
}>()

// Emits
const emit = defineEmits<{
  (e: 'submit', data: Record<string, any>): void
}>()

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive<Record<string, any>>({})

// 表单验证规则
const formRules = reactive<Record<string, any>>({})

// 初始化表单数据
const initFormData = () => {
  // 清空数据
  Object.keys(formData).forEach(key => {
    delete formData[key]
  })
  
  // 重新初始化
  props.schema.fields.forEach(field => {
    if (field.type === 'checkbox') {
      formData[field.name] = []
    } else if (field.type === 'slider' && field.range) {
      formData[field.name] = [field.min || 0, field.max || 100]
    } else {
      formData[field.name] = undefined
    }
    
    // 生成验证规则
    if (field.required) {
      formRules[field.name] = [
        { required: true, message: `请${field.type === 'select' ? '选择' : '输入'}${field.label}`, trigger: 'change' }
      ]
    }
  })
}

// 监听schema变化
watch(() => props.schema.fields, () => {
  initFormData()
}, { deep: true })

// 组件挂载
onMounted(() => {
  initFormData()
})
</script>

<style scoped lang="less">
.form-preview {
  .preview-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #ebeef5;
    
    h4 {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px;
    }
    
    .description {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }
  
  .el-form {
    .el-form-item {
      // 布局样式
    }
    
    &.form-layout-horizontal {
      .el-form-item {
        display: inline-flex;
        margin-right: 16px;
        margin-bottom: 18px;
      }
    }
    
    &.form-layout-inline {
      .el-form-item {
        display: inline-flex;
        margin-right: 16px;
        margin-bottom: 0;
      }
    }
  }
}
</style>
