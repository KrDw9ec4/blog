---
author: KrDw
pubDatetime: 2024-01-23T18:51:12.000+08:00
modDatetime: 2024-01-26T01:20:38.000+08:00
title: 从零开始部署 memos
featured: false
draft: false
tags:
  - server
  - docker
  - memos
description: "在云服务器使用 docker compose 快速部署 memos。"
---

### Table of Contents

### 前言

memos 项目地址：[usememos/memos](https://github.com/usememos/memos)

![memos项目首页](https://img.k1r.in/2024/05/picgo_9abc564351e582e4de081ee9f6dc6d94.png)

flomo 为了长期维护，功能开发十分克制，这是优点，对我来说也是缺点，我对他们**未来支持 Markdown 的常用语法持悲观态度**。还有就是自己数据是在别人的服务器上，先不论隐私安全问题，光是历史数据（其他平台的记录）导入基本都做不到。

早就听闻 memos 是 flomo 的开源自部署替代品，我在试用了 memos 之后发现它完全可以满足我对 flomo 的需求，还更自由。

### 云服务器部署

如果你手头恰好有 Linux 系统（虚拟机、WSL、双系统等），其实可以尝试在本地部署 memos，步骤和在云服务器部署是一样的。如果没有的话，memos 也提供了一个 [demo](https://demo.usememos.com/) 供尝试（数据会清除），注册账号就可以体验了。

**在尝试了本地部署之后，如果确定要继续使用 memos 的话，就需要购买云服务器实现互联网访问**。

如果你是第一次购买并使用服务器，欢迎查看我之前的文章（[[第一次使用云服务器]]），那里讲了在购买服务器后最基本的操作——连接到服务器。

#### (1) 安装 docker 和 docker compose

这里我推荐 [Docker — 从入门到实践](https://yeasy.gitbook.io/docker_practice/) 这个教程下的安装教程，官网的安装步骤我现在都看的不是很明白。

- Docker 的安装教程：https://yeasy.gitbook.io/docker_practice/install
- Docker Compose 的安装教程：https://yeasy.gitbook.io/docker_practice/compose/install

#### (2) 创建文件夹

在新建一个 docker/ 文件夹用于存储各种 docker 服务的数据，再在里面新建一个 memos/ 文件夹专门用于 memos，在 memos/ 文件夹下新建一个 `docker-compose.yaml` 文件，最后的文件结构如下：

```
docker/
└── memos/
    └── docker-compose.yaml
```

#### (3) 创建 `docker-compose.yaml` 文件

在官网找到 compose 代码，在 [Self-Hosting](https://www.usememos.com/docs/install/self-hosting) 文章下的 Docker Compose 标题下（这里贴出的代码在官网的基础上修改了两处地方）：

```yaml
version: "3.0"
services:
  memos:
    image: neosmemo/memos:latest
    container_name: memos
    volumes:
      - .:/var/opt/memos
    ports:
      - 5230:5230
```

你可以直接使用官网的代码，但我**建议你更改 volumes 这一行的代码**：

冒号 `:` 左边的路径表示你自己要挂载的路径（看你需求随意更改），冒号 `:` 右边的路径是 Docker 容器内的路径（一般固定不能更改）。

我这里贴出的代码左边是 `.` 表示 `docker-compose.yaml` 文件所在路径即 memos 文件夹，**让 memos 的数据保存到 docker/ 文件夹下统一进行管理**。

此外，我将 image 这一行的镜像标签从官网的 stable 改为了 latest，表示使用最新的 memos 镜像，这样可以体验到当前最新版本的 memos。

把复制的代码粘贴到上一步创建的 `docker-compose.yaml` 文件中，保存并退出。

#### (4) 运行 Docker Compose

打开终端，确保在 memos/ 文件夹下，键入下列命令：

```bash
sudo docker compose up -d
```

等待 docker 成功拉取镜像并创建容器之后，你就会发现 memos 文件夹下出现一个 `memos_prod.db` 的数据库文件，这样你就已经成功部署了一个 memos 服务，docker compose 就是快速、少代码地部署一个服务。

#### (5) 访问 memos

打开浏览器，

如果你是本地部署，那么在地址栏键入 `127.0.0.1:5230` 即可访问刚刚部署的 memos 服务。

如果你是云服务器部署，那么在访问前你要先在云服务器的控制台放行 `5230` 端口，添加这么一行记录即可。

![放行端口](https://img.k1r.in/2024/05/picgo_363c72693eb489c7170d9f82df056c77.png)

接下来在地址栏键入 `xxx.xxx.xxx.xxx:5230` 即可访问部署的 memos 服务（xxx.xxx.xxx.xxx 换成云服务器的公网 IP）。
