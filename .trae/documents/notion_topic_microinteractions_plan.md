# Notion 式专题页与微交互实施计划

## Summary

将专题从当前的“标题 + 纵向目录”升级为克制的知识库仪表盘，并把专题上下文延续到专题文章页。

设计方向：

- **专题详情页**：桌面端采用吸附式目录侧栏和主内容双栏布局；移动端收敛为专题信息、可展开目录和文章序列。
- **专题文章页**：保留现有文章目录（TOC），但在其上方加入紧凑专题导航，明确当前文章所处章节，并可跳回专题或切换相邻文章。
- **视觉识别**：每个专题在 Markdown frontmatter 配置一个项目已有的内置图标和一个受控强调色；不引入图片封面、渐变 Hero 或重型卡片。
- **微交互**：使用 Astro 已启用的 ClientRouter、CSS transition 和原生 `details`，提供层级进入、当前项、悬停与展开反馈；所有动效遵循 `prefers-reduced-motion`。

本轮不增加完成百分比、阅读账户、收藏、评论、客户端状态存储或动画依赖。专题的持续性以“文章数、最近更新、计划中条目”表达，不把写作过程误呈现为任务完成度。

## Current State Analysis

- `src/content.config.ts` 中的 `topics` collection 已支持状态、排序、草稿和固定三级的 `outline`。
- `src/utils/topics.ts` 已解析目录编号、面包屑、已发布文章数、最近更新时间和专题内上一篇/下一篇文章。
- `src/pages/topics/[...id].astro` 当前在单栏内顺序渲染标题、导言、`TopicTree` 和关联资源。
- `src/components/topics/TopicTree.astro` 已有章节层级、文章链接、计划条目、编号及键盘焦点，但没有专题视觉识别、侧栏布局或移动端展开控制。
- `src/layouts/BlogPost.astro` 已在专题文章的 Hero 下方渲染 `TopicBreadcrumb`，底部渲染 `TopicArticleNav`。
- `src/layouts/ContentLayout.astro` 已提供桌面端固定右侧 sidebar，文章页当前将 `TOC` 放入该 slot；这是专题文章页承载章节上下文的合适位置。
- `src/layouts/BaseLayout.astro` 已启用 `ClientRouter`，无需新增路由动画框架。
- 项目只提供 `astro-pure` 内置 `Icon` 组件，不包含完整 Lucide 包。专题图标将使用已存在的内置名称，不新增依赖。
- 当前已有专题 `AI 学习`、`产品学习`，各自只有一篇文章，因此界面必须在低内容量时仍然成立，不能依赖大规模文章卡片或复杂进度图表。
- 工作区存在大量未提交改动；实施只触及下述专题相关文件及两个专题内容文件，不回退或格式化无关文件。

## Information Architecture And Behavior

### 专题详情页

桌面端（`>= 1024px`）：

1. 左侧为 `TopicDirectory` 吸附侧栏：
   - 专题图标、名称、状态和文章数。
   - 紧凑的章节树，文章、计划中条目和资源入口分别以可识别状态呈现。
   - 当前页不是文章阅读页时不伪造“正在阅读”状态；文章条目只作为导航链接。
   - 侧栏高度受视口约束，超出时自身滚动。
2. 右侧为主内容：
   - 由图标、专题名、描述、状态、文章数和最近更新时间组成的无卡片标题区。
   - 可选专题导言。
   - 有节奏的“文章目录”序列；章节是排版分组，文章是可点击的连续条目，计划项保留为弱化的非链接条目。
   - 仅在有关联资源时展示“相关资源”区，沿用现有 `ResourceGroup`，不重复设计资源卡片。

移动端（`< 1024px`）：

- 取消双栏与 sticky。
- 将同一份目录放入原生 `<details>`，默认展开；标题行显示“目录”和文章数量。
- `summary` 的小箭头旋转与容器高度变化仅在允许动效时过渡。
- 主序列仍完整显示，不要求用户必须打开目录才能开始阅读。

### 专题文章页

