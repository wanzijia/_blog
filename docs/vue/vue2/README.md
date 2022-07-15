# vue2

[vue2 官方文档](https://cn.vuejs.org/)

## Vue.js 基础

vue的使用，简单理解，new出来一个Vue的实例，传一堆配置参数，控制一片html
```html
<script src="vue"></script>
<body>
  V
  <div id="app">
    要被控制的html{{key}}
  </div>
</body>
<script>
	let vm = new Vue({
    el:'#app'  //要控制的那片html代码
    data:{key:value}//数据  M
  })
</script>
```

### vue.js 引入
我们可以通过多种方式引入 vue ，这里来详细的进行对比：
1. 直接引用 vue.js ，适合小型项目或部分使用 vue
   1. 引用全部 vue.js，运行时编译及渲染
   2. 引用部分 vue.js，仅引入渲染部分
2. 使用 vue-cli 工程化启动整体 vue 项目

### 数据绑定

**插值表达式**

{{``数据名``}}	mustache语法   声明式渲染

**指令**

`v-text="数据名"`

`v-html="数据"`	非转义输出

**属性**

`v-bind:html属性="数据"`	属性值动态化
		`:html属性="数据"`  简写   

 `v-bind:[属性名]="数据"`	属性名动态化

### 列表渲染

把数据指定到一些dom中去渲染，推荐操作的数据类型：变量数组、对象、字符、数字

```html
<li v-for="值 in 数据">{{值}}</li>
<li v-for="值 of 数据">{{值}}</li>
<li v-for="(值,索引) in 数组">{{值}}/{{索引}}</li>
<li v-for="(对象,索引) in/of 数组">{{对象.key}}/{{索引}}</li>
<li v-for="(值,键) in 对象">
<li v-for="(数,索引) in 数字">
<li v-for="(单字符,索引) in 字符">
```

> 空数组，null，undefined不循环

### 条件渲染

一段dom可以根据数据有条件的渲染，使用指令`v-show`，或者`v-if`,对应的值是布尔

```html
<div v-show="true">box1</div>
<div v-if="false">box2</div>
```

`v-show` VS `v-if`

|          | v-show="布尔" | v-if="布尔"    |
| -------- | ------------- | -------------- |
| 区别     | 操作css       | 操作dom        |
| 场景     | 适合频繁切换  | 适合不频繁切换 |
| 性能消耗 | 初始渲染消耗  | 频繁切换消耗   |

### 事件绑定

vue通过`v-on`指令绑定事件，处理函数，需要丢到一个`methods`选项当中去

```html
<button v-on:不带on的元生事件名="方法"..
<button	@事件名="方法"	...
<button	@事件名="方法(参数)" .....
<button	@事件名="方法($event,参数)"	.....
```

> 事件名 不带on

```js
new Vue({
  methods:{
    方法:function(ev,参数){业务}
    方法2(ev,参数){业务}
  }
})
```

> ev 事件对象，参数可以有多个
>
> **注意**：vue提供的选项的值如果是函数时，不可用箭头函数  , 会造成this丢失

### 双向绑定

视图控制数据，数据也可控制视图,可通过属性+事件绑定实现，也可以使用系统指令`v-model`,这个指令可以用在能生产数据的表单元素上

```html
<input type="text" :value="data数据" v-on:input="checkIptValue">
<input type="text" v-model="data数据">
```
 
### 非响应式情况

**情况要发生**

- 对数组使用了 非变异 (non-mutating method) 方法（返回的了新数组）
- 修改数组的长度时
- 修改数组索引上的值（根索引)
- 给对象添加了不存在的属性

**问题还是要解决**

Vue.set(数组, index, value)

vm|this.$set(对象, key, value)

this.$forceUpdate()  强制刷新

this|vm.$mount('...')

**吃亏后的经验**

不要修改数组的根键,不要修改数组的长度,数据一开始都要声明在data选项内部，不要对数组使用非变异的api

