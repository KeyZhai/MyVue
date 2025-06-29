import { ref, h } from '../../dist/minivue.esm.js'
const nextChildren = "newChildren"
const preChildren = [h("div", {}, "A"), h("div", {}, "B")]

export default {
  name: 'ArrayToText',
  setup () {
    const isChange = ref(false)
    window.isChange = isChange
    return {
      isChange
    }
  },
  render () {
    const self = this
    return self.isChange === true
      ? h("div", {}, nextChildren)
      : h("div", {}, preChildren)
  }
}
