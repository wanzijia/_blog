# 事件捕获，冒泡

浏览器事件模型中的过程主要分为三个阶段：捕获阶段、目标阶段、冒泡阶段。

## 第三个参数

这里要注意addEventListener的第三个参数, 如果为true，就是代表在捕获阶段执行。如果为false，就是在冒泡阶段进行

## 阻止事件传播
- e.stopPropagation()

大家经常听到的可能是阻止冒泡，实际上这个方法不只能阻止冒泡，还能阻止捕获阶段的传播。

- stopImmediatePropagation() 
如果有多个相同类型事件的事件监听函数绑定到同一个元素，当该类型的事件触发时，它们会按照被添加的顺序执行。如果其中某个监听函数执行了 event.stopImmediatePropagation() 方法，则当前元素剩下的监听函数将不会被执行。

## 阻止默认行为

e.preventDefault()

e.preventDefault()可以阻止事件的默认行为发生，默认行为是指：点击a标签就转跳到其他页面、拖拽一个图片到浏览器会自动打开、点击表单的提交按钮会提交表单等等，因为有的时候我们并不希望发生这些事情，所以需要阻止默认行为


## 兼容性

attachEvent——兼容：IE7、IE8； 不支持第三个参数来控制在哪个阶段发生，默认是绑定在冒泡阶段
addEventListener——兼容：firefox、chrome、IE、safari、opera；

## 封装一个多浏览器兼容的绑定事件函数

```js
class BomEvent {
    constructor(element) {
        this.element = element;
    }

    addEvent(type, handler) {
        if (this.element.addEventListener) {
            //事件类型、需要执行的函数、是否捕捉
            this.element.addEventListener(type, handler, false);
        } else if (this.element.attachEvent) {
            this.element.attachEvent('on' + type, function () {
                handler.call(element);
            });
        } else {
            this.element['on' + type] = handler;
        }
    }

    removeEvent(type, handler) {
        if (this.element.removeEnentListener) {
            this.element.removeEnentListener(type, handler, false);
        } else if (element.datachEvent) {
            this.element.detachEvent('on' + type, handler);
        } else {
            this.element['on' + type] = null;
        }
    }
}
// 阻止事件 (主要是事件冒泡，因为IE不支持事件捕获)
function stopPropagation(ev) {
    if (ev.stopPropagation) {
        ev.stopPropagation(); // 标准w3c
    } else {
        ev.cancelBubble = true; // IE
    }
}
// 取消事件的默认行为
function preventDefault(event) {
    if (event.preventDefault) {
        event.preventDefault(); // 标准w3c
    } else {
        event.returnValue = false; // IE
    }
}
```