### key的问题

给指定循环的dom一个key 是数据的id，确保key唯一性，避免数据错乱导致的视图问题,同时提供性能优化

### 模板表达式

在dom里面插入数据，数据周围可以出现表达式，但不是语句，如"{{`数据+表达式`}}"	``v-指令="数据+表达式"``

表达式:

```js
title + 'abc'
`${title}呵呵哒` 
bl ? '处' : '非处'
'i love you'.split(' ').reverse().join(' ')
```

### 计算属性

是一个函数,所依赖的元数据变化时，会再次执行，平时会缓存，是响应式的，需要在模板中渲染才可调用

**语法**

```js
//定义
computed:{
    计算属性: function(){return 返回值}		
}

//使用
使用:	{{计算属性}} |  v-指令="计算属性"
```

**computed	VS 	method**

| method             | computed                       |
| ------------------ | ------------------------------ |
| 方法会每次调用     | 基于它们的响应式依赖进行缓存的 |
| 一般               | 性能高                         |
| "{{`methodname()`}}"   | "{{`computedname`}}"      |
| 适合强制执行和渲染 | 适合做筛选                     |


### 属性检测

需要在数据变化时执行异步或开销较大的操作时，而计算属性是同步的，这个时候需要属性检测watch

定义一个选项

```js
watch:{
  数据名:'method函数名'    //数据名==data的key
  数据名:函数体(new,old){}
  数据名:{
    handler:fn(new,old){},
    deep: true //深度检测
    immediate: true //首次运行
  }
}
```

**计算属性 VS 函数 VS 属性检测**

|              | 计算属性 | 函数 | 属性检测 |
| ------------ | -------- | ---- | -------- |
| 依赖模板调用 | √        | -    | ×        |
| 是否缓存     | √        | ×    | ×        |
| 异步         | ×        | √    | √        |

### 样式操作

操作样式，就是属性绑定，只不过绑定的属性是class和style

**绑定姿势**

```js
<div v-bind:class="数据|属性|变量|表达式"></div>
<div :class="数据|属性|变量|表达式"></div>

<div v-bind:style="数据|属性|变量|表达式"></div>
<div :style="数据|属性|变量|表达式"></div>
```

**属性值的类型支持**

字符/对象 / 数组

```js
<div class="active t1"></div>
<div :class="'active t1'"></div>
<div :class="{active:true,t1:false}"></div>
<div :style="[{css属性名:值},{'xx-xx-xx'：值}]"></div>
```

### 指令

