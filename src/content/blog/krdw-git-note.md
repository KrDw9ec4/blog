---
author: KrDw
pubDatetime: 2023-08-25T20:24:00.000+08:00
modDatetime: 2024-02-02T17:28:00.000+08:00
title: KrDw's Git Note
featured: false
draft: false
tags:
  - notes
  - git
  - ssh
description: "我的建议是先跟着廖雪峰的图文教程一步一步走一遍 git 工作流程，然后看 GeekHour 的视频教程加深理解，官方文档供后续使用时按需查找。"
---

### Table of Contents

## 推荐教程

- 图文教程：[廖雪峰的 git 教程](https://www.liaoxuefeng.com/wiki/896043488029600)
- 视频教程：[【GeekHour】一小时 git 教程](https://www.bilibili.com/video/BV1HM411377j)
- 官方文档：[Git - Book (git-scm.com)](https://git-scm.com/book/zh/v2)

我的建议是先跟着廖雪峰的图文教程一步一步走一遍 git 工作流程，然后看 GeekHour 的视频教程加深理解，官方文档供后续使用时按需查找。

这篇文章的后续内容是我跟着视频教程所记录的笔记，可以当作视频教程的文字版使用。

## 基础使用

这里的命令都是第一次上手就能用，易于理解，一般不涉及一些附加参数的使用。

### git init

- `git init` 在当前目录建立一个 git 仓库。

### git config

- `git config --global user.name "Your Name"` 为所有仓库配置用户名称。
- `git config --global user.email "youremail@example.com"` 为所有仓库配置用户邮箱。

### git status

- `git status` 查看当前仓库状态（未追踪、已修改、已删除、无）。
- `git status -s` 简短输出，用一些符号表示情况。

### git add

- `git add xxx.xx` 暂存 ”xxx.xx“ 文件。
- `git add *.xx` 暂存 “.xx” 后缀的所有文件（通配符的使用）。
- `git add .` 暂存所有文件。

### git commit

- `git commit -m "description"` 提交当前暂存区到版本库中，并添加描述。

注：建议在提交前进行 `git status` 查看当前情况，防止工作区与暂存区不统一。

### git reset

- `git reset --mixed HEAD^` 默认参数，保留工作区，清空暂存区。
- `git reset --soft HEAD^` 保留工作区和暂存区。
- `git reset --hard HEAD^` **谨慎使用**，舍弃工作区和暂存区。

一般情况下，不加参数使用，要提交时重新暂存提交；

如果真的要舍弃所有的修改内容（工作区、暂存区和版本库），才使用 `hard` 参数。

### git diff

- `git diff` 比较工作区与暂存区的差异。
- `git diff HEAD` 比较工作区与版本库的差异。
- `git diff  --cached` 比较暂存区与版本库的差异。
- `git diff xxxxxxx xxxxxxx` 比较两次提交的差异。
- `git diff xxx.xx` 在以上命令的最后加上文件名称，表示对比特定文件。

### git rm

- `git rm xxx.xx` 删除工作区中的文件，并暂存**删除**这一修改。
- `git rm --cached xxx.xx` 删除暂存区的修改，保留工作区。

### .gitignore

应该忽略哪些文件：

- 系统或者软件自动生成的文件；
- 编译产生的中间文件和结果文件；
- 运行时生成日志文件、缓存文件、临时文件；
- 涉及身份、密码、口令、密钥等敏感信息文件。

在 `.gitignore` 中一行添加一个文件名称来忽略文件（文件夹则需要后面加 `/`），支持**通配符**。

注：**只支持忽略未追踪的文件**，已添加到仓库的文件仍然会追踪修改。

匹配规则：

- 以 `#` 开头的行会被忽视，一般用作注释。
- 空行也会被忽视，一般用于可读性的分隔。
- 使用标准的 Blob 模式（shell 所使用的简化了的正则表达式）匹配：
  - `*` 通配任意字符；
  - `?` 匹配单个字符；
  - `[]` 匹配列表中的单个字符，也可以用 `-` 表示范围；
  - `**` 匹配任意的中间目录；
  - `!` 取反，一般用于在使用通配符之后对某一文件单独生效。

> GitHub 官方提供的 `gitignore` 模板集合，针对不同语言有不同的模板。
> [github/gitignore: A collection of useful .gitignore templates](https://github.com/github/gitignore)

### SSH Key

1. 生成新的 SSH 密钥：
   1. `ssh-keygen -t ed25519 -C "youremail@example.com"`
   2. 之后可以一路回车。
2. 将 SSH 密钥添加到 ssh-agent（最好使用 Git-Bash）：
   1. `eval "$(ssh-agent -s)"`
   2. `ssh-add ~/.ssh/id_ed25519`
3. 在 GitHub 账户添加新的 SSH 密钥：
   1. `clip < ~/.ssh/id_ed25519.pub`
   2. KrDw > Settings > Access/SSH and GPG keys > New SSH key
4. 测试 SSH 连接
   1. `ssh -T git@github.com`

如果使用的是 Windows 自带的 PowerShell 在第4步或是 push 时出现问题，可以参照下列步骤解决：

1. 换用 Git Bash：`eval "$(ssh-agent -s)"`，打开 ssh-agent，在 Git Bash 中尝试是否正常
   1. `ssh -T git@github.com`
   2. `git push origin main`
2. 正常的话，请尝试：
   1. `win + R`，输入“services.msc”，打开服务管理；
   2. 找到 `OpenSSH Authentication Agent`，查看启动类型是否为“自动”，状态是否为“正在运行”；
   3. 否则，请右键-**属性** > 启动类型：自动。
3. 如果以上办法没解决，那我也没辙。

> 2024-02-02 更新：可以前往[配置 git 代理连接 GitHub](https://k1r.in/posts/git-proxy/) 配置代理来解决网络问题。

### git remote

- `git remote add origin git@github.com:username/reponame` 将远程仓库（GitHub）与本地仓库关联，远程仓库别名为 origin。
- `git remote -v` 查看关联的远程仓库。
- `git branch -M main` 指定分支名称为 main。

#### git push

- `git push -u origin main:main`：
  - `-u` upstream，意义不明，除了第一次推送之外，后续推送不需要 `-u`。
  - `main:main` 本地分支：远程分支，相同的话只用写 `main`。

#### git pull

- `git pull origin main:main` 拉取远程仓库的修改，并与本地仓库进行合并。

#### git fetch

- `git fetch origin main:main` 拉取远程仓库的修改，但不进行合并。

### git branch

- `git branch` 查看当前分支情况。
- `git branch dev` 创建一个名为 dev 的分支。
- `git branch -d dev` 删除**已被合并**的分支 dev。
  - `-D` 强制删除，不管是否被合并。
- `git switch dev` 切换到 dev 分支。

#### git merge

- `git merge dev` 将 dev 分支合并到当前分支。
- 解决合并冲突：
  - `git status` 查看冲突的文件。
  - `git diff` 查看冲突的具体内容。
  - 手动修改冲突内容，然后暂存提交。
  - 注：提交后只在当前分支保留自己修改的内容，在被合并的分支中没有变化。
- `git merge --abort` 中止合并。

#### git rebase

执行 rebase 是将两个分支并成一条直线

- `git rebase dev` 将 dev 分支独有的提交合并到当前分支**末尾**。

## 工作流模型

### Git Flow

- **main** 主线分支：只接受来自 hotfix 和 release 的合并请求，不允许直接 push 修改。
- **hotfix** 热修复分支：用于解决线上问题，从 main 分支 pull 出来，修复完成后合并回 main 分支。
  - 命名规则：`hotfix-#issueid-desc`
- **release** 版本发布分支：永久分支，用于发布前的测试和验证。
- **develop** 开发分支：所有功能分支均来自开发分支。
- **feature** 功能分支：用于未来版本中的功能开发和管理。

### GitHub Flow

略

## 进阶使用

### alias

- `alias xxx="xxxxxxxxx"` 设置 `xxxxxxxxx` 代码的别名为 `xxx`。
