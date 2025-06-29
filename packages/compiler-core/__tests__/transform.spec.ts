import { NodeTypes } from "../src/ast";
import { baseParse } from "../src/parse";
import { transform } from "../src/transform";
import { describe, it, expect } from "vitest";

describe("transform", () => {
  it("happy path", () => {
    const ast = baseParse("<div>hi,{{message}}</div>");
    // 插件体系，在外部修改ast，由外部进行控制
    const plugin = (node) => {
      if (node.type === NodeTypes.TEXT) {
        node.content = node.content + "mini-vue";
      }
    };
    transform(ast, {
      nodeTransforms: [plugin],
    });
    const nodeText = ast.children[0].children[0];
    expect(nodeText.content).toBe("hi,mini-vue");
  });
});
