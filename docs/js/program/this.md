## this
### 作用域链
```js
    let a = 'global';
    console.log(a);

    function course() {
        let b = 'zhaowa';
        console.log(b);

        session();
        function session() {
            let c = 'this';
            console.log(c);

            teacher();
            function teacher() {
                let d = 'yy';
                console.log(d);

                console.log('test1', b);
            }
        }
    }
    console.log('test2', b);
    course();

    if(true) {
        let e = 111;
        console.log(e);
    }
    console.log('test3', e)
```
* 1. 对于作用域链我们直接通过创建态来定位作用域链
* 2. 手动取消全局，使用块级作用域

### this 上下文context

> this是在执行时动态读取上下文决定的，而不是创建时

#### 函数直接调用中 - this 指向的是window => 函数表达式、匿名函数、嵌套函数

```js 
    function foo() {
        console.log('函数内部this', this);
    }

    foo();
```
### 隐式绑定 
- this的指向是调用堆栈的上一级 => 对象、数组等引用关系逻辑
```js
    function fn() {
        console.log('隐式绑定', this.a);
    }
    const obj = {
        a: 1,
        fn
    }

    obj.fn = fn;
    obj.fn();
```

```js
    const foo = {
        bar: 10,
        fn: function() {
            console.log(this.bar);
            console.log(this);
        }
    }
    // 取出
    let fn1 = foo.fn;
    // 执行
    fn1();

    // 追问1， 如何改变指向
    const o1 = {
        text: 'o1',
        fn: function() {
            // 直接使用上下文 - 传统分活
            return this.text;   
        }
    }

    const o2 = {
        text: 'o2',
        fn: function() {
            // 呼叫领导执行 - 部门协作
            return o1.fn();
        }
    }

    const o3 = {
        text: 'o3',
        fn: function() {
            // 直接内部构造 - 公共人
            let fn = o1.fn;
            return fn();
        }
    }

    console.log('o1fn', o1.fn());
    console.log('o2fn', o2.fn());
    console.log('o3fn', o3.fn());
```
* 1. 在执行函数时，函数被上一级调用，上下文指向上一级
* 2. or直接变成公共函数，指向window

#### 将console.log('o2fn', o2.fn())的结果是o2
```js
    // 1. 人为干涉，改变this - bind/call/apply
    // 2. 不许改变this
    const o1 = {
        text: 'o1',
        fn: function() {
            return this.text;
        }
    }

    const o2 = {
        text: 'o2',
        fn: o1.fn
    }

    console.log('o2fn', o2.fn());
    // this指向最后调用他的对象，在fn执行时，o1.fn抢过来挂载在自己o2fn上即可
```

### 显式绑定（bind | apply | call）
```js
    function foo() {
        console.log('函数内部this', this);
    }
    foo();

    // 使用
    foo.call({a: 1});
    foo.apply({a: 1});

    const bindFoo = foo.bind({a: 1});
    bindFoo();
```
### call、apply、bind的区别
- `call` 和 `apply` 都是为了解决改变 `this` 的指向。作用都是相同的，只是传参的方式不同。
- 除了第一个参数外，`call` 可以接收一个参数列表，`apply` 只接受一个参数数组

```js
let a = {
    value: 1
}
function getValue(name, age) {
    console.log(name)
    console.log(age)
    console.log(this.value)
}
getValue.call(a, 'yck', '24')
getValue.apply(a, ['yck', '24'])
```
> `bind` 和其他两个方法作用也是一致的，只是该方法会返回一个函数。并且我们可以通过`bind` 实现柯里化

### new - this指向的是new之后得到的实例
```js
    class Course {
        constructor(name) {
            this.name = name;
            console.log('构造函数中的this:', this);
        }

        test() {
            console.log('类方法中的this:', this);
        }
    }

    const course = new Course('this');
    course.test();
```
### 类中异步方法，this有区别吗
```js
    class Course {
        constructor(name) {
            this.name = name;
            console.log('构造函数中的this:', this);
        }

        test() {
            console.log('类方法中的this:', this);
        }
        asyncTest() {
            console.log('异步方法外:', this);
            setTimeout(function() {
                console.log('异步方法内:', this);
            }, 100)
        }
    }

    const course = new Course('this');
    course.test();
    course.asyncTest();
```
* 1. 执行setTimeout时，匿名方法执行时，效果和全局执行函数效果相同
* 2. 如何解决。箭头函数

