# 博客“专题”文章合集实施计划

## Summary

在保留现有“单篇文章”模型、URL、标签、归档、搜索与 RSS 行为的前提下，为博客增加一层独立的“专题”组织能力：

- `/blog` 继续展示全部单篇文章，并在文章列表上方增加“精选专题”横向卡片区；没有精选专题时不渲染该区域。
- 新增 `/topics` 全部专题页，以及 `/topics/<专题 id>` 专题详情页；不修改顶部主导航。
- 专题由 `src/content/topics/` 下的 Markdown/MDX 文件管理。专题 frontmatter 同时维护元数据和任意深度的目录树，正文可作为专题导言。
- 目录树支持章节、已发布文章引用和“计划中”占位项；所有层级在详情页直接展开，形成 Notion 式知识树。
- 一篇文章最多归属一个专题。专题清单的深度优先顺序就是专题阅读顺序。
- 专题文章的标题区显示“专题 / 章节路径”，文末以专题内上一篇、下一篇和返回完整目录替换现有全站文章推荐；普通文章维持原行为。
- 本次只实现通用能力与作者文档，不提交 “LLM 学习”或其他实际专题。

## Current State Analysis

- `src/content.config.ts` 目前只注册 `blog` 和 `books` 集合。`blog` schema 不包含专题字段。
- `src/content/blog/` 已通过目录组织文件，但目录只参与文章 id 和 URL，例如 `ai/aistudy.md` 对应 `/blog/ai/aistudy`，目录自身没有元数据、排序或页面。
- `src/pages/blog/[...page].astro` 使用 `astro-pure` 的 `PostPreview` 分页展示全部文章，并在右侧展示标签。
- `src/pages/blog/[...id].astro` 为每篇文章提供当前全部文章列表；`src/layouts/BlogPost.astro` 使用该列表生成全站上一篇/下一篇推荐。
- 首页、标签页、归档页、搜索和 RSS 均以单篇 `blog` entry 为基本单位。新增专题不应改变这些既有数据流。
- 项目使用 Astro 5.18.2、Content Collections `glob` loader、Zod 3.25 和静态输出；当前版本支持 `reference('blog')`、`getEntry/getEntries` 与通过 `Astro.self` 递归渲染组件。
- `src/layouts/BlogPost.astro` 和 `src/layouts/ContentLayout.astro` 当前存在用户未提交的宽度/溢出修复。实施时必须在其基础上增量修改，不覆盖或回退这些变更。

## Content Model

### `topics` 集合

在 `src/content.config.ts` 新增 `topics` 集合：

- loader：`glob({ base: './src/content/topics', pattern: '**/*.{md,mdx}' })`
- `title`：必填，最多 60 字
- `description`：必填，最多 160 字
- `createdDate`：必填，作为尚无已发布文章时的日期回退
- `status`：`ongoing | completed | paused`，默认 `ongoing`；界面分别显示“更新中 / 已完成 / 已暂停”
- `featured`：布尔值，默认 `false`；决定是否出现在 `/blog`
- `order`：非负整数，默认 `0`；专题卡片先按此字段升序，再按自动计算的最近更新时间降序
- `heroImage`：可选，结构沿用博客文章的本地图片与 `color` 字段；图片必须与专题 Markdown 同目录并使用相对路径
- `draft`：布尔值，默认 `false`
- `outline`：任意深度的递归数组，节点为以下三种判别联合：
  - `section`：`type: section`、`title`、可选 `description`、`children`
  - `article`：`type: article`、`post: reference('blog')`
  - `planned`：`type: planned`、`title`、可选 `description`

专题正文不承担目录数据，可选用于写前言、学习目标或维护说明。

### 派生规则

新增统一的专题解析器，生成页面消费的 resolved model：

- 深度优先展开 `outline`，同时保留每篇文章的完整章节路径和目录编号。
- 文章在目录中的出现顺序就是专题上一篇/下一篇的顺序；`planned` 节点不进入可点击导航序列。
- 已发布数来自非草稿文章引用；计划数来自 `planned` 节点；进度为 `已发布数 / (已发布数 + 计划数)`。
- 最近更新时间取所有已发布引用文章的 `updatedDate ?? publishDate` 最大值；没有已发布文章时回退到专题 `createdDate`。
- 同一篇文章在同一专题重复出现，或跨专题出现，均抛出包含专题 id、文章 id 和目录路径的构建错误。
- 失效文章引用始终构建失败。
- 开发环境允许预览被引用的草稿文章并明确标记 Draft；生产构建中，公开专题引用草稿文章必须失败，并提示将其改为 `planned` 或先发布文章。
- 草稿专题不生成生产页面，也不参与生产环境的重复归属与草稿引用校验。