扩展了html语法功能,区别了普通的html属性，vue系统自带了指令，也可自定义指令来扩展，所有系统指令在官方文档的[API](https://cn.vuejs.org/v2/api/)处提供

### 其他系统指令

**v-pre**

保留字不编译，原样输出，跳过这个元素和它的子元素的编译过程。可以用来显示原始 Mustache 标签。跳过大量没有指令的节点会加快编译

**v-cloak**

防闪烁，模板没编译完，电脑配置差，有可能会看到{{}}，体验不佳，不如用css先隐藏，之后再显示，包括被包裹的子元素

**v-once**

只渲染元素一次。随后的重新渲染被忽略，包括被包裹的子元素。这可以用于优化更新性能

### 自定义指令

系统指令在不够用的情况下，考虑自定义，指令是个函数|对象,用来操作dom的, 里面的this 返回window

**全局定义**

```js
Vue.directive('指令名',函数(el,binding){})
```

> 指令名: 不带v-  
> el: 使用指令的DOM元素  
> binding: 是个对象 含有调用指令时传入的 参数

**局部定义**

```js
new Vue({
	directives:{
    指令名: function(el,binding){},//简写方式: bind + update
  	指令名(el,binding){},
    指令名:{
        inserted:fn(el,binding){}		//绑定指令的元素插入到父节点时调用  v-focus
        bind:fn	//指令第一次绑定到元素时调用	v-drag
        update:fn	//指令所在的元素的model层的数据，view有更新请求时
        componentUpdated:fn	//更新完成时
    }
  }
})
```

### 过滤器
无上下文(没有this)
对数据在模板中的表现过滤，符合预期，比如数据是0和1，想要表现成对错、成功失败、男女，数据需要过滤器来格式化，vue1.x版本有系统自带过滤器，vue2.x之后完全需要自定义，没有自带过滤器

**使用**

```js
{{数据名 | 过滤器名(参数2,参数3)}}
:属性="数据| 过滤器名(参数2,参数3) "
v-指令名="数据 | 过滤器"
```

[^|]: 管道符

**全局定义**

```js
Vue.filter('过滤器名称',函数(要过滤的元数据,参数2,参数3,n){ return 过滤后的值})
```

**局部定义**

```js
filters:{
  过滤器名称:函数(要过滤的元数据,参数){}	//函数必须要有返回值
}
```

### 组件通讯基础
#### 逐层传递
##### 父子（props）

父组件通过**属性绑定**，子组件通过选项props接收,props是响应式的，props完成单向下行绑定  

**父传**
```html
<!-- <子 :自定义属性="父数据"></..> -->
```

**子收**
```html
<!-- props:['自定义属性']
props:{自定义属性:{type/default/required/validator...} }

<div>
  {{自定义属性}}
</div> -->
```

> 注意: 
>
> ​	props是只读的,不推荐改
>
> props命名:
>
> ​	props: ['postTitle']
> ​	``<xx :post-title="hello!"></xx>``

###### **$parent**

```js
 //子模板: 
$parent.父数据

//子js: 
this.$parent.父数据
```

> 使用场景: 通用组件（紧耦合)


##### 子父

通过**自定义事件**实现，给子组件绑定自定义事件，子组件触发自定义事件时传递，事件函数是父组件方法，父方法负责接收  

**父绑定父接收**
```vue
<template>
	..
	<子 @自定义事件="父方法"></..>
	..
</template>
<script>
export default {
  methods:{
    父方法(接受数据){
      处理....
    }
  }
}
</script>
```

**子触发子传递**
```vue
<script>
	this.$emit('自定义事件',子.数据名)
</script>
```

###### **$children**

```js
// 父组件
this.$children[索引].数据|方法
```

> 使用场景: 通用组件（紧耦合)

###### **$ref**

引用元素（dom，组件<类，函数>）  

```js
//父 template
<son ref="自定义子名称"></son>
<div ref="自定义子名称">
</div>

//父 script
 this.$refs.自定义子名称.数据名
 this.$refs.自定义子名称.方法()
```

> $refs 只会在组件渲染完成之后生效，并且它们不是响应式的,避免在模板或计算属性中访问 $refs

##### 兄弟

兄弟A->**自定义事件**->中间人(父)->**props**->兄弟B

##### 路由

params,query

#### 越层传递

##### $attrs/$listeners

假设A>B>C三个组件关系，A传递给C，越过中间的B，A作为祖先一定要传递(属性绑定)，C作为后代一定要接受(props)，中间层所有的组件值负责做二传手的动作,如下

```vue
<com v-bind="$attrs" v-on="$listeners"></com>
```
当父组件传数据给子组件的时候，如果子组件的props没有进行接收，那数据就会被收集到子组件的$attrs里面，在子组件上使用v-bind="$attrs"可以直接将值传给当前组件的子组件（也就是孙组件）
> $attrs里面包含了所有上层组件传递过来的属性
> 		$listeners 里面包含了所有上层组件传递过来的事件
>
> $attrs 如果中间层组件没有接受props,给c的是所有props
> 		$listeners 所有中间层组件+后代组件都可触发

##### provide/inject

祖先组件中通过provide来提供变量，然后在子孙组件中通过inject来注入变量

