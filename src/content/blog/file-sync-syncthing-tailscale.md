---
author: KrDw
pubDatetime: 2024-07-08T03:00:00.000+08:00
modDatetime: 2024-07-08T11:27:00.000+08:00
title: 使用 Syncthing 和 Tailscale 实现文件同步
featured: true
draft: false
tags:
  - homeserver
  - PRACTICES
description: "在国内复杂的网络环境下，利用 Tailscale 解决设备发现和连接问题，充分发挥 Syncthing 的文件同步能力，并附上具体操作步骤。"
---

### Table of Contents

### 前言

在网上冲浪时，总会见到有人问文件同步相关的方案（大多是在用 Obsidian，问笔记文件的同步），之前我一般都是丢个 Syncthing+Tailscale，也不知道能不能传达到我的意思，于是就写这篇博客具体讲讲我的文件同步方案。

[不看废话，直接上手操作点我。](#具体操作)

### Syncthing

[Syncthing](https://syncthing.net/#) 是一款开源的文件同步工具，可以在不同设备之间实现文件的无缝同步。与 OneDrive 这种同步盘不同，**Syncthing 通过在设备之间直接同步文件来保证每个设备上都保存一份完整的本地文件**。

![Syncthing界面](https://img.k1r.in/2024/07/picgo_dfe39d3b3122b5dcf42f9148ea2ea913.png)

设备之间的连接支持：

- 本地发现：支持局域网内的设备自动发现。
- NAT 穿透：在非局域网环境下，通过打洞实现设备之间的连接。
- 全局发现：借助发现服务器发现设备。
- 启用中继：通过中继服务器进行数据传输。

**Syncthing 通过将文件分段（称为块）来传输数据，使得多个设备可以同时共享同步负载，类似于 torrent 协议**。在线设备越多，数据传输速度越快，因为可以并行地从所有设备获取数据块。

### Why Syncthing + Tailscale

你可以先进行测试，只用 Syncthing 的情况下，不同设备在非局域网下能否正常连接和传输。

如果可以，那么恭喜你，Syncthing 自带的 NAT 穿透就能满足使用，你可以只用 Syncthing，不用折腾下面的方案。

但需要说明的是，这只表示你当前的网络环境很简单，你不能保证之后的使用情景下都能处于这样的网络环境中，所以我还是推荐搭配 Tailscale 使用，个人认为这应该是使用 Syncthing 进行文件同步的一种最佳实践了。

在国内，由于各大运营商持有的公网 IPv4 紧缺，家庭宽带至少有一层 NAT，这就导致网络环境变得复杂。**大多数穿透工具，比如 Syncthing 自带的 NAT 穿透功能，都无法有效解决在这种环境下的相互发现和连接问题**。

不过，国内也在普及 IPv6，大多数家宽都附带了 IPv6（公网），通过 Tailscale 进行异地组网，可以解决这个问题。

> 扩展阅读： [DDNS v Tailscale v Cloudflared](../ddns-tailscale-cloudflared)
>
> 主要讲的就是非局域网下访问其他设备的不同方式（DDNS、内网穿透、异地组网）。

### Tailscale

[Tailscale](https://tailscale.com/) 是一款商业化闭源的异地组网工具，基于 WireGuard 协议，免费方案（最多3个用户，最多100台设备）足够大多数人使用了。

最大的优点就是上手极其简单，每台设备都安装好 Tailscale 之后，登录即被纳入一个“大局域网”中。

在局域网下，Tailscale 会直接发现设备本地地址，和 Syncthing 的“本地发现”一样。

在非局域网下，如果两端设备都有 IPv6 的情况下，能实现设备间直连。如果两端设备不都有 IPv6，会走 Tailscale 官方的中转服务器，这也是 Tailscale 相对于 Syncthing 的另一优势。

值得一提的是，用 Tailscale 异地组网之后，可玩性很高，不只可以用于 Syncthing 同步文件，你之前在局域网能做的，在 Tailscale 下都能做，比如你可以在非局域网环境下，使用局域网文件传输工具（[LocalSend](https://localsend.org/zh-CN)）传文件。

### 具体操作

假如你有两台设备 A 和 B，Tailscale IPv4 地址分别为 100.100.1.1 和 100.100.1.10，对应的 Syncthing 设备 ID 分别为 ID-A 和 ID-B。

#### (1) Syncthing 设置

打开**两台设备（设备 A 和 设备 B）** Syncthing 的 web 界面（安卓端要打开“图形化管理界面”），右上角“操作”-“设置”-“连接”。

![Syncthing的“连接”设置](https://img.k1r.in/2024/07/picgo_5f2762c9aff86f4379f5f0ee46d010f0.png)

协议监听地址填：

```
tcp://0.0.0.0:22000, quic://0.0.0.0:22000
```

可以关闭此处的另外四个功能以让 Tailscale 完全接管设备之间连接。

#### (2) 设备 A 添加远程设备 B

在设备 A，点击“添加远程设备”，设备 ID 处填入 ID-B。

![设备A添加设备B](https://img.k1r.in/2024/07/picgo_19434e54a8dd4d441d9db5b29be1fcbd.png)

再点击“高级”，“地址列表”填入：(这里的地址是设备 B 的 Tailscale IPv4 地址)

```
tcp://100.100.1.10:22000, quic://100.100.1.10:22000
```

#### (3) 设备 B 同意申请

打开设备 B 的 Syncthing web 界面，你会看到一个新设备申请，点击“添加设备”。

![设备B同意添加](https://img.k1r.in/2024/07/picgo_f732d85ca6d9c51909082d75b0a6e9d4.png)

**需要特别注意的是（可以说我写这篇博客就是为了点明这个操作）**，这里要点击“高级”，“地址列表”填入：(这里的地址是设备 A 的 Tailscale IPv4 地址)

```
tcp://100.100.1.1:22000, quic://100.100.1.1:22000
```

这样，你会发现两台设备已经成功连接上了。你只要将 Syncthing 和 Tailscale 常驻后台，就能获得近似于实时的同步体验。
