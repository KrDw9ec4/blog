---
layout: ../layouts/AboutLayout.astro
title: "关于"
---

比起网上千篇一律的部署教程，我更想给出的是一个具有参考意义的实践方案。

## 2024 年

### 07-08

使用 [giscus](https://giscus.app/zh-CN) 作为评论系统，参照教程 [Astro 搭建博客系列](https://s.k1r.in/frg59r)。

### 06-22

将博客地址逐渐迁移到 k1r.in。

使用 [CloudFlare Worker](https://developers.cloudflare.com/workers/examples/redirect/#redirect-requests-from-one-domain-to-another) 实现 301 重定向跳转。

### 06-15

将博客部署到 [CloudFlare Pages](https://krdw.pages.dev/)，通过 CNAME 解析。

### 05-27

从 Hexo 迁移到 Astro，采用 [Astro-Paper](https://github.com/satnaing/astro-paper) 主题。

还是改回用文件名做永久链接而不是时间戳，原来的访问地址~~采用 Rewrite 重写~~采用 Redirect 重定向确保访问正常。

<div style="display: flex; flex-wrap: wrap;">
  <div style="flex: 1 1 50%; padding: 5px;">
    <img src="https://img.k1r.in/2024/05/picgo_5c6d1caeee1e6fd2bdfac68e1aa9a1e2.png" alt="原博客首页" style="width: 100%;">
  </div>
  <div style="flex: 1 1 50%; padding: 5px;">
    <img src="https://img.k1r.in/2024/05/picgo_99ae8351442d408b13718266311001cf.png" alt="原博客文章页" style="width: 100%;">
  </div>
  <div style="flex: 1 1 50%; padding: 5px;">
    <img src="https://img.k1r.in/2024/05/picgo_8db2fc022160cbc12ccdc3f6301c7f67.png" alt="现博客首页" style="width: 100%;">
  </div>
  <div style="flex: 1 1 50%; padding: 5px;">
    <img src="https://img.k1r.in/2024/05/picgo_0c60560c3ed79c04b8c0c961874f14e3.png" alt="现博客文章页" style="width: 100%;">
  </div>
</div>

### 05-15

添加 [sitemap](https://k1r.in/sitemap-0.xml)、使用 [Umami](https://s.k1r.in/5kh297) 进行统计。

### 02-02

~~将**永久链接**的格式改为 `:layout/:year:month:day:hour:minute:second/`，既能保证唯一性，也能确保路径不太长，之后应该就不会更改了。~~

### 02-01

**支持 RSS**，~~开始使用 GitHub 仓库的 Issue 作为留言板~~。

### 01-31

域名备案下来，正式上线博客，~~采用 hexo + butterfly，同时部署在[服务器](https://k1r.in) 和 GitHub 上~~。
