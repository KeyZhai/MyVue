import { createRenderer } from "@my-vue/runtime-core";

function createElement(type) {
  return document.createElement(type);
}

function patchProp(el, key, preVal, nextVal) {
  const isOn = (key: string) => /^on[A-Z]/.test(key);
  if (isOn(key)) {
    const event = key.slice(2).toLowerCase();
    el.addEventListener(event, nextVal);
  }
  if (nextVal === undefined || nextVal === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, nextVal);
  }
}

// anchor指定diff算法后面多于前面的元素的插入位置
function insert(child, parent, anchor) {
  //将child插入到parent的anchor节点之前
  parent.insertBefore(child, anchor || null);
}

function remove(el) {
  const parent = el.parentNode;
  if (parent) {
    parent.removeChild(el);
  }
}

function setElementText(el, text) {
  el.textContent = text;
}

const renderer: any = createRenderer({
  createElement,
  patchProp,
  insert,
  remove,
  setElementText,
});

// ...args表示可以传递任意数量的参数
// 柯里化
export function createApp(...args) {
  //createApp返回app对象，app对象上有mount方法
  //render : 渲染器,创建出一个具有平台特定渲染能力的渲染器实例
  return renderer.createApp(...args);
}

// runtime-dom => 依赖 runtime-core
export * from "@my-vue/runtime-core";
