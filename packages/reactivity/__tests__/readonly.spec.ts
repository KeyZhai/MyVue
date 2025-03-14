import { vi } from "vitest";
import { readonly, isProxy } from "../src/reactive";
import { describe, it, expect } from "vitest";
describe("readonly", () => {
  it("happy path", () => {
    // readonly只是对数据进行了一个浅层的只读代理
    const original = { foo: 1 };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
    expect(isProxy(wrapped)).toBe(true);
  });

  it("warn when call set", () => {
    console.warn = vi.fn();
    const user = readonly({
      age: 10,
    });
    user.age = 11;
    expect(console.warn).toBeCalled();
  });
});
