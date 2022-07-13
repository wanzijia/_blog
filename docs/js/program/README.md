# ES6
[[toc]]

## Generator

### 迭代器 Iterator

迭代器Iterator 是 ES6 引入的一种新的遍历机制，同时也是一种特殊对象，它具有一些专门为迭代过程设计的专有接口。

每个迭代器对象都有一个next()方法，每次调用都返回一个当前结果对象。当前结果对象中有两个属性：

1. value：当前属性的值

2. done：用于判断是否遍历结束，当没有更多可返回的数据时，返回true

每调用一次next()方法，都会返回下一个可用的值，直到遍历结束。

### 生成器 Generator

生成器是一种返回迭代器的函数，通过function关键字后的星号(*)来表示，函数中会用到新的关键字yield。星号可以紧挨着function关键字，也可以在中间添加一个空格.


```js
function* generator() {
    const list = [1, 2, 3];
    for (let i of list) {
        yield i;
    }
}


let g = generator();

console.log(g.next()); // {value: 1, done: false}
console.log(g.next()); // {value: 2, done: false}
console.log(g.next()); // {value: 3, done: false}
console.log(g.next()); // {value: undefined, done: true}
``` 
### 特性

1. 每当执行完一条yield语句后函数就会自动停止执行, 直到再次调用next();
2. yield关键字只可在生成器内部使用，在其他地方使用会导致程序抛出错误;
3. 可以通过函数表达式来创建生成器, 但是不能使用箭头函数
    `let generator = function *(){}`

### 封装一个函数, 让generator自动执行到完毕

```js
function longTimeFn(time) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(time);
        }, time);
    })
};

function asyncFunc(generator) {
    const iterator = generator(); // 接下来要执行next
    // data为第一次执行之后的返回结果，用于传给第二次执行
    const next = (data) => {
        const {
            value,
            done
        } = iterator.next(data); // 第二次执行，并接收第一次的请求结果 value 和 done

        if (done) return; // 执行完毕, 直接返回
        // 第一次执行next时，yield返回的 promise实例 赋值给了 value
        value.then(data => {
            next(data); // 当第一次value 执行完毕且成功时，执行下一步(并把第一次的结果传递下一步)
        });
    }
    next();
};

asyncFunc(function* () {
    let data = yield longTimeFn(1000);
    console.log(data);
    data = yield longTimeFn(2000);
    console.log(data);
    return data;
})
```
## 箭头函数
```js
    // Es6
    const test3 = (a, b) => {
        return a + b;
    }
    const test3 = (a, b) => a + b;
    const test4 = x => {
        // content
    }
    cosnt test5 = () => {
        // ...
    }
```
### 上下文
> 上下文形成的原因 箭头函数并不会形成独立上下文，内部this指向了window
```js
    // ES6
    const obj2 = {
        teacher: 'yy',
        leader: 'xk',
        zhuawa: ['hxy', 'bb'],
        getTeacher: function() {
            console.log('teacher is:', this.teacher);
            return this.teacher;
        }
        getLeader: () => {
            console.log('leader is:', this.leader);
            return this.leader;
        }
    }
```
### 场景
#### 场景1：dom操作cb时
```js
    const btn = document.querySelector('#btn');

    btn.addEventListener('click', function() {
        this.style.color = '#fff';
    });
```

#### 场景2：类操作
```js
    // 箭头函数无法成为完整构造类
    function Obj(teacher, leader) {
        this.teacher = teacher;
        this.leader = leader;
    }

    const Obj = (teacher, leader) => {
        this.teacher = teacher;
        this.leader = leader;
    }

    // 实例验证
    const o1 = new Obj('yy', 'xk');
    console.log(o1);

    // 箭头函数无法构造原型方法
    Obj.prototype.learn = function() {
        console.log(this.teacher, this.leader);
    }
    Obj.prototype.learn = () => {
        console.log(this.teacher, this.leader);
    }
```

