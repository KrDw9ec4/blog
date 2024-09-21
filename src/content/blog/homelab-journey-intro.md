---
author: KrDw
pubDatetime: 2024-09-21T14:30:00.000+08:00
modDatetime: 2024-09-21T14:30:00.000+08:00
title: 从零搭建家庭服务器实践系列 - 序
featured: true
draft: false
tags:
  - homeserver
description: "介绍一下从笔记本服务器到自组 NAS 的过程与思路，对系列文章进行说明。"
---

### 前言

我用一台十年前的 Thinkpad [笔记本搭建本地服务器](../building-homeserver-with-laptop/)折腾了小半年之后，大致确定了自己的需求：

- 一台能 7\*24 小时运行的机器，方便我部署应用满足下面的需求。
- 文件同步：使用 Syncthing 在多台设备之间同步文件。
- 文件备份：同步到机器上的文件需要进行备份，进而上传到云。
  - 照片同步与备份：使用 immich 进行照片管理。
- 影音书漫：使用 qbittorrent 下载资源，并用 jellyfin 等进行刮削。

其实就上面这些需求，这台笔记本一开始还是能勉强满足的，之后到后面遇到了一下硬件上的问题：

- 硬盘是通过 USB 外挂的，之前当做移动硬盘时格式化成 exfat，直接用了，后面打算用硬链接整理下载的资源时才发现 exfat 不支持硬链接，为时已晚。
- CPU 只有 2 核，内存也只有 4G，后面部署 immich 出现了性能瓶颈。

于是，花小半个月~~纠结~~搜集好信息，并且确定了系统选型之后，决定自己组一台 NAS，或者说 HomeLab。

### 系列说明

这是一个系列，主要讲我是**如何从零搭建家庭服务器，分享我的实践方案**（而非教程）供你参考。

我大致确认了要写下面几篇文章（参照前面说的需求，标题内容暂定），尽量在年内写完 :D

**(1) 使用 ProxmoxVE + TrueNAS + Debian 搭建 Homelab 框架** 1️⃣

主要讲硬件选择和系统选型，用 ProxmoxVE + TrueNAS + Debian 搭建出 Homelab 的框架。

在参照 [Aquar系统搭建指南](https://github.com/firemakergk/aquar-build-helper) 搭建使用了一个月之后，但说实话使用下来有一点别扭（但大致思路很不错），根据自己需要进行调整，总算找到一个满意的方案。

**(2) [使用 Syncthing 和 Tailscale 实现文件同步](../file-sync-syncthing-tailscale/)** ✅2024-07-08

在国内复杂的网络环境下，利用 Tailscale 解决设备发现和连接问题，充分发挥 Syncthing 的文件同步能力，并附上具体操作步骤。

**(3) 利用 Restic 和 TrueNAS 打造自动化备份体系** 3️⃣

主要讲利用 restic 和 TrueNAS 的 Rsync 任务和云同步任务实现一套通用的备份方案。

不过我是最近才确定下来这套方案，等我用个一两个月体验一下之后再写。

另外，这套方案并不一定要用到 TrueNAS，到时候可能会一起写一个更加通用的方案（Restic, Rsync, Rclone）。

**(4) 使用 Immich 实现照片备份与同步** 4️⃣

主要讲使用 immich 来进行照片管理和同步，不过这篇可能更加偏向于教程而非方案。

**(5) 利用 qBittorrent、hlink 和 Jellyfin 打造家庭影院 - 基础篇** 2️⃣

主要讲利用 qbittorrent 下载 BT/PT 资源，hlink 进行硬链接以整理，jellyfin 进行刮削。

之所以叫“基础篇”，因为我认为我这一套应该是搭建家庭影院令我满意的最小系统。

进阶的话可以用 IYUU 实现 qbittorrent 下载，transmission 做种。

再进阶的话可以用 MP 将一切大包大揽，搜索资源、下载资源、整理资源、刮削资源等。

不过这两个应用我都有尝试，不过只有官方文档，网上没有什么博客分享使用方案，最后都放弃了。

我自己这一套用下来还是挺满意的。