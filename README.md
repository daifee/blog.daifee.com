# 博客程序

## THINKING

### 项目结构

```text
project/
  |-- api/ API服务的控制器
  |     |-- router.js 定义API程序
  |     |-- ... 控制器
  |-- config/ 配置
  |-- logs/  日志文件
  |-- middlewares/  中间件
  |     |-- accessLog.js  日志
  |     |-- authorize.js  权限检测
  |     |-- crossDomain.js  设置跨域响应
  |     |-- respondContentType.js  设置响应体类型
  |-- models/  定义数据模型
  |     |-- article.js  文章模型
  |     |-- comment.js  评论模型
  |     |-- index.js  入口，初始化所有模型，连接mongodb
  |     |-- pagination.js  分页模型
  |     |-- user.js  用户模型
  |-- proxy/  多有数据接口。不在逻辑代码中直接请求数据，必须通过这里的接口。
  |-- scripts/  一些独立的脚本
  |-- test/  测试代码
  |-- utils/  自己写的一些工具模块
  |-- CustomError.js  自定义错误类
  |-- index.js  程序入口
```

### 逻辑分层

* models定义所有数据模型
* proxy定义所有数据接口，需要多个接口的逻辑也在这里二次封装
* **控制器**检查输入和具体访问权限，请求proxy的接口就行，基本不需要处理逻辑
* `authorize.js`中间件限制不同角色对api的访问权限
* 路由定义了rest api

> 逻辑量是不变的，分层可以使代码更清晰。
> 上层的接口能被下层复用。

### 权限管理

`User`模型定义了用户角色：

* user  注册用户
* administrator  管理员

根据请求头`X-Token`获知用户角色，并派生出逻辑用户角色：

* guest  游客。没有`X-Token`
* self  自己。判断`token`，可以将`user`升级为`self`

> 定义路由的path中必须存在`:userId`，才能根据`userId`与`token`的关系判断角色是否为`self`。

`middlewares/authorize.js`是限制访问权限的中间件。她只简单检测角色（`user`, `administrator`, `self`）访问下一个**控制器**的权限。**控制器**有必要还要自己检测具体权限。



### 捕获所有Error

定义`CustomError`，重定义所有捕获的已知异常。

处理http请求的过程中发生的错误，为其创建`CustomError`实例，并传递给处理错误的中间件。

`CustomError`定义了`CODES`，代码中每处创建`CustomError`都使用不同的`CODE`，方便根据`CODE`追踪异常。

已知的异常都定义了`CODE`，方便追踪。发现未知异常，解决后为其追加`CODE`，这样就能持续修补程序中的所有异常。

根据错误类型，将`CODES`分为两种：

* 1xxx 请求数据不合法，客户端可以修改请求数据重新请求。例如：
  * 用户名格式不合法
  * 邮箱已被注册
  * 不够权限的操作
  * 请求太频繁
* 2xxx 程序内部错误。例如：
  * 程序出现bug，不可避免的
  * 数据库抛出异常


### 数据验证

* 内部接口没有必要做数据验证，不然会存在很多重复验证，累死自己
* 外部接口（restful api）必须做严谨数据验证，避免不合法输入
* 尽量过滤掉已知的不合法输入，对客户端更友好







## 注意

* `mongoose object`转化为`plain object`应该用`toObject`,不要使用`toJSON`。
* 请求接口不存在，返回404；请求资源为空，返回`null`或`[]`

## controllers 控制器层

* 输入&输出控制器

## models 模型层

* 定义Mongoose数据模型

## proxy 数据代理层

* 封装数据接口，从MongoDB、MySQL或其他数据源接口请求数据，并返回`plain object`
* 处理数据关联问题
* 解析并二次封装错误


## api

提供rest api，参考[github api](developer.github.com/v3)。



