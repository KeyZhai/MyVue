import { effect } from "../src/effect";
import { reactive } from "../src/reactive";
import { ref, isRef, unRef, proxyRefs } from "../src/ref";
import { describe, it, expect } from "vitest";

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  }),
    it("should be reactive", () => {
      const a = ref(1);
      let dummy;
      let calls = 0;
      effect(() => {
        calls++;
        dummy = a.value;
      });
      expect(calls).toBe(1);
      expect(dummy).toBe(1);
      a.value = 2;
      expect(calls).toBe(2);
      expect(dummy).toBe(2);
      // same value should not trigger
      a.value = 2;
      expect(calls).toBe(2);
      expect(dummy).toBe(2);
    }),
    it("should make nested properties reactive", () => {
      const a = ref({
        count: 1,
      });
      let dummy;
      effect(() => {
        dummy = a.value.count;
      });
      expect(dummy).toBe(1);
      a.value.count = 2;
      expect(dummy).toBe(2);
    });
  it("isRef", () => {
    const a = ref(1);
    const user = reactive({
      age: 1,
    });
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user.age)).toBe(false);
  });

  it("unRef", () => {
    const a = ref(1);
    expect(unRef(a)).toBe(1);
    expect(unRef(1)).toBe(1);
  });

  it("proxyRefs", () => {
    const user = {
      age: ref(1),
      name: "xiaoming",
    };
    const proxyUser = proxyRefs(user);
    expect(proxyUser.age).toBe(1);
    expect(proxyUser.name).toBe("xiaoming");
    proxyUser.age = 2;
    expect(proxyUser.age).toBe(2);
  });
});
