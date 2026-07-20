---
title: SystemVerilog：event 与 mailbox
date: 2026-07-18
updated: 2026-07-18
tags:
  - systemverilog
  - event
  - mailbox
category: 技术
subcategory: SystemVerilog
featured: "false"
draft: "false"
excerpt: 从零开始的 SystemVerilog 学习笔记。
---
在 SystemVerilog 的进程间通信（IPC，Inter-Process Communication）中，`event`（事件）和 `mailbox`（信箱）是最常用的两种机制，但它们的定位截然不同：

- **`event` 是同步原语** —— 只负责“通知”，不携带任何数据。
- **`mailbox` 是通信通道** —— 负责在进程间传递数据消息。

下面从几个关键维度来对比。

---

### 1. 核心功能对比表

| 特性          | `event`                                                     | `mailbox`                                  |
| ----------- | ----------------------------------------------------------- | ------------------------------------------ |
| **用途**      | 进程同步（通知一个或多个进程“某事发生了”）                                      | 进程间数据传递（发送/接收消息）                           |
| **传递数据**    | 不传递数据，纯同步                                                   | 可以传递任意类型的数据（参数化类）                          |
| **触发/操作方式** | `->` 触发事件；`@` / `wait(event.triggered)` 等待事件                | `put()` 放入数据；`get()` 取出数据；`peek()` 查看数据    |
| **存储能力**    | 无存储，瞬间边沿触发                                                  | 有存储，是一个 FIFO 队列，可存放多个消息                    |
| **容量**      | 无容量概念                                                       | 可以定义有界 `mailbox`（限定最大消息数）或无界 `mailbox`     |
| **阻塞行为**    | 等待时若事件未触发则阻塞；触发后等待进程被唤醒                                     | 队列满时 `put()` 可阻塞（有界信箱）；队列空时 `get()` 阻塞     |
| **等待者数量**   | 可同时有多个进程等待同一事件，触发时全部被释放                                     | 多个进程可阻塞在 `get()` 上，按到达顺序获取消息（一个消息只被一个进程取走） |
| **持久性**     | 触发是边沿敏感的，如触发时没有进程等待，事件会丢失（除非用 `wait(event.triggered)` 检查状态） | 消息持久存储，接收方随时可以取出，不会丢失                      |

---

### 2. 详细行为说明

#### `event`（事件）
```systemverilog
event e1;            // 声明一个事件

// 进程A：触发事件
#10 -> e1;           // 10ns时触发

// 进程B：等待事件
@e1 $display("Event triggered at %t", $time);   // 边沿阻塞等待
// 或
wait(e1.triggered);  // 电平敏感，检查事件是否在当前时间步已触发过
```
- `->` 本身不传递任何值，只做“广播”。
- 常用于：通知某个条件成立、触发测试序列开始、同步两个线程的进度等。

#### `mailbox`（信箱）
```systemverilog
mailbox #(int) mb = new();   // 创建一个无界信箱，传递int类型

// 进程A：发送数据
mb.put(42);                  // 放入整数42

// 进程B：接收数据
int data;
mb.get(data);                // 取出数据，赋给data
```
- 信箱本质是带同步功能的参数化 FIFO，可以传递任何数据类型（包括对象、结构体）。
- 支持阻塞/非阻塞方法：`put()` / `get()` 是阻塞的；`try_put()` / `try_get()` 是非阻塞的。
- 常用于：monitor 将事务发给 scoreboard，generator 将激励发给 driver 等。

---

### 3. 什么时候用哪个？

- **用 `event` 的场景**：
  - 只需要告诉另一个进程“可以开始了”、“已经结束了”、“条件满足了”。
  - 没有实际数据要传输，或数据通过共享变量（需配合信号量或手动同步）传递。
  - 广播式通知，一个事件唤醒多个等待者。

- **用 `mailbox` 的场景**：
  - 需要将数据（事务、包、命令）从一个进程安全地发送到另一个进程。
  - 需要缓冲多个消息（生产者-消费者模型）。
  - 希望解耦发送方和接收方，避免使用全局变量。

---

### 4. 一个同时体现二者区别的例子

假设一个 generator 产生数据，给 driver 使用，同时用事件通知 driver 数据就绪：

```systemverilog
event       gen_done;           // 只用于通知
mailbox #(int) gen2drv;         // 用于传递数据

// Generator 进程
initial begin
    int data = 100;
    gen2drv.put(data);          // 1. 通过信箱送数据
    -> gen_done;                // 2. 触发事件通知数据已发送
end

// Driver 进程
initial begin
    int val;
    @gen_done;                  // 等待事件（或者直接 gen2drv.get(val) 阻塞）
    gen2drv.get(val);           // 取出数据
    $display("Driver got: %d", val);
end
```
这里 `mailbox` 承担“运货”角色，`event` 承担“按铃”角色。也可以只用 mailbox，driver 直接 `get` 阻塞等待数据，那就连 event 都不需要了——这恰恰说明 mailbox 自身就内置了同步（阻塞等待），而 event 只能同步不能传数据。
