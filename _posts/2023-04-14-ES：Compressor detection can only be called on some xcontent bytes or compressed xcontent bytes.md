---
layout: mypost
title: ES：Compressor detection can only be called on some xcontent bytes or compressed xcontent bytes
categories: [那些年遇到的坑]
---

## 发生缘故

jmeter 压测，写入 elasticsearch 报错

## 运行环境

<ul>
    <li>elasticsearch 6.7.2</li>
    <li>jmeter 5.5</li>
    <li>jdbc 1.8</li>
</ul>

## 报错信息

![error_information](error_information.png)

## 分析排查

<ul>
    <li>Compressor detection can only be called on some xcontent bytes or compressed xcontent bytes</li>
    <li>压缩器检测只能在某些 xcontent 字节或压缩的 xcontent 字节上面调用</li>
</ul>

根据报错原因可以将错误定位至 io.xwt.BulkDoument.runTest(BulkDoument.java 87)，代码如下：

```
// 解析 json
for(int i = 0; i < datas.length; ++i) {
    datas[i] = datas[i].replace("{DATET}", datasdf.format(System.currentTimeMillis()));
    if (this.threadNum != 0) {
        String id = "t" + this.threadNum + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID();
        br.add((new IndexRequest(this.indexName, default_type, id)).source(datas[i], XContentType.JSON));
    } else {
br.add((new IndexRequest()).source(datas[i], XContentType.JSON));
    }
}
try {
// 生成 bulk 连接
    sampleResult.sampleStart();
    BulkResponse bulkResponse = this.client.bulk(br, RequestOptions.DEFAULT);
    sampleResult.sampleEnd();
    sampleResult.setSuccessful(true);
    sampleResult.setResponseCodeOK();
    if (bulkResponse.hasFailures()) {
        sampleResult.setSuccessful(false);
        sampleResult.setResponseCode("500");
        sampleResult.setResponseData(bulkResponse.buildFailureMessage(), "utf-8");
    } else {
        sampleResult.setResponseData("all in", "utf-8");
    }
// 报错
} catch (Exception var8) {
    sampleResult.sampleEnd();
    sampleResult.setSuccessful(false);
    sampleResult.setResponseCode("500");
    sampleResult.setResponseMessage(var8.getMessage());
    var8.printStackTrace();
}
```

那么就可以将报错信息转为人话了：语句的类型不是JSON风格的或者JSON格式化错误了。

定位写入数据，数据如下：
![eventdate](eventdate.png)

@timestamp 为 date类型，这里用了 string，修改这个值/jmx上替换。

注：
<ul>
    <li>有时网络差，也可能会出现这个报错</li>
</ul>