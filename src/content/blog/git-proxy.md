---
author: KrDw
pubDatetime: 2024-02-02T16:18:18.000+08:00
modDatetime: 2024-02-02T16:18:18.000+08:00
title: 配置 git 代理连接 GitHub
featured: false
draft: false
tags:
  - notes
  - git
  - ssh
  - proxy
description: "git 的代理有两种，一种是走 https 协议的 http 代理，一种是走 ssh 协议的 ssh 代理。"
---

### Table of Contents

使用 git 时我们肯定离不开 GitHub，但国内网络环境连接到 GitHub 总会出现时好时不好的情况，本文记录一下如何配置 git 代理（http 和 ssh）来解决这个问题。

> 下面主要是记录解决的步骤，如果你想要了解更详细的信息，可以参阅这篇文章：https://hellodk.cn/post/975

> 本文也是对之前学习 git 时做的笔记的补充 > [krdw-git-note#SSH-Key](https://k1r.in/posts/krdw-git-note/#SSH-Key)

### 区分 http 和 ssh 代理

git 的代理有两种，一种是走 https 协议的 http 代理，一种是走 ssh 协议的 ssh 代理。

一般**使用 http 代理**的情况就是在 clone 仓库并使用 https 时，比如

```shell
git clone https://github.com/KrDw9ec4/KrDw9ec4.github.io.git
```

而**使用 ssh 代理**的情况就比较多了，

在 clone 仓库并使用 ssh 时，比如

```shell
git clone git@github.com:KrDw9ec4/KrDw9ec4.github.io.git
```

本地仓库与 GitHub 远程仓库进行推送和拉取时，比如

```shell
git push origin main
```

### 设置 http 代理

其实 git 的远程仓库不只有 GitHub，你也可以在自己的服务器上创建一个 git 仓库，所以我们设置 http 代理最好只对 GitHub 生效即可。

```shell
git config --global http.https://github.com.proxy http://127.0.0.1:7890
```

你可以前往 `~/.gitconfig` 查看是否配置成功：

```
[http "https://github.com"]
	proxy = http://127.0.0.1:7890
```

也可以自己使用 http 来 clone 一个仓库试试。

### 设置 SSH 代理

打开 `~/.ssh/config` 你就可以看到你的 SSH 配置，我们要做的就是在这里添加类似下面的一段配置：

```
Host ssh.github.com
  Hostname ssh.github.com
  IdentityFile "C:\Users\krdw\.ssh\id_rsa"
  User git
  Port 443
  ProxyCommand "C:\Program Files\Git\mingw64\bin\connect.exe" -S 127.0.0.1:7890 -a none %n %p
```

你需要做出相应更改：

- IdentityFile: 这后面接的是你用于与 GitHub 连接的密钥对的私钥路径（请确保你将公钥添加到你的 GitHub 账户）
- ProxyCommand: 开头的路径是 git 安装路径里的 connect.exe 文件路径，再接上一些参数和你的代理地址

需要说明的是，这里的 Port 采用的是 443 端口，，而不是 ssh 的 22 端口，是因为大多数机场都限制了 22 端口，如果你使用 22 端口则可能会出现下面的错误：

```
kex_exchange_identification: Connection closed by remote host
Connection closed by UNKNOWN port 65535
```

我一开始是参照知乎上的一篇文章配置的代理，他就是使用了 22 端口导致我一直报这个错误。

设置完成之后，你可以使用下面的命令来查看是否成功：

```shell
ssh -T git@github.com
```

也可以自己使用 ssh 来 clone 一个仓库试试。
