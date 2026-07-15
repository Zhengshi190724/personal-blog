---
title: "SV 学习笔记"
date: "2026-07-15"
updated: "2026-07-15"
tags: ["systemverilog"]
category: "技术"
featured: "false"
draft: "false"
excerpt: "从零开始的 SystemVerilog 学习笔记。"
---

# SV 学习笔记

必看的SV学习书籍：SystemVerilog 验证测试平台编写指南 [美] 克里斯·斯皮尔

## 1、SV概括

### 数字IC验证的评价标准

>**第一准则**:能够100%确保被测对象（DUT）符合Spec.规定的功能及其性能，即验证的完备性；

测试过程中用“测试覆盖率”数据来定量分析测试的进程

### 验证环境的层级

![整体验证层级图](D:/26012/document/Claude_Code/src/picture/sv_env_layer.jpg "整体验证层级图")

> 1.Transaction and Signal Layer
> - Driver：把一个简单的transaction[^1]描述转换成PIN level的信号交互；
> - Monitor：把PIN[^2] level的信号交互转换成一个简单的transaction描述；
> - Assertions：检查DUT IO和内部信号的波形是否正确；
> 
> 2.Function Layer
> - Sequence：生成稍复杂的某项功能指令描述，实现该功能可能需要拆分成多个transaction，并发送给Driver；
> - Scoreboard：参考模型所在地。接收功能指令描述，产生Spec.规定的预期输出；
> - Checker:对比DUT与scoreboard的输出transaction,检查DUT功能是否正确;
>
> 3.Scenario Layer（实际应用场景级）
> - Scenario的例子：一个视频处理SOC可能处于：视频采集与回访模式，视频采集与压缩并SD存储模式，特定视频帧抓取与SD存储模式；
> - Generator：根据某个应用场景，产生多个功能指令描述（或多个Sequence）；
>
> 4.Test Layer
> - Test：决定测试哪种应用场景；
> - Function Coverage：收集测试过程中已经覆盖了哪些Spec.规定的测试功能点；
> ---
[^1]:`transaction`将一组有逻辑关联的引脚级操作封装成一个高层数据对象。例如一次总线读写、一个网络包、一条指令。用 `class`定义，包含数据属性（地址、数据、命令）和可能的约束。
[^2]:`PIN level`是最底层的抽象，直接操作DUT的每个具体信号（`clk`、`rst`、`addr`、`data`、`valid`等）。

### SV新增的验证特性

- 更丰富的数据类型：字符串，动态数组，队列，哈希数组；
- 面向对象编程：class定义；
- Constrained randomize：约束随机数生成；
- 进程间的通信机制：semaphore，mailbox，event；
- Function coverage的描述与覆盖率收集；
- 编程语言交互接口：DPI；
- 断言：assertion；


