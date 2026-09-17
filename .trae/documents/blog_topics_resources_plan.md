# 博客“专题合集 + 资源库”实施计划

## Summary

在保留现有“单篇文章”发布方式、文章 URL、标签、归档、搜索与 RSS 的前提下，增加两层互补能力：

1. **专题合集**：作为 Blog 内部的文章组织层。一个专题用一个 Markdown 文件集中维护章节、子章节、文章顺序和计划项；一篇文章最多属于一个专题。
2. **资源库**：作为独立内容类型进入主导航。每个资源分类用一个 Markdown 文件维护多个网站或文档；资源可选关联一个或多个专题，并在专题页展示为“相关资源”。

最终信息架构：

- 主导航：`Blog / Resources / Links / About`
- `Blog` 内部顶部双入口：`全部文章 / 专题合集`
- `/blog`：继续展示全部单篇文章
- `/topics`：展示专题合集
- `/topics/<id>`：展示专题导言、最多三级目录和相关资源
- `/resources`：按分类展示全部资源

本次只实现通用能力，不创建实际的“LLM 学习”专题，也不迁移现有文章或填充资源内容。

## Current State Analysis

### 已有能力

- `src/content/blog/` 通过 Astro Content Collections 管理单篇文章。
- `/blog`、标签、归档、搜索和 RSS 都以单篇 `blog` entry 为基本单位。
- 文章目录只影响文章 id 与 URL，本身没有标题、说明、排序或聚合页。
- 主导航当前仍包含 `Books` 和 `Projects`。
- `public/links.json` 管理的是友链，不适合作为学习资源库复用。

### 未提交的专题原型

仓库中已有一套未提交的专题原型：

- `src/content.config.ts` 已注册 `topics` collection。
- `src/utils/topics.ts` 已实现专题解析和文章归属校验。
- `src/components/topics/` 已包含专题卡片、任意深度目录、文章面包屑和上下篇导航。
- `src/pages/topics/` 已包含专题列表与详情路由。
- `/blog` 当前原型会在文章列表上方混排精选专题。
- `src/content/topics/` 目前只有 `.gitkeep`，没有实际专题。

这套原型功能过重：包含封面、精选、完成百分比、任意深度目录、计划数与卡片墙。它增加了录入字段和视觉噪音，却没有直接提升持续写作效率。实施时应在现有代码上做收敛式重构，而不是继续叠加功能。

### 工作区约束

- 当前存在大量与本功能无关的未提交文章和布局修改，实施时不得覆盖或回退。
- `src/layouts/BlogPost.astro` 与 `src/layouts/ContentLayout.astro` 包含用户现有的宽度/溢出修复，必须保留。
- `Books`、`Projects` 页面与路由继续保留，只从主导航移除。

## Content Model

### 1. `topics` 集合

每个专题对应 `src/content/topics/<id>.md`，frontmatter 只保留：

- `title`：专题名称，必填
- `description`：一句话说明，必填
- `status`：`ongoing | completed | paused`，默认 `ongoing`
- `order`：专题列表排序，默认 `0`
- `draft`：是否隐藏，默认 `false`
- `outline`：专题目录，必填数组

专题 Markdown 正文可选，用于学习目标、范围说明或维护备注。

删除现有原型中的：

- `heroImage`
- `featured`
- `createdDate`
- 完成百分比及进度条

专题列表按 `order` 升序，再按标题稳定排序。最近更新时间从已关联文章的 `updatedDate ?? publishDate` 自动派生；没有文章时不显示日期。

### 2. 最多三级专题目录

目录层级固定为：

1. 专题
2. 章节
3. 可选子章节
4. 文章或计划项

换算成页面可见结构即“章节 / 子章节 / 条目”最多三级。数据 schema 不再使用任意深度递归：

- `section`
  - `title`
  - 可选 `description`
  - `children`
- `subsection`
  - `title`
  - 可选 `description`
  - `children`
- `article`
  - `post: reference('blog')`
- `planned`
  - `title`
  - 可选 `description`

章节下可以直接放文章/计划项，也可以先放子章节；子章节下只能放文章/计划项。

规则：

- 深度优先顺序就是专题阅读顺序。
- `planned` 只用于表达后续写作计划，不生成链接。
- 一篇文章最多出现在一个公开专题中；重复归属直接构建失败。
- 公开专题引用不存在文章或生产环境中的草稿文章时构建失败。
- 标签继续表达跨主题关系，不承担专题层级。

### 3. `resources` 集合

每个资源分类对应 `src/content/resources/<category>.md`，例如未来可建立 `ai.md`、`design.md`，但本次不提交实际分类。

分类字段：

- `title`：分类名称
- `description`：分类说明，可选
- `order`：分类排序，默认 `0`
- `draft`：是否隐藏，默认 `false`
- `items`：资源条目数组

资源条目字段：

- `title`：资源名称
- `href`：`https://` / `http://` 外链或 `/` 开头的站内文件路径
- `description`：简短说明
- `kind`：`website | document | tool | course | other`，默认 `website`
- `topics`：可选的 `reference('topics')[]`

