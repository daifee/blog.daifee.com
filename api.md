# API

blog.daifee.com的API接口

## 概要

* API都支持`https`协议
* API都在`https://blog.daifee.com/api`之下
* 接收`JSON`数据，请求头必须包含`Content-Type: application/json; charset=utf-8`
* 响应`JSON`数据，响应头包含`Content-Type: application/json; charset=utf-8`
* 支持跨域，响应头包含`Access-Control-Allow-Origin: *`

```sh
curl -i https://blog.daifee.com/api/users/daifee

HTTP/1.1 200 OK
Server: nginx
Date: Thu, 23 Feb 2017 13:01:46 GMT
Content-Type: application/json; charset=utf-8
Content-Length: 347
Connection: keep-alive
X-Powered-By: Express
Access-Control-Allow-Origin: *
ETag: W/"15b-fH/gWl5VpOqWZvvGmqOfcg"
Strict-Transport-Security: max-age=15768000
```

**分页参数:**

* page 当前页码
* per_page 每页数据量


**404:**

只有API不存在才响应404状态，只是API的数据不存在则正常响应200状态（数据为`null`或`[]`）

**响应错误**

客户端或服务端引起的错误都响应“正确”的http状态和对应的错误信息。例如：

```sh
HTTP/1.1 400 Bad Request
Content-Length: 40

{"message":"未授权"}
```

## APIs


**说明：**

* `$user`: 表示用户对象的json，结构如下：

```json
{
  "token": "用户唯一token",
  "updatedAt": "2017-02-20T09:05:50.320Z",
  "createdAt": "2017-02-20T09:04:52.051Z",
  "name": "daifee1",
  "email": "daifee1@daifee.com",
  "role": "user",
  "articleNum": 1,
  "introduction": "这人很懒",
  "avatar": "http://tva2.sinaimg.cn/crop.0.0.180.180.180/852a97e7jw1e8qgp5bmzyj2050050aa8.jpg",
  "id": "58aab134a3d1c86402a19420"
}
```


* `$article`: 表示文章对象的json，结构如下：

```json
{
  "updatedAt": "2017-02-20T09:05:50.300Z",
  "createdAt": "2017-02-20T09:05:50.300Z",
  "title": "Hello World",
  "content": "Hello World\r\n\r\n* markdown\r\n* js\r\n* css\r\n* html\r\n* nginx\r\n* nodejs",
  "userId": "58aab134a3d1c86402a19420",
  "commentNum": 0,
  "id": "58aab16ea3d1c86402a19421",
  // 关联$user
  "user": $user
}
```

* `$comment`: 表示评论对象的json，结构如下：

```json
{
  "updatedAt": "2017-02-20T09:05:50.300Z",
  "createdAt": "2017-02-20T09:05:50.300Z",
  "content": "呢哦容",
  "id": "58aab16ea3d1c86402a19421",
  // 关联$user
  "user": $user,
  // 关联$article
  "article": $article
}
```

* `...`表示伸展符号，`{...$user} == $user`，因为`{...$user}`比`$user`更能直观表示json结构，所以下面很多地方用`{...$user}`。
* 数据结构数据只距离列出两项。
* `$user, $article, $comment`表示的请求体和响应体，可能只需要其中部分`key`。


### 用户

#### 用户验证

**request:**

* path: `/api`
* method: `post`
* body:
```json
{
  "name": "用户名",
  "password": "用户密码"
}
```

**response:**

```json
{...$user}
```


#### 获取用户列表

**request:**

* path: `/api/users`
* query
  * `page`: 页码
  * `per_page`: 每页数据量
* method: `get`

**response:**

```json
[
  $user,
  $user
  // ...列表
]
```

#### 获取用户详情


**request:**

* path: `/api/users/$name`
* method: `get`

**response:**

```json
{...$user}
```


#### 创建用户

**request:**

* path: `/api/users`
* method: `post`
* body:
```json
{
  "name": "用户名",
  "password": "用户密码",
  "email": "用户邮箱"
}
```

**response:**

```json
{...$user}
```


#### 更改用户信息

可以更改部分用户信息

**request:**

* path: `/api/users/${id}`
  * `id`: 用户ID
* method: `patch`
* body:
```json
{...$user}
```

**response:**

```json
{...$user}
```


#### 删除用户

**request:**

* path: `/api/users/${id}`
  * `id`: 用户ID
* method: `delete`
* headers
  * `X-Token`: 用户唯一token


### 文章

#### 获取多篇文章

**request:**

* path: `/api/articles`
* query
  * `page`: 页码
  * `per_page`: 每页数据量
* method: `get`

**response:**

```json
[
  $article,
  $article
  // ...列表
]
```


#### 获取一篇文章

**request:**

* path: `/api/articles/${id}`
  * `id`: 文章ID
* method: `get`

**response:**

```json
{...$article}
```


#### 创建文章

**request:**

* path: `/api/articles`
* method: `post`
* headers
  * `X-Token`: 用户唯一token
* body

```json
// title, content
{...$article}
```

**response:**

```json
{...$article}
```


#### 更改文章

* path: `/api/articles/${id}`
  * `id`: 文章ID
* method: `patch`
* headers
  * `X-Token`: 用户唯一token
* body

```json
// title, content
{...$article}
```

**response:**

```json
{...$article}
```


#### 删除文章

* path: `/api/articles/${id}`
  * `id`: 文章ID
* method: `delete`
* headers
  * `X-Token`: 用户唯一token


### 评论

#### 获取评论

**request:**

* path: `/api/comments`
* query
  * `user_id`: 用户ID，要获取用户评论则传递
  * `article_id`: 文章ID，要获取文章下面评论则传递
  * `page`: 当前页码
  * `per_page`: 每页数据量
* method: `get`

**response:**

```json
[
  $comment,
  $comment
  // ...
]
```

#### 获取一条评论


**request:**

* path: `/api/comments/${id}`
  * `id`: 评论ID
* method: `get`

**response:**

```json
{...$comment}
```


#### 创建评论


**request:**

* path: `/api/comments`
* method: `post`
* headers
  * `X-Token`: 用户唯一token
* body

```json
// content
{...$comment}
```

**response:**

```json
{...$comment}
```


#### 删除评论

* path: `/api/comments/${id}`
  * `id`: 文章ID
* method: `delete`
* headers
  * `X-Token`: 用户唯一token

