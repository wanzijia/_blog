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
    },
    set(target, key, value) {
    // 进行 trigger 
    return Reflect.set(target, key, value); 
  } 
}); 
// proxy 即直接我们代码中直接访问与修改的对象， 
// 也可称为响应式数据（reactive/ref）
```

### 几个关键的函数
在  handler  部分（new Proxy  的第二个参数），有两个过程分别为取值和赋值，我们在取值和赋值中间分别插入劫持的方法，即  track  和  trigger ——依赖的跟踪和副作用的触发。 因此引出下面几个概念/方法：

1. track： 收集依赖
2. trigger： 触发副作用函数
3. effect： 副作用函数
4. reactive/ref： 基于普通对象创建代理对象的方法 
5. watch
6. computed
7. ....
> 剩余的部分 api 往往也是基于核心 api 的封装

### 如何使用

```vue
<script>
import { ref, reactive, effect, computed } from 'vue' 
export default {
  ...
  setup(props, context) { // 相当于vue2 created 和 beforeCreate
    const countRef = ref(0) // 包装成一个对象 进行proxy代理
    const number = reactive({ num: 1 })
    effect(() => { // 类似于 vue2 的watch
      console.log(countRef.value)
    })
    const increment= () => {
      countRef.value++
    }
    const result = computed(() => number.num ** 2)
    return { countRef, number, result, increment }
  }
}

</script>
```
用两张图表示:

![组件初始化，执行 setup](/data/setup_1.png)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;图一：组件初始化，执行 setup

![数据变化，执行上一步追踪的副作用函数](/data/setup_2.png)  
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;图二：数据变化，执行上一步追踪的副作用函数


### 初始化阶段(vue^3.0.4)

- 创建代理数据

```js
  const countRef = ref(0)
  const number = reactive({ num: 1 })
```
> 在 reactivity 包中，打开 reactivity.esm-browser.js 文件（其他不同模块类型的文件类似），找到 ref 函数。

```js
  function ref(value) {
    return createRef(value, false);
  }

  function createRef(rawValue, shallow) { 
    if (isRef(rawValue)) { 
      return rawValue; 
    }
    return new RefImpl(rawValue, shallow); 
  }
