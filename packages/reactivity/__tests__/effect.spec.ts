import { reactive } from '../src/reactive'
import { effect } from '../src/effect'
import { stop } from '../src/effect'
import { vi } from 'vitest'
describe('effect', () => {
  it('happy path', () => {
    const user = reactive({
      age: 10,
    })
    let nextAge
    effect(() => {
      nextAge = user.age + 1
    })
    expect(nextAge).toBe(11)
    user.age++
    expect(nextAge).toBe(12)
  })

  it('should return runner when call effect', () => {
    // 调用effect会返回effect的runner
    // 调用runner会返回this._fn的执行结果 => foo
    let foo = 10
    const runner = effect(() => {
      foo++
      return 'foo'
    })
    expect(foo).toBe(11)
    const r = runner()
    expect(foo).toBe(12)
    expect(r).toBe('foo')
  })

  it('scheduler', () => {
    // 1.通过effect的第二个参数给定的一个scheduler函数
    // 2.effect第一次执行的时候还会执行fn
    // 3.当依赖的数据变化的时候，不会执行fn，而是调用scheduler
    // 4.当调用runner的时候，会执行fn
    let dummy
    let run: any
    const scheduler = vi.fn(() => {
      run = runner
    })
    const obj = reactive({ foo: 1 })
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      { scheduler }
    )
    expect(scheduler).not.toHaveBeenCalled()
    expect(dummy).toBe(1)
    // should be called on first trigger
    obj.foo++
    expect(scheduler).toHaveBeenCalledTimes(1)
    expect(dummy).toBe(1)
    // manually run
    run()
    expect(dummy).toBe(2)
  })

  it('stop', () => {
    let dummy
    const obj = reactive({ prop: 1 })
    const runner = effect(() => {
      dummy = obj.prop
    })
    obj.prop = 2
    expect(dummy).toBe(2)
    // dummy = 2
    stop(runner)
    // 停止effect
    obj.prop = 3
    // obj.prop = obj.prop + 1
    // obj.prop++ =>失败 原因：obj.prop还会再触发一次get，导致依赖白清理了
    expect(dummy).toBe(2)
  })

  it('onStop', () => {
    // onStop是effect的第二个参数
    // 当effect被停止的时候，会执行onStop
    const obj = reactive({ foo: 1 })
    const onStop = vi.fn()
    let dummy
    const runner = effect(
      () => {
        dummy = obj.foo
      },
      {
        onStop,
      }
    )
    stop(runner)
    expect(onStop).toHaveBeenCalledTimes(1)
  })
})
