# Resources 两栏工作台重构计划

## Summary

重构 `/resources` 为“资料索引工作台”，使网站、工具、文档和 Prompt 成为主内容，Books 降为末尾的辅助阅读归档。

核心结果：

- 桌面端改为左侧 sticky 分类目录、右侧资源内容的两栏工作台。
- 移动端退化为普通单栏页面与顶部可换行分类导航。
- Prompt 继续以资源条目中的内联 `<details>` 展开，不增加详情页或客户端抽屉。
- Books 移至所有资源分类之后，变为“7 本书”的紧凑折叠区。
- 新增“产品设计”资源分类，加入 `https://namethatui.com/` 并关联“产品学习”专题。

## Current State Analysis

### 当前信息结构

- `src/pages/resources/index.astro` 当前顺序是：
  1. 页面标题和顶部锚点导航
  2. Books 完整列表
  3. 所有 `resources` collection 分类
- `src/components/resources/BookResourceList.astro` 渲染 7 本书的完整列表，包括封面、作者、描述、标签和箭头。
- `src/components/resources/ResourceGroup.astro` 以纵向行列表显示资源；Prompt 通过 `<details>` 内联展开。
- `src/content/resources/ai-prompts.md` 是当前唯一资源分类，含 4 条 Prompt。
- `src/utils/resources.ts` 已负责资源分类排序、重复链接校验和专题关联。

### 当前页面问题

实测 808px 宽度下：

- Books 区高度约 `854px`，位于首个资源分类之前。
- AI 提示词区约 `732px`，被压到 Books 之后。
- 页面的一级导航只有 `Books / AI 提示词`，但资源本体没有成为首要入口。
- 资源行对短链接尚可，但长 Prompt 的阅读开始、分类上下文和专题关联不够清晰。

### 新增网站资源事实

`https://namethatui.com/` 是 UI 元素与视觉术语的索引词典：

- 帮助把模糊描述映射到标准 UI 名称、API 术语和可直接使用的提示词。
- 适合作为“产品设计”分类下的 `website` 资源。
- 与现有“产品学习”专题相关。

## Proposed Changes

### 1. 新增产品设计资源分类

**新增文件：`src/content/resources/product-design.md`**

创建分类：

- `title: '产品设计'`
- `description: '界面、交互与设计沟通中的参考工具。'`
- `order: 20`
- `draft: false`

创建单条资源：

- `title: 'Name That UI'`
- `href: 'https://namethatui.com/'`
- `description: '用自然语言查找 UI 元素、设计术语与对应实现表达的视觉词典。'`
- `kind: website`
- `topics: [product-learning]`

不使用头像、缩略图或外部图片，避免为资源条目引入不必要的视觉噪音。

### 2. 新增两栏工作台壳组件

**新增文件：`src/components/resources/ResourceWorkspace.astro`**

组件职责：

- 接收已排序的资源分类、Books 数据和分类目录项。
- 在桌面端提供两栏布局：
  - 左栏：sticky `aside` 分类目录
  - 右栏：主资源内容
- 左栏内容：
  - 小型 “INDEX” 标识
  - 资源分类链接及条目数量
  - 末尾的 Books 链接，低强调样式
- 右栏内容：
  - 依序渲染 AI 提示词、产品设计等资源分组
  - 渲染 Resources 页面传入的 Books 收纳区

响应式规则：

- `md` 以下取消两栏和 sticky。
- 分类目录变成标题区下方的可换行文字导航。
- 不增加滚动监听、自动高亮、客户端状态或手动宽度拖拽。

视觉方向：

- 资料索引 / 编辑部目录。
- 资源分组使用清晰的上边界、计数和轻量编号，而不是大卡片墙。
- 侧栏和正文保持视觉连续，用细线、较小的元信息和对齐排版建立层级。

### 3. 重构 Resources 页面骨架

**文件：`src/pages/resources/index.astro`**

调整数据：

- 保留 `getResourceGroups()` 和 books collection 加载。
- 计算每个资源分类的条目数量。
- 继续按现有 `order` 排序资源分类；Books 不参与资源分类排序。

调整页面顺序：

1. 标题区：`Library / Resources`、一句话说明。
2. 桌面侧栏或移动端顶部分类目录。
3. 资源分类主内容：
   - AI 提示词
   - 产品设计
4. 低优先级 Books 折叠区。

删除当前顶层 `Books` 首位逻辑和“Books / AI 提示词”简单锚点导航。

页面不添加搜索、筛选、分页、标签、收藏或卡片瀑布流。

### 4. 收敛资源分类展示为索引式分组

**文件：`src/components/resources/ResourceGroup.astro`**

保留：