```js
//祖先组件
export default {
  data(){
    return {数据}
  },
  provide: {
    name: '浪里行舟'
    name2: this.data数据
  }
}

//孙组件
export default {
  inject: ['name'],
  mounted () {
    console.log(this.name);  // 浪里行舟
  }
}
```

> 使用场景：为高阶插件/组件库提供用例
>
> provide 和 inject 绑定并不是可响应的。这是刻意为之的。然而，如果你传入了一个可监听的对象，那么其对象的属性还是可响应的


#### 集中式管理

##### 订阅发布模式

##### 第三方库

如：pubsub

##### 公共总线

利用一个空vue实例的事件订阅和发布api实现

```js
//src/main.js
const bus = new Vue()
export default bus;

//组件内部
import bus from '...';
bus.$emit('事件',数据) //发布
bus.$on('事件',(接){处理})	//订阅
bus.$off('事件')	//取消订阅
```

##### $root
把数据存到根实例的data选项，其他组件直接修改或者使用

**定义**

```js
new Vue({
  data:{a:1}
})
```

**使用**

```js
//子组件内部
this // 组件本身
this.$root // vm
this.xx //组件内部数据
this.$root.a //根实例数据
```

##### web存储

通过把数据存储在客户端浏览器本地的行为，cookie，localstroge，session

##### 状态管理

在浏览器下层，应用上层，打造一个全局变量，利用vuex插件管理

##### 数据库

利用本地，或者远端的数据库存储

#### 永久与临时

**永久存储**

存库 , web/本地存储(localstroge,cookie),后端文件存储(writeFile)

**临时存储**

状态管理,订阅发布模式,公共总线(vue),$root(vue)

## vue进阶用法

### 特征一：模板化

#### 插槽

1. 默认插槽
组件外部维护参数以及结构，内部安排位置

```vue
<!-- 父组件调用 -->
<template>
  <div id="app">
    <hello-world>
      <p>{{ msg }}</p>
    </hello-world>
  </div>
</template>

<!-- 子组件 HelloWorld.vue -->
<template>
    <div class="hello">
    <slot></slot> <!-- p标签 被放在了这个位置 -->
  </div>
</template>
```

2. 具名插槽
以name标识插槽的身份，从而在组件内部做到可区分

```vue
<!-- 父组件调用 -->
<template>
  <div id="app">
    <hello-world>
      <template v-slot:header>{{ header }}</template>
    </hello-world>
  </div>
</template>

<!-- 子组件 HelloWorld.vue -->
<template>
  <div class="hello">
    <slot name="header"/> 
  </div>
</template>
```
3. 作用域插槽
slot-scope（2.6 before）
v-slot(after)
外部做结构描述勾勒，内部做传参
```vue
<!-- 父组件调用 -->
<template>
  <div id="app">
    <hello-world>
      <template slot="content" slot-scope="{ slotProps }">
        {{ slotProps }}
      </template>
    </hello-world>
  </div>
</template>

<!-- 子组件 HelloWorld.vue -->
<template>
  <div class="hello">
      <!-- 老版 -->
    <slot name="content" :slotProps="slotProps"></slot>
      <!-- 新版 -->
    <template v-slot:slotProps="slotProps">
      {{ slotProps }}
    </template>
  </div>
</template>
```

#### 模板数据的二次加工
1. watch、computed => 相应流过于复杂（computed赋值）
2. 方案一：函数 - 独立、管道 / 无法响应式
   方案二：v-html 
   方案三：过滤器 - 追问：无上下文
```js
{{ time | format }}
```

#### jsx 更自由的基于js书写
* 1. v-model 如何实现 => 双向绑定 => 外层bind:value，内层@input
* 2. 写jsx的好处、劣势 => vue的编译路径：template->render->vm.render->vm.render() diff => 可以使用性能优化方案

### 特征二：组件化
#### 传统模板化
```js
    Vue.component('component', {
        template: '<h1>组件</h1>'
    })
    new Vue({
        el: '#app'
    })
    // functional components
```
* 1. 抽象复用
* 2. 精简 & 聚合


