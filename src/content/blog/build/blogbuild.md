---
title: 'The Blog'
publishDate: 2025-10-13
description: '详细记录使用Astro框架和Pure Theme搭建个人博客，并通过GitHub和Netlify完成自动化部署的完整建站过程'
tags:
  - astro
  - netlify
  - dev
language: 'Chinese'
heroImage: { src: './thumbnail.jpg', color: '#003cffff' }
draft: false
comment: false
---




## 1. 前言

本站采用Astro框架+Pure Theme，使用GitHub+Netlify部署

> 👉[Astro官方文档](https://docs.astro.build/zh-cn/guides/deploy/)
>
> 👉[本站参考模板](https://github.com/cworld1/astro-theme-pure)

* 我为什么选择astro?

  一是“零 JavaScript 默认”，静态优先，seo友好；二是采用群岛架构，组件化开发，且多框架支持，开发体验很好；三是官方文档很详细，适合新手上手搭建。

* 我为什么选择Pure Theme？

  满足我对设计优雅和功能简洁的双重要求，在开发过程中发现其组件也很完善（虽然个人再修改略有麻烦）

* 准备工作

  1.github&netlify账号

  2.[Nodejs](https://nodejs.org/):

   最低支持版本为：v18.20.8、v20.3.0 和 v22.0.0。（注意：v19 和 v21 版本不受支持。）你可以通过`node -v` 来检查
  
  3.npm / pnpm（本教程使用 `npm`）

## 2. 模板拷贝及部署

### 2.1 模板拷贝

👉[官方模板网页](https://astro.build/themes/)

选择你喜欢的模板之后，有两个方法拷贝，这里以我选择的模板astro-theme-pure举例：

你可以：

1. 克隆仓库到本地

   ```
   git clone https://github.com/cworld1/astro-theme-pure.git
   cd astro-theme-pure
   ```

2. 安装依赖

   ```
   npm install
   ```

也可以：

```
npm create astro@latest --template astro-theme-pure
```

拷贝完毕后你可以运行来检验是否成功：

```
npm run build
npm run dev
```

### 2.2 部署

1. 进入[Netlify](https://netlify.com) 

2. 单击Add new site > Import an existing project

   系统会要求你连接到 Git 提供商。选择 GitHub 并按照屏幕上的步骤验证你的 GitHub 账号。然后，从提供的列表中选择你的 Astro 项目的 GitHub 仓库。

3. 在最后一步，Netlify 将向你显示应用程序的站点设置。对于你的 Astro 项目，默认值应该是正确的，因此你可以向下滚动并单击 Deploy site。

到这里其实已经算部署好了，在 Netlify 中的预览页面上，你可以随机生成的项目名称，以及格式为`https://project-name-123456.netlify.app`的URL。在这里你可以进一步更改为自己的域名。（比如像帅气的[zenus10.com](https://zenus10.com/)等）

如果你羡慕帅气的zenus10，你可以去看看：

👉[如何拥有一个属于自己的域名？](https://www.dingyuqi.com/article/70yrnil2/)

👉[手把手教你使用Netlify部署博客及部署自动化](https://zhuanlan.zhihu.com/p/55252024)

## 3. 个性化设置

🫠这一部分要看个人的喜好了，个人建议先阅读模板自带的文档和astro官方的文档，熟悉一下项目结构。

我的过程思路大概是：第一步可以按照[模板文档](https://astro-pure.js.org/docs)来进行一些基本的站点修改等操作，然后替换自己的博客文章、修改about页面、修改友链链接、替换自己的头像等个性化操作；第二步可以对自己用不上的一些功能进行删改，我个人只保留了blog、links等页面，主页进行了精简，删除了comments和Sponsorship等组件。。。

## 4. 遇到的一些问题及解决方案

1. 删除原有博客时报错

   在删除模板自带博客示例时，页面报错

   ```
    [ImageNotFound] Could not find requested image...
   ```

   显示仍有页面或组件引用被删除的图片，但检查一番后发现并无引用

   解决方案：

   删除缓存文件夹，将根目录下的dist、.astro和node_modules/.astro删除，重新npm run dev成功

   

2. 上传到github后netlify部署出来的页面报错

   本地运行成功，上传github成功，但搜索域名页面加载失败

   报错

   ```
   Page not found
   Looks like you’ve followed a broken link or entered a URL...

​	解决方案：

​	使用 Netlify CLI

```
# 安装 Netlify CLI
npm install -g netlify-cli

# 登录
netlify login

# 部署
netlify deploy --prod --dir=dist
```



此板块持续更新中...