- 保留现有文章 Hero、正文、TOC、版权和上一篇/下一篇导航。
- 新增 `TopicArticleSidebar`，用于将专题上下文放到文章原有右侧侧栏的最上方：
  - 专题图标与标题链接回 `/topics/<id>`。
  - 当前文章显示高亮状态与其章节 breadcrumb。
  - 同专题文章链接可直接切换；计划中条目显示为不可点击文本。
  - 现有文章 TOC 位于专题导航之后，以分隔线区隔，避免两套目录混淆。
- 将 Hero 下现有 `TopicBreadcrumb` 调整为紧凑“专题 / 章节路径”行，保留链接与可访问名称，但不再承担所有导航职责。
- 将底部 `TopicArticleNav` 视觉改为低边框的前后篇导航行，保持现有 URL、顺序和键盘可访问性；不新增“完成阅读”状态。

## Content Model And Defaults

### `topics` frontmatter 扩展

在 `src/content.config.ts` 的 `topics` schema 添加：

- `icon`：可选，受限为项目已支持的专题图标集合：`bulb | computer | document | book | list`。
- `accent`：可选，受限为主题安全的语义色：`cyan | green | amber | rose | slate`。

解析规则：

- `icon` 缺失时使用 `document`。
- `accent` 缺失时使用 `slate`。
- 不接受任意图标名或任意 CSS 色值，以保证构建时可校验、浅色/深色模式有稳定对比度。

更新现有内容：

- `src/content/topics/ai-learning.md`：`icon: bulb`，`accent: cyan`。
- `src/content/topics/product-learning.md`：`icon: computer`，`accent: amber`。

在 `src/utils/topics.ts` 的 `ResolvedTopic` 中暴露解析后的 `icon`、`accent` 和已发布文章顺序，供详情、目录与文章侧栏共用。文章数和最近更新时间继续使用既有派生逻辑；不添加完成百分比字段。

## Proposed Changes

### 1. 主题安全的专题元数据

**文件：`src/content.config.ts`**

- 为 topics schema 添加受限 `icon` 和 `accent` 字段及默认值。
- 保持现有 outline、文章引用校验和草稿规则不变。

**文件：`src/content/topics/ai-learning.md`、`src/content/topics/product-learning.md`**

- 为现有两个专题补充图标与强调色。
- 不调整标题、描述、目录、文章归属或 URL。

**文件：`src/utils/topics.ts`**

- 将专题的图标、强调色传递到 `ResolvedTopic`。
- 增加一个仅供视图使用的扁平目录辅助数据（包含文章/计划项的编号、标题、breadcrumb 与当前文章匹配信息），避免多个组件重复遍历 tree。
- 继续以现有的深度优先顺序决定上一篇/下一篇；不改变校验错误和静态生成路径。

### 2. 构建可复用的专题视觉和目录组件

**新增文件：`src/components/topics/TopicIdentity.astro`**

- 接收 `ResolvedTopic` 或显式 `title/icon/accent`。
- 使用 `astro-pure/user` 的 `Icon` 渲染内置图标。
- 输出小尺寸图标标记、专题名与 accent CSS custom property。
- 通过本地 CSS 映射五种受控强调色，在浅色和深色模式下分别提供文本、细线和弱背景值。
- 不创建独立卡片，不加阴影，不使用渐变或图片。

**新增文件：`src/components/topics/TopicDirectory.astro`**

- 复用 `ResolvedTopic` 的章节树和扁平条目数据。
- 支持 `variant: 'sidebar' | 'mobile' | 'article'` 与可选 `currentPostId`：
  - `sidebar`：专题详情桌面侧栏，章节树紧凑、可滚动。
  - `mobile`：`details/summary` 形式，默认 open。
  - `article`：专题文章侧栏，当前文章加 `aria-current='page'` 和 accent 标记。
- 文章链接使用 `data-astro-prefetch`，计划项不可点击且含“计划中”文本供屏幕阅读器识别。
- 在窄宽度下限制缩进和标题换行，避免目录横向溢出。

**文件：`src/components/topics/TopicTree.astro`**

