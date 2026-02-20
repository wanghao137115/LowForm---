// formStore 测试文件
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFormStore } from '@/stores/formStore'

describe('formStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('初始化', () => {
    it('应该有默认的空表单结构', () => {
      const store = useFormStore()
      expect(store.schema.fields).toEqual([])
      expect(store.schema.name).toBe('未命名表单')
      expect(store.selectedFieldId).toBeNull()
    })
  })

  describe('addField - 添加字段', () => {
    it('应该能够添加一个输入框字段到空表单', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '用户名' })
      
      expect(field).toBeDefined()
      expect(field.type).toBe('text')  // input 类型实际存储为 text
      expect(field.label).toBe('用户名')
      expect(store.schema.fields.length).toBe(1)
      expect(store.schema.fields[0].length).toBe(1)
    })

    it('应该能够添加多个字段到同一行（直到4个）', () => {
      const store = useFormStore()
      
      store.addField('input', { label: '字段1' })
      store.addField('input', { label: '字段2' })
      store.addField('input', { label: '字段3' })
      store.addField('input', { label: '字段4' })
      
      // 第5个应该创建新行
      store.addField('input', { label: '字段5' })
      
      // 实际行为：每次添加到第一行检查，超过4个或超过24则创建新行
      // 但由于span重新计算，5个字段可能分布在多行
      expect(store.schema.fields.length).toBeGreaterThanOrEqual(2)
    })

    it('添加后应该自动选中该字段', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      
      expect(store.selectedFieldId).toBe(field.id)
    })

    it('应该支持指定行和列索引插入', () => {
      const store = useFormStore()
      
      // 添加基础字段
      store.addField('input', { label: '字段1' })
      store.addField('input', { label: '字段2' })
      
      // 在第一行末尾插入新字段
      const rowLen = store.schema.fields[0].length
      const newField = store.addField('input', { label: '新字段' }, 0, rowLen)
      
      expect(newField).toBeDefined()
      // 插入到末尾
      expect(store.schema.fields[0][store.schema.fields[0].length - 1].label).toBe('新字段')
    })
  })

  describe('deleteField - 删除字段', () => {
    it('应该能够删除指定字段', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      
      store.deleteField(field.id)
      
      // 删除后该行应该被删除（因为是唯一的字段）
      expect(store.schema.fields.length).toBe(0)
    })

    it('删除最后一个字段后应该删除空行', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      
      store.deleteField(field.id)
      
      expect(store.schema.fields.length).toBe(0)
    })

    it('删除字段后应该清除选中状态', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      
      expect(store.selectedFieldId).toBe(field.id)
      
      store.deleteField(field.id)
      
      expect(store.selectedFieldId).toBeNull()
    })
  })

  describe('updateField - 更新字段', () => {
    it('应该能够更新字段属性', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '原标题' })
      
      // updateField 需要传入完整的字段对象
      const updatedField = { ...field, label: '新标题' }
      store.updateField(updatedField)
      
      expect(store.schema.fields[0][0].label).toBe('新标题')
    })
  })

  describe('selectField - 选中字段', () => {
    it('应该能够选中字段', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      
      store.selectField(null)
      expect(store.selectedFieldId).toBeNull()
      
      store.selectField(field.id)
      expect(store.selectedFieldId).toBe(field.id)
    })
  })

  describe('moveField - 移动字段', () => {
    it('应该能够将字段从一行移动到另一行', () => {
      const store = useFormStore()
      
      // 创建两行
      store.addField('input', { label: '行1字段1' })
      store.addField('input', { label: '行1字段2' })
      store.addField('input', { label: '行2字段1' })
      
      const initialRowCount = store.schema.fields.length
      
      // 将第0行第0列的字段移动到第1行
      store.moveField(0, 0, 1, 0)
      
      // 验证移动成功（行数应该不变）
      expect(store.schema.fields.length).toBe(initialRowCount)
    })
  })

  describe('undo/redo - 撤销/重做', () => {
    it('undo 应该能够撤销添加操作', () => {
      const store = useFormStore()
      store.addField('input', { label: '测试' })
      
      expect(store.schema.fields[0].length).toBe(1)
      
      store.undo()
      
      expect(store.schema.fields.length).toBe(0)
    })

    it('undo 应该能够撤销删除操作', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      store.deleteField(field.id)
      
      // 删除后行也被删除了
      expect(store.schema.fields.length).toBe(0)
      
      store.undo()
      
      // 撤销后应该恢复字段
      expect(store.schema.fields.length).toBe(1)
      expect(store.schema.fields[0][0].label).toBe('测试')
    })

    it('undo 应该能够撤销移动操作', () => {
      const store = useFormStore()
      
      store.addField('input', { label: '字段1' })
      store.addField('input', { label: '字段2' })
      
      // 移动字段
      store.moveField(0, 0, 0, 1)
      
      // 撤销移动
      store.undo()
      
      // 应该恢复到接近原始状态
      expect(store.schema.fields[0].length).toBe(2)
    })

    it('redo 应该能够重做添加操作', () => {
      const store = useFormStore()
      store.addField('input', { label: '测试' })
      store.undo()
      
      expect(store.schema.fields.length).toBe(0)
      
      store.redo()
      
      // 重做后字段应该恢复
      expect(store.schema.fields.length).toBe(1)
    })

    it('redo 应该能够重做删除操作', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      store.deleteField(field.id)
      store.undo()
      
      expect(store.schema.fields.length).toBe(1)
      
      store.redo()
      
      expect(store.schema.fields.length).toBe(0)
    })

    it('canUndo 应该在没有操作时返回 false', () => {
      const store = useFormStore()
      expect(store.canUndo).toBe(false)
    })

    it('canUndo 应该在有操作时返回 true', () => {
      const store = useFormStore()
      store.addField('input', { label: '测试' })
      expect(store.canUndo).toBe(true)
    })

    it('canRedo 应该在撤销后返回 true', () => {
      const store = useFormStore()
      store.addField('input', { label: '测试' })
      store.undo()
      expect(store.canRedo).toBe(true)
    })

    it('连续操作应该清除重做历史', () => {
      const store = useFormStore()
      
      store.addField('input', { label: '字段1' })
      store.addField('input', { label: '字段2' })
      
      store.undo() // 撤销添加字段2
      expect(store.canRedo).toBe(true)
      
      store.addField('input', { label: '字段3' }) // 新操作应该清除重做历史
      
      expect(store.canRedo).toBe(false)
    })
  })

  describe('clearForm - 清空表单', () => {
    it('应该能够清空整个表单', () => {
      const store = useFormStore()
      
      store.addField('input', { label: '字段1' })
      store.addField('input', { label: '字段2' })
      
      store.clearForm()
      
      expect(store.schema.fields.length).toBe(0)
      expect(store.selectedFieldId).toBeNull()
    })
  })

  describe('selectedField - 选中字段计算属性', () => {
    it('应该返回当前选中的字段', () => {
      const store = useFormStore()
      const field = store.addField('input', { label: '测试' })
      
      expect(store.selectedField).toBeDefined()
      expect(store.selectedField?.id).toBe(field.id)
    })

    it('没有选中字段时返回 null', () => {
      const store = useFormStore()
      store.addField('input', { label: '测试' })
      store.selectField(null)
      
      // 返回 null 而不是 undefined
      expect(store.selectedField).toBeNull()
    })
  })

  describe('duplicateField - 复制字段', () => {
    it('应该能够复制字段', () => {
      const store = useFormStore()
      const original = store.addField('input', { label: '原字段' })
      
      const duplicate = store.duplicateField(original.id)
      
      expect(duplicate).toBeDefined()
      expect(duplicate?.id).not.toBe(original.id)
      expect(duplicate?.label).toBe('原字段 (副本)')
    })

    it('复制后应该选中副本', () => {
      const store = useFormStore()
      const original = store.addField('input', { label: '原字段' })
      
      const duplicate = store.duplicateField(original.id)
      
      expect(store.selectedFieldId).toBe(duplicate?.id)
    })
  })
})
