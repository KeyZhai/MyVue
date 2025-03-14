import { vi } from "vitest";
import { isReadonly, shallowReadonly } from "../src/reactive";
import { readonly } from "../src/reactive";
import { describe, it, expect, test } from "vitest";

describe("shallowReadonly", () => {
  test("should not make non-reactive properties reactive", () => {
    const props = shallowReadonly({ n: { foo: 1 } });
    expect(isReadonly(props)).toBe(true);
    expect(isReadonly(props.n)).toBe(false);
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
