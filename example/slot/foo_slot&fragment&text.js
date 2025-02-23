import { h, renderSlots } from "../../dist/minivue.esm.js"
export const Foo = {
  setup () {
    return {}
  }
  ,
  render () {
    const age = 18
    const foo = h('p', {}, "foo")
    // vnode => children
    return h("div", {}, [renderSlots(this.$slots, "header", { age }), foo, renderSlots(this.$slots, "footer")])
  }
}