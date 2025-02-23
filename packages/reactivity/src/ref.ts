import { trackEffects, triggerEffects } from './effect'
import { isTracking } from './effect'
import { reactive } from './reactive'
import { hasChanged, isObject } from '@my-vue/shared'

// ref是1 true "1"
// get set
// proxy => reactive => object

class RefIpml {
  private _value: any
  public dep
  public _rawValue: any
  public _v_isRef = true
  constructor(value) {
    this._rawValue = value
    //1. if value is object, reactive it
    this._value = convert(value)
    this.dep = new Set()
  }
  get value() {
    if (isTracking()) {
      trackEffects(this.dep)
    }
    return this._value
  }
  set value(newValue) {
    // 如果新值和旧值相等，不做任何操作
    // 当value是对象的时候，它是一个proxy对象，此时的对比是两个普通对象的对比
    //创建一个rawValue，用来存储原始值
    if (hasChanged(this._rawValue, newValue)) {
      this._rawValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.dep)
    }
  }
}

function convert(value) {
  return isObject(value) ? reactive(value) : value
}

export function ref(value) {
  return new RefIpml(value)
}

export function isRef(ref) {
  return !!ref._v_isRef
}

export function unRef(ref) {
  // 看看是不是ref对象，如果是，返回value，否则返回原值
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      // 如果里面是一个 ref 类型的话，那么就返回 .value
      // 如果不是的话，那么直接返回value 就可以了
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      // 如果是一个 ref 类型的话，那么就直接设置 value
      // 如果不是的话，那么就直接设置 value
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value)
      } else {
        return Reflect.set(target, key, value)
      }
    },
  })
}
