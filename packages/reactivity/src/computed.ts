import { ReactiveEffect } from './effect'
class computedImpl {
  private _getter: any
  private _dirty: boolean = true
  private _value: any
  private _effect: any
  constructor(getter) {
    this._getter = getter
    this._effect = new ReactiveEffect(this._getter, () => {
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
      this._value = this._effect.run()
    }
    return this._value
  }
}

export function computed(getter) {
  return new computedImpl(getter)
}
