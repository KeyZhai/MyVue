import { extend } from '@my-vue/shared'

// ====================== 核心响应式系统实现 ======================
// 使用 WeakMap 建立 target 对象与依赖映射的关系（内存泄漏防护）
let activeEffect: ReactiveEffect | undefined // 当前激活的 effect 实例
let shouldTrack: boolean // 控制是否进行依赖收集的开关

// 响应式副作用容器类
export class ReactiveEffect {
  private _fn: Function      // 原始的副作用函数
  public scheduler?: Function // 可选的调度函数（用于异步更新等场景）
  deps: Set<ReactiveEffect>[] = [] // 当前 effect 依赖的所有 dep 集合
  onStop?: () => void       // 停止监听时的回调函数
  active = true             // 是否处于激活状态（stop 后变为 false）

  constructor(fn: Function, scheduler?: Function) {
    this._fn = fn
    this.scheduler = scheduler
  }

  // 执行副作用函数并收集依赖
  run() {
    // 已停用的 effect 直接执行函数但不收集依赖
    if (!this.active) return this._fn()
    
    // 开启依赖收集开关
    shouldTrack = true
    activeEffect = this
    const result = this._fn() // 执行原始函数
    
    // 重置开关防止非 effect 触发时的依赖收集
    shouldTrack = false
    return result
  }

  // 停止当前 effect 的响应式监听
  stop() {
    if (this.active) {
      cleanupEffect(this)    // 清理所有依赖关系
      this.onStop?.()        // 执行停止回调
      this.active = false    // 标记为停用状态
    }
  }
}

// ====================== 依赖清理 ======================
// 清理 effect 与所有 dep 的关联关系
function cleanupEffect(effect: ReactiveEffect) {
  effect.deps.forEach(dep => dep.delete(effect)) // 从每个 dep 中删除当前 effect
  effect.deps.length = 0 // 清空依赖集合数组
}

// ====================== 依赖收集系统 ======================
type TargetKey = string | symbol
const targetMap = new WeakMap<object, Map<TargetKey, Set<ReactiveEffect>>>()

// 跟踪依赖：建立 target.key -> effects 的映射
export function track(target: object, key: TargetKey) {
  if (!isTracking()) return // 检查是否处于依赖收集状态

  // 初始化三级映射结构
  let depsMap = targetMap.get(target)
  if (!depsMap) targetMap.set(target, (depsMap = new Map()))
  
  let dep = depsMap.get(key)
  if (!dep) depsMap.set(key, (dep = new Set()))
  
  trackEffects(dep)
}

// 将当前激活的 effect 添加到依赖集合
export function trackEffects(dep: Set<ReactiveEffect>) {
  if (dep.has(activeEffect!)) return // 避免重复收集
  dep.add(activeEffect!)
  activeEffect!.deps.push(dep) // 双向记录，便于清理
}

// 判断当前是否处于依赖收集状态
export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}

// ====================== 触发更新 ======================
// 触发指定 target.key 的所有副作用
export function trigger(target: object, key: TargetKey) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const dep = depsMap.get(key)
  dep && triggerEffects(dep)
}

// 执行所有 effect 的更新（支持调度器）
export function triggerEffects(dep: Set<ReactiveEffect>) {
  for (const effect of dep) {
    effect.scheduler ? effect.scheduler() : effect.run()
  }
}

// ====================== 副作用 API ======================
// 创建并运行一个响应式副作用
export function effect(
  fn: Function,
  options: { scheduler?: Function; onStop?: () => void } = {}
) {
  const _effect = new ReactiveEffect(fn, options.scheduler)
  extend(_effect, options) // 合并选项（如 onStop）

  _effect.run() // 立即执行首次收集依赖
  
  // 返回可控制副作用的 runner 函数
  const runner: any = _effect.run.bind(_effect)
  runner.effect = _effect // 挂载 effect 实例便于外部访问
  return runner
}

// 停止指定 runner 的响应式监听
export function stop(runner: any) {
  runner.effect.stop() // 通过 runner 反向访问 effect 实例
}
