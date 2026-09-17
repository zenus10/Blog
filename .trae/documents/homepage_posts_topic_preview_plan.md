# 主页 Posts 专题预览实施计划

## Summary

在主页现有 `Posts` 区域内增加专题预览，让访客在看到最新单篇文章之前先看到可持续阅读的专题入口。

展示规则：

- 专题预览位于 `Posts` 标题下、最新文章列表上方。
- 按现有专题 `order` 排序，最多展示 3 个。
- 桌面端两列，移动端单列；当前两个专题并排展示，未来第三个专题进入下一行。
- 每个专题只展示标题、说明和文章数，不重复专题页上的状态、更新时间和完整目录。
- 提供“全部专题”入口到 `/topics`。
- 最新文章列表、`More posts` 按钮和现有文章数量保持不变。

## Current State Analysis

- 主页入口为 `src/pages/index.astro`。
- `Posts` 当前只展示最近最多 10 篇文章：
  - 通过 `getBlogCollection()` 加载文章。
  - 使用 `sortMDByDate()` 排序。
  - 使用 `PostPreview` 渲染单篇文章。
- 主页分区使用 `src/components/home/Section.astro`，桌面端采用左侧标题、右侧内容的两栏结构。
- 专题由 `src/utils/topics.ts` 的 `getResolvedTopics()` 统一加载和排序。
- 当前有两个公开专题：
  - `AI 学习`
  - `产品学习`
- `src/components/topics/TopicListItem.astro` 为专题列表页设计，包含状态、更新时间和较大纵向间距，直接放入主页会过重。
- 主页当前没有专题数据加载，也没有专题入口。

## Proposed Changes

### 1. 新增主页专用专题预览组件

**新增文件：`src/components/home/TopicPreview.astro`**

组件输入：

- `topic: ResolvedTopic`

展示内容：

- 专题标题
- 专题 description
- 已发布文章数
- 轻量箭头提示

交互与视觉：

- 整个预览块链接到 `/topics/<id>`。
- 使用弱边框、现有主题 token 和紧凑内边距。
- 不显示封面、状态胶囊、更新时间、计划数量或进度条。
- 标题 hover 时使用现有 primary 色。
- 描述最多显示两行，避免不同专题高度差异过大。
- 提供清晰的键盘焦点样式。
- `prefers-reduced-motion` 下关闭位移动效。

该组件只服务主页，不修改或替代 `TopicListItem.astro`。

### 2. 在主页加载专题数据

**文件：`src/pages/index.astro`**

- 导入：
  - `TopicPreview`
  - `getResolvedTopics`
- 与文章数据一起加载专题。
- 使用统一解析器已有的排序结果：
  - `const homeTopics = (await getResolvedTopics()).slice(0, 3)`
- 不增加新的 `featured`、`homepage` 等内容字段，避免重复维护专题展示配置。

### 3. 重构 Posts 内部层级

**文件：`src/pages/index.astro`**

在现有 `<Section title='Posts'>` 中按以下顺序渲染：

1. 专题预览区（仅在 `homeTopics.length > 0` 时显示）
2. 最新文章区
3. `More posts` 按钮

专题预览区：

- 顶部使用小型三级标题“专题合集”。
- 右侧提供文字链接“全部专题 →”到 `/topics`。
- 专题容器使用：
  - 移动端：单列
  - `sm` 以上：两列
- 使用 `homeTopics.map()` 渲染 `TopicPreview`。

最新文章区：

- 在专题预览下方增加弱分隔。
- 使用小型三级标题“最新文章”，明确专题和单篇文章是两种入口。
- 保留当前 `PostPreview` 列表、顺序和数量。
- 保留底部 `More posts` 按钮及 `/blog` 链接。

空状态：

- 没有专题时完全不渲染专题标题、网格、入口或额外留白。
- 有文章时继续显示现有 Posts。
- 本次不改变首页在零文章时隐藏 Posts 分区的现有行为。

## Assumptions & Decisions

- 专题预览属于主页 `Posts` 分区，不新建独立的首页 `Topics` 分区。
- 专题位于最新文章之前，作为策展式阅读入口。
- 主页最多展示 3 个专题，按专题 `order` 取前 3 个。
- 当前两项形成完整双列；第三项未来自然进入第二行左侧，不做跨列或居中处理。
- 不增加专题精选字段；专题排序仍只有一份数据源。
- 不改变专题页、文章页、导航、Resources 或专题 Markdown。
- 不修改现有文章数量上限 `MAX_POSTS = 10`。
- 不在主页展示专题状态和更新时间，降低信息密度。
- 不添加客户端脚本、轮播、横向滚动或折叠交互。
- 继续使用现有字体、颜色和动效体系，不引入新依赖。

## Verification

### 自动检查

1. 运行 `npm run check`，确认新增组件 props 和主页数据类型无错误。
2. 运行 `npm run build`，确认主页、专题、文章、Pagefind 和 Sitemap 正常生成。
3. 运行 scoped `git diff --check`，确认新增与修改文件无空白问题。

### 页面验收

1. 主页 `Posts` 内首先显示“专题合集”。
2. 当前显示两个专题，顺序为：
   - AI 学习
   - 产品学习
3. 两个专题分别链接到：
   - `/topics/ai-learning`
   - `/topics/product-learning`
4. “全部专题 →”链接到 `/topics`。
5. 专题下方显示“最新文章”和原有文章列表。
6. `More posts` 仍链接到 `/blog`。
7. 专题标题、说明和文章数均正确。
8. 页面不存在横向溢出，专题块高度和间距协调。
9. 浏览器控制台无新增错误。

### 响应式与主题

1. 移动端专题预览为单列。
2. `sm` 以上为两列。
3. 浅色和深色模式均使用现有 token，边框与文字对比度正常。
4. 键盘可聚焦整个专题预览块，焦点状态清晰。

### 变更范围审计

最终业务代码只涉及：

- 新增 `src/components/home/TopicPreview.astro`
- 修改 `src/pages/index.astro`

不得修改专题内容、文章内容、导航配置或其他页面。