规则：

- 分类按 `order` 和标题排序；分类内资源保持文件中的人工顺序。
- 同一 `href` 不允许跨分类重复，重复时构建失败。
- 一个资源可以关联多个专题，因为同一文档可能服务多个学习路径。
- 公开资源分类不能关联草稿专题，避免生产环境死链。
- 不增加标签、收藏、评分、封面、访问次数、客户端筛选或搜索框。

## Proposed Changes

### 1. 收敛并扩展 Content Collections

**文件：`src/content.config.ts`**

- 保留现有 `blog`、`books` schema。
- 将当前任意深度 `topics` schema 改为最多三级的显式联合结构。
- 删除专题封面、精选、创建日期等非必要字段。
- 新增 `resources` collection，并为资源条目增加可选专题引用。
- 导出 `{ blog, books, topics, resources }`。

**目录：`src/content/topics/`**

- 保留 `.gitkeep`。
- 不创建实际专题。

**新增目录：`src/content/resources/`**

- 只增加 `.gitkeep`，不创建实际资源分类。

### 2. 简化专题解析与校验

**文件：`src/utils/topics.ts`**

- 基于显式三级 schema 重写目录解析，不再支持任意深度递归。
- 派生章节编号、完整 breadcrumb、文章顺序、文章数和最近更新时间。
- 保留 `article id -> topic context` 索引。
- 保留重复归属、失效引用、公开专题引用草稿文章的构建错误。
- 移除精选专题、计划完成百分比、封面色等逻辑。
- 对外只暴露：
  - `getResolvedTopics()`
  - `getArticleTopicContext(postId)`

**新增文件：`src/utils/resources.ts`**

- 加载并排序资源分类。
- 展平资源条目，校验重复 `href`。
- 解析专题引用并建立 `topic id -> related resource groups` 索引。
- 对外暴露：
  - `getResourceGroups()`
  - `getResourcesForTopic(topicId)`

### 3. 建立 Blog 内部双入口

**新增文件：`src/components/blog/BlogSectionNav.astro`**

- 提供 `全部文章` 与 `专题合集` 两个链接。
- 根据当前页面设置 `aria-current`。
- 使用轻量下划线或弱背景表达选中态，不做厚重 Tab 容器。
- 桌面与移动端保持同一结构。

**文件：`src/pages/blog/[...page].astro`**

- 在 `Blog` 标题下加入 `BlogSectionNav`，当前项为“全部文章”。
- 删除现有原型中位于文章列表上方的精选专题卡片轨道。
- 保留文章分页、标签侧栏和归档入口。

**文件：`src/pages/topics/index.astro`**

- 视觉上作为 Blog 的第二个视图：同样显示 `Blog` 标题和 `BlogSectionNav`，当前项为“专题合集”。
- 使用紧凑的纵向专题列表，而不是卡片墙。
- 零专题时显示克制的空状态。

### 4. 将专题展示改为 Notion 式目录

**删除文件：`src/components/topics/TopicCard.astro`**

- 不再使用封面卡片、渐变、进度条和悬浮抬升。

**新增文件：`src/components/topics/TopicListItem.astro`**

- 单行或双行展示专题标题、说明、状态、文章数和自动更新时间。
- 整行可点击，使用弱分隔线而非独立卡片背景。

**文件：`src/components/topics/TopicTree.astro`**

- 按“章节 / 子章节 / 文章或计划项”渲染固定三级结构。
- 全部默认展开，不增加折叠状态或客户端脚本。
- 文章显示标题、描述和日期；计划项弱化且不可点击。
- 保留编号、连接线、键盘焦点和移动端缩进限制。

**文件：`src/pages/topics/[...id].astro`**

- 删除封面 Hero、渐变背景和完成百分比。
- 使用普通内容页头展示标题、说明、状态、文章数和最近更新时间。
- 可选渲染专题 Markdown 正文作为导言。
- 展示完整专题目录。
- 在目录后按资源分类展示“相关资源”；无关联资源时完全不渲染该区。
- 保留 `CollectionPage` / `ItemList` JSON-LD。

### 5. 保留文章的单篇属性，同时补充专题上下文

**文件：`src/pages/blog/[...id].astro`**

- 按文章 id 获取可选专题上下文并传给 `BlogPost`。
- 不改变文章 URL、正文渲染或现有列表数据流。

**文件：`src/layouts/BlogPost.astro`**

- 保留当前未提交的版权块溢出修复。
- 专题文章在标题区域显示 `专题 / 章节 / 子章节` breadcrumb。
- 专题文章文末显示“返回专题、上一篇、下一篇”。
- 普通文章继续使用现有全站 `ArticleBottom`。
- 专题文章 JSON-LD 增加 `isPartOf`。

**文件：`src/components/topics/TopicBreadcrumb.astro`**

- 保留并适配固定三级路径。

