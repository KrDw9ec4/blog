---
author: KrDw
pubDatetime: 2024-03-03T01:25:48.000+08:00
modDatetime: 2024-03-23T09:10:02.000+08:00
title: 搭建自己的在线动漫资源库
featured: true
draft: false
tags:
  - homeserver
description: "介绍一种流程实现 qBittorrent 下载后使用 Rclone + AList webdav 上传到阿里云盘实现高速播放，不受限于家宽上传带宽。"
---

由于国内审批制度的存在，阿 B 的动漫大多会延迟三集上线，所以需要自己去找字幕组资源下载下来观看。接下来介绍一种流程实现 qbit 下载后使用 rclone + alist webdav 上传到阿里云盘实现高速播放，不受限于家宽上传带宽。

**你或许会问，为什么不直接播放服务器上的视频？**

首先，国内家宽大多都是上传下载不对等，如果在外播放服务器上的视频，会受限于服务器的上传带宽，而如果上传到阿里云盘，就目前来看播放视频还是没有限速的，你上传到 OneDrive 也可以，总之就是要通过网盘走下载带宽来高速播放。

其次，如果你看过我之前的这篇[博客](https://blog.krdw.site/posts/building-homeserver-with-laptop/)，你会知道我是用一台只有 256G 硬盘空间的笔记本搭建的家用服务器，这点空间存点自己要看的动漫还是够用的，但我的空间不只是用来存视频的。

PS 也不一定要用服务器，qbit rlone alist 都有 Windows 版本，所以你的 Windows 电脑也能走通这套流程。

### qBittorrent

首先，设置在下载未完成时文件的临时保存路径，以免在下载时执行上传操作出现问题。// “设置-下载-保存管理-保存未完成的 torrent 到”

然后，添加相应番剧的分类，下载时选择分类就可以自动下载到对应文件夹。// “设置-下载-保存管理-默认 Torrent 管理模式：自动”；在主界面左边分类，右键全部即可添加分类。

最后，通过 WebUI 实现远程控制，在你的服务器上开放 WebUI 端口（默认是 8080），设置用户密码，打开浏览器访问即可，安卓手机可以下载 [qBittorrent Remote Lite](https://play.google.com/store/apps/details?id=me.fengmlo.qbRemoteFree&hl=zh_CN) 进行控制。

因为我是用 docker 部署的 qbit，可以参照下面教程为 qbit 开启 IPv6 功能，支持 IPv4 + IPv6 双栈连接。

设置 IPv6 教程：[https://blog.laoda.de/archives/docker-qbittorrent-ipv6/](https://blog.laoda.de/archives/docker-qbittorrent-ipv6/)

### AList

项目地址：https://alist.nn.ci/zh/

官方文档很详细了，安装跟着文档来就可以了，支持一键脚本、二进制文件、docker 多种部署方式。

这里主要讲讲[添加阿里云盘存储](https://alist.nn.ci/zh/guide/drivers/aliyundrive_open.html)，你在添加阿里云盘时，**注意将“秒传”打开**，这样在上传时如果阿里云盘服务器内存在的资源就可以实现秒传。经我测试，就算是最新放出的字幕组资源，大多可以实现秒传。

我之所以用阿里云盘，一是因为支持秒传，二是因为播放速度确实不错。

### Rclone

项目地址：https://rclone.org/

官方文档也是很详细，也可以通过一键脚本进行安装，如果你是 Ubuntu 系统，也可以用 apt 安装。

```shell
sudo apt update
sudo apt install rclone
```

安装好 rclone 之后，需要通过命令行进行配置。

```shell
rclone config
e/n/d/r/c/s/q> n # 创建一个新的存储
name> alist # 设置配置名称
Storage> webdav # 选择远程存储为 webdav
url> http://xxx.xxx.xxx.xxx:5244/dav # 输入 webdav 地址，IP/域名+端口+dav
vendor> other
user> admin # webdav 用户名称
y/g/n> y # 使用密码
password: # 输入 webdav 密码（不会显示是正常的）
bearer_token> # 不懂直接回车
y/n> # 直接回车，不用高级设置
y/e/d> # 确认配置信息
e/n/d/r/c/s/q> q # 退出配置界面
```

### crontab

使用 crontab 将 rclone copy 命令复制到云存储。

```shell
crontab -e
# G 跳转到末尾，o 新建一行进行输入，键入下面命令后 :wq 退出
# 注意修改本地路径和远程路径
~~~
*/5 * * * * rclone copy /home/xxxx/download/animes alist:/AliDrive/Videos/Animes
~~~
```

这行命令的效果是每 5 分钟执行一次 rclone copy，rclone copy 会先检查源地址是否有目标地址没有的文件，若有则进行复制操作，没有则无事发生。

### 远程控制

如何找到字幕组资源？

- 动漫花园：https://share.dmhy.org/
- 蜜柑计划：https://mikanani.me/

这里我手机上用的是一个大佬做的蜜柑计划第三方客户端，界面很好看，也很流畅。

项目地址：https://github.com/iota9star/mikan_flutter

我在蜜柑计划上找到我想要下载的磁力链接，点击就可以跳转到 qbittorrent remote，分类选择相应的番剧，开始下载，下载完成之后就是前面设计的自动化上传流程了。

然后我们打开 AList 界面或是支持 webdav 的播放器，就可以播放刚刚下载好的动漫了。

### 弹弹 Play

上面提到了播放器，这里再推荐一款适合用来看动漫的播放器——[弹弹play](https://www.dandanplay.com/)。

> 弹弹play支持软件内的搜索+加载功能，除了官方弹幕源之外，还能加载其他网站上的弹幕，让你看视频的时候不再孤单。

最大的作用莫过于它能爬取网络弹幕（B 站和巴哈等），实现弹幕看番。

PS 弹弹 play 支持多平台（Windows/macOS/Android/iOS）。

### Windows

前面也提了其实用 Windows 也可以实现这一套流程，这里大致提一嘴：

- 在 Windows 上安装 qbit rclone alist ddns-go，前三个作用前面提了，ddns-go 在这篇[博客](https://blog.krdw.site/posts/building-homeserver-with-laptop/)里提了，主要是用于绑定 IP 地址到域名。
- qbit alist 设置开机启动，如何设置自行搜索。
- 打开 Windows 防火墙开放相应端口以便公网访问。
- 使用“计划完成程序”代替 crontab 执行定时任务，如何使用也自行搜索。
