# Promise
[[toc]]

## PromiseA+规范

### Promise States 
promise应该有三种状态
1. **pending**
   
    1. 初始的状态, 可改变
    2. 一个promise在resolve或者reject前都处于这个状态
    3. 可以通过 resolve -> fulfilled 状态
    4. 可以通过 reject -> rejected 状态
   
2. **fulfilled**
   
   1. 最终态, 不可变
   2. 一个promise被resolve后会变成这个状态
   3. 必须拥有一个value值

3. **rejected**

   1. 最终态, 不可变
   2. 一个promise被reject后会变成这个状态
   3. 必须拥有一个reason

> Tips: 总结一下, 就是promise的状态流转是这样的  
&emsp;&emsp;pending -> resolve(value) -> fulfilled  
&emsp;&emsp;pending -> reject(reason) -> rejected

### then
promise提供一个then方法, 用来访问最终的结果, 无论是value还是reason.
```js
promise.then(onFulfilled, onRejected)
```
1. 参数要求

    1. onFulfilled 必须是函数类型, 如果不是函数, 应该被忽略
    
       - 在promise变成 fulfilled 时，应该调用 onFulfilled, 参数是value
       - 在promise变成 fulfilled 之前, 不应该被调用
       - 只能被调用一次(所以在实现的时候需要一个变量来限制执行次数)
    
    2. onRejected 必须是函数类型, 如果不是函数, 应该被忽略
       
       - 在promise变成 rejected 时，应该调用 onRejected, 参数是reason
       - 在promise变成 rejected 之前, 不应该被调用
       - 只能被调用一次(所以在实现的时候需要一个变量来限制执行次数

2. onFulfilled 和 onRejected 应该是微任务
   - 这里用queueMicrotask来实现微任务的调用

3. then方法可以被调用多次

    1. promise状态变成 fulfilled 后，所有的 onFulfilled 回调都需要按照then的顺序行, 也就是按照注册顺序执行(所以在实现的时候需要一个数组来存放多个onFulfilled的回调)
    2. promise状态变成 rejected 后，所有的 onRejected 回调都需要按照then的顺序执行, 也就是按照注册顺序执行(所以在实现的时候需要一个数组来存放多个onRejected的回调)

4. 返回值
    then 应该返回一个promise
    ```js
        promise2 = promise1.then(onFulfilled, onRejected);
    ```
    1.  onFulfilled 或 onRejected 执行的结果为x, 调用 resolvePromiseFn
    2.  如果 onFulfilled 或者 onRejected 执行时抛出异常e, promise2需要被reject
    3.  如果 onFulfilled 不是一个函数, promise2 以promise1的value 触发fulfilled
    4.  如果 onRejected 不是一个函数, promise2 以promise1的reason 触发rejected

5. resolvePromise
   ```js
   resolvePromise(promise2, x, resolve, reject)
   ```
   1. 如果 promise2 和 x 相等，那么 reject TypeError
   2. 如果 x 是一个 promsie  
        如果x是pending态，那么promise必须要在pending,直到 x 变成 fulfilled or rejected  
        如果 x 被 fulfilled, fulfill promise with the same value.
        如果 x 被 rejected, reject promise with the same reason.
   3. 如果 x 是一个 object 或者 是一个 function  
        1. let then = x.then
        2. 如果 x.then 这步出错，那么 reject promise with e as the reason  
        3. 如果 then 是一个函数，then.call(x, resolvePromiseFn, rejectPromise) 
        4. resolvePromiseFn 的 入参是 y, 执行 resolvePromise(promise2, y,  resolve, reject);  
        5. rejectPromise 的 入参是 r, reject promise with r
        6. 如果 resolvePromise 和 rejectPromise 都调用了，那么第一个调用优先，后面的调用忽略  
        7. 如果调用then抛出异常e  
        8. 如果 resolvePromise 或 rejectPromise 已经被调用，那么忽略则，reject promise with e as the reason  
        9. 如果 then 不是一个function. fulfill promise with x 

## 手写实现promise
```js
const PENDING = 'pending';
const FULFILLED = 'fulfilled';
const REJECTED = 'rejected';
class MyPromise {
    FULFILLED_CALLBACK_LIST = [];
    REJECTED_CALLBACK_LIST = [];
    _status = PENDING;

    constructor(fn) {
        this.status = 'pending';
        this.value = null;
        this.reason = null;
        try{
            //防止this指向问题
            fn(this.resolve.bind(this),this.reject.bind(this));
        } catch(e) {
            this.reject(e);
        }
    }
    
    get status() {
        return this._status;
    }

    set status(newStatus) {
        this._status = newStatus;
        switch (newStatus) {
            case FULFILLED:
                this.FULFILLED_CALLBACK_LIST.forEach(cb => {
                    cb(this.value)
                });
                break;
            case REJECTED:
                this.REJECTED_CALLBACK_LIST.forEach(cb => {
                    cb(this.reason)
                });
                break;
        }
    }

    resolve(value) {
        if(this.status === 'pending') {
            this.value = value;
            this.status = FULFILLED;
        }
    }
    
    reject(reason) {
        if(this.status === 'pending') {
            this.reason = reason;
            this.status = REJECTED;
        }
    }
    
    then(onFulfilled, onRejected) {
       const realOnFulfilled = this.isFunction(onFulfilled) ? onFulfilled : (value) => value;
       const realOnRejected = this.isFunction(onRejected) ? onRejected : (reason) => {
            throw reason;
       }
       //返回一个新的promise 可以连缀调用
       const promsie2 = new MyPromise((resolve, reject) => {
           //onFulfilled 和 onRejected 应该在微任务执行
           const fulfilledMicrotask = () => {
                queueMicrotask(() => {
                    try {
                        const x = realOnFulfilled(this.value);
                        this.resolvePromise(x, promsie2, resolve, reject);
                    } catch(e) {
                        reject(e)
                    }
                })
           }
           const rejectedMicrotask = () => {
                queueMicrotask(() => {
                    try {
                        const x = realOnRejected(this.reason);
                        this.resolvePromise(x, promsie2, resolve, reject);
                    } catch(e) {
                        reject(e)
                    }
                })
           }
            switch (this.status) {
                case PENDING:
                    this.FULFILLED_CALLBACK_LIST.push(fulfilledMicrotask)
                    this.REJECTED_CALLBACK_LIST.push(rejectedMicrotask)
                    break;
            
                case FULFILLED:
                    fulfilledMicrotask()
                    break;
            
                case REJECTED:
                    rejectedMicrotask()
                    break;
            }
       })
       return promsie2
    }

    catch (onRejected) {
        return this.then(null, onRejected);
    }

    finally(callback) {
        return this.then(
            (value) => {
                return MyPromise.resolve(callback()).then(() => value)
            },
            (err) => {
                return MyPromise.resolve(callback()).then(() => { throw err })
            }
        )
    }

    //  onFulfilled、onRejected 必须是函数类型
    isFunction(func) {
        return typeof func === 'function';
    }

    resolvePromise(x,promise2,resolve,rejcet) {
        // 为了防止死循环
        if(promise2 === x) {
            return reject(new TypeError('The promise and the return value are the same'));
        }

        if(x instanceof MyPromise) {
            queueMicrotask(() => {
                x.then((y) => {
                    this.resolvePromise(y, promise2, resolve, reject);
                }, reject)
            })
        } else if(typeof x ==='object' || this.isFunction(x)) {
            if(x === null) {
                return resolve(x) 
            }
            let then = null;
            try {
                then = x.then
            } catch (error) {
                return reject(error)
            }
            if(this.isFunction(then)) {
                // 需要有一个变量called来保证只调用一次.
                let called = false;
                try {
                    then.call(
                        x, 
                        // 如果 resolvePromise 以值 y 为参数被调用，则运行 resolvePromise
                        (y) => {
                            if (called) return;
                            called = true;
                            this.resolvePromise(promise2, y, resolve, reject)
                        }, 
                        (r) => {
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    )
                } catch (error) {
                    if (called) return;
                    reject(error);
                }
            }else {
                resolve(x);
            }
        } else {
            resolve(x)
        }
    }

    static resolve(value) {
        if (value instanceof MyPromise) {
            return value;
        }
        return new MyPromise((resolve) => {
            resolve(value);
        });
    }

    static reject(reason) {
        return new MyPromise((resolve, reject) => {
            reject(reason);
        });
    }

    static race(promiseList) {
        return new MyPromise((resolve, reject) => {
            const length = promiseList.length;

            if (length === 0) {
                return resolve();
            } else {
                for (let i = 0; i < length; i++) {
                    MyPromise.resolve(promiseList[i]).then(
                        (value) => {
                            return resolve(value);
                        },
                        (reason) => {
                            return reject(reason);
                        });
                }
            }
        });

    }
    static all(arr) {
        return new MyPromise((resolve, reject) => {
            let res = [];
            let count = 0;
            for(let i = 0; i < arr.length; i++) {
                MyPromise.resolve(arr[i]).then((value) => {
                    res[i] = value
                    count++ 
                    if(count === arr.length) {
                        resolve(res)
                    }
                }).catch((reason) => {
                    reject(reason)
                })
            }
        })
    }
}

const test = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        reject(111);
    }, 1000);
})
.then((value) => {
    console.log('then',value);
})
.catch((reason) => {
    console.log('catch');
});

setTimeout(() => {
    console.log(test);
}, 2000);

//输出: 'catch'  
//      MyPromise {
//        FULFILLED_CALLBACK_LIST: [],
//        REJECTED_CALLBACK_LIST: [],
//        _status: 'fulfilled',
//        value: undefined,
//        reason: null
//      }

```

## 关于promise的几个问题
### 为什么promise resolve了一个value, 最后输出的value值确是undefined
```js
const test = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(111);
    }, 1000);
}).then((value) => {
    console.log('then');
});

setTimeout(() => {
    console.log(test);
}, 3000)

// 因为现在这种写法, 相当于在.then里return undefined, 所以最后的value是undefined. 
// 如果显式return一个值, 就不是undefined了；比如return value.
```

### .then返回的是一个新Promise, 那么原来promise实现的时候, 用数组来存回调函数有什么意义？
这个问题提出的时候, 应该是有一个假定条件, 就是链式调用的时候. 

这个时候, 每一个.then返回的都是一个新promise, 所以每次回调数组FULFILLED_CALLBACK_LIST都是空数组. 

针对这种情况, 确实用数组来存储回调没意义, 完全可以就用一个变量来存储。

```js
const test = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(111);
    }, 1000);
}).then((value) => {
    
}).then(() => {

})
```

但是还有一种promise使用的方式, 这种情况下, promise实例是同一个, 数组的存在就有了意义

```js
const test = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve(111);
    }, 1000);
})

test.then(() => {});
test.then(() => {});
test.then(() => {});
test.then(() => {});
```

### 为什么我在catch的回调里, 打印promise, 显示状态是pending
```js
const test = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        reject(111);
    }, 1000);
}).catch((reason) => {
    console.log('报错' + reason);
    console.log(test)
});

setTimeout(() => {
    console.log(test);
}, 3000)

```

1. catch 函数会返回一个新的promise, 而test就是这个新promise
2. catch 的回调里, 打印promise的时候, 整个回调还并没有执行完成(所以此时的状态是pending), 只有当整个回调完成了, 才会更改状态
3. catch 的回调函数, 如果成功执行完成了, 会改变这个新Promise的状态为fulfilled

## 输出顺序问题
题目一：
```js
Promise.resolve()
    .then(async () => {
        console.log(0);
        setTimeout(() => {
            console.log('宏任务');
        }, 0);
        return Promise.resolve(4);
    })
    .then((res) => {
        console.log(res);
    });

Promise.resolve().then(() => {
        console.log(1);
    })
    .then(() => {
        console.log(2);
    })
    .then(() => {
        console.log(3);
    })
    .then(() => {
        console.log(5);
    })
    .then(() => {
        console.log(6);
    })
    .then(() => {
        console.log(7);
    })

// 0
// 1
// 2
// 3
// 5
// 4
// 6
// 7
// 宏任务
```

题目三：
```js
async function async1(){
    console.log('async1 start') // 2
    await async2()
    console.log('async1 end') // 6
}

async function async2(){
    console.log('async2') // 3
}

console.log('script start') //  1
setTimeout(function(){
    console.log('setTimeout') // 8
}, 0)
async1()

new Promise(function (resolve){
    console.log('promise1') // 4
    resolve()
}).then(function(){
    console.log('promise2') // 7
})

console.log('script end') // 5

/*
1、执行宏任务，放入宏任务栈、微任务队列
t：setTimeout  mt：async1 end | promise2
script start
async1 start
async2
promise1
script end
2、执行维任务队列
async1 end
promise2
3、执行宏任务栈
setTimeout
*/
```

## 事件循环
### 1、什么叫事件循环

javaScript执行事件的循环机制为事件循环。  

JavaScript的执行机制主要是以下三步：  
1. 所有同步任务都在主线程上执行，形成一个执行栈（execution context stack）。
2. 主线程之外，还存在一个‘任务队列’（task queue）。只要异步任务有了运行结果，就在”任务队列”之中放置一个事件。
3. 一旦主线程的栈中的所有同步任务执行完毕，系统就会读取任务队列，选择需要首先执行的任务然后执行。  


在此过程中，主线程要做的就是从任务队列中去取事件，执行事件，执行完毕，再取事件，再执行事件…这样不断取事件，执行事件的循环机制就叫做事件循环机制。（需要注意的的是当任务队列为空时，就会等待直到任务队列变成非空。）

### 2、为什么有事件循环
javaScript是单线程的，JavaScript中的所有任务都需要排队依次完成，为了解决线程的阻塞问题，使用事件循环解决。
- JavaScript的主要用途是与用户互动，以及操作DOM。如果它是多线程的会有很多复杂的问题要处理，比如有两个线程同时操作DOM，一个线程删除了当前的DOM节点，一个线程是要操作当前的DOM阶段，最后以哪个线程的操作为准？为了避免这种，所以JS是单线程的。即使H5提出了web worker标准，它有很多限制，受主线程控制，是主线程的子线程。  

- 非阻塞：通过 event loop 实现。

### 3、什么是宏任务和微任务

- 宏任务：\<script>\</script>整体代码、setTimeout、setInterval、I/O操作、UI渲染等

- 微任务：new Promise().then()、MutaionObserver、process.nextTick()

### 4、为什么有微任务

宏任务先进先出，针对优先级高的任务需尽快执行，无法满足。

页面渲染事件，各种IO的完成事件等随时被添加到任务队列中，一直会保持先进先出的原则执行，我们不能准确地控制这些事件被添加到任务队列中的位置。但是这个时候突然有高优先级的任务需要尽快执行，那么一种类型的任务就不合适了，所以引入了微任务队列。  

### 5、浏览器的事件循环是怎么样的

关于微任务和宏任务在浏览器的执行顺序是这样的：  

执行一只task（宏任务）  

执行完micro-task队列 （微任务）  

如此循环往复下去

### 6、nodejs的事件循环是怎么样的

大体的task（宏任务）执行顺序是这样的：
- timers定时器：本阶段执行已经安排的 setTimeout() 和 setInterval() 的回调函数。
  
- Pending callbacks待定回调：执行延迟到下一个循环迭代的 I/O 回调。

- idle, prepare：仅系统内部使用。

- Poll 轮询：检索新的 I/O 事件;执行与 I/O 相关的回调（几乎所有情况下，除了关闭的回调函数，它们由计时器和 setImmediate() 设定的之外），其余情况 node 将在此处阻塞。

- check 检测：setImmediate() 回调函数在这里执行。

- close callbacks 关闭的回调函数：一些准备关闭的回调函数，如：socket.on(‘close’, …)。


微任务和宏任务在Node的执行顺序
- Node V10以前：
  
执行完一个阶段的所有任务  

执行完nextTick队列里面的内容  

然后执行完微任务队列的内容  

- Node v10以后：
  
和浏览器的行为统一了，都是每执行一个宏任务就执行完微任务队列。


