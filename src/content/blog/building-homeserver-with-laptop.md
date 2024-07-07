---
author: KrDw
pubDatetime: 2024-03-02T16:22:34.000+08:00
modDatetime: 2024-06-10T00:00:53.000+08:00
title: 用笔记本来搭建本地服务器
featured: false
draft: false
tags:
  - homeserver
  - network
description: "笔记本安装 Ubuntu Server 系统，路由器支持 IPv6 实现公网 IPv6 访问，宽带有公网 IPv4 或者有一台云服务器实现公网 IPv4 访问，最终实现通过 IPv4 + IPv6 双栈访问服务器，安装 docker 来快速部署和方便管理服务。"
---

### Table of Contents

### 前言

最近用一台家里的老旧笔记本搭了一台本地服务器，体验下来还是不错的，于是写一篇博客记录一下。

主要流程就是安装 Ubuntu Server 系统，路由器支持 IPv6 实现公网 IPv6 访问，宽带有公网 IPv4 或者有一台云服务器实现公网 IPv4 访问，最终实现通过 IPv4 + IPv6 双栈访问服务器，安装 docker 来快速部署和方便管理服务。

使用笔记本搭建本地服务器有两个独特的好处：

1. 有一块显示屏，当服务器出现问题，并且无法通过 SSH 连接进行调试时，不用额外接一块显示屏就可以直接进行调试。
2. 有一块电池，当直流供电中断时，一块电池可以起到 UPS 的作用。

不过这俩平时都用不到，我们需要进行一定的设置，我在文末会提及。

### Thinkpad E431

