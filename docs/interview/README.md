# 面试题
## 框架相关
### vue-router
#### vue-router有关

1. hash 路由 和 history 路由，有什么区别

    - hash 路由 一般会携带 一个 # 号，不够美观； history 路由不存在这个问题；
    - 默认 hash 路由是不会像浏览器发出请求的，主要是一般用于锚点；history 中 go /back / forward 以及浏览器的前进、后退按钮一般都会像服务端发起请求；-- history 的所有 url 内容，服务端都可以获取到
    - 基于此，hash 模式，是不支持SSR的，但是 history 模式可以做 SSR
    - history 在部署的时候，如 nginx， 需要只渲染首⻚，让首⻚根据路径重新跳转
    - hash路由的监听，一般用onHashChange; history路由的监听，一般用onPopState
    - 要注意：如何部署 
```Nginx
# 单个的服务器部署
location / {
    try_files uri $uri /xxx/main/index.html
}

# 存在代理的情况
location / {
    rewrite ^ /file/index.html break; # 这里代表的是xxx.cdn 的资源路径
    proxy_pass https://www.xxx.cdn.com;
}
```

2. history.go / back 一定会刷新吗

要根据指定⻚面和当前界面的构建关系，动态决定

3. pushState 会触发 popState 事件吗？ 
popState 是监听其他的操作。
- pushState/replaceState 都不会触发 popState 事件，需要触发⻚面的重新渲染。
- popState 什么时候触发？
  - 点击浏览器的前进、后退按钮
  - back / forward / go

### vue2 和 vue3 

#### 从 vue2 到 vue3 有哪些升级更新（非兼容的变更）

#### 底层数据劫持的区别，从defineproperty到proxy

#### 组件形态上的变化

#### 组合api的优势

#### vue2中vue3

#### vue3源码 diff算法你了解吗


[v2和v3 diff算法的区别](https://zhuanlan.zhihu.com/p/421197879)

### react 和 vue 

####  hooks有什么区别

#### 生命周期

#### 路由

#### 更新的方法机制

#### 状态管理库（redux和vuex）


## css相关


## js相关

## 服务端&浏览器

1. 从输入url到获取页面过程