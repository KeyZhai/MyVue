import { reactive } from "../src/reactive";
import { watch } from "../src/watch";
import { describe, it, expect } from "vitest";
describe("watch", () => {
  it("happy path with getter", () => {
    const original = reactive({
      count: 0,
    });
    let dummy;
    let oldValue, newValue;
    watch(
      () => original.count,
      (count, preCount) => {
        dummy = "foo";
        newValue = count; 
        oldValue = preCount;
      }
    );
    expect(dummy).toBe(undefined);
    original.count++;
    expect(dummy).toBe("foo");
    expect(newValue).toBe(1);
    expect(oldValue).toBe(0);
  });
});
