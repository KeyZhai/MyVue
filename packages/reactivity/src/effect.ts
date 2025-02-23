import { extend } from '@my-vue/shared'

let activeEffect
let shouldTrack

export class ReactiveEffect {
  private _fn: Function
  public scheduler: Function | undefined
  deps: any[] = []
  onStop?: () => void
  active = true

  constructor(fn, scheduler?: Function) {
    this._fn = fn
    if (scheduler) {
      this.scheduler = scheduler
    }
  }

  run() {
    // 1，调用fn，收集依赖
    // 2.使用shouldTrack来判断是否收集依赖
    if (!this.active) {
      return this._fn()
    }
    shouldTrack = true
    activeEffect = this
    const result = this._fn()
    // reset
    shouldTrack = false
    return result
  }

  stop() {
    if (this.active) {
      cleanupEffect(this)
      if (this.onStop) {
        this.onStop()
      }
      this.active = false
    }
  }
}

function cleanupEffect(effect) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect)
  })
  effect.deps.length = 0
}

let targetMap = new WeakMap()
export function track(target, key) {
  // if (!activeEffect) return
  // // 用来判断应不应该收集变量，优化stop
  // if (!shouldTrack) return

  if (!isTracking()) return

  // targetMap => target => key => Set<effect>
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }
  trackEffects(dep)
}

export function trackEffects(dep) {
  if (dep.has(activeEffect)) return
  dep.add(activeEffect)
  activeEffect.deps.push(dep)
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
  let depsMap = targetMap.get(target)
  let dep = depsMap.get(key)
  triggerEffects(dep)
}

export function triggerEffects(dep) {
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler()
    } else {
      effect.run()
    }
  }
}

export function effect(fn, options: any = {}) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  // 相当于Object.assign(_effect, options) => _effect.onStop = options.onStop
  extend(_effect, options)
  _effect.run()
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect
  return runner
}

export function stop(runner) {
  runner.effect.stop()
}