#### 混入mixin - 逻辑混入
* 1. 应用： 抽离公共逻辑（逻辑相同，模板不同，可用mixin）
* 2. 缺点： 数据来源不明确
* 3. 合并策略
    a. 递归合并
    b. data合并冲突时，以组件优先
    c. 生命周期回调函数不会覆盖，会先后执行，优先级为先mixin后组件

#### 继承拓展extends - 逻辑拓展
* 1. 应用： 拓展独立逻辑
* 2. 与mixin的区别，传值mixin为数组
* 3. 合并策略
    a. 同mixin，也是递归合并
    b. 合并优先级 组件 > mixin > extends
    c. 回调优先级 extends > mixin

#### 整体拓展类extend
从预定义的配置中拓展出来一个独立的配置项，进行合并

#### Vue.use - 插件
* 1. 注册外部插件，作为整体实例的补充
* 2. 会除重，不会重复注册
* 3. 手写插件
    a. 外部使用Vue.use(myPlugin, options)
    b. 默认调用的是内部的install方法

#### 组件的高级引用
* 1. 递归组件 - es6 vue-tree
* 2. 动态组件 - <!-- <component :is='name'></component> -->
* 3. 异步组件 - router

#### 事件高级

**绑定行间事件**

```Vue
<template>
  <div v-on:事件名="方法名($event,参数)"></div>
  <div @事件名="方法名($event,参数)"></div>
</template>
```

**自定义事件**

```vue
<template>

//绑定
vm|组件.$on( '自定义事件名'|['自定义事件名1','自定义事件名2'], 回调(参数) )
<自定义组件  v-on:自定义事件="函数" />
<自定义组件  @自定义事件="函数" />

//销毁
vm|this.$off( '自定义事件名'|['自定义事件名1','自定义事件名2'])

//触发
vm|this.$emit(自定义事件名,参数)
</template>
```

> 自定义事件名：	使用 kebab-case 的事件名
>
> 只有被绑定方才可以触发
>
> 自定义的组件 触发原生事件需要native修饰符

**事件对象**

事件对象可以不传递，需要传递的场景，传参数同时使用事件对象时，如：``show($event,参数)``

**阻止冒泡**

```js
// ev|e.cacelBubble=true //属性
// ev.stopPropagation() //api
// <div @click.stop="函数“ /> //修饰符
```

**默认行为**

```js
// e|ev.preventDefault();   
// <div @事件名.prevent="函数" />
```

**修饰符连缀**

```vue
<template>
  <div @事件.prevent.stop="..."></div>    排名分先后
</template>
```

#### 修饰符

**事件修饰符**

```vue
<template>
  <div @click.修饰符="函数"></div>
            .capture 		使用事件捕获模式
            .self				点到时才触发，不是从内部元素触发的
            .once  			只会触发一次
            .passive 		onScroll事件 结束时触发一次，不会频繁触发，移动端使用
            .sync 				接受props被修改，实现表单之外的元素双绑
  <!-- 父组件 -->
  <son :title.sync="父数据"></text-document>

  <!-- 子组件 -->
  this.$emit('update:title', newTitle)//通知父去修改title的数据==newTitle
</template>
```

**按键修饰符**

```html
<!--普通键-->
<div @keyup.修饰符="函数"></div>
     			 .left 				上下左右
					 .enter				回车
					 .13  				可以使用键码

<!--系统键-->
<div @keyup.修饰符="函数"></div>
     			 .ctrl 				
					 .alt					
					 .shift  				
					 .exact  		严格		@键盘事件.修饰符1.修饰符2.exact    只有1+2才可触发 1+2+3不可以

<!--鼠标键-->
<div @mousedown.修饰符="函数"></div>
     			 .left 				
					 .right					
				 	 .middle	鼠标中键
```

**表单修饰符**

```html
<input v-model.修饰符="数据"></div>
		 	 v-model.number 	提取数子 
			 v-model.trim 		删除前后空格
			 v-model.lazy   	确认时才修改model数据
```

