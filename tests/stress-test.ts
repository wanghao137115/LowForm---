/**
 * 压力测试脚本
 * 测试大量字段操作时的性能
 * 
 * 运行方式: npx tsx tests/stress-test.ts
 */

import { setActivePinia, createPinia } from 'pinia'
import { useFormStore } from '@/stores/formStore'

// 初始化 Pinia
setActivePinia(createPinia())
const store = useFormStore()

// 测试配置
const FIELD_COUNT = 1000 // 测试字段数量
const ITERATIONS = 100    // 迭代次数

interface TestResult {
  name: string
  duration: number
  operations: number
  opsPerSecond: number
}

const results: TestResult[] = []

/**
 * 格式化时间
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`
  return `${(ms / 60000).toFixed(2)}min`
}

/**
 * 测试1: 大量添加字段
 */
function testAddFields() {
  console.log(`\n🧪 测试1: 添加 ${FIELD_COUNT} 个字段`)
  console.log('=' .repeat(50))
  
  const startTime = Date.now()
  
  for (let i = 0; i < FIELD_COUNT; i++) {
    store.addField('input', { label: `字段${i}` })
  }
  
  const duration = Date.now() - startTime
  
  const result: TestResult = {
    name: '添加字段',
    duration,
    operations: FIELD_COUNT,
    opsPerSecond: Math.round(FIELD_COUNT / (duration / 1000))
  }
  results.push(result)
  
  console.log(`✅ 完成: ${formatDuration(duration)}`)
  console.log(`   字段数量: ${store.schema.fields.length}`)
  console.log(`   行数: ${store.schema.fields.length}`)
  console.log(`   速度: ${result.opsPerSecond} ops/s`)
  
  return duration
}

/**
 * 测试2: 大量更新字段
 */
function testUpdateFields() {
  console.log(`\n🧪 测试2: 更新 ${ITERATIONS} 次字段`)
  console.log('=' .repeat(50))
  
  const fields = store.schema.fields.flat()
  const fieldToUpdate = fields[Math.floor(fields.length / 2)]
  
  if (!fieldToUpdate) {
    console.log('❌ 没有可更新的字段')
    return 0
  }
  
  const startTime = Date.now()
  
  for (let i = 0; i < ITERATIONS; i++) {
    store.updateField({ ...fieldToUpdate, label: `更新${i}` })
  }
  
  const duration = Date.now() - startTime
  
  const result: TestResult = {
    name: '更新字段',
    duration,
    operations: ITERATIONS,
    opsPerSecond: Math.round(ITERATIONS / (duration / 1000))
  }
  results.push(result)
  
  console.log(`✅ 完成: ${formatDuration(duration)}`)
  console.log(`   速度: ${result.opsPerSecond} ops/s`)
  
  return duration
}

/**
 * 测试3: 大量选中字段
 */
function testSelectFields() {
  console.log(`\n🧪 测试3: 选中 ${ITERATIONS} 次字段`)
  console.log('=' .repeat(50))
  
  const fields = store.schema.fields.flat()
  
  const startTime = Date.now()
  
  for (let i = 0; i < ITERATIONS; i++) {
    const field = fields[i % fields.length]
    store.selectField(field.id)
  }
  
  const duration = Date.now() - startTime
  
  const result: TestResult = {
    name: '选中字段',
    duration,
    operations: ITERATIONS,
    opsPerSecond: Math.round(ITERATIONS / (duration / 1000))
  }
  results.push(result)
  
  console.log(`✅ 完成: ${formatDuration(duration)}`)
  console.log(`   速度: ${result.opsPerSecond} ops/s`)
  
  return duration
}

/**
 * 测试4: 大量撤销操作
 */
function testUndo() {
  console.log(`\n🧪 测试4: 撤销 ${Math.min(50, FIELD_COUNT / 10)} 次`)
  console.log('=' .repeat(50))
  
  const undoCount = Math.min(50, Math.floor(store.actionHistory.length / 2))
  
  if (undoCount === 0) {
    console.log('❌ 没有可撤销的操作')
    return 0
  }
  
  const startTime = Date.now()
  
  for (let i = 0; i < undoCount; i++) {
    store.undo()
  }
  
  const duration = Date.now() - startTime
  
  const result: TestResult = {
    name: '撤销操作',
    duration,
    operations: undoCount,
    opsPerSecond: Math.round(undoCount / (duration / 1000))
  }
  results.push(result)
  
  console.log(`✅ 完成: ${formatDuration(duration)}`)
  console.log(`   速度: ${result.opsPerSecond} ops/s`)
  
  return duration
}

/**
 * 测试5: 大量重做操作
 */