```
RefImpl：
```js
class RefImpl { 
  constructor(value, _shallow) { 
    this._shallow = _shallow; 
    this.dep = undefined; 
    this.__v_isRef = true; 
    this._rawValue = _shallow ? value : toRaw(value); 
    this._value = _shallow ? value : convert(value); 
  }
  get value() { 
    trackRefValue(this); // 重点在这儿，取值时依赖收集 
    return this._value; 
  }
  set value(newVal) { 
    newVal = this._shallow ? newVal : toRaw(newVal); 
    if (hasChanged(newVal, this._rawValue)) { 
      this._rawValue = newVal; 
      this._value = this._shallow ? newVal : convert(newVal); 
      triggerRefValue(this, newVal); // 改值时触发更新 

    } 
  } 
}
function reactive(target) { 
  // if trying to observe a readonly proxy, return the readonly version. 
  if (target && target["__v_isReadonly" /* IS_READONLY */ ]) {
    return target; 
  }
  return createReactiveObject( 
    target, 
    false, 
    mutableHandlers, 
    mutableCollectionHandlers, 
    reactiveMap 
  ); 
}
```
`createReactiveObject`方法是主要逻辑

```js
function createReactiveObject(target, isReadonly, baseHandlers, collectionHandlers, 
proxyMap) { 

  // 省略部分逻辑 
  const existingProxy = proxyMap.get(target); 
  if (existingProxy) { 
    return existingProxy; 
  }
  // 省略部分逻辑 
  const proxy = new Proxy(
    target, targetType === 2 /* COLLECTION */ ? 
    collectionHandlers : baseHandlers10
  ); 
  proxyMap.set(target, proxy); 
  return proxy; 
}
```
reactive 方法使用了 Proxy 来实现代理

- 数据追踪

按照图一 顺序，副作用  `effect`  执行，并调用回调方法 fn，由于 fn 内部访问了  `countRef`  的 value 属性
```js
effect(() => { 
  console.log(countRef.value) 
})
```
即这里触发了类  `RefImpl`  定义的  get  方法
```js
// 包装的数据在第一次被 effect 内 函数 fn 访问的时候，包装对象顺便把这个函数 fn 也给存了下来。
function trackRefValue(ref) { 
  if (isTracking()) { 
    ref = toRaw(ref); 
    if (!ref.dep) { 
      ref.dep = createDep(); 
    }
    {
      trackEffects(ref.dep, { 
        target: ref, 
        type: "get" /* GET */ , 
        key: 'value' 
      }); 
    } 
  } 
}
// activeEffect 是全局变量，在执行 effect 时会指向一个包含了 fn 的实例。 
// 换句话说，此处 dep.add(activeEffect) 
// 等效于 ref.dep.add(wrapper(fn))，wrapper 是过程的简化 
function trackEffects(dep) { 
// 省略部分代码 
  if (shouldTrack) { 
    dep.add(activeEffect); // 这里做个标记，记作 coordinate130
    activeEffect.deps.push(dep); 
  } 
}
```

### 状态更新阶段
> 对于图二，以 ref 创建的数据源为例，countRef.value++  从下面开始

```js
class RefImpl { 
  ...
  set value(newVal) { 
    ... 
    if (hasChanged(newVal, this._rawValue)) { 
      this._rawValue = newVal; 
      this._value = this._shallow ? newVal : convert(newVal); 
      triggerRefValue(this, newVal); // 改值时触发更新 
    }
  } 
}
// triggerRefValue 
function triggerRefValue(ref, newVal) { 
  ref = toRaw(ref); 
  if (ref.dep) { // 回到上面标记的地方 coordinate1
    triggerEffects(ref.dep, { 
      target: ref, 
      type: "set" /* SET */ , 
      key: 'value', 
      newValue: newVal 
    }); 
  }
}
```
标记的位置证明包装值  `ref(0)`  通过 dep 对未来要执行的 fn 是存在引用关系的，而  `triggerEffect`  方法就根据这个存在的关系，一旦 set 时就触发它！

triggerEffects
```js
function triggerEffects(dep, debuggerEventExtraInfo) { 
  // spread into array for stabilization 
  for (const effect of isArray(dep) ? dep : [...dep]) { 
    if (effect !== activeEffect || effect.allowRecurse) { 
      if (effect.onTrigger) { 
        effect.onTrigger(extend({ effect }, debuggerEventExtraInfo)); 
      }
      if (effect.scheduler) { 
        effect.scheduler(); // 这是 fn 在微任务队列中执行的地方 
      } else { 
        effect.run(); // 这是 fn 同步执行的地方 
      } 
    } 
  }
}

function effect(fn, options) { 
  ... 
  // setup 函数中的 effect 执行时实例化一次，引用了 fn 
  const _effect = new ReactiveEffect(fn); 
  ... 
  if (!options || !options.lazy) { 
    _effect.run(); // 内部会调用 fn 
    // 所以怎么跳过第一次执行的 fn 不用多说了吧 
  }
  const runner = _effect.run.bind(_effect); 
  runner.effect = _effect; 
  return runner; 
}
 
// ReactiveEffect 
const effectStack = []; 
 
class ReactiveEffect { 
  constructor(fn, scheduler = null, scope) { 
    // scheduler 在 computed 函数中会用到 
    this.fn = fn; 
    this.scheduler = scheduler; 
    this.active = true; 
    this.deps = []; 
    recordEffectScope(this, scope); 
  }
  run() { 
    if (!this.active) {
      return this.fn(); 
    }
    if (!effectStack.includes(this)) { // 全局未缓存过本实例时 
      try { 
        effectStack.push((activeEffect = this)); // 重点关注 activeEffect ！
        enableTracking(); 
        trackOpBit = 1 << ++effectTrackDepth; 
        if (effectTrackDepth <= maxMarkerBits) { 
          initDepMarkers(this); 
        } else {
          cleanupEffect(this); 
        }
        return this.fn(); 
      } finally { 
        if (effectTrackDepth <= maxMarkerBits) { 
          finalizeDepMarkers(this); 
        }
        trackOpBit = 1 << --effectTrackDepth; 
        resetTracking(); 
        effectStack.pop(); 
        const n = effectStack.length; 
        activeEffect = n > 0 ? effectStack[n - 1] : undefined; 
      } 
    } 
  }
}
```
上面的 ref 方法创建数据与更新的一整套流程，其实  `reactive`  创建的数据，也有类似的逻辑，区别就在于`Proxy`  的  `handler`  部分: 
```js
const proxy = new Proxy( 
  target, 
  targetType === 2 /* COLLECTION */ ? collectionHandlers : baseHandlers 
);
```

以  `baseHandlers`  为例（这里是形参），找到实参  `mutableHandlers` 
```js
const mutableHandlers = { get, set, ... };
// 我们可以断定，这里的 get/set 就是进行 track 和 trigger 的地方。找到它
const get = /*#__PURE__*/ createGetter();
 
