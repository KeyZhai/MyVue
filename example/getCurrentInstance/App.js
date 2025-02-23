import { h, getCurrentInstance } from "../../dist/minivue.esm.js"
import { Foo } from "./Foo.js"

export const App = {
  name: "app",
  render () {
    return h("div", {}, [h("p", {}, "currentInstance:demo"), h(Foo)])
  },
  setup () {
    const instance = getCurrentInstance()
    console.log(instance)
  }
}