import { computed } from "../src/computed";
import { reactive } from "../src/reactive";
import { describe, it, expect } from "vitest";
import { vi } from "vitest";
describe("computed", () => {
  it("happy path", () => {
    //使用.value获取值
    const user = reactive({
      age: 1,
    });
    //因为当依赖的值发生变化时，age会自动更新
    //所以需要对age进行收集依赖 => 创建一个 effect 对象
    const age = computed(() => {
      return user.age;
    });
    //访问.value时，触发getter，进行依赖收集
    //同时设置_dirty 为false,进行缓存
    expect(age.value).toBe(1);
  });

  // 实现缓存
  it("should computed lazy", () => {
    const value = reactive({
      foo: 1,
    });
    const getter = vi.fn(() => {
      return value.foo;
    });
    //因为当依赖的值发生变化时，age会自动更新
    //所以需要对age进行收集依赖 => 创建一个 effect 对象
    const cValue = computed(getter);
    // lazy,如果不调用.value，getter不会执行
    expect(getter).not.toHaveBeenCalled();
    // 调用.value，getter执行
    // 将dirty设置为false，实现缓存
    // 将上述创建的effect收集到value.foo的Set中
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);
    // 不会重新执行getter，直接返回缓存的值
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);
    value.foo = 2;
    // 传入了scheduler，所以不会执行传入的函数,而是会触发scheduler
    // 触发scheduler，将dirty设置为true
    // 此时没有触发run()方法，所以value.foo被修改了，但是还未更新
    // 只有再次访问的时候才会重新执行getter
    expect(getter).toHaveBeenCalledTimes(1);
    // 重新执行getter
    expect(cValue.value).toBe(2);
  });
});
