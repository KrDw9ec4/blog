---
author: KrDw
pubDatetime: 2025-01-20T19:15:00.000+08:00
title: 使用 acme.sh 集中申请和统一分发 SSL 证书
featured: false
draft: false
tags:
  - server
  - PRACTICES
description: "介绍了如何在一台服务器上使用 acme.sh 集中申请 SSL 证书，并通过 Deploy API 将证书统一分发到多台远程服务器。"
---

### 前言

我之前写了一篇《[使用 Caddy 和 acme.sh 实现反向代理](../reserve-proxy-caddy-acmesh/)》，主要介绍的是单一机器上，使用 acme.sh 申请证书，使用 Caddy 作为反向代理的一套方案。

但当机器多起来，每一台机器都要重新安装 acme.sh，每次申请下来的证书的有效期也不统一，管理起来很麻烦。

所以这篇文章主要讲一下在一台机器上使用 acme.sh 集中申请和统一分发 SSL 证书的方案。

*因为本文重点在于 acme.sh，对于 Caddy 只会一笔带过，可以看上面这篇文章来了解。*

### 安装 acme.sh

参照 acme.sh 项目的 Wiki - [How to install](https://github.com/acmesh-official/acme.sh/wiki/How-to-install)，里面有一行命令安装：

```bash
curl https://get.acme.sh | sh -s email=mail@example.com
```

但我这里用“高级安装”中的方式：

```bash
git clone --depth 1 https://github.com/acmesh-official/acme.sh.git
cd acme.sh
```

```bash
./acme.sh --install \
--home ~/acme \
--config-home ~/acme/config \
--cert-home  ~/acme/certs \
--accountemail  "mail@example.com"
```

- `--home` 是安装 acme.sh 的自定义目录。默认情况下，它安装到 `~/.acme.sh`。
- `--config-home` 是一个可写文件夹，acme.sh 会将所有文件（包括证书/密钥、配置）写入其中。 默认情况下，它位于 `--home` 中。
- `--cert-home` 是一个自定义目录，用于保存您颁发的证书。 默认情况下，它保存在 `--config-home` 中。
- `--accountemail` 是用于注册 Let's Encrypt 帐户的电子邮件，您将在此处收到续订通知电子邮件。

### 配置远程服务器

在本篇文章中，我将会用“**本地服务器**”指代部署了 acme.sh 用于申请证书的服务器，“**远程服务器**”指代最终分发证书的目标服务器。

***这一部分要注意是本地服务器还是远程服务器，远程服务器是默认用户还是 acme 用户***。我在每次切换时都用粗体标注出来了，希望能起到提醒作用。

在分发证书到远程服务器之前，我们需要先配置好远程服务器以便下一步操作。

#### 创建 acme 用户

因为后续分发时，acme.sh 的 Deploy API 限制（支持多个服务器地址，但用户名称并未给出多个的选项），所以统一新建一个用户 acme。

切换到**远程服务器**，

```bash
# 添加 acme 用户
sudo useradd -m -g nogroup -s /bin/bash acme
# 把 acme 用户添加到 sudo 组
sudo usermod -aG sudo acme
# 给 acme 用户设置密码
sudo passwd acme
```

需要注意的是，上面的操作是基于 visudo 中有 `%sudo   ALL=(ALL:ALL) ALL`，即给予 sudo 组的用户执行 sudo 的权限。如果没有的话，acme 用户执行 sudo 时会报错，解决方法就是添加前面这一行。

```bash
su - acme
```

接下来就切换到 **acme 用户**，

```bash
mkdir ~/.ssh
sudo chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
sudo chmod 600 ~/.ssh/authorized_keys
```

#### 交换 SSH 密钥

切换到**本地服务器**上，如果没有生成 SSH 密钥，可以使用如下命令：

```bash
ssh-keygen -t ed25519 -a 256 -C "mail@example.com"
# 可以一路回车，也可以按你需要操作。
# 公钥默认是保存到 ~/.ssh/id_ed25519.pub
```

然后复制公钥，

```bash
cat ~/.ssh/id_ed25519.pub
```

切换到**远程服务器**的 **acme 用户**，

```bash
vim ~/.ssh/authorized_keys
# 粘贴本地服务器的公钥
```

可以在本地服务器尝试 SSH 连接到远程服务器，确认能**从本地服务器免密登录到远程服务器的 acme 用户**。

#### 免密重载 Caddy 服务

更新证书后一般需要重载 Caddy 服务 `sudo systemctl reload caddy`，涉及 sudo 不好自动执行，所以需要配置免密执行这个命令。

切换到**远程服务器**，

```bash
sudo vim /etc/sudoers.d/acme-nopassword
```

```bash
acme ALL=(ALL) NOPASSWD: /bin/systemctl reload caddy
```

```bash
su - acme
```

切换到 **acme 用户**，

```bash
sudo systemctl reload caddy
# 确认是不是不用输入密码就可以执行。
```

#### 其他

我是打算将证书都保存到远程服务器的 `/home/acme/certs` 文件夹中。

切换到**远程服务器**的 **acme 用户**，

```bash
mkdir ~/certs
```

还要安装 acl 来管理证书文件权限。

```bash
sudo apt update
sudo apt install acl
```

到此，远程服务器就配置完成了，之后的操作均在**本地服务器**上。

### 使用 DNS API 申请证书

参照 acme.sh 项目的 Wiki - [How to issue a cert](https://github.com/acmesh-official/acme.sh/wiki/How-to-issue-a-cert)，因为打算申请泛域名证书，所以要用 DNS API 来验证所有权。

因为我的域名托管在 CloudFlare，这里就以 CloudFlare 举例，其他 DNS 解析服务商具体操作见 [How to use DNS API](https://github.com/acmesh-official/acme.sh/wiki/dnsapi)。

#### 创建 API 令牌

打开 CloudFlare，登录账号，右上角头像“我的个人资料”。

左侧“API 令牌”，然后点击“创建令牌”，使用 “API 令牌模板”中的“**编辑区域 DNS**”的模板。

- 令牌名称：ACMESH。// 最好不要保持默认。
- 权限：保持默认不变。
- 区域资源：包括 - 特定区域 - \<domain\>。// “添加更多”可以用于多个域名。

![创建用户 API 令牌](https://img.k1r.in/2025/01/picgo_06c9c163c600a4386b605159c2c754a0.png)

#### 获取账户 ID

因为很可能涉及多个域名，最好是用账户 ID 而不是单一域名区域 ID。账户 ID 就是登录后网址最后那串字符。

#### 申请泛域名证书

```bash
export CF_Token="<cloudflare-api-token>" # 替换成你的 API 令牌
export CF_Account_ID="<cloudflare-account-id>" # 替换成你的账户 ID
acme.sh --issue --dns dns_cf -d example.com -d '*.example.com'
```

因为 acme.sh 会保存 `CF_Token` 和 `CF_Account_ID` 到配置文件中，如果没有更新的话，后面申请可以省略前两行。

### 使用 Deploy API 分发证书

参照 acme.sh 项目的 Wiki - [deployhooks](https://github.com/acmesh-official/acme.sh/wiki/deployhooks#3-deploy-the-cert-to-remote-server-through-ssh-access)，可以通过 SSH 将证书部署到远程服务器。SSH 这个方法比较通用，但 Wiki 里也有其他特定场景的方法。

```bash
# ⚠️ 注意将 admin 换成你的用户名，将 1.1.1.1 换成你的地址。
# export DEPLOY_SSH_CMD='ssh -p 8822'
export DEPLOY_SSH_USER=acme
export DEPLOY_SSH_SERVER="1.1.1.1 1.2.3.4"
# ⚠️ 注意各种路径中的 example.com 换成你自己的域名。
export DEPLOY_SSH_KEYFILE="~/certs/example.com.pem"
export DEPLOY_SSH_CERTFILE="~/certs/example.com.crt"
export DEPLOY_SSH_CAFILE="~/certs/example.com.ca.crt"
export DEPLOY_SSH_FULLCHAIN="~/certs/example.com.fc.crt"
export DEPLOY_SSH_REMOTE_CMD="chmod 600 ~/certs/example.com.pem; \
setfacl -R -m u:caddy:rX ~/certs; \
sudo systemctl reload caddy"
export DEPLOY_SSH_BACKUP=no
# ⚠️ 注意下面命令中的 example.com 换成你自己的域名。
acme.sh --deploy -d example.com -d '*.example.com' --deploy-hook ssh
```

*如果需要修改配置，重新执行一遍就会覆盖原有配置。*

- `DEPLOY_SSH_SERVER` 是远程服务器地址，空格隔开。
- 证书位置统一在远程服务器的 `/home/acme/certs/` 里。
- `DEPLOY_SSH_REMOTE_CMD` 这里有三条命令，后两条主要是配置 Caddy 服务的。

### 安装证书到本地

如果本地服务器也需要证书，使用下面的命令就可以安装到特定位置了。

需要注意的是，因为本地服务器并没有创建 acme 用户，下面的 `~/certs` 是在默认用户的家目录中。

```bash
acme.sh --install-cert -d example.com -d '*.example.com' \
--key-file ~/certs/example.com.pem \
--cert-file ~/certs/example.com.crt \
--ca-file ~/certs/example.com.ca.crt \
--fullchain-file ~/certs/example.com.fc.crt \
--reloadcmd "chmod 600 ~/certs/example.com.pem;\
setfacl -R -m u:caddy:rX ~/certs;\
sudo systemctl reload caddy"
```

### 启动 Caddy

```bash
sudo vim /etc/caddy/Caddyfile
```

```bash
www.example.com {
	encode gzip
	tls /home/acme/certs/example.com.fc.crt /home/acme/certs/example.com.pem
	reverse_proxy 127.0.0.1:8080
}
```

```bash
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl start caddy
sudo systemctl status caddy
```

### 配置 ntfy 通知

我今天还写了一篇《[使用 ntfy 推送通知](../notify-ntfy/)》，从安装、配置到使用全流程地带着你入手 ntfy。

因为 acme.sh 的 ntfy 通知脚本比较朴素，连身份验证方式都没给出，我在上面的文章中也讲了如何在 acme.sh 中使用 ntfy 通知，[点我查看](../notify-ntfy/#acmesh)。

最终结果如下：

```bash
export NTFY_URL="https://ntfy.example.com"
export NTFY_TOPIC="acmesh?auth=QmFza..."
acme.sh --set-notify \
--notify-hook ntfy \
--notify-level 3 \
--notify-mode 0
```
