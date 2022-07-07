# TypeScript

## TypeScript编译过程图  
<!-- <img src="/data/ts-progress.png" width="100%" height="150%"></img> -->
![ts原理图](/data/ts-progress.png)  

## 基础类型
number string boolean array object undefined void never

## 常用操作符

###  enum
> 枚举
```TypeScript
    enum ActionType {
        /**跑 */
        Run, // 0
        Eat  // 1
    }

    enum ActionType2 {
        Run = 'run'
        Eat = 'eat'
    }
    const a = ActionType.Run // 0
    const b = ActionType2.Run // run
```

###  type
```TypeScript
    type Action = 'eat' | 'run'
    const a: Action = 'eat'  //eat | run
```

###  interface
```TypeScript
    interface Action {
        name?: string; //可选项
        height: number;
    }
    // ex:  axios.post<Action>() 限定返回值

    const b: Action = {
        name: '',
        height: 0
    }
```

### 联合类型 | 
>（联合类型一次只能用一种类型） 
```TypeScript
    interface A {
        name: string;
    }
    interface B {
        sex: number;
    }
    function test(a: A | B){

    }
    test({
        sex: 0
    })
```

### 交叉类型 & 
>（交叉类型每次都是多个类型的合并类型）
```TypeScript
    interface A {
        name: string;
    }
    interface B {
        sex: number;
    }
    function test(a: A | B){

    }
    test({
        sex: 0,
        name: 'zj'
    })
```

### typeof 
> (可以用来获取一个变量声明或对象的类型)

```TypeScript
    function toArray(x：number): Array[number] {
        return [x]
    }
    type Func = typeof toArray
```

###  keyof 
> (用来获取对象中所有的key)

```TypeScript
    interface Person {
        name: string;
        age: number;
    }
    type p = keyof Person; //'name' | 'age'
```

### in 
> (遍历枚举类型)
```TypeScript
    type Keys = "a" | "b" | "c"
    type Obj = {
        [key in Keys]: number;
    }
    const obj: Obj = {
        a: 1,
        b: 2,
        c: 3
    }
```

### extends 
> (更多用来约束泛型)
```TypeScript
    type Action = 'eat' | 'run'
    interface A<T extends Action> {
        a: T
    }

    const b: A<'eat'> = {
        a: 0
    }


    interface ILengthwise {
        length: number
    }
     
     function loggingIdentity<T extends ILengthwise>(arg: T): T {
        return arg
     }
     loggingIdentity({length: 3})
```

###  Paritial

> Partial 的作用就是将某个类型里的属性全部变为可选项 ?。
```TypeScript
    interface A {
        name: string;
        age: string;
    }
    type B = Paritial<A>
```

### Reuqired

> Required 的作用就是将某个类型里的属性全部变为必选项。
```TypeScript
    interface A {
        name: string;
        age: string;
    }
    type B = Required<A>
```

### Readonly 

> Readonly 的作用是将某个类型所有属性变为只读属性，也就意味着这些属性不能被重新赋值。

### Record 

> Record<K extends keyof any, T> 作用是将 K 中所有的属性的值转化为 T 类型。

```ts
interface PageInfo {
  title: string;
}

type Page = "home" | "about" | "contact";

const x: Record<Page, PageInfo> = {
  about: { title: "about" },
  contact: { title: "contact" },
  home: { title: "home" }
};
```
### Exclude
> Exclude<T, U> 的作用是将某个类型中属于另一个的类型移除掉。

```ts
type T0 = Exclude<"a" | "b" | "c", "a">; // "b" | "c"
type T1 = Exclude<"a" | "b" | "c", "a" | "b">; // "c"
```
### Extract

> Extract<T, U> 的作用是从 T 中提取出 U。

```ts
type T0 = Extract<"a" | "b" | "c", "a" | "f">; // "a"
type T1 = Extract<string | number | (() => void), Function>; // () => void

```


## 常见面试题

###  你觉得ts的好处是什么？
-  ts是js的加强版，是js的超集，给js添加了可选的静态类型或者基于类的面向对象编程， ts的功能比js只多不少
-  ts是面向对象编程的语言，包含了类，接口的概念
-  ts在开发时就能给出编译错误，静态编译，js错误只能在运行时体现
-  作为强类型的语言，可以明确知道所有数据的类型
    
###  type 和 interface的异同？
> 用interface描述数据结构，用type描述类型
1. 相同点：
    - 都可以描述一个对象或者函数
    ```TypeScript
    interface User {
    name: string
    age: number
    }

    interface SetUser {
    (name: string, age: number): void;
    }

    type User = {
    name: string
    age: number
    };

    type SetUser = (name: string, age: number)=> void;
    ```
    - 都允许拓展（extends）  
    interface 和 type 都可以拓展，并且两者并不是相互独立的，也就是说 interface 可以 extends type, type 也可以 extends interface 。 虽然效果差不多，但是两者语法不同。  
```ts
    // interface extends interface
    interface Name { 
        name: string; 
    }
    interface User extends Name { 
        age: number; 
    }

    // type extends type
    type Name = { 
        name: string; 
    }
    type User = Name & { age: number  };

    // interface extends type
    type Name = { 
        name: string; 
    }
    interface User extends Name { 
        age: number; 
    }

    // type extends interface
    interface Name { 
        name: string; 
    }
    type User = Name & { 
        age: number; 
    }
```
2. 不同点
    - 只有type可以做的
    - type 可以声明基本类型别名，联合类型，元组等类型
```ts
    // 基本类型别名
    type Name = string

    // 联合类型
    interface Dog {
        wong();
    }
    interface Cat {
        miao();
    }

    type Pet = Dog | Cat

    // 具体定义数组每个位置的类型
    type PetList = [Dog, Pet]

    // 当你想获取一个变量的类型时，使用 typeof
    let div = document.createElement('div');
    type B = typeof div
```

### 如何基于一个已有类型, 扩展出一个大部分内容相似, 但是有部分区别的类型?
> 首先可以通过Pick和Omit
```ts
    interface Test {
        name: string;
        sex: number;
        height: string;
    }

    type Sex = Pick<Test, 'sex'>;

    const a: Sex = { sex: 1 };

    type WithoutSex = Omit<Test, 'sex'>;

    const b: WithoutSex = { name: '1111', height: 'sss' };
```
比如Partial, Required.

再者可以通过泛型. 

### 什么是泛型, 泛型的具体使用?

> 泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，使用时再去指定类型的一种特性。可以把泛型理解为代表类型的参数  
```ts
interface Test<T = any> {
    userId: T;
}

type TestA = Test<string>;
type TestB = Test<number>;

const a: TestA = {
    userId: '111',
};

const b: TestB = {
    userId: 2222,
};

```