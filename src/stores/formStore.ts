// 表单设计器Store
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generateId, getDefaultProps } from '@/utils/drag'
import type { 
  FormField, 
  FormSchema, 
  FieldType,
  ComponentPanelItem 
} from '@/types/form'

export const useFormStore = defineStore('form', () => {
  // ========== 状态 ==========
  
  // 表单schema - 使用二维数组结构
  const schema = ref<FormSchema>({
    id: generateId(),
    name: '未命名表单',
    description: '',
    fields: [],  // 二维数组：fields[rowIndex][colIndex]
    layout: 'vertical',
    labelWidth: 100,
    labelPosition: 'top',
    gutter: 16
  })
  
  // 选中的字段ID
  const selectedFieldId = ref<string | null>(null)
  
  // 拖拽状态
  const isDragging = ref(false)
  const draggedItem = ref<ComponentPanelItem | null>(null)
  
  // 从组件面板拖拽的状态
  const isDraggingFromPanel = ref(false)
  const isDraggingOverForm = ref(false)
  
  // 拖拽预览状态
  const dragPreview = ref<{
    rowIndex: number
    colIndex: number
    position: 'left' | 'right' | 'top' | 'bottom' | null
  } | null>(null)
  
  // 历史记录（用于撤销/重做 - 添加/删除/移动记录）
  type HistoryAction = 
    | { type: 'add'; field: FormField; rowIndex: number; colIndex: number }
    | { type: 'delete'; field: FormField; rowIndex: number; colIndex: number }
    | { type: 'move'; field: FormField; fromRowIndex: number; fromColIndex: number; toRowIndex: number; toColIndex: number }
  
  const actionHistory = ref<HistoryAction[]>([])
  const actionIndex = ref(-1)
  
  // ========== 计算属性 ==========
  
  // 所有字段（扁平化，用于兼容旧代码）
  const flatFields = computed(() => {
    return schema.value.fields.flat()
  })
  
  // 行数
  const rowCount = computed(() => schema.value.fields.length)
  
  // 选中的字段
  const selectedField = computed(() => {
    if (!selectedFieldId.value) return null
    for (const row of schema.value.fields) {
      const field = row.find(f => f.id === selectedFieldId.value)
      if (field) return field
    }
    return null
  })
  
  // 是否可以撤销（基于操作历史）
  const canUndo = computed(() => actionIndex.value >= 0)
  
  // 是否可以重做（基于操作历史）
  const canRedo = computed(() => actionIndex.value < actionHistory.value.length - 1)
  
  // ========== 方法 ==========
  
  /**
   * 添加字段到指定行和列
   */
  const addField = (type: FieldType, options?: Partial<FormField>, targetRowIndex?: number, targetColIndex?: number): FormField => {
    console.log('11111')
    const name = generateFieldName(type)
    const defaultProps = getDefaultProps(type)
    
    const field: FormField = {
      id: generateId(),
      type,
      name,
      label: getDefaultLabel(type),
      placeholder: `请${type === 'select' ? '选择' : '输入'}${getDefaultLabel(type)}`,
      required: false,
      disabled: false,
      hidden: false,
      span: 6,  // 默认占6格（4个占满一行）
      ...defaultProps,
      ...options
    } as FormField
    
    // 如果是选择类组件，添加默认选项
    if (['select', 'radio', 'checkbox'].includes(type)) {
      (field as any).options = [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' }
      ]
    }

    // 如果指定了行号且该行存在
    if (targetRowIndex !== undefined && targetRowIndex >= 0 && targetRowIndex < schema.value.fields.length) {
      const targetRow = schema.value.fields[targetRowIndex]
      
      // 如果指定了列索引，插入到指定位置
      if (targetColIndex !== undefined && targetColIndex >= 0 && targetColIndex <= targetRow.length) {
        // 检查该行是否为空
        const isEmptyRow = targetRow.length === 0
        
        if (isEmptyRow) {
          // 空行，新字段占满
          field.span = 24
          schema.value.fields[targetRowIndex].push(field)
        } else {
          // 非空行，检查是否已满（4个元素）
          if (targetRow.length >= 4) {
            return field
          }
          // 插入到指定列索引位置
          targetRow.splice(targetColIndex, 0, field)
          // 重新计算 span
          const newCount = targetRow.length
          const newSpan = Math.floor(24 / newCount)
          targetRow.forEach((f, idx) => {
            f.span = idx === newCount - 1 ? 24 - newSpan * (newCount - 1) : newSpan
          })
        }
      } else {
        // 没有指定列索引，添加到行末（原有逻辑）
        // 检查该行是否为空
        const isEmptyRow = targetRow.length === 0
        
        if (isEmptyRow) {
          // 空行，新字段占满
          field.span = 24
          schema.value.fields[targetRowIndex].push(field)
        } else {
          // 非空行，检查是否已满（4个元素）
          if (targetRow.length >= 4) {
            return field
          }
          // 尝试添加到该行
          targetRow.push(field)
          const newCount = targetRow.length
          const newSpan = Math.floor(24 / newCount)
          // 重新分配 span，最后一个元素填充剩余空间
          targetRow.forEach((f, idx) => {
            f.span = idx === newCount - 1 ? 24 - newSpan * (newCount - 1) : newSpan
          })
        }
      }
      
      // 查找刚添加的字段位置并记录添加操作
        let addedRowIndex = targetRowIndex
        let addedColIndex = targetColIndex ?? targetRow.length - 1
        if (targetRow.length > 0) {
          addedColIndex = targetColIndex ?? targetRow.length - 1
        }
        recordAddAction(field, addedRowIndex, addedColIndex)
        
        selectedFieldId.value = field.id
        return field
    }
    
    // 默认添加到新行或第一行
    let addedRowIndex = 0
    let addedColIndex = 0
    
    if (schema.value.fields.length === 0) {
      field.span = 24  // 空表单，第一个字段占满
      schema.value.fields.push([field])
      addedRowIndex = 0
      addedColIndex = 0
    } else {
      // 尝试添加到第一行，如果满了就创建新行
      const firstRow = schema.value.fields[0]
      const firstRowSpan = firstRow.reduce((sum, f) => sum + (f.span || 6), 0)
      // 非空行最多4个元素，超过则创建新行
      if (firstRow.length >= 4 || firstRowSpan + (field.span || 6) > 24) {
        schema.value.fields.push([field])
        addedRowIndex = schema.value.fields.length - 1
        addedColIndex = 0
      } else {
        firstRow.push(field)
        // 重新计算该行所有元素的 span
        const newCount = firstRow.length
        const newSpan = Math.floor(24 / newCount)
        firstRow.forEach((f, idx) => {
          f.span = idx === newCount - 1 ? 24 - newSpan * (newCount - 1) : newSpan
        })
        addedRowIndex = 0
        addedColIndex = firstRow.length - 1
      }
    }
    
    // 记录添加操作
    recordAddAction(field, addedRowIndex, addedColIndex)
    
    selectedFieldId.value = field.id
    
    return field
  }
  
  // ========== 撤销/重做相关方法 ==========
  
  // 记录添加操作
  const recordAddAction = (field: FormField, rowIndex: number, colIndex: number) => {
    // 清除当前索引之后的所有记录
    actionHistory.value = actionHistory.value.slice(0, actionIndex.value + 1)
    // 添加新记录
    actionHistory.value.push({
      type: 'add',
      field: JSON.parse(JSON.stringify(field)),
      rowIndex,
      colIndex
    })
    actionIndex.value = actionHistory.value.length - 1
    console.log('[撤销记录] 添加操作:', actionIndex.value, '/', actionHistory.value.length)
  }
  
  // 记录删除操作
  const recordDeleteAction = (field: FormField, rowIndex: number, colIndex: number) => {
    // 清除当前索引之后的所有记录
    actionHistory.value = actionHistory.value.slice(0, actionIndex.value + 1)
    // 添加新记录
    actionHistory.value.push({
      type: 'delete',
      field: JSON.parse(JSON.stringify(field)),
      rowIndex,
      colIndex
    })
    actionIndex.value = actionHistory.value.length - 1
    console.log('[撤销记录] 删除操作:', actionIndex.value, '/', actionHistory.value.length)
  }
  
  // 记录移动操作
  const recordMoveAction = (field: FormField, fromRowIndex: number, fromColIndex: number, toRowIndex: number, toColIndex: number) => {
    // 清除当前索引之后的所有记录
    actionHistory.value = actionHistory.value.slice(0, actionIndex.value + 1)
    // 添加新记录
    actionHistory.value.push({
      type: 'move',
      field: JSON.parse(JSON.stringify(field)),
      fromRowIndex,
      fromColIndex,
      toRowIndex,
      toColIndex
    })
    actionIndex.value = actionHistory.value.length - 1
    console.log('[撤销记录] 移动操作:', actionIndex.value, '/', actionHistory.value.length)
  }
  
  /**
   * 更新字段
   */
  const updateField = (field: FormField): void => {
    for (const row of schema.value.fields) {
      const index = row.findIndex(f => f.id === field.id)
      if (index !== -1) {
        row[index] = field
        return
      }
    }
  }
  
  /**
   * 删除字段
   */
  const deleteField = (fieldId: string): void => {
    for (let rowIndex = 0; rowIndex < schema.value.fields.length; rowIndex++) {
      const row = schema.value.fields[rowIndex]
      const index = row.findIndex(f => f.id === fieldId)
      if (index !== -1) {
        // 保存被删除的字段，用于撤销
        const deletedField = JSON.parse(JSON.stringify(row[index]))
        
        row.splice(index, 1)
        
        // 如果该行空了，删除该行
        if (row.length === 0) {
          schema.value.fields.splice(rowIndex, 1)
        }
        
        // 如果删除的是当前选中的字段，清除选择
        if (selectedFieldId.value === fieldId) {
          selectedFieldId.value = null
        }
        
        // 记录删除操作
        recordDeleteAction(deletedField, rowIndex, index)
        return
      }
    }
  }
  
  /**
   * 移动字段
   * @param fromRowIndex 源行索引
   * @param fromColIndex 源列索引
   * @param toRowIndex 目标行索引
   * @param toColIndex 目标列索引
   */
  const moveField = (
    fromRowIndex: number,
    fromColIndex: number,
    toRowIndex: number,
    toColIndex: number
  ): void => {
    const field = schema.value.fields[fromRowIndex]?.[fromColIndex]
    console.log('[moveField] 开始执行:', {
      from: { row: fromRowIndex, col: fromColIndex },
      to: { row: toRowIndex, col: toColIndex },
      fieldLabel: field?.label
    })
    
    if (!field) {
      console.log('[moveField] 字段不存在')
      return
    }

    // 移除原位置的字段
    schema.value.fields[fromRowIndex].splice(fromColIndex, 1)
    console.log('[moveField] 移除字段后，fields:', JSON.stringify(schema.value.fields.map(r => r.map(f => f.label))))

    // 如果原行为空，删除该行
    if (schema.value.fields[fromRowIndex].length === 0) {
      schema.value.fields.splice(fromRowIndex, 1)
      console.log('[moveField] 原行为空，删除该行')
      // 调整目标行索引
      if (toRowIndex > fromRowIndex) {
        toRowIndex--
        console.log('[moveField] 调整目标行索引为:', toRowIndex)
      }
    }

    // 跨行移动时，调整目标列索引
    if (fromRowIndex !== toRowIndex) {
      // 跨行移动时，将字段添加到目标行的末尾
      toColIndex = schema.value.fields[toRowIndex]?.length || 0
      console.log('[moveField] 跨行移动，调整目标列为末尾:', toColIndex)
    } else {
      // 同行移动时，调整列索引（移除元素后，后面的元素前移）
      if (fromColIndex < toColIndex) {
        toColIndex--
        console.log('[moveField] 同行移动，调整列索引:', toColIndex)
      }
      // 确保列索引不超出范围
      toColIndex = Math.min(toColIndex, schema.value.fields[toRowIndex]?.length || 0)
    }

    // 插入到新位置
    if (toRowIndex >= schema.value.fields.length) {
      // 超过最后一行，创建新行
      schema.value.fields.push([field])
      console.log('[moveField] 超过最后一行，创建新行')
    } else {
      schema.value.fields[toRowIndex].splice(toColIndex, 0, field)
      console.log('[moveField] 插入到目标行:', toRowIndex)
    }

    // 记录移动操作（使用原始的 toRow, toColIndexIndex 和 toColIndex）
    recordMoveAction(field, fromRowIndex, fromColIndex, toRowIndex, toColIndex)
    
    console.log('[moveField] 最终结果:', JSON.stringify(schema.value.fields.map(r => r.map(f => f.label))))
  }
  
  /**
   * 复制字段
   */
  const duplicateField = (fieldId: string): FormField | null => {
    for (let rowIndex = 0; rowIndex < schema.value.fields.length; rowIndex++) {
      const row = schema.value.fields[rowIndex]
      const colIndex = row.findIndex(f => f.id === fieldId)
      if (colIndex !== -1) {
        const field = row[colIndex]
        const newField = JSON.parse(JSON.stringify(field))
        newField.id = generateId()
        newField.name = generateFieldName(field.type)
        newField.label = field.label + ' (副本)'
        
        // 插入到原位置后面
        row.splice(colIndex + 1, 0, newField)
        
        recordAddAction(newField, rowIndex, colIndex + 1)
        selectedFieldId.value = newField.id
        
        return newField
      }
    }
    return null
  }
  
  /**
   * 上移字段
   */
  const moveFieldUp = (fieldId: string): void => {
    for (let rowIndex = 0; rowIndex < schema.value.fields.length; rowIndex++) {
      const row = schema.value.fields[rowIndex]
      const colIndex = row.findIndex(f => f.id === fieldId)
      if (colIndex !== -1 && rowIndex > 0) {
        // 移动到上一行末尾
        const field = row.splice(colIndex, 1)[0]
        schema.value.fields[rowIndex - 1].push(field)
        
        // 如果当前行为空，删除该行
        if (row.length === 0) {
          schema.value.fields.splice(rowIndex, 1)
        }
        
        return
      }
    }
  }
  
  /**
   * 下移字段
   */
  const moveFieldDown = (fieldId: string): void => {
    for (let rowIndex = 0; rowIndex < schema.value.fields.length; rowIndex++) {
      const row = schema.value.fields[rowIndex]
      const colIndex = row.findIndex(f => f.id === fieldId)
      if (colIndex !== -1 && rowIndex < schema.value.fields.length - 1) {
        // 移动到下一行开头
        const field = row.splice(colIndex, 1)[0]
        schema.value.fields[rowIndex + 1].unshift(field)
        
        // 如果当前行为空，删除该行
        if (row.length === 0) {
          schema.value.fields.splice(rowIndex, 1)
        }
        
        return
      }
    }
  }
  
  /**
   * 设置拖拽预览
   */
  const setDragPreview = (preview: { rowIndex: number; colIndex: number; position: 'left' | 'right' | 'top' | 'bottom' | null } | null): void => {
    dragPreview.value = preview
  }
  
  /**
   * 设置从组件面板拖拽的状态
   */
  const setDraggingFromPanel = (value: boolean): void => {
    isDraggingFromPanel.value = value
    // 如果结束拖拽，同时重置表单区域状态
    if (!value) {
      isDraggingOverForm.value = false
    }
  }
  
  /**
   * 设置是否拖拽到表单区域
   */
  const setDraggingOverForm = (value: boolean): void => {
    isDraggingOverForm.value = value
  }
  
  /**
   * 重置所有拖拽状态
   */
  const resetDragState = (): void => {
    isDragging.value = false
    draggedItem.value = null
    isDraggingFromPanel.value = false
    isDraggingOverForm.value = false
    dragPreview.value = null
  }
  
  /**
   * 更新Schema基本信息
   */
  const updateSchemaInfo = (info: Partial<FormSchema>): void => {
    Object.assign(schema.value, info)
  }
  
  /**
   * 加载Schema
   */
  const loadSchema = (newSchema: FormSchema): void => {
    // 兼容旧版本的扁平数组
    let fields = newSchema.fields
    if (Array.isArray(fields) && fields.length > 0 && !Array.isArray(fields[0])) {
      // 旧版本是扁平数组，转成二维数组
      fields = [fields as unknown as FormField[]] as unknown as FormField[][]
    }
    // 使用类型断言
    ;(newSchema as any).fields = fields
    
    schema.value = JSON.parse(JSON.stringify(newSchema))
    selectedFieldId.value = null
    // 清空撤销/重做历史
    actionHistory.value = []
    actionIndex.value = -1
  }
  
  /**
   * 清空表单
   */
  const clearForm = (): void => {
    schema.value = {
      id: generateId(),
      name: '未命名表单',
      description: '',
      fields: [],
      layout: 'vertical',
      labelWidth: 100,
      labelPosition: 'top',
      gutter: 16
    }
    selectedFieldId.value = null
    // 清空撤销/重做历史
    actionHistory.value = []
    actionIndex.value = -1
  }
  
  /**
   * 撤销（删除刚添加的字段 / 恢复移动前的位置）
   */
  const undo = (): void => {
    if (!canUndo.value) return
    
    const action = actionHistory.value[actionIndex.value]
    console.log('[撤销] 执行撤销:', action.type, action.field.label)
    
    if (action.type === 'add') {
      // 撤销添加 = 删除字段
      const { rowIndex, colIndex } = action
      
      // 检查字段是否还存在
      const row = schema.value.fields[rowIndex]
      if (row) {
        // 优先使用记录的 colIndex，如果不存在则查找
        const index = colIndex >= 0 && colIndex < row.length && row[colIndex]?.id === action.field.id 
          ? colIndex 
          : row.findIndex(f => f.id === action.field.id)
        if (index !== -1) {
          row.splice(index, 1)
          
          // 如果该行空了，删除该行
          if (row.length === 0) {
            schema.value.fields.splice(rowIndex, 1)
          }
        }
      }
    } else if (action.type === 'move') {
      // 撤销移动 = 将元素移回原位置
      // 移动操作是从 from -> to，撤销就是从 to -> from
      const { field, fromRowIndex, fromColIndex, toRowIndex } = action
      
      // 先从当前位置移除
      const currentRow = schema.value.fields[toRowIndex]
      if (currentRow) {
        const index = currentRow.findIndex(f => f.id === field.id)
        if (index !== -1) {
          currentRow.splice(index, 1)
          
          // 如果当前位置行为空，删除该行
          if (currentRow.length === 0) {
            schema.value.fields.splice(toRowIndex, 1)
          }
        }
      }
      
      // 恢复到原位置
      // 调整 fromRowIndex（如果删除了行）
      let adjustedFromRow = fromRowIndex
      if (toRowIndex < fromRowIndex && schema.value.fields.length <= fromRowIndex) {
        adjustedFromRow = schema.value.fields.length
      }
      
      // 确保行存在
      while (schema.value.fields.length <= adjustedFromRow) {
        schema.value.fields.push([])
      }
      
      // 插入到原位置
      schema.value.fields[adjustedFromRow].splice(fromColIndex, 0, field)
      
      // 重新计算 span
      const newRow = schema.value.fields[adjustedFromRow]
      const newCount = newRow.length
      const newSpan = Math.floor(24 / newCount)
      newRow.forEach((f, idx) => {
        f.span = idx === newCount - 1 ? 24 - newSpan * (newCount - 1) : newSpan
      })
    }
    
    actionIndex.value--
    selectedFieldId.value = null
  }
  
  /**
   * 重做（恢复刚删除的字段 / 执行移动操作）
   */
  const redo = (): void => {
    if (!canRedo.value) return
    
    actionIndex.value++
    const action = actionHistory.value[actionIndex.value]
    console.log('[重做] 执行重做:', action.type, action.field.label)
    
    if (action.type === 'delete') {
      // 重做删除 = 恢复字段
      const { field, rowIndex, colIndex } = action
      
      // 确保行存在
      while (schema.value.fields.length <= rowIndex) {
        schema.value.fields.push([])
      }
      
      // 恢复字段
      const row = schema.value.fields[rowIndex]
      row.splice(colIndex, 0, field)
      
      // 重新计算 span
      const newCount = row.length
      const newSpan = Math.floor(24 / newCount)
      row.forEach((f, idx) => {
        f.span = idx === newCount - 1 ? 24 - newSpan * (newCount - 1) : newSpan
      })
    } else if (action.type === 'move') {
      // 重做移动 = 将元素移到目标位置
      const { field, fromRowIndex, toRowIndex, toColIndex } = action
      
      // 先从原位置移除
      const originalRow = schema.value.fields[fromRowIndex]
      if (originalRow) {
        const index = originalRow.findIndex(f => f.id === field.id)
        if (index !== -1) {
          originalRow.splice(index, 1)
          
          // 如果原位置行为空，删除该行
          if (originalRow.length === 0) {
            schema.value.fields.splice(fromRowIndex, 1)
          }
        }
      }
      
      // 调整目标行索引（如果原位置行被删除且在目标行之前）
      let adjustedToRow = toRowIndex
      if (fromRowIndex < toRowIndex && schema.value.fields.length <= toRowIndex) {
        adjustedToRow = schema.value.fields.length - 1
      }
      
      // 确保目标行存在
      while (schema.value.fields.length <= adjustedToRow) {
        schema.value.fields.push([])
      }
      
      // 插入到目标位置
      schema.value.fields[adjustedToRow].splice(adjustedToRow >= schema.value.fields.length ? schema.value.fields[adjustedToRow].length : toColIndex, 0, field)
      
      // 重新计算 span
      const newRow = schema.value.fields[adjustedToRow]
      const newCount = newRow.length
      const newSpan = Math.floor(24 / newCount)
      newRow.forEach((f, idx) => {
        f.span = idx === newCount - 1 ? 24 - newSpan * (newCount - 1) : newSpan
      })
    }
    
    selectedFieldId.value = null
  }
  
  // ========== 私有方法 ==========
  
  /**
   * 生成字段名称
   */
  const generateFieldName = (type: FieldType): string => {
    const prefixMap: Record<FieldType, string> = {
      input: 'input',
      textarea: 'textarea',
      number: 'number',
      select: 'select',
      radio: 'radio',
      checkbox: 'checkbox',
      switch: 'switch',
      date: 'date',
      time: 'time',
      datetime: 'datetime',
      cascader: 'cascader',
      upload: 'upload',
      rate: 'rate',
      slider: 'slider',
      color: 'color',
      'tree-select': 'treeSelect',
      divider: 'divider',
      card: 'card',
      collapse: 'collapse'
    }
    
    const prefix = prefixMap[type] || 'field'
    const count = flatFields.value.filter(f => f.type === type).length
    return `${prefix}${count + 1}`
  }
  
  /**
   * 获取默认标签
   */
  const getDefaultLabel = (type: FieldType): string => {
    const labelMap: Record<FieldType, string> = {
      input: '输入框',
      textarea: '文本域',
      number: '数字输入',
      select: '下拉选择',
      radio: '单选框',
      checkbox: '复选框',
      switch: '开关',
      date: '日期选择',
      time: '时间选择',
      datetime: '日期时间',
      cascader: '级联选择',
      upload: '上传组件',
      rate: '评分',
      slider: '滑块',
      color: '颜色选择',
      'tree-select': '树选择',
      divider: '分割线',
      card: '卡片',
      collapse: '折叠面板'
    }
    
    return labelMap[type] || '字段'
  }
  
  return {
    // 状态
    schema,
    selectedFieldId,
    isDragging,
    draggedItem,
    dragPreview,
    actionHistory,
    actionIndex,
    isDraggingFromPanel,
    isDraggingOverForm,
    
    // 计算属性
    flatFields,
    rowCount,
    selectedField,
    canUndo,
    canRedo,
    
    // 方法
    addField,
    updateField,
    deleteField,
    moveField,
    duplicateField,
    moveFieldUp,
    moveFieldDown,
    setDragPreview,
    setDraggingFromPanel,
    setDraggingOverForm,
    resetDragState,
    updateSchemaInfo,
    loadSchema,
    clearForm,
    undo,
    redo,
    selectField: (id: string | null) => { selectedFieldId.value = id },
    updateFields: (fields: FormField[][]) => {
      schema.value.fields = fields
    }
  }
})
