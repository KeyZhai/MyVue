import { h, getCurrentInstance } from "../../dist/minivue.esm.js"
export const Foo = {
  name: "Foo",
  setup () {
    const instance = getCurrentInstance()
    console.log(instance)
    return {}
  },
  render () {
    return h('div', {}, 'Foo')
  }
}