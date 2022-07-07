# Promise
[[toc]]
1. PromiseA+规范
1. PromiseA+规范
1. PromiseA+规范
1. PromiseA+规范



## Promise.all
`sdsad`

## Promise.race

`sdsad`

## Promise.prototype.finally

```js
    Promise.prototype.finally = function (callback) {
        return this.then(
            (value) => {
                return Promise.resolve(callback()).then(() => value)
            },
            (err) => {
                return Promise.resolve(callback()).then(() => { throw err })
            }
        )
    }
```


## 箭头函数

