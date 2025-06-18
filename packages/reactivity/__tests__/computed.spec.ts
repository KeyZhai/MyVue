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
    const age = computed(() => {
      return user.age;
    });
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
    const cValue = computed(getter);
    // lazy,如果不调用.value，getter不会执行
    expect(getter).not.toHaveBeenCalled();
    // 调用.value，getter执行
    //将dirty设置为false，实现缓存
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);
    // 不会重新执行getter，直接返回缓存的值
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);
    value.foo = 2;
    // 不会重新执行getter
    expect(getter).toHaveBeenCalledTimes(1);
    // 重新执行getter
    expect(cValue.value).toBe(2);
  });
});