## Proposed Changes

### 1. 注册专题内容集合

**文件：`src/content.config.ts`**

- 定义递归 `outline` Zod schema，并注册 `topics` collection。
- 使用 Astro `reference('blog')` 保存文章引用，避免手写 URL。
- 保留现有 `blog`、`books` schema 和导出行为。

**文件：`src/content/topics/.gitkeep`**

- 保留空的专题内容目录，使本次不创建实际专题时仓库结构仍完整。

### 2. 建立专题解析、校验与导航上下文

**新增文件：`src/utils/topics.ts`**

- 定义页面使用的 `ResolvedTopic`、递归节点、文章节点和 `ArticleTopicContext` 类型。
- 封装专题与文章加载、草稿过滤、递归解析、统计、日期计算和稳定排序。
- 建立全局 `article id -> topic context` 索引，并执行失效引用、重复归属和生产草稿引用校验。
- 暴露三类稳定接口：
  - 获取全部已解析专题
  - 获取精选专题
  - 按文章 id 获取专题、章节 breadcrumb、上一篇和下一篇
- 所有专题页面和文章页只消费该模块，避免各页面分别实现一套递归和校验逻辑。

### 3. 新增专题展示组件

**新增文件：`src/components/topics/TopicCard.astro`**

- 展示标题、描述、手动状态、已发布/计划数量、自动进度和最近更新时间。
- 支持可选 `heroImage`/主题色；无图片时使用现有主题 token 的克制背景，不使用外部占位图。
- 保持卡片紧凑、整卡可点击、键盘焦点清晰，并适配深浅色模式。

**新增文件：`src/components/topics/TopicTree.astro`**

- 使用 `Astro.self` 递归渲染任意深度的语义化嵌套列表。
- `section` 显示层级编号、标题、可选说明与连接线；`article` 显示文章标题、日期/描述并链接原 `/blog/<id>`；`planned` 使用弱化样式和“计划中”标识且不可点击。
- 所有节点默认展开，不引入折叠 JavaScript。
- 移动端逐级减少缩进增量并限制总缩进，避免深层目录挤压正文或横向溢出。

**新增文件：`src/components/topics/TopicBreadcrumb.astro`**

- 在文章标题区展示可点击专题名和完整章节路径。
- 使用 `nav`、`aria-label` 和可换行的 breadcrumb，保证深层路径在窄屏可读。

**新增文件：`src/components/topics/TopicArticleNav.astro`**

- 显示返回专题完整目录，以及专题内上一篇/下一篇。
- 只使用已发布文章序列；计划项不会生成死链。
- 沿用当前文章底部导航的紧凑布局、截断和移动端堆叠方式。

### 4. 新增专题路由

**新增文件：`src/pages/topics/index.astro`**

- 使用 `BaseLayout` 输出“全部专题”页面，入口返回 `/blog`。
- 按统一排序展示全部非草稿专题卡片。
- 没有专题时显示明确空状态，不影响 `/blog` 的现有布局。
- 设置中文页面 title、description、canonical 等既有 `BaseHead` 元数据。

**新增文件：`src/pages/topics/[...id].astro`**

- 为每个非草稿专题静态生成 `/topics/<id>`，兼容专题文件的嵌套 id。
- 头部展示专题标题、描述、状态、进度、计数、最近更新时间和可选封面。
- 可选渲染专题 Markdown 正文作为导言，随后渲染完整 `TopicTree`。
- 输出 `CollectionPage`/`ItemList` JSON-LD，已发布文章按目录顺序进入列表，计划项不伪装成可访问页面。
- 页面可被 Pagefind 正常索引；文章仍保留自身搜索结果与 URL。

### 5. 将精选专题嵌入 Blog

**文件：`src/pages/blog/[...page].astro`**

- 在 Blog 标题与当前“最新文章 + 标签侧栏”区域之间增加精选专题区。
- 精选专题使用单行横向卡片轨道：桌面可同时看到多张，移动端横向滚动并提供 scroll snap。
- 展示“查看全部专题”链接到 `/topics`。
- 没有精选专题时完全不渲染标题、空容器或额外留白；现有文章分页、标签和归档入口保持不变。

