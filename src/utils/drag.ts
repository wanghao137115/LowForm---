// 拖拽相关工具函数
import { DragState } from '@/types/form'

/**
 * 生成唯一ID
 */
export function generateId(): string {
  return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  const clone = Array.isArray(obj) ? [] : {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key])
    }
  }
  return clone as T
}

/**
 * 获取组件默认属性
 */
export function getDefaultProps(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    input: {
      type: 'text',
      placeholder: '请输入',
      clearable: true,
      maxlength: 100,
      showWordLimit: false
    },
    textarea: {
      type: 'textarea',
      placeholder: '请输入',
      rows: 3,
      maxlength: 500,
      showWordLimit: false
    },
    number: {
      placeholder: '请输入',
      min: -Infinity,
      max: Infinity,
      step: 1,
      precision: undefined,
      controls: true
    },
    select: {
      placeholder: '请选择',
      clearable: true,
      filterable: false,
      multiple: false,
      options: []
    },
    radio: {
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' }
      ]
    },
    checkbox: {
      options: [
        { label: '选项一', value: '1' },
        { label: '选项二', value: '2' }
      ]
    },
    switch: {
      activeText: '',
      inactiveText: '',
      activeColor: '#409EFF',
      inactiveColor: '#C0CCDA',
      activeValue: true,
      inactiveValue: false
    },
    date: {
      type: 'date',
      placeholder: '请选择日期',
      clearable: true,
      format: 'YYYY-MM-DD',
      valueFormat: 'YYYY-MM-DD'
    },
    time: {
      type: 'time',
      placeholder: '请选择时间',
      clearable: true,
      format: 'HH:mm:ss',
      valueFormat: 'HH:mm:ss'
    },
    datetime: {
      type: 'datetime',
      placeholder: '请选择日期时间',
      clearable: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      valueFormat: 'YYYY-MM-DD HH:mm:ss'
    },
    cascader: {
      placeholder: '请选择',
      clearable: true,
      filterable: false,
      options: []
    },
    upload: {
      action: '#',
      accept: 'image/*',
      limit: 5,
      listType: 'picture-card',
      autoUpload: true,
      multiple: false,
      drag: false,
      fileList: []
    },
    rate: {
      max: 5,
      allowHalf: false,
      showText: false,
      showScore: false
    },
    slider: {
      min: 0,
      max: 100,
      step: 1,
      range: false,
      showStops: false
    },
    color: {
      showAlpha: false,
      colorFormat: 'hex'
    },
    divider: {
      content: '',
      contentPosition: 'center',
      borderType: 'solid'
    },
    card: {
      header: '卡片标题',
      shadow: 'always',
      bodyStyle: { padding: '20px' }
    },
    collapse: {
      accordion: false,
      panels: []
    }
  }
  return defaults[type] || {}
}

/**
 * 根据类型创建字段
 */
export function createField(
  type: string, 
  name: string, 
  label: string
): Record<string, any> {
  const id = generateId()
  const defaultProps = getDefaultProps(type)
  
  return {
    id,
    type,
    name,
    label,
    placeholder: `请${type === 'select' ? '选择' : '输入'}${label}`,
    required: false,
    disabled: false,
    hidden: false,
    width: '100%',
    ...defaultProps
  }
}

/**
 * 文件类型正则验证
 * @param fileName 文件名
 * @param acceptPatterns 接受的文件类型模式数组
 * @returns 是否匹配
 */
export function validateFileType(
  fileName: string, 
  acceptPatterns: string[]
): boolean {
  if (!acceptPatterns || acceptPatterns.length === 0) return true
  
  const patterns = acceptPatterns.map(pattern => {
    // 转换glob模式为正则
    let regexPattern = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
    
    // 处理MIME类型
    if (pattern.includes('/')) {
      const mimeParts = pattern.split('/')
      const mimeType = mimeParts[0]
      const subType = mimeParts[1]
      
      if (subType === '*') {
        regexPattern = `^${mimeType}/.*$`
      } else if (subType.startsWith('*.')) {
        const ext = subType.substring(1)
        regexPattern = `\\.${ext}$`
      }
    }
    
    return new RegExp(regexPattern, 'i')
  })
  
  const fileExtension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  const baseName = fileName.toLowerCase()
  
  return patterns.some(regex => {
    // 检查文件扩展名
    if (regex.test(fileExtension)) return true
    // 检查完整文件名
    if (regex.test(baseName)) return true
    return false
  })
}

/**
 * 获取文件的MIME类型
 */
export function getFileMimeType(fileName: string): string {
  const extMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.zip': 'application/zip',
    '.rar': 'application/x-rar-compressed',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav'
  }
  
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase()
  return extMap[ext] || 'application/octet-stream'
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null
  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}

/**
 * 事件处理工具类
 */
export class DragEventHandler {
  private state: DragState
  private listeners: Map<string, Function[]> = new Map()
  
  constructor() {
    this.state = {
      isDragging: false,
      draggedItem: null,
      dropTarget: null
    }
  }
  
  getState(): DragState {
    return { ...this.state }
  }
  
  startDrag(item: any): void {
    this.state.isDragging = true
    this.state.draggedItem = item
    this.emit('dragstart', item)
  }
  
  endDrag(): void {
    this.state.isDragging = false
    this.state.draggedItem = null
    this.state.dropTarget = null
    this.emit('dragend', null)
  }
  
  setDropTarget(target: string | null): void {
    this.state.dropTarget = target
    this.emit('droptargetchange', target)
  }
  
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }
  
  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }
  
  private emit(event: string, data: any): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      callbacks.forEach(cb => cb(data))
    }
  }
}

/**
 * 创建样式对象
 */
export function createStyleObject(
  styles: Record<string, string | number>
): string {
  return Object.entries(styles)
    .map(([key, value]) => {
      // 转换为CSS属性名
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${cssKey}: ${value}`
    })
    .join('; ')
}

/**
 * 合并样式
 */
export function mergeStyles(
  base: Record<string, string | number>,
  override: Record<string, string | number>
): Record<string, string | number> {
  return { ...base, ...override }
}

/**
 * 验证表单名称是否合法
 */
export function isValidFieldName(name: string): boolean {
  // 字段名只能包含字母、数字、下划线，且以字母开头
  const regex = /^[a-zA-Z][a-zA-Z0-9_]*$/
  return regex.test(name)
}

/**
 * 导出JSON Schema
 */
export function exportSchema(schema: any, fileName: string): void {
  const jsonStr = JSON.stringify(schema, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${fileName}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 导入JSON Schema
 */
export async function importSchema(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const schema = JSON.parse(e.target?.result as string)
        resolve(schema)
      } catch (error) {
        reject(new Error('JSON解析失败'))
      }
    }
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}
