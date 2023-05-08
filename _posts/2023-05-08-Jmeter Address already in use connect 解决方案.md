---
layout: mypost
title: Jmeter Address already in use connect 解决方案
categories: [jmeter实操技术]
---

# <center>Jmeter Address already in use connect 解决方案</center>

## 发生缘故

win10 下，jmeter 高并发压测 scope

## 报错信息

![error_information1](pho1.png)
![error_information2](pho2.png)

## 原因

Jmeter 里的 http sample 勾选了 keep alive，导致会话一直保持，而 windows 本身的端口有限，导致端口被占用完后，无法分配新的端口，因此会产生 java.net.BindException: Address already in use: connect 报错。

## 解决方案

HTTP SAMPLE 不勾选 keep alive

![solve_plan](pho3.png)
