---
layout: mypost
title: 从容器到容器云：谈谈 Kubernetes 的本质
categories: [Kubernetes,极客时间——学习笔记]
---

通过阅读白话容器基础那几篇文章，不难发现，一个“容器”，实际上是一个由 Linux Namespace、Linux Cgroups 和 rootfs 三种技术构建出来的进程的隔离环境。

从这个结构中我们不难看出，一个正在运行的 Linux 容器，其实可以被“一分为二”地看待：

<ol>
    <li>一组联合挂载在 /var/lib/docker/aufs/mnt 上的 rootfs，这一部分我们称为“容器镜像”（Container Image），是容器的静态视图</li>
    <li>一个由 Namespace+Cgroups 构成的隔离环境，这一部分我们称为“容器运行时”（Container Runtime），是容器的动态视图</li>
</ol>

更进一步说，作为一个开发者，我并不关心容器运行时的差异。因为，在整个“开发 - 测试 - 发布”的流程中，真正承载着容器信息进行传递的，是容器镜像，而不是容器运行时。

从一个开发者和单一的容器镜像，到无数开发者和庞大的容器集群，容器技术实现了从“容器”到“容器云”的飞跃，标志着它真正得到了市场和生态的认可。

这样，**容器就从一个开发者手里的小工具，一跃成为了云计算领域的绝对主角；而能够定义容器组织和管理规范的“容器编排”技术，则当仁不让地坐上了容器技术领域的“头把交椅”。**

这其中，最具代表性的容器编排工具，当属 Docker 公司的 Compose+Swarm 组合，以及 Google 与 RedHat 公司共同主导的 Kubernetes 项目。

跟很多基础设施领域先有工程实践、后有方法论的发展路线不同，Kubernetes 项目的理论基础则要比工程实践走得靠前得多，这当然要归功于 Google 公司在 2015 年 4 月发布的Borg 论文了。

Borg 系统，一直以来都被誉为 Google 公司内部最强大的“秘密武器”。因为，相比于 Spanner、BigTable 等相对上层的项目，Borg 要承担的责任，是承载 Google 公司整个基础设施的核心依赖。在 Google 公司已经公开发表的基础设施体系论文中，Borg 项目当仁不让地位居整个基础设施技术栈的最底层。

Borg 整体架构：可以去看<a href="https://zhuanlan.zhihu.com/p/30355957">《Borg：Google内部的大型集群管理系统》</a>这篇文章。

虽然在 Master 节点的实现细节上，Borg 项目与 Kubernetes 项目不尽相同，但它们的出发点是一致的，即：如何编排、管理、调度用户提交的作业。

K8s架构图：

![K8s架构图](pho1.jpg)

控制节点，即 Master 节点，由三个紧密协作的独立组件组合而成，它们分别是：

<ul>
    <li>kube-apiserver：负责 API 服务</li>
    <li>kube-scheduler：负责调度</li>
    <li>kube-controller-manager：负责容器编排</li>
</ul>

整个集群的持久化数据，则由 kube-apiserver 处理后保存在 Etcd 中。

而计算节点上最核心的部分，则是一个叫作 **kubelet** 的组件。

**在 Kubernetes 项目中，kubelet 主要负责同容器运行时（比如 Docker 项目）打交道。** 而这个交互所依赖的，是一个称作 CRI（Container Runtime Interface）的远程调用接口，这个接口定义了容器运行时的各项核心操作，比如：启动一个容器需要的所有参数。

这也是为何，Kubernetes 项目并不关心你部署的是什么容器运行时、使用的什么技术实现，只要你的这个容器运行时能够运行标准的容器镜像，它就可以通过实现 CRI 接入到 Kubernetes 项目当中。

而具体的容器运行时，比如 Docker 项目，则一般通过 OCI 这个容器运行时规范同底层的 Linux 操作系统进行交互，即：把 CRI 请求翻译成对 Linux 操作系统的调用（操作 Linux Namespace 和 Cgroups 等）。

**此外，kubelet 还通过 gRPC 协议同一个叫作 Device Plugin 的插件进行交互。** 这个插件，是 Kubernetes 项目用来管理 GPU 等宿主机物理设备的主要组件，也是基于 Kubernetes 项目进行机器学习训练、高性能作业支持等工作必须关注的功能。

**而 kubelet 的另一个重要功能，则是调用网络插件和存储插件为容器配置网络和持久化存储。** 这两个插件与 kubelet 进行交互的接口，分别是 CNI（Container Networking Interface）和 CSI（Container Storage Interface）。

但实际上，虽然 kubelet 这个奇怪的名字，来自于 Borg 项目里的同源组件 Borglet。不过，如果你浏览过 Borg 论文的话，就会发现，这个命名方式可能是 kubelet 组件与 Borglet 组件的唯一相似之处。因为 Borg 项目，并不支持我们这里所讲的容器技术，而只是简单地使用了 Linux Cgroups 对进程进行限制。

Borg 对于 Kubernetes 项目的指导作用主要体现在 Master 节点。

虽然在 Master 节点的实现细节上 Borg 项目与 Kubernetes 项目不尽相同，但它们的出发点却高度一致，即：如何编排、管理、调度用户提交的作业？



