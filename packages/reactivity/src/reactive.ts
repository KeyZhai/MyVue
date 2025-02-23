import { isObject } from '@my-vue/shared'
import {
  reactiveHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers'
export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadonly',
}
// 实现reactive
export function reactive(raw) {
  return createActiveObject(raw, reactiveHandlers)
}
// 实现readonly
export function readonly(raw) {
  return createActiveObject(raw, readonlyHandlers)
}

// 实现shallowReadonly
export function shallowReadonly(raw) {
  return createActiveObject(raw, shallowReadonlyHandlers)
}

// 实现isProxy
export function isProxy(value) {
  return isReactive(value) || isReadonly(value)
}

const createActiveObject = function (raw: any, baseHandlers) {
  if (!isObject(raw)) {
    console.warn(`target:${raw} 必须是一个对象`)
    return raw
  }
  return new Proxy(raw, baseHandlers)
}

// 实现isReactive
export function isReactive(value) {
  // value[key]会触发get方法，key与传入的ReactiveFlags.IS_REACTIVE相等时，返回true
  // 如果不是reactive对象，不会触发get，返回undefined，！！转为boolean值为false
  return !!value[ReactiveFlags.IS_REACTIVE]
}

// 实现isReadonly
export function isReadonly(value) {
  return !!value[ReactiveFlags.IS_READONLY]
}
