# 前端工程化

> [webpack中文文档](https://www.webpackjs.com/concepts/)

## 了解前端工程化的内容
> webPage页面 =>  webApp应用
>> 前端工程化
>>> 技术选型： Vue、 React、 element、 ant、 ui组件库  
>>> 统一规范： eslint、 husky  
>>> 测试，部署，监控： ut、e2e、mock  
>>> 性能优化： lazy、module  
>>> 模块化重构： SPA、多页、多trunk  
满足前端工程化的工具 - webpack

## npm run dev过程
![ts原理图](/data/webpack-run-dev.png)  
    
## 熟悉webpack常用配置项

## JS函数式编程

### 特点
1. Vue3 React16.8 全面化函数式的推动
2. 函数式编程可以使得代码单元相对更加独立 - tree shaking过程更顺畅，更方便做Unit Test
3. 减少了对this的依赖，减轻了开发人员对于指向问题的困惑
4. js天生友好函数式：ramda、loadsh
### 概念
 1. 一种抽象运算过程
2. 函数式的函数并非对于过程运算，函数的映射
3. 幂等 - 相同的输入始终得到相同的输出
### 纯函数
```js
let arr = [1, 2, 3, 4, 5];

arr.slice(0, 3); // [1, 2, 3]
arr.slice(0, 3); // [1, 2, 3]

arr.splice(0, 3); // [1, 2, 3]
arr.splice(0, 3); // [4, 5]
```
对于系统的改造
```js
// 不纯的
let min = 18;
let limit = age => age > min;

// 纯纯的
let limit = age => age > 18;
```
对于大型系统来说，对于外部状态的依赖，会大大的提高系统复杂性
* 问题：
18被硬编码到了函数内部的，造成了功能拓展的局限

### 高阶函数HOC
定义：
>1. 函数作为参数被传递到另一个函数中
>2. 函数作为返回值被另外一个函数返回

```js
    let fn = arg => {
        let outer = "outer";
        let innerFn = () => {
            console.log(outer);
            console.log(arg);
        }
        return innerFn;
    }

    let closure = fn(18);
    // 闭包
```
### 函数柯里化
> 传递给函数一部分参数用于功能调用，让他返回一个函数去处理剩下的参数

```js
    let add = (x, y) => x + y;

    // 柯里化后
    let add = x => (y => x + y);

    let add2 = add(2);
    let add200 = add(200);

    add2(2); // 2 + 2 add(2)(2)
    add200(50); // 200 + 50

    // 回到上面的limit， 纯函数化
    let limit = min => (age => age > min);
    let limit18 = limit(18);
    limit18(20); // true
```
> 是一种预加载方式
* 问题
包心菜代码的产生h(g(f(x)));

### 组合
> 通过更优雅的方式实现纯函数的解耦

```js
let compose = (f, g) => (x => f(g(x)));

let add1 = x => x + 1;
let mul5 = x => x * 5;

compose(mul5, add1)(2); // 15

// 面试题 - 数组长度未知的情况下，拿到最后一项
let first = arr => arr[0];
let reverse = arr => arr.reverse();

let last = compose(first, reverse);

last([1, 2, 3, 4, 5]); // 5
```
## 性能优化

1. 视图渲染 
   - ...
2. 代码 | 结构 
   -  tree-shaking
   -  模块懒加载 vue-router + trunk 
   -  noParse
   -  webpack升级 5 比起 4 和 3提升了性能
3. 网络
   - ..