- 改为主内容区的“文章目录”序列组件，不再同时承担左侧导航职责。
- 保留现有章节、子章节、文章、计划项和编号。
- 文章行改为清晰的数据库条目样式：编号、标题、描述、日期；悬停时仅出现 accent 左侧细线、文字变色和箭头位移。
- 计划项使用虚线与低对比文字，不加入 fake checkbox 或完成状态。

**文件：`src/components/topics/TopicListItem.astro`、`src/components/home/TopicPreview.astro`**

- 使用 `TopicIdentity` 显示专题图标和一致的强调色，而不重构它们的信息层级。
- 列表和首页预览继续只显示必要元数据，不复制详情页的目录或资源。

### 3. 重构专题详情页为知识库仪表盘

**文件：`src/pages/topics/[...id].astro`**

- 保留静态路径、JSON-LD、导言渲染和相关资源获取。
- 用专题专用 `topic-workspace` grid 替换现有单列 `max-w-4xl` 主体：
  - 桌面端：`TopicDirectory variant='sidebar'` + 主内容。
  - 移动端：在标题区后渲染 `TopicDirectory variant='mobile'`。
- 标题区使用 `TopicIdentity` 和 accent 细线，展示：
  - `Topic`
  - 状态
  - 已发布文章数
  - 最近更新时间（存在时）
- 目录区使用 `TopicTree`，相关资源区保持在目录之后。
- 空目录时保留现有空状态，但采用与专题 accent 一致的细节，不新增插画。
- 不修改 `/topics` 路由、meta、结构化数据或资源关联逻辑。

### 4. 将专题上下文带入文章阅读页

**新增文件：`src/components/topics/TopicArticleSidebar.astro`**

- 接收 `ArticleTopicContext` 和文章 `headings`。
- 首先渲染 `TopicDirectory variant='article' currentPostId=<id>`。
- 在专题导航与 TOC 之间渲染语义分隔标题“本文目录”。
- 接着直接使用现有 `TOC` 组件；无 headings 时仅保留专题导航。

**文件：`src/layouts/BlogPost.astro`**

- 专题文章时，用 `TopicArticleSidebar` 替代当前单独的 `TOC` sidebar slot；非专题文章维持原 TOC 行为。
- 传入当前文章 id 与 headings，保证当前项可识别。
- 将 `TopicBreadcrumb` 保留在 Hero 描述位，但压缩为路径上下文。
- 保持 `TopicArticleNav` 的数据与现有 previous/next 计算不变。

**文件：`src/components/topics/TopicBreadcrumb.astro`**

- 使用 `TopicIdentity` 的颜色变量做小型路径指示。
- 保持每一个链接、当前章节文本和 `data-pagefind-ignore`。
- 不添加客户端脚本或 hover 弹层。

**文件：`src/components/topics/TopicArticleNav.astro`**

- 移除当前明显的圆角卡片感，改为边框内的双列导航条。
- 只在 hover/focus 时强调箭头和 accent，空的 previous/next 列保持不渲染。
- 确保单个超长文章标题截断，不影响移动端的单列堆叠。

### 5. 增加有边界的微交互与可访问性

**文件：`src/components/topics/TopicDirectory.astro`、`TopicTree.astro`、`TopicIdentity.astro`、`TopicArticleNav.astro`，以及专题页局部样式**

- 统一交互速度为 `160–220ms`，只使用 `color`、`background-color`、`border-color`、小幅 `transform` 和 `opacity`。
- 文章条目 hover/focus：
  - accent 左侧线由透明过渡到可见。
  - 标题颜色切换到 accent。
  - 末尾箭头最多平移 `2px`。
- 专题页入场：
  - 利用现有 ClientRouter 的页面切换。
  - 仅对标题、元数据、目录区按短延迟逐项淡入上移；无循环动画、视差、光标跟随或滚动劫持。
  - 切换页面后使用 Astro 的页面生命周期事件重新标记入场状态，避免 ClientRouter 下仅首次加载生效。
- 移动目录：
  - 使用原生 `details`，保留键盘和辅助技术原生语义。
  - 图标旋转仅是视觉辅助，不拦截 summary 默认行为。