**文件：`src/components/topics/TopicArticleNav.astro`**

- 保留专题内顺序导航。
- 去掉不必要的文章数装饰，仅保留返回专题和相邻文章。

### 6. 新增独立资源页

**新增文件：`src/components/resources/ResourceGroup.astro`**

- 展示分类标题、说明和资源列表。
- 每条资源显示名称、描述、类型标签和外链提示。
- 有专题关联时显示可点击的专题名称；没有关联时不留空位。
- 使用紧凑行列表和弱分隔线，不使用卡片墙。

**新增文件：`src/pages/resources/index.astro`**

- 按分类直接完整展示资源，不增加分类详情页。
- 页面顶部提供简短说明和分类锚点导航。
- 零资源时显示空状态。
- 页面内容由 Pagefind 自动索引，但不进入文章 RSS。
- 外链使用安全属性；站内文件路径正常打开。

### 7. 调整主导航

**文件：`src/site.config.ts`**

- 主导航改为：
  - `Blog`
  - `Resources`
  - `Links`
  - `About`
- 移除 `Books` 和 `Projects` 的导航入口。
- 保留 `/books`、`/projects` 页面和现有链接可访问性。
- 不把 `Topics` 放入主导航。

### 8. 补充作者维护文档

**文件：`README.md`**

- 在现有“文章格式”后增加“专题格式”和“资源分类格式”。
- 提供通用 frontmatter 示例：
  - 章节下直接放文章
  - 章节下包含子章节
  - `planned` 计划项
  - 资源的外链、站内文档和专题关联
- 说明引用值使用 Content Collection id，不带文件扩展名。
- 说明文章只能属于一个专题，资源可以关联多个专题。
- 说明重复文章、重复资源 URL、失效引用和草稿引用会导致构建失败。
- 不新增管理后台、Notion API 或自动同步流程。

## Assumptions & Decisions

- “专题”是 Blog 内的组织方式，不是主导航一级栏目。
- “资源”是独立内容类型，因此进入主导航。
- 一篇文章只允许一个主专题；跨主题发现继续依赖标签。
- 一个资源可以关联多个专题。
- 专题目录最多为“章节 / 子章节 / 条目”三级。
- 专题由单独文件集中编排，不在每篇文章 frontmatter 重复维护归属和顺序。
- 资源按“每个分类一个 Markdown 文件”维护。
- 专题与资源页面使用紧凑列表和文档目录风格，不使用封面卡片墙。
- 不显示完成百分比，因为计划项数量并不等于真实学习进度。
- 不提供拖拽、折叠记忆、站内编辑、评分、收藏、筛选或客户端状态。
- 不迁移现有 `Books`、`Projects`、友链或文章内容。
- 本次最终状态不包含实际 LLM 专题或资源数据。
- 现有文章 URL、首页文章流、标签、归档、搜索、RSS 均保持兼容。

## Verification

### 自动检查

1. 运行 `npm run check`，确认 Astro、TypeScript、Zod schema 和组件 props 无错误。
2. 运行 `npm run build`，确认静态生成、Pagefind、Sitemap、文章路由、专题路由、资源页和 RSS 均成功。
3. 检查最终 diff，确认未覆盖用户现有文章改动和布局溢出修复。

### 临时专题验收

实施时创建临时 fixture，验证后删除：

- 一个章节直接包含文章和计划项。
- 一个章节包含子章节，子章节再包含文章。
- 两篇已发布文章形成明确的上一篇/下一篇顺序。

验收：

1. `/blog` 顶部显示“全部文章 / 专题合集”，文章列表、分页、标签和归档不变。
2. `/topics` 使用紧凑列表展示专题，不出现封面卡片或进度条。
3. 专题详情完整展示最多三级目录、计划项和正文导言。
4. 专题文章显示 breadcrumb 和专题内导航。
5. 普通文章继续显示原有全站文章推荐。
6. 同一文章重复归入专题、引用不存在文章、公开专题引用草稿文章时，构建输出可定位错误。

### 临时资源验收

实施时创建两个临时资源分类，验证后删除：

- 一个外部网站资源。
- 一个站内文档路径。
- 一个关联专题的资源。
- 一个不关联专题的资源。

验收：

1. `/resources` 按分类和人工顺序完整展示资源。
2. 关联专题的资源同时出现在专题详情“相关资源”区。
3. 未关联资源只出现在资源总页。
4. 重复 `href`、无效专题引用、公开资源引用草稿专题时构建失败。
5. Resources 出现在主导航；Books、Projects、Topics 不在主导航。

### 视觉与可用性

1. 在桌面和移动端检查 `/blog`、`/topics`、专题详情、文章详情和 `/resources`。
2. 检查浅色与深色模式。
3. 确认三级目录、长标题和长 URL 不产生横向溢出。
4. 确认键盘焦点、`aria-current`、语义化列表和外链属性正确。
5. 删除所有临时 fixture 后再次运行 `npm run build`，确认零专题、零资源状态也能正常构建。
