---
author: KrDw
pubDatetime: 2024-01-23T16:11:15.000+08:00
modDatetime: 2024-03-03T21:38:24.000+08:00
title: 连接到云服务器
featured: false
draft: false
tags:
  - server
  - ssh
description: "给服务器新手的一个教程：怎么使用 SSH 连接到服务器，怎么让新的设备也能 SSH 连接到服务器以及如何禁用密码登录只用密钥登录。"
---

### Table of Contents

怎么购买服务器网上也有一堆教程视频，我自己也不知道怎么怎么选购优惠的服务器，我这里是用的白嫖大半年的阿里云 2C2G1M 学生服务器（感谢阿里云🙏）。

> 如果你也是学生，可以搜索相关教程：
>
> - [免费学生云服务器](https://developer.aliyun.com/plan/student)：学生认证免费领取 1+6 个月的 2C2G1M 云服务器，相当够用了。
> - [云工开物计划](https://university.aliyun.com/)：学生每年领取 300 元无门槛券，用来续费 4 个月刚领的免费云服务器（贴个十多块）。

我的阿里云云服务器用的镜像（操作系统）是“**Ubuntu 22.04 64位 UEFI版**”，你也可以使用其他的系统镜像，最好是用 linux，因为大概率之后要用到 docker。

登录凭证可以选择密码，但**我更推荐使用密钥对，注意将下载的密钥文件保存到用户下的 .ssh/ 文件夹中**，之后要用到。

### SSH 连接到服务器

创建了云服务器，如何连接到云服务器进行操作呢？你当然可以在服务器的控制台直接点击“远程连接”在浏览器中进行连接，但这样很麻烦，每次连接都要打开浏览器、进到控制台、点击远程连接，而**大家更加常用的连接方式是使用 SSH 连接**。

**(1) 使用密码连接**

如果你创建使用的是密码，Windows 下打开 PowerShell 终端，键入：

```shell
ssh username@xxx.xxx.xxx.xxx
```

这时应该会让你输入密码（我不太清楚，我一直用的是密钥对）。

**(2) 使用密钥连接**

如果你用的是密钥对，**打开用户文件夹下的 .ssh/ 文件夹，创建一个 `config` 文件**，填入下列内容（根据你的情况进行相应更改）：

```
Host example
  HostName xxx.xxx.xxx.xxx
  User ecs-user
  IdentityFile /path/to/your/key
```

- 第一行 Host 填一个名称，当作服务器的别名。
- 第二行 HostName 填服务器的公网 IP。
- 第三行 User 填入登录服务器的用户名称。
- 第四行 IdentityFile 填下载的密钥文件的文件路径。

保存好 `config` 文件后，Windows 下打开 PowerShell 终端，键入：

```shell
ssh example
```

应该就可以成功连接到云服务器了。

**(3) 使用 VS code 远程连接**

![VScode界面](https://img.k1r.in/2024/05/picgo_b74bf600e373ff9da6da8b70d1721da5.png)

其实你也可以使用 VS code 远程连接到服务器，这样就不必都在终端命令行操作了，但这种方式内存占用比较大，2G 内存基本会被占用 30%。

用内存来换一些简单的可视化操作，我觉得也可以接受，而且一开始服务器大概率内存过剩，所以**新手我还比较推荐用 VS code 来连接到服务器**。

你只需要打开 VS code 安装“**Remote - SSH**”这个插件，再按照前面密钥连接一样配置一下 `config` 文件，然后就可以点击侧边栏或是左下角这个图标，就会看到相应的入口了。

用 VS code 远程连接甚至可以用 VS code 的插件😮

### 常用命令

连接到云服务器之后完全就是 linux 下的操作，这里仅列出你最起码要了解的命令（你甚至不用去学，真的很基础，用着就熟了）。

|      命令      |     英文全拼     | 说明                                         |
| :------------: | :--------------: | -------------------------------------------- |
|       ls       |       list       | 列出当前目录下的所有文件（夹）               |
|  mkdir _xxx_   |  make directory  | 在当前目录下创建一个文件夹                   |
|    cd _xxx_    | change directory | 更改当前目录（打开某一文件夹）               |
|    rm _xxx_    |      remove      | 删除某一文件（删除文件夹要带上参数 `-r`）    |
| mv _xxx_ _xxx_ |       move       | 移动文件（夹），也可以用作重命名             |
| cp _xxx_ _xxx_ |       copy       | 复制文件（夹），也可以在复制时顺便进行重命名 |

还有就是在命令行编辑纯文本文件，主要是 nano 和 vim，这里讲下 vim，vim 你可以理解为有很多模式，按 `Esc` 键相当于进入了一个“阅读模式”，在“阅读模式”按键盘不会输入，而是有相应的命令，但也不用去记，我自己也不会，**主要用的就是按 i 进入插入模式编辑，然后按 Esc 退出编辑，按 :wq 保存并退出**。

![vim键位图](https://img.k1r.in/2024/05/picgo_acc327dfe0d5328c1ad102179c70b641.gif)

### 让新的设备能 SSH 连接到服务器

**(1) 生成 SSH 密钥对**

Windows 下打开 PowerShell，键入下列命令，接下来按照命令行提示：

```bash
ssh-keygen -t rsa -b 4096
```

1. 首先是密钥对的保存位置，默认是在用户文件夹下的 .ssh/ 文件夹下，建议回车保持默认；
2. 然后是密钥的名称，这个你可以看情况输入；
3. 最后是密钥对的密码，直接回车（我没尝试过……）

然后你就会在相应的文件夹下看到一个公钥文件（`.pub`）和私钥文件（无后缀），私钥文件应当保存好，不要公开分享出去，公钥文件无所谓。

**(2) 将公钥文件添加到服务器**

第一种方式是使用 `ssh-copy-id` 指令，这种方法是最推荐的方式，如果你是 Windows 系统且安装了 Git Bash，那么打开 Git Bash 输入下列指令即可将本地公钥自动添加到服务器上。

```bash
ssh-copy-id -i ~/.ssh/xxxxx.pub ecs-user@xxx.xxx.xxx.xxx
```

服务器在 `~/.ssh/authorized_keys` 文件中保存公钥文件（一行一个），你可以使用 cat 命令查看：

```bash
cat ~/.ssh/authorized_keys
```

第二种方式是将公钥文件传到服务器然后添加到 `authorized_keys` 文件。

首先想办法将新设备的公钥文件传到服务器上（文件传输/文本复制），我这里假设是 `~/.ssh/new_device_key.pub`，打开终端，键入：

```bash
sudo cat ~/.ssh/new_device_key.pub >> ~/.ssh/authorized_keys
```

这里最好查看一下 `authorized_keys` 文件，看是否成功一行一个公钥，因为 `>>` 表示追加到文件末尾，可能中间并没有换行。

**(3) 新设备连接到服务器**

如果新的设备是 Windows、macOS、Linux，都可以按照前面“SSH 连接到服务器/(2) 使用密钥连接”的方法，配置 .ssh/ 文件夹下的 `config` 文件来连接。

如果是移动设备 Android、iOS，则按照相应的 SSH 软件来操作即可。

### 禁止通过密码连接

为了安全考虑，你可能会想要禁止通过密码连接到服务器，而只能通过密钥对连接。

```shell
sudo vim /etc/ssh/sshd_config
~~~
- #PasswordAuthentication yes
+ PasswordAuthentication no
~~~
sudo service ssh restart
```
