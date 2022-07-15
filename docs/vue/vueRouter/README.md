## vue-router

## 什么是 Router， Router 发展的历史

1. 路由的概念，是伴随 SPA 出现的。在此之前，⻚面的跳转是通过服务器端进行控制的

    - 传统的⻚面的跳转，是通过前端向后台发送请求
    - 后台通过模板引擎的渲染，将一个新的 html 界面 返回给前台
    - 比如⻚面跳转时
        - from 表单的提交
        - a 标签的默认属性
        - js 调用 location.href，给其赋值
        - H5: history 的 go / forward / back -- //  history.push / replace ?

2. 在 SPA（即只有一个 html ） 的出现后，前端可以自由控制组件的渲染，来模拟⻚面的跳转

    - ⻚面是怎么发生跳转，向服务端请求的呢？-- 浏览器劫持。
    - 在讲这部分内容前，我们先来说一下，hash 路由和 history 路由的区别
    - SPA的方法，需要拦截请求；
      - hash 路由，当我的hash
      - history 的 go / forward / back 的时候，我的浏览器的地址，是发生了改变的

总结：
- 后端路由是根据  url  访问相关的  controller  进行数据资源和模板引擎的拼接，返回前端
- 前端路由是通过  js 根据  url  返回对应的组件加载
  - 所以，前端的路由包含两个部分
    - url 的处理
    - 组件加载

## 路由的分类 
- history 路由
- hash 路由
- memory 路由

hash 路由：`window.location.hash = "xxx"`   

history 路由: `history./\(go|back|repalce|push|forward)/ `

## Router 异步组件
其实，动态路由 包括  React.lazy 、 import() 就是一种对代码进行动态拆分的技术，我们一般
叫做  code splitting 。 
在需要的时候，才进行加载；使首次加载的包体积尽可能更小

## vue路由守卫

 路由守卫的触发流程

1. 【组件】- 前一个组件  beforeRouteLeave
2. 【全局】-  router.beforeEach
3. 【组件】-如果是路由的参数变化，触发  beforeRouteUpdate 
4. 【配置文件】里，下一个  beforeEnter
5. 【组件】内部声明的  beforeRouteEnter
6. 【全局】调用  beforeResolve 
7. 【全局】的  router.afterEach 

## 简易版 hash路由监听实现

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>hash 路由</title>
</head>
<body>
    <div id="container" >
        <button onclick="window.location.hash = '#'">首页</button>
        <button onclick="window.location.hash = '#about'">关于我们</button>
        <button onclick="window.location.hash = '#user'">用户列表</button>
    </div>

    <div id="context"></div>
    
</body>
<script>

    class BaseRouter {
        constructor() {
            this.routes = {};
            this.refresh = this.refresh.bind(this);
            window.addEventListener('load', this.refresh);
            window.addEventListener('hashchange', this.refresh);
        }

        route(path, callback) {
            this.routes[path] = callback || function() {}
        }

        refresh() {
            const path = `/${window.location.hash.slice(1) || ''}`;
            this.routes[path]();
        }      
    }

    const Route = new BaseRouter();

    Route.route('/about', () => changeText("关于我们页面"));
    Route.route('/user', () => changeText("用户列表页"));
    Route.route('/', () => changeText("首页"));

    function changeText(arg) {
        document.getElementById('context').innerHTML = arg;
    }

</script>
</html>
```

## 简易版 history路由监听实现

```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>H5 路由</title>
</head>
<body>
    <div id="container">
        <a href="./" >首页</a>
        <a href="./about">关于我们</a>
        <a href="./user">用户列表</a>
    </div>
    <div id="context"></div>
    <script>
        class BaseRouter {
            constructor() {
                this.routes = {};
                this._bindPopstate();
                this.init();
            }

            init(path) {
                window.history.replaceState({path}, null, path);
                const cb = this.routes[path];
                if(cb) {
                    cb();
                }
            }

            route(path, callback) {
                this.routes[path] = callback || function() {}
            }

            go(path) {
                window.history.pushState({path}, null, path);
                const cb = this.routes[path];
                if(cb) {
                    cb();
                }
            }

            _bindPopstate() {
                window.addEventListener('popstate', e => {
                    const path = e.state && e.state.path;
                    this.routes[path] && this.routes[path]();
                })
            }
        }

        const Route = new BaseRouter();

    Route.route('./about', () => changeText("关于我们页面"));
    Route.route('./user', () => changeText("用户列表页"));
    Route.route('./', () => changeText("首页"));

    function changeText(arg) {
        document.getElementById('context').innerHTML = arg;
    }

    container.addEventListener('click' , e => {
        if(e.target.tagName === 'A') {
            e.preventDefault();
            Route.go(e.target.getAttribute('href'))
        }
    })
    </script>
</body>
</html>

```


##  路由的实现手写
