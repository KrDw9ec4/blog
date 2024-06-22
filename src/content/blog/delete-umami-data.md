---
author: KrDw
pubDatetime: 2024-06-16T12:19:06.000+08:00
modDatetime: 2024-06-16T19:01:28.000+08:00
title: 删除 Umami 无用数据
featured: false
draft: false
description: "删除 Umami 因本地调试产生的无用数据。数据无价，请提前备份好文件，先在测试环境测试无误后，再到生产环境中进行操作。"
---

### 前言

虽然我的博客访问量不高，但我仍然使用自部署的 [Umami](https://umami.is) 进行网站流量统计。之前没有使用过相关工具，所以直接使用了 Umami 提供的默认追踪器代码。

然而，这带来了一个问题：我在本地调试博客时，Umami 无法过滤掉本地数据，导致统计数据中包含了大量我自己调试时的数据。特别是昨天我在修改博客的搜索功能（目前已暂时下线）时，由于代码问题，导致 `/search/` 页面访问量暴增。

![Umami统计到的错误数据](https://img.k1r.in/2024/06/picgo_50f892f7c2dc93be111d846a60eb7381.png)

参考官方文档 [Tracker configuration](https://umami.is/docs/tracker-configuration) 后，我了解到可以通过在追踪器代码中添加 `data-domains` 属性来解决这一问题，从而避免统计到本地调试的数据。

```html
<script
  defer
  src="https://xxxxxxxxxxxxx"
  data-website-id="xxxxxxxxxxxxxxxxxxxxxx"
  data-domains="k1r.in,krdw.pages.dev"
></script>
```

木已成舟，之前的错误数据已经产生，如何删除这些错误数据呢？可以通过对 Umami 的数据库进行手动删除。

***温馨提示：数据无价，请提前备份好文件，先在测试环境测试无误后，再到生产环境中进行操作。***

### 连接到 PostgreSQL 数据库

(1) 切换到 Umami 的 docker compose 文件所在目录

```shell
cd ~/docker/compose/umami/
```

(2) 进入 PostgreSQL 容器

```shell
docker compose exec db bash
```

(3) 连接到 PostgreSQL 数据库

下面两个 umami 分别是你数据库的用户密码，请自行修改。

```shell
psql -U umami -d umami
```

### 查询相关数据

使用 `\dt` 查看数据库中的所有表，再一一查看表数据得知统计数据存储在 **website_event** 表中。

*如果不会写 SQL 语句，可以面向 ChatGPT 操作。*

比如我这里就需要统计网页路径为 search 和来源域名是 100.100.1.1 的数据数量，你可以**打开 Umami Dashboard 查看网站所有时间段的数据量，确认数字是否正确**。

```sql
SELECT COUNT(*) FROM website_event
WHERE referrer_domain = '100.100.1.1';
SELECT COUNT(*) FROM website_event
WHERE url_path LIKE '%search%';
```

### 删除错误数据

如果确认了哪些数据需要删除，可以用下面的命令删除。

```sql
DELETE FROM website_event
WHERE referrer_domain = '100.100.1.1';
DELETE FROM website_event
WHERE url_path LIKE '%search%';
```

这里可能会出现和之前查询的数量不匹配，这是因为两者数据有交集。

再次查询以确认删除成功。

```sql
SELECT COUNT(*) FROM website_event
WHERE referrer_domain = '100.100.1.1';
SELECT COUNT(*) FROM website_event
WHERE url_path LIKE '%search%';
```

### 重启 Umami 容器

(1) 退出 PostgreSQL 和容器

```sql
\q
```

```shell
exit
```

(2) 重启 Umami 容器

```shell
docker compose restart
```

大功告成，打开 Umami Dashboard 查看是否成功删除。