## vuex

### 状态管理

打算开发中大型应用，集中式数据管理, 一处修改，多处使用，多个组件依赖于同一状态，来自不同组件的行为需要变更同一状态，生态环境给我们提供了官方插件vuex

**vuex相关成员**

``import Vuex from 'vuex'``， Vuex是个对象，相关成员如下


| 成员         | 用途                       |
| ------------ | -------------------------- |
| Store        | 类，构造状态管理的**实例** |
| mapActions   | 函数，通讯工具             |
| mapMutations | 函数，通讯工具             |
| mapGetters   | 函数，通讯工具             |
| mapState     | 函数，通讯工具             |

状态管理**实例**相关成员

| 成员     | 用途               |
| -------- | ------------------ |
| dispatch | 实例方法，通讯工具 |
| commit   | 实例方法，通讯工具 |
| state    | 属性，获取公共数据 |


**交互流程图**

<img src="https://vuex.vuejs.org/flow.png" alt="vuex" style="zoom:50%;" />

**配置**

```js
// /src/main.js

//引入store实例
import store from './plugins/vuex.js'

new Vue({
  render: h => h(App),
  store//控制vue实例，为vue实例提供一个状态管理实例，管理整个vue公共状态
}).$mount('#app')

```

```js
// src/plugins/vuex.js

//配置 store
import Vue from 'vue';
import Vuex from 'vuex';//引入vuex包
Vue.use(Vuex);//安装插件到vue

import state from '../store/state.js'
import actions from '../store/actions.js'
import mutations from '../store/mutations.js'
import getters from '../store/getters.js'

let store = new Vuex.Store({//配置接受state等选项，值为对象
  state,mutations,
  getters,actions
});

export default store;//导出store实例给main.js
```

```js
// src/store/state.js

let state={
  count:0
}

export default state;
```

```js
// src/store/actions

let actions = {
  jia:({commit,state},payload)=>{
   	//state 公共状态 payload 负载  payload有没有传递时，是事件对象
    commit('increment',payload)
  }
};

export default actions;
```

```js
// src/store/mutations.js

let mutations={
  increment:(state,payload)=>{
    //state 仓库|公共数据 payload携带的负载 payload有没有传递时，是undefined
    state.count+=payload;//mutations 不做业务,只负责突变state
  }
};

export default mutations;
```

```js
// src/store/getters.js

let getters = {
  count:(state)=>{
    //返回处理后的state  ~~ computed  
    return state.count % 2 === 0 ? state.count + '偶数': state.count + '奇数'
  }
};
export default getters;
```

**组件中使用**

```vue
<!--声明式 发送请求-->
<div @click="类型(负载)"></div>

<!--展示状态-->
<div>{{count}}</div>
<div>{{$store.state.count}}</div>
```

```js
import {mapActions, mapMutations,mapState,mapGetters} from 'vuex'
import store from './plugins/vuex.js';
export default {
  name: 'app',
  methods:{
    jia(){
      //编程式 发送请求
      store | this.$store.commit('类型',数据/负载/payload) //-> mutations
			store | this.$store.dispatch('类型',数据/负载/payload)  //-> actions
			store | this.$store.dispatch|commit({type:'类型',payload:负载}) // payload={}
    }
  }, 
  
  //mapActions 用来接管methods,返回一个对象
  methods:mapActions([
    'jia'
  ])
  
  //mapMutations 接管methods,跳过actions找mutations
  methods:mapMutations([
    'increment'
  ])
  
  methods:{
    ...mapMutations([//mapMutations 返回来一个对象
      'increment'
    ]),
    ...mapActions(['jia']),//mapActions 返回来一个对象
      
    show(){//组件内部methods
      ...
    }
  },
    
  //mapGetters接管computed，返回一个对象
  computed:mapGetters([
      'count'
  ]),
  
  computed:mapState([
      'count'
  ]),
  computed:{
    ...mapState([//mapState返回一个对象
      'count'
    ]),
    ...mapGetters([
      'count'
    ])
    
    count(){ //组件内容计算属性
      return this.$store.state.count % 2 === 0 ? 
        this.$store.state.count + '偶数'	: 
      	this.$store.state.count + '奇数'
    }
  }
}

```



**vuex融入到项目当中**

**创建types**：收藏vuex提交类型，便于后期修改，和一些types工具检查

**路由监听**：找一个不会被卸载组件，做数据观测（属性检测 watch），``commit`` 到``mutations``突变state.nav数据

**拦截器**：请求和响应前后，``commit``->``mutations``突变state.bLoading

**main.js获取本地token**

```js
// src/plugins/router.js

//同步localStorage 到 vuex  防止强刷
let local = window.localStorage.getItem('user');

if(local){
  store.commit('USER',JSON.parse(local))
}
```

**拦截器携带到后端校验**

每次发生请求，都要携带token到后端校验是否过期，拦截器携带从vuex中抓取token ，带在headers，成功返回对应接口的数据， 失败返回未登录的信息，拦截器负责前端路由的跳转

```js
// src/plugins/axios.js

//axios的封装
import axios from 'axios';
import Vue from 'vue';
import store from './vuex.js'
import router from './router.js'

// 添加一个请求的拦截
axios.interceptors.request.use((config) => {
	
  //抓取公共state的token
  let token = store.state.user.token;
  token = token ? token : '';
  config.headers = {
    'token': token
  }
  store.commit('LOADING', true)//控制loading显示
  return config;
  
}, function(error) {
  // 请求错误时做点事
  return Promise.reject(error);
});

//添加一个响应拦截
axios.interceptors.response.use(function(response) {
  store.commit('LOADING', false)
  
  //token过期: 返回值2,当前路由不是login时跳转 
  if (response.data.err == 2 && !router.currentRoute.fullPath.includes('/login')) {
    router.push({
      path: '/login',
      query: {
        path: router.currentRoute.fullPath// 携带当前路径，便于登录后返回，登录时需要同步vuex和localStorage
      }
    })
  }
  return response;

}, function(error) {

  return Promise.reject(error);
  
});

Vue.prototype.$axios = axios;
window.axios = axios;

export default axios;

```

