import { ShapeFlags } from "@my-vue/shared";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export { createVNode as createElementVNode };

export function createVNode(type, props?, children?) {
  const vnode = {
    type,
    props,
    children,
    component: null,
    key: props && props.key,
    shapeFlag: getShapedFlags(type),
    el: null,
  };
  // chilren
  if (typeof children == "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  } else if (Array.isArray(children)) {
    vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
  }
  // 组件 + children object
  //& 进行运算，判断shapeFlage是否为StatefulComponent
  if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
    if (typeof children == "object") {
      vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
    }
  }

  // 返回一个vNode
  return vnode;
}

export function createTextVnode(text) {
  // 传入的text被当作children处理
  return createVNode(Text, {}, text);
}

function getShapedFlags(type) {
  return typeof type == "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}
