---
author: KrDw
pubDatetime: 2024-03-08T16:36:19.000+08:00
modDatetime: 2024-03-14T17:38:36.000+08:00
title: 《Python 基础教程》学习笔记
featured: false
draft: true
tags:
  - python
description: ""
---

<center><img src="https://img.k1r.in/2024/05/picgo_247cb547c090d323a0ade28c424fe46d.png" width="135px" height="200px"> </center>
<center><font size=4>《Python基础教程（第3版）》</font></center>
<center><font color='#6e6e6e' size=2>作者：MagnusLieHetland</font></center>
<center><font color='#6e6e6e' size=2>译者：袁国忠</font></center>
<center><font color='#6e6e6e' size=2>出版社：人民邮电出版</font></center>
<center><font color='#6e6e6e' size=2>出版年：2018-02</font></center>
<center><font color='#6e6e6e' size=2>ISBN：9787115474889</font></center>

### 第 1 章 快速上手：基础知识

---

类似这样的名称冲突很隐蔽，因此除非必须使用 from 版的 import 命令，否则应坚持使用常规版 import 命令。

---

通常，应避免导入模块中所有的名称，但尝试使用海龟绘图法时，这样做可提供极大的方便。

```python
from turtle import  *
```

确定需要使用哪些函数后，可回过头去修改 import 语句，以便只导入这些函数。

---

> [!Note]
>
> 使用 `from ... import *` 的方式很容易引发**命名冲突**，因为这样会将模块中的所有对象导入到当前命名空间，包括函数、变量等。
>
> - **使用 import 语句**：当你需要导入整个模块的所有内容，或者需要使用模块中的多个对象时。
> - **使用 from ... import ... 语句**：当你只需要导入模块中的特定对象，并且**避免与当前命名空间中已有的对象**发生冲突时。

---

注释务必言之有物，不要重复去讲通过代码很容易获得的信息。无用而重复的注释还不如没有。

---

### 第 2 章 列表与元组

---

两种主要的容器是序列（如列表和元组）和映射（如字典）。在序列中，每个元素都有编号，而在映射中，每个元素都有名称（也叫键）。有一种既不是序列也不是映射的容器，它就是集合（set）。

---

有几种操作适用于所有序列，包括索引、切片、相加、相乘和成员资格检查。

---

```python
# 一个列表，其中包含数1~31对应的结尾
endings = ['st', 'nd', 'rd'] + 17 * ['th'] \
        + ['st', 'nd', 'rd'] + 7 * ['th'] \
        + ['st']
```

> [!Note]
>
> 其实就是拼接列表，需要 31 号对应的结尾，直接使用索引获取 `endings[31-1]`。
>
> 其他类似的运用场景：获取月份的英文（缩写）、获取星期的英文（缩写）等
>
> 有时候这种“**空间换时间**”的操作还是很好用的。

---

> [!Note]
>
> 使用列表的切片赋值特性对字符串进行操作：
>
> ```python
> str_sample = 'This is a string.'
> str_list = list(str_sample) # 转换为 list 类
> str_list[5:7] = list('isn\'t')
> str_result = ''.join(str_list) # "This isn't a string."
> ```

---

方法是与对象（列表、数、字符串等）联系紧密的函数。通常，像下面这样调用方法：

```python
object.method(arguments)
```

---

> [!Note]
>
> ```python
> lst = []
> lst.append(arg) # 将一个对象附加到列表末尾
> lst.clear() # 就地清空列表的内容
> tmp_lst.copy(lst) # 复制列表
> lst.count(arg) # 计算指定元素在列表中出现了多少次
> lst.extend(arg*) # 将多个值附加到列表末尾
> lst.index(arg) # 查找指定值第一次出现的索引 # 未找到会报错
> lst.insert([i], arg) # 将一个对象插入列表
> lst.pop([i]=end) #从列表中删除一个元素 # 默认为最后一个元素
> lst.remove(arg) # 删除第一个为指定值的元素
> lst.reverse() # 按相反的顺序排列列表中的元素
> lst.sort(key=None, reverse=False) # 对列表就地排序
> ```
>
> pop 是唯一既修改列表又**返回一个非 None 值**的列表方法。

---

### 第 3 章 使用字符串

---

有很多用于设置数字格式的机制，比如便于打印整齐的表格。

要指定左对齐、右对齐和居中，可分别使用 `<`、`>` 和 `^`。

```python
>>> from math import pi
>>> print('{0:<10.2f}\n{0:^10.2f}\n{0:>10.2f}'.format(pi))
3.14
   3.14
      3.14
```

可以使用填充字符来扩充对齐说明符，这样将使用指定的字符而不是默认的空格来填充。

```python
>>> "{:$^15}".format(" WIN BIG ")
'$$$ WIN BIG $$$'
```
