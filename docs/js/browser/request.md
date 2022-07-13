# 浏览器请求相关内容

## ajax  及 fetch API 详解
1. XMLHTTPRequest
```js
let xhr = new XMLHttpRequest();
xhr.open('GET', 'http://domain/service');

// request state change event
xhr.onreadystatechange = function () {
    // request completed?
    if (xhr.readyState !== 4) return;

    if (xhr.status === 200) {
        // request successful - show response
        console.log(xhr.responseText);
    } else {
        // request error
        console.log('HTTP error', xhr.status, xhr.statusText);
    }
};

// xhr.timeout = 3000; // 3 seconds
// xhr.ontimeout = () => console.log('timeout', xhr.responseURL);

// progress事件可以报告长时间运行的文件上传
// xhr.upload.onprogress = p => {
//     console.log(Math.round((p.loaded / p.total) * 100) + '%');
// }

// start request
xhr.send();
```
2. fetch

- 默认不带cookie
- 错误不会reject
- 不支持超时设置
- 需要借用AbortController中止fetch


```js
fetch(
        'http://domain/service', {
            method: 'GET'
        }
    )
    .then(response => response.json())
    .then(json => console.log(json))
    .catch(error => console.error('error:', error));

// 默认不带cookie

fetch(
    'http://domain/service', {
        method: 'GET',
        credentials: 'same-origin'
    }
)

// 错误不会reject
// HTTP错误（例如404 Page Not Found 或 500 Internal Server Error）
// 不会导致Fetch返回的Promise标记为reject；.catch()也不会被执行。
// 想要精确的判断 fetch是否成功，需要包含 promise resolved 的情况
// 此时再判断 response.ok是不是为 true

fetch(
        'http://domain/service', {
            method: 'GET'
        }
    )
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Network response was not ok.');
    })
    .then(json => console.log(json))
    .catch(error => console.error('error:', error));

// 不支持直接设置超时, 可以用promise
function fetchTimeout(url, init, timeout = 3000) {
    return new Promise((resolve, reject) => {
        fetch(url, init)
            .then(resolve)
            .catch(reject);
        setTimeout(reject, timeout);
    })
}

// 中止fetch
const controller = new AbortController();

fetch(
        'http://domain/service', {
            method: 'GET',
            signal: controller.signal
        })
    .then(response => response.json())
    .then(json => console.log(json))
    .catch(error => console.error('Error:', error));

controller.abort();
```
## 常见的浏览器请求/响应头/错误码解析

### request header
:method: GET  
:path: /solar-comment/api/comment/tutor-primary-activity/senior-recommend/users/  self?tagSource=&_productId=351&_appId=0  
:scheme: https  
accept: application/json, text/plain, */*  
accept-encoding: gzip, deflate, br  
cache-control: no-cache  
cookie: deviceId=c122305d338525616baea870cc7.....  
origin: https://m.yuanfudao.biz  
referer: https://m.yuanfudao.biz/primary/market/senior-recommend/reserve  
user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1  

### response header
access-control-allow-credentials: true  
access-control-allow-origin: https://m.yuanfudao.biz  
content-encoding: gzip  
content-type: application/json;charset=UTF-8  
date: Thu, 06 Aug 2020 08:15:05 GMT  
set-cookie: sess=QvrAQ0....  
set-cookie: userid=172270653;domain=.yuanfudao.biz;path=/;HttpOnly  
status: 200  

### status状态码
200	get 成功  
201 post 成功  
301 永久重定向  
302	临时重定向  
304 协商缓存 服务器文件未修改  
400	客户端请求有语法错误，不能被服务器识别  
403	服务器受到请求，但是拒绝提供服务，可能是跨域  
404	请求的资源不存在  
405 请求的method不允许  
500	服务器发生不可预期的错误  

## 发送请求的示例，以及封装一个多浏览器兼容的请求函数(ts实现)
```ts
interface IOptions {
    url: string;
    type?: string;
    data: any;
    timeout?: number;
}

function formatUrl(json) {
    let dataArr = [];
    json.t = Math.random();
    for (let key in json) {
        dataArr.push(`${key}=${encodeURIComponent(json[key])}`)
    }
    return dataArr.join('&');
}

export function ajax(options: IOptions) {
    return new Promise((resolve, reject) => {
        if (!options.url) return;

        options.type = options.type || 'GET';
        options.data = options.data || {};
        options.timeout = options.timeout || 10000;
    
        let dataToUrlstr = formatUrl(options.data);
        let timer;
    
        // 1.创建
        let xhr;
        if ((window as any).XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else {
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
    
        if (options.type.toUpperCase() === 'GET') {
            // 2.连接
            xhr.open('get', `${options.url}?${dataToUrlstr}`, true);
            // 3.发送
            xhr.send();
        } else if (options.type.toUpperCase() === 'POST') {
            // 2.连接
            xhr.open('post', options.url, true);
            xhr.setRequestHeader('ContentType', 'application/x-www-form-urlencoded');
            // 3.发送
            xhr.send(options.data);
        }
    
        // 4.接收
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                clearTimeout(timer);
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.status);
                }
            }
        }
    
        if (options.timeout) {
            timer = setTimeout(() => {
                xhr.abort();
                reject('超时');
            }, options.timeout)
        }

        // xhr.timeout = options.timeout;
        // xhr.ontimeout = () => {
        //     reject('超时');
        // }
    });
}
```