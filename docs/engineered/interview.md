# 面试题整理
## 数组长度未知的情况下，拿到最后一项
```js
let first = arr => arr[0];
let reverse = arr => arr.reverse();

let last = compose(first, reverse);

last([1, 2, 3, 4, 5]); // 5
```
## 如何本地项目去做一些多端口服务的代理转发
    Proxy代理  dev-server里proxy的配置

## 如何利用webpack去做依赖锁定
    锁依赖 固定版本  script标签（xxx.2.2.0）

## 静态文件的移动&赋值
    copyWebpackPlugin插件，可以移动static中的文件  
    ex：假设static里有asset，有图和icon，可以把icon单独移动到其他文件中。