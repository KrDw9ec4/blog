---
author: KrDw
pubDatetime: 2024-11-16T17:00:00.000+08:00
title: 使用 Xpath 进行网页抓取（FreshRSS）
category:
  - Server
tags:
  - freshrss
  - rss
description: "在 FreshRSS 中，使用 HTML + XPath 进行网页抓取，并配合原文的 CSS 选择器获取原文。"
---

网上关于安装 FreshRSS 的教程很多，但有关如何使用 Xpath 进行网页抓取的教程是寥寥无几，下面分享一下 **FreshRSS 的“HTML+XPath（Web 抓取）”** 的订阅源类型的使用教程。

基本不用去了解 Xpath 语法，我也是最近才接触 XPath 语法，我也会放个视频展示完整步骤，保证你一看就懂。

我之前也写过一篇博客介绍如何[打造自己的RSS信息流](../build-your-rss-flow/)，你也可以先去看一下，在体验了如今大火的 Follow 之后，我还是坚持用这一套流程。

> 从 RSSHub 和 WeWeRSS 获取 RSS 订阅源链接，部分使用 rss-proxy 进行代理，使用 FreshRSS 作为 RSS 服务端，安卓使用 ReadYou 进行阅读。

### 总体思路

1. 使用浏览器自带的检查工具（`F12`）里的元素选择工具，复制网页元素的 XPath 路径。
2. 选择不同标题/链接/内容/...，寻找 XPath 语句的规律，确认一个通用的 XPath 路径。
3. 确认具体要选择的属性节点/文本节点，链接加上 `/@href`，缩略图加上 `/@src`，取文本加上 `/text()`。
4. 删除重复路径，修改为相对于文章条目的相对路径。（这点很重要，我之前多次失败就是因为这个）
5. 搭配“原文的 CSS 选择器”获取原文。

### 使用示例

**案例演示视频：[使用 Xpath 进行网页抓取案例（FreshRSS）](https://www.bilibili.com/video/BV1tdUaYvE4i/)**

这里以[中羽在线的羽坛动态](https://www.badmintoncn.com/list.php?tid=13)为例，FreshRSS 添加订阅源。

**源地址**填：`https://www.badmintoncn.com/list.php?tid=13`

**订阅源类型**选择：“HTML + XPath（Web 抓取）”。

**订阅源标题**填：`/html/head/title`

XPath 定位以**寻找文章**：`/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li`

```
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[1]
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[3]
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li
```

**文章标题**：`./div[1]/a/text()`

```
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[1]/div[1]/a
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[2]/div[1]/a
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/div[1]/a
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/div[1]/a/text()
=> ./div[1]/a/text()
```

**文章内容**：`./p/text()`

```
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[1]/p/text()
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[2]/p/text()
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/p/text()
=> ./p/text()
```

**文章链接**：`./div[1]/a/@href`

```
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[1]/div[1]/a
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[2]/div[1]/a
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/div[1]/a
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/div[1]/a/@href
=> ./div[1]/a/@href
```

**文章缩略图**：`./a/img/@src`

```
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[1]/a/img
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[2]/a/img
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/a/img
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/a/img/@src
=> ./a/img/@src
```

**文章作者**：`中羽在线`

**文章日期**：`./div[2]/text()[1]`

```
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[1]/div[2]/text()[1]
/html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li[2]/div[2]/text()[1]
=> /html/body/div[2]/div[5]/div[1]/div[2]/div[1]/ul/li/div[2]/text()[1]
=> ./div[2]/text()[1]
```

**自定义日期/时间格式**：`Y-m-d`

高级 > **原文的 CSS 选择器**：`.content`

> 视频中虽然没展示，但其实这里也是可以通过元素选择器直接复制的。
>
> 复制 > **复制 selector**。