### 手写bind,call,apply
```js
    // 1. 需求：手写bind => bind位置（挂在那里） => Function.prototype
    Function.prototype.newBind = function() {
        // 2. bind是什么? 
        const _this = this;
        const args = Array.prototype.slice.call(arguments);
        // args特点，第一项是新的this，第二项~最后一项函数传参
        const newThis = args.shift();

        // a. 返回一个函数
        return function() {
            // b. 返回原函数执行结果 c. 传参不变
            return _this.apply(newThis, args);
        }
    }

    Function.prototype.newCall = function (context) {
    var context = context || window
    // 给 context 添加一个属性
    // getValue.call(a, 'yck', '24') => a.fn = getValue
    context.fn = this
    // 将 context 后面的参数取出来
    var args = [...arguments].slice(1)
    // getValue.call(a, 'yck', '24') => a.fn('yck', '24')
    var result = context.fn(...args)
    // 删除 fn
    delete context.fn
    return result
    }

    Function.prototype.newApply = function(context) {
        // 边缘检测
        // 函数检测
        if (typeof this !== 'function') {
            throw new TypeError('Error');
        }
        // 参数检测
        context = context || window;

        // 挂载执行函数
        context.fn = this;

        // 执行执行函数
        let result = arguments[1]
            ? context.fn(...arguments[1])
            : context.fn();

        // 销毁临时挂载
        delete context.fn;
        return result;
    }
```
### 闭包
闭包指的是一个环境，利用作用域的嵌套，使内部作用域可以访问外部变量函数嵌套函数，内部获取到的函数变量不会被垃圾回收机制回收可能会造成内存泄露

#### 函数作为返回值的场景
```js
    function mail() {
        let content = '信';
        return function() {
            console.log(content);
        }
    }
    const envelop = mail();
    envelop();
```
* 函数外部获取到了函数作用域内的变量值


#### 函数作为参数的时候
```js
    // 单一职责
    let content;
    // 通用存储
    function envelop(fn) {
        content = 1;

        fn();
    }

    // 业务逻辑
    function mail() {
        console.log(content);
    }

    envelop(mail);
```

#### 函数嵌套
```js
    let counter = 0;

    function outerFn() {
        function innerFn() {
            counter++;
            console.log(counter);
            // ...
        }
        return innerFn;
    }
    outerFn()();
```

#### 事件处理（异步执行）的闭包
```js
    let lis = document.getElementsByTagName('li');

    for(var i = 0; i < lis.length; i++) {
        (function(i) {
            lis[i].onclick = function() {
                console.log(i);
            }
        })(i);
    }
```

#### 立即执行嵌套
```js
    (function immediateA(a) {
        return (function immediateB(b) {
            console.log(a); // 0
        })(1);
    })(0);
```

#### 当立即执行遇上块级作用域
```js
    let count = 0;

    (function immediate() {
        if(count === 0) {
            let count = 1;

            console.log(count);
        }
        console.log(count);
    })();
```

#### 拆分执行 - 关注
```js
    function createIncrement() {
        let count = 0;
        
        function increment() {
            count++;
        }

        let message = `count is ${count}`;

        function log() {
            console.log(message);
        }

        return [increment, log];
    }
    const [increment, log] = createIncrement();

    increment();
    increment();
    increment();
    log();
```

#### 实现私有变量
```js
    function createStack() {
        return {
            items: [],
            push(item) {
                this.item.push(item);
            }
        }
    }

    const stack = {
        items: [],
        push: function() {}
    }

    function createStack() {
        const items = [];
        return {
            push(item) {
                items.push(item);
            }
        }
    }
    // Vuex store
```
