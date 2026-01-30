# Zenus10 Blog

一个基于 [Astro](https://astro.build/) 和 [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) 构建的个人博客网站。

## 项目简介

这是 Zenus10 的个人博客，采用现代化的静态站点生成技术，提供快速、简洁、优雅的阅读体验。

### 特性

- **高性能** - 基于 Astro 的静态站点生成，页面加载极速
- **响应式设计** - 完美适配桌面端和移动端
- **深色模式** - 支持浅色/深色主题自动切换
- **全站搜索** - 基于 Pagefind 的即时搜索功能
- **数学公式** - 支持 KaTeX 数学公式渲染
- **代码高亮** - Shiki 代码高亮，支持多种语言
- **SEO 友好** - 自动生成 sitemap、RSS 订阅
- **图片优化** - Sharp 图像处理，支持图片放大预览

## 技术栈

| 技术 | 说明 |
|------|------|
| [Astro](https://astro.build/) | 静态站点生成框架 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript |
| [UnoCSS](https://unocss.dev/) | 原子化 CSS 引擎 |
| [Sharp](https://sharp.pixelplumbing.com/) | 高性能图像处理 |
| [KaTeX](https://katex.org/) | 数学公式渲染 |
| [Pagefind](https://pagefind.app/) | 全站搜索 |

## 目录结构

```
├── public/              # 静态资源（图标、字体等）
├── src/
│   ├── assets/          # 图片、样式等资源
│   ├── components/      # 可复用组件
│   ├── content/         # 博客内容（Markdown/MDX）
│   │   └── blog/        # 博文目录
│   ├── layouts/         # 页面布局组件
│   ├── pages/           # 页面路由
│   ├── plugins/         # 自定义插件
│   ├── content.config.ts # 内容集合配置
│   └── site.config.ts   # 站点配置
├── astro.config.ts      # Astro 配置
├── uno.config.ts        # UnoCSS 配置
└── package.json
```

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) 18.0.0 或更高版本
- 推荐使用 [bun](https://bun.sh/) 或 npm 作为包管理器

### 安装与运行

```bash
# 克隆项目
git clone <your-repo-url>
cd astro-theme-pure

# 安装依赖
npm install
# 或使用 bun
bun install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 创建新文章

```bash
npm run new
# 或
bun new
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run preview` | 预览构建结果 |
| `npm run new` | 创建新文章 |
| `npm run format` | 格式化代码 |
| `npm run lint` | 代码检查 |
| `npm run check` | TypeScript 类型检查 |
| `npm run clean` | 清理构建文件 |

## 文章格式

在 `src/content/blog/` 目录下创建 Markdown 文件，文章需要包含以下 frontmatter：

```markdown
---
title: '文章标题'
publishDate: 2025-01-01
description: '文章描述（建议不超过 160 字符）'
tags:
  - 标签1
  - 标签2
language: 'Chinese'
heroImage: { src: './thumbnail.jpg', color: '#002980' }
draft: false
---

文章正文...
```

### Frontmatter 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题（最多 60 字符） |
| `publishDate` | 是 | 发布日期 |
| `description` | 是 | 文章描述（最多 160 字符） |
| `tags` | 否 | 标签数组 |
| `language` | 否 | 文章语言 |
| `heroImage` | 否 | 封面图片及主题色 |
| `updatedDate` | 否 | 更新日期 |
| `draft` | 否 | 是否为草稿（默认 false） |
| `comment` | 否 | 是否开启评论（默认 true） |

## 配置说明

### 站点配置

编辑 `src/site.config.ts` 文件来自定义站点信息：

```typescript
export const theme: ThemeUserConfig = {
  title: 'Zenus10 Blog',        // 网站标题
  author: 'Zenus10',            // 作者名称
  description: 'zenus10的博客',  // 网站描述
  // ...更多配置
}
```

### 样式自定义

- 全局样式：`src/assets/styles/app.css`
- UnoCSS 配置：`uno.config.ts`
- Astro 配置：`astro.config.ts`

## 部署

项目支持部署到多个平台：

- **Vercel** - 已集成 `@astrojs/vercel` 适配器
- **Netlify** - 已集成 `@astrojs/netlify` 适配器
- **其他静态托管** - 构建后将 `dist/` 目录部署即可

## 致谢

- [Astro Theme Pure](https://github.com/cworld1/astro-theme-pure) - 主题来源
- [Astro](https://astro.build/) - 静态站点生成框架
- [UnoCSS](https://unocss.dev/) - 原子化 CSS 引擎

## 许可证

基于 [Apache 2.0](LICENSE) 许可证开源。
