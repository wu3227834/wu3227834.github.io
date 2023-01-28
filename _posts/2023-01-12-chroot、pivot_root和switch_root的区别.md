---
layout: mypost
title: chroot、pivot_root 和 switch_root 的区别
categories: [linux]
---

# <center>chroot、pivot_root 和 switch_root 的区别</center>

## chroot

chroot : change to root

为了进一步提高系统的安全性，linux 引入了 chroot 机制，chroot 是一个系统调用，可以更改一个进程所能看到的根目录。

类似创建一个沙盒，进程运行在沙盒之内，进程运行正常与否，并不会影响这台虚拟机的其他进程。

```
# 切换到有效的 filesystem bundle 目录
$ ls
bin  dev  lib  media  opt  root  sbin  sys  var  boot
etc  home  mnt  proc  run  srv  tmp  usr
$ cd /mycontainer
$ chroot rootfs /bin/sh
# 进入到一个新的shell中
$ ls /
bin  dev  lib 
```

可以看出，ls 命令参考的根是不同, 以此来形成简单的隔离.

## pivot_root

改变当前工作目录的所有进程或线程的工作目录. 这个跟chroot的就有很大的区别，chroot是只改变即将运行的某进程的根目录。

pviot_root 主要是把整个系统切换到一个新的 root 目录，然后去掉对之前rootfs的依赖，以便于可以 umount 之前的文件系统（pivot_root 需要 root 权限）

用法：pivot_root new_root put_old

例子：

   从 127.0.0.1:/home/qianjiang/nfsroot 挂载新的文件系统并且运行 init

<ul>
    <li> 拷贝 sh, ls 至 nfsroot/bin，以及相关的共享库至 nfsroot/lib </li>
    <li> 在 nfsroot 下面建立目录 old_root </li>
    <li> mount -o ro 127.0.0.1:/home/qianjiang/nfsroot /mnt </li>
    <li> cd /mnt </li>
    <li>
        pivot_root . old_root <br/>
        这个时候，会发现比如 "ls /" 显示的是 nfsroot 下面的文件；"ls old_root" 显示的是之前文件系统 root 下面的文件。
    </li>
</ul>

pivot_root 和 chroot 的主要区别是，pivot_root 主要是把整个系统切换到一个新的 root 目录，而移除对之前 root 文件系统的依赖，这样你就能够 umount 原先的 root 文件系统。而 chroot 是针对某个进程，而系统的其它部分依旧运行于老的 root 目录。

## switch_root

专为 initramfs 设计, 通常 initramfs 都是为了安装最终的根文件系统做准备工作，然后切换到新的根文件系统上去。

initramfs 是 rootfs， 且不能 umount， 所以不能使用 pivot_root。

switch_root做的工作：

<ul>
   <li> 删除早的 rootfs 内的全部内容，目的是为了释放空间，因为用的内存空间<li> 
   <li> 安装新的根文件系统<li> 
   <li> 切换到新的文件系统，并执行新文件系统的 init 程序<li> 
</ul>

（switch_root 必须由 pid=1 的进程调用，否则会错误，例如在 init 脚本: exec switch_root new_rootfs  /init）

参考：
<ul>
    <li>
        <a href='https://blog.csdn.net/u012385733/article/details/102565591'>chroot，pivot_root和switch_root 区别</a>
    </li>
    <li>
        <a href="https://waynerv.com/posts/container-fundamentals-filesystem-isolation-and-sharing/#chroot-%E5%91%BD%E4%BB%A4%E7%9A%84%E4%BD%BF%E7%94%A8%E7%A4%BA%E4%BE%8B">容器技术原理(五)：文件系统的隔离和共享</a>
    </li>
    <li>
        <a href="https://blog.csdn.net/linuxchyu/article/details/21109335">Linux中chroot与pivot_root的区别</a>
    </li>
</ul>