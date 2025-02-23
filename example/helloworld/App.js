import { h, provide, inject } from '../../dist/minivue.esm.js'
export const Provider = {
  name: "Provider",
  setup () {
    provide("foo", "fooVal")
    provide("bar", "barVal")
  },
  render () {
    return h("div", {}, [h("p", {}, "Provider"), h(Provider2)])
  }
}

export const Provider2 = {
  name: "Provider2",
  setup () {
    provide("foo", "footwo")
    const foo = inject("foo")
    return {
      foo
    }
  },
  render () {
    return h("div", {}, [h("p", {}, "Provider2" + this.foo), h(Consumer)])
  }
}

const Consumer = {
  name: "Consumer",
  setup () {
    const foo = inject("foo")
    const bar = inject("bar")
    const baz = inject("baz", "defaultvalue")

    return {
      foo,
      bar,
      baz
    }
  },
  render () {
    return h("div", {}, `consumer - ${this.foo} - ${this.bar}`)
  }
}