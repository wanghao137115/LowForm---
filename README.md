# LowForm - 低代码表单生成器

基于 Vue3 + TypeScript + Element Plus 的低代码表单设计器。

## 功能特性

### 1. 拖拽功能
- 从左侧组件面板拖拽组件到中间画布
- 支持组件排序（上下拖拽）
- 使用 HTML5 Drag API 实现流畅拖拽体验

### 2. 动态组件渲染
- 使用 Vue `<component :is="...">` 实现动态组件
- 支持 20+ 种表单组件
- 根据字段类型自动匹配对应组件

### 3. 正则表达式文件验证
- 文件类型验证
- 支持多种文件格式
- MIME 类型检测

### 4. Element Plus 集成
- 使用 Element Plus UI 组件库
- 数据双向绑定
- 完整的表单验证支持

### 5. 样式封装
- 封装常用 UI 样式
- 响应式设计
- 深色/浅色主题支持

## 技术栈

- **前端框架**: Vue 3
- **语言**: TypeScript
- **状态管理**: Pinia
- **UI 组件库**: Element Plus
- **拖拽排序**: vuedraggable + sortablejs
- **构建工具**: Vite
- **路由**: Vue Router
- **样式**: Less

## 项目结构

```
src/
├── components/
│   ├── form-designer/      # 表单设计器组件
│   │   ├── ComponentPanel.vue    # 左侧组件面板
│   │   ├── FormCanvas.vue        # 中间画布区域
│   │   ├── PropertyPanel.vue     # 右侧属性编辑
│   │   ├── OptionsEditor.vue     # 选项编辑器
│   │   └── FormPreview.vue       # 表单预览
│   │
│   └── form-renderer/      # 表单渲染器组件
│       ├── FieldRenderer.vue     # 字段渲染器
│       ├── FormRenderer.vue      # 表单渲染器
│       └── fields/               # 各类型字段组件
│           ├── InputField.vue
│           ├── TextareaField.vue
│           ├── NumberField.vue
│           ├── SelectField.vue
│           ├── RadioField.vue
│           ├── CheckboxField.vue
│           ├── SwitchField.vue
│           ├── DateField.vue
│           ├── TimeField.vue
│           ├── DatetimeField.vue
│           ├── CascaderField.vue
│           ├── UploadField.vue
│           ├── RateField.vue
│           ├── SliderField.vue
│           ├── ColorField.vue
│           ├── DividerField.vue
│           ├── CardField.vue
│           └── CollapseField.vue
│
├── stores/                 # Pinia 状态管理
│   ├── formStore.ts        # 表单状态
│   └── index.ts
│
├── router/                 # Vue Router
│   └── index.ts
│
├── types/                  # TypeScript 类型定义
│   └── form.ts
│
├── utils/                  # 工具函数
│   └── drag.ts
│
├── styles/                 # 全局样式
│   ├── variables.less      # 样式变量
│   └── index.less          # 全局样式
│
├── views/                  # 页面组件
│   ├── FormDesigner.vue    # 表单设计器页面
│   └── FormPreview.vue    # 表单预览页面
│
├── App.vue                 # 根组件
└── main.ts                 # 入口文件
```

## 使用说明

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 组件列表

### 基础字段
- 输入框 (input)
- 文本域 (textarea)
- 数字输入 (number)
- 下拉选择 (select)
- 单选框 (radio)
- 复选框 (checkbox)
- 开关 (switch)

### 增强字段
- 日期选择 (date)
- 时间选择 (time)
- 日期时间 (datetime)
- 级联选择 (cascader)
- 上传组件 (upload)
- 评分 (rate)
- 滑块 (slider)
- 颜色选择 (color)

### 布局组件
- 分割线 (divider)
- 卡片 (card)
- 折叠面板 (collapse)

## API 说明

### 表单字段属性

| 属性 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| type | FieldType | 字段类型 |
| label | string | 显示标签 |
| name | string | 字段名称 |
| placeholder | string | 占位符 |
| required | boolean | 是否必填 |
| disabled | boolean | 是否禁用 |
| hidden | boolean | 是否隐藏 |
| width | string | 宽度 |

### 特殊组件属性

- **select/radio/checkbox**: `options` - 选项列表
- **upload**: `accept` - 接受文件类型，`limit` - 最大数量
- **date/time/datetime**: `format` - 显示格式，`valueFormat` - 值格式
- **slider**: `min`/`max` - 范围，`step` - 步长
- **rate**: `max` - 最大分值，`allowHalf` - 允许半星
- **color**: `showAlpha` - 显示透明度

## 快捷操作

- **拖拽排序**: 拖动字段左侧的拖拽手柄
- **复制字段**: 点击复制按钮
- **上移/下移**: 点击移动按钮
- **删除字段**: 点击删除按钮
- **清空表单**: 点击清空按钮

## 导入导出

- **导入**: 支持导入 JSON Schema 文件
- **导出**: 支持导出为 JSON 文件
- **保存**: 自动保存到本地存储

## 浏览器支持

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 许可证

MIT License