- 全部新 transition 和入场动画必须在 `@media (prefers-reduced-motion: reduce)` 中禁用；内容仍完整可访问。
- 为所有可点击的目录项、专题列表项、前后篇链接提供 `:focus-visible`，使用与 accent 区分度足够的 outline。
- 不增加自动播放、不透明遮罩、全屏弹层、悬停必需操作或仅靠颜色传达状态。

## Assumptions And Decisions

- 本轮覆盖专题详情页与归属专题的文章页；独立文章、Resources 工作台、主导航和首页其它分区不改。
- “Notion 式”指稳定的信息层级、页面内目录、连续条目和可维护的数据结构，不复制 Notion 的卡片/数据库视觉。
- 专题详情页桌面断点为 `1024px`，以避免当前 `ContentLayout` 文章侧栏和专题双栏在平板宽度竞争空间。
- 进度只显示文章数量、最新更新时间与计划中条目，不显示百分比、进度环或完成率。
- 专题图标来自现有 `astro-pure` 内置图标集，受 schema 枚举限制；不安装 Lucide 或任何动画/状态库。
- 强调色来自受控语义色枚举，保证对比度与深色模式一致性；没有独立封面图、渐变背景或装饰图片。
- 计划项继续由专题 outline 手动维护；不会自动由草稿文章推断。
- 当前仅有两篇专题文章时，所有布局与空状态仍必须自然，不依赖文章数达到某个门槛。

## Verification

### Automated

1. 运行 `npm run sync`，确认 topics schema、frontmatter 图标/强调色、引用类型均能生成。
2. 运行 `npm run check`，确认 Astro props、图标名称、目录组件和客户端脚本无类型错误。
3. 运行 `npm run build`，确认：
   - `/topics`
   - `/topics/ai-learning`
   - `/topics/product-learning`
   - 两篇归属专题的文章路由
   - 独立文章与现有 resources 路由
   全部可静态生成。
4. 对涉及文件运行 `git diff --check`，确认无空白错误。

### Detail Page Acceptance

1. `/topics/ai-learning` 和 `/topics/product-learning` 均显示各自配置的图标、强调色、状态、文章数与最近更新。
2. 桌面宽度下目录侧栏固定，主内容可正常滚动；侧栏超出视口时自身滚动。
3. 目录中的每个已发布文章指向正确 `/blog/<id>`；计划项不可点击且语义明确。
4. 有关联资源时仍在文章目录后显示；无资源专题不产生空容器。
5. 移动端不显示双栏，目录可通过原生 `details` 展开/收起，且不发生横向溢出。
6. 当前两个低内容量专题不出现大片空卡片、无意义进度条或视觉失衡。

### Article Page Acceptance

1. `ai/aistudy` 与 `webdesign/1` 的文章页右侧先显示专题导航，当前文章有可见且非仅颜色的状态。
2. 原文章 TOC 仍可用，位于专题导航之后；无 headings 的文章不显示空 TOC 标题。
3. Hero 中专题路径可链接回正确专题，路径文本在窄屏安全换行。
4. 底部上一篇/下一篇保持现有阅读顺序和链接；单篇专题时不出现伪造的前后篇链接。
5. 不属于专题的文章继续只显示原有 TOC 和推荐文章，不注入专题 UI。

### Motion, Accessibility, And Responsive

1. 鼠标 hover、键盘 focus、目录展开与页面切换均提供短促、一致的反馈。
2. 启用系统 `prefers-reduced-motion` 后，不再出现入场位移、箭头位移或旋转，但目录和全部导航可用。
3. 浅色与深色模式下 accent 文本、边框、焦点 outline 和状态标签均有足够对比度。
4. 以键盘完成：进入专题、遍历目录、打开移动目录、进入文章、返回专题、切换相邻文章。
5. 使用桌面、平板和窄手机视口检查：无横向滚动、无文字重叠、sticky 侧栏不遮挡页头或页脚。
6. 浏览器控制台没有新增错误，ClientRouter 页面切换后入场状态不会重复叠加或失效。
