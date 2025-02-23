---
author: KrDw
pubDatetime: 2024-05-08T14:00:29.000+08:00
modDatetime: 2025-02-23T13:12:23.000+08:00
title: 打造自己的 RSS 信息流
featured: true
draft: false
tags:
  - server
  - rss
  - docker
  - PRACTICES
description: "从 RSSHub 和 WeWeRSS 获取 RSS 订阅源链接，部分使用 rss-proxy 进行代理，使用 FreshRSS 作为 RSS 服务端，安卓使用 Capy Reader 进行阅读。"
---

### Table of Contents

### 前言

对于 RSS 的介绍本文不赘述，你需要知道 RSS 是能将分散孤立的平台的信息聚合到一起，下面我将带你搭建一套流程实现 RSS 信息流，大致思路：**从 RSSHub 和 WeWeRSS 获取 RSS 订阅源链接，部分使用 rss-proxy 进行代理，使用 FreshRSS 作为 RSS 服务端，安卓使用 Capy Reader 进行阅读。**

![RSS流程图](https://img.k1r.in/2024/07/picgo_38b1d1ab5fdd204ec2b863260f96b05b.svg)

下面这个表格是这一套流程**大致的空间和内存占用**，实际运行时可能需要更多资源，推荐使用 **2GB 内存**服务器以获得稳定体验。

| SERVICES | IMAGES                       | SIZE   | CONTAINERS           | MEMORY   |
| -------- | ---------------------------- | ------ | -------------------- | -------- |
| RSSHub   | diygod/rsshub                | 695MB  | rsshub-rsshub-1      | 231.5MiB |
| RSSHub   | browserless/chrome           | 3.06GB | rsshub-browserless-1 | 233.2MiB |
| RSSHub   | redis                        | 41MB   | rsshub-redis-1       | 10.18MiB |
| WeWe RSS | cooderl/wewe-rss-sqlite      | 331MB  | wewerss              | 56.02MiB |
| FreshRSS | lscr.io/linuxserver/freshrss | 93.8MB | freshrss             | 44.25MiB |

~~但后文我也会提到 RSSHub 和 WeWe RSS 其实可以部署到 Vercel 等云服务平台，FreshRSS 虽然只能在服务器部署，但一这不是必需的，二网上也有很多公益服务器（不推荐）。所以如果你愿意的话，这一套用不上服务器（~~

### RSS 订阅源

#### 网站自己提供

**在国内，RSS 已经是一项很少见的技术了，很少有网站会主动提供 RSS 订阅链接，现在会主动提供 RSS 订阅链接的网站主要是博客。**

比如我的博客也提供了 RSS 订阅链接：[KrDw Publish RSS](https://k1r.in/rss.xml)，你可以用来订阅我的博客。

如果你关注一些 GitHub 开源项目的话，你也**在 Releases 链接末尾加上 `.atom` 来订阅项目 Releases 信息**。

比如待会要提到的 wewe-rss 的 releases 的 RSS 订阅链接为：[wewe-rss releases](https://github.com/cooderl/wewe-rss/releases.atom)。

> **RSSHub Radar**: https://github.com/DIYgod/RSSHub-Radar
>
> 一个浏览器扩展，可以用于嗅探当前网页的 RSS 订阅链接，可以嗅探出网站自己提供的，也可以配合 RSSHub 使用。

#### RSSHub

![RSSHUB项目首页](https://img.k1r.in/2024/05/picgo_fb8a8a5f300e7a74f65b6fb5282cf80f.png)

> **RSSHub**: https://docs.rsshub.app/zh/
>
> 万物皆可 RSS 🧡 从任何内容生成 RSS/Atom/JSON 订阅源

正如 RSSHub 在它的网站上所说的，它能从任何内容生成 RSS 订阅源，是本文 RSS 信息流的关键工具。

对于 RSSHub 的使用详见它的文档“[食用指南](https://docs.rsshub.app/zh/guide/)”，下面我们重点讲讲自部署一个 RSSHub 实例，自部署有以下三点好处：

- 官方/公共实例大多都是部署在国外服务器上，大陆访问速度不佳；
- RSSHub 作者 [DIYgod 发文](https://diygod.cc/6-year-of-rsshub)说过官方的 `rsshub.app` 实例服务器费用每月一千多刀，自部署可以减轻官方实例负担；
- 自部署 RSSHub 实例可以进行[配置](https://docs.rsshub.app/zh/deploy/config)，通过设置环境变量传入 Cookies，让路由更强。

我是采用 Docker Compose 在云服务器上部署 RSSHub 的。

如果你有服务器，你就可以继续看下去，因为只需要下载/创建 Compose 文件之后，稍作修改部署即可，真的很简单。

如果没有服务器，新人我推荐购买阿里云/腾讯云的 99/年的轻量服务器进行学习，不过只有国内地区，想要无端口域名访问就得备案。

或者你也可以跳到下一个部分，[官方文档的部署部分](https://docs.rsshub.app/zh/deploy/)给出了在一些云服务平台（Heroku、Zeabur、Vercel、Fly.io）搭建 RSSHub 实例的教程，这些云服务平台一般都有免费额度使用，而且一般足以个人正常使用。

**(1) 安装 Docker**

> 2024-07-26 更新：由于前段时间国内镜像站大多都关闭了 DockerHub 的镜像加速服务，所以你如果想使用 Docker（使用 Docker = 安装 Docker + 拉取 Docker 镜像）可能得自己解决网络问题。

参照 [Docker CE 软件仓库 | TUNA](https://mirrors.tuna.tsinghua.edu.cn/help/docker-ce/) **安装 Docker**。

这里提供了一种**拉取 Docker 镜像**的解决方法 [dockerhub.icu](https://dockerhub.icu/)，请查看里面的说明使用。

**(2) Docker Compose 部署**

下面我就按照我的习惯带你来部署：

首先，在**你自己的电脑**上，复制 [RSSHub 提供的 Compose 文件](https://github.com/DIYgod/RSSHub/blob/master/docker-compose.yml)，粘贴到文本编辑器中，做出如下修改：

- 在 `rsshub` 服务中添加 `env_file` 配置，然后环境变量可以放在同目录的 `.env` 文件中。
- 在 `redis` 服务中修改 `volumes` 挂载路径为 `~/appdata/rsshub`，然后可以删除最后一段的 `volumes` 配置。

最终得到如下 Compose 文件：

```yaml
services:
  rsshub:
    # two ways to enable puppeteer:
    # * comment out marked lines, then use this image instead: diygod/rsshub:chromium-bundled
    # * (consumes more disk space and memory) leave everything unchanged
    image: diygod/rsshub
    restart: always
    ports:
      - "1200:1200"
    environment:
      NODE_ENV: production
      CACHE_TYPE: redis
      REDIS_URL: "redis://redis:6379/"
      PUPPETEER_WS_ENDPOINT: "ws://browserless:3000" # marked
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1200/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      - redis
      - browserless # marked
    env_file:
      - .env

  browserless: # marked
    image: browserless/chrome # marked
    restart: always # marked
    ulimits: # marked
      core: # marked
        hard: 0 # marked
        soft: 0 # marked
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/pressure"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:alpine
    restart: always
    # ⚠️ 修改 volumes 为你想要的挂载路径，并删除最底下那段 volumes。
    volumes:
      - ~/appdata/rsshub:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 5s
```

然后，在**你的服务器**上，在命令行中：

```shell
mkdir -p ~/appdata/rsshub # 创建 RSSHub 数据的存储文件夹
mkdir -p ~/compose/rsshub && cd ~/compose/rsshub # 创建 RSSHub Compose 文件的存储文件夹
touch .env # 创建环境变量文件
vim compose.yaml # 新建并编辑 compose 文件
~~~ # 分隔符，表示进入文本编辑界面
# Ctrl+V 粘贴你修改后的 compose 文件
# 英文下键入 :wq，保存并退出
~~~ # 分隔符，表示退出文本编辑界面
docker compose up -d # docker compose 部署服务
```

等待 RSSHub 的镜像拉取完毕后，就部署完成了。

**(3) 访问自部署的 RSSHub 实例**

接下来**你需要拿到你的云服务器的公网 IP 地址，然后搜索怎么放行端口**，比如你是阿里云的云服务器就搜“阿里云 端口放行”。

放行 RSSHub 的端口 `1200`，你就可以在浏览器输入 `http://<公网IP>:1200` 访问到你的 RSSHub 实例了。

![成功部署RSSHUB](https://img.k1r.in/2024/05/picgo_79304257a317b95e2156b30fac627acd.png)

其实到这一步已经成功自部署 RSSHub 了，至于配置反向代理使用域名访问这里（和后文）就不讲了，不是必需的。

一是域名解析到国内云服务器需要备案（备案要等大概十来天），二是网上很多相关教程了，小白建议用 Caddy（配置简单，占用小，但没有图形化界面）/ Nginx Proxy Manger（docker 部署，占用较大，有 webui）。

> 2024-07-10 更新：[《使用 Caddy 和 acme.sh 实现反向代理》](../reserve-proxy-caddy-acmesh)
>
> 使用 acme.sh 定期申请泛域名 SSL 证书，配置 Caddy 进行反向代理，实现 HTTPS + 域名访问。

_如果你用了前文提到的 RSSHub Radar 插件，就可以在插件设置的“RSSHub 实例”那里填入 `http://<公网IP>:1200`。_

#### WeWe RSS

如果你去翻过 RSSHub 的路由文档，你会发现里面并没有**微信公众号**的相关路由，有也是第三方爬取后再使用，其中不少还是收费的。

> **WeWe RSS**: https://github.com/cooderl/wewe-rss
>
> 🤗更优雅的微信公众号订阅方式，支持私有化部署、微信公众号RSS生成（基于微信读书）v2.x

这个服务一样可以用 Docker Compose 部署，和 RSSHub 一样，

首先，在**你自己的电脑**上，在 [WeWe RSS 的项目仓库中找到 Compose 文件](https://github.com/cooderl/wewe-rss/blob/main/docker-compose.sqlite.yml)，粘贴到文本编辑器中。

下面是我采用的 Compose 文件，**这里还有一些设置没用上，你可以在项目提供的 compose 文件看到相关设置的选项**。

```yaml
services:
  app:
    image: cooderl/wewe-rss-sqlite:latest
    ports:
      - 4000:4000
    environment:
      - DATABASE_TYPE=sqlite
      - AUTH_CODE=1234567
      - CRON_EXPRESSION=35 7,12,17,22 * * * # 定时更新订阅源
      - PUID=1000
      - PGID=1000
      - UMASK=022
      - FEED_MODE=fulltext # 开启提取全文内容功能
    volumes:
      - ~/appdata/wewerss:/app/data
    restart: unless-stopped
```

然后，在**你的服务器**上，在命令行中：

```shell
mkdir -p ~/appdata/wewerss
mkdir -p ~/compose/wewerss && cd ~/compose/wewerss # 创建 wewe-rss compose 文件的存储文件夹
vim compose.yaml # 新建并编辑 compose 文件
~~~ # 分隔符，表示进入文本编辑界面
# Ctrl+V 粘贴你修改后的 compose 文件
# 英文下键入 :wq，保存并退出
~~~ # 分隔符，表示退出文本编辑界面
docker compose up -d # docker compose 部署服务
```

最后，云服务器放行 4000 端口，在浏览器输入 `http://<公网IP>:4000` 访问到 WeWe RSS 了。

进去之后先要添加账号，因为这个项目是基于微信阅读生成微信公众号的 RSS 订阅源。

**PS** WeWe RSS 也可以通过云服务平台部署，不一定需要云服务器。

### 使用代理

到这里，其实你已经可以通过一些 RSS 阅读器软件来添加你的 RSS 订阅源，但在国内折腾这些东西避免不了的一个东西就是网络环境，无法访问境外的 RSS 订阅源，下面介绍一种使用 CloudFlare Worker 实现的 RSS 代理，就不提供逐步教程了。

方法来源：[蜜柑计划RSS无法访问的解决办法|Bangumi](https://bgm.tv/group/topic/380685)。

需要注意的是，这个方法需要你准备一个托管在 CloudFlare 的域名。

你可以选择先跳过这个，等之后有需求时再回过头来折腾，其实也很简单，上边链接里也说明清楚怎么操作了。

### RSS 服务端

其实 RSS 服务端在流程中不是必需的，但部署之后的好处：

- 提供一个平台进行统一管理，客户端只需要支持相关 api 就可以实现同步（大多数都支持）。
- 服务端会将从 RSS 获取的内容保存下来，换一个 RSS 阅读器还是原来的数据。

**常见的自部署 RSS 服务端有 FreshRSS、Tiny Tiny RSS、Miniflux**，我用的是 FreshRSS，因为 FreshRSS 支持 SQLite 数据库，不用再运行一个数据库（数据库是真的挺占内存的）。

还是用 Docker Compose 部署 FreshRSS，我用的不是官方的镜像，而是 LinuxServer 的镜像。我也推荐你之后**优先使用 LinuxServer 的镜像**，因为他们简化并统一配置。

> **FreshRSS**: https://freshrss.org/
>
> **linuxserver/freshrss**: https://hub.docker.com/r/linuxserver/freshrss

同样的，在上面链接中找到 compose 文件，粘贴到**你的电脑**上的文本编辑器中。

```yaml
services:
  freshrss:
    image: lscr.io/linuxserver/freshrss:latest
    container_name: freshrss
    environment:
      - PUID=1000
      - PGID=1000
      - TZ=Asia/Shanghai # 修改时区
    volumes:
      - ~/appdata/freshrss:/config
    ports:
      - 8080:80 # 这里不要用默认的80端口，最好换一个端口8080
    restart: unless-stopped
```

然后，在**你的服务器**上，在命令行中：

```shell
mkdir -p ~/appdata/freshrss
mkdir -p ~/compose/freshrss && cd ~/compose/freshrss # 创建 FreshRSS compose 文件的存储文件夹
vim compose.yaml # 新建并编辑 compose 文件
~~~ # 分隔符，表示进入文本编辑界面
# Ctrl+V 粘贴你修改后的 compose 文件
# 英文下键入 :wq，保存并退出
~~~ # 分隔符，表示退出文本编辑界面
docker compose up -d # docker compose 部署服务
```

最后，云服务器放行 8080 端口，在浏览器输入 `http://<公网IP>:8080` 访问到 FreshRSS 了，按照指示配置好后会到 FreshRSS 的首页。

_如果你用了前文提到的 RSSHub Radar 插件，就可以在插件设置的“快速订阅”-“FreshRSS”，勾选并填写 `http://<公网IP>:8080`，这样使用 RSSHub Radar 时可以一键添加到 FreshRSS。_

这里我们需要进行相关设置以便后续操作：

- 点击右上角齿轮，选择“认证”，勾选“允许 API 访问 （用于手机应用）”。
- 在上一步后，在左栏选择“账户”，找到“API 管理”，设置一个 API 密码，注意提前保存 API 密码到别处，因为在 FreshRSS 设置保存后并不会显示。
- 点击“API 密码”下方的那个链接，查看是不是两个都是`✔️ PASS`，里面的链接是之后阅读器要填写的服务器地址。

### RSS 客户端

虽然可以通过网页访问 FreshRSS 进行阅读，但说实话网页端有点丑+难用，我用 FreshRSS 主要是拿来当后台进行管理和同步的。

如果要用 RSS 阅读器添加 FreshRSS，一般是在自托管服务中选择 FreshRSS/Google Reader/Fever：

- 服务器地址：填 `http://<公网IP>:8080/api/` 中的链接（FreshRSS 用的是 Google Reader 的 API）。
- 账户：填你的账户名称。
- 密码：填前面获取的 API 密码，**注意这里填的不是你的账户密码**。

其实你不用 FreshRSS 也可以在 RSS 阅读器中添加 RSS 订阅源。

下面推荐几个 RSS 阅读器，我就不贴预览图了，链接里应该都有预览。

**(1) Read You** - Android

> **ReadYou**: https://github.com/Ashinch/ReadYou
>
> An Android RSS reader presented in Material You style.

~~这是我现在主要用的就是 ReadYou~~，一个仿 iOS 平台的 reeder 的安卓软件，样式设置还挺多的。

[0.9.12](https://github.com/Ashinch/ReadYou/releases/tag/0.9.12) 后的版本貌似是在 FreshRSS 社区帮忙下支持了 FreshRSS。

**(1.1) Capy Reader** - Android

> **Capy Reader**：https://github.com/jocmp/capyreader
>
> A smallish RSS reader with support for Feedbin, FreshRSS, and local feeds.

目前安卓端换成这个阅读器了，设置虽然少，但默认也挺好，比起 Read You 好就好在同步速度快。

不过 Read You 的同步问题挺玄学的，推荐你两个都试一试，毕竟建了 FreshRSS，换客户端就是重新登录的事情。

**(2) Fluent Reader** - Android, Windows, iOS, macOS

> **Fluent Reader**: https://hyliu.me/fluent-reader/
>
> Modern desktop RSS reader built with Electron, React, and Fluent UI

Fluent UI 是微软的设计语言，所以还挺适合在 Windows 使用的，在其他平台使用起来或许会有点割裂感。

**(3) NetNewsWire** - iOS, macOS

> **NetNewsWire**: https://netnewswire.com/
>
> NetNewsWire is a free and open source RSS reader for Mac, iPhone, and iPad

macOS 和 iOS 下的免费 RSS 阅读器，我体验下来感觉很不错，就是界面还不支持中文。

> 如果你使用的是 Apple 系统，那么我们推荐 NetNewsWire。这是一款设计优雅，同时所有 Swift 代码开源的 RSS 客户端：
>
> https://www.netnewswire.com/
>
> 如果你正在使用或者打算学习 Swift 编程，NetNewsWire 的代码库是一个很好的学习对象。
>
> NetNewsWire 的高性能让人印象深刻。即使有上万的未读条目，用起来也完全不卡。背后的支撑是 [RSDatabase](https://github.com/Ranchero-Software/RSDatabase) 项目。
>
> 同时 NetNewsWire 的开发者们还是新标准 [JSON Feed](https://jsonfeed.org/) 的发起者。
>
> —— [V2EX 的推荐语](https://blog.v2ex.com/rss/)

**(4) Reeder** - iOS, macOS

> **Reeder**: https://reederapp.com/
>
> Your News Reader.

你在网上看到推荐 RSS 阅读器的文章里肯定有它，我用的 ReadYou 也是仿造它的，可以说它是 RSS 阅读器的一个标杆。

但是，前面三个都是开源&免费软件，这个是一个收费软件，价格不低。

### 补充说明

**(1) All About RSS**

> **ALL about RSS**: https://github.com/AboutRSS/ALL-about-RSS

正如项目名 ALL about RSS，所有有关 RSS 的内容都会被收录于此，如果你在使用 RSS 过程中有什么需求/问题，可以先在这里寻找答案。

**(2) FreshRSS XPath 网页抓取**

2024-11-16 [使用 Xpath 进行网页抓取（FreshRSS）](../freshrss-xpath-web-scraping/)

在 FreshRSS 中，使用 HTML + XPath 进行网页抓取，并配合原文的 CSS 选择器获取原文。

**(3) Newsletter 转 RSS**

Newsletter 也是构建信息流的一种方式，它是通过邮件订阅的，可能有一些网站只提供 Newsletter 订阅方式，这时我们可以使用一些公益服务将其转换为 RSS。

- Kill the Newsletter!: https://kill-the-newsletter.com/
- Notifier: https://notifier.in/

**(4) 稍后读 Wallabag**

稍后读能够帮助实现「内容订阅」而非「网站订阅」，避免为偶然出现的优质内容被迫订阅整个网站（尤其对低质量更新频繁的站点）。

我目前使用（部署）的稍后读服务是 Wallabag，一是因为它提供了 RSS 源以便于融入这一套体系，二是因为它生态比较完整，移动端有软件，桌面端有插件。

**(4) 对 RSS 订阅源进行内容筛选**

2024-05-14 才发现 RSSHub 可以通过[配置通用参数](https://docs.rsshub.app/zh/guide/parameters)进行筛选，支持正则表达式。

有时候我们的 RSS 订阅源中可能会掺有我们不想要的内容，但又无法对其进行进一步的粒度划分，这时候就可以~~用 siftrss 进行筛选~~配置 RSSHub 通用参数。

> **siftrss**: https://siftrss.com/
>
> Subscribe to see only what you want to see!

**(5) RSS 阅读器设置**

这是一个主观建议，由于这一套流程采用的是利用 RSSHub 绕过网站自身限制获取 RSS 订阅源链接，所以内容中的图片往往不能很好的显示，建议在信息流界面关闭“订阅源图标”和“文章插图”（如果有的话，这是 ReadYou 的称呼），这样信息流界面会好看很多。

### 推荐阅读

下面文章对我写这篇博客有很大帮助，推荐你也阅读。

- 我有特别的 RSS 使用技巧：https://diygod.cc/ohmyrss
- RSSHub Radar — 订阅一个 RSS 源不应该这么难：https://diygod.cc/rsshub-radar
- 一个六岁开源项目的崩溃与新生：https://diygod.cc/6-year-of-rsshub
- 2024-02-25 RSS 使用的最佳实践 RSSHub+FluentReader+FreshRSS：https://blog.cmyr.ltd/archives/499d4cee.html
