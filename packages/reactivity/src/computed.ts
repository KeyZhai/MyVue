import { ReactiveEffect } from './effect'
class computedImpl {
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  private _effect: any
  constructor(getter) {
    this._getter = getter
    //没调用effect，不会执行getter，只是创建一个effect
    this._effect = new ReactiveEffect(this._getter, () => {
      //scheduler
      if (!this._dirty) {
        this._dirty = true
      }
    })
  }

  get value() {
    // _dirty实现缓存
    if (this._dirty) {
      this._dirty = false
      // 收集依赖
      //第一次触发时，会执行getter，返回user.age
      //把this._effect激活，同时执行fn时会触发getter，收集依赖
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new computedImpl(getter)
}
