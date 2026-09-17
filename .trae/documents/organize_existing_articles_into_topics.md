# 现有文章专题整理计划

## Summary

基于当前 8 篇公开文章，只建立两个用于后续持续积累的专题：

1. `AI 学习`
2. `产品学习`

每个专题目前只收录一篇已经发布的文章，不添加 `planned` 计划项，不修改文章正文、frontmatter、文件位置或 URL。

其余 6 篇文章继续保持独立：

- `The Collapse`
- `关于找实习的经验分享`
- `mbti与荣格八维浅论（一）`
- `mbti与荣格八维浅论（二）`
- `基于Astro与netlify的博客搭建过程`
- `海子的诗——海子个人纪念网站的搭建`

这样可以先建立 AI 与产品两条真实使用中的内容轨道，同时避免为了覆盖全部文章而制造边界模糊的专题。

## Current State Analysis

- `src/content/blog/` 当前有 8 篇公开文章，全部保持独立 URL。
- `src/content/topics/` 目前只有 `.gitkeep`，没有实际专题内容。
- 专题 Content Collection、列表页、详情页、文章 breadcrumb 和专题内导航已经实现，无需修改代码。
- 专题 schema 支持 `title`、`description`、`status`、`order`、`draft` 和最多三级 `outline`。
- 专题中的文章使用 Content Collection id 引用；一篇文章最多只能属于一个公开专题。
- Blog 页面已经提供“全部文章 / 专题合集”入口。
- 本次涉及的两篇文章 id 分别是：
  - `ai/aistudy`
  - `webdesign/1`

## Proposed Changes

### 1. 新增 `AI 学习` 专题

**新增文件：`src/content/topics/ai-learning.md`**

frontmatter：

- `title: 'AI 学习'`
- `description: '记录 AI 行业趋势、LLM、Agent 与相关工具的学习和实践'`
- `status: ongoing`
- `order: 10`
- `draft: false`

目录结构：

- 章节：`趋势与实践`
  - 文章：`ai/aistudy`

不添加 LLM 基础、Agent 工程、Skill/记忆等计划项。后续只有在对应文章实际发布后，才向目录中增加新的章节或文章引用。

### 2. 新增 `产品学习` 专题

**新增文件：`src/content/topics/product-learning.md`**

frontmatter：

- `title: '产品学习'`
- `description: '记录产品方法、交互设计与 AI 产品相关的学习和实践'`
- `status: ongoing`
- `order: 20`
- `draft: false`

目录结构：

- 章节：`交互设计`
  - 文章：`webdesign/1`

`关于找实习的经验分享` 不归入该专题。后续产品文章发布后，再根据实际内容增加“问题定义”“用户研究”“AI 产品”等章节。

### 3. 保持现有文章不变

以下文件不修改：

- `src/content/blog/ai/aistudy.md`
- `src/content/blog/webdesign/1.md`
- 其余所有 `src/content/blog/` 文章

专题归属只由专题文件集中维护，避免文章 frontmatter 与专题目录形成两份数据源。

### 4. 不修改专题系统代码

以下现有能力直接复用，不做额外调整：

- `src/content.config.ts`
- `src/utils/topics.ts`
- `src/pages/topics/`
- `src/components/topics/`
- `src/pages/blog/[...id].astro`
- `src/layouts/BlogPost.astro`

单文章专题的文章详情页只显示“返回专题”，不会伪造上一篇或下一篇。

## Assumptions & Decisions

- 本次只建立 `AI 学习` 和 `产品学习` 两个专题。
- 两个专题状态均为 `ongoing`。
- 不创建任何未来文章计划项。
- 不为了提高专题覆盖率而归类 MBTI、求职、建站、海子项目或个人随笔。
- 不修改文章标签；标签继续承担跨主题检索。
- 不移动文章文件，不改变文章 URL、发布日期、标题或正文。
- 不向 Resources 添加专题关联；后续有明确相关资源时再单独维护。
- 专题正文保持为空，标题、说明和目录由 frontmatter 完整表达。
- `.gitkeep` 可以继续保留，不影响 Content Collection。

## Verification

### 自动检查

1. 运行 `npm run check`，确认两个专题文件符合 schema，文章引用有效。
2. 运行 `npm run build`，确认专题、文章、Pagefind 和 Sitemap 均成功生成。
3. 确认构建没有出现文章重复归属、草稿引用或失效引用错误。

### 页面验收

1. `/topics` 显示两个专题，顺序为：
   - AI 学习
   - 产品学习
2. `/topics/ai-learning` 显示“趋势与实践”章节和 `AI Daily Digest`。
3. `/topics/product-learning` 显示“交互设计”章节和 `产品设计学习笔记-界面交互`。
4. 两篇专题文章的标题区域分别显示正确的专题与章节 breadcrumb。
5. 两篇专题文章底部显示返回对应专题的入口，不显示不存在的上一篇/下一篇。
6. 其余 6 篇独立文章不显示专题 breadcrumb，继续使用原有文章推荐。
7. 桌面端和移动端均无目录溢出，深浅色模式样式正常。

### 内容审计

1. 最终 diff 只新增两个 `src/content/topics/*.md` 文件。
2. 不包含对现有文章、资源、导航、布局或专题系统代码的修改。