- 分类标题和说明。
- 资源名称、类型标签、说明。
- 外链安全属性。
- 资源到专题的关联。
- Prompt 的 `<details>` 展开。
- 锚点深链接。

重构：

- 分组标题增加 `资源数` 元信息。
- 每条资源使用更明确的“索引行”结构：
  - 左侧：两位数序号
  - 中部：标题、说明和专题关联
  - 右侧：类型标签与外链箭头
- 移除多余的嵌套 flex 容器，让视觉重心集中在资源名与说明。
- Prompt 展开区改成与条目对齐的弱化阅读面板：
  - 保留最大高度与内部滚动
  - 使用等宽字体
  - 保持长行折行
  - 明确 `查看 Prompt / 收起 Prompt` 的原生 summary 状态

不会改变 `prompt` 字段、资源锚点 id 或专题关联数据结构。

### 5. 将 Books 改为末尾折叠归档

**文件：`src/components/resources/BookResourceList.astro`**

重构为低优先级 `<details>` 区：

- 默认折叠。
- summary 文案显示：
  - `Books`
  - `7 本阅读归档`
- 展开后继续保留全部书籍链接、封面、作者、说明和“喜欢/已整理”状态。
- 展开列表使用更紧凑的两列响应式网格：
  - 移动端单列
  - `sm` 以上两列
- 移除当前逐行占满正文的列表样式。
- 保持所有 `/books/<id>` 链接、详情页、下载和 `/books -> /resources#books` 重定向不变。

Books 不再出现在工作台侧栏的主要分类组中，只作为末尾弱化链接或详情锚点。

### 6. 更新资源页面文案与可访问性

**文件：`src/pages/resources/index.astro`、`src/components/resources/ResourceWorkspace.astro`、`src/components/resources/ResourceGroup.astro`、`src/components/resources/BookResourceList.astro`**

- 为桌面侧栏使用 `nav aria-label='资源目录'`。
- 每个资源分组使用语义化 `section` 和稳定 heading id。
- Books 收纳区使用原生 `<details>` / `<summary>`。
- 外链继续使用 `target='_blank'` 与 `rel='noopener noreferrer'`。
- 键盘焦点使用现有 primary token 的 focus ring。
- 深色与浅色模式只使用现有 CSS token，不新增全局颜色。

## Assumptions & Decisions

- 资源库的主要用途是扫描、定位和复用链接/Prompt，而不是展示收藏品。
- Books 是阅读归档，继续存在但不与网站、工具、Prompt 竞争首屏。
- 桌面端采用两栏工作台；移动端不保留 sticky 侧栏。
- Prompt 继续内联展开，避免增加详情路由和维护成本。
- `Name That UI` 放进新“产品设计”分类，并关联 `product-learning`。
- 资源分类顺序由现有 `order` 决定：
  - AI 提示词：10
  - 产品设计：20
- 不改变现有 `resources` collection schema、`prompt` 字段或 `src/utils/resources.ts` 的校验行为。
- 不调整 Books collection、书籍内容、旧链接或下载文件。
- 不修改主页、Blog、专题、About、Links 或导航。

## Verification

### 自动检查

1. 运行 `npm run check`，确认新组件、页面 props、资源分类和专题引用无错误。
2. 运行 `npm run build`，确认 `/resources`、专题关联、Books 重定向、Pagefind 与 Sitemap 正常。
3. 运行 scoped `git diff --check`，确认改动无空白问题。

### 内容验收

1. `src/content/resources/product-design.md` 正确加载。
2. Resources 分类顺序为：
   - AI 提示词
   - 产品设计
3. `Name That UI` 显示为外链网站资源，点击新标签页打开。
4. `Name That UI` 显示“产品学习”关联入口。
5. AI 提示词的 4 条 Prompt 和锚点不丢失。

### 布局验收

1. 桌面端：
   - 资源分类首先进入主阅读区。
   - 左侧目录 sticky 且不遮挡顶部导航。
   - Books 位于所有资源分类之后，默认折叠。
2. 移动端：
   - 分类目录在标题下方换行展示。
   - 所有资源、Prompt 和 Books 均单列且无横向溢出。
3. Prompt：
   - 默认折叠。
   - 展开后内容可滚动、可阅读、无页面横向溢出。
4. Books：
   - 默认折叠。
   - 展开后保持所有 7 本书可点击。
5. 深色与浅色模式：
   - 侧栏、边界、资源索引行和 Books 区对比清楚。

### 浏览器验收

1. 使用浏览器验证 `/resources` 的桌面与移动端宽度。
2. 验证 `#resource-ai-prompts`、`#resource-product-design` 与 `#books` 锚点。
3. 验证 `Name That UI` 外链属性。
4. 验证 AI Prompt 的展开/收起。
5. 验证 Books 展开/收起。
6. 检查控制台无新增错误。