### 6. 联动文章详情页

**文件：`src/pages/blog/[...id].astro`**

- 构建专题索引，并按当前文章 id 计算可选 `ArticleTopicContext`。
- 将 context 传入 `BlogPost`；文章正文渲染方式和现有 URL 不变。

**文件：`src/layouts/BlogPost.astro`**

- 扩展可选 `topicContext` prop。
- 有专题上下文时，在 `Hero` 的标题信息区域加入 `TopicBreadcrumb`。
- 文末版权块继续保留；有专题时使用 `TopicArticleNav` 替换 `ArticleBottom`，无专题时继续使用当前全站文章推荐。
- `BlogPosting` JSON-LD 在专题文章上增加 `isPartOf` 指向对应 `CollectionPage`。
- 保留该文件当前未提交的 `.article-copyright` 溢出修复。

`src/layouts/ContentLayout.astro` 不需要为专题功能继续修改；实施中只确认其现有未提交修复未被覆盖。

### 7. 补充作者使用文档

**文件：`README.md`**

- 在现有“文章格式”之后增加“专题格式”章节。
- 给出不落地到内容目录的通用 frontmatter 模板，覆盖多级 `section`、`article` 引用、`planned` 占位、精选、状态和排序字段。
- 说明文章引用使用 Content Collection id（例如目录相对 `src/content/blog` 的无扩展名路径），文章 URL 不变。
- 说明一篇文章只能出现在一个公开专题中，以及失效引用、重复引用、生产环境草稿引用会使构建失败。
- 说明把计划项发布为文章时，将对应 `planned` 节点替换成 `article` 引用即可。

## Assumptions & Decisions

- 对外名称统一使用“专题”；路由使用稳定英文 `/topics`。
- 专题是文章的额外组织层，不是新的文章类型。专题中的文章仍进入首页文章流、标签、归档、搜索和 RSS。
- 专题归属只在专题清单维护，不给每篇文章重复添加 `topic/path/order` frontmatter，避免移动章节时多处同步。
- 专题目录允许任意深度，但页面始终完整展开；不实现折叠状态、拖拽编辑或客户端管理后台。
- 管理方式保持 Git + Markdown，不接入 Notion API、数据库、认证或站内编辑。
- `/blog` 只展示 `featured: true` 的专题；`/topics` 展示全部公开专题。
- `/blog` 没有专题时保持当前外观；本次最终仓库状态不会包含示例专题。
- 顶部主导航不新增入口。
- 普通文章的文末推荐保持不变；专题文章只显示专题内导航，避免出现两套互相竞争的上一篇/下一篇。
- 不改现有文章文件名、目录或 URL，不做内容迁移。

## Verification

### 自动检查

1. 运行 `npm run check`，确认 Astro/TypeScript、递归 schema 和所有组件 props 无错误。
2. 运行 `npm run build`，确认静态生成、Pagefind、专题路由、文章路由、RSS 与既有页面全部成功。
3. 确认最终 `git diff` 不包含对现有文章内容、文章 URL、导航配置或用户未提交修复的意外修改。

### 临时内容验收

实施时创建一个仅用于本地验证、完成后删除的专题 fixture：

- 至少三层 `section`
- 两篇现有已发布文章引用
- 一个 `planned` 节点
- `featured: true`
- 可选本地封面

使用该 fixture 验证：

1. `/blog` 出现精选专题横向卡片，分页文章列表和标签侧栏保持正常。
2. `/topics` 展示全部专题，卡片状态、计数、进度与更新时间正确。
3. 专题详情完整展开多级目录，编号、连接线、文章链接与计划样式正确。
4. 专题文章显示 breadcrumb；文末上一篇/下一篇遵循目录深度优先顺序并可返回专题目录。
5. 非专题文章仍显示原有 `ArticleBottom`。
6. 桌面、移动端、浅色和深色模式均无横向溢出，键盘焦点与语义标签可用。

### 失败模式验收

分别使用临时 fixture 验证并在完成后删除：

1. 同一文章重复出现在一个或多个公开专题时，构建输出可定位的重复归属错误。
2. 引用不存在的文章 id 时，构建输出专题 id、文章 id 和目录路径。
3. 公开专题引用草稿文章时，开发环境可预览 Draft 标识，生产构建明确失败。
4. 删除所有临时专题后再次运行 `npm run build`，确认零专题状态可正常构建且 `/blog` 不出现空专题区。
