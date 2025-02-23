import { h } from '../../dist/minivue.esm.js'
import ArrayToArray from './ArrayToArray.js'
export const App = {
  name: "App",
  setup () { },
  render () {
    return h("div", { tId: 1 }, [
      h('p', {}, "主页"),
      h(ArrayToArray)
    ])
  }
}