#### 动态组件

 组件动态化(数据化)，在不同组件之间进行动态切换,component自身不会渲染

```vue
<component is="组件名"></component>
<component :is="'组件名'"></component>
```

> 注意: 动态组件切换时候，会有挂载和卸载发生
>
> ​		  切换的组件，需要引入+注册

#### 缓存组件

keep-alive 包裹了目标组件，对目标组件缓存，后期不会触发卸载挂载，但会触发activated/deactivated
	keep-alive 不给属性时，默认内部出现过得组件，都会被缓存

```vue
<template>
  <keep-alive
    :include=['组件名','组件名2']  加入一部分
    :exclude=['组件名','组件名2']  排除一部分
    :max = "数字"   最多可缓存的组件数,一旦这个数字达到了，时间戳最早出现的被卸载(遗忘)
  >
    ..目标组件..
  </keep-alive>
</template>
```

> 组件钩子:
>
> ​	activated  活动组件  被缓存时起效果
> ​	deactivated 非活动组件,替代destroyed
>
> 缓存组件可以包裹哪些组件
>
> ​自定义普通组件、component系统组件，router-view第三方组件



#### 动画

vue动画通过系统组件 transition 和 transition-group来介入，谁做动画，就用此组件就包着谁，可以包的元素有dom，组件。

vue不渲染只声明逻辑的系统元素 有 template，keep-alive，component。

#### 实现方案

- css过渡动画transition，无跳变，关注打哪来1，到哪去4
- css帧动画animation，有跳变，关注来了停哪2，到哪去4
  - animate.css 帧动画库
  - vue-animate
- js控制dom完成动画
  - 第三方的js动画库,推荐 [Velocity](http://velocityjs.org/)
    - Velocity(el,{css属性},{配置})
  - $('div').animate({css属性},{配置属性})
  - move(el,{css属性},{配置属性})

#### transition

**组件属性**

```vue
<tansition
	name =  "动画名"
  mode="out-in|in-out"  前后场景进退次序

  enter-class = "类名"
  enter-active-class = "类名"
  leave-class = "类名"
  leave-active-class = "类名"
>
	...要做动画的元素...
</tansition>
```

**样式**

```html
<style>
  .动画名-enter{..}  入场前(打哪来)
  .动画名-enter-active{..} 入场后(来了停哪)
  .动画名-leave{..} 离场前
  .动画名-leave-active{..} 离开场后(到哪去)
</style>
```

**组件事件**

```vue
<tansition
	@before-enter="方法"   方法会接收做动画的元素(原生)
  @enter="方法"
  @after-enter="方法"
  @before-leave="方法"
  @leave="方法"
  @after-leave="方法"
>
	...要做动画的元素...
</tansition>
```

**velocity**

```vue
<template>
	...
	<tansition
    @before-enter="方法" 
    @after-enter="方法2"
  >
    ...要做动画的元素...
  </tansition>
	...
</template>
<script>
	export default {
    methods:{
      方法(el){//el==做动画的原生元素
        Velocity(el,{css属性},{配置})
      }
    }
  }
</script>
```

> 配置
>
> duration: 毫秒   事件
> 		easing: 动画类别 ''
> 		Queue
> 		complete:fn()
> 		progress:fn
> 		loop: 1 次  true无限
> 		delay: 毫秒 延时
> 		display:'none/block' 动画结束时是否可见
>
> leave(el,done){} 无缝动画 要加done

#### transition-group

一组元素做动画，transition-group 包着一组元素  ，每个元素要有key ，无key部动画，其他的用法同transition

#### 状态过渡

数据元素本身的动效

- 数字和运算

- 颜色的显示

- 元素的大小和其他的属性

  使用第三方库(TweenMax)来实现切换元素自身的过渡状态,具体查询 [官网](https://cn.vuejs.org/v2/guide/transitioning-state.html)

