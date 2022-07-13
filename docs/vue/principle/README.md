## VUE3
vue3 的数据响应与劫持是基于现代浏览器所支持的代理对象 Proxy 实现的

```js
const initData = { value: 1 }; 
const proxy = new Proxy(
  initData, // 被代理对象
  { // handler  
    get(target, key) {
      // 进行 track
      return target[key];
    }
    set(target, key, value) {
    // 进行 trigger 
    return Reflect.set(target, key, value); 
  } 
}); 
// proxy 即直接我们代码中直接访问与修改的对象， 
// 也可称为响应式数据（reactive/ref）
```