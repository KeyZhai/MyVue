import { h, ref } from '../../dist/minivue.esm.js'
export const App = {
  name: "App",
  setup () {
    const count = ref(0)
    const onClick = () => {
      count.value++
    }
    const props = ref({
      foo: "foo",
      bar: "bar"
    })
    const onChangePropsDemo1 = () => {
      props.value.foo = "new-foo"
    }
    const onChangePropsDemo2 = () => {
      props.value.foo = undefined
    }
    const onChangePropsDemo3 = () => {
      props.value = {
        foo: "foo"
      }
    }
    return {
      count,
      onClick,
      props,
      onChangePropsDemo1,
      onChangePropsDemo2,
      onChangePropsDemo3
    }
  },
  render () {
    // this.count是个对象，我们希望直接获取ref.value
    return h(
      "div",
      {
        id: "root",
        ...this.props
      },

      [
        h("div", {}, "count:" + this.count),
        h("button",
          {
            onClick: this.onClick,
          },
          "click"
        ),
        h("button",
          {
            onClick: this.onChangePropsDemo1,
          },
          "props值被修改了"
        ),
        h("button",
          {
            onClick: this.onChangePropsDemo2,
          },
          "props值变成了undefined"
        ),
        h("button",
          {
            onClick: this.onChangePropsDemo3,
          },
          "props中bar的值没了"
        )
      ]
    )
  }
}