---
author: Angular
pubDatetime: 2023-11-04T00:39:00.000+08:00
modDatetime: 2023-11-04T00:39:00.000+08:00
title: git commit 实践（Angular）
featured: false
draft: true
tags:
  - notes
  - git
  - guide
  - repost
description: ""
---

> 本文主要内容翻自 [AngularJS commit message format](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)，包含少量自己实践调整。

每一个提交信息（commit message）通常由**头部（header）**，**主体（body）**，和**尾部（footer）**组成。

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### Commit Message _Header_

```
<type>: <short summary>
```

#### 类型 Type

- **init**：项目初始化
- **docs**：仅仅修改文档
- **feat**：添加新特性
- **fix**：修复 bug
- **perf**：优化相关，比如提升性能、体验
- **refactor**：代码重构，没有添加新特性或是修复 bug

#### 概述 Summary

- 使用现在时态的命令语气，例如“**change**”，而不是“changed”或者“changes”。
- 首字母不要大写。
- 结尾不要加句号（.）。

### Commit Message _Body_

- 使用现在时态的命令语气，例如“**fix**”，而不是“fixed”或者“fixes”。
- 解释变更的动机，解释为什么要做出这个变更。
- 可以包含旧行为与新行为的对比比较。
- _虽然用英文保持统一更好，还是用中文更方便。_

### Commit Message _Footer_

页脚可以包含关于破坏性更改和弃用的信息，也是**引用这个提交关闭或相关的GitHub议题**、Jira票据和其他PR的地方。

```
Closes/Resovles/Fixes #<issue number>
```

关于破坏性更改（Breaking Change）和弃用的信息（Deprecation）暂未涉及，搁置。

### Revert commits

如果提交撤销了先前的提交，那么它应该以 `revert: ` 开头，后跟被撤销提交的头信息。

Commit Message Body 的内容应包括：

- 被撤销提交的SHA信息，格式如下：`This reverts commit <SHA>`，
- 清晰地描述撤销提交的原因。

---

### Additional

- 参照 [Angular](https://github.com/angular/angular/commits/main) 项目的提交历史进行参考学习。
- 提交信息示例 Commit Message Examples：

```
feat: a short summary for this feature (#<issue number>)

用中文简要阐述功能的细节。
也可以附上使用的方法。

Closes #<issue number>
```

- 本文仅对本人日常所需进行归纳，详细请见 [angular/CONTRIBUTING.md](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)。
- [ ] 待读：[约束性提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