### vuex的module

由于使用单一状态树，应用的所有状态会集中到一个比较大的对象。当应用变得非常复杂时，store 对象就有可能变得相当臃肿。

为了解决以上问题，Vuex 允许我们将 store 分割成**模块（module）**。每个模块拥有自己的 state、mutation、action、getter

```js
// src/plugins/vuex.js
import goods from '../store/modules/goods.js'
import detail from '../store/modules/detail.js'

let store = new Vuex.Store({
  state,actions,mutations,getters,//根作用域
  modules:{//模块作用域
    goods,detail
  }
});
```

```js
//src/store/modules/goods.js
const state={
  list:[]
};

const actions={
  A_GOODS_LIST({dispatch,commit,getters,state,rootState,rootGetters},payload){
    //state,getters 为模块内部，局部
    commit('M_GOODS_LIST',payload)//  局部化访问模块内部
    dispatch('jia',payload,{root:true})//访问根 dispatch 或 commit
    dispatch('模块名/类型',payload)//模块访问模块
  },
  GLOBAL_A_JIA:{//模块注册全局 action
    root:true,
    handler({dispatch,commit,getters,state,rootGetters,rootState},payload){
      ...
    }
  }
};
const mutations={
  M_GOODS_LIST(state,payload){
    state.list=payload;//state是局部
  }
};
const getters={
  G_GOODS_LIST(state,getters,rootState,rootGetters){
    return '处理后的'+state.list
  }
};

export default{
  namespaced:true,//命名空间的模块。模块内部直接调用，外部需要命名空间(见组件)
  state,actions,mutations,getters
}

```

```vue
//xx.vue
<template>
  <div id="app">
    <button @click="show">goods请求</button>
    <button @click="A_GOODS_LIST(5)">发送goods模块下的actions请求</button>
    <button @click="M_GOODS_LIST(5)">goods模块下的mutations请求</button>
    <br>
    goods模块下的getters属性: {{G_GOODS_LIST}}
    <br>
    goods模块下的state数据: {{$store.state.goods.list}}/{{list}}
    <br>
    <button @click="GLOBAL_A_JIA(3)">调用模块内部的全局actions</button>
  </div>
</template>

<script>

import { mapGetters, mapActions, mapMutations, mapState,createNamespacedHelpers } from 'vuex'
//const { mapState, mapActions } = createNamespacedHelpers('模块名')
//使用 createNamespacedHelpers 创建基于某个命名空间辅助函数
export default {
  methods: {
    ...mapActions(['jia', 'jian', 'odd', 'yibu','GLOBAL_A_JIA']),//GLOBAL_A_JIA定义在模块内的全局actions
    ...mapActions('goods', ['A_GOODS_LIST']),//调用模块，添加了goods的命名空间
    ...mapMutations(['increment']),//全局
    ...mapMutations('detail', ['M_DETAIL_LIST']),//模块内部
    show () { 
      this.$store.dispatch('goods/A_GOODS_LIST', 12)//调用模块内部
      this.$store.commit('goods/M_GOODS_LIST', 12)
      this.$store.commit('increment', 12)//调用根
    },
    
  },
  computed: {
    ...mapGetters(['getCount']),//根
    ...mapGetters('goods', ['G_GOODS_LIST','type2']),//模块
    ...mapState(['count']),//根
    ...mapState('goods',['list']),//模块
    
    //createNamespacedHelpers
    ...mapState({
      a: state => state.a, //抓取模块内部的state.a作为当前组件的a属性使用
      b: state => state.goods.b
    })
  },

  components: {
  }
}
</script>
```

### mutations无引用负载

actions内部要传给mutations的负载(payload),不可以是源state的引用，否则有时会出现非响应式情况，如**购物车**

### 组件懒加载

让路由配置时所指向的组件，无需一开始就加载到app.js，而是分块到不同的js文件，在路由访问时加载对应组件(js)，减少首屏压力，其原理是利用webpack对代码进行分割，异步调用组件，所以组件懒加载又叫异步路由、分片(块)打包、code splitting、异步组件

**webpack分片打包支持的语法**

```js
import(目标组件地址).then(res=>res是加载后的组件)
require([组件1,组件2],response)  response=加载结果 需要传入
```

**vue路由配置**

```js
// src/plugins/router.js

- import Home from 'xxx'
+ const home =()=>import(/* webpackChunkName: "groupname-home" */ "../components/home.vue");

//或者

{
  path:'/home',
  component:(r) => { require(['../components/home.vue'],r) }  | home
},
```

> webpackChunkName: "groupname-home" 给块命名 | 同名会拆到一个块，可减少请求次数
>
> 在cli2里需要注意
>
> ​	import() 导入 需要安装 babel-plugin-syntax-dynamic-import
>
> ​	配置 babelrc  "plugins": ["syntax-dynamic-import"]
>
> 组件内部注册异步组件会按照要求到对应的js里面
>
> 组件内部同步注册组件会打包到app.js

**vue打包后的片名**

```js
//修改片名，需要修改 webpack 配置

//vue-cli1 、 2 
//src/build/webpack.prod.conf.js
  output:
        chunkFilename:'chunks/[name]-[chunkhash:8].js',//build之后的代码更便于识别

//vue-cli3 、 4  ***
//vue.config.js
    output:
        chunkFilename:'chunks/[name]-[chunkhash:8].js',//build之后的代码更便于识别
```

