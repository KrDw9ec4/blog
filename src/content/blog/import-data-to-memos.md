---
author: KrDw
pubDatetime: 2024-01-25T02:57:18.000+08:00
modDatetime: 2024-05-19T20:52:10.000+08:00
title: 导入历史数据到 memos
featured: false
draft: false
tags:
  - server
  - memos
  - python
description: "如果是从别的平台迁移到 memos，可能需要将之前的数据导入到 memos，本文是一个思路参考。"
---

### Table of Contents

> ⚠️ 由于 memos 版本更新，数据库结构发生变化，以下内容仅供参考。
>
> （其实主要是思路，现在数据库结构可以打开看看，对应结构导入就行）

至此，我们已经完成了 memos 服务的搭建，你可以从现在开始在 memos 记录自己的想法了。但如果你像我一样，之前已经在别的平台记录了很多，想要迁移到 memos，那么也是可以实现的。

我们可以通过**操作 `memos_prod.db` 数据库文件**来实现这个功能，我先说明，这个方法**需要有一定的 Python 基础**（配合 ChatGPT 能看懂代码就行）。

#### (1) 查看 `memos_prod.db` 数据库

memos 默认是采用 SQLite 数据库类型，我们可以使用 [DB Browser for SQLite](https://sqlitebrowser.org/) 这个可视化工具查看我们的数据库。

如果你没有数据库相关知识也没关系，我也没有XD

我们从云服务器将 `memos_prod.db` 文件下载到本地，使用 DB Browser for SQLite 打开数据库如下：

![数据库表的说明](https://img.k1r.in/2024/05/picgo_bfa079ff23f00ac84788a06e52b3d3ed.png)

右键 memo 表点击“浏览表”：

![memo表的说明](https://img.k1r.in/2024/05/picgo_c37ff7c7bf5195039806a3d3c368e48e.png)

#### (2) 将历史记录转换为 csv 文件

我们可以看到在 memos，一条数据主要由 memo id、创建者 id、创建&更新时间戳、内容和可视性组成，我们需要通过 Python 生成一个与上述表对应的 csv 文件，然后再用 DB Browser for SQLite 导入 csv 文件即可。

下面是我问 ChatGPT 加上自己更改后的代码，你可以参考并作出补全修改：

```python
import os
import csv
from datetime import datetime

exported_data = None
data = []

# 定义一些固定属性
creator_id = 2
row_status = "NORMAL"
visibility = "PRIVATE"


def get_timestamp(exported_data):
    """
    从导出的数据中获取时间戳
    - 输入：导出的数据
    - 输出：时间戳
    """
    date_time_str = "2024-01-25T02:19:00"
    timestamp = int(datetime.strptime(date_time_str, "%Y-%m-%dT%H:%M:%S").timestamp())
    return timestamp


def get_content(exported_data):
    """
    从导出的数据中获取内容
    - 输入：导出的数据
    - 输出：内容
    """
    content = exported_data
    return content


# 遍历文件夹及其子文件夹下的所有文件
# 先不要添加 memo id
data.append((creator_id, get_timestamp(exported_data), get_timestamp(exported_data), row_status, get_content(exported_data), visibility))
data = sorted(data, key=lambda x: x[1])

# 写入 CSV 文件
with open('memo.csv', 'w', newline='', encoding='utf-8') as csvfile:
    writer = csv.writer(csvfile)

    # 写入 CSV 文件的头部
    writer.writerow(["creator_id", "created_ts", "updated_ts", "row_status", "content", "visibility"])

    # 写入数据
    for row in data:
        writer.writerow(row)

print("CSV 文件已生成：memo.csv")
```

#### (3) 导入 csv 文件

DB Browser for SQLite 打开 `memos_prod.db` 文件，点击左上角“文件” -> "导入" -> “从 csv 文件导入表”。

在弹出的窗口确定“表名称”是 memo，“列名在首行”勾选，确认导入即可。

#### (4) 使用新的数据库文件

将新的数据库文件上传到服务器，假设在 docker/ 文件夹下：

```
docker/
├── memos/
│   ├── docker-compose.yaml
│   └── memos_prod.db
│   ├── memos_prod.db-shm
│   └── memos_prod.db-wal
└── memos_prod.db
```

确保终端在 memos/ 文件夹下，

```shell
cd docker/memos
```

暂停 memos 容器，

```shell
sudo docker compose down
```

用新的数据库文件覆盖旧的数据库文件，

```shell
sudo mv ../memos_prod.db memos_prod.db
```

重新启动 memos 容器，

```shell
sudo docker compose up -d
```

最后你可以打开浏览器查看是否成功。

#### (5) 一些完善数据库的补充

除了 memo 这张表需要修改之外，其他表作出相应的导入能更好地适配 memos。

**memo_relation**：这张表是记录 memo 之间的关系。

| memo_id   | related_memo_id  | type              |
| --------- | ---------------- | ----------------- |
| id        | id               | REFERENCE/COMMENT |
| 当前 memo | 引用/评论的 memo | 引用/评论         |

**resource**：这张表是记录使用的附件的，会在资源库显示。

> 下面的表格是使用图床作为存储系统的 resource 表参考
>
> 注：**图床外链用的桶要和存储系统设置的桶相同**才能成功加载，否则会加载失败。

| id                          | creator_id | created_ts | updated_ts | filename | blob       | external_link | type       | size     | internal_path | memo_id      |
| --------------------------- | ---------- | ---------- | ---------- | -------- | ---------- | ------------- | ---------- | -------- | ------------- | ------------ |
| resource_id                 | creator_id | created_ts | updated_ts | filename | NULL       | 外链          | Image/\*等 | 0        |               | id           |
| 附件的 id（memo id 在最后） | 创建者 id  | 创建时间戳 | 更新时间戳 | 文件名   | 二进制数据 | 附件外链      | 附件类型   | 附件大小 | 空            | 对应 memo id |

至于其他存储结构可以自己尝试出来，我这里就不列举了。

**tag**：这张表是记录使用的标签的，在首页显示。

| name   | creator_id |
| ------ | ---------- |
| 标签名 | 创建者 id  |
