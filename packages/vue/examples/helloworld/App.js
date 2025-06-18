import { h } from '../../dist/minivue.esm.js'
export const Provider = {
  name: "Provider",
  setup () {
    return {
      msg:"mini vue"
    }
  },
  render () {
    return h("div", {id:"root",class:["red","green"],onClick(){console.log("click")}}, "hi " + this.msg)
  }
}
