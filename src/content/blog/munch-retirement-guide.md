---
author: KrDw
pubDatetime: 2024-01-21T22:25:19.000+08:00
modDatetime: 2024-05-29T16:05:29.000+08:00
title: 红米 K40S 的养老指南
featured: false
draft: false
tags:
  - android
description: "选择自己喜欢的 ROM，用 KSU 或 Magisk 刷入 Moto Addon 替换系统软件，优先安装定制版软件。"
---

> ⚠️ 2024-05-20 更新：[安卓定制包ElixirOS存在恶意代码 若用户尝试绕过付费则清除所有数据](https://www.landiannews.com/archives/104000.html)
>
> 由于存在恶意格机代码，不再推荐使用 Project Elixir，但下文中的思路可以参考。

废话少说，先放方案（仅供参考）：

1. ROM 是用 [Project Elixir 3.8](https://projectelixiros.com/device/RedmiK40S)，安卓 13。
2. 系统软件是用 Moto Addon 模块把谷歌自带的电话、信息、通讯录、日历都换成 moto 的。
3. 日用软件能用定制版就用定制版。

我想强调的就上面三点，其他方面看个人，其实 ROM 也看个人。

接下来是正文：

### ROM 的选用

我大概是 2023 年 6 月开始日用 Project Elixir 这个类原生的，前些天因为手机内存快满了，系统用了半年也有点腻了，打算刷 MIUI EEA 试试。

#### MIUI EEA

刚刷上 MIUI EEA 就感觉有点不跟手，当时以为这是之前类原生傻快傻快用惯了，但打了局游戏发现这手机确实不太适合 MIUI 了，锁 60 帧不说发热特别严重。不能说骁龙 870 不行，毕竟我只是偶尔打打 CFM，吃不了多少配置，而且之前类原生都没这情况。

![scene测试图](https://img.kr4.in/2024/05/picgo_00b01acb3de5ee730e581d26af8d3b81.png)

> 这是我玩 CFM 的表现，最低画质最高帧率，一开始 120 帧左右我还觉得可以，后面直接锁死 60 帧。

一些系统软件比如小米相册、计算器、录音机、时钟、天气、日历等国际版界面是真的很简洁；但与此同时，一些重要的系统软件如电话、短信还有自带的日历却都是 Google 家的，国内体验实在一般。

总的来说，**整个系统像是 MIUI 和原生安卓杂交体的形态，既没有原生安卓的流畅简洁，也没有 MIUI 的功能丰富**，也不知道为什么酷安好多人推荐 MIUI 国际版。

#### PE

我在 MIUI EEA 后依次刷了 Pixel Experience、Pixel OS，这俩是一个风格，我的评价如下：

我很喜欢 PE 这种 ROM，真正的原生风格，完完全全的毛坯房，如果有相应的配套的优化方案简直完美，但我没发现。

缺点就是自定义性可以说基本没有，换图标包说是可以用 Launcher 30 这个 Xposed 模块，但我没成功。

PS Lineage OS 没有官方构建，没有尝试，但也属此列。

#### Spark OS

在此之后，我短暂体验了一下 Spark OS，浅浅使用下来符合我对 Spark OS、Crdroid、Evolution X 这类以高自定义性著称的 ROM 的刻板印象，就是风格体验很割裂，融不进类原生的风格。

当然，萝卜青菜各有所爱，我只是不喜欢它们割裂的体验，其他方面我没深入体验就不做评价了。

#### 整理需求

在连续刷了两天机我都没有找到我心仪的 ROM，我整理了一下我的需求：

1. 稳定，日用没问题，电话、短信、时钟、日历等系统软件最好有本土化功能。
2. 流畅不用说，类原生起码都比 MIUI 流畅。
3. 自定义功能多，起码最基础的桌面可更换图标包。
4. 性能释放充足，玩游戏能跑满，不至于太卡，功耗无所谓。

#### Project Elixir

在整理了需求之后，我发现我之前用的 Project Elixir 完全满足需求，之前之所以逃离是因为停更了，但仔细想想用了半年也没什么大问题，停更就停更，本来就图个稳定，追着更新反而还一堆 bug 等着修呢。

和其他 ROM 一样的流程，刷入提供的 boot、vender_boot，切换到 recovery 模式，清楚数据，然后 adb sideload 旁加载刷入 ROM 包。（这两天重复太多次，滚瓜烂熟了）

一开机，还是熟悉的界面，还是熟悉的感觉。

![成功刷入Elixir](https://img.kr4.in/2024/05/picgo_0dcf075766d2999eedcfc49efd3efff8.jpeg)

1. 界面风格统一，这点 Project Elixir 算是很好的做到了，虽然不如 PE。
2. 支持 MIUI 徕卡相机，不得不说能在类原生继续用 MIUI 相机还是不错的😌
3. 桌面支持更换图标包，类原生用不了主题，换不了图标包就只能忍受不适配的应用图标在桌面上。
4. 自动亮度是正常的。

> 因为项目存档和迁移，导致官网链接失效了，这里是我更正后的链接：
>
> - Installation Guide：https://github.com/ProjectElixir-Devices/Wiki/blob/tiramisu/munch.md
> - ROM 包（SourceForge）：https://sourceforge.net/projects/project-elixir/files/thirteen/munch/
> - REC 以及 vender：https://mega.nz/folder/z3BlWYzA#VkrcjpQJM5Q0KweHaFi8Yg

### Moto Addon

使用 Moto Addon 将系统的电话、信息、通讯录、日历都替换成 moto 的，符合国人的使用习惯而且也比较贴合原生风格。

电话是有通话录音的，短信通知也有“复制验证码”的功能，日历是按国内安排及时更新的（除夕不放假）。

![MotoAddon界面](https://img.kr4.in/2024/05/picgo_25af712d5a8a65327204dc3cb504bc95.png)

PS KernelSU 是可以用 Moto Addon 的，只需要把“默认卸载模块”关掉就可以了。

### 定制版应用

像是百度网盘、高德地图、抖音、京东、淘宝、知乎这些软件我都是用定制版应用，界面相比正常最新版本简洁，流畅不少，没有应用更新提示。

### 系统维护方案

我是通过刷了 RealKing 内核用上了 Kernel SU，刷上Zygisk Next、LSPosed、Shamiko。

KSU：**存储空间隔离**的增强模块，用于整顿文件夹。

KSU：**NFC 卡模拟**，用于模拟 NFC。

KSU：**Moto Addon**，作用前文已提。

LSPosed：**Thanox**，用于后台管理。

---

以上就是我的养老方案，供各位参考。

其实说是养老，谁知道什么时候心血来潮又刷机了呢。

> 本文提到的相关资源[点击此处](https://t.kr4.in/8q78k2)下载。
