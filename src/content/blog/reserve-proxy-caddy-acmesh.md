---
author: KrDw
pubDatetime: 2024-07-10T01:00:11.000+08:00
modDatetime: 2024-12-21T22:45:00.000+08:00
title: 使用 Caddy 和 acme.sh 实现反向代理
featured: false
draft: false
tags: 
  - network
  - server
  - PRACTICES 
description: "使用 acme.sh 定期申请泛域名 SSL 证书，配置 Caddy 进行反向代理，实现 HTTPS + 域名访问。"
---

### Table of Contents 

### 前言

IP+端口如何变成直接域名访问的呢？

![反向代理流程示例图](https://img.k1r.in/2024/07/picgo_301bd848aec9e5e1d8e2f26b907c8666.svg)

假设你在 IP 地址为 1.1.1.1 的服务器上部署了一个 web 服务，它监听 8080 端口，那么你现在可以通过 <u>`http://1.1.1.1:8080`</u> 访问。

#### (1) DNS 解析

你再对你持有的域名 `example.com` 进行 DNS 解析，添加 A 类型记录，名称填 `www`，地址填 `1.1.1.1`，此时可以通过 <u>`http://www.example.com:8080`</u> 访问。

#### (2) 反向代理

输入 `http://www.example.com`，其实就是访问的 `http://www.example.com:80`，很方便，所以需要复用 80 端口，就需要反向代理。

让反向代理软件先监听 80 端口，进行配置（大致就是如果访问域名是 `www.example.com` 就反向代理到 `1.1.1.1:8080` 上），此时可以通过 <u>`http://www.example.com`</u> 访问。

#### (3) 配置 SSL 证书

和 HTTP 的默认端口是 80 类似，HTTPS 的默认端口是 443。

HTTPS 相比于直接 HTTP 访问更安全，但需要 SSL 证书，在反向代理那配置好了 SSL 证书之后，此时就可以通过 <u>`https://www.example.com`</u> 访问。

下面就介绍一种我用的反向代理方案，**使用 acme.sh 定期申请泛域名 SSL 证书，配置 Caddy 进行反向代理，实现 HTTPS + 域名访问。**

**温馨提示，请确保你的服务器放行 80 和 443 端口**，否则无法正常访问。国内云服务器需要进行备案才能使用 80 和 443 端口。

### Caddy

与常见的 Nginx 反向代理相比，[Caddy](https://caddyserver.com/) 的配置更为简单，仅需几行简单的配置即可实现基本的反向代理功能。

[点击此处查看后续的 Caddy 配置文件示例](#4-编辑-caddyfile)

虽然很多人推荐新手使用 Nginx Proxy Manager，图形化界面加上能申请泛域名证书，对新手很友好。但它内存占用高，主体加上数据库的大小超过 100MB，而 Caddy 的内存占用则仅仅不到 30MB。

#### (1) 安装 Caddy

Caddy 的官方文档提供了多种安装方式，详细信息可在 [Caddy 官方文档的安装页面](https://caddyserver.com/docs/install)找到。

虽然 Caddy 可以使用 Docker 部署，但我试过后并不推荐，使用起来反而更复杂。

我这里就贴一下在 Debian 系统上安装的示例：

```shell
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### (2) 配置 Caddyfile

Caddy 的配置文件称为 Caddyfile，默认是放在 `/etc/caddy/Caddyfile`。

```shell
sudo vim /etc/caddy/Caddyfile
# ~~~ 分隔符，表示进入文本编辑界面
www.example.com {
    reverse_proxy 127.0.0.1:8080
}
# 英文下键入 :wq，保存并退出
# ~~~ 分隔符，表示退出文本编辑界面
```

关于 Caddyfile 的编写具体请查看 [Caddy 官方文档](https://caddyserver.com/docs/)，也可以多问问 ChatGPT，但其实就是把上面这个重复多次即可。

#### (3) 启动 Caddy

Caddy 需要使用 root 权限启动，否则将无法监听低位端口 80 和 443。

```shell
sudo caddy start --config /etc/caddy/Caddyfile
```

之后，你可以通过 `http://www.example.com` 进行访问。

#### (4) 泛域名 SSL 证书

如果你稍微了解一点 Caddy，就会发现它相比于 Nginx 还有一个特点就是会自动申请 SSL 证书。所以，你刚刚访问的 `www.example.com` 可能已经是 HTTPS 访问。

不过，Caddy 默认申请的 SSL 证书仅适用于 `www.example.com`，无法用于其他子域名。

泛域名证书则是能用在 `*.example.com` 下，所有的二级域名都可以用。

如需泛域名证书，可以使用后文介绍的 acme.sh 脚本进行申请和更新。Caddy 本身申请泛域名证书的流程很麻烦。

### acme.sh

[acme.sh](https://github.com/acmesh-official/acme.sh) 是发布在 GitHub 上的一个脚本，可以通过 acme 协议，从 Let's Encrypt 申请免费的泛域名证书。

PS 不管是 GitHub 还是 Let's Encrypt 都是境外网站，如果不能正常运行，大概率是网络问题，需要自行解决。

#### (1) 安装 acme.sh

所谓的安装其实就是从网上拉取一个脚本文件下来，然后执行。

```shell
curl https://get.acme.sh | sh -s email=mail@example.com
```

PS 你可以把这里的邮箱地址改为你的邮箱，不管也可以。

#### (2) 申请泛域名证书

这里我们采用 DNS 的方式，通过域名解析商提供的 api 自动添加 txt 记录验证域名的所有权。

支持的域名解析商以及使用说明详见 [How to use DNS API](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)，这里以 [CloudFlare](https://github.com/acmesh-official/acme.sh/wiki/dnsapi#dns_cf) 为例。

打开 CloudFlare 官网，右上角“我的个人资料”，“API 令牌”点“创建令牌”，“API 令牌模板”-“编辑区域 DNS”-“使用模板”，“区域资源”-“包括特定区域”，选择你的域名。

![用户 API 令牌](https://img.k1r.in/2024/12/picgo_d5ab976dbe666f1d3a206b59cfae519f.png)

点击继续，保存给出的 API 令牌。

参照教程，[最好使用账户 ID 而不是区域 ID](https://github.com/acmesh-official/acme.sh/wiki/dnsapi#ii-multiple-dns-zones)，以便为**同一账户的多个域名**进行申请。账户 ID 就是登录后网址最后那串字符。

```shell
export CF_Token="<cloudflare-api-token>" # 替换成你的 API 令牌
export CF_Account_ID="<cloudflare-account-id>" # 替换成你的账户 ID
acme.sh --issue --dns dns_cf -d example.com -d '*.example.com'
```

等待脚本执行完毕，就成功申请了。

#### (3) 安装证书

这一步就是把之前生成的证书复制到其他地方。

```shell
acme.sh --install-cert -d example.com \
--key-file       ~/caddy/example.com/key.pem  \
--fullchain-file ~/caddy/example.com/cert.pem \
--reloadcmd     "caddy reload --config /etc/caddy/Caddyfile"
```

#### (4) 编辑 Caddyfile

这里对 Caddyfile 进行编辑，让它用上刚刚申请的泛域名证书来配置 HTTPS。

```shell
sudo vim /etc/caddy/Caddyfile
# ~~~ 分隔符，表示进入文本编辑界面
www.example.com {
    encode gzip
	tls ~/caddy/example.com/cert.pem ~/caddy/example.com/key.pem
    reverse_proxy 127.0.0.1:8080
}

blog.example.com {
    encode gzip
	tls ~/caddy/example.com/cert.pem ~/caddy/example.com/key.pem
    reverse_proxy 127.0.0.1:9090
}
# 英文下键入 :wq，保存并退出
# ~~~ 分隔符，表示退出文本编辑界面
# 重启 reload 让配置生效
caddy reload --config /etc/caddy/Caddyfile
```

可以看到，我上面给出了两个子域名的反向代理配置，其实只用改动 reverse_proxy 这个参数。

### 补充说明

这篇博客主要还是走了一遍配置 Caddy + acme.sh 反向代理的流程走了一遍，主要目的是介绍 Caddy + acme.sh 这一套方案。

实际配置下来可能还会遇到很多问题，请自行查看相应的官方文档，或者把问题放在底下评论区，但我也不能保证我能解决，我也是小白捏。

#### (1) 创建 Caddy 服务

如果你使用 apt 安装，Caddy 自带 systemd 服务，默认的配置文件路径是位于 `/etc/caddy/Caddyfile`。

```bash
sudo systemctl status caddy
# 查看 caddy 服务状态
# 按 `q` 退出
# 如果你之前是按步骤下来的，Caddy 正常运行的话，则需要先将 Caddy 暂停。
caddy stop
# 然后就可以尝试以 systemd 服务来启动 Caddy。
sudo systemctl start caddy
# 如果也正常运行的话，就可以让其开机自启动。
sudo systemctl enable caddy
```

之后修改 Caddyfile 后要用 systemctl 命令让其生效。

```bash
sudo systemctl reload caddy
# 原来的这个命令经过我测试发现无法正常工作：
# caddy reload --config /etc/caddy/Caddyfile
```

所以之前[安装证书](#3-安装证书)时的 `reloadcmd` 要进行修改，参照官方给出的 [关于修改 reloadcmd](https://github.com/acmesh-official/acme.sh/wiki/说明#6-关于修改-reloadcmd)，其实就是直接修改 `~/.acme.sh/example.com/example.conf`。

```bash
vim ~/.acme.sh/example.com/example.com.conf
# ~~~ 分隔符，表示进入文本编辑界面
# 找到 Le_ReloadCmd，改成：
Le_ReloadCmd='sudo systemctl reload caddy'
# ~~~ 分隔符，表示退出文本编辑界面
```

接下来配置 `sudo` 免密码执行，这样在 `cron` 中执行时就不会被要求输入密码。

```bash
# 临时设置默认编辑器为 vim
export EDITOR=vim
sudo -E visudo
# ~~~ 分隔符，表示进入文本编辑界面
# 我的用户名是 krdw，你注意要改成自己的用户名
# 在最后一行添加：
krdw ALL=(ALL) NOPASSWD: /bin/systemctl reload caddy.service
# ~~~ 分隔符，表示退出文本编辑界面
```

用 Caddy 服务的好处就是开机自启动，如果你用的是之前的命令的话，重启之后还需要手动启动一下。

#### (2) 证书文件使用 ACL 管理权限

如果你使用 [(1) Caddy 服务](#1-创建-caddy-服务)的话，可能就会遇到文件权限问题。

这是因为 acme.sh 安装的证书文件的权限是只有所有者（即你所用的用户）可以读取，但 Caddy 服务是通过一个全新的用户 caddy 运行的，就无法读取证书文件。

这里就可以使用 ACL 管理证书文件的权限。

```bash
sudo apt update
sudo apt install acl
# 给 caddy 用户递归添加读取的权限
sudo setfacl -R -m u:caddy:rX ~/caddy/example.com
# 下面可以用 getfacl 查看权限
getfacl ~/caddy/example.com
# 输出中应该有一行：
# user:caddy:r-x
```

这样应该在启动 Caddy 时就不会遇到文件权限冲突的问题了。

#### (3) 使用 acme.sh 集中申请和统一分发 SSL 证书

如果你有多台机器都需要使用 SSL 证书，那么我推荐你看一下我《[使用 acme.sh 集中申请和统一分发 SSL 证书](../acmesh-issue-deploy-certificates/)》中提到的方案。

#### (4) 非 80 443 端口

在国内非备案情况下，80 和 443 端口常常是被封禁的，此时如果想要通过一个已知可用的端口来进行代替的话，比如 44380，用 Caddy 也很简单，就在原地址后面加端口就行。

```shell
sudo vim /etc/caddy/Caddyfile
~~~ # 分隔符，表示进入文本编辑界面
www.example.com:44380 {
    encode gzip
	tls ~/caddy/example.com/cert.pem ~/caddy/example.com/key.pem
    reverse_proxy 127.0.0.1:8080
}

blog.example.com:44380 {
    encode gzip
	tls ~/caddy/example.com/cert.pem ~/caddy/example.com/key.pem
    reverse_proxy 127.0.0.1:9090
}
# 英文下键入 :wq，保存并退出
~~~ # 分隔符，表示退出文本编辑界面
# 重启 reload 让配置生效
sudo systemctl reload caddy
```

#### (5) 快速编辑 Caddyfile

可以用环境变量保存 Caddyfile 文件路径。

```shell
vim ~/.bashrc # 其实我更推荐用单独文件保存环境变量和别名
~~~ # 分隔符，表示进入文本编辑界面
export caddyfile=/etc/caddy/Caddyfile
# 英文下键入 :wq，保存并退出
~~~ # 分隔符，表示退出文本编辑界面
source ~/.bashrc # 刷新 bash 配置
```

之后就可以用 `$caddyfile` 代替。

```shell
sudo caddy start --config $caddyfile
caddy reload --config $caddyfile
```

#### (6) 部署静态博客

如果你在服务器上部署了静态博客，相应的 Caddyfile 配置如下。

```
blog.example.com {
	encode gzip
	root * /path/to/website # 替换为你的博客根目录
	file_server
	tls ~/caddy/example.com/cert.pem ~/caddy/example.com/key.pem
}
```

不过我挺推荐你把静态博客部署到 CloudFlare Pages 上的，[我的博客就是部署到 CloudFlare Pages 上](../../about/#06-15)。