### 箭头函数的参数特性 - 无法使用arguments
```js
    const test = function(teacher) {
        console.log(arguments);
    }

    const test = teacher => {
        console.log(arguments);
    }
```

## const 常量标识
```js
    const LIMIT = 10;
    cosnt OBJ_MAP = {
        a: 'A',
        A: 'a'
    };
    // 5 => VI
    // VI => 5
    const QUEUE = [1, 2, 3, 5, 6];
```
### 1. 不允许重复声明赋值
```js
// 变量重新赋值
var arg1 = 'yy';
arg1 = 'xk';

// 常量
// ES5
Object.defineProperty(window, 'arg2', {
    value: 'yy'，
    writable: false
})
arg2 = 'xk';

// ES6
const arg3 = 'yy';
arg3 = 'xk';

// const不允许重复声明
const arg3 = 'yy';
const arg3 = 'yy';
```

### 2. 块级作用域
```js
    if(true) {
        var arg1 = 'yy';
    }
    console.log('arg1', arg1);

    if(true) {
        const arg2 = 'yy';
    }
    console.log('arg2', arg2);
    // 变量提升 + 块级作用域
```

### 3. 无变量提升
```js
    console.log(arg1);
    var arg1 = 'yy';

    // 相当于
    var arg1;
    console.log(arg1);
    arg1 = 'yy';

    // 无变量提升 - 先声明再使用
    console.log(arg2);
    const arg2 = 'yy'; // not defined
```

```js
    // 非全局作用域

    var arg1 = 'yy';
    console.log(window.arg1);

    // const不在window中
    const arg1 = 'yy';
    console.log(window.arg1);
```

### 4. dead zone
```js
    if(true) {
        console.log(arg1);
        var arg1 = 'yy';
    }
```

### 5. let or const
* 引用型 const
```js
    const obj = {
        teacher: 'yy',
        leader: 'xk'
    }
    obj.leader = 'bb';

    const arr = ['yy', 'xk'];
    arr[0] = 'aaaa';

    // 引用类型的原理 - 指向地址
    // 追问 破局 - object.freeze()
    object.freeze(obj);

    const obj2 = {
        teacher: 'yy',
        leader: 'xk',
        zhuawa: ['hxy', 'bb']
    }
     object.freeze(obj2);
     obj2.zhuawa[0] = 'yy';

    // freeze只能冻结根层，嵌套引用类型需要遍历递归
    // 面试题目
    function deepFreeze() {
        // 2. 确定主执行步骤
        Object.freeze(obj);
        // 3. 逐级深入
        (Object.keys(obj) || []).forEach(key => { // for in - hasOwnProperty
            let innerObj = obj[key];
            
            if (typeof innerObj === 'object') {
                // 1. 递归模式确定
                deepFreeze(innerObj);
            }
        })
    }
    // lodash: clone deepclone equal deepequal
```

## class 助力js更面向对象 - 类
```js
    // 传统对象 - function
    function Course(teacher, course) {
        this.teacher = teacher;
        this.course = course;
    }

    Course.prototype.getCourse = function() {
        return `teacher is:${this.teacher}, course: ${this.course}`
    }

    const course = new Course('yy', 'ES6');
    course.getCourse();

    // Es6
    class Course {
        // init 实例会默认执行
        constructor(teacher, course) {
            this.teacher = teacher;
            this.course = course;
        }

        // 拓展方法
        getCourse() {
            return `teacher is:${this.teacher}, course: ${this.course}`;
        }
    }
    const course = new Course('yy', 'ES6');
    course.getCourse();
```


### class的类型是？
```js
    console.log(typeOf Course); // function
```

### class的prototype
```js
    console.log(Course.prototype); // 有区分，但本质类型相同
```

### class & 函数对象 属性
```js
    console.log(course.hasOwnProperty('teacher')); // true
```

