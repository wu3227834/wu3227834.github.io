---
layout: mypost
title: DSL备忘（一）：Constant score query 和 Bool Query
categories: [Elasticsearch]
---

# <center>DSL备忘（一）：Constant score query 和 Bool Query</center>

## Constant score query

常量分值查询，目的就是返回指定的 score（默认1），一般都结合 filter 使用，因为 filter context 忽略 score。

### 基本语法

多用于结合bool查询实现自定义得分，其基本语法如下:

```
POST /index_name/_search
```

```
{
  "query": {
    "constant_score": {
      "filter": {
        "match": {
          "field_name": "query_clause"
        }
      },
      "boost": score
    }
  }
}
```

<ul>
    <li>const_score：关键字</li>
    <li>filter：只能有一个</li>
    <li>field_name：字段名</li>
    <li>query_clause：待查询的语句</li>
    <li>boost：自定义得分</li>
</ul>

### 实例

```
GET /customer/_search
{
  "query": {
    "constant_score": {
      "filter": {
        "range": {
          "age": {
            "gt": 25
          }
        }
      },
      "boost": 8.8
    }
  }
}

result:返回结果中score都是被指定的8.8
{
  "took" : 8,
  "timed_out" : false,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "skipped" : 0,
    "failed" : 0
  },
   "hits": {
    "total": 4,
    "max_score": 8.8,
    "hits": [
      {
        "_index": "constant_index",
        "_type": "default_type_",
        "_id": "1",
        "_score": 8.8,
        "_source": {
          "name": "Emma Edgar"
        }
      },
      {
        "_index": "constant_index",
        "_type": "default_type_",
        "_id": "2",
        "_score": 8.8,
        "_source": {
          "name": "Underwood Verda"
        }
      },
      {
        "_index": "constant_index",
        "_type": "default_type_",
        "_id": "4",
        "_score": 8.8,
        "_source": {
          "name": "Rivera Interpreter"
        }
      },
      {
        "_index": "constant_index",
        "_type": "default_type_",
        "_id": "6",
        "_score": 8.8,
        "_source": {
          "name": "Lucy Seaman"
        }
      }
    ]
  }
}
```

## bool query 

布尔查询，由一个或者多个子句组成，每个子句都有特定的类型。
<ul>
    <li>
        must：返回的文档必须满足 must 字句的条件，并且参与计算分值
    </li>
    <li>
        filter：返回的文档必须满足 filter 字句的条件。但不会像 must 一样参与计算分值
    </li>
    <li>
        should：返回的文档可能满足 should 子句的条件。布尔查询在 query context 中，如果某条文档未匹配 should 的条件，但是匹配 must 或 filter 的条件，则文档仍会被返回，此时 should 只影响分数；如果不存在 must 和 filter，则必须匹配 should。这种行为由 minimum_should_match 参与决定。
    </li>
    <li>
        must_not：返回的文档必须不满足 must_not 定义的条件。
    </li>
</ul>

### 官网例子

第一步：查询 name 为 "李云龙" 的文档

```
GET /customer/_search
{
  "query": {
    "bool": {
      "must": {
        "term":{"name.keyword":"李云龙"}
      }
    }
  }
}
返回三个文档：
{
  "hits" : {
    "total" : 3,
    "max_score" : 1.4916549,
    "hits" : [
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "4",
        "_score" : 1.4916549,
        "_source" : {
          "name" : "李云龙",
          "id" : "510221197001013611",
          "addr" : "昆明市滇池路阳光时代1栋1单元",
          "tel" : "13808712808"
        }
      },
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "224",
        "_score" : 1.4916549,
        "_source" : {
          "name" : "李云龙",
          "id" : "224",
          "addr" : "天津市阳光路2008号",
          "tel" : "13908712808"
        }
      },
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "510221197001013611",
        "_score" : 1.4916549,
        "_source" : {
          "name" : "李云龙",
          "id" : "510221197001013611",
          "addr" : "上海市浦东区华北路8号",
          "tel" : "13908712808"
        }
      }
    ]
  }
}
```

第二步：加入过滤条件，只保留 id 为 510221197001013611 的文档

```
GET /customer/_search
{
  "query": {
    "bool": {
      "must": {
        "term":{
          "name.keyword":"李云龙"
        }
      },
      "filter": {
        "term": {
          "id": "510221197001013611"
        }
      }
    }
  }
}

返回结果减少到 2 个文档，并且 score 相同：
{
  "hits" : {
    "total" : 2,
    "max_score" : 1.4916549,
    "hits" : [
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "4",
        "_score" : 1.4916549,
        "_source" : {
          "name" : "李云龙",
          "id" : "510221197001013611",
          "addr" : "昆明市滇池路阳光时代1栋1单元",
          "tel" : "13808712808"
        }
      },
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "510221197001013611",
        "_score" : 1.4916549,
        "_source" : {
          "name" : "李云龙",
          "id" : "510221197001013611",
          "addr" : "上海市浦东区华北路8号",
          "tel" : "13908712808"
        }
      }
    ]
  }
}
```

第三步：使用 should，判断 addr 中必须有昆明市，这种情况下 should 子句会影响计分

```
GET /customer/_search
{
  "query": {
    "bool": {
      "must": {
        "term":{
          "name.keyword":"李云龙"\
        }
      },
      "filter": {
        "term": {
          "id": "510221197001013611"
        }
      },
      "should": [
        {
          "match": {
            "addr": "昆明市"
          }
        }
      ]
    }
  }
}
返回结果中，地址是昆明市的文档 score 加重
{
  "hits" : {
    "total" : 2,
    "max_score" : 3.408528,
    "hits" : [
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "4",
        "_score" : 3.408528,
        "_source" : {
          "name" : "李云龙",
          "id" : "510221197001013611",
          "addr" : "昆明市滇池路阳光时代1栋1单元",
          "tel" : "13808712808"
        }
      },
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "510221197001013611",
        "_score" : 1.5720221,
        "_source" : {
          "name" : "李云龙",
          "id" : "510221197001013611",
          "addr" : "上海市浦东区华北路8号",
          "tel" : "13908712808"
        }
      }
    ]
  }
}
```

第四步：加入 must_not 排除上海

```
GET /customer/_search
{
  "query": {
    "bool": {
      "must": {
        "term":{
          "name.keyword":"李云龙"
        }
      },
      "filter": {
        "term": {
          "id": "510221197001013611"
        }
      },
      "should": [
        {"match": {
          "addr": "昆明市"
        }}
      ],
      "must_not": [
        {"match": {
          "addr": "上海"
        }}
      ]
    }
  }
}

只返回一个文档：
{
  "hits" : {
    "total" : 1,
    "max_score" : 3.408528,
    "hits" : [
      {
        "_index" : "customer",
        "_type" : "doc",
        "_id" : "4",
        "_score" : 3.408528,
        "_source" : {
          "name" : "李云龙",
          "id" : "510221197001013611",
          "addr" : "昆明市滇池路阳光时代1栋1单元",
          "tel" : "13808712808"
        }
      }
    ]
  }
}
```