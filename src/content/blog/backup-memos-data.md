---
author: KrDw
pubDatetime: 2024-01-25T03:00:19.000+08:00
modDatetime: 2024-01-25T16:42:46.000+08:00
title: 定期备份 memos 数据
featured: false
draft: false
tags:
  - server
  - memos
description: "创建 Bash 脚本，使用 crontab 创建定期任务，定期通过 Rclone 备份到阿里云 OSS 上。"
---

因为数据在自己手上，所以数据备份还是得自己来做，这里讲一下**使用 rclone 备份到阿里云 OSS 上**。

### (1) 创建一个 OSS bucket

参照网上教程创建一个 bucket（新建 buncket，填名称选地域其他默认即可），并创建一个子用户给 rclone 使用，记录 **AccessKey ID 和 AccessKey Secret**，待会要用。

其中要给 **OSS 访问桶的权限**：

![阿里云授权过程](https://img.kr4.in/2024/05/picgo_ccef7c2c3c6674a3d95b35f344ceb33d.png)

### (2) 安装并配置 rclone

你可以使用官网的一键安装脚本在 Linux 系统下安装 rclone

```bash
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

安装成功后：

1. 在命令行键入 `rclone config` 开始配置
2. 键入 `n` 表示新建一个配置
3. 键入一个配置名称（这里示例用 `example_name`）
4. 在弹出来的选项中找到并键入 Amazon S3 对应的序号（我这里为 `5`）
5. 在弹出来的选项中找到并键入 Alibaba OSS 对应的序号（我这里为 `2`）
6. 再键入 `1`
7. 键入上一步创建的子用户的 AccessKey ID：`XXXXX`
8. 键入上一步创建的子用户的 AccessKey Secret：`XXXXXXXXXXXXXXXX`
9. 在 bucket 的概览页找到并键入 Endpoint（地域节点）（我这里是 `oss-cn-chengdu.aliyuncs.com`）
10. 根据相应的权限情况选择，我这里选 `1`，私有
11. 选择存储类型，我这里选 `2`，标准存储
12. 键入 `n`，不进行高级配置
13. 检查配置，没问题键入 `y`
14. 再键入 `q` 退出配置。

### (3) 创建 Bash 脚本

对于 bash 脚本，你可以理解成命令行将逐行执行 bash 脚本。

下面是我使用的 Bash 备份脚本，你可以修改相应的路径和配置直接拿来使用。

```bash
#!/bin/bash

# cron: 每天凌晨六点执行一次
# 0 6 * * * /bin/bash /home/ecs-user/bash/memos_backup.bash

# 设置日志文件路径
LOG_FILE="/home/ecs-user/log/memos_backup.log"

# 停止 Docker 容器
echo "$(date +%Y-%m-%d\ %H:%M:%S)：开始停止 memos 容器……" >> "$LOG_FILE"
cd /home/ecs-user/docker/memos
sudo docker compose down

# 设置备份路径和备份文件名
BACKUP_DIR="/home/ecs-user/docker/memos"
BACKUP_FILE_NAME="memos_backup_$(date +%Y%m%d%H%M%S).tar.gz"
BACKUP_FILE="/home/ecs-user/backup/memos/$BACKUP_FILE_NAME"

# 设置 rclone 的配置名称和 OSS 的 bucket 名称
RCLONE_CONFIG_NAME="xxxxxx"
OSS_BUCKET_NAME="xxxxxx"
BACKUP_DEST_FILE="$RCLONE_CONFIG_NAME:$OSS_BUCKET_NAME/$(date +%Y/%m)"

# 获取备份前目录大小
before_size=$(du -sh "$BACKUP_DIR" | cut -f1)

# 记录目录列表到日志文件（一行显示）
echo -n "当前 memos 下文件列表：" >> "$LOG_FILE"
ls -m "$BACKUP_DIR" >> "$LOG_FILE"

# 打包 Docker 数据
tar -zcvf "$BACKUP_FILE" "$BACKUP_DIR"

# 获取备份后压缩文件大小
after_size=$(du -sh "$BACKUP_FILE" | cut -f1)

# 使用 rclone 上传备份文件到阿里云 OSS
rclone copy "$BACKUP_FILE" "$BACKUP_DEST_FILE"

# 删除本地多余的备份文件，只保留最新的三份
cd /home/ecs-user/backup/memos
ls -t memos_backup_* | tail -n +4 | xargs rm -f

# 记录备份时间和路径到日志文件
echo "$(date +%Y-%m-%d\ %H:%M:%S)：成功备份 memos 文件夹" >> "$LOG_FILE"
echo "备份文件：“$BACKUP_DEST_FILE/$BACKUP_FILE_NAME”，备份前目录大小：$before_size，备份后压缩文件大小：$after_size" >> "$LOG_FILE"

# 重新启动 Docker 容器
cd /home/ecs-user/docker/memos
sudo docker compose up -d
echo "$(date +%Y-%m-%d\ %H:%M:%S)：重新启动 memos 容器" >> "$LOG_FILE"
echo "====================" >> "$LOG_FILE"
```

我的文件架构是这样的：

```
~
├── backup
│   └── memos
│       ├── memos_backup_20240123060002.tar.gz
│       ├── memos_backup_20240124060002.tar.gz
│       └── memos_backup_20240125060002.tar.gz
├── bash
│   └── memos_backup.bash
├── docker
│   └── memos
│       ├── docker-compose.yaml
│       ├── memos_prod.db
│       ├── memos_prod.db-shm
│       └── memos_prod.db-wal
└── log
    └── memos_backup.log
```

### (4) 使用 crontab 创建定期任务

光是创建了 bash 脚本是需要我们手动执行的，这时你可以测试一下：

```
chmod +x ~/bash/memos_backup.bash
~/bash/memos_backup.bash
```

我们可以**使用 cron 创建一个定时任务来让云服务器定期运行备份脚本**：

```shell
crontab -e
```

在弹出来的编辑器添加一行：

```
0 6 * * * /bin/bash /home/ecs-user/bash/memos_backup.bash
```

就大功告成了，等着明早起床查看日志吧。

此外，网上常说服务器数据备份要遵循 321 原则，仁者见仁智者见智吧，我自己也只是弄了两套备份，一套从服务器备份到 OSS，一套从 OSS 备份到电脑本地。

**Windows 可以通过“计划任务程序”配合 `.bat` 批处理文件实现定时任务。**
