---
layout: mypost
title: 虚拟机 Linux 使用 perf stat 提示 cycles not supported
categories: [性能测试]
---

# <center> 虚拟机Linux使用perf stat提示cycles not supported </center>

## 问题描述

项目希望评估算法的 CPU 开销，使用 linux 常用的 perf 工具。
查看 perf stat 只显示 cpu-clock, context-switches, cpu-migrations
剩余cycles, instructions, branches, branch-misses均为not supported

## 原因分析
该参数使用物理机可测量，猜测问题出在虚拟化。

## 解决方案
关闭VMware虚拟机电源，找到硬件配置选项中CPU

勾选☑️虚拟化CPU性能计数器重启问题解决