---
group: V1 初显锦绣
version: 1.10
date: 2026-02-20
digest: 重磅宇宙超级震撼雷霆大更新
---

新年好新年好~虽然过年期间很希望能发一篇祝福博客，不过就是偷懒了！
此版本包含很多重大更新，感兴趣的朋友们可以看看

## 个人空间

最后，我们还是决定搁置“每个用户都能发帖”的想法，转而为每位用户提供了另一个自由发挥的空间：
**个人主页**。
每位用户可以通过点击他人的头像来查看某位用户的个人主页。你也可以编辑自己的个人空间。
这里提供了很多非常有意思的功能，在未来，功能也会进一步扩充

### SkillOut

编辑你的**技能墙**，让别人能够更好地知道你掌握哪些技能。
在未来，你可以通过这一功能直截了当地向别人展示你的技术栈，进而找到有同一喜好的朋友，或直接为需要你的项目负责人们提供联系方式！
你可以在本博客的留言板中以回复的形式发起添加技能项目的请求，让他们被加入到技能墙中！（因为我一个人想不到那么多）
你也可以在[这里](https://github.com/WangJie-Mant/Blog/issues/1)发起添加请求~

### banner

为了能够展示不同形状的banner，我们最终放弃选用与avatar相似的“截取”思路，转而为个人主页的card组件与banner区域设置**滑动动画**。
在未来，这项技术还会进一步扩展。我们将设置一个**gallery**区域，能够让身为摄影高手的你展示你的作品；或是在**repo**区域把你引以为傲的项目自定义友链和指向github repo的链接。
**不合规的用户信息和个人空间将被永久封禁。请勿利用本站设计的宣传功能宣传违规内容**

### sign

显示属于你的slogan~

## 博客界面优化

身为博客网站一定要做好博客✍🏻✍🏻✍🏻
- 现在的bloglist增加了author字段的显示和支持根据tag过滤博客条目的功能！非常漂亮的标签显示，让我的键盘旋转
- 在blog详情页面，你可以通过方便的大纲功能在博客中跳转到你感兴趣的内容。

## 接下来做什么

- 规划gallery页面的实现，以及用于展示项目的repo页面等
- 在个人空间中优雅地显示你的个人联系方式，递上赛博名片
- 更新更有意思的博客显示功能。如果说单纯的音乐动画鉴赏缺少文字与画面/音频的互动，为什么不能将他们结合起来？（如何结合？）

## 其他修改

@feature：个人空间页面和编辑页面重构。把编辑个人资料wrap在card组件中。
@feature：按照标签和修改日期完成的filter和timeline功能启用。
@feature：根据页面大纲跳转博客对应的内容部分。
@feature：为个人主页页面设置了banner和SkillOut技能墙，更好地展示你的技能。

---

group: V1 初显锦绣
version: 1.8
date: 2026-02-12
digest: 教程...

---

## Tutorial

突发奇想制作了一个能够通过磨砂效果显示页内引导的小组件：**Tutorial**
所有tutorial只在**首次进入对应页面**或**教程版本更新**时会再次显示

## 其他改动

- @add：加入页内引导的教程页面。
- @fix：修复useTutorial Hook在async函数定义的页面中图像fetch异常的问题。
- @change：将用户菜单的所有按钮翻译成中文。让我们说中文！

---

group: V1 初显锦绣
version: 1.72
date: 2026-02-11
digest: 更好的显示...

---

为RSS按钮修改了全新的显示样式（之前的toast实在是**太丑了**！）

## 接下来做什么

- 为每位用户添加个人主页，编辑个人信息功能将移动到个人主页的右上角按钮（有点像Github?!）
- 为每位用户的个人主页加入个性签名、背景banner等等个性化功能，为后续论坛功能接入准备
- 准备论坛界面和显示样式，未来用户都可以发贴(Registered)
- 为blog页面的文章加入tag分类，在card右上角显示badge
- 启用按tag分类的功能
- 启用网页左下角的timeline功能

## 其他改动

- @change：修改了RSS按钮的显示样式和复制后的提示逻辑。现在有了更好的css动画和优雅的提示
- @add：为profilemenu的message功能加入了简单的提示红点

---

group: V1 初显锦绣
version: 1.71
date: 2026-02-09
digest: chore：站点日常维护

---

马上过年要回老家了，预计接下来三天没有网络环境来修网站，趁着出发前尽快搞定。
祝大家过年好~

## 其他改动

- @feature：为RSS按钮添加了复制RSS链接的功能
- @feature：为Card组件添加了渲染markdown文档list样式的功能
- @fix：修复RSS后端中提供的blog地址不正确导致阅读器导航到不存在页面的问题
- @fix：修复上传头像时偶现的413问题
- @fix：修复偶发的用户头像无法在navbar上正确显示的问题

---

group: V1 初显锦绣
version: 1.7
date: 2026-02-07
digest: RSS...

---

### 网页现已支持RSS News Feed

**感谢@璃音String提供的功能建议**

## 聚合你的信息

你可以通过本站提供的RSS地址

```bash
https://n4gasaki.icu/rss
```

来订阅本站及本站的博客更新。把本站加入你的信息聚合，在你每天的日程中浏览来自N4的最新更新~

## 其他改动

- @feature: 增加RSS功能
- @change: 后端代理规则补全
- @fix: 其实注册的英文是register，让我们说中文
- @fix: 修复了主页的第四个按钮跳转错误的问题

---

group: V1 初显锦绣
version: 1.6
date: 2026-02-06
digest: 备案

---

## 通管局备案

备案终于结束，没有16个工作日预想得那么长。在后端服务器api终于恢复解析后，我们开始准备网站正式上线

```diff
+ 腾讯云通管局备案
```

简单进行最后的准备。

## 其他修改

- @fix: 修复了后端配置文件中CORS冲突问题
- @fix: 替换导航逻辑为跳转，防止每次链接都需要重新拉取用户信息
- @change: 用户信息本地缓存
- @fix: 修复了留言板提交链接的偶发性错误ID导致的假500问题
- @change: 更改留言板样式

---

group: V1 初显锦绣
version: 1.51
date: 2026-02-05
digest: 一起看....

---

## html5视频播放

现在网页支持播放html5视频。视频播放组件放在card容器中保持风格统一
一个raw视频会经过内置的ffmpeg将格式转换为m3u8，再交由html渲染组件

## 一起看

使用React的视频事件回调，通过websocket向后端发送实时信息。
后端管理一个room内的所有viewer，订阅主host的ws，通过事件广播来同步所有viewer的进度与host一致

## 需要解决的问题

- 后端测试过程中发现每创建一个房间会留下大量的m3u8缓存文件。如何正确处理视频缓存？
- - 在未来，只有hls视频会在后端保留。所有raw视频共享一个固定时间（5小时）的缓存规则。
- - 考虑cloudflare cdn来分发hls文件，降低io压力
- 公开的一起看功能应当能够自主上传视频文件

**一起看功能需要注册用户才能使用**

- @feature: html5视频页内渲染
- @feature: 基于websocket的视频一起看功能

---

group: V1 初显锦绣
version: 1.41
date: 2026-02-03
digest: 验证你的邮箱

---

## 邮箱验证

**后端**
为后端配置了Gmail的SMTP服务，新增注册邮件的验证表
但获取验证码的响应速度真的好慢好慢，不知道去掉梯子究竟能不能正常运行
过两天研究一下腾讯云的smtp服务吧
**前端**
修改了注册页面，增加一个用来验证邮箱的输入框
给“发送验证码”按钮应用了能够动态渲染的倒计时样式

```diff
+ nextblogbk api: verify/send-code
```

## 其他改动：

- @fix: 修正了profilemenu组件头部样式显示的异常问题
- @fix: 修正了profilemenu组件分隔线两段显示的异常样式

---

group: V1 初显锦绣
version: 1.31
date: 2026-02-02
digest: @feature:添加用户组分类

---

## 用户组

站点功能的进一步添加，需要我们应用用户组策略来控制不同用户对不同板块的访问
但对于现在的站点来说，你只要是注册用户Registed，基本上都有完整的权限
实际上也就只有Guest|Registed|Admin

## 接下来做什么

为Admin添加方便的内容管理功能。说得高级，其实现在能想到的只有“删除评论和留言”
游客不可以使用Contents分组下的功能如：N4你在做什么

```diff
+ user: role: String
```

---

group: V1 初显锦绣
version: 1.3
date: 2026-02-02
digest: 大海航行靠舵手

---

## 更改日志

突然想把这些莫名其妙的碎碎念用类似于git的方式展现到网页里，也算网页的一部分新奇的内容

```diff
+ gitversions
```

---

group: V1 初显锦绣
version: 1.21
date: 2026-02-01
digest: @fix:修复card组件内渲染不了html的问题

---

## 艰辛的尝试

之前写过一个根据正则把md转换为html的小工具，于是在我的设想中这个不应该是一个大问题：
[这里](https://github.com/WangJie-Mant/md-to-html)
结果是的
最后终于搞定了。后端只发送md文件原文，在React组件中渲染Markdown。

```diff
+ react-markdown
+ tailwindcss/typography
```

---

group: V1 初显锦绣
version: 1.2
date: 2026-02-01
digest: 趣味功能：N4你在做什么

---

其实刚开始做博客的时候我就想做这个功能了

## 时间老人

一个调用windows api的程序，在windows系统上运行，监听系统中活跃应用的切换行为，根据进程pid，获取路径和进程名
通过reqwest上报服务器端点，后端在服务器内保存访问记录，写入inspect_log表
前端点击获取可以获得当前和最近三次活动记录
每50次记录清理30天前的记录，每次重复更新按process_name实现去重更新，

```diff
+ nextinspect
+ creeper->router,handler,service,model
+ creep->page.tsx
```

---

group: V1 初显锦绣
version: 1.1
date: 2026-01-31
digest: 其实用不了

---

老实等待域名备案完成恢复解析中

```diff
+ 腾讯云首次备案记录
```

---

group: V1 初显锦绣
version: 1.0
date: 2026-01-30
digest: 上线，上线

---

## 做过的东西

仔细想想，当初预想的一大部分功能似乎都完成了，我们有

- 一个很棒的多功能card组件
- 很棒的bloglist渲染和一个很棒的blog详情页
- 很棒的评论功能
- 很棒的？用户系统
- 很棒的？homepage layout

```diff
+ github repo: NextBlog NextBlogBK
+ vercel deploy: NextBlog
+ 轻量级应用服务器：北京Ubuntu
+ 超炫酷的域名 n4gasaki.icu
```

---

group: V0 复地重天
version: 0.51
date: 2026-01-29
digest: 评论功能完成

---

## 留下你的想法

评论组件包括一个发送框和一个展示框。改进了card组件，让它能够正确地排序不同card之间的嵌套关系。
嵌套关系来展示不同的回复、评论之间的独立关系
把不同数据库之间存储评论的地方分隔开，相互数据不污染，支持thread_id+分表查询

```diff
@@ comments @@
```

---

group: V0 复地重天
version: 0.5
date: 2026-01-27
digest: homepage

---

## TextRotate

这个组件好像广告大屏幕上的特效字
挺有意思的

现在的主页好像有点空，除了一个会转的文本字和四个不明意味的导航按钮之外什么也没有

```diff
@@ page.tsx @@
```

## 接下来做什么

**评论组件**
这样就可以收到大家的留言
**前端**
复用card组件，把评论内容作为content展示，结合头像和昵称生成一张能够显示评论详情的commentboard
就像vcb的那个一样，最好还能嵌套，还有回复功能
**后端**
存储Serialized的评论数据。前端加载时从后端端点拉取数据

```diff
+ comment_service/handler
+ commentboard/page.tsx
```

---

group: V0 复地重天
version: 0.44
date: 2026-01-26
digest: 加入Avatar组件

---

## 用户头图

现在可以为你的个人资料添加头图了。如果说你上传了大于分辨率的图片，还有AvatarCropper组件帮你选择合适的大小
如果用户一多会不会要像其他论坛一样只支持外链头像？
不会吧，哪会有那么多人来

---

group: V0 复地重天
version: 0.42
date: 2026-01-25
digest: 注册和编辑个人资料

---

gemini神力

## SQLite后端数据库

如果有一天我做了这样的一个梦，梦里我只需要写端口的路由和响应的行为，然后吹一口仙气就能建成立体的服务...
哦，原来是Gemini搞定了，我说相信科学吧

## 编辑个人资料

所有涉及账户操作的行为都需要在请求中添加token。

```diff
@@ auth_service auth @@
```

---

group: V0 复地重天
version: 0.41
date: 2026-01-23
digest: 登录端点

---

真动手才发现自己真的对信息安全一点想法都没有
最好还是在注册界面上放一个提示
现在使用的是Argon2哈希+JWT，用户注册在SQLite中

登录成功后服务端签发JWT（默认有效期24小时），前端把token存起来后放在Authorization: Bearer <token>里。

```diff
@@ services/auth.rs handlers/auth.rs @@
```

---

group: V0 复地重天
version: 0.41
date: 2026-01-19
digest: 注册，登录，个人资料页面

---

实在不想写后端了

```diff
@@ (auth)/login/page.tsx /regist/page.tsx @@
@@ profile/page.tsx @@
```

---

group: V0 复地重天
version: 0.4
date: 2026-01-18
digest: 用户系统

---

接下来要做用户系统

## 理想中的用户系统

**前端**
提供`regist`和`login`页面对应功能，`Navbar`右侧的用户按钮则需要根据情况渲染不同的按钮
如果说处于未登录状态，那么下拉菜单中只提供登录和注册选项。
如果处于登录状态，那么菜单中将显示用户的昵称（分割线）/编辑个人信息按钮/登出
这些都是要实现的页面
**后端**
提供登录和注册端点。登录时将邮箱和哈希密码发送回后端验证，注册时将昵称，邮箱，哈希密码和注册时间发送到后端数据库保存
那就要用sql
对于更多的编辑个人资料页面，就需要：
一个向前端发送个人资料的端点
一个更新个人资料的端点

## 接下来作什么

新建文件夹先

```diff
+ nextblog/(auth)/regist login
+ nextblogbk/router/auth.rs
+ nextblogbk/services,handlers/auth.rs
+ nextblogbk/models/users.rs
```

---

group: V0 复地重天
version: 0.31
date: 2026-01-18
digest: （真正）优美的layout

---

## 主体菜单

做下拉菜单也太诡异了，本来页面就不怎么多，设置成下拉菜单就吊在那里了...
而且左边导航用下拉菜单，右边用户页面用下拉菜单就很不好
于是把菜单改造成了从页面左边滑出的`drawer`
配合分割线，可以在drawer中创建内容分区，就这样挺好

```diff
@@ Components/Navbar @@
```

---

group: V0 复地重天
version: 0.3
date: 2026-01-18
digest: 优美?的layout

---

在全局layout中定义了头顶好看的`navbar`，包括一个汉堡菜单，一个指向home的标签和右边预定为用户功能的用户按钮
定义了`footer`，包含两个指向个人空间的svg
画了一个略奇怪的logo，不过我很满意。
又：为什么jpg转换为svg之后线条会变得这么细？除了大体的轮廓和三条杠之外看不出更多细节了....
我很满意

```diff
+ Components/NavBar Footer
+ public/icons/logo.svg
```

---

group: V0 复地重天
version: 0.23
date: 2026-01-17
digest: 不要无限长

---

BlogList现在支持分页功能

---

group: V0 复地重天
version: 0.22
date: 2026-01-17
digest: BlogList Component

---

对于后端返回的json数组：

```json
[
    {
        id:1,
        title: xxx,
        ...
    },
    {...}
]
```

复用Card组件。对于每个数组对象单独解析数组数据，渲染一个card组件。
card组件渲染预览，头图，digest和标题，提供一个指向博客连接的ReadMore按钮。

```diff
+ Components/BlogList
```

---

group: V0 复地重天
version: 0.21
date: 2026-01-17
digest: 博客内容服务迁移到后端

---

现在前端中只存储icon和photo，对于庞大的博客内容服务迁移到后端。
前端通过端点向后端拉取博客内容，根据前后端一致的数据结构解析响应，再根据解析得到的数据渲染内容

```diff
- nextblog/contents
+ nextblogbk/contents
```

---

group: V0 复地重天
version: 0.2
date: 2026-01-17
digest: cargo new nextblogbk

---

## 使用rust搭建的简易后端

rust后端从设计上遵循严格的服务分层原则。

```bash
---- nextblogbk
    -- main.rs      // 程序主入口，运行app.run()
    |
    -- app.rs
    |
    ---- /router    // app_router，将请求发送到各个服务单独对应的router
    |                // 其余服务单独的router定义后端最基础的端点
    |
    ---- /handlers  // handler负责将传入的数据解析并生成响应发回请求
    |
    ---- /services  // 服务层，网站的每个逻辑功能都是一个“服务”，
                    // 响应的属性、结构和方法都在这里定义
    |
    ---- /models    // 网站的逻辑功能中运行的各种数据结构在这里定义
    |
    ---- /repos     // 仓储层，网站内容服务的中心
    |
    ---- /utils     // 整个项目公用的小帮手
```

不同层之间通过在路由中注册的AppState共享关键信息。

```diff
+ nextblogbk
```

---

group: V0 复地重天
version: 0.11
date: 2026-01-15
digest: 创建博客页面

---

## 前端样式：tailwindcss+Daisyui

感谢现在的前端有这么好的集成样式库，让我不用手写css
简单复用就可以轻松设置页面layout，封装好的Components提供了更多便捷

```diff
+ tailwindcss @plugin Daisyui
```

## 找一个合适的样式来展示博客

把博客页面做成卡片的样式，再把这个样式封装成Component。以后网站的设计将围绕着这个基础的样式进行。

```diff
+ Components/Card
```

## 博客内容将支持metadata

用**YAML Font Matter**的文件形式来确定每一部分的metadata。对于一个博客，有三个字段来组成metadata:

```json
{
    title: String,
    date: String,
    digest: String
}
```

拉取博客时，ts会从用三杠号标出的区域中按字符匹配metadata

---

group: V0 复地重天
version: 0.1
date: 2026-01-12
digest: npm create-next-app@latest nextblog

---

新建文件夹
