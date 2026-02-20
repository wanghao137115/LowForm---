// 表单预览页面
<template>
  <div class="form-preview-page">
    <div class="preview-header">
      <el-button @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回设计
      </el-button>
      <h2>表单预览</h2>
      <div class="header-actions">
        <el-button class="header-actions-button" type="primary" @click="handleSubmit">
          <el-icon><Check /></el-icon>
          提交表单
        </el-button>
      </div>
    </div>
    
    <div class="preview-content">
      <div class="preview-container">
        <FormRenderer 
          v-if="schema.fields.length > 0"
          :schema="schema"
          :model="formData"
          :mode="'preview'"
        />
        <el-empty v-else description="暂无表单字段" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import FormRenderer from '@/components/form-renderer/FormRenderer.vue'
import { useFormStore } from '@/stores/formStore'

const router = useRouter()
const formStore = useFormStore()

const formData = reactive<Record<string, any>>({})

// 加载schema
onMounted(() => {
  const savedSchema = localStorage.getItem('form-schema')
  if (savedSchema) {
    try {
      const schema = JSON.parse(savedSchema)
      formStore.loadSchema(schema)
    } catch (e) {
      console.error('加载表单失败')
    }
  }
})

// 返回
const goBack = () => {
  router.push('/')
}

// 提交表单
const handleSubmit = () => {
  console.log('表单数据：', formData)
  ElMessage.success('表单提交成功，请查看控制台')
}
</script>

<style scoped lang="less">
.form-preview-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  
  .preview-header {
    height: 56px;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    border-bottom: 1px solid #e4e7ed;
    
    h2 {
      font-size: 18px;
      font-weight: 500;
      color: #303133;
      margin: 0;
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
  }
  
  .preview-content {
    flex: 1;
    overflow: auto;
    padding: 24px;
    
    .preview-container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
      border-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
