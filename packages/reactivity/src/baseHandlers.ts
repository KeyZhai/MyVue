import { track, trigger } from './effect'
import { reactive, ReactiveFlags,readonly } from './reactive'
import { isObject,extend } from '@my-vue/shared'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    }
    if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key)
    if (shallow) {
      return res
    }
    // 看看res是不是object，如果是，递归代理
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res)
    }
    // 收集依赖
    if (!isReadonly) {
      track(target, key)
    }
    return res
  }
}
function createSetter() {
  return function set(target, key, value) {
    const res = Reflect.set(target, key, value)
    // 收集依赖
    trigger(target, key)
    return res
  }
}

export const reactiveHandlers = {
  get,
  set,
}

export const readonlyHandlers = {
  get: readonlyGet,
  set: function (target, key, value) {
    console.warn(`key:${key} set failed because it is readonly`)
    return true
  },
}

// 使用 extend 函数将 readonlyHandlers 对象的属性扩展到一个新的对象中，
// 并覆盖或添加一个新的 get 属性，该属性的值是 createGetter(true, true) 的返回值。
export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
})
