// h来创建虚拟节点
export { h } from './h'
export { createRenderer } from './renderer'
export { renderSlots } from './helpers/renderSlots'
export { createTextVnode, createElementVNode } from './vnode'
export { getCurrentInstance, registerRuntimeCompiler } from './component'
export { provide, inject } from './apiInject'
export { nextTick } from './scheduler'
export { toDisplayString } from '@my-vue/shared'
// runtime-core => 依赖 reactivity
export * from '@my-vue/reactivity'