function createGetter(isReadonly = false, shallow = false) { 
  return function get(target, key, receiver) { 
  ... 
  if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) { 
    // arrayInstrumentations 内也有 track，不再展示，关注主线 
    return Reflect.get(arrayInstrumentations, key, receiver); 
  }
  ... 
  if (!isReadonly) { 
    track(target, "get" /* GET */ , key); // 出现了与 ref 拦截一样的逻辑
  }
  ... 
  } 
}
// track 
function track(target, type, key) { 
  if (!isTracking()) { 
    return; 
  }
  let depsMap = targetMap.get(target); // 全局缓存 
  if (!depsMap) { 
    targetMap.set(target, (depsMap = new Map())); 
  }
  let dep = depsMap.get(key); 
  if (!dep) { 
    depsMap.set(key, (dep = createDep())); 
  }
  const eventInfo = { effect: activeEffect, target, type, key }; 
  trackEffects(dep, eventInfo); // 与 trackRefValue 殊途同归，略 
}

// 看 set
const set = /*#__PURE__*/ createSetter();
 
function createSetter(shallow = false) { 
  return function set(target, key, value, receiver) { 
    let oldValue = target[key]; 
    ...
    if (target === toRaw(receiver)) { 
      if (!hadKey) { 
        trigger(target, "add" /* ADD */ , key, value);  // 与 ref 的 trigger 一样了
      } else if (hasChanged(value, oldValue)) { 
        trigger(target, "set" /* SET */ , key, value, oldValue); 
      } 
    }
    return result; 
  }; 
}
// trigger 
function trigger(target, type, key, newValue, oldValue, oldTarget) { 
  ... 
  if (deps.length === 1) { 
    if (deps[0]) {
    // 与 triggerRefValue 殊途同归，略 
      triggerEffects(deps[0], eventInfo); 
    } 
  } else { 
    const effects = []; 
    for (const dep of deps) { 
      if (dep) { 
        effects.push(...dep); 
      } 
    }
    triggerEffects(createDep(effects), eventInfo); 
  }
}
```

### diff

[diff](https://www.cnblogs.com/wind-lanyan/p/9061684.html)

> 双指针遍历算法
- 当你没有使用key时, 按照索引进行对比，对比旧列表和新列表的长度，如果旧列表比新列表长，证明列表减少了，从最后位置开始卸载旧列表，反之则直接挂载新列表 
```js
const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
        const nextChild = (c2[i] = optimized
            ? cloneIfMounted(c2[i])
            : normalizeVNode(c2[i]));
        patch(c1[i], nextChild, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
    }
    if (oldLength > newLength) {
        // remove old
        unmountChildren(c1, parentComponent, parentSuspense, true, false, commonLength);
    }
    else {
        // mount new
        mountChildren(c2, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized, commonLength);
    }
};
```

- 当使用了key时
1. 正向同类型节点对比
2. 反向同类型节点对比
3. 判断节点插入卸载
4. 乱序 排序处理 相同key的节点位置更新，如果有移动 则触发move方法
```js
const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized) => {
        let i = 0;
        const l2 = c2.length;
        let e1 = c1.length - 1; // prev ending index
        let e2 = l2 - 1; // next ending index
        // 1. sync from start
        // (a b) c
        // (a b) d e
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = (c2[i] = optimized
                ? cloneIfMounted(c2[i])
                : normalizeVNode(c2[i]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                // --------------coordinate22，coordinate23
                // i = 2，e1 = 2，e2 = 3 当前位置标记如下
                // (a b) [c]
                // (a b) [d] e
                break;
            }
            i++;
        }
        // 2. sync from end
        // a (b c)
        // d e (b c)
        while (i <= e1 && i <= e2) { // 倒序遍历
            const n1 = c1[e1];
            const n2 = (c2[e2] = optimized
                ? cloneIfMounted(c2[e2])
                : normalizeVNode(c2[e2]));
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
            }
            else {
                // --------------coordinate23，coordinate24
                // 综合前两次循环，可将形如下面的列表 e1 = 3, e2 = 5
                // a b c d
                // a b e f c d
                
                // 处理成 (.为下标 i 的位置 i = 2，e1 = 1, e2 = 3)：
                // a b . c d
                // a b . e f c d
                // 第一轮，更新了ab，第二轮更新了cd，目前还剩 ef 待插入
                
                break;
            }
            e1--;
            e2--;
        }
        // 3. common sequence + mount
        // (a b)
        // (a b) c
        // i = 2, e1 = 1, e2 = 2
        // (a b)
        // c (a b)
        // i = 0, e1 = -1, e2 = 0
        
        if (i > e1) { // --------------coordinate24，coordinate25 
            if (i <= e2) {
                const nextPos = e2 + 1; // 4
                const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor; // 4 < 6 ? c.el : parentAnchor
                while (i <= e2) { // 2 <= 3, c2[2] = e
                    patch(null, (c2[i] = optimized
                        ? cloneIfMounted(c2[i])
                        : normalizeVNode(c2[i])), container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    i++; // i = 3, i <= 3, c2[i] = f
                }
            }
        }
        // 4. common sequence + unmount
        // (a b) c
        // (a b)
        // i = 2, e1 = 2, e2 = 1
        // a (b c)
        // (b c)
        // i = 0, e1 = 0, e2 = -1
        else if (i > e2) { // 删除操作，以源码注释理解即可，略
            while (i <= e1) {
                unmount(c1[i], parentComponent, parentSuspense, true);
                i++;
            }
        }
        // --------------coordinate25，coordinate26
        // 5. unknown sequence 乱序
        // 经过前两次循环，首尾相同的节点都已跳过
        // [i ... e1 + 1]: a b [c d e] f g
        // [i ... e2 + 1]: a b [e d c h] f g
        // i = 2, e1 = 4, e2 = 5
        else {
            const s1 = i; // prev starting index
            const s2 = i; // next starting index
            // 5.1 build key:index map for newChildren
            const keyToNewIndexMap = new Map();
            // [c d e]
            // [e d c h]
            for (i = s2; i <= e2; i++) {
                const nextChild = (c2[i] = optimized
                    ? cloneIfMounted(c2[i])
                    : normalizeVNode(c2[i]));
                if (nextChild.key != null) {
                    if (keyToNewIndexMap.has(nextChild.key)) {
                      // 存在相同key，警告
                        warn$1(`Duplicate keys found during update:`, JSON.stringify(nextChild.key), `Make sure keys are unique.`);
                    }
                    // 新旧列表是存在相同节点的，将新列表中具有 key 属性的节点的 key 与索引存起来备用
                    // --------------coordinate26，coordinate27
                    keyToNewIndexMap.set(nextChild.key, i);
                }
            }
            // 5.2 loop through old children left to be patched and try to patch
            // matching nodes & remove nodes that are no longer present
            let j;
            let patched = 0;
            const toBePatched = e2 - s2 + 1; // 将要更新的节点总数为 4
            let moved = false;
            // used to track whether any node has moved
            let maxNewIndexSoFar = 0;
            // works as Map<newIndex, oldIndex>
            // Note that oldIndex is offset by +1
            // and oldIndex = 0 is a special value indicating the new node has
            // no corresponding old node.
            // used for determining longest stable subsequence
            const newIndexToOldIndexMap = new Array(toBePatched);
            for (i = 0; i < toBePatched; i++)
                newIndexToOldIndexMap[i] = 0; // [0, 0, 0, 0]
            for (i = s1; i <= e1; i++) { // i = s1 = 2, e1 = 4, e2 = 5
                // 遍历 [c d e]
                // a b [c d e] f g
                // a b [e d c h] f g
                
                const prevChild = c1[i]; // c
                if (patched >= toBePatched) { // toBePatched <= 0，新列表比旧的短，移除节点
                    // all new children have been patched so this can only be a removal
                    unmount(prevChild, parentComponent, parentSuspense, true);
                    continue;
                }
                let newIndex;
                if (prevChild.key != null) { // 旧节点有 key，就去新列表的 key-index 缓存中取该 key 对应的位置
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else { // 旧节点没有 key，就从新的列表中找到满足 isSameVNodeType 的节点位置
                    // key-less node, try to locate a key-less node of the same type
                    for (j = s2; j <= e2; j++) { // e2 = 5，j = 2, 3, 4, 5; s2 = 2
                        if (newIndexToOldIndexMap[j - s2] === 0 && // j - s2 = 0, 1, 2, 3
                            isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) { // 新的列表中，不存在与旧节点 key 一样的节点位置，卸载节点
                    unmount(prevChild, parentComponent, parentSuspense, true);
                }
                else { // 在新列表中找到了旧列表当前节点 【key 一致】或【没有key但类型一致】 的位置
                    newIndexToOldIndexMap[newIndex - s2] = i + 1;
                    // newIndex = 4
                    // maxNewIndexSoFar = 0
                    // newIndexToOldIndexMap = [0, 0, 3, 0]
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex; // maxNewIndexSoFar = 4
                    }
                    else {
                        moved = true;
                    }
                    patch(prevChild, c2[newIndex], container, null, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                    patched++;
                }
            }
            // 5.3 move and mount
            // generate longest stable subsequence only when nodes have moved
            const increasingNewIndexSequence = moved
                ? getSequence(newIndexToOldIndexMap)
                : EMPTY_ARR;
            j = increasingNewIndexSequence.length - 1;
            // looping backwards so that we can use last patched node as anchor
            for (i = toBePatched - 1; i >= 0; i--) {
                const nextIndex = s2 + i;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : parentAnchor;
                if (newIndexToOldIndexMap[i] === 0) {
                    // mount new
                    patch(null, nextChild, container, anchor, parentComponent, parentSuspense, isSVG, slotScopeIds, optimized);
                }
                else if (moved) {
                    // move if:
                    // There is no stable subsequence (e.g. a reverse)
                    // OR current node is not among the stable sequence
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        // --------------coordinate27，coordinate28
                        move(nextChild, container, anchor, 2 /* REORDER */);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    };
```

## vuex (4.0)

> vuex 是一个专为 vue.js 应用程序开发的状态管理模式 + 库。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化

在 vue3 中使用 vuex，入口代码如下（main.js）：

```js
import { createApp } from 'vue'
import { createStore } from 'vuex'
import App from './App.vue'
 
const app = createApp(App);
const store = createStore({})
 
app.use(store);
console.log(store)
app.mount('#app')
```
app.use 注册插件（vue2 则为 Vue.use）时，会自动调用参数的 install 方法

```js
var storeKey = 'store'
...
Store.prototype.install = function install (app, injectKey) {
  app.provide(injectKey || storeKey, this);
  app.config.globalProperties.$store = this;
  // 下面的逻辑是开发环境启用开发工具的，核心代码是上面这两行
  var useDevtools = this._devtools !== undefined
    ? this._devtools
    : (process.env.NODE_ENV !== 'production') || __VUE_PROD_DEVTOOLS__;
 
  if (useDevtools) {
    addDevtools(app, this);
  }
};

```
将 vuex 的核心源码分 3 部分解读
### 创建 store
```js
var Store = function Store (options) {
  ...
  // 这部分就是前文控制台打印的诸多属性
  this._committing = false;
  this._actions = Object.create(null);
  this._actionSubscribers = [];
  this._mutations = Object.create(null);
  this._wrappedGetters = Object.create(null);
  this._modules = new ModuleCollection(options); // store._modules 持有参数转换的各种信息
  this._modulesNamespaceMap = Object.create(null);
  this._subscribers = [];
  this._makeLocalGettersCache = Object.create(null);
  this._devtools = devtools;
  ...
  var store = this;
  var ref = this;
  var dispatch = ref.dispatch;
  var commit = ref.commit;
  this.dispatch = function boundDispatch (type, payload) {
    return dispatch.call(store, type, payload)
  };
  this.commit = function boundCommit (type, payload, options) {
    return commit.call(store, type, payload, options)
  };
  // dispatch 和 commit 将原型上的同名方法重写，目的就是保证
  // 当解构 commit/dispatch 时，this 指向依旧为 store 实例。
  var state = this._modules.root.state;
  
  installModule(this, state, [], this._modules.root); // -----------特别关注
  resetStoreState(this, state); // -----------特别关注
  ...
}
```

- ModuleCollection 将参数 options 进行转换，本质是对 options 对象的包装与扩充，扩充结果作为 `store._modules` 的值

```js
// ModuleCollection
var ModuleCollection = function ModuleCollection (rawRootModule) {
  // rawRootModule 就是 createStore 的参数，由此，
  // 我们查找 ModuleCollection.prototype.register 方法
  this.register([], rawRootModule, false);
};
...
// 务必按照编号顺序理解 -----------(0)
9ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
  var this$1$1 = this;
  if ( runtime === void 0 ) runtime = true;
  ...
 
  var newModule = new Module(rawModule, runtime);
  if (path.length === 0) { // 模块是全局模块，挂在 root 属性下 -----------(1)
    this.root = newModule;
  } else { // 命名空间下的子模块，根据路径关系被父模块所引用 -----------(3)
    var parent = this.get(path.slice(0, -1));
    parent.addChild(path[path.length - 1], newModule);
    // -----------(4) 子模块最终在这里执行结束，根据 13、15 行，所有的模块均为 Module 实例
  }
 
  // rawModule 就是 createStore 的参数，如果定义了 modules 配置，就会对子模块
  // 一一注册，但 register 第一个参数不再是空数组，子模块会挂载对应的命名空间下
  if (rawModule.modules) { // -----------(2)
    forEachValue(rawModule.modules, function (rawChildModule, key) {
      this$1$1.register(path.concat(key), rawChildModule, runtime);
    });
  }
}
```
因为 Module 类的实现（下面的代码）我们知道（rawModule 是 createStore 的参数
options），Module 的实例通过 _rawModule 引用着最初的 options。结论就是，register 方法执行以后，ModuleCollection 实例引用 root（15行）module，root module 通过 addChild（18 行）将后代子模块的实例递归引用（在 _children 属性下）

```js
var Module = function Module (rawModule, runtime) {
  ...
  this._children = Object.create(null);
  this._rawModule = rawModule;
  ...
};
```

- installModule 的作用就是把 state、actions、mutations、getters 分别注册到相应的模块名称下

```js
function installModule (store, rootState, path, module, hot) {
  var isRoot = !path.length;
  var namespace = store._modules.getNamespace(path);
  if (module.namespaced) { // 模块指定命名空间时，会保存在 _modulesNamespaceMap 下
    store._modulesNamespaceMap[namespace] = module;
  }
  // state 的注册
  if (!isRoot && !hot) { // 初始化的子模块执行，状态会按照空间缓存在上层 state 下，⻅上 12 行
    var parentState = getNestedState(rootState, path.slice(0, -1));
    var moduleName = path[path.length - 1];
    store._withCommit(function () {
      parentState[moduleName] = module.state;
    });
  }
  
  var local = module.context = makeLocalContext(store, namespace, path);
  // 注册 mutations，效果⻅上方第 3~6 行
  module.forEachMutation(function (mutation, key) {
    var namespacedType = namespace + key;
    registerMutation(store, namespacedType, mutation, local);
  });
  // 注册 actions，效果与⻅上方第 25~28 行
  module.forEachAction(function (action, key) {
    var type = action.root ? key : namespace + key;
    var handler = action.handler || action;
    registerAction(store, type, handler, local);
  });
  // 注册 getters，上方 20~23 行
  module.forEachGetter(function (getter, key) {
    var namespacedType = namespace + key;
    registerGetter(store, namespacedType, getter, local);
  });
  // 遍历当前模块存在下级列表，进行递归注册，这次因为 path 参数"加⻓"了，所以会有第 8 行的逻辑
  module.forEachChild(function (child, key) {
    installModule(store, rootState, path.concat(key), child, hot);
  });
}
```

- resetStoreState 将树状结构的 state，统一使用 reactive 代理后，挂载 store._state 下，这样未来对 state的更新，将具有被追踪的能力。resetStoreState 除了初始化会调用，重置 store 时以及动态注册模块时都会用到。

```js
function resetStoreState (store, state, hot) {
  var oldState = store._state;
  ...
  store._state = reactive({
    data: state
  });
  ...
}
```

### store 分发

根据前文，store._modules.root.context 的输出结构如下：

```js
{
  "commit": Function,
  "dispatch": Function,
  "getters": Object,
  "state": {
    "count": 1,
    "moduleA": {"count": 1},
    "moduleB": {"count": 1}
  },
  "_children": [moduleA, moduleB]
}
```

实现一个函数，可以通过参数返回 state 中的不同部分，这个函数就是 mapState 比如这样：

```js
/* 
* 假如 path 是一个字符串数组，根据 mapState 的用法，
* 其返回值应当形如 { computedPropA(){}, computedPropB(){}, ... }
* 例如 mapState(['x', 'y']) 
* 返回值 { x() { return context.state.x; }, y() { return context.state.y} }
* 可以像下面这样(先忽略命名空间)
*/
// round 1
function mapState(path) {
  return path.reduce((prev, key) => ({
    ...prev,
    [key]() { 
      return context.state[key]
    }
  }), {});
}
// round 2 加上命名空间
function mapState(namespace, path) {
  return path.reduce((prev, key) => ({
    ...prev,
    [key]() { 
      return context.state[namespace][key]
    }
  }), {});
}
// round 3 参数类型扩展，允许 key-value 形态
function mapState(namespace, states) {
  const path = normalizeMap(states) // 转化一下参数类型
  return path.reduce((prev, key) => ({
    ...prev,
    [key]() { 
      return context.state[namespace][key]
    }
  }), {});
}
// round 4 context 作为上下文，直接从组件实例中取
function mapState(namespace, states) {
  const path = normalizeMap(states)
  return path.reduce((prev, key) => ({
    ...prev,
    [key]() {
      const state = this.$store.state; // 还记得最开始 install 时的 provide 吗
      return state[namespace][key]
    }
  }), {});
}
// round 5 上面要么取的全局空间的状态，要么取命名空间的状态，都要的话怎么办？加入函数！
function mapState(namespace, states) {
  const path = normalizeMap(states)
  return path.reduce((prev, key) => ({
    ...prev,
    [key]() {
     const state = this.$store.state;
     const getters = this.$store.getters;
     return typeof key === 'function' ? key(state, getters) : state[namespace][key]
    }
  }), {});
}
// 真实的使用场景 1：默认全局空间使用 state
computed: {
  ...mapState({
    a: (state, getters) => state.moduleA.count,
    globalCount: (state, getters) => state.count
  })
}
// 真实的使用场景 2：
computed: {
  ...mapState('moduleA', ['count']) // 模块 A 的数据
}
// 真实的使用场景 3：
computed: { // 带命名空间访问 this['moduleB/count']，略丑
  ...mapState(['moduleA/count', 'moduleB/count'])
}
// 真实的使用场景 4：同 2，但可以重命名
computed: {
  ...mapState('moduleB', {
    countB: state => state.count
  })
}
// 真实的使用场景 5：提前固定命名空间
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('moduleA')
 
computed: {
  // 下面的参数 state 就是 context.state.moduleA 了
  ...mapState({
    countA: state => state.count
  })
}
```

源码实现：

```js
var mapState = normalizeNamespace(function (namespace, states) {
  var res = {};
  normalizeMap(states).forEach(function (ref) {
    var key = ref.key;
    var val = ref.val;
 
    res[key] = function mappedState () {
      var state = this.$store.state;
      var getters = this.$store.getters;
      if (namespace) {
        var module = getModuleByNamespace(this.$store, 'mapState', namespace);
        if (!module) {
          return
        }
        state = module.context.state;
        getters = module.context.getters;
      }
      return typeof val === 'function'
        ? val.call(this, state, getters)
        : state[val]
    };
    // mark vuex getter for devtools
    res[key].vuex = true;
  });
  return res
})
```
mapActions，mapMutations，mapGetters 同理

### state 变更引发副作用和视图更

```js
import { inject, reactive, watch } from 'vue' 
...
function resetStore (store, hot) {
  ...
  store._state = reactive({
    data: state
  });
}
```

如果像下面这样写就会发现触发 store.state 的变更将不能引发⻚面的更新：
```js
store._state = {
  data: state
}
```

reactive 的逻辑对一个对象的访问进行了深度代理，所以当执行this.$store.commit => mutations => state.count++ 时，track 了 count 属性的副作用函数、render函数（template 编译结果），将会重新调用。eg：

```vue 
// App.vue
<script>
effect(() => {
  console.log(getters.countByGetter)
})
</script>
<template>
   <!-- <pre>{{ JSON.stringify(store, null, 2) }}</pre> -->
  <button @click="dispatch('add')">++ {{getters.countByGetter}}</button>
  <HelloWorld />
</template>
```

按钮的点击更改了 store.state.count，计算值 store.getters.countByGetter 初次使用时已经被追踪了（effect 和 render 两处），所以点击导致的状态变化，将引发 effect 的回调、render 的重新执行