### 属性定义 构造器 & 顶层定义 两种定义方式
```js
    class Course {
        // init 实例会默认执行
        constructor(teacher, course) {
            this.teacher = teacher;
            this.course = course;
        }

        // 拓展方法
        getCourse() {
            return `teacher is:${this.teacher}, course: ${this.course}`;
        }

        get teacher() {
            // 留有空间
            return this.teacher;
        }

        set teacher(val) {
            // 留有空间
            this.teacher = val;
        }
    }

    // 意义何在？
    // 1. js如何建立只读变量
    class Course {
        // init 实例会默认执行
        constructor(teacher, course) {
            this._teacher = teacher;
            this.course = course;
        }

        // 拓展方法
        getCourse() {
            return `teacher is:${this.teacher}, course: ${this.course}`;
        }

        get teacher() {
            // 留有空间
            return this._teacher;
        }
    }
    // 修改只读变量，会报错么 - 无法改变但是不会报错

    // 2. js如何建立一个私有属性
    class Course {
        constructor(teacher, course) {
            this._teacher = teacher;

            // 在constructor作用域内定义一个局部变量
            let _course = 'es6';
            // 内部通过闭包的形式去暴露该变量
            this.getCourse = () => {
                return _course;
            }
        }
    }

    class Course {
        #course = 'es6';
        constructor(teacher, course) {
            this._teacher = teacher;
        }
        get course() {
            return this.#course;
        }
        set course(val) {
            if(val) {
                this.#course = val;
            }
        }
    }

    // 3. 封装核心 - 适配器模式
    // 底层封装中台业务core
    class utils {
        constructor(core) {
            this._main = core;
            this._name = 'my-utils';
            this._id = 'zw专有';
        }

        // fullName: {firstName: '', lastName: '', name: ''}
        get name() {
            return {
                ...this._main.fullName,
                ...{
                    name: `utils is ${this._name}`
                }
            }
        }
        get id() {
            return {
                ...this._main.id,
                id: this._id
            }
        }
        set name(val) {
            // valid saftey
            this._name = val;
        }
    }
```

### 静态方法 - 直接挂载在类上的方法无需实例化获取
```js
    // ES5 
    function Course() {
        // ……
    }
    Course.ring = function() {
        // ……
    }

    // ES6
    class Course {
        constructor() {
            //……
        }

        static ring() {
            //……
        }
    }

    Course.ring();
    // 全局对象变量问题
```

### 继承 
```js
    // es5继承
    function Course() {
        // ……
    }
    Course.ring = function() {
        // ……
    }
    Course.prototype.send = function() {
        // ……
    }

    function Child() {
        Course.call(this, 'yy', 'ES6');
        this.run = function() {
            // ……
        }
    }
    Child.prototype = Course.prototype;

    // es6
    class Course {
        constructor() {
            //……
        }
        static ring() {}
        send() {}    
    }
    // => 工厂模式
    class Child extends Course {
        constructor() {
            super('yy', 'ES6')
        }
        run() {}
    }
```

## key解构技巧
```js
    const zw = {
        teacher: {
            name: '',
            age: 30
        },
        leader: '',
        name: 'es6'
    }

    // 别名
    const {
        teacher: {
            name,
            age
        },
        leader,
        name: className
    } = zw;
```
### 形参结构
```js
    const sum = arr => {
        let res = 0;
        arr.forEach(each => {
            res += each;
        })
    }

    const sum = ([a, b, c]) => {
        return a + b + c;
    };
```

### 结合初始值
```js
    const course = ({ teacher, leader, course = 'zw' }) => {
        // …… 
    }

    course({
        teacher: 'yy',
        leader: 'xk'
    })
```

### 返回值
```js
    const getCourse = () => {
        return {
            teacher: '',
            leader: ''
        }
    }

    const { teacher, leader } = getCourse();
```

### 变量交换
```js
    let a = 1;
    let b = 2;
    [b, a] = [a, b];
```

### json处理
```js
const json = '{"teacher": "yy", "leader": "xk"}';

const obj = JSON.parse(json);

const {
    teacher,
    leader
} = JSON.parse(json);
```

### ajax
```js
    const {
        code,
        data,
        msg
    } = response;
```