function testRedo() {
  console.log(`\n🧪 测试5: 重做 ${Math.min(50, FIELD_COUNT / 10)} 次`)
  console.log('=' .repeat(50))
  
  const redoCount = Math.min(50, store.actionHistory.length - store.actionIndex - 1)
  
  if (redoCount === 0) {
    console.log('❌ 没有可重做的操作')
    return 0
  }
  
  const startTime = Date.now()
  
  for (let i = 0; i < redoCount; i++) {
    store.redo()
  }
  
  const duration = Date.now() - startTime
  
  const result: TestResult = {
    name: '重做操作',
    duration,
    operations: redoCount,
    opsPerSecond: Math.round(redoCount / (duration / 1000))
  }
  results.push(result)
  
  console.log(`✅ 完成: ${formatDuration(duration)}`)
  console.log(`   速度: ${result.opsPerSecond} ops/s`)
  
  return duration
}

/**
 * 测试6: 大量删除字段
 */
function testDeleteFields() {
  console.log(`\n🧪 测试6: 删除 ${ITERATIONS} 个字段`)
  console.log('=' .repeat(50))
  
  const fields = [...store.schema.fields.flat()]
  const deleteCount = Math.min(ITERATIONS, fields.length)
  
  if (deleteCount === 0) {
    console.log('❌ 没有可删除的字段')
    return 0
  }
  
  const startTime = Date.now()
  
  for (let i = 0; i < deleteCount; i++) {
    if (fields[i]) {
      store.deleteField(fields[i].id)
    }
  }
  
  const duration = Date.now() - startTime
  
  const result: TestResult = {
    name: '删除字段',
    duration,
    operations: deleteCount,
    opsPerSecond: Math.round(deleteCount / (duration / 1000))
  }
  results.push(result)
  
  console.log(`✅ 完成: ${formatDuration(duration)}`)
  console.log(`   剩余字段: ${store.schema.fields.flat().length}`)
  console.log(`   速度: ${result.opsPerSecond} ops/s`)
  
  return duration
}

/**
 * 测试7: 内存占用测试
 */
function testMemory() {
  console.log(`\n🧪 测试7: 内存占用`)
  console.log('=' .repeat(50))
  
  // 强制垃圾回收（如果支持）
  if (global.gc) {
    global.gc()
  }
  
  // 清空表单
  store.clearForm()
  
  // 添加大量字段
  for (let i = 0; i < FIELD_COUNT; i++) {
    store.addField('input', { label: `字段${i}` })
  }
  
  const fields = store.schema.fields.flat()
  const memoryUsage = process.memoryUsage()
  
  console.log(`✅ 字段数量: ${fields.length}`)
  console.log(`   Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`)
  console.log(`   RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`)
  
  return memoryUsage.heapUsed
}

/**
 * 打印测试总结
 */
function printSummary() {
  console.log('\n' + '='.repeat(60))
  console.log('📊 压力测试结果总结')
  console.log('='.repeat(60))
  
  console.log('\n| 测试项 | 耗时 | 操作数 | 速度 |')
  console.log('|--------|------|--------|------|')
  
  let totalDuration = 0
  for (const result of results) {
    console.log(`| ${result.name} | ${formatDuration(result.duration)} | ${result.operations} | ${result.opsPerSecond} ops/s |`)
    totalDuration += result.duration
  }
  
  console.log('\n' + '-'.repeat(60))
  console.log(`总耗时: ${formatDuration(totalDuration)}`)
  console.log('='.repeat(60))
  
  // 性能评估
  console.log('\n📈 性能评估:')
  
  const avgOps = results.reduce((sum, r) => sum + r.opsPerSecond, 0) / results.length
  if (avgOps > 10000) {
    console.log('  🟢 优秀: 平均操作速度 > 10,000 ops/s')
  } else if (avgOps > 1000) {
    console.log('  🟡 良好: 平均操作速度 > 1,000 ops/s')
  } else if (avgOps > 100) {
    console.log('  🟠 一般: 平均操作速度 > 100 ops/s')
  } else {
    console.log('  🔴 较差: 平均操作速度 < 100 ops/s')
  }
  
  // 内存评估
  const memoryUsage = process.memoryUsage()
  const heapMB = memoryUsage.heapUsed / 1024 / 1024
  if (heapMB < 100) {
    console.log('  🟢 内存占用优秀')
  } else if (heapMB < 200) {
    console.log('  🟡 内存占用正常')
  } else {
    console.log('  🔴 内存占用较高')
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始压力测试')
  console.log(`   配置: ${FIELD_COUNT} 字段, ${ITERATIONS} 迭代`)
  console.log(`   Node版本: ${process.version}`)
  
  const totalStart = Date.now()
  
  try {
    // 执行各项测试
    testAddFields()
    testUpdateFields()
    testSelectFields()
    testUndo()
    testRedo()
    testDeleteFields()
    testMemory()
    
    // 打印总结
    printSummary()
    
    const totalDuration = Date.now() - totalStart
    console.log(`\n✅ 所有测试完成! 总耗时: ${formatDuration(totalDuration)}`)
    
    process.exit(0)
  } catch (error) {
    console.error('\n❌ 测试失败:', error)
    process.exit(1)
  }
}

// 运行测试
main()