![neofetch系统信息](https://img.k1r.in/2024/05/picgo_5381da4949d117c29bf688c8175108d7.png)

首先介绍一下我用的笔记本，联想 Thinkpad E431：

- 发布于 2013 年左右的笔记本
- CPU 是“Intel i3-3110M @2.400GHz”
- GPU 是“NVIDIA GeForce GT 740M”
- 4G 内存
- 原装 500G 机械硬盘，后来换的 256G 固态。

这台笔记本之前安装个 Windows 7 还能勉强够用，开机内存占用基本就过半了，4G 内存运行图形化界面还是比较吃力的，但装个 Ubuntu Server，我到目前见到最高的内存占用也就 25%。

如果你不是 Thinkpad E431，也可以参照一下这篇博客，毕竟 Linux 还是不怎么挑硬件的。

### Ubuntu Server

> 你需要准备：一个 8G+ 的 **U 盘**用于制作启动盘，一根**网线**用于有线网络。

**(1) 制作启动盘**

这里使用的是 [Rufus](https://rufus.ie/zh/)，其他制作工具也可以。

Ubuntu Server ISO 镜像文件下载地址：https://ubuntu.com/download/server

将 U 盘插入电脑，打开 Rufus，选择下载好的 Ubuntu Server 镜像，分区类型选择“MBR”，文件系统选择“NTFS”，点击“开始”，等待制作完成后拔出 U 盘。

![rufus制作启动盘](https://img.k1r.in/2024/05/picgo_f64268e24a839645c67ab1b90d44f6ff.png)

**(2) 从启动盘引导**

搜索你笔记本对应的进入 BIOS 的方式，Thinkpad E431 是在开机时连续单击 `F12` 键进入 BIOS。

在 BIOS 中关闭安全启动 Secure Boot，在启动顺序中将启动盘（U 盘）置顶后，保存并退出，进入开机界面。

如果顺利的话，应该是进入 Ubuntu Server 的安装界面了。

**(3) 安装 Ubuntu Server**

推荐视频教程：[【系统篇】安装Ubuntu Server 20.04](https://www.bilibili.com/video/BV1Ci4y1u74N)

安装过程参照上面的视频就可以了，我安装也是跟着他来。

强调几点：

- 语言最好保持 en_US，服务器也没必要要中文。
- 手动配置静态 IP，和视频中不一样，如果要配置的话可以自己找找教程。
- 配置阿里云镜像源：https://mirrors.aliyun.com/ubuntu/
- 勾选 SSH 服务，因为你要通过其他电脑连接到服务器来进行操作。

等待安装完成后，你就拥有了一台本地服务器，一些有关服务器的杂项设置可以参考文末。

> 如果你是第一次使用服务器，可以参考我这篇博客：[连接到服务器](../connect-to-server/)

### 公网访问

> 2024-04-20 更新：[DDNS v Tailscale v Cloudflared](../ddns-tailscale-cloudflared/)，在这篇文章中我弃用了下面的方案，转用 Tailscale，仅供参考。

至此，我们仅仅是搭建了一个能在局域网连接和访问的服务器，如果需要在非局域网环境连接或是访问，则需要进行相应的配置。

**(1) 公网 IPv6 + DDNS**

> 你需要准备：一个**域名** `www.example.com`，托管在阿里云、腾讯云、Cloudflare 都可以。

现如今公网 IPv4 还是很难申请到了，但只要你的路由器支持 IPv6，就大概是公网 IPv6，只是每次路由器重新拨号时，IPv6 地址会改变，所以我们要采用 DDNS（动态域名解析）将 IPv6 绑定到一个域名，通过域名来固定访问地址。

ddns-go 项目地址：https://github.com/jeessy2/ddns-go

我是使用 docker（host）部署的，使用方式很简单，等你打开 ddns-go 的 webUI 界面看看就会用了，这里解释一下 DDNS 的原理。

ddns-go 定期获取本机 IP 地址，再通过阿里云/腾讯云/Cloudflare 的相应 API 更改域名 `www.example.com` 的解析结果为最新的 IP 地址。

PS 如果你有动态公网 IPv4 地址的话，也是使用 DDNS 绑定域名进行访问。

**(2) FRP 实现 IPv4 公网访问**

> 你需要准备：一台**云服务器**，最好是国内服务器，可能需要备案，或者用国外服务器。

因为我没有公网 IPv4，所以需要一台云服务器进行内网穿透，这里采用的是 FRP 来实现 IPv4 公网访问。

在云服务器上部署 frps 并开放相应端口，在本地服务器上部署 frpc，进行相应配置，如何写配置网上教程很多。

我原本是用 docker 部署 frps 和 frpc，但动不动报错，最后采用二进制文件使用系统服务开机自启。

PS 如果你没有云服务器，其实也不一定要配置 IPv4 公网访问，毕竟现在国内 IPv6 还是比较普及的，实在不行就用流量访问。

### 一些推荐的服务

除了前面提及的 ddns-go 和 frp 之外，这里推荐一些服务让你知道一个本地服务器能干什么。

- [Dockge](https://github.com/louislam/dockge)：使用 docker compose 来管理 docker 容器。
- [AList](https://github.com/alist-org/alist)：将多种云存储挂载到一起统一管理，支持大多数网盘及云存储，可以通过 webdav 访问。
- [qbittorrent](https://github.com/linuxserver/docker-qbittorrent)：种子和磁力链接下载工具。
- [Duplicati](https://github.com/linuxserver/docker-duplicati)：用于在线存储加密备份的备份软件，支持增量备份。
- [Syncthing](https://github.com/linuxserver/docker-syncthing)：在不同设备间同步文件，全平台支持。
- ……

> 你也可以参考我这篇博客：[搭建自己的在线动漫资源库](../qbit-rclone-alist/)

### 你可能需要

#### 设置合盖不休眠

因为是用笔记本搭建的服务器，如果设置合盖不休眠的话，占用体积会更小，或许也会降低功耗（毕竟关闭显示屏了）。

```shell
sudo vim /etc/systemd/logind.conf
~~~
- #HandleLidSwitch=suspend
+ HandleLidSwitch=ignore
~~~
sudo systemctl restart systemd-logind.service
```

#### 开盖关闭显示器

在设置合盖不休眠后使用过程中，会发现因为合盖导致笔记本散热减弱，后面改成了“开盖关闭显示器”。

使用一行命令开启/关闭显示器，配置开盖时打开显示器。

(1) 安装相关软件

```shell
sudo apt update
sudo apt install acpid vbetool
```

(2) 配置 ACPI 开盖事件

```shell
sudo vim /etc/acpi/events/lid
~~~
event=button/lid LID0 open
action=/etc/acpi/lid.sh
~~~
```

(3) 创建 ACPI 脚本

```shell
sudo vim /etc/acpi/lid.sh
~~~
#!/bin/bash
sudo vbetool dpms on
~~~
sudo chmod +x /etc/acpi/lid.sh
```

(4) vbetool 命令

```shell
sudo vbetool dpms on #开启显示器
sudo vbetool dpms off #关闭显示器
```

#### 电池供电主动关机

我们希望服务器能 7x24 小时保持工作，但总会出现突发情况，导致突然断电，如果我们不进行相关设置，电池耗尽导致突然关机，可能会出现数据丢失等问题，所以这里讲一下如何设置成电池供电时主动关机。

网上常见的是 ACPI 电源管理一套流程，但我实际用下来貌似没效果，所以直接用的是 crontab 每 5 分钟检测，如果是电池供电则执行关机命令。

```shell
vim path/to/auto_shutdown.sh
# 这里涉及两个文件，脚本文件和日志文件，请注意修改相应地址
~~~
#!/bin/bash

if [ `cat /sys/class/power_supply/AC/online` -eq 0 ]; then
        shutdown -h 3
        echo "$(date +%Y-%m-%d\ %H:%M:%S)：检测到直流供电断开，准备关机。" >> /home/xxx/log/auto_shutdown.log
fi
~~~
chmod +x path/to/auto_shutdown.sh # 给脚本执行权限
```

```shell
sudo -i # 关机是高权限操作，需要 root 的 crontab
crontab -e # G 跳转到末尾，o 新建一行进行输入，键入下面命令后 :wq 退出
~~~
*/5 * * * * path/to/auto_shutdown.sh
~~~
```

#### 以 root 用户登录

安装完 Ubuntu Server 你会发现你并不知道 root 用户的密码，我们需要重新设置 root 密码。

```shell
sudo -i # 进入 root 用户
passwd # 设置 root 密码
```

#### 修改 SSH 端口

```shell
sudo vim /etc/ssh/sshd_config
~~~
在配置文件中找到“Port”行，取消注释并改为你要使用的端口
~~~
sudo service ssh restart
```

#### 配置 ufw 防火墙

```shell
sudo apt update
sudo apt install ufw
sudo ufw allow 22 # 首先放行 SSH 端口，如果你修改了 SSH 端口则放行相应端口
sudo ufw enable # 开启 ufw 防火墙
sudo ufw status # 查看 ufw 规则
sudo ufw delete allow 22 # 删除放行 22 端口的规则
```

#### 公网无法访问 IPv6

如果你发现在局域网内能正常解析域名并访问，但在公网（比如使用流量）却无法正常访问，这可能是因为你的路由器或是光猫有 IPv6 防火墙，请自行搜索关闭防火墙的方法。

在此之前，请确认服务器防火墙是否放行相应端口。

#### Server-Box

推荐一个开源安卓软件 Server Box，用于在手机上查看服务器状态。

项目地址：https://github.com/lollipopkit/flutter_server_box
