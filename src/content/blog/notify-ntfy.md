---
author: KrDw
pubDatetime: 2025-01-20T14:50:00.000+08:00
modDatetime: 2025-01-21T18:30:00.000+08:00
title: 使用 ntfy 推送通知
featured: false
draft: false
tags:
  - server
description: "ntfy 是一个支持 HTTP、Webhook 和邮件推送的通知服务，本文从安装、配置到使用全流程带你部署一个 ntfy 私有实例。"
---

### 前言

往往折腾完一套自动化流程后，总需要在特定情景下推送通知，获取运行结果，以确认是否成功运行，实现运行错误能推送错误等。

> [ntfy](https://docs.ntfy.sh/) 允许您使用简单的 HTTP PUT 或 POST 请求，通过任何计算机的脚本将推送通知发送到您的手机或桌面。

已经用了好几个月，我发现它还算是很通用的一个方法：

- 如果是自己写脚本，那直接在脚本里使用 `curl` 命令。
- 如果是服务集成通知设置，大多都支持 ntfy，那么直接对应设置就可以了。
- 如果不支持，那基本还支持通用 Webhook，也可以用相应 Webhook 的方式。
- 如果还不支持，总得支持邮件通知，也可以通过发送邮件到 ntfy 服务端来通知。

上面这些方法，我在[使用](#使用)中给出了示例，以供参考。

### 安装

ntfy 有个官方实例 [ntfy.sh](https://ntfy.sh)，但是我推荐你自部署一个 ntfy 私有实例，因为官方实例的通知名称大都被用了，随机名称用起来不够优雅，而且 ntfy 内存占用不大，随便一个服务器都能部署。

根据 ntfy 官方文档 - [Installation](https://docs.ntfy.sh/install/)，大致有三种安装方式：静态二进制文件、包管理器、Docker。

这里我就用包管理器的方法来安装，之后更新也方便。

因为我的服务器是 Debian，所以使用下面命令来安装：

```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://archive.heckel.io/apt/pubkey.txt | sudo gpg --dearmor -o /etc/apt/keyrings/archive.heckel.io.gpg
sudo apt install apt-transport-https
sudo sh -c "echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/archive.heckel.io.gpg] https://archive.heckel.io/apt debian main' \
    > /etc/apt/sources.list.d/archive.heckel.io.list"  
sudo apt update
sudo apt install ntfy
sudo systemctl enable ntfy
sudo systemctl start ntfy
```

你如果服务器装了 Docker，当然可以使用 Docker Compose 安装，这样管理起来更方便一点。

### 配置

因为我们是打算部署一个 ntfy 私有实例，所以还需要对 ntfy 的配置文件进行一定的修改。

根据 ntfy 官方文档 - [Configuration](https://docs.ntfy.sh/config/)，如果你像我一样使用 Debian 和包管理器安装 ntfy 的，那么就要修改位于 `/etc/ntfy/server.yml` 的配置文件。

#### /etc/ntfy/server.yml

```bash
sudo vim /etc/ntfy/server.yml
```

**[基础设置](https://docs.ntfy.sh/config/#example-config)**

- `base-url` 是 ntfy 服务器的外部 URL，即反代后的访问地址 `https://ntfy.example.com`。
- `listen-http` 是 HTTP 监听地址 `127.0.0.1:2586`。

⚠️ 注意把 example.com 改成你自己的域名。

```ini
base-url: "https://ntfy.example.com"
listen-http: "127.0.0.1:2586"
```

**[消息缓存](https://docs.ntfy.sh/config/#message-cache)**

ntfy 默认是在内存中缓存 12h 的消息，而且实例重启就丢失了（内存特性）。这里设置成在硬盘缓存，ntfy 会将消息存储在基于 SQLite 的缓存，我们设置 24*7=168 h 的持续时间。

- `cache-file`：缓存文件地址 `/var/cache/ntfy/cache.db`。
- `cache-duration`：消息在缓存中存储的持续时间 `168h`。

```ini
cache-file: "/var/cache/ntfy/cache.db"
cache-duration: "168h"
```

**[访问控制](https://docs.ntfy.sh/config/#access-control)**

设置成私有实例，需要创建用户和生成访问令牌来使用，在下文[添加用户、访问令牌](#添加用户、访问令牌)给出了相应操作。

- `auth-file`：user/access 数据库地址 `/var/lib/ntfy/user.db`，用于存放用户和访问令牌。
- `auth-default-access`：匿名用户的访问授权 `deny-all`，即未验证用户不能读写 ntfy 主题消息。

```ini
auth-file: "/var/lib/ntfy/user.db"
auth-default-access: "deny-all"
```

**[通过电子邮件发送通知](https://docs.ntfy.sh/config/#e-mail-publishing)**

这里就是设置[前言](#前言)中提到的某些服务的通知设置只支持邮件通知的情况下，也可以通过电子邮件发送消息到 ntfy 主题。

⚠️ 注意把 example.com 改成你自己的域名。

```ini
smtp-server-listen: ":25"
smtp-server-domain: "ntfy.example.com"
smtp-server-addr-prefix: "ntfy-"
```

值得一提的是，虽然很多云服务器商都默认关闭 25 端口的发送，给我们创建域名邮箱设立了门槛，但大多未禁止 25 端口的接收，需要**手动放行 25 端口**。

之后就可以使用 `ntfy-<topic>+<access token>@ntfy.example.com` 地址来接收邮件。

#### 添加 DNS 记录

除了修改 [/etc/ntfy/server.yml](#/etc/ntfy/server.yml) 之外，还需要给你的域名 `example.com` 添加 DNS 记录以实现正常访问。

⚠️ 注意把 example.com 改成你自己的域名。

| 名称                | 类型 | 值                     | 备注                                  |
| ------------------- | ---- | ---------------------- | ------------------------------------- |
| ntfy.example.com    | A    | `公网 IPv4 地址`       | 对应 `base-url`，是访问 WebUI 的地址  |
| ntfy.example.com    | MX   | ntfy-mx.example.com | 对应 `smtp-server-domain`，是邮件地址 |
| ntfy-mx.example.com | A    | `公网 IPv4 地址`       | 和上面的值对应。                      |

其实没有必要添加第三条记录，将 MX 记录的值 `ntfy-mx.example.com` 改成 `ntfy.example.com` 就可以了。

#### 反向代理

这里我使用的方案是之前写过的一篇博客《[使用 Caddy 和 acme.sh 实现反向代理](../reserve-proxy-caddy-acmesh/)》。

根据 ntfy 官方文档 - [Behind a proxy](https://docs.ntfy.sh/config/#behind-a-proxy-tls-etc)，但我没有用文档给出的参考配置。

```bash
sudo vim /etc/caddy/Caddyfile
```

```
ntfy.k1r.in {
        encode gzip
        tls /home/acme/certs/example.com.fc.crt /home/acme/certs/example.com.pem
        reverse_proxy 127.0.0.1:2586
}
```

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

文档给出的配置文件主要是为了将 HTTP 重定向到 HTTPS，让它在使用 `curl` 不用添加 `https://` 前缀，我觉得没有必要。

另外，使用 Caddy 在这里有个好处就是不用额外配置就支持 WebSockets，在 ntfy 客户端更改链接协议为 WebSockets，相比于“HTTP 传输的 JSON 数据流”更加省电（开发者说的，我没怎么体会到）。

如果成功配置了反向代理，你现在就可以通过 `https://ntfy.example.com` 访问到自部署的 ntfy 私有实例了。

#### 添加用户、访问令牌

根据 ntfy 官方文档 - [Users and roles](https://docs.ntfy.sh/config/#users-and-roles)，我们可以使用 `ntfy user` 来添加用户。

需要注意的是，由于 `auth-file: "/var/lib/ntfy/user.db"` 仅所有者 ntfy 可写，使用 `ntfy user` 命令需要 root 权限。

⚠️ 可以将 phil 改成你想要的用户名。

```bash
sudo ntfy user add --role=admin phil
sudo ntfy user list
```

根据 ntfy 官方文档 - [Access tokens](https://docs.ntfy.sh/config/#access-tokens)，我们可以使用 `ntfy token` 来添加访问令牌。

原因同上，使用 `ntfy token` 命令需要 root 权限。

⚠️ 记得将 phil 改成你的用户名。

```bash
sudo ntfy token add phil
sudo ntfy token list
```

### 使用

到此，你已经部署好一个 ntfy 私有实例了。

在官方文档 - [Sending messages](https://docs.ntfy.sh/publish/) 中，已经把发送通知的参数说明清楚了，**推荐完整阅读**，我这里就不赘述了。

接下来就讲一下在各种场景中怎么使用，主要是因为私有实例，需要进行身份验证。

#### (1) bash 脚本（命令行）

```bash
curl \
  -H "Authorization: Bearer tk_123456" \
  -H "Title: Unauthorized access detected" \
  -d "Remote access to phils-laptop detected. Act right away." \
  https://ntfy.example.com/phil_alerts
```

**身份验证**有两种方式：

1. 访问令牌：`-H "Authorization: Bearer tk_123456"`
2. 用户密码：`-u testuser:fakepassword`

注意最后一行的网址要加 `https://` 前缀，因为前面[反向代理](#反向代理)并没有设置将 HTTP 重定向到 HTTPS。

#### (2) Webhook 推送

前面提到，很多服务都集成通知设置，其中大多支持 ntfy，而他们大多都是以 JSON 的格式配置通知的。

还有一些服务（如 Jellyfin Webhook 插件），本身并未集成 ntfy 通知，但是支持通用的 Webhook，也是如下设置。

根据官方文档 - [Publish as JSON](https://docs.ntfy.sh/publish/#publish-as-json)：

- URL：`https://ntfy.example.com`

- Header：
  ```json
  {
  	"Authorization": "Bearer tk_123456"
  }
  ```

- Body：
  ```json
  {
      "topic": "phil_alerts",
      "title": "Unauthorized access detected",
      "message": "Remote access to phils-laptop detected. Act right away."
  }
  ```

需要注意的是，**URL 不能带上主题，即只能是 `https://ntfy.example.com`** ，不能是 `https://ntfy.example.com/phil_alerts`。

#### (3) 通过邮件推送

一些服务（如 TrueNAS Core 的系统警报服务），既没集成 ntfy 通知，也不支持通用 Webhook，但是支持发送邮件。

电子邮件接收地址为 `ntfy-phil_alerts+tk_123456@ntfy.example.com`

- `ntfy-` 是 `smtp-server-addr-prefix` 设置的地址前缀。
- `phil_alerts` 是你的主题名称。
- `tk_123456` 是你的访问令牌，前面用 `+` 连接。
- `ntfy.example.com` 是 `smtp-server-domain` 设置的邮件地址。

### 示例

这里放一些在我自部署过程中遇到的比较特殊的 ntfy 通知设置。

#### Jellyfin Webhook

[Jellyfin Webhook Ntfy 官方模板](https://github.com/jellyfin/jellyfin-plugin-webhook/blob/master/Jellyfin.Plugin.Webhook/Templates/Ntfy.handlebars)

主要涉及 Python jinja 语法，需要修改的话，可以用 `.handlebars` 后缀保存文件，就会有语法高亮。

#### acme.sh

根据 acme.sh 项目 Wiki - [Set notification for ntfy](https://github.com/acmesh-official/acme.sh/wiki/notify#25-set-notification-for-ntfy)，使用下面的命令来设置通知。

```bash
export NTFY_URL="https://ntfy.sh"
export NTFY_TOPIC="xxxxxxxxxxxxx"

acme.sh --set-notify --notify-hook ntfy
```

只提供了 URL 和 Topic 的传入，没有身份验证的方式。查阅对应的代码得知，其实就是对 URL 和 Topic 两个变量进行简单拼接，所以我们可以通过在 Topic 变量里添加查询参数对来实现身份验证。

根据 ntfy.sh 官方文档 - [Query param](https://docs.ntfy.sh/publish/#query-param)，可以使用 `auth` 来完成身份验证，但这里的值不是用户密码/访问令牌，而是对二者编码后的结果。

在 Linux 系统可以运行下面的命令（二者取其一即可）。

⚠️ 注意将命令中的 `user:passwd` 或者 `tk_123456` 改成你的。

```bash
echo -n "Basic `echo -n 'phil:password' | base64`" | base64 | tr -d '='
# 或者对访问令牌
echo -n "Bearer tk_123456" | base64 | tr -d '='
```

然后就可以使用如下命令设置 acme.sh 的 ntfy 通知。

```bash
export NTFY_URL="https://ntfy.example.com"
export NTFY_TOPIC="acmesh?auth=QmFza..."

acme.sh --set-notify --notify-hook ntfy
```

