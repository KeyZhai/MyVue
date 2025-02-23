import { h, createTextVnode } from "../../dist/minivue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  name: "app",
  render () {
    const app = h('div', {}, "app")
    // 将h添加到foo组件标签内
    // object => key 比通过下标获取位置更好
    const foo = h(Foo, {}, {
      header: ({ age }) => [h("p", {}, "header" + age), createTextVnode("nihaoya")],
      footer: () => h("p", {}, "footer")
    })
    return h("div", {}, [app, foo])
  },
  setup () {
    return {}
  }
}